"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, clearAuth } from "@/lib/auth";
import { getUserData, mockTransactions, mockBalances, mockOrders } from "@/lib/userData";
import Link from "next/link";
import Image from "next/image";

export default function ProfilePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'orders' | 'settings'>('overview');
  const [userData, setUserData] = useState<ReturnType<typeof getUserData> | null>(null);

  useEffect(() => {
    try {
      setMounted(true);
      if (!isAuthenticated()) {
        router.push("/sessions/signin");
      } else {
        setUserData(getUserData());
      }
    } catch (error) {
      console.error('Error in profile:', error);
      setMounted(true);
      router.push("/sessions/signin");
    }
  }, [router]);

  const handleLogout = () => {
    clearAuth();
    router.push("/");
  };

  if (!mounted) {
    return (
      <div className="container py-10">
        <div className="text-center">Загрузка...</div>
      </div>
    );
  }

  if (!isAuthenticated() || !userData) {
    return null;
  }

  const totalBalance = mockBalances.reduce((sum, b) => {
    if (b.currency === 'USDT') return sum + b.amount;
    if (b.currency === 'BTC') return sum + (b.amount * 70184);
    if (b.currency === 'ETH') return sum + (b.amount * 2153.43);
    if (b.currency === 'KZT') return sum + (b.amount / 505);
    return sum;
  }, 0);

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl md:text-4xl font-bold">Профиль</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded border hover:bg-gray-50"
        >
          Выйти
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        {[
          { id: 'overview', label: 'Обзор' },
          { id: 'transactions', label: 'Транзакции' },
          { id: 'orders', label: 'Ордера' },
          { id: 'settings', label: 'Настройки' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Balance Cards */}
          <div className="grid md:grid-cols-4 gap-4">
            <div className="rounded-xl border p-4 bg-white">
              <div className="text-xs text-muted-foreground mb-1">Общий баланс</div>
              <div className="text-2xl font-bold">{totalBalance.toFixed(2)} USDT</div>
              <div className="text-xs text-muted-foreground mt-1">≈ ${totalBalance.toFixed(2)}</div>
            </div>
            <div className="rounded-xl border p-4 bg-white">
              <div className="text-xs text-muted-foreground mb-1">Всего сделок</div>
              <div className="text-2xl font-bold">{userData.totalTrades}</div>
              <div className="text-xs text-muted-foreground mt-1">Объём: {userData.totalVolume.toLocaleString()} USDT</div>
            </div>
            <div className="rounded-xl border p-4 bg-white">
              <div className="text-xs text-muted-foreground mb-1">Активные ордера</div>
              <div className="text-2xl font-bold">{mockOrders.filter(o => o.status === 'open').length}</div>
              <div className="text-xs text-muted-foreground mt-1">Открыто сейчас</div>
            </div>
            <div className="rounded-xl border p-4 bg-white">
              <div className="text-xs text-muted-foreground mb-1">Рефералы</div>
              <div className="text-2xl font-bold">{userData.referralCount}</div>
              <div className="text-xs text-muted-foreground mt-1">Заработано: {userData.referralEarnings} USDT</div>
            </div>
          </div>

          {/* Account Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-xl border p-6 bg-white">
              <h2 className="font-semibold mb-4">Информация об аккаунте</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{userData.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Верификация:</span>
                  <span className="font-medium text-green-600">✓ Уровень {userData.kycLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Регистрация:</span>
                  <span className="font-medium">{new Date(userData.registrationDate).toLocaleDateString('ru-RU')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Последний вход:</span>
                  <span className="font-medium">{new Date(userData.lastLogin).toLocaleString('ru-RU')}</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border p-6 bg-white">
              <h2 className="font-semibold mb-4">Балансы</h2>
              <div className="space-y-2">
                {mockBalances.slice(0, 4).map((b) => (
                  <div key={b.currency} className="flex items-center justify-between p-2 rounded border">
                    <div className="flex items-center gap-2">
                      <Image src={b.icon} alt={b.currency} width={20} height={20} />
                      <span className="font-medium">{b.currency}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{b.amount.toFixed(8)}</div>
                      <div className="text-xs text-muted-foreground">Доступно: {b.available.toFixed(8)}</div>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/wallet" className="mt-4 block text-center px-4 py-2 rounded bg-primary text-white text-sm hover:opacity-90">
                Управление балансом
              </Link>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-xl border p-6 bg-white">
            <h2 className="font-semibold mb-4">Быстрые действия</h2>
            <div className="grid md:grid-cols-4 gap-4">
              <Link href="/trade" className="p-4 rounded border hover:bg-gray-50 text-center">
                <div className="font-medium mb-1">Торговля</div>
                <div className="text-xs text-muted-foreground">Открыть торговлю</div>
              </Link>
              <Link href="/wallet" className="p-4 rounded border hover:bg-gray-50 text-center">
                <div className="font-medium mb-1">Кошелёк</div>
                <div className="text-xs text-muted-foreground">Пополнить/вывести</div>
              </Link>
              <Link href="/exchange" className="p-4 rounded border hover:bg-gray-50 text-center">
                <div className="font-medium mb-1">Обмен</div>
                <div className="text-xs text-muted-foreground">Быстрый обмен</div>
              </Link>
              <Link href="/p2p" className="p-4 rounded border hover:bg-gray-50 text-center">
                <div className="font-medium mb-1">P2P</div>
                <div className="text-xs text-muted-foreground">P2P обмен</div>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="rounded-xl border bg-white overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="font-semibold">История транзакций</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left">Дата</th>
                  <th className="p-3 text-left">Тип</th>
                  <th className="p-3 text-left">Валюта</th>
                  <th className="p-3 text-right">Сумма</th>
                  <th className="p-3 text-left">Статус</th>
                  <th className="p-3 text-left">Описание</th>
                </tr>
              </thead>
              <tbody>
                {mockTransactions.map((t) => (
                  <tr key={t.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{new Date(t.date).toLocaleString('ru-RU')}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        t.type === 'deposit' ? 'bg-green-100 text-green-700' :
                        t.type === 'withdraw' ? 'bg-red-100 text-red-700' :
                        t.type === 'trade' ? 'bg-blue-100 text-blue-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {t.type === 'deposit' ? 'Пополнение' :
                         t.type === 'withdraw' ? 'Вывод' :
                         t.type === 'trade' ? 'Торговля' :
                         t.type === 'exchange' ? 'Обмен' : 'P2P'}
                      </span>
                    </td>
                    <td className="p-3 font-medium">{t.currency}</td>
                    <td className="p-3 text-right font-semibold">{t.amount.toLocaleString()}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        t.status === 'completed' ? 'bg-green-100 text-green-700' :
                        t.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {t.status === 'completed' ? 'Завершено' :
                         t.status === 'pending' ? 'В обработке' : 'Ошибка'}
                      </span>
                    </td>
                    <td className="p-3 text-muted-foreground">{t.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="rounded-xl border bg-white overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="font-semibold">История ордеров</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left">Дата</th>
                  <th className="p-3 text-left">Пара</th>
                  <th className="p-3 text-left">Тип</th>
                  <th className="p-3 text-right">Цена</th>
                  <th className="p-3 text-right">Количество</th>
                  <th className="p-3 text-right">Исполнено</th>
                  <th className="p-3 text-left">Статус</th>
                </tr>
              </thead>
              <tbody>
                {mockOrders.map((o) => (
                  <tr key={o.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{new Date(o.date).toLocaleString('ru-RU')}</td>
                    <td className="p-3 font-medium">{o.pair}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        o.type === 'buy' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {o.type === 'buy' ? 'Покупка' : 'Продажа'}
                      </span>
                    </td>
                    <td className="p-3 text-right">{o.price.toLocaleString()}</td>
                    <td className="p-3 text-right">{o.amount}</td>
                    <td className="p-3 text-right">{o.filled}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        o.status === 'filled' ? 'bg-green-100 text-green-700' :
                        o.status === 'open' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {o.status === 'filled' ? 'Исполнено' :
                         o.status === 'open' ? 'Открыт' : 'Отменён'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-xl border p-6 bg-white">
            <h2 className="font-semibold mb-4">Безопасность</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">Двухфакторная аутентификация</div>
                  <div className="text-xs text-muted-foreground">Дополнительная защита аккаунта</div>
                </div>
                <button className="px-4 py-2 rounded border text-sm hover:bg-gray-50">
                  Включить
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">Смена пароля</div>
                  <div className="text-xs text-muted-foreground">Изменить текущий пароль</div>
                </div>
                <button className="px-4 py-2 rounded border text-sm hover:bg-gray-50">
                  Изменить
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">API ключи</div>
                  <div className="text-xs text-muted-foreground">Управление API доступом</div>
                </div>
                <Link href="/api" className="px-4 py-2 rounded border text-sm hover:bg-gray-50">
                  Управление
                </Link>
              </div>
            </div>
          </div>

          <div className="rounded-xl border p-6 bg-white">
            <h2 className="font-semibold mb-4">Уведомления</h2>
            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm">Email уведомления</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm">Уведомления о сделках</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm">Маркетинговые рассылки</span>
                <input type="checkbox" className="rounded" />
              </label>
            </div>
          </div>

          <div className="rounded-xl border p-6 bg-white md:col-span-2">
            <h2 className="font-semibold mb-4">Реферальная программа</h2>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Приглашено пользователей</div>
                <div className="text-2xl font-bold">{userData.referralCount}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Заработано</div>
                <div className="text-2xl font-bold">{userData.referralEarnings} USDT</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Реферальная ссылка</div>
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    readOnly
                    value={`https://ataix.kz/ref/admin`}
                    className="flex-1 rounded border-2 border-[#edb419] bg-white text-[#2f2d42] px-3 py-2 text-sm"
                  />
                  <button className="px-4 py-2 rounded bg-primary text-white text-sm hover:opacity-90">
                    Копировать
                  </button>
                </div>
              </div>
            </div>
            <Link href="/affiliate" className="text-primary hover:underline text-sm">
              Подробнее о реферальной программе →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
