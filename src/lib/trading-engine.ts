import { prisma } from "./prisma";
import { Decimal } from "decimal.js";

const FEE_RATE_MAKER = new Decimal("0.001");
const FEE_RATE_TAKER = new Decimal("0.002");

export type OrderType = "limit" | "market" | "stop" | "stop-limit";
export type OrderSide = "buy" | "sell";
export type OrderStatus = "open" | "partial" | "filled" | "cancelled";

interface PlaceOrderParams {
  userId: string;
  pair: string;
  side: OrderSide;
  type: OrderType;
  amount: string;
  price?: string;
  stopPrice?: string;
}

export async function placeOrder(params: PlaceOrderParams) {
  const { userId, pair, side, type, amount, price, stopPrice } = params;

  if (type === "limit" && !price) {
    throw new Error("Price required for limit orders");
  }
  if ((type === "stop" || type === "stop-limit") && !stopPrice) {
    throw new Error("Stop price required for stop orders");
  }

  const amountDec = new Decimal(amount);
  if (amountDec.lte(0)) {
    throw new Error("Amount must be greater than 0");
  }

  const [base, quote] = pair.split("/");
  if (!base || !quote) {
    throw new Error("Invalid pair format");
  }

  const market = await prisma.market.findFirst({
    where: { base, quote },
  });

  if (!market) {
    throw new Error("Market not found");
  }

  if (type === "limit" || type === "stop-limit") {
    const priceDec = new Decimal(price!);
    const total = amountDec.times(priceDec);

    if (side === "buy") {
      const balance = await prisma.balance.findFirst({
        where: { userId, currency: quote },
      });

      if (!balance) {
        throw new Error(`Insufficient ${quote} balance`);
      }

      const available = new Decimal(balance.available);
      if (available.lt(total)) {
        throw new Error(`Insufficient ${quote} balance`);
      }

      await prisma.balance.updateMany({
        where: { userId, currency: quote },
        data: {
          available: available.minus(total).toString(),
          locked: new Decimal(balance.locked).plus(total).toString(),
        },
      });
    } else {
      const balance = await prisma.balance.findFirst({
        where: { userId, currency: base },
      });

      if (!balance) {
        throw new Error(`Insufficient ${base} balance`);
      }

      const available = new Decimal(balance.available);
      if (available.lt(amountDec)) {
        throw new Error(`Insufficient ${base} balance`);
      }

      await prisma.balance.updateMany({
        where: { userId, currency: base },
        data: {
          available: available.minus(amountDec).toString(),
          locked: new Decimal(balance.locked).plus(amountDec).toString(),
        },
      });
    }
  }

  const order = await prisma.order.create({
    data: {
      userId,
      pair,
      side,
      type,
      amount: amountDec.toString(),
      remaining: amountDec.toString(),
      price: price || null,
      stopPrice: stopPrice || null,
      status: "open",
    },
  });

  if (type === "market") {
    await matchMarketOrder(order.id);
  } else if (type === "stop" || type === "stop-limit") {
    await checkStopOrders(pair);
  } else {
    await matchLimitOrder(order.id);
  }

  return order;
}

async function matchLimitOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order || order.status !== "open") {
    return;
  }

  const oppositeSide = order.side === "buy" ? "sell" : "buy";
  const orders = await prisma.order.findMany({
    where: {
      pair: order.pair,
      side: oppositeSide,
      status: "open",
      ...(order.side === "buy"
        ? { price: { lte: order.price! } }
        : { price: { gte: order.price! } }),
    },
    orderBy: [
      { price: order.side === "buy" ? "asc" : "desc" },
      { createdAt: "asc" },
    ],
  });

  let remaining = new Decimal(order.remaining);
  const orderPrice = new Decimal(order.price!);

  for (const oppositeOrder of orders) {
    if (remaining.lte(0)) break;

    const oppositePrice = new Decimal(oppositeOrder.price!);
    const oppositeRemaining = new Decimal(oppositeOrder.remaining);
    const matchAmount = Decimal.min(remaining, oppositeRemaining);
    const matchPrice = oppositePrice;

    await executeTrade({
      buyOrderId: order.side === "buy" ? order.id : oppositeOrder.id,
      sellOrderId: order.side === "sell" ? order.id : oppositeOrder.id,
      pair: order.pair,
      price: matchPrice.toString(),
      amount: matchAmount.toString(),
    });

    remaining = remaining.minus(matchAmount);
  }

  if (remaining.lt(new Decimal(order.remaining))) {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        remaining: remaining.toString(),
        status: remaining.gt(0) ? "partial" : "filled",
      },
    });
  }
}

