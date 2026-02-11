import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { placeOrder } from "@/lib/trading-engine";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { pair, side, type, amount, price, stopPrice } = body;

    if (!pair || !side || !type || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const order = await placeOrder({
      userId: session.user.id,
      pair,
      side,
      type,
      amount: amount.toString(),
      price: price?.toString(),
      stopPrice: stopPrice?.toString(),
    });

    return NextResponse.json(order);
  } catch (error: any) {
    console.error("Error placing order:", error);
    return NextResponse.json({ error: error.message || "Failed to place order" }, { status: 400 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = new URL(request.url).searchParams;
    const pair = searchParams.get("pair");
    const status = searchParams.get("status");

    const { prisma } = await import("@/lib/prisma");
    const orders = await prisma.order.findMany({
      where: {
        userId: session.user.id,
        ...(pair && { pair }),
        ...(status && { status }),
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
