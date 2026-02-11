import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { getP2PBotUserId } from "@/lib/p2p-bot-user";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [usersTotal, recentUsers, botUserId] = await Promise.all([
      prisma.user.count(),
      prisma.user.findMany({
        select: { id: true, email: true, role: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      getP2PBotUserId(),
    ]);

    let dealsTotal = 0;
    let dealsPending = 0;
    if (botUserId) {
      const [total, pending] = await Promise.all([
        prisma.p2PDeal.count({
          where: {
            OR: [{ buyerId: botUserId }, { sellerId: botUserId }],
          },
        }),
        prisma.p2PDeal.count({
          where: {
            OR: [{ buyerId: botUserId }, { sellerId: botUserId }],
            status: "pending",
          },
        }),
      ]);
      dealsTotal = total;
      dealsPending = pending;
    }

    return NextResponse.json({
      users: usersTotal,
      deals: dealsTotal,
      dealsPending,
      recentUsers,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
