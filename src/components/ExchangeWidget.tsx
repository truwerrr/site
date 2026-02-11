"use client";
import { useMemo, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

const FALLBACK_RATES: Record<string, Partial<Record<string, number>>> = {
  KZT: { USDT: 505, BTC: 32700000, ETH: 1085000 },
  USDT: { KZT: 505, BTC: 0.00001425, ETH: 0.000464 },
  BTC: { KZT: 32700000, USDT: 70184, ETH: 32.5 },
  ETH: { KZT: 1085000, BTC: 0.0308, USDT: 2153.43 },
};

const options = [
  { code: "KZT", name: "Tenge", icon: "https://ext.same-assets.com/1411108151/2193445507.svg" },
  { code: "BTC", name: "Bitcoin", icon: "https://ext.same-assets.com/1411108151/2831370402.svg" },
  { code: "USDT", name: "Tether", icon: "https://ext.same-assets.com/1411108151/3376435874.svg" },
  { code: "ETH", name: "Ethereum", icon: "https://ext.same-assets.com/1411108151/1694252569.svg" },
] as const;

export default function ExchangeWidget() {
  const { data: session } = useSession();
  const [from, setFrom] = useState<"KZT" | "BTC" | "USDT" | "ETH">("KZT");
  const [to, setTo] = useState<"KZT" | "BTC" | "USDT" | "ETH">("USDT");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [rates, setRates] = useState<Record<string, Partial<Record<string, number>>>>(FALLBACK_RATES);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/rates")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data && typeof data === "object") setRates(data);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const result = useMemo(() => {
    if (from === to) return parseFloat(amount) || 0;
    if (!amount || parseFloat(amount) === 0) return 0;
    const r = rates[from]?.[to];
    if (!r) return 0;
    const amountNum = parseFloat(amount);
    if (from === "KZT") return amountNum / r;
    if (to === "KZT") return amountNum * r;
    return amountNum * r;
  }, [amount, from, to, rates]);

  const fee = useMemo(() => {
    if (!amount || parseFloat(amount) === 0) return 0;
    return result * 0.001;
  }, [result, amount]);

  const handleSwap = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
    setAmount("");
  };

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(false), 4000);
    return () => clearTimeout(t);
  }, [success]);

  const handleExchange = async () => {
    if (!session) {
      setError("Войдите, чтобы выполнить обмен");
      return;
    }
    if (from === to) {
      setError("Выберите разные валюты");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError("Введите сумму");
      return;
    }
    setError("");
    setSuccess(false);
    setLoading(true);
    try {
      const res = await fetch("/api/exchange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from, to, amount }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Ошибка обмена");
        return;
      }
      setSuccess(true);
      setAmount("");
    } catch {
      setError("Ошибка сети");
    } finally {
      setLoading(false);
    }
  };

  const formatResult = () => {
    if (result === 0) return "0.00000000";
    if (to === "BTC" || to === "ETH") {
      return result.toFixed(8);
    }
    return result.toFixed(2);
  };

  const currencySelectClass =
    "w-24 sm:w-28 rounded-xl border border-gray-200 bg-gray-100 text-gray-900 px-4 py-3 text-sm font-semibold cursor-pointer appearance-none focus:outline-none focus:ring-2 focus:ring-[#edb419]/50 focus:border-[#edb419]";
  const inputClass =
    "flex-1 min-w-0 rounded-xl border-2 border-gray-200 bg-white text-gray-900 px-4 py-3 text-sm font-bold tabular-nums focus:outline-none focus:border-[#edb419] focus:ring-2 focus:ring-[#edb419]/20 transition-colors";

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-lg shadow-gray-200/40 p-6 sm:p-8 max-w-lg mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-1">Быстрый обмен</h2>
        <p className="text-gray-500 text-sm sm:text-base">Мгновенный обмен криптовалют</p>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">ОТДАЮ</label>
          <div className="flex gap-3">
            <select
              className={currencySelectClass}
              value={from}
              onChange={(e) => setFrom(e.target.value as typeof from)}
            >
              {options.map((o) => (
                <option key={o.code} value={o.code}>{o.code}</option>
              ))}
            </select>
            <input
              type="number"
              step="any"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={inputClass}
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="flex justify-center -my-1 relative z-10">
          <button
            onClick={handleSwap}
            className="w-12 h-12 rounded-full bg-[#21d1b8] text-white flex items-center justify-center transition-all hover:opacity-90 active:scale-95 shadow-md touch-manipulation border-0"
            aria-label="Поменять местами"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5V19M12 5L8 9M12 5L16 9M12 19L8 15M12 19L16 15" />
            </svg>
          </button>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">ПОЛУЧАЮ</label>
          <div className="flex gap-3">
            <select
              className={currencySelectClass}
              value={to}
              onChange={(e) => setTo(e.target.value as typeof to)}
            >
              {options.map((o) => (
                <option key={o.code} value={o.code}>{o.code}</option>
              ))}
            </select>
            <input
              type="text"
              value={formatResult()}
              readOnly
              className={`flex-1 min-w-0 rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-900 px-4 py-3 text-sm font-bold tabular-nums`}
            />
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-3">
            Обмен выполнен успешно
          </div>
        )}
        {session ? (
          <button
            onClick={handleExchange}
            disabled={loading || !amount || parseFloat(amount) <= 0}
            className="w-full py-4 rounded-xl bg-[#21d1b8] text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-base shadow-md transition-all touch-manipulation border-0"
          >
            {loading ? "Обмен..." : "Обменять"}
          </button>
        ) : (
          <Link
            href="/sessions/signin"
            className="block w-full py-4 rounded-xl bg-[#21d1b8] text-white hover:opacity-90 font-bold text-center shadow-md transition-all border-0"
          >
            Войти для обмена
          </Link>
        )}

        <div className="flex items-center gap-2 pt-1 text-gray-500">
          <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
          </span>
          <p className="text-xs text-gray-500">
            Курсы обновляются в реальном времени. Комиссия: 0.1%
          </p>
        </div>
      </div>
    </div>
  );
}
