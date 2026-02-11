import { NextResponse } from "next/server";
import { getOrCreateP2PBotUserId, getOrCreateDemoPlaceholderAdId } from "@/lib/p2p-bot-user";

/** Один раз открой в браузере /api/init-p2p-demo — создаст бота и объявление-заглушку в БД (если ещё нет). После этого создание демо-сделок не будет дергать эти запросы. */
export async function GET() {
  try {
    const botUserId = await getOrCreateP2PBotUserId();
    if (!botUserId) {
      return NextResponse.json({ ok: false, error: "Не удалось создать пользователя-бота (возможна блокировка БД)" }, { status: 503 });
    }
    await getOrCreateDemoPlaceholderAdId(botUserId);
    return NextResponse.json({ ok: true, message: "P2P демо готов: бот и заглушка созданы или уже были в БД." });
  } catch (e) {
    console.error("init-p2p-demo:", e);
    return NextResponse.json(
      { ok: false, error: (e as Error).message || "Ошибка инициализации. Закрой Prisma Studio и второй dev-сервер, затем обнови страницу." },
      { status: 500 }
    );
  }
}