async function matchMarketOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order || order.status !== "open") {
    return;
  }

  const oppositeSide = order.side === "buy" ? "sell" : "buy";
  const orders = await prisma.order.findMany({
    where: {
      pair: order.pair,
      side: oppositeSide,
      status: "open",
      type: "limit",
    },
    orderBy: [
      { price: order.side === "buy" ? "asc" : "desc" },
      { createdAt: "asc" },
    ],
  });

  let remaining = new Decimal(order.remaining);

  for (const oppositeOrder of orders) {
    if (remaining.lte(0)) break;

    const oppositePrice = new Decimal(oppositeOrder.price!);
    const oppositeRemaining = new Decimal(oppositeOrder.remaining);
    const matchAmount = Decimal.min(remaining, oppositeRemaining);

    await executeTrade({
      buyOrderId: order.side === "buy" ? order.id : oppositeOrder.id,
      sellOrderId: order.side === "sell" ? order.id : oppositeOrder.id,
      pair: order.pair,
      price: oppositePrice.toString(),
      amount: matchAmount.toString(),
    });

    remaining = remaining.minus(matchAmount);
  }

  await prisma.order.update({
    where: { id: orderId },
    data: {
      remaining: remaining.toString(),
      status: remaining.gt(0) ? "partial" : "filled",
    },
  });
}

async function executeTrade(params: {
  buyOrderId: string;
  sellOrderId: string;
  pair: string;
  price: string;
  amount: string;
}) {
  const { buyOrderId, sellOrderId, pair, price, amount } = params;

  const [base, quote] = pair.split("/");
  const priceDec = new Decimal(price);
  const amountDec = new Decimal(amount);
  const total = priceDec.times(amountDec);

  const buyOrder = await prisma.order.findUnique({ where: { id: buyOrderId } });
  const sellOrder = await prisma.order.findUnique({ where: { id: sellOrderId } });

  if (!buyOrder || !sellOrder) return;

  const makerOrderId = buyOrder.createdAt < sellOrder.createdAt ? buyOrderId : sellOrderId;
  const takerOrderId = buyOrder.createdAt < sellOrder.createdAt ? sellOrderId : buyOrderId;
  const buyIsMaker = buyOrderId === makerOrderId;
  const buyFeeRate = buyIsMaker ? FEE_RATE_MAKER : FEE_RATE_TAKER;
  const sellFeeRate = buyIsMaker ? FEE_RATE_TAKER : FEE_RATE_MAKER;

  const feeBuyQuote = total.times(buyFeeRate);
  const feeSellQuote = total.times(sellFeeRate);
  const buyReceivesBase = amountDec.times(new Decimal(1).minus(buyFeeRate));
  const sellReceivesQuote = total.minus(feeSellQuote);

  const trade = await prisma.trade.create({
    data: {
      pair,
      price: priceDec.toString(),
      amount: amountDec.toString(),
      buyOrderId,
      sellOrderId,
      makerOrderId,
      takerOrderId,
    },
  });

  await prisma.fill.createMany({
    data: [
      {
        orderId: buyOrderId,
        userId: buyOrder.userId,
        tradeId: trade.id,
        amount: amountDec.toString(),
        price: priceDec.toString(),
        fee: feeBuyQuote.toString(),
        side: "buy",
      },
      {
        orderId: sellOrderId,
        userId: sellOrder.userId,
        tradeId: trade.id,
        amount: amountDec.toString(),
        price: priceDec.toString(),
        fee: feeSellQuote.toString(),
        side: "sell",
      },
    ],
  });

  const buyBalance = await prisma.balance.findUnique({
    where: { userId_currency: { userId: buyOrder.userId, currency: base } },
  });
  const sellBalance = await prisma.balance.findUnique({
    where: { userId_currency: { userId: sellOrder.userId, currency: quote } },
  });

  if (buyBalance) {
    await prisma.balance.updateMany({
      where: { userId: buyOrder.userId, currency: base },
      data: {
        available: new Decimal(buyBalance.available).plus(buyReceivesBase).toString(),
        locked: new Decimal(buyBalance.locked).minus(amountDec).toString(),
      },
    });
  } else {
    await prisma.balance.create({
      data: {
        userId: buyOrder.userId,
        currency: base,
        available: buyReceivesBase.toString(),
        locked: "0",
      },
    });
  }

  if (sellBalance) {
    await prisma.balance.updateMany({
      where: { userId: sellOrder.userId, currency: quote },
      data: {
        available: new Decimal(sellBalance.available).plus(sellReceivesQuote).toString(),
        locked: new Decimal(sellBalance.locked).minus(total).toString(),
      },
    });
  } else {
    await prisma.balance.create({
      data: {
        userId: sellOrder.userId,
        currency: quote,
        available: sellReceivesQuote.toString(),
        locked: "0",
      },
    });
  }

  await updateMarketStats(pair, priceDec.toString(), amountDec.toString());

  const buyRemaining = new Decimal(buyOrder.remaining).minus(amountDec);
  const sellRemaining = new Decimal(sellOrder.remaining).minus(amountDec);

  if (buyRemaining.lte(0)) {
    await prisma.order.update({
      where: { id: buyOrderId },
      data: { remaining: "0", status: "filled" },
    });
  } else {
    await prisma.order.update({
      where: { id: buyOrderId },
      data: { remaining: buyRemaining.toString(), status: "partial" },
    });
  }

  if (sellRemaining.lte(0)) {
    await prisma.order.update({
      where: { id: sellOrderId },
      data: { remaining: "0", status: "filled" },
    });
  } else {
    await prisma.order.update({
      where: { id: sellOrderId },
      data: { remaining: sellRemaining.toString(), status: "partial" },
    });
  }
}

