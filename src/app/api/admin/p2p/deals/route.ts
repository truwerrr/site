import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { getP2PBotUserId } from "@/lib/p2p-bot-user";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status")?.trim();
    const sideFilter = searchParams.get("side")?.trim();
    const botOnly = searchParams.get("bot") === "1";
    const validStatuses = ["pending", "paid", "released", "cancelled", "disputed"];
    const status = statusFilter && validStatuses.includes(statusFilter) ? statusFilter : undefined;
    const side = sideFilter === "buy" || sideFilter === "sell" ? sideFilter : undefined;

    const botUserId = botOnly ? await getP2PBotUserId() : null;
    const where: { status?: string; OR?: Array<{ buyerId: string } | { sellerId: string }> } = {};
    if (status) where.status = status;
    if (botUserId) where.OR = [{ buyerId: botUserId }, { sellerId: botUserId }];
    const deals = await prisma.p2PDeal.findMany({
      where: Object.keys(where).length ? where : undefined,
      include: {
        ad: true,
        buyer: { select: { email: true } },
        seller: { select: { email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const demoAdIds = [...new Set(deals.map((d) => d.demoAdId).filter(Boolean))] as string[];
    const demoAds = demoAdIds.length
      ? await prisma.p2PAd.findMany({
          where: { id: { in: demoAdIds } },
          select: { id: true, side: true },
        })
      : [];
    const demoSideById = Object.fromEntries(demoAds.map((a) => [a.id, a.side]));

    const withSide = deals.map((d) => {
      const dealSide = (d.demoAdId ? demoSideById[d.demoAdId] : d.ad?.side) ?? null;
      return { ...d, side: dealSide };
    });

    const filtered = side ? withSide.filter((d) => d.side === side) : withSide;
    return NextResponse.json(filtered);
  } catch (error) {
    console.error("Error fetching admin P2P deals:", error);
    return NextResponse.json({ error: "Failed to fetch deals" }, { status: 500 });
  }
}
