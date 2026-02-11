import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { FAKE_P2P_ADS } from "@/lib/p2p-fake-bots";

export async function GET(request: Request) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const side = searchParams.get("side");
    const currency = searchParams.get("currency");
    const isActive = searchParams.get("isActive") !== "false";

    const dbAds = await prisma.p2PAd.findMany({
      where: {
        ...(side && { side }),
        ...(currency && { currency }),
        isActive: isActive ? true : undefined,
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const fakeFiltered = FAKE_P2P_ADS.filter((ad) => {
      if (side && ad.side !== side) return false;
      if (currency && ad.currency !== currency) return false;
      return true;
    });

    const ads = [...dbAds, ...fakeFiltered];
    return NextResponse.json(ads);
  } catch (error) {
    console.error("Error fetching P2P ads:", error);
    return NextResponse.json({ error: "Failed to fetch ads" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { side, currency, priceKZT, available, limitMin, limitMax, paymentMethods, paymentRequisites } = body;

    if (!side || !currency || !priceKZT || !available || !limitMin || !limitMax || !paymentMethods) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const requisitesJson =
      Array.isArray(paymentRequisites) && paymentRequisites.length > 0
        ? JSON.stringify(paymentRequisites)
        : null;

    if (side === "sell") {
      const availNum = parseFloat(String(available));
      if (isNaN(availNum) || availNum <= 0) {
        return NextResponse.json({ error: "Invalid available amount" }, { status: 400 });
      }
      const balance = await prisma.balance.findFirst({
        where: { userId: session.user.id, currency },
      });
      if (!balance) {
        return NextResponse.json({ error: "Недостаточно средств. Пополните баланс " + currency + " для объявления о продаже." }, { status: 400 });
      }
      const availableBalance = parseFloat(balance.available);
      if (availableBalance < availNum) {
        return NextResponse.json({ error: "Недостаточно средств. Доступно: " + availableBalance + " " + currency }, { status: 400 });
      }
    }

    const ad = await prisma.p2PAd.create({
      data: {
        userId: session.user.id,
        side,
        currency,
        priceKZT,
        available,
        limitMin,
        limitMax,
        paymentMethods: JSON.stringify(paymentMethods),
        ...(requisitesJson != null && { paymentRequisites: requisitesJson }),
      },
    });

    return NextResponse.json(ad);
  } catch (error) {
    console.error("Error creating P2P ad:", error);
    return NextResponse.json({ error: "Failed to create ad" }, { status: 500 });
  }
}
