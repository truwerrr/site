"use client";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { maskEmailForDisplay } from "@/lib/p2p-fake-bots";

type PaymentRequisite = { method: string; accountName: string; accountNumber: string; bankName?: string; comment?: string };

interface Deal {
  id: string;
  adId: string | null;
  demoAdId?: string | null;
  buyerId: string;
  sellerId: string;
  currency: string;
  priceKZT: string;
  amount: string;
  status: string;
  escrowAmount: string;
  deadlineAt: string | null;
  selectedPaymentMethod?: string | null;
  buyer: { email: string };
  seller: { email: string };
  ad?: { side: string; paymentMethods: string; paymentRequisites?: PaymentRequisite[] } | null;
  messages: { id: string; body: string; userId: string; createdAt: string; user: { email: string } }[];
}

const CHAT_TEMPLATES = [
  "Оплатил",
  "Проверь, пожалуйста",
  "Средства получены, спасибо",
  "Реквизиты отправил",
  "Готово, можно завершать",
];

function useCountdown(deadlineAt: string | null, status: string) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    if (status !== "pending" || !deadlineAt) {
      setLeft(null);
      return;
    }
    const deadline = new Date(deadlineAt).getTime();
    const tick = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((deadline - now) / 1000));
      setLeft(diff);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadlineAt, status]);
  return left;
}

function formatCountdown(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text);
}

function formatMessageTime(createdAt: string): string {
  const date = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMin < 1) return "только что";
  if (diffMin < 60) return `${diffMin} мин назад`;
  if (diffHours < 24 && date.getDate() === now.getDate()) return `${diffHours} ч назад`;
  if (diffDays === 1 || (diffDays < 2 && date.getDate() !== now.getDate())) return "вчера";
  if (diffDays < 7) return `${diffDays} дн. назад`;
  return date.toLocaleString("ru-RU", { timeStyle: "short", dateStyle: "short" });
}

