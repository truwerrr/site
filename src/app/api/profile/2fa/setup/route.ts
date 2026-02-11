import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { twoFactorSecret: true, email: true } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (user.twoFactorSecret) return NextResponse.json({ error: "2FA already enabled" }, { status: 400 });

  const auth = await import("authenticator");
  const secret = auth.generateKey();

  await prisma.user.update({
    where: { id: session.user.id },
    data: { pending2FASecret: secret },
  });

  const issuer = "ATAIX";
  const label = encodeURIComponent(issuer + ":" + (user.email ?? session.user.id));
  const qrUrl = `otpauth://totp/${label}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;

  return NextResponse.json({ qrUrl, secret });
}
