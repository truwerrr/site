import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [balances, orders, fills] = await Promise.all([
      prisma.balance.findMany({
        where: { userId: session.user.id },
      }),
      prisma.order.findMany({
        where: { userId: session.user.id },
      }),
      prisma.fill.findMany({
        where: { userId: session.user.id },
        include: { order: true },
      }),
    ]);

    const totalBalance = balances.reduce((sum, b) => {
      const price = b.currency === "USDT" ? 1 : b.currency === "BTC" ? 70184 : b.currency === "ETH" ? 2153.43 : 0.002;
      return sum + (parseFloat(b.available) + parseFloat(b.locked)) * price;
    }, 0);

    const totalVolume = fills.reduce((sum, f) => {
      return sum + parseFloat(f.amount) * parseFloat(f.price);
    }, 0);

    const buyFills = fills.filter((f) => f.side === "buy");
    const sellFills = fills.filter((f) => f.side === "sell");

    const buyTotal = buyFills.reduce((sum, f) => sum + parseFloat(f.amount) * parseFloat(f.price), 0);
    const sellTotal = sellFills.reduce((sum, f) => sum + parseFloat(f.amount) * parseFloat(f.price), 0);

    const profitLoss = sellTotal - buyTotal;

    const activeOrders = orders.filter((o) => o.status === "open" || o.status === "partial").length;
    const filledOrders = orders.filter((o) => o.status === "filled").length;

    const volume24h = fills
      .filter((f) => {
        const fillDate = new Date(f.timestamp);
        const now = new Date();
        return now.getTime() - fillDate.getTime() < 24 * 60 * 60 * 1000;
      })
      .reduce((sum, f) => sum + parseFloat(f.amount) * parseFloat(f.price), 0);

    const volume7d = fills
      .filter((f) => {
        const fillDate = new Date(f.timestamp);
        const now = new Date();
        return now.getTime() - fillDate.getTime() < 7 * 24 * 60 * 60 * 1000;
      })
      .reduce((sum, f) => sum + parseFloat(f.amount) * parseFloat(f.price), 0);

    return NextResponse.json({
      totalBalance,
      totalVolume,
      volume24h,
      volume7d,
      profitLoss,
      activeOrders,
      filledOrders,
      totalTrades: fills.length,
      totalOrders: orders.length,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
