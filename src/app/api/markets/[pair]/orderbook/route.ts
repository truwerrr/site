import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ pair: string }> }
) {
  try {
    const { pair } = await params;
    const [base, quote] = pair.split("/");

    if (!base || !quote) {
      return NextResponse.json({ error: "Invalid pair" }, { status: 400 });
    }

    const buyOrders = await prisma.order.findMany({
      where: {
        pair,
        side: "buy",
        status: { in: ["open", "partial"] },
        type: "limit",
      },
      orderBy: [{ price: "desc" }, { createdAt: "asc" }],
      take: 50,
    });

    const sellOrders = await prisma.order.findMany({
      where: {
        pair,
        side: "sell",
        status: { in: ["open", "partial"] },
        type: "limit",
      },
      orderBy: [{ price: "asc" }, { createdAt: "asc" }],
      take: 50,
    });

    const bids = buyOrders.map((o) => ({
      price: o.price!,
      amount: o.remaining,
    }));

    const asks = sellOrders.map((o) => ({
      price: o.price!,
      amount: o.remaining,
    }));

    return NextResponse.json({ bids, asks });
  } catch (error) {
    console.error("Error fetching orderbook:", error);
    return NextResponse.json({ error: "Failed to fetch orderbook" }, { status: 500 });
  }
}