export default function P2PDealPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const id = params.id as string;
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const countdown = useCountdown(deal?.deadlineAt ?? null, deal?.status ?? "");

  useEffect(() => {
    if (!deal?.messages.length) return;
    chatScrollRef.current?.scrollTo({ top: chatScrollRef.current.scrollHeight, behavior: "smooth" });
  }, [deal?.id, deal?.messages.length]);

  const fetchDeal = async () => {
    try {
      const res = await fetch(`/api/p2p/deals/${id}`);
      if (res.ok) setDeal(await res.json());
      else if (res.status === 404) setDeal(null);
    } catch {
      setDeal(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sessions/signin");
      return;
    }
    if (status === "authenticated" && id) fetchDeal();
  }, [status, id]);

  useEffect(() => {
    if (!deal || deal.status === "cancelled" || deal.status === "released" || deal.status === "disputed") return;
    const interval = setInterval(fetchDeal, 3000);
    return () => clearInterval(interval);
  }, [deal?.id, deal?.status]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/p2p/deals/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: message.trim() }),
      });
      if (res.ok) {
        setMessage("");
        await fetchDeal();
        setTimeout(() => chatScrollRef.current?.scrollTo({ top: chatScrollRef.current.scrollHeight, behavior: "smooth" }), 100);
      }
    } finally {
      setSending(false);
    }
  };

  const doAction = async (action: string, extra?: Record<string, string>) => {
    setActionError("");
    setActionLoading(true);
    try {
      const res = await fetch(`/api/p2p/deals/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      if (res.ok) fetchDeal();
      else {
        const data = await res.json();
        setActionError(data.error || "Ошибка");
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="container py-16 flex justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="container py-16 text-center">
        <p className="text-gray-600 mb-4">Сделка не найдена</p>
        <Link href="/p2p" className="text-primary font-semibold hover:underline">
          Вернуться в P2P
        </Link>
      </div>
    );
  }

  const isBuyer = deal.buyerId === session?.user?.id;
  const isSeller = deal.sellerId === session?.user?.id;
  const isAdmin = (session?.user as { role?: string })?.role === "admin";
  const isDemoDeal = Boolean(deal.demoAdId);
  const canActAsSeller = isSeller || (isAdmin && isDemoDeal);
  const canSendMessage = isBuyer || isSeller || (isAdmin && isDemoDeal);
  const paymentMethods = (() => {
    try {
      return JSON.parse(deal.ad?.paymentMethods || "[]");
    } catch {
      return [];
    }
  })();

  const isTerminal = deal.status === "cancelled" || deal.status === "disputed";
  const stepIndex =
    deal.status === "released"
      ? 3
      : deal.status === "paid"
        ? 2
        : deal.status === "pending"
          ? 1
          : 0;
  const steps = [
    { label: "Создание заказа", done: stepIndex >= 1 },
    { label: "Оплата покупателем", done: !isTerminal && stepIndex >= 2 },
    { label: "Подтверждение продавцом", done: !isTerminal && stepIndex >= 3 },
    { label: "Завершено", done: deal.status === "released" },
  ];

  const statusLabel: Record<string, string> = {
    pending: "Ожидание оплаты",
    paid: "Оплачено",
    released: "Завершено",
    cancelled: "Отменено",
    disputed: "Диспут",
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
      {isAdmin && isDemoDeal && (
        <div className="mb-3 flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700">
          <span className="font-medium">Режим поддержки</span>
          <Link href="/admin/p2p" className="font-medium text-slate-600 hover:underline">
            ← К списку P2P
          </Link>
        </div>
      )}
      <Link
        href={isAdmin && isDemoDeal ? "/admin/p2p" : "/p2p"}
        className="text-sm font-medium text-slate-600 hover:text-slate-900 mb-4 sm:mb-6 inline-block"
      >
        ← Назад к P2P
      </Link>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 xl:gap-8">
        <div className="xl:col-span-7 space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-slate-500 text-xs uppercase tracking-wide">Заказ</span>
                <p className="font-mono font-semibold text-slate-900 text-sm sm:text-base">#{deal.id.slice(0, 8)}</p>
              </div>
              <span
                className={`px-3 py-1.5 rounded-md text-xs font-semibold ${
                  deal.status === "pending"
                    ? "bg-slate-100 text-slate-700"
                    : deal.status === "paid"
                      ? "bg-slate-100 text-slate-800"
                      : deal.status === "released"
                        ? "bg-slate-100 text-slate-800"
                        : deal.status === "disputed"
                          ? "bg-slate-200 text-slate-800"
                          : "bg-slate-100 text-slate-600"
                }`}
              >
                {statusLabel[deal.status] ?? deal.status}
              </span>
            </div>

            <div className="px-4 sm:px-6 py-3 border-b border-slate-100 bg-slate-50/50">
              {deal.status === "cancelled" ? (
                <div className="flex items-center gap-2 text-sm">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-slate-200 text-slate-600 text-xs font-semibold">1</span>
                  <span className="text-slate-600">Создание заказа</span>
                  <span className="text-slate-400">→</span>
                  <span className="text-red-600 font-medium">Заказ отменён</span>
                </div>
              ) : deal.status === "disputed" ? (
                <div className="flex items-center gap-2 text-sm">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-slate-300 text-slate-700 text-xs font-semibold">!</span>
                  <span className="text-slate-700 font-medium">Диспут — ожидает решения</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  {steps.map((s, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span
                        className={`inline-flex h-7 w-7 items-center justify-center rounded-md text-xs font-semibold ${
                          s.done ? "bg-slate-800 text-white" : "bg-slate-200 text-slate-500"
                        }`}
                      >
                        {s.done ? "✓" : i + 1}
                      </span>
                      <span className={`text-xs sm:text-sm ${s.done ? "text-slate-800 font-medium" : "text-slate-500"}`}>
                        {s.label}
                      </span>
                      {i < steps.length - 1 && <span className="text-slate-300 text-xs">→</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 sm:p-6 space-y-5">
              {deal.status === "pending" && (countdown !== null || deal.deadlineAt) && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Время на оплату</span>
                  <span className="font-mono text-lg font-semibold text-slate-900 tabular-nums">
                    {countdown !== null ? formatCountdown(countdown) : "—"}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="rounded-lg border border-slate-200 bg-white p-4">
                  <span className="text-xs text-slate-500 uppercase tracking-wide">Количество</span>
                  <p className="font-semibold text-slate-900 tabular-nums text-base mt-0.5">{deal.amount} {deal.currency}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-4">
                  <span className="text-xs text-slate-500 uppercase tracking-wide">Курс</span>
                  <p className="font-semibold text-slate-900 tabular-nums text-base mt-0.5">{parseFloat(deal.priceKZT).toLocaleString()} KZT</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-4">
                  <span className="text-xs text-slate-500 uppercase tracking-wide">Сумма к оплате</span>
                  <p className="font-semibold text-slate-900 tabular-nums text-base mt-0.5">{parseFloat(deal.escrowAmount).toLocaleString()} KZT</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-4">
                  <span className="text-xs text-slate-500 uppercase tracking-wide">Способ оплаты</span>
                  <p className="font-medium text-slate-900 text-sm mt-0.5">{paymentMethods.join(", ") || "—"}</p>
                </div>
              </div>

              {/* Реквизиты для оплаты — показываем покупателю при pending/paid */}
              {isBuyer && (deal.status === "pending" || deal.status === "paid") && (() => {
                const reqs = deal.ad?.paymentRequisites ?? [];
                const selected = deal.selectedPaymentMethod && reqs.find((r) => r.method === deal.selectedPaymentMethod);
                const requisite = selected ?? reqs[0];
                if (!requisite) {
                  return (
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <h3 className="font-semibold text-slate-900 text-sm mb-1">Реквизиты для оплаты</h3>
                      <p className="text-sm text-slate-600">Уточните реквизиты у продавца в чате.</p>
                    </div>
                  );
                }
                return (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 sm:p-5">
                    <h3 className="font-semibold text-slate-900 text-sm mb-3">Реквизиты для оплаты</h3>
                    <p className="text-xs text-slate-600 mb-4 rounded-md bg-white border border-slate-200 px-3 py-2">
                      Оплатите указанную сумму на реквизиты продавца. Имя отправителя должно совпадать с именем в профиле. Не указывайте в комментарии к переводу слова, связанные с криптовалютой.
                    </p>
                    <div className="space-y-2.5 text-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-slate-500">Способ оплаты</span>
                        <span className="font-medium text-slate-900">{requisite.method}</span>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-slate-500">Получатель</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-900 text-xs sm:text-sm">{requisite.accountName}</span>
                          <button type="button" onClick={() => copyToClipboard(requisite.accountName)} className="text-xs px-2 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-600">Копировать</button>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-slate-500">Счёт / карта</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-900 text-xs sm:text-sm">{requisite.accountNumber}</span>
                          <button type="button" onClick={() => copyToClipboard(requisite.accountNumber)} className="text-xs px-2 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-600">Копировать</button>
                        </div>
                      </div>
                      {requisite.bankName && (
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-slate-500">Банк</span>
                          <span className="font-medium text-slate-900">{requisite.bankName}</span>
                        </div>
                      )}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-slate-500">Сумма к переводу</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 tabular-nums">{parseFloat(deal.escrowAmount).toLocaleString()} KZT</span>
                          <button type="button" onClick={() => copyToClipboard(deal.escrowAmount)} className="text-xs px-2 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-600">Копировать</button>
                        </div>
                      </div>
                      {requisite.comment && (
                        <div className="pt-2 border-t border-slate-200">
                          <span className="text-slate-500">Комментарий к переводу</span>
                          <p className="text-slate-700 mt-0.5 text-sm">{requisite.comment}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              <div className="rounded-lg border border-slate-200 p-4">
                <span className="text-xs text-slate-500 uppercase tracking-wide">Контрагент</span>
                <p className="font-medium text-slate-900 text-sm mt-0.5">
                  {isBuyer ? maskEmailForDisplay(deal.seller.email) : maskEmailForDisplay(deal.buyer.email)}
                </p>
              </div>

              {actionError && (
                <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm p-3">
                  {actionError}
                </div>
              )}

              {(deal.status === "pending" || deal.status === "paid") && (
                <div className="flex flex-wrap gap-3 pt-1">
                  {isBuyer && deal.status === "pending" && (
                    <button
                      onClick={() => doAction("markPaid")}
                      disabled={actionLoading}
                      className="px-5 py-2.5 rounded-lg bg-slate-800 text-white text-sm font-medium hover:bg-slate-900 disabled:opacity-50"
                    >
                      Я оплатил
                    </button>
                  )}
                  {canActAsSeller && (
                    <button
                      onClick={() => doAction("release")}
                      disabled={actionLoading || deal.status !== "paid"}
                      className="px-5 py-2.5 rounded-lg bg-slate-800 text-white text-sm font-medium hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Освободить средства
                    </button>
                  )}
                  {(isBuyer || canActAsSeller) && deal.status === "pending" && (
                    <button
                      onClick={() => doAction("cancel")}
                      disabled={actionLoading}
                      className="px-5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
                    >
                      Отменить заказ
                    </button>
                  )}
                  {(isBuyer || isSeller) && (
                    <button
                      onClick={() => doAction("openDispute")}
                      disabled={actionLoading}
                      className="px-5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
                    >
                      Открыть диспут
                    </button>
                  )}
                </div>
              )}

              {deal.status === "disputed" && isAdmin && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 mt-2">
                  <p className="font-semibold text-slate-900 text-sm mb-3">Решение диспута</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => doAction("resolveDispute", { resolution: "buyer" })}
                      disabled={actionLoading}
                      className="px-4 py-2 rounded-lg bg-slate-800 text-white text-sm font-medium hover:bg-slate-900 disabled:opacity-50"
                    >
                      В пользу покупателя
                    </button>
                    <button
                      onClick={() => doAction("resolveDispute", { resolution: "seller" })}
                      disabled={actionLoading}
                      className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-100 disabled:opacity-50"
                    >
                      В пользу продавца
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 mt-2">Покупатель — вернуть крипту покупателю. Продавец — вернуть крипту продавцу, сделка отменена.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="xl:col-span-5 min-w-0 flex flex-col">
          <div className="rounded-lg border border-slate-200 bg-white overflow-hidden sticky top-4 flex flex-col flex-1 min-h-[360px] xl:max-h-[calc(100vh-5rem)]">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
              <h2 className="font-semibold text-slate-900 text-sm">Чат</h2>
              <p className="text-xs text-slate-500 mt-0.5">Общение по сделке</p>
            </div>
            <div
              ref={chatScrollRef}
              className="flex-1 overflow-y-auto p-4 min-h-[200px] space-y-3"
            >
              {deal.messages.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-10">Нет сообщений</p>
              ) : (
                deal.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.userId === session?.user?.id ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[88%] p-3 rounded-lg text-sm ${
                        m.userId === session?.user?.id
                          ? "bg-slate-800 text-white"
                          : "bg-slate-100 text-slate-900"
                      }`}
                    >
                      <span className="text-xs opacity-80">{maskEmailForDisplay(m.user.email)}</span>
                      <p className="mt-0.5 break-words">{m.body}</p>
                      <span className={`text-xs block mt-0.5 ${m.userId === session?.user?.id ? "text-white/70" : "text-slate-400"}`} title={new Date(m.createdAt).toLocaleString("ru-RU")}>
                        {formatMessageTime(m.createdAt)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
            {canSendMessage && deal.status !== "cancelled" && deal.status !== "released" && (
              <div className="p-4 border-t border-slate-200 bg-slate-50">
                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-2">Быстрые ответы</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {CHAT_TEMPLATES.map((text) => (
                    <button
                      key={text}
                      type="button"
                      onClick={() => setMessage((prev) => (prev ? `${prev} ${text}` : text))}
                      className="px-2.5 py-1.5 rounded-md bg-white border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50"
                    >
                      {text}
                    </button>
                  ))}
                </div>
                <form onSubmit={sendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Сообщение..."
                    className="flex-1 min-w-0 rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-slate-300 focus:border-slate-400"
                  />
                  <button
                    type="submit"
                    disabled={sending || !message.trim()}
                    className="px-4 py-2.5 rounded-lg bg-slate-800 text-white text-sm font-medium hover:bg-slate-900 disabled:opacity-50 shrink-0"
                  >
                    Отправить
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
