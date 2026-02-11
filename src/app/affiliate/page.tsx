"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AffiliatePage() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="container py-10">
        <div className="text-center">Загрузка...</div>
      </div>
    );
  }

  const referrals = [
    { id: '1', username: 'user_001', date: '2024-12-15', trades: 25, volume: 5000, earnings: 25 },
    { id: '2', username: 'user_002', date: '2024-12-10', trades: 45, volume: 12000, earnings: 60 },
    { id: '3', username: 'user_003', date: '2024-12-05', trades: 12, volume: 3000, earnings: 15 },
  ];

  const totalReferrals = referrals.length;
  const totalEarnings = referrals.reduce((sum, r) => sum + r.earnings, 0);
  const totalVolume = referrals.reduce((sum, r) => sum + r.volume, 0);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://ataix-p.kz";
  const referralLink = `${baseUrl}/ref/${session?.user?.id || "user"}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (status !== "authenticated") {
    return (
      <div className="container py-6">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900">Партнёрская программа</h1>
          <p className="text-gray-600 max-w-prose">
            Приглашайте друзей и получайте вознаграждение за каждого приглашённого пользователя.
          </p>
        </div>
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="font-semibold text-lg mb-4">Как это работает</h2>
              <ul className="text-sm space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs mt-0.5">1</div>
                  <span>Получите уникальную реферальную ссылку</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs mt-0.5">2</div>
                  <span>Поделитесь ссылкой с друзьями</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs mt-0.5">3</div>
                  <span>Получайте комиссию с их торговых операций</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs mt-0.5">4</div>
                  <span>Выводите заработанные средства</span>
                </li>
              </ul>
            </div>
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="font-semibold text-lg mb-4">Преимущества</h2>
              <ul className="text-sm space-y-2 text-gray-700">
                {[
                  'Прозрачная система выплат',
                  'Регулярные выплаты',
                  'Отслеживание статистики',
                  'Поддержка партнёров 24/7',
                  'Нет ограничений на количество рефералов',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1.5 inline-block h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="rounded-xl border bg-gradient-to-br from-primary/10 to-primary/5 p-8 text-center">
            <div className="text-4xl mb-4">🤝</div>
            <p className="text-gray-700 mb-4">
              <Link href="/sessions/signin" className="text-primary font-semibold underline">
                Войдите
              </Link>
              , чтобы начать зарабатывать.
            </p>
            <Link href="/sessions/signin" className="inline-block px-6 py-3 rounded-lg bg-primary text-white hover:opacity-90 font-semibold">
              Войти в аккаунт
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900">Партнёрская программа</h1>
        <p className="text-gray-600 max-w-prose">
          Приглашайте друзей и получайте 0.5% комиссии с каждой их сделки
        </p>
      </div>

      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div className="rounded-xl border bg-gradient-to-br from-blue-50 to-blue-100 p-4 md:p-6 shadow-sm">
            <div className="text-xs md:text-sm text-gray-600 mb-1">Приглашено</div>
            <div className="text-2xl md:text-3xl font-bold text-gray-900">{totalReferrals}</div>
            <div className="text-xs text-gray-500 mt-1 md:mt-2">пользователей</div>
          </div>
          <div className="rounded-xl border bg-gradient-to-br from-green-50 to-green-100 p-4 md:p-6 shadow-sm">
            <div className="text-xs md:text-sm text-gray-600 mb-1">Заработано</div>
            <div className="text-2xl md:text-3xl font-bold text-gray-900">{totalEarnings} USDT</div>
            <div className="text-xs text-gray-500 mt-1 md:mt-2">всего</div>
          </div>
          <div className="rounded-xl border bg-gradient-to-br from-purple-50 to-purple-100 p-4 md:p-6 shadow-sm">
            <div className="text-xs md:text-sm text-gray-600 mb-1">Объём сделок</div>
            <div className="text-2xl md:text-3xl font-bold text-gray-900">{totalVolume.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-1 md:mt-2">USDT</div>
          </div>
          <div className="rounded-xl border bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 md:p-6 shadow-sm">
            <div className="text-xs md:text-sm text-gray-600 mb-1">Комиссия</div>
            <div className="text-2xl md:text-3xl font-bold text-gray-900">0.5%</div>
            <div className="text-xs text-gray-500 mt-1 md:mt-2">с каждой сделки</div>
          </div>
        </div>

        {/* Referral Link */}
        <div className="rounded-xl border bg-white p-4 md:p-6 shadow-sm">
          <h2 className="font-semibold text-base md:text-lg mb-3 md:mb-4">Ваша реферальная ссылка</h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              readOnly
              value={referralLink}
              className="flex-1 rounded-lg border-2 border-[#edb419] bg-white text-[#2f2d42] px-3 md:px-4 py-2.5 md:py-3 font-mono text-xs md:text-sm break-all"
            />
            <button
              onClick={handleCopy}
              className="w-full sm:w-auto px-4 md:px-6 py-2.5 md:py-3 rounded-lg bg-primary text-white hover:opacity-90 font-semibold shadow-md transition-all whitespace-nowrap text-sm md:text-base"
            >
              {copied ? "✓ Скопировано" : "Копировать"}
            </button>
          </div>
          <p className="text-xs md:text-sm text-gray-600 mt-2 md:mt-3">
            Поделитесь этой ссылкой с друзьями и получайте комиссию с их сделок
          </p>
        </div>

        {/* How it works */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-lg mb-4">Как это работает</h2>
            <div className="space-y-4">
              {[
                { step: 1, title: "Получите реферальную ссылку", desc: "Скопируйте вашу уникальную ссылку" },
                { step: 2, title: "Поделитесь с друзьями", desc: "Отправьте ссылку через соцсети, мессенджеры или email" },
                { step: 3, title: "Получайте комиссию", desc: "0.5% с каждой сделки ваших рефералов" },
                { step: 4, title: "Выводите заработанное", desc: "Средства доступны для вывода в любое время" },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {item.step}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 mb-1">{item.title}</div>
                    <div className="text-sm text-gray-600">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-lg mb-4">Преимущества</h2>
            <ul className="space-y-3">
              {[
                'Прозрачная система выплат',
                'Регулярные выплаты',
                'Отслеживание статистики в реальном времени',
                'Поддержка партнёров 24/7',
                'Нет ограничений на количество рефералов',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-1.5 inline-block h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Referrals List */}
        {totalReferrals > 0 && (
          <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
            <div className="p-4 md:p-6 border-b bg-gray-50">
              <h2 className="font-semibold text-lg">Ваши рефералы</h2>
            </div>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700">Пользователь</th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700">Дата регистрации</th>
                    <th className="p-4 text-right text-sm font-semibold text-gray-700">Сделок</th>
                    <th className="p-4 text-right text-sm font-semibold text-gray-700">Объём</th>
                    <th className="p-4 text-right text-sm font-semibold text-gray-700">Заработано</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {referrals.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-medium text-gray-900">{r.username}</td>
                      <td className="p-4 text-gray-700">{new Date(r.date).toLocaleDateString('ru-RU')}</td>
                      <td className="p-4 text-right text-gray-700">{r.trades}</td>
                      <td className="p-4 text-right text-gray-700">{r.volume.toLocaleString()} USDT</td>
                      <td className="p-4 text-right font-semibold text-green-600">{r.earnings} USDT</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile Cards */}
            <div className="md:hidden divide-y">
              {referrals.map((r) => (
                <div key={r.id} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-semibold text-gray-900">{r.username}</div>
                      <div className="text-xs text-gray-500 mt-1">{new Date(r.date).toLocaleDateString('ru-RU')}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">{r.earnings} USDT</div>
                      <div className="text-xs text-gray-500">заработано</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Сделок</div>
                      <div className="font-medium text-gray-900">{r.trades}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Объём</div>
                      <div className="font-medium text-gray-900">{r.volume.toLocaleString()} USDT</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
