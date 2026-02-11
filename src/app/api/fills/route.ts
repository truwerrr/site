import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = new URL(request.url).searchParams;
    const pair = searchParams.get("pair");
    const limit = parseInt(searchParams.get("limit") || "100");

    const fills = await prisma.fill.findMany({
      where: {
        userId: session.user.id,
        ...(pair && { order: { pair } }),
      },
      include: { order: true },
      orderBy: { timestamp: "desc" },
      take: limit,
    });

    return NextResponse.json(fills);
  } catch (error) {
    console.error("Error fetching fills:", error);
    return NextResponse.json({ error: "Failed to fetch fills" }, { status: 500 });
  }
}
