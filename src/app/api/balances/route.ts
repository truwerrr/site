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

    const balances = await prisma.balance.findMany({
      where: { userId: session.user.id },
    });

    return NextResponse.json(balances);
  } catch (error) {
    console.error("Error fetching balances:", error);
    return NextResponse.json({ error: "Failed to fetch balances" }, { status: 500 });
  }
}
