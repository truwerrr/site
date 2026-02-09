"use client";
import Image from "next/image";
import { isAuthenticated } from "@/lib/auth";
import { mockBalances, mockTransactions } from "@/lib/userData";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function WalletPage() {
  const [auth, setAuth] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'balances' | 'deposit' | 'withdraw' | 'history'>('balances');
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);

  useEffect(() => {
    try {
      setMounted(true);
      setAuth(isAuthenticated());
    } catch (error) {
      console.error('Error checking auth:', error);
      setMounted(true);
      setAuth(false);
    }
  }, []);

  if (!mounted) {
    return (
      <div className="container py-10">
        <div className="text-center">Загрузка...</div>
      </div>
    );
  }

  if (!auth) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Кошелёк</h1>
        <p className="text-muted-foreground mb-6 max-w-prose">
          Мультивалютный кошелёк: храните и управляйте криптоактивами.{" "}
          <Link href="/sessions/signin" className="text-primary underline">
            Войдите
          </Link>
          , чтобы использовать кошелёк.
        </p>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl md:text-4xl font-bold mb-6">Кошелёк</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        {[
          { id: 'balances', label: 'Балансы' },
          { id: 'deposit', label: 'Пополнить' },
          { id: 'withdraw', label: 'Вывести' },
          { id: 'history', label: 'История' },
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

      {/* Balances Tab */}
      {activeTab === 'balances' && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {mockBalances.map((b) => {
              const usdValue = b.currency === 'USDT' ? b.amount :
                              b.currency === 'BTC' ? b.amount * 70184 :
                              b.currency === 'ETH' ? b.amount * 2153.43 :
                              b.currency === 'KZT' ? b.amount / 505 : 0;
              return (
                <div key={b.currency} className="rounded-xl border p-4 bg-white">
                  <div className="flex items-center gap-3 mb-3">
                    <Image src={b.icon} alt={b.currency} width={32} height={32} />
                    <div>
                      <div className="font-semibold">{b.currency}</div>
                      <div className="text-xs text-muted-foreground">≈ ${Number(usdValue).toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold">{Number(b.amount).toFixed(8)}</div>
                    <div className="text-xs text-muted-foreground">
                      Доступно: {Number(b.available).toFixed(8)}
                      {b.locked > 0 && (
                        <span className="ml-2 text-yellow-600">
                          Заблокировано: {Number(b.locked).toFixed(8)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => {
                        setSelectedCurrency(b.currency);
                        setActiveTab('deposit');
                      }}
                      className="flex-1 px-3 py-1.5 rounded bg-primary text-white text-sm hover:opacity-90"
                    >
                      Пополнить
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCurrency(b.currency);
                        setActiveTab('withdraw');
                      }}
                      className="flex-1 px-3 py-1.5 rounded border text-sm hover:bg-gray-50"
                    >
                      Вывести
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-xl border p-6 bg-white">
            <h2 className="font-semibold mb-4">Общий баланс</h2>
            <div className="text-4xl font-bold mb-2">
              {Number(mockBalances.reduce((sum, b) => {
                if (b.currency === 'USDT') return sum + b.amount;
                if (b.currency === 'BTC') return sum + (b.amount * 70184);
                if (b.currency === 'ETH') return sum + (b.amount * 2153.43);
                if (b.currency === 'KZT') return sum + (b.amount / 505);
                return sum;
              }, 0)).toFixed(2)} USDT
            </div>
            <div className="text-muted-foreground">
              ≈ ${Number(mockBalances.reduce((sum, b) => {
                if (b.currency === 'USDT') return sum + b.amount;
                if (b.currency === 'BTC') return sum + (b.amount * 70184);
                if (b.currency === 'ETH') return sum + (b.amount * 2153.43);
                if (b.currency === 'KZT') return sum + (b.amount / 505);
                return sum;
              }, 0)).toFixed(2)}
            </div>
          </div>
        </div>
      )}

      {/* Deposit Tab */}
      {activeTab === 'deposit' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-xl border p-6 bg-white">
            <h2 className="font-semibold mb-4">Пополнить счёт</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Выберите валюту</label>
                <select
                  value={selectedCurrency || ''}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  className="w-full rounded border-2 border-[#edb419] bg-white text-[#2f2d42] px-3 py-2"
                >
                  <option value="">Выберите валюту</option>
                  {mockBalances.map((b) => (
                    <option key={b.currency} value={b.currency}>{b.currency}</option>
                  ))}
                </select>
              </div>
              {selectedCurrency && (
                <>
                  <div>
                    <label className="block text-sm mb-2">Способ пополнения</label>
                    <div className="space-y-2">
                      <button className="w-full p-3 rounded border hover:bg-gray-50 text-left">
                        <div className="font-medium">Kaspi Bank</div>
                        <div className="text-xs text-muted-foreground">Мгновенное пополнение</div>
                      </button>
                      <button className="w-full p-3 rounded border hover:bg-gray-50 text-left">
                        <div className="font-medium">Home Credit Bank</div>
                        <div className="text-xs text-muted-foreground">Мгновенное пополнение</div>
                      </button>
                      <button className="w-full p-3 rounded border hover:bg-gray-50 text-left">
                        <div className="font-medium">Криптовалюта</div>
                        <div className="text-xs text-muted-foreground">Перевод с другого кошелька</div>
                      </button>
                    </div>
                  </div>
                  <div className="p-4 rounded bg-yellow-50 border border-yellow-200">
                    <div className="text-sm font-medium mb-1">Важно</div>
                    <div className="text-xs text-muted-foreground">
                      Минимальная сумма пополнения: {selectedCurrency === 'USDT' ? '10' : selectedCurrency === 'BTC' ? '0.0001' : '100'} {selectedCurrency}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="rounded-xl border p-6 bg-white">
            <h2 className="font-semibold mb-4">Информация</h2>
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-muted-foreground mb-1">Комиссия за пополнение</div>
                <div className="font-medium">0%</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Время зачисления</div>
                <div className="font-medium">Мгновенно (банки) / 1-3 подтверждения (крипто)</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Поддерживаемые банки</div>
                <div className="font-medium">Kaspi Bank, Home Credit Bank</div>
              </div>
            </div>
            <Link href="/easy-payments" className="mt-4 block text-center px-4 py-2 rounded border text-sm hover:bg-gray-50">
              Подробнее о платежах
            </Link>
          </div>
        </div>
      )}

      {/* Withdraw Tab */}
      {activeTab === 'withdraw' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-xl border p-6 bg-white">
            <h2 className="font-semibold mb-4">Вывести средства</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Выберите валюту</label>
                <select
                  value={selectedCurrency || ''}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  className="w-full rounded border-2 border-[#edb419] bg-white text-[#2f2d42] px-3 py-2"
                >
                  <option value="">Выберите валюту</option>
                  {mockBalances.map((b) => (
                    <option key={b.currency} value={b.currency}>{b.currency}</option>
                  ))}
                </select>
              </div>
              {selectedCurrency && (
                <>
                  <div>
                    <label className="block text-sm mb-2">Сумма</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="0.00"
                        className="flex-1 rounded border-2 border-[#edb419] bg-white text-[#2f2d42] px-3 py-2"
                      />
                      <button className="px-4 py-2 rounded border text-sm hover:bg-gray-50">
                        Макс
                      </button>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Доступно: {Number(mockBalances.find(b => b.currency === selectedCurrency)?.available || 0).toFixed(8)}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm mb-2">Способ вывода</label>
                    <select className="w-full rounded border-2 border-[#edb419] bg-white text-[#2f2d42] px-3 py-2">
                      <option>Kaspi Bank</option>
                      <option>Home Credit Bank</option>
                      <option>Криптокошелёк</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm mb-2">Реквизиты</label>
                    <input
                      type="text"
                      placeholder="Номер карты или адрес кошелька"
                      className="w-full rounded border-2 border-[#edb419] bg-white text-[#2f2d42] px-3 py-2"
                    />
                  </div>
                  <button className="w-full px-4 py-2 rounded bg-primary text-white hover:opacity-90">
                    Вывести
                  </button>
                  <div className="p-4 rounded bg-yellow-50 border border-yellow-200">
                    <div className="text-sm font-medium mb-1">Комиссия</div>
                    <div className="text-xs text-muted-foreground">
                      Комиссия за вывод: {selectedCurrency === 'KZT' ? '0.5%' : '0.1%'} (минимум зависит от валюты)
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="rounded-xl border p-6 bg-white">
            <h2 className="font-semibold mb-4">Лимиты вывода</h2>
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-muted-foreground mb-1">Дневной лимит</div>
                <div className="font-medium">50,000 USDT</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Использовано сегодня</div>
                <div className="font-medium">0 USDT</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Минимальная сумма</div>
                <div className="font-medium">Зависит от валюты</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="rounded-xl border bg-white overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="font-semibold">История операций</h2>
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
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {t.type === 'deposit' ? 'Пополнение' :
                         t.type === 'withdraw' ? 'Вывод' : 'Обмен'}
                      </span>
                    </td>
                    <td className="p-3 font-medium">{t.currency}</td>
                    <td className="p-3 text-right font-semibold">{Number(t.amount).toLocaleString('ru-RU')}</td>
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
    </div>
  );
}
