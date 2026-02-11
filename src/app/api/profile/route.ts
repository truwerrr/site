import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

const DEFAULT_SETTINGS = {
  language: "ru",
  displayCurrency: "USDT",
  timezone: "Asia/Almaty",
  notifyEmail: true,
  notifyOrders: true,
  notifyWithdrawals: true,
  notifySecurity: true,
  notifyMarketing: false,
};

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, phone: true, twoFactorSecret: true, settings: true },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let settings = DEFAULT_SETTINGS;
  if (user.settings) {
    try {
      settings = { ...settings, ...JSON.parse(user.settings) };
    } catch {}
  }

  return NextResponse.json({
    email: user.email,
    phone: user.phone ?? "",
    twoFactorEnabled: !!user.twoFactorSecret,
    settings,
  });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { email?: string; phone?: string; settings?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const update: { email?: string; phone?: string | null; settings?: string } = {};
  if (typeof body.email === "string" && body.email.includes("@")) update.email = body.email;
  if (body.phone !== undefined) update.phone = body.phone === "" ? null : String(body.phone);
  if (body.settings && typeof body.settings === "object") {
    const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { settings: true } });
    let current: Record<string, unknown> = {};
    if (user?.settings) try { current = JSON.parse(user.settings); } catch {}
    update.settings = JSON.stringify({ ...current, ...body.settings });
  }

  if (Object.keys(update).length === 0) return NextResponse.json({ ok: true });

  if (update.email) {
    const exists = await prisma.user.findUnique({ where: { email: update.email } });
    if (exists && exists.id !== session.user.id) return NextResponse.json({ error: "Email already used" }, { status: 400 });
  }

  await prisma.user.update({ where: { id: session.user.id }, data: update });
  return NextResponse.json({ ok: true });
}
