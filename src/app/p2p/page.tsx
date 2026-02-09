"use client";
import { isAuthenticated } from "@/lib/auth";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function P2PPage() {
  const [auth, setAuth] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'buy' | 'sell' | 'my-ads'>('buy');
  const [selectedCurrency, setSelectedCurrency] = useState('USDT');

  useEffect(() => {
    setMounted(true);
    setAuth(isAuthenticated());
  }, []);

  if (!mounted) return null;

  const ads = [
    { id: '1', user: 'Trader_123', price: 505, amount: 1000, available: 500, payment: 'Kaspi Bank', rating: 4.9, trades: 1250, limit: '500-5000 KZT' },
    { id: '2', user: 'CryptoPro', price: 505.5, amount: 2000, available: 2000, payment: 'Home Credit', rating: 4.8, trades: 890, limit: '1000-10000 KZT' },
    { id: '3', user: 'FastExchange', price: 504.8, amount: 500, available: 300, payment: 'Kaspi Bank', rating: 5.0, trades: 2100, limit: '200-2000 KZT' },
  ];

  return (
    <div className="container py-10">
      <h1 className="text-3xl md:text-4xl font-bold mb-6">P2P Vault</h1>

      {auth ? (
        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex gap-2 border-b">
            {[
              { id: 'buy', label: 'Купить' },
              { id: 'sell', label: 'Продать' },
              { id: 'my-ads', label: 'Мои объявления' },
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

          {/* Buy/Sell Tabs */}
          {(activeTab === 'buy' || activeTab === 'sell') && (
            <>
              {/* Filters */}
              <div className="rounded-xl border p-4 bg-white">
                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Валюта</label>
                    <select
                      value={selectedCurrency}
                      onChange={(e) => setSelectedCurrency(e.target.value)}
                      className="w-full rounded border-2 border-[#edb419] bg-white text-[#2f2d42] px-3 py-2 text-sm"
                    >
                      <option value="USDT">USDT</option>
                      <option value="BTC">BTC</option>
                      <option value="ETH">ETH</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Способ оплаты</label>
                    <select className="w-full rounded border-2 border-[#edb419] bg-white text-[#2f2d42] px-3 py-2 text-sm">
                      <option>Все</option>
                      <option>Kaspi Bank</option>
                      <option>Home Credit Bank</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Сумма</label>
                    <input
                      type="number"
                      placeholder="0"
                      className="w-full rounded border-2 border-[#edb419] bg-white text-[#2f2d42] px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Сортировка</label>
                    <select className="w-full rounded border-2 border-[#edb419] bg-white text-[#2f2d42] px-3 py-2 text-sm">
                      <option>Лучшая цена</option>
                      <option>Высокий рейтинг</option>
                      <option>Больше сделок</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Ads List */}
              <div className="space-y-3">
                {ads.map((ad) => (
                  <div key={ad.id} className="rounded-xl border p-4 bg-white hover:shadow-md transition-shadow">
                    <div className="grid md:grid-cols-5 gap-4 items-center">
                      <div>
                        <div className="font-semibold mb-1">{ad.user}</div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-yellow-500">★</span>
                          <span className="font-medium">{ad.rating}</span>
                          <span className="text-muted-foreground">({ad.trades} сделок)</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Цена</div>
                        <div className="font-semibold">{ad.price} KZT</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Доступно</div>
                        <div className="font-semibold">{ad.available} {selectedCurrency}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Лимит</div>
                        <div className="font-medium text-sm">{ad.limit}</div>
                        <div className="text-xs text-muted-foreground">{ad.payment}</div>
                      </div>
                      <div>
                        <button className="w-full px-4 py-2 rounded bg-primary text-white hover:opacity-90">
                          {activeTab === 'buy' ? 'Купить' : 'Продать'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* My Ads Tab */}
          {activeTab === 'my-ads' && (
            <div className="rounded-xl border p-6 bg-white">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Мои объявления</h2>
                <button className="px-4 py-2 rounded bg-primary text-white hover:opacity-90">
                  Создать объявление
                </button>
              </div>
              <div className="text-center py-8 text-muted-foreground">
                У вас нет активных объявлений
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-muted-foreground max-w-prose">
            Площадка P2P для безопасного обмена между пользователями.{" "}
            <Link href="/sessions/signin" className="text-primary underline">
              Войдите
            </Link>
            , чтобы использовать P2P.
          </p>
          <div className="rounded-xl border p-6 bg-white">
            <h2 className="font-semibold mb-3">Преимущества P2P</h2>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-primary" />
                <span>Прямой обмен между пользователями</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-primary" />
                <span>Гарантия безопасности сделок</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-primary" />
                <span>Различные способы оплаты</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-primary" />
                <span>Низкие комиссии</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
