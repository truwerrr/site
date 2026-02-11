"use client";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { maskEmailForDisplay } from "@/lib/p2p-fake-bots";

type Ad = {
  id: string;
  side: string;
  currency: string;
  priceKZT: string;
  available: string;
  limitMin: string;
  limitMax: string;
  paymentMethods: string;
  user?: { email: string };
  isOwner?: boolean;
};

export default function P2PAdStartDealPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const id = params.id as string;
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [amount, setAmount] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sessions/signin");
      return;
    }
    if (status === "authenticated" && id) {
      fetch(`/api/p2p/ads/${id}`)
        .then((res) => {
          if (!res.ok) throw new Error("Not found");
          return res.json();
        })
        .then((data) => {
          if (data.isOwner) {
            router.replace("/p2p?tab=my-ads");
            return;
          }
          setAd(data);
          const methods = (() => {
            try {
              const arr = JSON.parse(data.paymentMethods || "[]") as string[];
              return Array.isArray(arr) ? arr : [];
            } catch {
              return [];
            }
          })();
          if (methods.length > 0 && !selectedPaymentMethod) setSelectedPaymentMethod(methods[0]);
        })
        .catch(() => setError("Объявление не найдено"))
        .finally(() => setLoading(false));
    }
  }, [status, id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const num = parseFloat(amount);
    if (!ad || !amount || isNaN(num) || num <= 0) {
      setError("Введите сумму");
      return;
    }
    const price = parseFloat(ad.priceKZT);
    const limitMinKZT = parseFloat(ad.limitMin);
    const limitMaxKZT = parseFloat(ad.limitMax);
    const avail = parseFloat(ad.available);
    const minUSDT = limitMinKZT / price;
    const maxUSDT = Math.min(avail, limitMaxKZT / price);
    if (num > avail) {
      setError(`Доступно: ${avail.toLocaleString()} ${ad.currency}`);
      return;
    }
    if (num < minUSDT || num > maxUSDT) {
      setError(`Сумма: от ${minUSDT.toLocaleString("ru-RU", { maximumFractionDigits: 2 })} до ${maxUSDT.toLocaleString("ru-RU", { maximumFractionDigits: 2 })} ${ad.currency} (лимиты в KZT: ${limitMinKZT.toLocaleString()} – ${limitMaxKZT.toLocaleString()})`);
      return;
    }
    setSubmitting(true);
    try {
      const methods = (() => {
        try {
          return JSON.parse(ad.paymentMethods || "[]") as string[];
        } catch {
          return [];
        }
      })();
      const paymentMethod = methods.length > 0 ? (methods.includes(selectedPaymentMethod) ? selectedPaymentMethod : methods[0]) : undefined;
      const res = await fetch("/api/p2p/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adId: ad.id, amount: amount, ...(paymentMethod && { selectedPaymentMethod: paymentMethod }) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Ошибка создания сделки");
        return;
      }
      router.push(`/p2p/deal/${data.id}`);
    } catch {
      setError("Ошибка сети");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="container py-16 flex justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error && !ad) {
    return (
      <div className="container py-16 text-center">
        <p className="text-gray-600 mb-4">{error}</p>
        <Link href="/p2p" className="text-primary font-semibold hover:underline">Вернуться в P2P</Link>
      </div>
    );
  }

  if (!ad) return null;

  const price = parseFloat(ad.priceKZT);
  const limitMinKZT = parseFloat(ad.limitMin);
  const limitMaxKZT = parseFloat(ad.limitMax);
  const avail = parseFloat(ad.available);
  const minUSDT = limitMinKZT / price;
  const maxUSDT = Math.min(avail, limitMaxKZT / price);
  const isBuy = ad.side === "buy";
  const inputClass = "w-full rounded-xl border border-gray-300 bg-white text-gray-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary";

  return (
    <div className="container py-8 max-w-lg">
      <Link href="/p2p" className="text-sm font-semibold text-primary hover:underline mb-4 inline-block">
        ← Назад к объявлениям
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        {isBuy ? `Купить ${ad.currency}` : `Продать ${ad.currency}`}
      </h1>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg mb-6">
        {ad.user?.email && (
          <div className="mb-4 pb-4 border-b border-gray-100">
            <div className="font-semibold text-gray-900">{ad.user.email.split("@")[0]}</div>
            <div className="text-[10px] text-gray-400 mt-0.5">{maskEmailForDisplay(ad.user.email)}</div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
          <span className="text-gray-500">Цена</span>
          <span className="font-semibold">{parseFloat(ad.priceKZT).toLocaleString()} KZT</span>
          <span className="text-gray-500">Доступно</span>
          <span className="font-semibold">{avail.toLocaleString()} {ad.currency}</span>
          <span className="text-gray-500">Лимит</span>
          <span className="font-semibold">{limitMinKZT.toLocaleString()} – {limitMaxKZT.toLocaleString()} KZT</span>
        </div>
        <form onSubmit={handleSubmit}>
          {(() => {
            const methods = (() => {
              try {
                return JSON.parse(ad.paymentMethods || "[]") as string[];
              } catch {
                return [];
              }
            })();
            if (methods.length > 0) {
              return (
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Способ оплаты
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {methods.map((m: string) => (
                      <label key={m} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={m}
                          checked={selectedPaymentMethod === m}
                          onChange={() => setSelectedPaymentMethod(m)}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm font-medium text-gray-900">{m}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            }
            return null;
          })()}
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Сумма ({ad.currency})
          </label>
          <input
            type="number"
            step="any"
            min={minUSDT}
            max={maxUSDT}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`${minUSDT.toLocaleString("ru-RU", { maximumFractionDigits: 2 })} – ${maxUSDT.toLocaleString("ru-RU", { maximumFractionDigits: 2 })}`}
            className={inputClass}
          />
          {amount && !isNaN(parseFloat(amount)) && (
            <p className="mt-2 text-sm text-gray-500">
              К оплате: {(parseFloat(amount) * parseFloat(ad.priceKZT)).toLocaleString()} KZT
            </p>
          )}
          {error && <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
          <button
            type="submit"
            disabled={submitting}
            className="mt-4 w-full py-3.5 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 disabled:opacity-50"
          >
            {submitting ? "Создание..." : "Перейти к сделке"}
          </button>
        </form>
      </div>
    </div>
  );
}
