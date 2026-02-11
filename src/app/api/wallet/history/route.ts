import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const limit = Math.min(parseInt(new URL(request.url).searchParams.get("limit") || "100"), 200);

    const [fills, walletTxs] = await Promise.all([
      prisma.fill.findMany({
        where: { userId },
        include: { order: true },
        orderBy: { timestamp: "desc" },
        take: limit,
      }),
      prisma.walletTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
    ]);

    const fromFill = (f: (typeof fills)[0]) => ({
      id: f.id,
      type: f.side === "buy" ? "trade_buy" : "trade_sell",
      currency: f.order?.pair?.split("/")[0] || "USDT",
      amount: f.amount,
      status: "completed",
      timestamp: f.timestamp,
      description: f.order ? `Торговля ${f.order.pair}` : "Сделка",
    });

    const fromWalletTx = (w: (typeof walletTxs)[0]) => {
      let description = w.type === "exchange" ? "Обмен" : "Вывод";
      try {
        const meta = w.meta ? JSON.parse(w.meta) : {};
        if (w.type === "exchange" && meta.from && meta.to) description = `Обмен ${meta.from} → ${meta.to}`;
        if (w.type === "withdraw" && meta.address) description = `Вывод на ${meta.address.slice(0, 8)}...`;
      } catch (_) {}
      return {
        id: w.id,
        type: w.type === "exchange" ? "exchange" : "withdraw",
        currency: w.currency,
        amount: w.amount,
        status: "completed",
        timestamp: w.createdAt,
        description,
      };
    };

    const combined = [
      ...fills.map(fromFill),
      ...walletTxs.map(fromWalletTx),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, limit);

    return NextResponse.json(combined);
  } catch (error) {
    console.error("Wallet history error:", error);
    return NextResponse.json({ error: "Ошибка загрузки истории" }, { status: 500 });
  }
}
