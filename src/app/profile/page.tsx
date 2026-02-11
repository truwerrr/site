"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

interface Balance {
  currency: string;
  available: string;
  locked: string;
}

interface Order {
  id: string;
  pair: string;
  side: string;
  type: string;
  price: string | null;
  amount: string;
  remaining: string;
  status: string;
  createdAt: string;
}

interface Fill {
  id: string;
  amount: string;
  price: string;
  side: string;
  timestamp: string;
  order: {
    pair: string;
  };
}

const CURRENCY_PRICES: Record<string, number> = {
  BTC: 70184,
  ETH: 2153.43,
  USDT: 1,
  KZT: 0.002,
};

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'orders' | 'settings'>('overview');
  const [balances, setBalances] = useState<Balance[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [fills, setFills] = useState<Fill[]>([]);
  const [loading, setLoading] = useState(false);
  const [orderFilter, setOrderFilter] = useState<"all" | "open" | "filled">("all");
  const [profile, setProfile] = useState<{
    email: string;
    phone: string;
    twoFactorEnabled: boolean;
    settings: Record<string, unknown>;
  } | null>(null);
  const [bankAccounts, setBankAccounts] = useState<{ id: string; bankName: string; accountNumberMasked: string; verified: boolean }[]>([]);
  const [pwModal, setPwModal] = useState(false);
  const [twoFAModal, setTwoFAModal] = useState<"off" | "setup" | "verify" | "disable">("off");
  const [twoFAQrUrl, setTwoFAQrUrl] = useState("");
  const [twoFACode, setTwoFACode] = useState("");
  const [bankModal, setBankModal] = useState(false);
  const [bankForm, setBankForm] = useState({ bankName: "", accountNumber: "" });
  const [pwForm, setPwForm] = useState({ current: "", new: "", confirm: "" });

  useEffect(() => {
    setMounted(true);
    if (status === "authenticated") {
      fetchData();
    }
  }, [status]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/profile").then((r) => { if (r.ok) r.json().then(setProfile); }).catch(() => {});
    fetch("/api/profile/bank-accounts").then((r) => { if (r.ok) r.json().then(setBankAccounts); }).catch(() => {});
  }, [status]);

  const fetchData = async () => {
    try {
      const [balancesRes, ordersRes, fillsRes] = await Promise.all([
        fetch("/api/balances"),
        fetch("/api/orders"),
        fetch("/api/fills"),
      ]);

      if (balancesRes.ok) {
        const balancesData = await balancesRes.json();
        setBalances(balancesData);
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData);
      }

      if (fillsRes.ok) {
        const fillsData = await fillsRes.json();
        setFills(fillsData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  const calculateTotalBalance = () => {
    return balances.reduce((total, b) => {
      const price = CURRENCY_PRICES[b.currency] || 0;
      const available = parseFloat(b.available);
      const locked = parseFloat(b.locked);
      return total + (available + locked) * price;
    }, 0);
  };

  const calculateTotalVolume = () => {
    return fills.reduce((total, f) => {
      return total + parseFloat(f.amount) * parseFloat(f.price);
    }, 0);
  };

  const calculateProfitLoss = () => {
    // Simplified P&L calculation
    const buyFills = fills.filter(f => f.side === 'buy');
    const sellFills = fills.filter(f => f.side === 'sell');
    
    const buyTotal = buyFills.reduce((sum, f) => sum + parseFloat(f.amount) * parseFloat(f.price), 0);
    const sellTotal = sellFills.reduce((sum, f) => sum + parseFloat(f.amount) * parseFloat(f.price), 0);
    
    return sellTotal - buyTotal;
  };

  if (!mounted || status === "loading") {
    return (
      <div className="container py-16 flex flex-col items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="mt-4 text-gray-500 font-medium">Загрузка...</p>
      </div>
    );
  }

  if (status !== "authenticated") {
    return null;
  }

  const totalBalance = calculateTotalBalance();
  const totalVolume = calculateTotalVolume();
  const profitLoss = calculateProfitLoss();
  const activeOrders = orders.filter(o => o.status === 'open' || o.status === 'partial').length;
  const totalTrades = fills.length;

  const tabs = [
    { id: 'overview', label: 'Обзор', icon: '📊' },
    { id: 'transactions', label: 'Транзакции', icon: '💸' },
    { id: 'orders', label: 'Ордера', icon: '📋' },
    { id: 'settings', label: 'Настройки', icon: '⚙️' },
  ];

  return (
    <div className="container py-8 max-w-5xl">
      <header className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/25 to-primary/10 flex items-center justify-center text-primary font-bold text-xl">
              {(session?.user?.email || "U").charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Профиль</h1>
              <p className="text-gray-500 mt-1">{session?.user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/trade"
              className="px-4 py-2.5 rounded-xl border border-gray-300 bg-white font-semibold text-sm hover:bg-gray-50 transition-colors"
            >
              Торговля
            </Link>
            <Link
              href="/wallet"
              className="px-4 py-2.5 rounded-xl border border-gray-300 bg-white font-semibold text-sm hover:bg-gray-50 transition-colors"
            >
              Кошелёк
            </Link>
            <button
              onClick={handleLogout}
              className="px-5 py-2.5 rounded-xl border border-gray-300 bg-white font-semibold text-gray-700 hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-colors"
            >
              Выйти
            </button>
          </div>
        </div>
        <div className="mt-4 h-px bg-gradient-to-r from-gray-200 via-gray-300 to-transparent" />
      </header>

      <div className="flex gap-1 p-1.5 rounded-2xl bg-gray-100 border border-gray-200/80 mb-6 overflow-x-auto [-webkit-overflow-scrolling:touch]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 sm:px-5 py-3 min-h-[44px] rounded-xl text-sm font-semibold transition-all whitespace-nowrap touch-manipulation ${
              activeTab === tab.id
                ? 'bg-white text-primary shadow-md border border-gray-200'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg shadow-gray-200/40">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Общий баланс</div>
              <div className="text-2xl font-bold text-gray-900 tabular-nums">${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div className="text-xs text-gray-500 mt-2">{balances.length} валют</div>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg shadow-gray-200/40">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Активные ордера</div>
              <div className="text-2xl font-bold text-gray-900">{activeOrders}</div>
              <div className="text-xs text-gray-500 mt-2">Открыто сейчас</div>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg shadow-gray-200/40">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Всего сделок</div>
              <div className="text-2xl font-bold text-gray-900">{totalTrades}</div>
              <div className="text-xs text-gray-500 mt-2">За всё время</div>
            </div>
            <div className={`rounded-2xl border p-6 shadow-lg ${
              profitLoss >= 0 ? 'border-green-200/60 bg-green-50/50' : 'border-red-200/60 bg-red-50/50'
            }`}>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Прибыль / Убыток</div>
              <div className={`text-2xl font-bold tabular-nums ${profitLoss >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {profitLoss >= 0 ? '+' : ''}${profitLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-gray-500 mt-2">Реализованная</div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg shadow-gray-200/40">
            <h2 className="font-bold text-lg text-gray-900 mb-4">Объём торговли</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-5 rounded-xl bg-gray-50 border border-gray-100">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">24ч</div>
                <div className="text-xl font-bold text-gray-900 tabular-nums">${(totalVolume * 0.1).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
              <div className="p-5 rounded-xl bg-gray-50 border border-gray-100">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">7д</div>
                <div className="text-xl font-bold text-gray-900 tabular-nums">${(totalVolume * 0.3).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
              <div className="p-5 rounded-xl bg-gray-50 border border-gray-100">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">30д</div>
                <div className="text-xl font-bold text-gray-900 tabular-nums">${totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg shadow-gray-200/40">
            <h2 className="font-bold text-lg text-gray-900 mb-4">Балансы</h2>
            <div className="space-y-3">
              {balances.length > 0 ? (
                balances.map((b) => {
                  const available = parseFloat(b.available);
                  const locked = parseFloat(b.locked);
                  const total = available + locked;
                  const price = CURRENCY_PRICES[b.currency] || 0;
                  const value = total * price;
                  return (
                    <div key={b.currency} className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/25 to-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                          {b.currency[0]}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{b.currency}</div>
                          <div className="text-sm text-gray-500 tabular-nums">
                            Доступно: {available.toFixed(4)} · Заблок.: {locked.toFixed(4)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900 tabular-nums">{total.toFixed(4)}</div>
                        <div className="text-sm text-gray-500">≈ ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-gray-500 py-12 font-medium">Нет балансов</div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg shadow-gray-200/40">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg text-gray-900">Последняя активность</h2>
              {fills.length > 0 && (
                <button type="button" onClick={() => setActiveTab('transactions')} className="text-sm font-semibold text-primary hover:underline">
                  Вся история
                </button>
              )}
            </div>
            <div className="space-y-2">
              {fills.slice(0, 5).map((f) => (
                <div key={f.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${f.side === 'buy' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {f.side === 'buy' ? '↓' : '↑'}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {f.side === 'buy' ? 'Покупка' : 'Продажа'} {f.order.pair}
                      </div>
                      <div className="text-sm text-gray-500">{new Date(f.timestamp).toLocaleString('ru-RU')}</div>
                    </div>
                  </div>
                  <div className={`font-bold tabular-nums ${f.side === 'buy' ? 'text-green-600' : 'text-red-600'}`}>
                    {f.side === 'buy' ? '+' : '-'}{parseFloat(f.amount).toFixed(4)} @ {parseFloat(f.price).toLocaleString()}
                  </div>
                </div>
              ))}
              {fills.length === 0 && (
                <div className="text-center text-gray-500 py-12 font-medium">Нет активности</div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg shadow-gray-200/40">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
            <h2 className="font-bold text-xl text-gray-900">История транзакций</h2>
            <button
              onClick={async () => {
                try {
                  const res = await fetch("/api/export/transactions?format=csv");
                  if (res.ok) {
                    const blob = await res.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `transactions-${Date.now()}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                  }
                } catch (err) {
                  console.error("Error exporting:", err);
                  alert("Ошибка экспорта");
                }
              }}
              className="px-4 py-2.5 rounded-xl border border-gray-300 bg-white font-semibold text-sm hover:bg-gray-50 transition-colors"
            >
              Экспорт CSV
            </button>
          </div>
          <div className="space-y-3">
            {fills.length > 0 ? (
              fills.map((f) => (
                <div key={f.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${f.side === 'buy' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {f.side === 'buy' ? '↓' : '↑'}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {f.side === 'buy' ? 'Покупка' : 'Продажа'} {f.order.pair}
                      </div>
                      <div className="text-sm text-gray-500">{new Date(f.timestamp).toLocaleString('ru-RU')}</div>
                    </div>
                  </div>
                  <div className={`font-bold tabular-nums ${f.side === 'buy' ? 'text-green-600' : 'text-red-600'}`}>
                    {f.side === 'buy' ? '+' : '-'}{parseFloat(f.amount).toFixed(4)} @ {parseFloat(f.price).toLocaleString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4 text-3xl">💸</div>
                <div className="font-semibold text-gray-700 mb-1">Нет транзакций</div>
                <p className="text-sm text-gray-500">Сделки появятся после торговли</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg shadow-gray-200/40">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200">
            <h2 className="font-bold text-xl text-gray-900">История ордеров</h2>
            <div className="flex gap-2">
              {(["all", "open", "filled"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setOrderFilter(f)}
                  className={`px-4 py-2 rounded-xl border text-sm font-semibold transition-colors ${
                    orderFilter === f
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-gray-300 bg-white hover:bg-gray-50"
                  }`}
                >
                  {f === "all" ? "Все" : f === "open" ? "Открытые" : "Исполненные"}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            {(orderFilter === "all"
              ? orders
              : orderFilter === "open"
                ? orders.filter((o) => o.status === "open" || o.status === "partial")
                : orders.filter((o) => o.status === "filled")
            ).length > 0 ? (
              (orderFilter === "all"
                ? orders
                : orderFilter === "open"
                  ? orders.filter((o) => o.status === "open" || o.status === "partial")
                  : orders.filter((o) => o.status === "filled")
              ).map((o) => (
                <div key={o.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:bg-gray-50/50 transition-colors flex-wrap gap-3">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${o.side === 'buy' ? 'bg-green-500' : 'bg-red-500'}`} />
                    <div>
                      <div className="font-semibold text-gray-900">{o.pair} · {o.side === 'buy' ? 'Покупка' : 'Продажа'}</div>
                      <div className="text-sm text-gray-500 tabular-nums">
                        Цена: {o.price ? parseFloat(o.price).toLocaleString() : 'Рыночная'} · Кол-во: {parseFloat(o.amount).toFixed(4)}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">{new Date(o.createdAt).toLocaleString('ru-RU')}</div>
                    </div>
                  </div>
                  <span className={`px-4 py-2 rounded-xl text-xs font-bold ${
                    o.status === 'open' ? 'bg-green-100 text-green-800' :
                    o.status === 'filled' ? 'bg-blue-100 text-blue-800' :
                    o.status === 'partial' ? 'bg-amber-100 text-amber-800' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {o.status === 'open' ? 'Открыт' : o.status === 'filled' ? 'Исполнен' : o.status === 'partial' ? 'Частично' : 'Отменён'}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4 text-3xl">📋</div>
                <div className="font-semibold text-gray-700 mb-1">
                  {orderFilter === "all" ? "Нет ордеров" : orderFilter === "open" ? "Нет открытых ордеров" : "Нет исполненных ордеров"}
                </div>
                <p className="text-sm text-gray-500">
                  {orderFilter === "all" ? "Разместите ордер в разделе Торговля" : "Измените фильтр или разместите ордер"}
                </p>
                <Link href="/trade" className="inline-block mt-4 px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-colors">
                  Перейти в торговлю
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "settings" && (
        <div className="space-y-6">
          {/* Аккаунт и безопасность */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg shadow-gray-200/40">
            <h2 className="font-bold text-xl text-gray-900 mb-6">Аккаунт и безопасность</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-5 rounded-xl border border-gray-200">
                <div>
                  <div className="font-bold text-gray-900">Email</div>
                  <div className="text-sm text-gray-500 mt-1">{profile?.email ?? session?.user?.email ?? "—"}</div>
                </div>
                <button
                  onClick={async () => {
                    const v = prompt("Новый email:", profile?.email ?? "");
                    if (v && v.includes("@")) {
                      const r = await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: v }) });
                      if (r.ok) setProfile((p) => (p ? { ...p, email: v } : null));
                      else alert((await r.json()).error ?? "Ошибка");
                    }
                  }}
                  className="px-4 py-2 rounded-xl border border-gray-300 bg-white font-semibold text-sm hover:bg-gray-50"
                >
                  Изменить
                </button>
              </div>
              <div className="flex items-center justify-between p-5 rounded-xl border border-gray-200">
                <div>
                  <div className="font-bold text-gray-900">Телефон</div>
                  <div className="text-sm text-gray-500 mt-1">{profile?.phone || "Не указан"}</div>
                </div>
                <button
                  onClick={async () => {
                    const v = prompt("Номер телефона:", profile?.phone ?? "");
                    if (v !== null) {
                      const r = await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone: v || "" }) });
                      if (r.ok) setProfile((p) => (p ? { ...p, phone: v || "" } : null));
                    }
                  }}
                  className="px-4 py-2 rounded-xl border border-gray-300 bg-white font-semibold text-sm hover:bg-gray-50"
                >
                  {profile?.phone ? "Изменить" : "Привязать"}
                </button>
              </div>
              <div className="flex items-center justify-between p-5 rounded-xl border border-gray-200">
                <div>
                  <div className="font-bold text-gray-900">Двухфакторная аутентификация (2FA)</div>
                  <div className="text-sm text-gray-500 mt-1">TOTP (Google Authenticator и др.)</div>
                </div>
                {profile?.twoFactorEnabled ? (
                  <button onClick={() => setTwoFAModal("disable")} className="px-4 py-2 rounded-xl border border-amber-300 bg-amber-50 font-semibold text-sm text-amber-800 hover:bg-amber-100">
                    Выключить
                  </button>
                ) : (
                  <button
                    onClick={async () => {
                      const r = await fetch("/api/profile/2fa/setup");
                      if (!r.ok) return alert("Ошибка");
                      const d = await r.json();
                      setTwoFAQrUrl(d.qrUrl ?? "");
                      setTwoFAModal("setup");
                    }}
                    className="px-4 py-2 rounded-xl border border-gray-300 bg-white font-semibold text-sm hover:bg-gray-50"
                  >
                    Включить
                  </button>
                )}
              </div>
              <div className="flex items-center justify-between p-5 rounded-xl border border-gray-200">
                <div>
                  <div className="font-bold text-gray-900">Смена пароля</div>
                  <div className="text-sm text-gray-500 mt-1">Рекомендуем менять периодически</div>
                </div>
                <button onClick={() => setPwModal(true)} className="px-4 py-2 rounded-xl border border-gray-300 bg-white font-semibold text-sm hover:bg-gray-50">
                  Изменить
                </button>
              </div>
              <div className="flex items-center justify-between p-5 rounded-xl border border-gray-200">
                <div>
                  <div className="font-bold text-gray-900">Выйти на всех устройствах</div>
                  <div className="text-sm text-gray-500 mt-1">Все сессии будут завершены, потребуется вход снова</div>
                </div>
                <button
                  onClick={async () => {
                    if (!confirm("Завершить все сессии?")) return;
                    const r = await fetch("/api/profile/logout-all", { method: "POST" });
                    if (r.ok) handleLogout();
                  }}
                  className="px-4 py-2 rounded-xl border border-red-200 bg-red-50 font-semibold text-sm text-red-700 hover:bg-red-100"
                >
                  Выйти везде
                </button>
              </div>
            </div>
          </div>

          {/* Настройки */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg shadow-gray-200/40">
            <h2 className="font-bold text-xl text-gray-900 mb-6">Настройки</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Язык интерфейса</label>
                <select
                  value={String(profile?.settings?.language ?? "ru")}
                  onChange={async (e) => {
                    const v = e.target.value;
                    const r = await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ settings: { ...profile?.settings, language: v } }) });
                    if (r.ok) setProfile((p) => (p ? { ...p, settings: { ...p.settings, language: v } } : null));
                  }}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium"
                >
                  <option value="ru">Русский</option>
                  <option value="en">English</option>
                  <option value="kk">Қазақша</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Валюта отображения</label>
                <select
                  value={String(profile?.settings?.displayCurrency ?? "USDT")}
                  onChange={async (e) => {
                    const v = e.target.value;
                    const r = await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ settings: { ...profile?.settings, displayCurrency: v } }) });
                    if (r.ok) setProfile((p) => (p ? { ...p, settings: { ...p.settings, displayCurrency: v } } : null));
                  }}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium"
                >
                  <option value="USDT">USDT</option>
                  <option value="USD">USD</option>
                  <option value="KZT">KZT</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Часовой пояс</label>
                <select
                  value={String(profile?.settings?.timezone ?? "Asia/Almaty")}
                  onChange={async (e) => {
                    const v = e.target.value;
                    const r = await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ settings: { ...profile?.settings, timezone: v } }) });
                    if (r.ok) setProfile((p) => (p ? { ...p, settings: { ...p.settings, timezone: v } } : null));
                  }}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium"
                >
                  <option value="Asia/Almaty">Asia/Almaty</option>
                  <option value="Europe/Moscow">Europe/Moscow</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
              <div className="pt-2">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Уведомления</div>
                <div className="space-y-2">
                  {[
                    { key: "notifyEmail", label: "Email", desc: "Важные события" },
                    { key: "notifyOrders", label: "Ордера", desc: "Исполнение и отмена" },
                    { key: "notifyWithdrawals", label: "Выводы", desc: "Статус вывода" },
                    { key: "notifySecurity", label: "Безопасность", desc: "Вход, 2FA" },
                    { key: "notifyMarketing", label: "Маркетинг", desc: "Новости и акции" },
                  ].map(({ key, label, desc }) => (
                    <label key={key} className="flex items-center justify-between p-3 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50/50">
                      <div>
                        <span className="font-semibold text-gray-900">{label}</span>
                        <span className="text-sm text-gray-500 ml-2">{desc}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={!!profile?.settings?.[key]}
                        onChange={async (e) => {
                          const v = e.target.checked;
                          const r = await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ settings: { ...profile?.settings, [key]: v } }) });
                          if (r.ok) setProfile((p) => (p ? { ...p, settings: { ...p.settings, [key]: v } } : null));
                        }}
                        className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary/40"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Платёжные методы */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg shadow-gray-200/40">
            <h2 className="font-bold text-xl text-gray-900 mb-6">Платёжные методы</h2>
            <p className="text-sm text-gray-500 mb-4">Банковские счета для P2P и вывода</p>
            <div className="space-y-3">
              {bankAccounts.map((b) => (
                <div key={b.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-200">
                  <div>
                    <div className="font-semibold text-gray-900">{b.bankName}</div>
                    <div className="text-sm text-gray-500">{b.accountNumberMasked}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {b.verified && <span className="px-2 py-1 rounded-lg bg-green-100 text-green-700 text-xs font-medium">Проверен</span>}
                    <button
                      onClick={async () => {
                        if (!confirm("Удалить счёт?")) return;
                        const r = await fetch(`/api/profile/bank-accounts/${b.id}`, { method: "DELETE" });
                        if (r.ok) setBankAccounts((prev) => prev.filter((x) => x.id !== b.id));
                      }}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
              {bankAccounts.length === 0 && <div className="text-center py-8 text-gray-500 text-sm">Нет добавленных счетов</div>}
            </div>
            <button onClick={() => setBankModal(true)} className="mt-4 px-4 py-2.5 rounded-xl border border-primary bg-primary/10 text-primary font-semibold text-sm hover:bg-primary/20">
              Добавить счёт
            </button>
          </div>

          {/* Реферальная программа */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg shadow-gray-200/40">
            <h2 className="font-bold text-xl text-gray-900 mb-6">Реферальная программа</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Ваша реферальная ссылка</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    readOnly
                    value={`${typeof window !== "undefined" ? window.location.origin : ""}/ref/${session?.user?.id ?? "user"}`}
                    className="flex-1 rounded-xl border border-gray-300 bg-gray-50 text-gray-900 px-4 py-2.5 text-sm font-medium"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${typeof window !== "undefined" ? window.location.origin : ""}/ref/${session?.user?.id ?? "user"}`);
                      alert("Ссылка скопирована!");
                    }}
                    className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90"
                  >
                    Копировать
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 rounded-xl border border-gray-200 bg-gray-50/80">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Рефералов</div>
                  <div className="text-2xl font-bold text-gray-900">0</div>
                </div>
                <div className="p-5 rounded-xl border border-gray-200 bg-gray-50/80">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Заработано</div>
                  <div className="text-2xl font-bold text-gray-900">0 USDT</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модалки */}
      {pwModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4" onClick={(e) => e.target === e.currentTarget && setPwModal(false)}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl max-w-md w-full p-5 sm:p-6 max-h-[90dvh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-4">Смена пароля</h3>
            <input
              type="password"
              placeholder="Текущий пароль"
              value={pwForm.current}
              onChange={(e) => setPwForm((f) => ({ ...f, current: e.target.value }))}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm mb-3"
            />
            <input
              type="password"
              placeholder="Новый пароль (не менее 8 символов)"
              value={pwForm.new}
              onChange={(e) => setPwForm((f) => ({ ...f, new: e.target.value }))}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm mb-3"
            />
            <input
              type="password"
              placeholder="Повторите новый пароль"
              value={pwForm.confirm}
              onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => { setPwModal(false); setPwForm({ current: "", new: "", confirm: "" }); }} className="flex-1 py-2.5 rounded-xl border border-gray-300 font-semibold">Отмена</button>
              <button
                onClick={async () => {
                  if (pwForm.new.length < 8) { alert("Пароль не менее 8 символов"); return; }
                  if (pwForm.new !== pwForm.confirm) { alert("Пароли не совпадают"); return; }
                  const r = await fetch("/api/profile/change-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.new }) });
                  const d = await r.json();
                  if (r.ok) { setPwModal(false); setPwForm({ current: "", new: "", confirm: "" }); }
                  else alert(d.error ?? "Ошибка");
                }}
                className="flex-1 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
      {twoFAModal === "setup" && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4" onClick={(e) => e.target === e.currentTarget && (setTwoFAModal("off"), setTwoFACode(""), setTwoFAQrUrl(""))}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl max-w-md w-full p-5 sm:p-6 max-h-[90dvh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-2">Настройка 2FA</h3>
            <p className="text-sm text-gray-500 mb-4">Отсканируйте QR-код в приложении (Google Authenticator и др.) и введите код</p>
            {twoFAQrUrl && <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(twoFAQrUrl)}`} alt="QR" className="mx-auto mb-4 w-48 h-48" />}
            <input
              type="text"
              placeholder="Код из приложения"
              value={twoFACode}
              onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-center text-lg tracking-widest font-mono mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => { setTwoFAModal("off"); setTwoFACode(""); setTwoFAQrUrl(""); }} className="flex-1 py-2.5 rounded-xl border border-gray-300 font-semibold">Отмена</button>
              <button
                onClick={async () => {
                  const r = await fetch("/api/profile/2fa/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: twoFACode }) });
                  const d = await r.json();
                  if (r.ok) { setProfile((p) => (p ? { ...p, twoFactorEnabled: true } : null)); setTwoFAModal("off"); setTwoFACode(""); setTwoFAQrUrl(""); }
                  else alert(d.error ?? "Ошибка");
                }}
                className="flex-1 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90"
              >
                Подтвердить
              </button>
            </div>
          </div>
        </div>
      )}
      {twoFAModal === "disable" && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4" onClick={(e) => e.target === e.currentTarget && (setTwoFAModal("off"), setTwoFACode(""))}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl max-w-md w-full p-5 sm:p-6 max-h-[90dvh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-2">Выключить 2FA</h3>
            <p className="text-sm text-gray-500 mb-4">Введите код из приложения для отключения</p>
            <input
              type="text"
              placeholder="Код"
              value={twoFACode}
              onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-center text-lg tracking-widest font-mono mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => { setTwoFAModal("off"); setTwoFACode(""); }} className="flex-1 py-2.5 rounded-xl border border-gray-300 font-semibold">Отмена</button>
              <button
                onClick={async () => {
                  const r = await fetch("/api/profile/2fa/disable", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: twoFACode }) });
                  const d = await r.json();
                  if (r.ok) { setProfile((p) => (p ? { ...p, twoFactorEnabled: false } : null)); setTwoFAModal("off"); setTwoFACode(""); }
                  else alert(d.error ?? "Ошибка");
                }}
                className="flex-1 py-2.5 rounded-xl bg-amber-600 text-white font-semibold hover:bg-amber-700"
              >
                Выключить
              </button>
            </div>
          </div>
        </div>
      )}
      {bankModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4" onClick={(e) => e.target === e.currentTarget && setBankModal(false)}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl max-w-md w-full p-5 sm:p-6 max-h-[90dvh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-4">Добавить счёт</h3>
            <input
              placeholder="Название банка"
              value={bankForm.bankName}
              onChange={(e) => setBankForm((f) => ({ ...f, bankName: e.target.value }))}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm mb-3"
            />
            <input
              placeholder="Номер счёта (последние 4 цифры будут видны)"
              value={bankForm.accountNumber}
              onChange={(e) => setBankForm((f) => ({ ...f, accountNumber: e.target.value.replace(/\D/g, "") }))}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => setBankModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-300 font-semibold">Отмена</button>
              <button
                onClick={async () => {
                  const r = await fetch("/api/profile/bank-accounts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(bankForm) });
                  if (r.ok) {
                    const list = await fetch("/api/profile/bank-accounts").then((x) => x.json());
                    setBankAccounts(list);
                    setBankModal(false);
                    setBankForm({ bankName: "", accountNumber: "" });
                  } else {
                    const d = await r.json();
                    alert(d.error ?? "Ошибка");
                  }
                }}
                className="flex-1 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90"
              >
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
