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

    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // Parse payload JSON and add title/message fields
    const formatted = notifications.map((n) => {
      try {
        const payload = JSON.parse(n.payload || "{}");
        return {
          id: n.id,
          type: n.type,
          title: payload.title || "Уведомление",
          message: payload.message || "",
          read: !!n.readAt,
          createdAt: n.createdAt.toISOString(),
        };
      } catch {
        return {
          id: n.id,
          type: n.type,
          title: "Уведомление",
          message: n.payload || "",
          read: !!n.readAt,
          createdAt: n.createdAt.toISOString(),
        };
      }
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { notificationId } = await request.json();

    if (notificationId) {
      await prisma.notification.update({
        where: { id: notificationId },
        data: { readAt: new Date() },
      });
    } else {
      await prisma.notification.updateMany({
        where: { userId: session.user.id, readAt: null },
        data: { readAt: new Date() },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating notification:", error);
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
  }
}
