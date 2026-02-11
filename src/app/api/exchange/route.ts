import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { Decimal } from "decimal.js";
import { getRates, getRateFromRates } from "@/lib/fetch-rates";

const FEE_PERCENT = 0.1;

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { from, to, amount } = await request.json();
    if (!from || !to || !amount) {
      return NextResponse.json({ error: "Укажите валюту и сумму" }, { status: 400 });
    }
    if (from === to) {
      return NextResponse.json({ error: "Выберите разные валюты" }, { status: 400 });
    }

    const amountDec = new Decimal(amount);
    if (amountDec.lte(0)) {
      return NextResponse.json({ error: "Сумма должна быть больше 0" }, { status: 400 });
    }

    const rates = await getRates();
    const rate = getRateFromRates(rates, from, to);
    if (!rate || rate <= 0) {
      return NextResponse.json({ error: "Пара обмена недоступна" }, { status: 400 });
    }

    let toAmount: Decimal;
    if (from === "KZT") {
      toAmount = amountDec.dividedBy(rate);
    } else if (to === "KZT") {
      toAmount = amountDec.times(rate);
    } else {
      toAmount = amountDec.times(rate);
    }

    const fee = toAmount.times(FEE_PERCENT / 100);
    const toAmountAfterFee = toAmount.minus(fee);

    const userId = session.user.id;

    const fromBalance = await prisma.balance.findFirst({
      where: { userId, currency: from },
    });

    if (!fromBalance) {
      return NextResponse.json({ error: `Нет баланса ${from}` }, { status: 400 });
    }

    const available = new Decimal(fromBalance.available);
    if (available.lt(amountDec)) {
      return NextResponse.json({ error: `Недостаточно средств (${from})` }, { status: 400 });
    }

    await prisma.balance.updateMany({
      where: { userId, currency: from },
      data: {
        available: available.minus(amountDec).toString(),
      },
    });

    const toBalance = await prisma.balance.findFirst({
      where: { userId, currency: to },
    });

    if (toBalance) {
      await prisma.balance.updateMany({
        where: { userId, currency: to },
        data: {
          available: new Decimal(toBalance.available).plus(toAmountAfterFee).toString(),
        },
      });
    } else {
      await prisma.balance.create({
        data: {
          userId,
          currency: to,
          available: toAmountAfterFee.toString(),
          locked: "0",
        },
      });
    }

    await prisma.walletTransaction.create({
      data: {
        userId,
        type: "exchange",
        currency: from,
        amount: amountDec.toString(),
        meta: JSON.stringify({ from, to, toAmount: toAmountAfterFee.toString() }),
      },
    });

    return NextResponse.json({
      success: true,
      from,
      to,
      fromAmount: amountDec.toString(),
      toAmount: toAmountAfterFee.toString(),
      fee: fee.toString(),
      rate,
    });
  } catch (error) {
    console.error("Exchange error:", error);
    return NextResponse.json({ error: "Ошибка обмена" }, { status: 500 });
  }
}
