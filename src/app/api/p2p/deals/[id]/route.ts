import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { getFakeAdById } from "@/lib/p2p-fake-bots";
import { getP2PBotUserId } from "@/lib/p2p-bot-user";
import { Decimal } from "decimal.js";

function getDealStatusNotification(dealId: string, status: string): { title: string; message: string } {
  const shortId = dealId.slice(0, 8);
  const map: Record<string, { title: string; message: string }> = {
    pending: { title: "Новая P2P-сделка", message: `Создана новая сделка #${shortId}.` },
    paid: { title: "Оплата получена", message: `Покупатель отметил оплату по сделке #${shortId}.` },
    released: { title: "Сделка завершена", message: `Криптовалюта переведена по сделке #${shortId}.` },
    cancelled: { title: "Сделка отменена", message: `Сделка #${shortId} отменена.` },
    disputed: { title: "Открыт диспут", message: `По сделке #${shortId} открыт диспут.` },
  };
  return map[status] ?? { title: "P2P-сделка", message: `Статус сделки: ${status}` };
}

async function notifyDealStatus(userId: string, dealId: string, status: string) {
  const { title, message } = getDealStatusNotification(dealId, status);
  await prisma.notification.create({
    data: {
      userId,
      type: "p2p_deal_status",
      payload: JSON.stringify({ dealId, status, title, message }),
    },
  }).catch(() => {});
}

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
      include: {
        ad: true,
        buyer: { select: { email: true } },
        seller: { select: { email: true } },
        messages: {
          include: { user: { select: { email: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!deal) return NextResponse.json({ error: "Deal not found" }, { status: 404 });

    const botUserId = await getP2PBotUserId();
    const isParticipant = deal.buyerId === session.user.id || deal.sellerId === session.user.id;
    const isAdmin = (session.user as { role?: string }).role === "admin";
    const isAdminViewingBotDeal = isAdmin && botUserId && (deal.buyerId === botUserId || deal.sellerId === botUserId);
    const isAdminViewingDispute = isAdmin && deal.status === "disputed";

    if (!isParticipant && !isAdminViewingBotDeal && !isAdminViewingDispute) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    let dealToReturn = deal;
    if (deal.status === "pending" && deal.deadlineAt && new Date(deal.deadlineAt) < new Date()) {
      const amountDec = new Decimal(deal.amount);
      await prisma.$transaction(async (tx) => {
        const updated = await tx.p2PDeal.updateMany({
          where: { id: deal.id, status: "pending" },
          data: { status: "cancelled" },
        });
        if (updated.count === 0) return;
        const sellerBalance = await tx.balance.findFirst({
          where: { userId: deal.sellerId, currency: deal.currency },
        });
        if (sellerBalance) {
          await tx.balance.updateMany({
            where: { userId: deal.sellerId, currency: deal.currency },
            data: {
              available: new Decimal(sellerBalance.available).plus(amountDec).toString(),
              locked: Decimal.max(0, new Decimal(sellerBalance.locked).minus(amountDec)).toString(),
            },
          });
        }
        const adId = deal.adId;
        const ad = adId ? await tx.p2PAd.findUnique({ where: { id: adId } }) : null;
        if (ad && adId) {
          await tx.p2PAd.update({
            where: { id: adId },
            data: { available: new Decimal(ad.available).plus(amountDec).toString() },
          });
        }
      });
      const refreshed = await prisma.p2PDeal.findUnique({
        where: { id },
        include: {
          ad: true,
          buyer: { select: { email: true } },
          seller: { select: { email: true } },
          messages: {
            include: { user: { select: { email: true } } },
            orderBy: { createdAt: "asc" },
          },
        },
      });
      if (refreshed) dealToReturn = refreshed;
    }

    const payload = { ...dealToReturn } as Record<string, unknown>;
    const demoAdId = (dealToReturn as { demoAdId?: string | null }).demoAdId;
    if (demoAdId && !dealToReturn.ad) {
      const fakeAd = getFakeAdById(demoAdId);
      if (fakeAd) {
        payload.ad = {
          side: fakeAd.side,
          paymentMethods: fakeAd.paymentMethods,
          paymentRequisites: fakeAd.paymentRequisites ?? [],
        };
      }
    }
    if (!isAdmin && (payload as Record<string, unknown>).demoAdId !== undefined) {
      delete payload.demoAdId;
    }
    const adPayload = payload.ad as { paymentRequisites?: string | unknown[] } | undefined;
    if (adPayload && typeof adPayload.paymentRequisites === "string") {
      try {
        adPayload.paymentRequisites = JSON.parse(adPayload.paymentRequisites) as unknown[];
      } catch {
        adPayload.paymentRequisites = [];
      }
    }
    return NextResponse.json(payload);
  } catch (error) {
    console.error("Error fetching deal:", error);
    return NextResponse.json({ error: "Failed to fetch deal" }, { status: 500 });
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
    const body = await request.json().catch(() => ({}));
    const action = body.action;

    const deal = await prisma.p2PDeal.findUnique({
      where: { id },
    });

    if (!deal) return NextResponse.json({ error: "Deal not found" }, { status: 404 });

    const botUserId = await getP2PBotUserId();
    const isParticipant = deal.buyerId === session.user.id || deal.sellerId === session.user.id;
    const isAdmin = (session.user as { role?: string }).role === "admin";
    const isAdminActingForBot = isAdmin && botUserId && deal.sellerId === botUserId;
    const isAdminResolvingDispute = isAdmin && deal.status === "disputed";

    if (!isParticipant && !isAdminActingForBot && !isAdminResolvingDispute) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    const canActAsSeller = deal.sellerId === session.user.id || isAdminActingForBot;
    const canActAsBuyer = deal.buyerId === session.user.id;

    if (action === "markPaid") {
      if (!canActAsBuyer) {
        return NextResponse.json({ error: "Нет прав" }, { status: 403 });
      }
      if (deal.status !== "pending") {
        return NextResponse.json({ error: deal.status === "paid" ? "Уже отмечено как оплачено" : "Сделку нельзя изменить" }, { status: 400 });
      }
      await prisma.p2PDeal.update({
        where: { id },
        data: { status: "paid" },
      });
      await notifyDealStatus(deal.sellerId, id, "paid");
    } else if (action === "release") {
      if (!canActAsSeller) {
        return NextResponse.json({ error: "Нет прав" }, { status: 403 });
      }
      try {
        await prisma.$transaction(async (tx) => {
          const current = await tx.p2PDeal.findUnique({ where: { id } });
          if (!current || current.status !== "paid") {
            throw new Error(current?.status === "released" ? "Средства уже освобождены" : "Неверный статус");
          }
        const amountDec = new Decimal(current.amount);
        const escrowDec = new Decimal(current.escrowAmount);

        const buyerBalance = await tx.balance.findFirst({
          where: { userId: current.buyerId, currency: current.currency },
        });
        if (buyerBalance) {
          await tx.balance.updateMany({
            where: { userId: current.buyerId, currency: current.currency },
            data: { available: new Decimal(buyerBalance.available).plus(amountDec).toString() },
          });
        } else {
          await tx.balance.create({
            data: {
              userId: current.buyerId,
              currency: current.currency,
              available: amountDec.toString(),
              locked: "0",
            },
          });
        }

        const sellerKztBalance = await tx.balance.findFirst({
          where: { userId: current.sellerId, currency: "KZT" },
        });
        if (sellerKztBalance) {
          await tx.balance.updateMany({
            where: { userId: current.sellerId, currency: "KZT" },
            data: { available: new Decimal(sellerKztBalance.available).plus(escrowDec).toString() },
          });
        } else {
          await tx.balance.create({
            data: {
              userId: current.sellerId,
              currency: "KZT",
              available: escrowDec.toString(),
              locked: "0",
            },
          });
        }

        const sellerBalance = await tx.balance.findFirst({
          where: { userId: current.sellerId, currency: current.currency },
        });
        if (sellerBalance) {
          const newLocked = Decimal.max(0, new Decimal(sellerBalance.locked).minus(amountDec));
          await tx.balance.updateMany({
            where: { userId: current.sellerId, currency: current.currency },
            data: { locked: newLocked.toString() },
          });
        }

        await tx.p2PDeal.update({
          where: { id },
          data: { status: "released" },
        });
      });
      await notifyDealStatus(deal.buyerId, id, "released");
      } catch (e) {
        const msg = (e as Error)?.message ?? "";
        return NextResponse.json(
          { error: msg || "Не удалось освободить средства" },
          { status: 400 }
        );
      }
    } else if (action === "cancel") {
      if (deal.status !== "pending") {
        return NextResponse.json({ error: "Сделку нельзя отменить" }, { status: 400 });
      }
      const amountDec = new Decimal(deal.amount);
      const sellerBalance = await prisma.balance.findFirst({
        where: { userId: deal.sellerId, currency: deal.currency },
      });
      if (sellerBalance) {
        await prisma.balance.updateMany({
          where: { userId: deal.sellerId, currency: deal.currency },
          data: {
            available: new Decimal(sellerBalance.available).plus(amountDec).toString(),
            locked: Decimal.max(0, new Decimal(sellerBalance.locked).minus(amountDec)).toString(),
          },
        });
      }
      const adId = deal.adId;
      const ad = adId ? await prisma.p2PAd.findUnique({ where: { id: adId } }) : null;
      if (ad && adId) {
        await prisma.p2PAd.update({
          where: { id: adId },
          data: { available: new Decimal(ad.available).plus(amountDec).toString() },
        });
      }
      await prisma.p2PDeal.update({
        where: { id },
        data: { status: "cancelled" },
      });
      const otherOnCancel = deal.buyerId === session.user.id ? deal.sellerId : deal.buyerId;
      await notifyDealStatus(otherOnCancel, id, "cancelled");
    } else if (action === "openDispute") {
      if (deal.status !== "pending" && deal.status !== "paid") {
        return NextResponse.json({ error: "Диспут можно открыть только при ожидании оплаты или после оплаты" }, { status: 400 });
      }
      if (!isParticipant) {
        return NextResponse.json({ error: "Нет прав" }, { status: 403 });
      }
      await prisma.p2PDeal.update({
        where: { id },
        data: { status: "disputed" },
      });
      const otherOnDispute = deal.buyerId === session.user.id ? deal.sellerId : deal.buyerId;
      await notifyDealStatus(otherOnDispute, id, "disputed");
    } else if (action === "resolveDispute") {
      if (deal.status !== "disputed") {
        return NextResponse.json({ error: "Сделка не в диспуте" }, { status: 400 });
      }
      const isAdmin = (session.user as { role?: string }).role === "admin";
      if (!isAdmin) {
        return NextResponse.json({ error: "Только администратор может решать диспут" }, { status: 403 });
      }
      const resolution = body.resolution;
      if (resolution !== "buyer" && resolution !== "seller") {
        return NextResponse.json({ error: "Укажите resolution: buyer или seller" }, { status: 400 });
      }
      const amountDec = new Decimal(deal.amount);
      const escrowDec = new Decimal(deal.escrowAmount);
      if (resolution === "buyer") {
        const buyerBalance = await prisma.balance.findFirst({
          where: { userId: deal.buyerId, currency: deal.currency },
        });
        if (buyerBalance) {
          await prisma.balance.updateMany({
            where: { userId: deal.buyerId, currency: deal.currency },
            data: { available: new Decimal(buyerBalance.available).plus(amountDec).toString() },
          });
        } else {
          await prisma.balance.create({
            data: { userId: deal.buyerId, currency: deal.currency, available: amountDec.toString(), locked: "0" },
          });
        }
        const sellerBalance = await prisma.balance.findFirst({
          where: { userId: deal.sellerId, currency: deal.currency },
        });
        if (sellerBalance) {
          const newLocked = Decimal.max(0, new Decimal(sellerBalance.locked).minus(amountDec));
          await prisma.balance.updateMany({
            where: { userId: deal.sellerId, currency: deal.currency },
            data: { locked: newLocked.toString() },
          });
        }
        await prisma.p2PDeal.update({ where: { id }, data: { status: "released" } });
        await notifyDealStatus(deal.buyerId, id, "released");
        await notifyDealStatus(deal.sellerId, id, "released");
      } else {
        const sellerBalance = await prisma.balance.findFirst({
          where: { userId: deal.sellerId, currency: deal.currency },
        });
        if (sellerBalance) {
          await prisma.balance.updateMany({
            where: { userId: deal.sellerId, currency: deal.currency },
            data: {
              available: new Decimal(sellerBalance.available).plus(amountDec).toString(),
              locked: Decimal.max(0, new Decimal(sellerBalance.locked).minus(amountDec)).toString(),
            },
          });
        }
        const adId = deal.adId;
        const ad = adId ? await prisma.p2PAd.findUnique({ where: { id: adId } }) : null;
        if (ad && adId) {
          await prisma.p2PAd.update({
            where: { id: adId },
            data: { available: new Decimal(ad.available).plus(amountDec).toString() },
          });
        }
        await prisma.p2PDeal.update({ where: { id }, data: { status: "cancelled" } });
        await notifyDealStatus(deal.buyerId, id, "cancelled");
        await notifyDealStatus(deal.sellerId, id, "cancelled");
      }
    } else {
      return NextResponse.json({ error: "Неизвестное действие" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating deal:", error);
    return NextResponse.json({ error: "Failed to update deal" }, { status: 500 });
  }
}
