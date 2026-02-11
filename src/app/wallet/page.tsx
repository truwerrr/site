"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { BalanceIcon, DepositIcon, WithdrawIcon, HistoryIcon } from "@/components/Icons";
import { useRates, priceInUsdt } from "@/hooks/useRates";

interface Balance {
  currency: string;
  available: string;
  locked: string;
}

interface Transaction {
  id: string;
  type: string;
  currency: string;
  amount: string;
  status: string;
  timestamp: string;
  description?: string;
}

const CURRENCY_ICONS: Record<string, string> = {
  BTC: "₿",
  ETH: "Ξ",
  USDT: "$",
  KZT: "₸",
};

const CURRENCY_NAMES: Record<string, string> = {
  BTC: "Bitcoin",
  ETH: "Ethereum",
  USDT: "Tether",
  KZT: "Казахстанский тенге",
};

export default function WalletPage() {
  const { data: session, status } = useSession();
  const { rates } = useRates();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'balances' | 'deposit' | 'withdraw' | 'history'>('balances');
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [depositMethod, setDepositMethod] = useState<string | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawError, setWithdrawError] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterCurrency, setFilterCurrency] = useState<string>("all");

  useEffect(() => {
    setMounted(true);
    if (status === "authenticated") {
      setLoading(true);
      Promise.all([fetchBalances(), fetchTransactions()]).finally(() => setLoading(false));
    }
  }, [status]);

  const fetchBalances = async () => {
    try {
      const res = await fetch("/api/balances");
      if (res.ok) {
        const data = await res.json();
        setBalances(data);
      }
    } catch (err) {
      console.error("Error fetching balances:", err);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await fetch("/api/wallet/history");
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
    }
  };

  const calculateTotalValue = () => {
    return balances.reduce((total, b) => {
      const price = priceInUsdt(rates, b.currency);
      const available = parseFloat(b.available);
      const locked = parseFloat(b.locked);
      return total + (available + locked) * price;
    }, 0);
  };

  const filteredTransactions = transactions.filter((t) => {
    if (filterType !== "all" && t.type !== filterType) return false;
    if (filterCurrency !== "all" && t.currency !== filterCurrency) return false;
    return true;
  });

  const handleWithdraw = async () => {
    if (!selectedCurrency || !withdrawAmount || !withdrawAddress.trim()) {
      setWithdrawError("Заполните все поля");
      return;
    }
    setWithdrawError("");
    setWithdrawLoading(true);
    try {
      const res = await fetch("/api/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currency: selectedCurrency,
          amount: withdrawAmount,
          address: withdrawAddress.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setWithdrawError(data.error || "Ошибка вывода");
        return;
      }
      setWithdrawAmount("");
      setWithdrawAddress("");
      await Promise.all([fetchBalances(), fetchTransactions()]);
    } catch {
      setWithdrawError("Ошибка сети");
    } finally {
      setWithdrawLoading(false);
    }
  };

  if (!mounted || status === "loading" || (status === "authenticated" && loading && balances.length === 0)) {
    return (
      <div className="container py-16 flex flex-col items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="mt-4 text-gray-500 font-medium">Загрузка...</p>
      </div>
    );
  }

  if (status !== "authenticated") {
    return (
      <div className="container py-10 max-w-2xl">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Кошелёк</h1>
        <p className="text-gray-500 mb-6">
          Мультивалютный кошелёк: храните и управляйте активами.{" "}
          <Link href="/sessions/signin" className="text-primary font-semibold hover:underline">
            Войдите
          </Link>
          , чтобы использовать кошелёк.
        </p>
      </div>
    );
  }

  const totalValue = calculateTotalValue();
  const inputClass = "w-full rounded-xl border border-gray-300 bg-white text-gray-900 px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary";
  const labelClass = "block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2";

  const tabs = [
    { id: 'balances', label: 'Балансы', icon: BalanceIcon },
    { id: 'deposit', label: 'Пополнить', icon: DepositIcon },
    { id: 'withdraw', label: 'Вывести', icon: WithdrawIcon },
    { id: 'history', label: 'История', icon: HistoryIcon },
  ];

  return (
    <div className="container py-8 max-w-5xl">
      <header className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-2">Кошелёк</h1>
        <p className="text-gray-500 text-lg">Управляйте активами и транзакциями</p>
        <div className="mt-4 h-px bg-gradient-to-r from-gray-200 via-gray-300 to-transparent" />
      </header>

      <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-primary/10 to-primary/5 p-6 mb-6 shadow-lg shadow-gray-200/40">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Общий баланс (USDT)</div>
        <div className="text-3xl font-bold text-gray-900 tabular-nums">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        <div className="text-sm text-gray-500 mt-1">{balances.length} {balances.length === 1 ? 'валюта' : balances.length < 5 ? 'валюты' : 'валют'}</div>
      </div>

      {/* Tabs — активный как на референсе: обводка снизу и по бокам, иконка в круге primary */}
      <div className="flex gap-1 p-1.5 rounded-2xl bg-gray-100 border border-gray-200/80 mb-6 overflow-x-auto">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-white text-primary shadow-md border border-gray-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                isActive ? 'bg-primary/15' : 'bg-gray-200'
              }`}>
                <IconComponent className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-gray-500'}`} />
              </div>
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'balances' && (
        <div className="space-y-4">
          {balances.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {balances.map((b) => {
                const available = parseFloat(b.available);
                const locked = parseFloat(b.locked);
                const total = available + locked;
                const price = priceInUsdt(rates, b.currency);
                const value = total * price;
                const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;
                return (
                  <div key={b.currency} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg shadow-gray-200/40 hover:shadow-xl transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/25 to-primary/10 flex items-center justify-center text-2xl font-bold text-primary/90">
                        {CURRENCY_ICONS[b.currency] || b.currency[0]}
                      </div>
                      <div>
                        <div className="font-bold text-lg text-gray-900">{b.currency}</div>
                        <div className="text-xs text-gray-500">{CURRENCY_NAMES[b.currency] || b.currency}</div>
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="text-xl font-bold text-gray-900 tabular-nums">{total.toFixed(4)}</div>
                      <div className="text-sm text-gray-500">≈ ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Доступно</span>
                        <span className="font-semibold text-gray-900 tabular-nums">{available.toFixed(4)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Заблок.</span>
                        <span className="font-semibold text-gray-900 tabular-nums">{locked.toFixed(4)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setSelectedCurrency(b.currency); setActiveTab('deposit'); }}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white hover:bg-primary/90 font-bold text-sm shadow-sm"
                      >
                        Пополнить
                      </button>
                      <button
                        onClick={() => { setSelectedCurrency(b.currency); setActiveTab('withdraw'); }}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 bg-white font-semibold text-sm hover:bg-gray-50 transition-colors"
                      >
                        Вывести
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-white p-16 text-center shadow-lg">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4 text-4xl">💼</div>
              <div className="font-semibold text-gray-700 mb-2">Нет балансов</div>
              <p className="text-sm text-gray-500 mb-4">Пополните счёт, чтобы начать</p>
              <button onClick={() => setActiveTab('deposit')} className="px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors">
                Пополнить счёт
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'deposit' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-6 shadow-lg shadow-gray-200/40">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Пополнить счёт</h2>
            <div className="mb-6 p-4 rounded-xl bg-gray-100 border border-gray-200 text-sm text-gray-700">
              Пополнение баланса производится администратором.
            </div>
            <div className="space-y-6">
              <div>
                <label className={labelClass}>Валюта</label>
                <select value={selectedCurrency || ""} onChange={(e) => setSelectedCurrency(e.target.value)} className={inputClass}>
                  <option value="">Выберите валюту</option>
                  {balances.map((b) => (
                    <option key={b.currency} value={b.currency}>{b.currency} — {CURRENCY_NAMES[b.currency] || b.currency}</option>
                  ))}
                </select>
              </div>

              {selectedCurrency && (
                <div>
                  <label className={labelClass}>Способ пополнения</label>
                  <div className="space-y-3">
                    {[
                      { id: "kaspi", title: "Kaspi Bank", desc: "Мгновенно через Kaspi QR", emoji: "🏦" },
                      { id: "homecredit", title: "Home Credit Bank", desc: "Мгновенное пополнение", emoji: "🏦" },
                      { id: "crypto", title: "Криптовалюта", desc: "Перевод с другого кошелька", emoji: "₿" },
                    ].map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setDepositMethod(method.id)}
                        className={`w-full p-4 rounded-xl border text-left transition-all ${
                          depositMethod === method.id
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-gray-200 hover:border-primary/40 hover:bg-gray-50/50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-bold text-gray-900">{method.title}</div>
                            <div className="text-sm text-gray-500 mt-0.5">{method.desc}</div>
                          </div>
                          <span className="text-2xl">{method.emoji}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {depositMethod && selectedCurrency && (
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-700">
                  Пополнение по выбранному способу производится администратором.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg shadow-gray-200/40">
            <h2 className="font-bold text-lg text-gray-900 mb-4">Информация</h2>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Комиссия</div>
                <div className="font-bold text-xl text-gray-900">0%</div>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Зачисление</div>
                <div className="font-semibold text-sm text-gray-900">Мгновенно (банки) · 1–3 подтв. (крипто)</div>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Банки</div>
                <div className="font-semibold text-sm text-gray-900">Kaspi Bank, Home Credit Bank</div>
              </div>
              <button className="w-full mt-2 px-4 py-2.5 rounded-xl border border-gray-300 font-semibold text-sm hover:bg-gray-50 transition-colors">
                Подробнее о платежах
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'withdraw' && (
        <div className="max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 shadow-lg shadow-gray-200/40">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Вывести средства</h2>
          <div className="space-y-5">
            <div>
              <label className={labelClass}>Валюта</label>
              <select value={selectedCurrency || ""} onChange={(e) => setSelectedCurrency(e.target.value)} className={inputClass}>
                <option value="">Выберите валюту</option>
                {balances.map((b) => (
                  <option key={b.currency} value={b.currency}>
                    {b.currency} (доступно: {parseFloat(b.available).toFixed(4)})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Сумма</label>
              <input
                type="number"
                step="any"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className={inputClass}
                placeholder="0.00"
              />
              {selectedCurrency && (
                <div className="text-xs text-gray-500 mt-1.5">
                  Доступно: <span className="font-semibold tabular-nums">{balances.find(b => b.currency === selectedCurrency)?.available || "0"}</span> {selectedCurrency}
                </div>
              )}
            </div>
            <div>
              <label className={labelClass}>Адрес кошелька</label>
              <input
                type="text"
                value={withdrawAddress}
                onChange={(e) => setWithdrawAddress(e.target.value)}
                className={inputClass}
                placeholder="Введите адрес"
              />
            </div>
            {withdrawError && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                {withdrawError}
              </div>
            )}
            <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200/80">
              <div className="font-semibold text-gray-900 mb-1">Комиссия сети</div>
              <div className="text-sm text-gray-700">Зависит от загрузки сети, рассчитывается при подтверждении</div>
            </div>
            <button
              onClick={handleWithdraw}
              disabled={withdrawLoading}
              className="w-full px-4 py-3.5 rounded-xl bg-primary text-white hover:bg-primary/90 font-bold shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {withdrawLoading ? "Отправка..." : "Вывести"}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-lg shadow-gray-200/40 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
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
            <div className="flex gap-2 flex-wrap">
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className={inputClass + " w-auto min-w-[140px]"} >
                <option value="all">Все типы</option>
                <option value="trade_buy">Покупки</option>
                <option value="trade_sell">Продажи</option>
                <option value="exchange">Обмен</option>
                <option value="withdraw">Вывод</option>
              </select>
              <select value={filterCurrency} onChange={(e) => setFilterCurrency(e.target.value)} className={inputClass + " w-auto min-w-[140px]"} >
                <option value="all">Все валюты</option>
                {Array.from(new Set(transactions.map(t => t.currency))).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="p-4">
            {filteredTransactions.length > 0 ? (
              <div className="space-y-3">
                {filteredTransactions.map((t) => {
                  const typeLabel = t.type === "trade_buy" ? "Покупка" : t.type === "trade_sell" ? "Продажа" : t.type === "exchange" ? "Обмен" : t.type === "withdraw" ? "Вывод" : t.type;
                  const typeStyle = t.type === "trade_buy" ? "bg-green-100 text-green-700" : t.type === "trade_sell" ? "bg-red-100 text-red-700" : t.type === "exchange" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700";
                  const amountStyle = t.type === "trade_buy" ? "text-green-600" : t.type === "trade_sell" ? "text-red-600" : "text-gray-700";
                  const sign = t.type === "trade_buy" ? "+" : t.type === "withdraw" ? "-" : "";
                  return (
                    <div key={t.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${typeStyle}`}>
                          {t.type === "trade_buy" ? "↓" : t.type === "trade_sell" ? "↑" : t.type === "exchange" ? "⇄" : "→"}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{t.description || typeLabel}</div>
                          <div className="text-sm text-gray-500">{new Date(t.timestamp).toLocaleString("ru-RU")}</div>
                        </div>
                      </div>
                      <div className={`font-bold tabular-nums ${amountStyle}`}>
                        {sign}{parseFloat(t.amount).toFixed(4)} {t.currency}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4 text-3xl">📋</div>
                <div className="font-semibold text-gray-700 mb-1">Нет транзакций</div>
                <p className="text-sm text-gray-500">История сделок появится после торговли</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
