"use client";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

const PAYMENT_OPTIONS = ["Kaspi Bank", "Home Credit Bank", "Банк ЦентрКредит (KZ)", "Freedom Bank", "Bank Transfer"];

export default function P2PEditPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [priceKZT, setPriceKZT] = useState("");
  const [available, setAvailable] = useState("");
  const [limitMin, setLimitMin] = useState("");
  const [limitMax, setLimitMax] = useState("");
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [requisitesByMethod, setRequisitesByMethod] = useState<Record<string, { accountName: string; accountNumber: string; bankName: string; comment: string }>>({});
  const [isActive, setIsActive] = useState(true);

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
        .then((ad) => {
          if (!ad.isOwner) {
            router.replace("/p2p?tab=my-ads");
            return;
          }
          setPriceKZT(ad.priceKZT || "");
          setAvailable(ad.available || "");
          setLimitMin(ad.limitMin || "");
          setLimitMax(ad.limitMax || "");
          try {
            setPaymentMethods(JSON.parse(ad.paymentMethods || "[]"));
          } catch {
            setPaymentMethods([]);
          }
          let reqs: Record<string, { accountName: string; accountNumber: string; bankName: string; comment: string }> = {};
          try {
            const raw = ad.paymentRequisites;
            const arr = typeof raw === "string" ? JSON.parse(raw || "[]") : raw;
            if (Array.isArray(arr)) {
              arr.forEach((r: { method?: string; accountName?: string; accountNumber?: string; bankName?: string; comment?: string }) => {
                if (r?.method) reqs[r.method] = { accountName: r.accountName ?? "", accountNumber: r.accountNumber ?? "", bankName: r.bankName ?? r.method, comment: r.comment ?? "" };
              });
            }
          } catch {
            // ignore
          }
          setRequisitesByMethod(reqs);
          setIsActive(ad.isActive ?? true);
        })
        .catch(() => setError("Объявление не найдено"))
        .finally(() => setLoading(false));
    }
  }, [status, id, router]);

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
    const paymentRequisites = paymentMethods.map((m) => {
      const r = requisitesByMethod[m] ?? { accountName: "", accountNumber: "", bankName: m, comment: "" };
      if (!r.accountName?.trim() || !r.accountNumber?.trim()) {
        setError(`Заполните реквизиты для способа «${m}»: получатель и счёт/карта`);
        return null;
      }
      return { method: m, accountName: r.accountName.trim(), accountNumber: r.accountNumber.trim(), bankName: r.bankName?.trim() || m, comment: r.comment?.trim() || undefined };
    });
    if (paymentRequisites.some((x) => x === null)) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/p2p/ads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceKZT,
          available,
          limitMin,
          limitMax,
          paymentMethods,
          paymentRequisites: paymentRequisites.filter(Boolean),
          isActive,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Ошибка сохранения");
        return;
      }
      router.push("/p2p?tab=my-ads");
    } catch {
      setError("Ошибка сети");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="container py-16 flex justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error && !priceKZT && !available) {
    return (
      <div className="container py-16 text-center">
        <p className="text-gray-600 mb-4">{error}</p>
        <Link href="/p2p" className="text-primary font-semibold hover:underline">Вернуться в P2P</Link>
      </div>
    );
  }

  const inputClass = "w-full rounded-xl border border-gray-300 bg-white text-gray-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary";
  const labelClass = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2";

  return (
    <div className="container py-8 max-w-2xl">
      <Link href="/p2p?tab=my-ads" className="text-sm font-semibold text-primary hover:underline mb-4 inline-block">
        ← Назад к объявлениям
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Редактировать объявление</h1>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg space-y-5">
        <div>
          <label className={labelClass}>Цена (KZT)</label>
          <input type="number" step="any" min="0" value={priceKZT} onChange={(e) => setPriceKZT(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Доступно</label>
          <input type="number" step="any" min="0" value={available} onChange={(e) => setAvailable(e.target.value)} className={inputClass} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Мин. лимит (KZT)</label>
            <input type="number" step="any" min="0" value={limitMin} onChange={(e) => setLimitMin(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Макс. лимит (KZT)</label>
            <input type="number" step="any" min="0" value={limitMax} onChange={(e) => setLimitMax(e.target.value)} className={inputClass} />
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
                className={`px-4 py-2 rounded-xl text-sm font-medium ${
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
            {paymentMethods.map((method) => {
              const r = requisitesByMethod[method] ?? { accountName: "", accountNumber: "", bankName: method, comment: "" };
              return (
                <div key={method} className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
                  <div className="font-medium text-gray-900">{method}</div>
                  <div>
                    <label className="text-xs text-gray-500">Получатель</label>
                    <input type="text" value={r.accountName} onChange={(e) => setRequisite(method, "accountName", e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Счёт или карта</label>
                    <input type="text" value={r.accountNumber} onChange={(e) => setRequisite(method, "accountNumber", e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Банк (необязательно)</label>
                    <input type="text" value={r.bankName} onChange={(e) => setRequisite(method, "bankName", e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Комментарий к переводу</label>
                    <input type="text" value={r.comment} onChange={(e) => setRequisite(method, "comment", e.target.value)} className={inputClass} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded border-gray-300 text-primary focus:ring-primary/40" />
          <span className="text-sm font-medium">Объявление активно</span>
        </label>
        {error && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
        <button type="submit" disabled={saving} className="w-full py-3.5 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 disabled:opacity-50">
          {saving ? "Сохранение..." : "Сохранить"}
        </button>
      </form>
    </div>
  );
}
