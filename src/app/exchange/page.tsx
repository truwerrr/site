"use client";
import ExchangeWidget from "@/components/ExchangeWidget";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

interface ExchangeTransaction {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  fromAmount: string;
  toAmount: string;
  rate: string;
  status: string;
  timestamp: string;
}

type BalanceRow = { currency: string; available: string; locked: string };

function formatBalance(currency: string, total: number): string {
  if (currency === "KZT" || currency === "USDT") return total.toLocaleString("ru", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 });
}

export default function ExchangePage() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [history, setHistory] = useState<ExchangeTransaction[]>([]);
  const [balances, setBalances] = useState<BalanceRow[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/balances")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => (Array.isArray(data) ? setBalances(data) : null))
      .catch(() => {});
  }, [status]);

  const nonZeroBalances = balances.filter((b) => {
    const total = parseFloat(b.available || "0") + parseFloat(b.locked || "0");
    return total > 0;
  });

  if (!mounted) {
    return (
      <div className="container py-16 flex flex-col items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="mt-4 text-gray-500 font-medium">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-5xl mx-auto px-4">
      <header className="mb-6 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-2">Обмен</h1>
        <p className="text-gray-500 text-lg">Мгновенный обмен криптовалют</p>
        <div className="mt-4 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent max-w-xs mx-auto" />
      </header>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex justify-center lg:justify-start">
          <ExchangeWidget />
        </div>

        <div className="space-y-4">
          {status === "authenticated" && (
            <>
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg shadow-gray-200/40">
                <h2 className="font-bold text-lg text-gray-900 mb-4">Доступно для обмена</h2>
                {nonZeroBalances.length > 0 ? (
                  <div className="space-y-2">
                    {nonZeroBalances.map((b) => {
                      const total = parseFloat(b.available || "0") + parseFloat(b.locked || "0");
                      return (
                        <div key={b.currency} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                          <span className="font-semibold text-gray-900">{b.currency}</span>
                          <span className="font-mono text-sm tabular-nums text-gray-800">{formatBalance(b.currency, total)}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 text-sm text-gray-500">Нет доступного баланса</div>
                )}
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg shadow-gray-200/40">
                <h2 className="font-bold text-lg text-gray-900 mb-4">Последние обмены</h2>
                {history.length > 0 ? (
                  <div className="space-y-3">
                    {history.slice(0, 5).map((t) => (
                      <div key={t.id} className="p-4 rounded-xl border border-gray-200 hover:bg-gray-50/50 transition-colors">
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-semibold text-sm text-gray-900">
                            {t.fromAmount} {t.fromCurrency} → {t.toAmount} {t.toCurrency}
                          </div>
                          <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                            t.status === 'completed' ? 'bg-green-100 text-green-800' :
                            t.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {t.status === 'completed' ? 'Завершено' : t.status === 'pending' ? 'В обработке' : 'Ошибка'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">{new Date(t.timestamp).toLocaleString('ru-RU')}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3 text-2xl">💱</div>
                    <div className="text-sm font-medium text-gray-600">Нет истории обменов</div>
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg shadow-gray-200/40">
                <h2 className="font-bold text-lg text-gray-900 mb-4">Сохранённые пары</h2>
                <div className="space-y-2">
                  <button className="w-full p-4 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-left transition-colors">
                    <div className="font-semibold text-sm text-gray-900">USDT → BTC</div>
                    <div className="text-xs text-gray-500 mt-1">Курс: 0.00001425</div>
                  </button>
                  <button className="w-full p-4 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-left transition-colors">
                    <div className="font-semibold text-sm text-gray-900">KZT → USDT</div>
                    <div className="text-xs text-gray-500 mt-1">Курс: 505</div>
                  </button>
                </div>
              </div>
            </>
          )}

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg shadow-gray-200/40">
            <h2 className="font-bold text-lg text-gray-900 mb-4">Информация</h2>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Комиссия</div>
                <div className="font-bold text-xl text-gray-900">0.1%</div>
                <div className="text-xs text-gray-500 mt-1">Мин. комиссия: 0.1 USDT</div>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Мин. сумма</div>
                <div className="font-bold text-gray-900">10 USDT</div>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Время</div>
                <div className="font-semibold text-gray-900">Мгновенно</div>
              </div>
              <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200/80">
                <div className="font-semibold text-gray-900 mb-1">Важно</div>
                <div className="text-sm text-gray-700">Курсы в реальном времени. Финальная сумма может незначительно отличаться.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {status !== "authenticated" && (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-8 shadow-lg text-center">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4 text-2xl">🔐</div>
          <p className="text-gray-600">
            <Link href="/sessions/signin" className="text-primary font-semibold hover:underline">
              Войдите
            </Link>
            , чтобы видеть историю обменов и сохранённые пары.
          </p>
        </div>
      )}
    </div>
  );
}
