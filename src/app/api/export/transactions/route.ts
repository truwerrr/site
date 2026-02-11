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

    const searchParams = new URL(request.url).searchParams;
    const format = searchParams.get("format") || "csv";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const fills = await prisma.fill.findMany({
      where: {
        userId: session.user.id,
        ...(startDate && endDate && {
          timestamp: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }),
      },
      include: { order: true },
      orderBy: { timestamp: "desc" },
    });

    if (format === "csv") {
      const csv = [
        "Дата,Пара,Тип,Количество,Цена,Сумма,Комиссия",
        ...fills.map((f) => {
          const date = new Date(f.timestamp).toLocaleString("ru-RU");
          const type = f.side === "buy" ? "Покупка" : "Продажа";
          const amount = f.amount;
          const price = f.price;
          const total = (parseFloat(amount) * parseFloat(price)).toFixed(2);
          const fee = f.fee;
          return `${date},${f.order.pair},${type},${amount},${price},${total},${fee}`;
        }),
      ].join("\n");

      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="transactions-${Date.now()}.csv"`,
        },
      });
    }

    return NextResponse.json(fills);
  } catch (error) {
    console.error("Error exporting transactions:", error);
    return NextResponse.json({ error: "Failed to export transactions" }, { status: 500 });
  }
}
