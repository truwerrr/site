"use client";
import ExchangeWidget from "@/components/ExchangeWidget";
import { isAuthenticated } from "@/lib/auth";
import { mockTransactions } from "@/lib/userData";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function ExchangePage() {
  const [auth, setAuth] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setAuth(isAuthenticated());
  }, []);

  if (!mounted) return null;

  const exchangeHistory = mockTransactions.filter(t => t.type === 'exchange');

  return (
    <div className="container py-10">
      <h1 className="text-3xl md:text-4xl font-bold mb-6">Обмен</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Exchange Widget */}
        <div className="md:col-span-2">
          <ExchangeWidget />
        </div>

        {/* Info & History */}
        <div className="space-y-4">
          {auth && (
            <>
              <div className="rounded-xl border p-4 bg-white">
                <h2 className="font-semibold mb-3 text-sm">Последние обмены</h2>
                {exchangeHistory.length > 0 ? (
                  <div className="space-y-2">
                    {exchangeHistory.slice(0, 5).map((t) => (
                      <div key={t.id} className="p-2 rounded border text-xs">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">{t.currency}</span>
                          <span className={`px-2 py-1 rounded ${
                            t.status === 'completed' ? 'bg-green-100 text-green-700' :
                            t.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {t.status === 'completed' ? 'Завершено' : 'В обработке'}
                          </span>
                        </div>
                        <div className="text-muted-foreground">
                          {new Date(t.date).toLocaleString('ru-RU')}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    Нет истории обменов
                  </div>
                )}
              </div>

              <div className="rounded-xl border p-4 bg-white">
                <h2 className="font-semibold mb-3 text-sm">Сохранённые пары</h2>
                <div className="space-y-2">
                  <button className="w-full p-2 rounded border hover:bg-gray-50 text-left text-sm">
                    USDT → BTC
                  </button>
                  <button className="w-full p-2 rounded border hover:bg-gray-50 text-left text-sm">
                    KZT → USDT
                  </button>
                </div>
              </div>
            </>
          )}

          <div className="rounded-xl border p-4 bg-white">
            <h2 className="font-semibold mb-3 text-sm">Информация</h2>
            <div className="space-y-2 text-xs">
              <div>
                <div className="text-muted-foreground">Комиссия</div>
                <div className="font-medium">0.1%</div>
              </div>
              <div>
                <div className="text-muted-foreground">Минимальная сумма</div>
                <div className="font-medium">10 USDT</div>
              </div>
              <div>
                <div className="text-muted-foreground">Время обмена</div>
                <div className="font-medium">Мгновенно</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!auth && (
        <div className="mt-6 rounded-xl border p-6 bg-white">
          <p className="text-muted-foreground mb-4">
            <Link href="/sessions/signin" className="text-primary underline">
              Войдите
            </Link>
            , чтобы видеть историю обменов и использовать сохранённые пары.
          </p>
        </div>
      )}
    </div>
  );
}
