import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { getFakeAdById } from "@/lib/p2p-fake-bots";

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
    const fakeAd = getFakeAdById(id);
    if (fakeAd) {
      return NextResponse.json({ ...fakeAd, isOwner: false });
    }

    const ad = await prisma.p2PAd.findUnique({
      where: { id },
      include: { user: { select: { email: true } } },
    });

    if (!ad) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...ad,
      isOwner: ad.userId === session.user.id,
    });
  } catch (error) {
    console.error("Error fetching P2P ad:", error);
    return NextResponse.json({ error: "Failed to fetch ad" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const ad = await prisma.p2PAd.findUnique({ where: { id } });

    if (!ad || ad.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await request.json();
    const { priceKZT, available, limitMin, limitMax, paymentMethods, paymentRequisites, isActive } = body;

    const data: Record<string, unknown> = {};
    if (priceKZT != null) data.priceKZT = String(priceKZT);
    if (available != null) {
      const newAvailable = String(available);
      const activeDeals = await prisma.p2PDeal.findMany({
        where: { adId: id, status: { in: ["pending", "paid"] } },
        select: { amount: true },
      });
      let reservedAmount = 0;
      for (const d of activeDeals) reservedAmount += parseFloat(d.amount) || 0;
      const newAvailableNum = parseFloat(newAvailable);
      if (isNaN(newAvailableNum) || newAvailableNum < reservedAmount) {
        return NextResponse.json(
          { error: "Доступно не может быть меньше суммы активных сделок (" + reservedAmount + ")" },
          { status: 400 }
        );
      }
      data.available = newAvailable;
    }
    if (limitMin != null) data.limitMin = String(limitMin);
    if (limitMax != null) data.limitMax = String(limitMax);
    if (paymentMethods != null) data.paymentMethods = JSON.stringify(paymentMethods);
    if (paymentRequisites !== undefined) {
      data.paymentRequisites = Array.isArray(paymentRequisites) && paymentRequisites.length > 0
        ? JSON.stringify(paymentRequisites)
        : null;
    }
    if (typeof isActive === "boolean") data.isActive = isActive;

    const updated = await prisma.p2PAd.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating P2P ad:", error);
    return NextResponse.json({ error: "Failed to update ad" }, { status: 500 });
  }
}
