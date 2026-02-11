import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { Decimal } from "decimal.js";

const MIN_WITHDRAW: Record<string, string> = {
  USDT: "10",
  BTC: "0.0001",
  ETH: "0.001",
  KZT: "1000",
};

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { currency, amount, address } = await request.json();

    if (!currency || !amount || !address || !address.trim()) {
      return NextResponse.json({ error: "Укажите валюту, сумму и адрес" }, { status: 400 });
    }

    const amountDec = new Decimal(amount);
    if (amountDec.lte(0)) {
      return NextResponse.json({ error: "Сумма должна быть больше 0" }, { status: 400 });
    }

    const minStr = MIN_WITHDRAW[currency];
    if (minStr && amountDec.lt(minStr)) {
      return NextResponse.json({ error: `Минимальная сумма вывода ${currency}: ${minStr}` }, { status: 400 });
    }

    const balance = await prisma.balance.findFirst({
      where: { userId: session.user.id, currency },
    });

    if (!balance) {
      return NextResponse.json({ error: `Нет баланса ${currency}` }, { status: 400 });
    }

    const available = new Decimal(balance.available);
    if (available.lt(amountDec)) {
      return NextResponse.json({ error: "Недостаточно средств" }, { status: 400 });
    }

    await prisma.balance.updateMany({
      where: { userId: session.user.id, currency },
      data: {
        available: available.minus(amountDec).toString(),
      },
    });

    await prisma.walletTransaction.create({
      data: {
        userId: session.user.id,
        type: "withdraw",
        currency,
        amount: amountDec.toString(),
        meta: JSON.stringify({ address: address.trim() }),
      },
    });

    return NextResponse.json({
      success: true,
      currency,
      amount: amountDec.toString(),
      address: address.trim(),
    });
  } catch (error) {
    console.error("Withdraw error:", error);
    return NextResponse.json({ error: "Ошибка вывода" }, { status: 500 });
  }
}
