"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function FeesPage() {
  const { data: session, status } = useSession();
  const [userVolume, setUserVolume] = useState<number | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      // Fetch user trading volume
      fetch("/api/statistics")
        .then((res) => res.json())
        .then((data) => {
          if (data.totalVolume) {
            setUserVolume(data.totalVolume);
          }
        })
        .catch(() => {});
    }
  }, [status]);

  const tiers = [
    { volume: "< 100,000 USDT", volumeNum: 0, maker: "0.28%", taker: "0.38%", deposit: "0%", withdraw: "0% - 0.5%" },
    { volume: "100,000 - 1,000,000 USDT", volumeNum: 100000, maker: "0.24%", taker: "0.34%", deposit: "0%", withdraw: "0% - 0.5%" },
    { volume: "1,000,000 - 50,000,000 USDT", volumeNum: 1000000, maker: "0.20%", taker: "0.30%", deposit: "0%", withdraw: "0% - 0.5%" },
    { volume: "50,000,000 - 100,000,000 USDT", volumeNum: 50000000, maker: "0.16%", taker: "0.26%", deposit: "0%", withdraw: "0% - 0.5%" },
    { volume: "100,000,000 - 500,000,000 USDT", volumeNum: 100000000, maker: "0.12%", taker: "0.22%", deposit: "0%", withdraw: "0% - 0.5%" },
    { volume: "≥ 500,000,000 USDT", volumeNum: 500000000, maker: "0%", taker: "0.20%", deposit: "0%", withdraw: "0% - 0.5%" },
  ];

  const getUserTier = () => {
    if (userVolume === null) return null;
    for (let i = tiers.length - 1; i >= 0; i--) {
      if (userVolume >= tiers[i].volumeNum) {
        return i;
      }
    }
    return 0;
  };

  const userTier = getUserTier();

  return (
    <div className="container py-6">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900">Комиссии</h1>
        <p className="text-gray-600 max-w-prose">
          Прозрачная система комиссий. Чем больше вы торгуете, тем ниже комиссии.
        </p>
      </div>

      {status === "authenticated" && userVolume !== null && (
        <div className="mb-6 rounded-xl border bg-gradient-to-br from-primary/10 to-primary/5 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">Ваш объём торговли (30 дней)</div>
              <div className="text-2xl font-bold text-gray-900">{userVolume.toLocaleString()} USDT</div>
            </div>
            {userTier !== null && (
              <div className="text-right">
                <div className="text-sm text-gray-600 mb-1">Ваш уровень</div>
                <div className="text-2xl font-bold text-primary">{userTier + 1}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Maker: {tiers[userTier].maker} | Taker: {tiers[userTier].taker}
                </div>
              </div>
            )}
          </div>
          {userTier !== null && userTier < tiers.length - 1 && (
            <div className="pt-4 border-t">
              <div className="text-sm text-gray-700 mb-2">
                До следующего уровня осталось:{" "}
                <span className="font-semibold text-gray-900">
                  {(tiers[userTier + 1].volumeNum - userVolume).toLocaleString()} USDT
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (userVolume / tiers[userTier + 1].volumeNum) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="rounded-xl border bg-gradient-to-br from-blue-50 to-blue-100 p-6 shadow-sm">
          <div className="text-sm text-gray-600 mb-1">Торговые комиссии</div>
          <div className="text-3xl font-bold text-gray-900">От 0%</div>
          <div className="text-xs text-gray-500 mt-2">В зависимости от объёма торговли</div>
        </div>
        <div className="rounded-xl border bg-gradient-to-br from-green-50 to-green-100 p-6 shadow-sm">
          <div className="text-sm text-gray-600 mb-1">Пополнение</div>
          <div className="text-3xl font-bold text-gray-900">0%</div>
          <div className="text-xs text-gray-500 mt-2">Без комиссии за пополнение</div>
        </div>
        <div className="rounded-xl border bg-gradient-to-br from-purple-50 to-purple-100 p-6 shadow-sm">
          <div className="text-sm text-gray-600 mb-1">Вывод</div>
          <div className="text-3xl font-bold text-gray-900">0% - 0.5%</div>
          <div className="text-xs text-gray-500 mt-2">Зависит от валюты и сети</div>
        </div>
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden mb-8">
        <div className="p-4 md:p-6 border-b bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900">Таблица комиссий за торговлю</h2>
          <p className="text-sm text-gray-600 mt-1">Комиссии рассчитываются на основе объёма торговли за последние 30 дней</p>
        </div>
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-gray-700">Объём (30 дней)</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-700">Maker</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-700">Taker</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-700">Пополнение</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-700">Вывод</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {tiers.map((t, i) => {
                const isUserTier = userTier === i;
                return (
                  <tr
                    key={i}
                    className={`hover:bg-gray-50 transition-colors ${
                      isUserTier ? "bg-primary/5 border-l-4 border-l-primary" : ""
                    }`}
                  >
                    <td className="p-4 font-medium text-gray-900">
                      {t.volume}
                      {isUserTier && (
                        <span className="ml-2 px-2 py-0.5 rounded bg-primary text-white text-xs font-semibold">
                          Ваш уровень
                        </span>
                      )}
                    </td>
                    <td className={`p-4 ${t.maker === "0%" ? "text-green-600 font-semibold" : "text-gray-700"}`}>
                      {t.maker}
                    </td>
                    <td className="p-4 text-gray-700">{t.taker}</td>
                    <td className="p-4 text-green-600 font-semibold">{t.deposit}</td>
                    <td className="p-4 text-gray-700">{t.withdraw}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* Mobile Cards */}
        <div className="md:hidden divide-y">
          {tiers.map((t, i) => {
            const isUserTier = userTier === i;
            return (
              <div
                key={i}
                className={`p-4 ${isUserTier ? "bg-primary/5 border-l-4 border-l-primary" : ""}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 mb-1">{t.volume}</div>
                    {isUserTier && (
                      <span className="inline-block px-2 py-0.5 rounded bg-primary text-white text-xs font-semibold">
                        Ваш уровень
                      </span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Maker</div>
                    <div className={`font-semibold ${t.maker === "0%" ? "text-green-600" : "text-gray-900"}`}>
                      {t.maker}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Taker</div>
                    <div className="font-semibold text-gray-900">{t.taker}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Пополнение</div>
                    <div className="font-semibold text-green-600">{t.deposit}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Вывод</div>
                    <div className="font-semibold text-gray-900">{t.withdraw}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Как рассчитываются комиссии?</h2>
          <div className="space-y-4 text-gray-700">
            <div>
              <div className="font-semibold mb-1 text-gray-900">Maker комиссия</div>
              <div className="text-sm">
                Взимается с ордеров, которые добавляют ликвидность в стакан (лимитные ордера, которые не исполняются сразу).
                Чем больше вы добавляете ликвидности, тем ниже комиссия.
              </div>
            </div>
            <div>
              <div className="font-semibold mb-1 text-gray-900">Taker комиссия</div>
              <div className="text-sm">
                Взимается с ордеров, которые забирают ликвидность из стакана (рыночные ордера и лимитные, которые исполняются сразу).
                Обычно выше, чем Maker комиссия.
              </div>
            </div>
            <div>
              <div className="font-semibold mb-1 text-gray-900">Объём торговли</div>
              <div className="text-sm">
                Рассчитывается на основе суммы всех сделок за последние 30 дней. Уровень комиссии обновляется ежедневно в 00:00 UTC.
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Дополнительная информация</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex items-start gap-2">
              <span className="mt-1.5 inline-block h-2 w-2 rounded-full bg-primary flex-shrink-0" />
              <span>Комиссии списываются автоматически при исполнении ордеров</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-1.5 inline-block h-2 w-2 rounded-full bg-primary flex-shrink-0" />
              <span>Комиссия за вывод зависит от выбранной криптовалюты и сети блокчейна</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-1.5 inline-block h-2 w-2 rounded-full bg-primary flex-shrink-0" />
              <span>Пополнение через банки Казахстана всегда бесплатно</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-1.5 inline-block h-2 w-2 rounded-full bg-primary flex-shrink-0" />
              <span>VIP-клиенты могут получить индивидуальные условия</span>
            </div>
          </div>
        </div>
      </div>

      {status !== "authenticated" && (
        <div className="rounded-xl border bg-gradient-to-br from-primary/10 to-primary/5 p-6 text-center">
          <h2 className="text-xl font-bold mb-3 text-gray-900">Начните торговать</h2>
          <p className="text-gray-700 mb-4">
            Зарегистрируйтесь и получите доступ к лучшим условиям торговли
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/sessions/signup"
              className="px-6 py-3 rounded-lg bg-primary text-white hover:opacity-90 font-semibold"
            >
              Зарегистрироваться
            </Link>
            <Link
              href="/sessions/signin"
              className="px-6 py-3 rounded-lg border-2 border-primary text-primary hover:bg-primary hover:text-white font-semibold"
            >
              Войти
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
