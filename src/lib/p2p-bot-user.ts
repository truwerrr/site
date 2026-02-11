import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const P2P_BOT_EMAIL = "p2p-bot@ataix-p.kz";

let cachedBotUserId: string | null = null;
let initBotPromise: Promise<string | null> | null = null;

export async function getP2PBotUserId(): Promise<string | null> {
  if (cachedBotUserId) return cachedBotUserId;
  const user = await prisma.user.findUnique({
    where: { email: P2P_BOT_EMAIL },
    select: { id: true },
  });
  if (user) cachedBotUserId = user.id;
  return user?.id ?? null;
}

/** Возвращает id пользователя-бота; при отсутствии создаёт его. Результат кэшируется. Один запрос в момент. */
export async function getOrCreateP2PBotUserId(): Promise<string | null> {
  if (cachedBotUserId) return cachedBotUserId;
  if (!initBotPromise) {
    initBotPromise = (async () => {
      try {
        if (cachedBotUserId) return cachedBotUserId;
        let user = await prisma.user.findUnique({
          where: { email: P2P_BOT_EMAIL },
          select: { id: true },
        });
        if (user) {
          cachedBotUserId = user.id;
          return user.id;
        }
        try {
          const created = await prisma.user.create({
            data: {
              email: P2P_BOT_EMAIL,
              passwordHash: await bcrypt.hash("p2p-demo-bot-internal", 10),
              role: "user",
            },
            select: { id: true },
          });
          cachedBotUserId = created.id;
          return created.id;
        } catch {
          user = await prisma.user.findUnique({
            where: { email: P2P_BOT_EMAIL },
            select: { id: true },
          });
          if (user) cachedBotUserId = user.id;
          return user?.id ?? null;
        }
      } finally {
        initBotPromise = null;
      }
    })();
  }
  return initBotPromise;
}

/** Id объявления-заглушки для демо-сделок (чтобы Prisma не требовала ad). */
export const DEMO_PLACEHOLDER_AD_ID = "p2p-demo-placeholder";

let cachedPlaceholderExists = false;
let initPlaceholderPromise: Promise<string> | null = null;

/** Возвращает id объявления-заглушки для бота; создаёт при отсутствии. Один запрос в момент. */
export async function getOrCreateDemoPlaceholderAdId(botUserId: string): Promise<string> {
  if (cachedPlaceholderExists) return DEMO_PLACEHOLDER_AD_ID;
  if (!initPlaceholderPromise) {
    initPlaceholderPromise = (async () => {
      try {
        if (cachedPlaceholderExists) return DEMO_PLACEHOLDER_AD_ID;
        let ad = await prisma.p2PAd.findUnique({
          where: { id: DEMO_PLACEHOLDER_AD_ID },
          select: { id: true },
        });
        if (ad) {
          cachedPlaceholderExists = true;
          return ad.id;
        }
        try {
          await prisma.p2PAd.create({
            data: {
              id: DEMO_PLACEHOLDER_AD_ID,
              userId: botUserId,
              side: "sell",
              currency: "USDT",
              priceKZT: "1",
              available: "0",
              limitMin: "0",
              limitMax: "0",
              paymentMethods: "[]",
              isActive: false,
            },
          });
          cachedPlaceholderExists = true;
          return DEMO_PLACEHOLDER_AD_ID;
        } catch {
          ad = await prisma.p2PAd.findUnique({
            where: { id: DEMO_PLACEHOLDER_AD_ID },
            select: { id: true },
          });
          if (ad) cachedPlaceholderExists = true;
          return DEMO_PLACEHOLDER_AD_ID;
        }
      } finally {
        initPlaceholderPromise = null;
      }
    })();
  }
  return initPlaceholderPromise;
}
