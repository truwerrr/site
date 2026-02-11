import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { code: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { pending2FASecret: true } });
  if (!user?.pending2FASecret) return NextResponse.json({ error: "Run 2FA setup first" }, { status: 400 });

  const auth = await import("authenticator");
  const valid = auth.verifyToken(user.pending2FASecret, body.code?.replace(/\s/g, ""));
  if (!valid) return NextResponse.json({ error: "Неверный код" }, { status: 400 });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { twoFactorSecret: user.pending2FASecret, pending2FASecret: null },
  });
  return NextResponse.json({ ok: true });
}
