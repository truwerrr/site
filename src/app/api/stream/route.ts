import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const pair = searchParams.get("pair");

  if (!pair) {
    return NextResponse.json({ error: "Pair required" }, { status: 400 });
  }

  const [base, quote] = pair.split("/");
  if (!base || !quote) {
    return NextResponse.json({ error: "Invalid pair format" }, { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let lastTradeId: string | null = null;
      let lastOrderbookUpdate = 0;

      const sendUpdate = async () => {
        try {
          // Получаем актуальную цену рынка
          const market = await prisma.market.findFirst({
            where: { base, quote },
          });

          if (market) {
            const tickData = JSON.stringify({
              type: "tick",
              pair,
              price: market.last,
              high24h: market.high24h,
              low24h: market.low24h,
              volume24h: market.volumeQuote24h,
              timestamp: Date.now(),
            });
            controller.enqueue(encoder.encode(`data: ${tickData}\n\n`));

            // Каждые 15 секунд отправляем orderbook
            const now = Date.now();
            if (now - lastOrderbookUpdate > 15000) {
              const orders = await prisma.order.findMany({
                where: {
                  pair,
                  status: "open",
                  type: "limit",
                },
                orderBy: [
                  { price: "asc" },
                  { createdAt: "asc" },
                ],
                take: 50,
              });

              const bids: any[] = [];
              const asks: any[] = [];

              orders.forEach((order) => {
                const entry = {
                  price: order.price!,
                  amount: order.remaining,
                };

                if (order.side === "buy") {
                  bids.push(entry);
                } else {
                  asks.push(entry);
                }
              });

              // Группируем по цене
              const groupedBids = bids.reduce((acc, bid) => {
                const price = bid.price;
                if (!acc[price]) {
                  acc[price] = { price, amount: "0" };
                }
                acc[price].amount = (parseFloat(acc[price].amount) + parseFloat(bid.amount)).toString();
                return acc;
              }, {} as Record<string, any>);

              const groupedAsks = asks.reduce((acc, ask) => {
                const price = ask.price;
                if (!acc[price]) {
                  acc[price] = { price, amount: "0" };
                }
                acc[price].amount = (parseFloat(acc[price].amount) + parseFloat(ask.amount)).toString();
                return acc;
              }, {} as Record<string, any>);

              const orderbookData = JSON.stringify({
                type: "orderbook",
                pair,
                bids: Object.values(groupedBids).sort((a: any, b: any) => parseFloat(b.price) - parseFloat(a.price)).slice(0, 20),
                asks: Object.values(groupedAsks).sort((a: any, b: any) => parseFloat(a.price) - parseFloat(b.price)).slice(0, 20),
                timestamp: Date.now(),
              });
              controller.enqueue(encoder.encode(`data: ${orderbookData}\n\n`));
              lastOrderbookUpdate = now;
            }

            // Отправляем новые сделки
            const recentTrades = await prisma.trade.findMany({
              where: {
                pair,
                ...(lastTradeId && { id: { gt: lastTradeId } }),
              },
              orderBy: { timestamp: "desc" },
              take: 10,
            });

            if (recentTrades.length > 0) {
              lastTradeId = recentTrades[0].id;
              const tradesData = JSON.stringify({
                type: "trades",
                pair,
                trades: recentTrades.map((t) => ({
                  price: t.price,
                  amount: t.amount,
                  side: t.buyOrderId ? "buy" : "sell",
                  timestamp: t.timestamp.getTime(),
                })),
                timestamp: Date.now(),
              });
              controller.enqueue(encoder.encode(`data: ${tradesData}\n\n`));
            }
          }
        } catch (error) {
          console.error("Stream error:", error);
        }
      };

      await sendUpdate();
      const interval = setInterval(sendUpdate, 5000);

      if (request.signal) {
        request.signal.addEventListener("abort", () => {
          clearInterval(interval);
          controller.close();
        });
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
