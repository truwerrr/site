import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { FAKE_BOT_IDS, getFakeAdById } from "@/lib/p2p-fake-bots";
import { getOrCreateP2PBotUserId, getOrCreateDemoPlaceholderAdId } from "@/lib/p2p-bot-user";
import { Decimal } from "decimal.js";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const deals = await prisma.p2PDeal.findMany({
      where: {
        OR: [{ buyerId: session.user.id }, { sellerId: session.user.id }],
      },
      include: {
        ad: true,
        buyer: { select: { email: true } },
        seller: { select: { email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(deals);
  } catch (error) {
    console.error("Error fetching P2P deals:", error);
    return NextResponse.json({ error: "Failed to fetch deals" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { adId, amount, selectedPaymentMethod } = await request.json();

    if (!adId || amount == null || amount === "") {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const amountDec = new Decimal(String(amount));
    if (amountDec.lte(0) || !amountDec.isFinite()) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const isBotAd = FAKE_BOT_IDS.has(adId);
    let ad: { side: string; currency: string; priceKZT: string; available: string; limitMin: string; limitMax: string; paymentMethods: string; userId: string; isActive: boolean } | null;
    let botUserId: string | null = null;

    if (isBotAd) {
      const fakeAd = getFakeAdById(adId);
      if (!fakeAd) {
        return NextResponse.json({ error: "Ad not found or inactive" }, { status: 400 });
      }
      ad = { ...fakeAd, userId: "bot" };
      botUserId = await getOrCreateP2PBotUserId();
      if (!botUserId) {
        return NextResponse.json({ error: "Сервис временно недоступен" }, { status: 503 });
      }
    } else {
      const dbAd = await prisma.p2PAd.findUnique({
        where: { id: adId },
        include: { user: true },
      });
      if (!dbAd || !dbAd.isActive) {
        return NextResponse.json({ error: "Ad not found or inactive" }, { status: 400 });
      }
      if (dbAd.userId === session.user.id) {
        return NextResponse.json({ error: "Cannot create deal with own ad" }, { status: 400 });
      }
      ad = dbAd;
    }

    const availableDec = new Decimal(ad.available);
    const priceKZTDec = new Decimal(ad.priceKZT);
    const limitMinKZT = new Decimal(ad.limitMin);
    const limitMaxKZT = new Decimal(ad.limitMax);
    const minAmountDec = limitMinKZT.dividedBy(priceKZTDec);
    const maxAmountDec = Decimal.min(availableDec, limitMaxKZT.dividedBy(priceKZTDec));

    if (amountDec.lte(0) || amountDec.gt(availableDec) || amountDec.lt(minAmountDec) || amountDec.gt(maxAmountDec)) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const methodsList = (() => {
      try {
        return JSON.parse(typeof ad.paymentMethods === "string" ? ad.paymentMethods : "[]") as string[];
      } catch {
        return [];
      }
    })();
    const paymentMethod = typeof selectedPaymentMethod === "string" && selectedPaymentMethod.trim()
      ? (methodsList.includes(selectedPaymentMethod.trim()) ? selectedPaymentMethod.trim() : methodsList[0] ?? null)
      : methodsList[0] ?? null;

    const escrowAmount = amountDec.times(priceKZTDec);
    const adOwnerId = isBotAd ? botUserId! : (ad as { userId: string }).userId;
    const buyerId = ad.side === "buy" ? adOwnerId : session.user.id;
    const sellerId = ad.side === "sell" ? adOwnerId : session.user.id;

    const deadlineMinutes = Math.min(1440, Math.max(1, parseInt(process.env.P2P_DEADLINE_MINUTES || "15", 10) || 15));
    const deadlineAt = new Date(Date.now() + deadlineMinutes * 60 * 1000);

    if (isBotAd) {
      if (ad.side === "buy") {
        const balance = await prisma.balance.findFirst({
          where: { userId: session.user.id, currency: ad.currency },
        });
        if (!balance) {
          return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
        }
        const available = new Decimal(balance.available);
        if (available.lt(amountDec)) {
          return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
        }
        await prisma.balance.update({
          where: { id: balance.id },
          data: {
            available: available.minus(amountDec).toString(),
            locked: new Decimal(balance.locked).plus(amountDec).toString(),
          },
        });
      }
      const placeholderAdId = await getOrCreateDemoPlaceholderAdId(botUserId!);
      const createData = {
        adId: placeholderAdId,
        demoAdId: adId,
        buyerId,
        sellerId,
        currency: ad.currency,
        priceKZT: ad.priceKZT,
        amount: amountDec.toString(),
        status: "pending",
        escrowAmount: escrowAmount.toString(),
        deadlineAt,
        ...(paymentMethod && { selectedPaymentMethod: paymentMethod }),
      };
      const deal = await prisma.p2PDeal.create({
        data: createData as Parameters<typeof prisma.p2PDeal.create>[0]["data"],
      });
      await prisma.notification.create({
        data: {
          userId: deal.sellerId,
          type: "p2p_deal_status",
          payload: JSON.stringify({
            dealId: deal.id,
            status: "pending",
            title: "Новая P2P-сделка",
            message: `Создана новая сделка #${deal.id.slice(0, 8)}.`,
          }),
        },
      }).catch(() => {});
      return NextResponse.json(deal);
    }

    const deal = await prisma.$transaction(async (tx) => {
      if (ad!.side === "sell") {
        const balance = await tx.balance.findFirst({
          where: { userId: ad!.userId, currency: ad!.currency },
        });
        if (!balance) throw new Error("Insufficient balance");
        const available = new Decimal(balance.available);
        if (available.lt(amountDec)) throw new Error("Insufficient balance");
        await tx.balance.updateMany({
          where: { userId: ad!.userId, currency: ad!.currency },
          data: {
            available: available.minus(amountDec).toString(),
            locked: new Decimal(balance.locked).plus(amountDec).toString(),
          },
        });
      } else {
        const balance = await tx.balance.findFirst({
          where: { userId: session.user.id, currency: ad!.currency },
        });
        if (!balance) throw new Error("Insufficient balance");
        const available = new Decimal(balance.available);
        if (available.lt(amountDec)) throw new Error("Insufficient balance");
        await tx.balance.updateMany({
          where: { userId: session.user.id, currency: ad!.currency },
          data: {
            available: available.minus(amountDec).toString(),
            locked: new Decimal(balance.locked).plus(amountDec).toString(),
          },
        });
      }

      const currentAd = await tx.p2PAd.findUnique({ where: { id: adId } });
      if (!currentAd) throw new Error("Ad not found");
      const currAvailable = new Decimal(currentAd.available);
      if (amountDec.gt(currAvailable)) throw new Error("Invalid amount");

      const created = await tx.p2PDeal.create({
        data: {
          adId,
          buyerId,
          sellerId,
          currency: ad!.currency,
          priceKZT: ad!.priceKZT,
          amount: amountDec.toString(),
          status: "pending",
          escrowAmount: escrowAmount.toString(),
          deadlineAt,
          ...(paymentMethod && { selectedPaymentMethod: paymentMethod }),
        },
      });

      await tx.p2PAd.update({
        where: { id: adId },
        data: { available: currAvailable.minus(amountDec).toString() },
      });

      return created;
    });

    await prisma.notification.create({
      data: {
        userId: deal.sellerId,
        type: "p2p_deal_status",
        payload: JSON.stringify({
          dealId: deal.id,
          status: "pending",
          title: "Новая P2P-сделка",
          message: `Создана новая сделка #${deal.id.slice(0, 8)}.`,
        }),
      },
    }).catch(() => {});

    return NextResponse.json(deal);
  } catch (error) {
    const msg = (error as Error)?.message ?? "";
    if (msg === "Insufficient balance" || msg === "Invalid amount" || msg === "Ad not found") {
      return NextResponse.json({ error: msg === "Ad not found" ? "Ad not found or inactive" : msg }, { status: 400 });
    }
    console.error("Error creating P2P deal:", error);
    const isDev = process.env.NODE_ENV === "development";
    const hint = isDev && msg ? msg : "Failed to create deal";
    return NextResponse.json({ error: hint }, { status: 500 });
  }
}
