"use client";
import Link from "next/link";
import Image from "next/image";
import { isAuthenticated } from "@/lib/auth";
import { mockBalances, mockOrders } from "@/lib/userData";
import { useEffect, useState } from "react";

export default function TradePage() {
  const [auth, setAuth] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedPair, setSelectedPair] = useState('BTC/USDT');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('limit');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [price, setPrice] = useState('70184');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    setMounted(true);
    setAuth(isAuthenticated());
  }, []);

  if (!mounted) {
    return (
      <div className="container py-10">
        <div className="text-center">Загрузка...</div>
      </div>
    );
  }

  const pairs = [
    { pair: 'BTC/USDT', price: 70184, change: 1.716, volume: '1250.5 BTC', icon: 'https://ext.same-assets.com/1411108151/2831370402.svg' },
    { pair: 'ETH/USDT', price: 2153.43, change: 2.560, volume: '850.2 ETH', icon: 'https://ext.same-assets.com/1411108151/1694252569.svg' },
    { pair: 'SOL/USDT', price: 87.90, change: -0.980, volume: '5200 SOL', icon: 'https://ext.same-assets.com/1411108151/2977942531.svg' },
    { pair: 'LTC/USDT', price: 55.47, change: 1.076, volume: '2100 LTC', icon: 'https://ext.same-assets.com/1411108151/4280945660.svg' },
  ];

  const selectedPairData = pairs.find(p => p.pair === selectedPair) || pairs[0];

  return (
    <div className="container py-10">
      <h1 className="text-3xl md:text-4xl font-bold mb-6">Торговля</h1>

      {auth ? (
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Pairs */}
          <div className="lg:col-span-1 space-y-4">
            <div className="rounded-xl border p-4 bg-white">
              <h2 className="font-semibold mb-3 text-sm">Рынки</h2>
              <div className="space-y-2">
                {pairs.map((p) => (
                  <button
                    key={p.pair}
                    onClick={() => setSelectedPair(p.pair)}
                    className={`w-full p-3 rounded border text-left transition-colors ${
                      selectedPair === p.pair ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Image src={p.icon} alt={p.pair} width={20} height={20} />
                        <span className="font-medium text-sm">{p.pair}</span>
                      </div>
                      <span className={`text-xs ${p.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {p.change >= 0 ? '+' : ''}{p.change}%
                      </span>
                    </div>
                    <div className="text-sm font-semibold">{p.price.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Объём: {p.volume}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Balance Summary */}
            <div className="rounded-xl border p-4 bg-white">
              <h2 className="font-semibold mb-3 text-sm">Баланс</h2>
              <div className="space-y-2 text-sm">
                {mockBalances.slice(0, 3).map((b) => (
                  <div key={b.currency} className="flex items-center justify-between">
                    <span className="text-muted-foreground">{b.currency}:</span>
                    <span className="font-medium">{b.available.toFixed(4)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Trading Area */}
          <div className="lg:col-span-2 space-y-4">
            {/* Chart Placeholder */}
            <div className="rounded-xl border p-6 bg-white h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">{selectedPairData.pair}</div>
                <div className="text-2xl font-semibold mb-1">{selectedPairData.price.toLocaleString()}</div>
                <div className={`text-sm ${selectedPairData.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {selectedPairData.change >= 0 ? '+' : ''}{selectedPairData.change}%
                </div>
                <div className="text-xs text-muted-foreground mt-4">График цены (демо)</div>
              </div>
            </div>

            {/* Order Form */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Buy Order */}
              <div className="rounded-xl border p-4 bg-white">
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setSide('buy')}
                    className={`flex-1 px-3 py-2 rounded text-sm font-medium ${
                      side === 'buy' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    Купить
                  </button>
                  <button
                    onClick={() => setSide('sell')}
                    className={`flex-1 px-3 py-2 rounded text-sm font-medium ${
                      side === 'sell' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    Продать
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Тип ордера</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setOrderType('limit')}
                        className={`flex-1 px-3 py-1.5 rounded text-xs ${
                          orderType === 'limit' ? 'bg-primary text-white' : 'border'
                        }`}
                      >
                        Лимит
                      </button>
                      <button
                        onClick={() => setOrderType('market')}
                        className={`flex-1 px-3 py-1.5 rounded text-xs ${
                          orderType === 'market' ? 'bg-primary text-white' : 'border'
                        }`}
                      >
                        Рыночный
                      </button>
                    </div>
                  </div>
                  {orderType === 'limit' && (
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Цена</label>
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full rounded border-2 border-[#edb419] bg-white text-[#2f2d42] px-3 py-2 text-sm"
                        placeholder="0.00"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Количество</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full rounded border-2 border-[#edb419] bg-white text-[#2f2d42] px-3 py-2 text-sm"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Итого: {amount && price ? (parseFloat(amount) * parseFloat(price)).toFixed(2) : '0.00'} USDT
                  </div>
                  <button
                    className={`w-full px-4 py-3 rounded text-white font-medium ${
                      side === 'buy' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                    }`}
                  >
                    {side === 'buy' ? 'Купить' : 'Продать'} {selectedPairData.pair.split('/')[0]}
                  </button>
                </div>
              </div>

              {/* Order Book Placeholder */}
              <div className="rounded-xl border p-4 bg-white">
                <h3 className="font-semibold mb-3 text-sm">Книга ордеров</h3>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-red-600">
                    <span>70,200</span>
                    <span>0.05</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>70,195</span>
                    <span>0.12</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>70,190</span>
                    <span>0.08</span>
                  </div>
                  <div className="flex justify-between font-bold py-2 border-y">
                    <span>70,184</span>
                    <span>Последняя</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>70,180</span>
                    <span>0.15</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>70,175</span>
                    <span>0.22</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>70,170</span>
                    <span>0.18</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Orders & History */}
          <div className="lg:col-span-1 space-y-4">
            {/* Active Orders */}
            <div className="rounded-xl border p-4 bg-white">
              <h2 className="font-semibold mb-3 text-sm">Активные ордера</h2>
              {mockOrders.filter(o => o.status === 'open').length > 0 ? (
                <div className="space-y-2">
                  {mockOrders.filter(o => o.status === 'open').map((o) => (
                    <div key={o.id} className="p-2 rounded border text-xs">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">{o.pair}</span>
                        <span className={o.type === 'buy' ? 'text-green-600' : 'text-red-600'}>
                          {o.type === 'buy' ? 'Покупка' : 'Продажа'}
                        </span>
                      </div>
                      <div className="text-muted-foreground">
                        Цена: {o.price.toLocaleString()}
                      </div>
                      <div className="text-muted-foreground">
                        Количество: {o.amount} ({((o.filled / o.amount) * 100).toFixed(1)}%)
                      </div>
                      <button className="mt-2 w-full px-2 py-1 rounded border text-xs hover:bg-gray-50">
                        Отменить
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground text-center py-4">
                  Нет активных ордеров
                </div>
              )}
            </div>

            {/* Recent Trades */}
            <div className="rounded-xl border p-4 bg-white">
              <h2 className="font-semibold mb-3 text-sm">Последние сделки</h2>
              <div className="space-y-1 text-xs">
                {[
                  { price: 70184, amount: 0.05, side: 'buy', time: '10:30:15' },
                  { price: 70180, amount: 0.12, side: 'sell', time: '10:30:10' },
                  { price: 70185, amount: 0.08, side: 'buy', time: '10:30:05' },
                  { price: 70182, amount: 0.15, side: 'sell', time: '10:29:58' },
                  { price: 70188, amount: 0.22, side: 'buy', time: '10:29:45' },
                ].map((trade, i) => (
                  <div key={i} className="flex justify-between">
                    <span className={trade.side === 'buy' ? 'text-green-600' : 'text-red-600'}>
                      {trade.price.toLocaleString()}
                    </span>
                    <span className="text-muted-foreground">{trade.amount}</span>
                    <span className="text-muted-foreground">{trade.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <p className="text-muted-foreground mb-6 max-w-prose">
            Торгуйте криптовалютами на официальной платформе ATAIX Eurasia. Для безопасности используйте
            только официальный домен.
          </p>
          <div className="flex flex-wrap gap-3 mb-8">
            <Link href="/sessions/signin" className="px-4 py-2 rounded bg-primary text-white hover:opacity-90">
              Войти в торговлю
            </Link>
            <Link href="/sessions/signup" className="px-4 py-2 rounded border hover:bg-gray-50">
              Зарегистрироваться
            </Link>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-xl border p-4 bg-white">
              <h2 className="font-semibold mb-2">Популярные рынки</h2>
              <ul className="text-sm space-y-2">
                <li className="flex items-center gap-2"><Image src="https://ext.same-assets.com/1411108151/2831370402.svg" alt="BTC" width={20} height={20} />BTC/USDT</li>
                <li className="flex items-center gap-2"><Image src="https://ext.same-assets.com/1411108151/1694252569.svg" alt="ETH" width={20} height={20} />ETH/USDT</li>
                <li className="flex items-center gap-2"><Image src="https://ext.same-assets.com/1411108151/2977942531.svg" alt="SOL" width={20} height={20} />SOL/USDT</li>
              </ul>
            </div>
            <div className="rounded-xl border p-4 bg-white">
              <h2 className="font-semibold mb-2">Советы по безопасности</h2>
              <ul className="text-sm space-y-2">
                <li>Проверяйте домен перед входом</li>
                <li>Используйте 2FA и уникальные пароли</li>
                <li>Никогда не вводите данные на подозрительных сайтах</li>
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
