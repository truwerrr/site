"use client";
import { isAuthenticated } from "@/lib/auth";
import { getUserData } from "@/lib/userData";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AffiliatePage() {
  const [auth, setAuth] = useState(false);
  const [mounted, setMounted] = useState(false);
  const userData = getUserData();

  useEffect(() => {
    setMounted(true);
    setAuth(isAuthenticated());
  }, []);

  if (!mounted) return null;

  const referrals = [
    { id: '1', username: 'user_001', date: '2024-12-15', trades: 25, volume: 5000, earnings: 25 },
    { id: '2', username: 'user_002', date: '2024-12-10', trades: 45, volume: 12000, earnings: 60 },
    { id: '3', username: 'user_003', date: '2024-12-05', trades: 12, volume: 3000, earnings: 15 },
  ];

  return (
    <div className="container py-10">
      <h1 className="text-3xl md:text-4xl font-bold mb-4">Партнёрская программа</h1>

      {auth ? (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-4">
            <div className="rounded-xl border p-4 bg-white">
              <div className="text-xs text-muted-foreground mb-1">Приглашено</div>
              <div className="text-2xl font-bold">{userData.referralCount}</div>
              <div className="text-xs text-muted-foreground mt-1">пользователей</div>
            </div>
            <div className="rounded-xl border p-4 bg-white">
              <div className="text-xs text-muted-foreground mb-1">Заработано</div>
              <div className="text-2xl font-bold">{userData.referralEarnings} USDT</div>
              <div className="text-xs text-muted-foreground mt-1">всего</div>
            </div>
            <div className="rounded-xl border p-4 bg-white">
              <div className="text-xs text-muted-foreground mb-1">Объём сделок</div>
              <div className="text-2xl font-bold">{referrals.reduce((sum, r) => sum + r.volume, 0).toLocaleString()}</div>
              <div className="text-xs text-muted-foreground mt-1">USDT</div>
            </div>
            <div className="rounded-xl border p-4 bg-white">
              <div className="text-xs text-muted-foreground mb-1">Комиссия</div>
              <div className="text-2xl font-bold">0.5%</div>
              <div className="text-xs text-muted-foreground mt-1">с каждой сделки</div>
            </div>
          </div>

          {/* Referral Link */}
          <div className="rounded-xl border p-6 bg-white">
            <h2 className="font-semibold mb-4">Ваша реферальная ссылка</h2>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={`https://ataix.kz/ref/admin`}
                className="flex-1 rounded border-2 border-[#edb419] bg-white text-[#2f2d42] px-3 py-2"
              />
              <button className="px-6 py-2 rounded bg-primary text-white hover:opacity-90">
                Копировать
              </button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Поделитесь этой ссылкой с друзьями и получайте комиссию с их сделок
            </p>
          </div>

          {/* How it works */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-xl border p-6 bg-white">
              <h2 className="font-semibold mb-4">Как это работает</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    1
                  </div>
                  <div>
                    <div className="font-medium mb-1">Получите реферальную ссылку</div>
                    <div className="text-sm text-muted-foreground">Скопируйте вашу уникальную ссылку</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    2
                  </div>
                  <div>
                    <div className="font-medium mb-1">Поделитесь с друзьями</div>
                    <div className="text-sm text-muted-foreground">Отправьте ссылку через соцсети, мессенджеры или email</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    3
                  </div>
                  <div>
                    <div className="font-medium mb-1">Получайте комиссию</div>
                    <div className="text-sm text-muted-foreground">0.5% с каждой сделки ваших рефералов</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    4
                  </div>
                  <div>
                    <div className="font-medium mb-1">Выводите заработанное</div>
                    <div className="text-sm text-muted-foreground">Средства доступны для вывода в любое время</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border p-6 bg-white">
              <h2 className="font-semibold mb-4">Преимущества</h2>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-primary" />
                  <span className="text-sm">Прозрачная система выплат</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-primary" />
                  <span className="text-sm">Регулярные выплаты</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-primary" />
                  <span className="text-sm">Отслеживание статистики в реальном времени</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-primary" />
                  <span className="text-sm">Поддержка партнёров 24/7</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-primary" />
                  <span className="text-sm">Нет ограничений на количество рефералов</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Referrals List */}
          <div className="rounded-xl border bg-white overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="font-semibold">Ваши рефералы</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left">Пользователь</th>
                    <th className="p-3 text-left">Дата регистрации</th>
                    <th className="p-3 text-right">Сделок</th>
                    <th className="p-3 text-right">Объём</th>
                    <th className="p-3 text-right">Заработано</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map((r) => (
                    <tr key={r.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">{r.username}</td>
                      <td className="p-3">{new Date(r.date).toLocaleDateString('ru-RU')}</td>
                      <td className="p-3 text-right">{r.trades}</td>
                      <td className="p-3 text-right">{r.volume.toLocaleString()} USDT</td>
                      <td className="p-3 text-right font-semibold text-green-600">{r.earnings} USDT</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <p className="text-muted-foreground max-w-prose">
            Приглашайте друзей и получайте вознаграждение за каждого приглашённого пользователя.{" "}
            <Link href="/sessions/signin" className="text-primary underline">
              Войдите
            </Link>
            , чтобы начать зарабатывать.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-xl border p-6 bg-white">
              <h2 className="font-semibold mb-3">Как это работает</h2>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li>1. Получите уникальную реферальную ссылку</li>
                <li>2. Поделитесь ссылкой с друзьями</li>
                <li>3. Получайте комиссию с их торговых операций</li>
                <li>4. Выводите заработанные средства</li>
              </ul>
            </div>
            <div className="rounded-xl border p-6 bg-white">
              <h2 className="font-semibold mb-3">Преимущества</h2>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li>• Прозрачная система выплат</li>
                <li>• Регулярные выплаты</li>
                <li>• Отслеживание статистики</li>
                <li>• Поддержка партнёров</li>
              </ul>
            </div>
          </div>
          <div className="rounded-xl border p-6 bg-white max-w-2xl">
            <h2 className="font-semibold mb-4">Связаться с нами</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Для получения реферальной ссылки и дополнительной информации о партнёрской программе, свяжитесь с нашей службой поддержки.
            </p>
            <Link href="/support" className="inline-block px-4 py-2 rounded bg-primary text-white hover:opacity-90">
              Связаться с поддержкой
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
