import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { Decimal } from "decimal.js";

function parseDecimal(v: unknown): Decimal | null {
  if (v == null || v === "") return null;
  const n = new Decimal(String(v));
  return n.isFinite() ? n : null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { id } = await params;
    const balances = await prisma.balance.findMany({
      where: { userId: id },
    });
    return NextResponse.json(balances);
  } catch (error) {
    console.error("Error fetching balances:", error);
    return NextResponse.json({ error: "Failed to fetch balances" }, { status: 500 });
  }
}

/** Изменить баланс: { currency, setAvailable?, setLocked? } или { currency, addAvailable?, addLocked? } */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: userId } = await params;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await request.json();
    const { currency, setAvailable, setLocked, addAvailable, addLocked } = body;

    if (!currency || typeof currency !== "string" || !currency.trim()) {
      return NextResponse.json({ error: "currency required" }, { status: 400 });
    }

    const cur = currency.trim().toUpperCase();
    let balance = await prisma.balance.findUnique({
      where: { userId_currency: { userId, currency: cur } },
    });

    if (setAvailable !== undefined || setLocked !== undefined) {
      const available = parseDecimal(setAvailable);
      const locked = parseDecimal(setLocked);
      if (available !== null && available.lt(0)) return NextResponse.json({ error: "available cannot be negative" }, { status: 400 });
      if (locked !== null && locked.lt(0)) return NextResponse.json({ error: "locked cannot be negative" }, { status: 400 });

      if (!balance) {
        balance = await prisma.balance.create({
          data: {
            userId,
            currency: cur,
            available: available?.toString() ?? "0",
            locked: locked?.toString() ?? "0",
          },
        });
      } else {
        balance = await prisma.balance.update({
          where: { id: balance.id },
          data: {
            ...(available !== null && { available: available.toString() }),
            ...(locked !== null && { locked: locked.toString() }),
          },
        });
      }
    } else if (addAvailable !== undefined || addLocked !== undefined) {
      const addAv = parseDecimal(addAvailable) ?? new Decimal(0);
      const addLk = parseDecimal(addLocked) ?? new Decimal(0);

      if (!balance) {
        const newAv = Decimal.max(0, addAv);
        const newLk = Decimal.max(0, addLk);
        balance = await prisma.balance.create({
          data: {
            userId,
            currency: cur,
            available: newAv.toString(),
            locked: newLk.toString(),
          },
        });
      } else {
        const newAvailable = Decimal.max(0, new Decimal(balance.available).plus(addAv));
        const newLocked = Decimal.max(0, new Decimal(balance.locked).plus(addLk));
        balance = await prisma.balance.update({
          where: { id: balance.id },
          data: {
            available: newAvailable.toString(),
            locked: newLocked.toString(),
          },
        });
      }
    } else {
      return NextResponse.json({ error: "Use setAvailable/setLocked or addAvailable/addLocked" }, { status: 400 });
    }

    return NextResponse.json(balance);
  } catch (error) {
    console.error("Error updating balance:", error);
    return NextResponse.json({ error: "Failed to update balance" }, { status: 500 });
  }
}