async function updateMarketStats(pair: string, price: string, volume: string) {
  const market = await prisma.market.findFirst({
    where: { base: pair.split("/")[0], quote: pair.split("/")[1] },
  });

  if (!market) return;

  const priceDec = new Decimal(price);
  const volumeDec = new Decimal(volume);
  const lastDec = new Decimal(market.last || "0");
  const high24h = new Decimal(market.high24h || "0");
  const low24h = new Decimal(market.low24h || "0");
  const volumeBase24h = new Decimal(market.volumeBase24h || "0").plus(volumeDec);
  const volumeQuote24h = new Decimal(market.volumeQuote24h || "0").plus(priceDec.times(volumeDec));

  await prisma.market.updateMany({
    where: { base: pair.split("/")[0], quote: pair.split("/")[1] },
    data: {
      last: priceDec.toString(),
      high24h: Decimal.max(high24h, priceDec).toString(),
      low24h: low24h.eq(0) ? priceDec.toString() : Decimal.min(low24h, priceDec).toString(),
      volumeBase24h: volumeBase24h.toString(),
      volumeQuote24h: volumeQuote24h.toString(),
    },
  });
}

async function checkStopOrders(pair: string) {
  const market = await prisma.market.findFirst({
    where: { base: pair.split("/")[0], quote: pair.split("/")[1] },
  });

  if (!market) return;

  const lastPrice = new Decimal(market.last);

  const stopOrders = await prisma.order.findMany({
    where: {
      pair,
      type: { in: ["stop", "stop-limit"] },
      status: "open",
    },
  });

  for (const order of stopOrders) {
    const stopPrice = new Decimal(order.stopPrice!);
    const shouldTrigger =
      (order.side === "buy" && lastPrice.gte(stopPrice)) ||
      (order.side === "sell" && lastPrice.lte(stopPrice));

    if (shouldTrigger) {
      if (order.type === "stop") {
        await prisma.order.update({
          where: { id: order.id },
          data: { type: "market" },
        });
        await matchMarketOrder(order.id);
      } else {
        await prisma.order.update({
          where: { id: order.id },
          data: { type: "limit" },
        });
        await matchLimitOrder(order.id);
      }
    }
  }
}

export async function cancelOrder(orderId: string, userId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order || order.userId !== userId) {
    throw new Error("Order not found or unauthorized");
  }

  if (order.status !== "open" && order.status !== "partial") {
    throw new Error("Order cannot be cancelled");
  }

  const [base, quote] = order.pair.split("/");
  const remaining = new Decimal(order.remaining);

  if (order.side === "buy") {
    const total = remaining.times(new Decimal(order.price || "0"));
    const balance = await prisma.balance.findFirst({
      where: { userId, currency: quote },
    });

    if (balance) {
      await prisma.balance.updateMany({
        where: { userId, currency: quote },
        data: {
          available: new Decimal(balance.available).plus(total).toString(),
          locked: new Decimal(balance.locked).minus(total).toString(),
        },
      });
    }
  } else {
    const balance = await prisma.balance.findFirst({
      where: { userId, currency: base },
    });

    if (balance) {
      await prisma.balance.updateMany({
        where: { userId, currency: base },
        data: {
          available: new Decimal(balance.available).plus(remaining).toString(),
          locked: new Decimal(balance.locked).minus(remaining).toString(),
        },
      });
    }
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "cancelled" },
  });
}
