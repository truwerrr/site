import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ pair: string }> }
) {
  try {
    const { pair } = await params;
    const searchParams = new URL(request.url).searchParams;
    const limit = parseInt(searchParams.get("limit") || "100");

    const trades = await prisma.trade.findMany({
      where: { pair },
      orderBy: { timestamp: "desc" },
      take: limit,
    });

    return NextResponse.json(trades);
  } catch (error) {
    console.error("Error fetching trades:", error);
    return NextResponse.json({ error: "Failed to fetch trades" }, { status: 500 });
  }
}
