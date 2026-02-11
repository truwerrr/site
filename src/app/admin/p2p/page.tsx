"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { maskEmailForDisplay } from "@/lib/p2p-fake-bots";

interface DealRow {
  id: string;
  demoAdId: string | null;
  buyerId: string;
  sellerId: string;
  currency: string;
  amount: string;
  priceKZT: string;
  status: string;
  escrowAmount: string;
  createdAt: string;
  side: string | null;
  buyer: { email: string };
  seller: { email: string };
}

const STATUS_FILTERS = [
  { value: "", label: "Все" },
  { value: "pending", label: "Ожидание оплаты" },
  { value: "paid", label: "Оплачено" },
  { value: "released", label: "Завершено" },
  { value: "cancelled", label: "Отменено" },
  { value: "disputed", label: "Диспут" },
] as const;

const SIDE_FILTERS = [
  { value: "", label: "Все" },
  { value: "sell", label: "Продажа" },
  { value: "buy", label: "Покупка" },
] as const;

export default function AdminP2PPage() {
  const { data: session, status } = useSession();
  const [deals, setDeals] = useState<DealRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [sideFilter, setSideFilter] = useState("");

  useEffect(() => {
    if (status !== "authenticated") return;
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (sideFilter) params.set("side", sideFilter);
    const url = `/api/admin/p2p/deals${params.toString() ? `?${params}` : ""}`;
    setLoading(true);
    fetch(url)
      .then((r) => (r.ok ? r.json() : []))
      .then(setDeals)
      .catch(() => setDeals([]))
      .finally(() => setLoading(false));
  }, [status, statusFilter, sideFilter]);

  if (status !== "authenticated") return null;

  const statusLabel: Record<string, string> = {
    pending: "Ожидание оплаты",
    paid: "Оплачено",
    released: "Завершено",
    cancelled: "Отменено",
    disputed: "Диспут",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">P2P — все сделки</h1>
      <p className="text-gray-500 text-sm mb-4">
        Все сделки P2P (покупка и продажа). Сделки с ботом — для демо; в них можно открыть чат и завершить сделку от имени бота.
      </p>
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="text-gray-500 text-sm py-2 pr-2">Статус:</span>
        {STATUS_FILTERS.map(({ value, label }) => (
          <button
            key={value || "all"}
            type="button"
            onClick={() => setStatusFilter(value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              statusFilter === value
                ? "bg-primary text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
        <span className="text-gray-500 text-sm py-2 pr-2">Тип:</span>
        {SIDE_FILTERS.map(({ value, label }) => (
          <button
            key={value || "all"}
            type="button"
            onClick={() => setSideFilter(value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              sideFilter === value
                ? "bg-primary text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : deals.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center text-gray-500">
          Пока нет сделок. Они появятся, когда пользователи начнут открывать ордера по объявлениям из раздела P2P.
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500 border-b border-gray-200">
                  <th className="p-4 font-semibold">Сделка</th>
                  <th className="p-4 font-semibold">Тип</th>
                  <th className="p-4 font-semibold">Сумма</th>
                  <th className="p-4 font-semibold">Покупатель</th>
                  <th className="p-4 font-semibold">Продавец</th>
                  <th className="p-4 font-semibold">Статус</th>
                  <th className="p-4 font-semibold">Дата</th>
                  <th className="p-4 font-semibold text-right">Действие</th>
                </tr>
              </thead>
              <tbody>
                {deals.map((deal) => (
                  <tr key={deal.id} className="border-b border-gray-100 hover:bg-gray-50/80">
                    <td className="p-4 font-mono text-gray-700">#{deal.id.slice(0, 8)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${deal.side === "sell" ? "bg-emerald-100 text-emerald-800" : "bg-sky-100 text-sky-800"}`}>
                        {deal.side === "sell" ? "Продажа" : deal.side === "buy" ? "Покупка" : "—"}
                      </span>
                    </td>
                    <td className="p-4 font-medium tabular-nums">{deal.amount} {deal.currency}</td>
                    <td className="p-4 text-gray-600">{maskEmailForDisplay(deal.buyer.email)}</td>
                    <td className="p-4 text-gray-600">{maskEmailForDisplay(deal.seller.email)}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        deal.status === "pending" ? "bg-amber-100 text-amber-800" :
                        deal.status === "paid" ? "bg-blue-100 text-blue-800" :
                        deal.status === "released" ? "bg-green-100 text-green-800" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {statusLabel[deal.status] ?? deal.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500">{new Date(deal.createdAt).toLocaleString("ru-RU")}</td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/p2p/deal/${deal.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
                      >
                        Открыть сделку и чат
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
