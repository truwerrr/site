"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

const PAYMENT_OPTIONS = ["Kaspi Bank", "Home Credit Bank", "Банк ЦентрКредит (KZ)", "Freedom Bank", "Bank Transfer"];
const CURRENCIES = ["USDT", "BTC", "ETH"];

export default function P2PCreatePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [side, setSide] = useState<"buy" | "sell">("sell");
  const [currency, setCurrency] = useState("USDT");
  const [priceKZT, setPriceKZT] = useState("");
  const [available, setAvailable] = useState("");
  const [limitMin, setLimitMin] = useState("");
  const [limitMax, setLimitMax] = useState("");
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [requisitesByMethod, setRequisitesByMethod] = useState<Record<string, { accountName: string; accountNumber: string; bankName: string; comment: string }>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "authenticated") return;
    if (status === "unauthenticated") router.push("/sessions/signin");
  }, [status, router]);

  const togglePayment = (name: string) => {
    setPaymentMethods((prev) => {
      const next = prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name];
      setRequisitesByMethod((r) => {
        const out = { ...r };
        if (!next.includes(name)) delete out[name];
        else if (!out[name]) out[name] = { accountName: "", accountNumber: "", bankName: name, comment: "" };
        return out;
      });
      return next;
    });
  };

  const setRequisite = (method: string, field: string, value: string) => {
    setRequisitesByMethod((prev) => ({
      ...prev,
      [method]: { ...(prev[method] ?? { accountName: "", accountNumber: "", bankName: method, comment: "" }), [field]: value },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!priceKZT || !available || !limitMin || !limitMax || paymentMethods.length === 0) {
      setError("Заполните все поля и выберите минимум один способ оплаты");
      return;
    }
    if (parseFloat(limitMin) >= parseFloat(limitMax)) {
      setError("Макс. лимит должен быть больше мин.");
      return;
    }
    const paymentRequisites = paymentMethods.map((m) => {
      const r = requisitesByMethod[m] ?? { accountName: "", accountNumber: "", bankName: m, comment: "" };
      if (!r.accountName?.trim() || !r.accountNumber?.trim()) {
        setError(`Заполните реквизиты для способа «${m}»: получатель и счёт/карта`);
        return null;
      }
      return { method: m, accountName: r.accountName.trim(), accountNumber: r.accountNumber.trim(), bankName: r.bankName?.trim() || m, comment: r.comment?.trim() || undefined };
    });
    if (paymentRequisites.some((x) => x === null)) return;
    setLoading(true);
    try {
      const res = await fetch("/api/p2p/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          side,
          currency,
          priceKZT,
          available,
          limitMin,
          limitMax,
          paymentMethods,
          paymentRequisites: paymentRequisites.filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Ошибка создания");
        return;
      }
      router.push("/p2p?tab=my-ads");
    } catch {
      setError("Ошибка сети");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || !session) {
    return (
      <div className="container py-16 flex justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const inputClass = "w-full rounded-xl border border-gray-300 bg-white text-gray-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary";
  const labelClass = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2";

  return (
    <div className="container py-8 max-w-2xl">
      <header className="mb-6">
        <Link href="/p2p" className="text-sm font-semibold text-primary hover:underline mb-2 inline-block">
          ← Назад к P2P
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Создать объявление</h1>
        <p className="text-gray-500 text-sm mt-1">Укажите условия обмена</p>
      </header>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg space-y-5">
        <div>
          <span className={labelClass}>Тип</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSide("sell")}
              className={`flex-1 py-2.5 rounded-xl font-semibold text-sm ${side === "sell" ? "bg-primary text-white" : "border border-gray-300 bg-white hover:bg-gray-50"}`}
            >
              Продажа
            </button>
            <button
              type="button"
              onClick={() => setSide("buy")}
              className={`flex-1 py-2.5 rounded-xl font-semibold text-sm ${side === "buy" ? "bg-primary text-white" : "border border-gray-300 bg-white hover:bg-gray-50"}`}
            >
              Покупка
            </button>
          </div>
        </div>

        <div>
          <label className={labelClass}>Валюта</label>
          <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={inputClass}>
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Цена (KZT за 1 {currency})</label>
          <input type="number" step="any" min="0" value={priceKZT} onChange={(e) => setPriceKZT(e.target.value)} className={inputClass} placeholder="505" />
        </div>

        <div>
          <label className={labelClass}>Доступно ({currency})</label>
          <input type="number" step="any" min="0" value={available} onChange={(e) => setAvailable(e.target.value)} className={inputClass} placeholder="0" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Мин. лимит (KZT)</label>
            <input type="number" step="any" min="0" value={limitMin} onChange={(e) => setLimitMin(e.target.value)} className={inputClass} placeholder="10000" />
          </div>
          <div>
            <label className={labelClass}>Макс. лимит (KZT)</label>
            <input type="number" step="any" min="0" value={limitMax} onChange={(e) => setLimitMax(e.target.value)} className={inputClass} placeholder="500000" />
          </div>
        </div>

        <div>
          <span className={labelClass}>Способы оплаты</span>
          <div className="flex flex-wrap gap-2">
            {PAYMENT_OPTIONS.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => togglePayment(name)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  paymentMethods.includes(name) ? "bg-primary text-white" : "border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        {paymentMethods.length > 0 && (
          <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 space-y-4">
            <span className={labelClass}>Реквизиты для получения оплаты</span>
            <p className="text-xs text-gray-500 mb-3">Укажите данные для каждого выбранного способа. Покупатель увидит их в сделке.</p>
            {paymentMethods.map((method) => {
              const r = requisitesByMethod[method] ?? { accountName: "", accountNumber: "", bankName: method, comment: "" };
              return (
                <div key={method} className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
                  <div className="font-medium text-gray-900">{method}</div>
                  <div>
                    <label className="text-xs text-gray-500">Получатель (ФИО или имя)</label>
                    <input type="text" value={r.accountName} onChange={(e) => setRequisite(method, "accountName", e.target.value)} className={inputClass} placeholder="Иван Иванов" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Счёт или номер карты</label>
                    <input type="text" value={r.accountNumber} onChange={(e) => setRequisite(method, "accountNumber", e.target.value)} className={inputClass} placeholder="KZ123... или 4400..." />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Банк (необязательно)</label>
                    <input type="text" value={r.bankName} onChange={(e) => setRequisite(method, "bankName", e.target.value)} className={inputClass} placeholder={method} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Комментарий к переводу (необязательно)</label>
                    <input type="text" value={r.comment} onChange={(e) => setRequisite(method, "comment", e.target.value)} className={inputClass} placeholder="Напр.: укажите номер заказа" />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {error && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}

        <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 disabled:opacity-50">
          {loading ? "Создание..." : "Создать объявление"}
        </button>
      </form>
    </div>
  );
}
