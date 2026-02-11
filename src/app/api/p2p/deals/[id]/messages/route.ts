import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { getP2PBotUserId } from "@/lib/p2p-bot-user";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const deal = await prisma.p2PDeal.findUnique({
      where: { id },
      select: { buyerId: true, sellerId: true },
    });
    if (!deal) return NextResponse.json({ error: "Deal not found" }, { status: 404 });

    const isParticipant = deal.buyerId === session.user.id || deal.sellerId === session.user.id;
    const botUserId = await getP2PBotUserId();
    const isAdminBotDeal = (session.user as { role?: string }).role === "admin" && botUserId && (deal.buyerId === botUserId || deal.sellerId === botUserId);
    if (!isParticipant && !isAdminBotDeal) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    const messages = await prisma.p2PMessage.findMany({
      where: { dealId: id },
      include: { user: { select: { email: true } } },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { body } = await request.json();
    const bodyStr = typeof body === "string" ? body.trim() : "";
    if (!bodyStr || bodyStr.length > 2000) {
      return NextResponse.json({ error: "Сообщение должно быть от 1 до 2000 символов" }, { status: 400 });
    }

    const deal = await prisma.p2PDeal.findUnique({
      where: { id },
    });

    if (!deal) return NextResponse.json({ error: "Deal not found" }, { status: 404 });

    const isParticipant = deal.buyerId === session.user.id || deal.sellerId === session.user.id;
    const botUserId = await getP2PBotUserId();
    const isAdminBotDeal = (session.user as { role?: string }).role === "admin" && botUserId && (deal.buyerId === botUserId || deal.sellerId === botUserId);
    if (!isParticipant && !isAdminBotDeal) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    const message = await prisma.p2PMessage.create({
      data: {
        dealId: id,
        userId: session.user.id,
        body: bodyStr,
      },
      include: { user: { select: { email: true } } },
    });

    const recipientId = deal.buyerId === session.user.id ? deal.sellerId : deal.buyerId;
    const shortId = id.slice(0, 8);
    const preview = bodyStr.length > 50 ? bodyStr.slice(0, 50) + "…" : bodyStr;
    await prisma.notification.create({
      data: {
        userId: recipientId,
        type: "p2p_message",
        payload: JSON.stringify({
          dealId: id,
          messagePreview: bodyStr.slice(0, 100),
          title: "Новое сообщение в сделке",
          message: `Вам написали в чате сделки #${shortId}. ${preview}`,
        }),
      },
    }).catch(() => {});

    return NextResponse.json(message);
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json({ error: "Failed to create message" }, { status: 500 });
  }
}
