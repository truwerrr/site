import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const list = await prisma.bankAccount.findMany({
    where: { userId: session.user.id },
    select: { id: true, bankName: true, accountNumberMasked: true, verified: true, createdAt: true },
  });
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { bankName: string; accountNumber: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const bankName = String(body.bankName || "").trim();
  const accountNumber = String(body.accountNumber || "").replace(/\s/g, "");
  if (!bankName || accountNumber.length < 4) return NextResponse.json({ error: "Укажите банк и номер счёта" }, { status: 400 });

  const masked = accountNumber.length > 4 ? "****" + accountNumber.slice(-4) : "****";
  await prisma.bankAccount.create({
    data: { userId: session.user.id, bankName, accountNumberMasked: masked, verified: false },
  });
  return NextResponse.json({ ok: true });
}
