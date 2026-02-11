import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { cancelOrder } from "@/lib/trading-engine";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await cancelOrder(id, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error cancelling order:", error);
    return NextResponse.json({ error: error.message || "Failed to cancel order" }, { status: 400 });
  }
}
