"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";

const TradingChart = dynamic(() => import("@/components/TradingChart"), {
  ssr: false,
  loading: () => (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="h-[320px] sm:h-[400px] bg-[#fafbfc] flex items-center justify-center text-gray-500 text-sm">
        Загрузка графика...
      </div>
    </div>
  ),
});

interface Market {
  base: string;
  quote: string;
  last: string;
  high24h: string;
  low24h: string;
  volumeBase24h: string;
}

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

interface OrderBookEntry {
  price: string;
  amount: string;
  total?: string;
}

function priceDecimals(pair: string): number {
  return pair.includes("KZT") || pair.includes("USDT") ? 2 : 4;
}
function amountDecimals(pair: string): number {
  return pair.includes("KZT") ? 2 : 4;
}
function formatPrice(value: string | number, decimals: number): string {
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(n)) return "";
  return n.toFixed(decimals);
}

export default function TradePage() {
  const { data: session, status } = useSession();
  const [selectedPair, setSelectedPair] = useState("BTC/USDT");
  const [orderType, setOrderType] = useState<"limit" | "market" | "stop" | "stop-limit">("limit");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [price, setPrice] = useState("");
  const [stopPrice, setStopPrice] = useState("");
  const [amount, setAmount] = useState("");
  const [markets, setMarkets] = useState<Market[]>([]);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderbook, setOrderbook] = useState<{ bids: OrderBookEntry[]; asks: OrderBookEntry[] }>({ bids: [], asks: [] });
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchMarket, setSearchMarket] = useState("");
  const [pairPickerOpen, setPairPickerOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState("");
  const [orderFilter, setOrderFilter] = useState<"all" | "open" | "filled">("all");
  const [orderPage, setOrderPage] = useState(1);
  const [lastDataUpdate, setLastDataUpdate] = useState(Date.now());
  const [secondsAgo, setSecondsAgo] = useState(0);
  const ACTIVITY_LINES = [
    "arman_cryp1 купил 0.02 BTC",
    "***7234 продал 1,200 USDT",
    "crypto_almaty купил 1.5 ETH",
    "ardakp2p продал 0.05 BTC",
    "***9156 купил 800 USDT",
    "ne_tvoya_obmennica продал 0.1 ETH",
    "p2p_kaspi купил 2,000 USDT",
    "***4482 продал 0.01 BTC",
    "kz_crypto_pro купил 3 ETH",
  ];
  const [activityFeed, setActivityFeed] = useState<string[]>(() =>
    [ACTIVITY_LINES[0], ACTIVITY_LINES[2]]
  );
  const streamEffectCancelledRef = useRef(false);

  useEffect(() => {
    const tick = setInterval(() => setSecondsAgo(Math.floor((Date.now() - lastDataUpdate) / 1000)), 1000);
    return () => clearInterval(tick);
  }, [lastDataUpdate]);

  useEffect(() => {
    const id = setInterval(() => {
      const line = ACTIVITY_LINES[Math.floor(Math.random() * ACTIVITY_LINES.length)];
      setActivityFeed((prev) => [...prev.slice(-4), line]);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const ORDERS_PER_PAGE = 10;
  const filteredOrdersByStatus = orders.filter((o) => {
    if (orderFilter === "open") return o.status === "open" || o.status === "partial";
    if (orderFilter === "filled") return o.status === "filled";
    return true;
  });
  const totalOrderPages = Math.max(1, Math.ceil(filteredOrdersByStatus.length / ORDERS_PER_PAGE));
  const paginatedOrders = filteredOrdersByStatus.slice(
    (orderPage - 1) * ORDERS_PER_PAGE,
    orderPage * ORDERS_PER_PAGE
  );

  useEffect(() => {
    setOrderPage(1);
  }, [orderFilter]);

  useEffect(() => {
    // Автозапуск симулятора при загрузке страницы
    fetch("/api/init").catch(() => {});
    
    if (status === "authenticated") {
      fetchMarkets();
      fetchBalances();
      fetchOrders();
    }
  }, [status]);

  useEffect(() => {
    if (status === "authenticated" && selectedPair) {
      streamEffectCancelledRef.current = false;
      fetchOrderbook();
      fetchTrades();

      const eventSource = new EventSource(`/api/stream?pair=${encodeURIComponent(selectedPair)}`);
      const UI_DEBOUNCE_MS = 15000;
      let lastPriceUpdate = 0;
      let lastOrderbookUpdate = 0;
      let lastTradesUpdate = 0;
      let pollInterval: ReturnType<typeof setInterval> | null = null;

      eventSource.onmessage = (event) => {
        if (streamEffectCancelledRef.current) return;
        try {
          const data = JSON.parse(event.data);

          if (data.type === "tick") {
            const now = Date.now();
            if (now - lastPriceUpdate >= UI_DEBOUNCE_MS) {
              lastPriceUpdate = now;
              if (streamEffectCancelledRef.current) return;
              if (!price || Math.abs(parseFloat(price) - parseFloat(data.price)) > 0.01) {
                setPrice(formatPrice(data.price, priceDecimals(selectedPair)));
              }
              setMarkets((prev) =>
                prev.map((m) => {
                  const pair = `${m.base}/${m.quote}`;
                  if (pair === selectedPair) {
                    return {
                      ...m,
                      last: data.price,
                      high24h: data.high24h || m.high24h,
                      low24h: data.low24h || m.low24h,
                    };
                  }
                  return m;
                })
              );
            }
          } else if (data.type === "orderbook") {
            const now = Date.now();
            if (now - lastOrderbookUpdate >= UI_DEBOUNCE_MS) {
              lastOrderbookUpdate = now;
              if (streamEffectCancelledRef.current) return;
              let bidTotal = 0;
              const bidsWithTotal = data.bids.map((bid: OrderBookEntry) => {
                bidTotal += parseFloat(bid.amount);
                return { ...bid, total: bidTotal.toString() };
              });
              
              let askTotal = 0;
              const asksWithTotal = data.asks.reverse().map((ask: OrderBookEntry) => {
                askTotal += parseFloat(ask.amount);
                return { ...ask, total: askTotal.toString() };
              }).reverse();
              
              setOrderbook({ bids: bidsWithTotal, asks: asksWithTotal });
              setLastDataUpdate(Date.now());
            }
          } else if (data.type === "trades" && data.trades.length > 0) {
            const now = Date.now();
            if (now - lastTradesUpdate >= UI_DEBOUNCE_MS) {
              lastTradesUpdate = now;
              if (streamEffectCancelledRef.current) return;
              setTrades((prev) => {
                const newTrades = data.trades.map((t: any) => ({
                  id: `${t.timestamp}-${t.price}`,
                  pair: selectedPair,
                  price: t.price,
                  amount: t.amount,
                  buyOrderId: t.side === "buy" ? "bot" : null,
                  sellOrderId: t.side === "sell" ? "bot" : null,
                  timestamp: new Date(t.timestamp).toISOString(),
                }));
                return [...newTrades, ...prev].slice(0, 50);
              });
              setLastDataUpdate(Date.now());
            }
          }
        } catch (err) {
          console.error("Error parsing SSE data:", err);
        }
      };
      
      eventSource.onerror = () => {
        if (pollInterval) return;
        pollInterval = setInterval(() => {
          fetchOrderbook();
          fetchTrades();
        }, 15000);
      };

      return () => {
        streamEffectCancelledRef.current = true;
        if (pollInterval) clearInterval(pollInterval);
        eventSource.close();
      };
    }
  }, [selectedPair, status]);

  const fetchMarkets = async () => {
    try {
      const res = await fetch("/api/markets");
      const data = await res.json();
      setMarkets(data);
      if (data.length > 0 && !price) {
        const market = data.find((m: Market) => `${m.base}/${m.quote}` === selectedPair);
        if (market) setPrice(formatPrice(market.last, priceDecimals(selectedPair)));
      }
    } catch (err) {
      console.error("Error fetching markets:", err);
    }
  };

  const fetchBalances = async () => {
    try {
      const res = await fetch("/api/balances");
      const data = await res.json();
      setBalances(data);
    } catch (err) {
      console.error("Error fetching balances:", err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      setOrders(data);
      setLastDataUpdate(Date.now());
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  const fetchOrderbook = async () => {
    try {
      const res = await fetch(`/api/markets/${selectedPair}/orderbook`);
      const data = await res.json();
      if (streamEffectCancelledRef.current) return;

      let bidTotal = 0;
      const bidsWithTotal = data.bids.map((bid: OrderBookEntry) => {
        bidTotal += parseFloat(bid.amount);
        return { ...bid, total: bidTotal.toString() };
      });
      let askTotal = 0;
      const asksWithTotal = data.asks.reverse().map((ask: OrderBookEntry) => {
        askTotal += parseFloat(ask.amount);
        return { ...ask, total: askTotal.toString() };
      }).reverse();
      setOrderbook({ bids: bidsWithTotal, asks: asksWithTotal });
      setLastDataUpdate(Date.now());
    } catch (err) {
      if (streamEffectCancelledRef.current) return;
      console.error("Error fetching orderbook:", err);
    }
  };

  const fetchTrades = async () => {
    try {
      const res = await fetch(`/api/markets/${selectedPair}/trades?limit=50`);
      const data = await res.json();
      if (streamEffectCancelledRef.current) return;
      setTrades(data);
    } catch (err) {
      if (streamEffectCancelledRef.current) return;
      console.error("Error fetching trades:", err);
    }
  };

  const handlePlaceOrder = async () => {
    if (!amount || (orderType !== "market" && !price) || ((orderType === "stop" || orderType === "stop-limit") && !stopPrice)) {
      setError("Заполните все обязательные поля");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pair: selectedPair,
          side,
          type: orderType,
          amount,
          price: orderType !== "market" ? price : undefined,
          stopPrice: (orderType === "stop" || orderType === "stop-limit") ? stopPrice : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Ошибка размещения ордера");
      }

      await fetchOrders();
      await fetchBalances();
      setAmount("");
      setPrice("");
      setStopPrice("");
    } catch (err: any) {
      setError(err.message || "Ошибка размещения ордера");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: "DELETE" });
      if (res.ok) {
        await fetchOrders();
        await fetchBalances();
      }
    } catch (err) {
      console.error("Error cancelling order:", err);
    }
  };

  const handlePriceClick = (p: string) => {
    setPrice(formatPrice(p, priceDecimals(selectedPair)));
  };

  const handlePercentageClick = (percentage: number) => {
    const [base, quote] = selectedPair.split("/");
    const balance = side === "buy" 
      ? balances.find((b) => b.currency === quote)
      : balances.find((b) => b.currency === base);
    
    if (balance) {
      const available = parseFloat(balance.available);
      if (orderType === "market") {
        setAmount((available * percentage / 100).toFixed(4));
      } else if (price) {
        const total = available * percentage / 100;
        setAmount((total / parseFloat(price)).toFixed(4));
      }
    }
  };

  const selectedMarket = markets.find((m) => `${m.base}/${m.quote}` === selectedPair);
  const [base, quote] = selectedPair.split("/");
  const baseBalance = balances.find((b) => b.currency === base);
  const quoteBalance = balances.find((b) => b.currency === quote);

  const filteredMarkets = markets.filter((m) => {
    const pair = `${m.base}/${m.quote}`;
    return pair.toLowerCase().includes(searchMarket.toLowerCase());
  });

  const mobileFilteredMarkets = markets.filter((m) => {
    const pair = `${m.base}/${m.quote}`;
    return pair.toLowerCase().includes(mobileSearch.toLowerCase());
  });

  const maxBidTotal = orderbook.bids.length > 0 
    ? Math.max(...orderbook.bids.map(b => parseFloat(b.total || "0")))
    : 1;
  const maxAskTotal = orderbook.asks.length > 0
    ? Math.max(...orderbook.asks.map(a => parseFloat(a.total || "0")))
    : 1;

  if (status === "loading") {
    return (
      <div className="container py-10">
        <div className="text-center">Загрузка...</div>
      </div>
    );
  }

  if (status !== "authenticated") {
    return (
      <div className="container py-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">Торговля</h1>
        <p className="text-muted-foreground mb-6 max-w-prose">
          Торгуйте криптовалютами на официальной платформе ATAIX Eurasia.
        </p>
        <div className="flex flex-wrap gap-3 mb-8">
          <Link href="/sessions/signin" className="px-4 py-2 rounded bg-primary text-white hover:opacity-90">
            Войти в торговлю
          </Link>
          <Link href="/sessions/signup" className="px-4 py-2 rounded border hover:bg-gray-50">
            Зарегистрироваться
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#f5f6f8]">
      <div className="w-full max-w-[1600px] mx-auto px-2 sm:px-4 md:px-6 py-4 sm:py-6 overflow-x-hidden">
        {/* Мобильная кнопка выбора пары — вне сетки */}
        <div className="lg:hidden mb-3">
          <button
            type="button"
            onClick={() => setPairPickerOpen(true)}
            className="w-full flex items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white shadow-sm px-4 py-3 text-left hover:bg-gray-50 active:bg-gray-100"
          >
            <span className="font-semibold text-gray-900">{selectedPair}</span>
            <span className="text-gray-500 text-sm">
              {selectedMarket ? `$${formatPrice(selectedMarket.last, priceDecimals(selectedPair))}` : "—"}
            </span>
            <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 w-full overflow-x-hidden">
        {/* Left Sidebar - Markets (только десктоп) */}
        <div className="hidden lg:block lg:col-span-2 space-y-4 w-full min-w-0">
          <div className="rounded-xl border bg-white shadow-sm w-full min-w-0 overflow-hidden">
            <div className="p-3 border-b">
              <h2 className="font-semibold text-sm mb-2">Рынки</h2>
              <input
                type="text"
                placeholder="Поиск..."
                value={searchMarket}
                onChange={(e) => setSearchMarket(e.target.value)}
                className="w-full rounded border-2 border-[#edb419] bg-white text-[#2f2d42] px-2 py-1.5 text-xs max-w-full"
              />
            </div>
            <div className="max-h-[600px] overflow-y-auto overflow-x-hidden">
              {filteredMarkets.map((m) => {
                const pair = `${m.base}/${m.quote}`;
                const lastPrice = parseFloat(m.last || "0");
                const low24h = parseFloat(m.low24h || "0");
                const change = low24h > 0 ? ((lastPrice - low24h) / low24h) * 100 : 0;
                return (
                  <button
                    key={pair}
                    onClick={() => {
                      setSelectedPair(pair);
                      setPrice(formatPrice(m.last, priceDecimals(pair)));
                    }}
                    className={`w-full p-3 text-left transition-colors border-b last:border-b-0 ${
                      selectedPair === pair ? "bg-primary/10 border-l-4 border-l-primary" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm text-gray-900">{pair}</span>
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${change >= 0 ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"}`}>
                        {change >= 0 ? "+" : ""}{change.toFixed(2)}%
                      </span>
                    </div>
                    <div className="text-sm font-bold text-gray-900">${lastPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}</div>
                    <div className="text-xs text-gray-500 mt-0.5">Объём: {parseFloat(m.volumeBase24h || "0").toFixed(2)} {m.base}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border bg-white shadow-sm p-4">
            <h2 className="font-semibold text-sm mb-3">Баланс</h2>
            <div className="space-y-2.5">
              {balances.slice(0, 6).map((b) => {
                const total = parseFloat(b.available) + parseFloat(b.locked);
                return (
                  <div key={b.currency} className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                    <div>
                      <div className="font-semibold text-sm text-gray-900">{b.currency}</div>
                      <div className="text-xs text-gray-500">
                        {parseFloat(b.available).toFixed(4)} / {parseFloat(b.locked).toFixed(4)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-sm text-gray-900">{total.toFixed(4)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Trading Area */}
        <div className="lg:col-span-7 space-y-4 w-full min-w-0 overflow-x-hidden">
          <TradingChart pair={selectedPair} />

          <div className="grid md:grid-cols-2 gap-4">
            {/* Order Form — визуально как на референсе */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm w-full min-w-0 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <div className="flex border-b border-gray-200 -mb-px">
                  <button
                    type="button"
                    onClick={() => setSide("buy")}
                    className={`px-4 py-2.5 text-sm font-semibold transition-colors border-b-2 -mb-px ${
                      side === "buy"
                        ? "border-[#5b5cf6] text-[#5b5cf6]"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Купить
                  </button>
                  <button
                    type="button"
                    onClick={() => setSide("sell")}
                    className={`px-4 py-2.5 text-sm font-semibold transition-colors border-b-2 -mb-px ${
                      side === "sell"
                        ? "border-[#5b5cf6] text-[#5b5cf6]"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Продать
                </button>
                </div>
                <div className="flex gap-2 mt-3">
                  {[25, 50, 75, 100].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handlePercentageClick(p)}
                      className="px-2 py-1.5 rounded text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700"
                    >
                      {p}%
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 space-y-4">
                <div>
                  <div className="flex gap-1 p-1 rounded-xl bg-gray-100 border border-gray-200/80 mb-3">
                    {[
                      { value: "limit", label: "Лимит" },
                      { value: "market", label: "Маркет" },
                      { value: "stop", label: "Stop" },
                      { value: "stop-limit", label: "Stop-Limit" },
                    ].map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setOrderType(type.value as any)}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                          orderType === type.value
                            ? "bg-gradient-to-r from-[#5b5cf6] to-[#6f4fe6] text-white shadow-sm"
                            : "text-gray-600 hover:bg-white/70"
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {(orderType === "stop" || orderType === "stop-limit") && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Stop цена ({quote})</label>
                    <input
                      type="number"
                      step={priceDecimals(selectedPair) === 2 ? "0.01" : "0.0001"}
                      min="0"
                      value={stopPrice}
                      onChange={(e) => setStopPrice(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white text-[#2f2d42] px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#5b5cf6]/30 focus:border-[#5b5cf6]"
                      placeholder="0"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    {side === "buy" ? `Сумма ${quote} на покупку` : `Количество ${base}`}
                  </label>
                  <input
                    type="number"
                    step={amountDecimals(selectedPair) === 2 ? "0.01" : "0.0001"}
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white text-[#2f2d42] px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#5b5cf6]/30 focus:border-[#5b5cf6] font-mono tabular-nums"
                    placeholder="0"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {side === "buy" ? "Текущий баланс" : "Доступно"}: {side === "buy" ? (quoteBalance ? formatPrice(quoteBalance.available, amountDecimals(selectedPair)) : "0.00") : (baseBalance ? formatPrice(baseBalance.available, amountDecimals(selectedPair)) : "0.00")} {side === "buy" ? quote : base}
                  </div>
                </div>

                {orderType !== "market" && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Цена за 1 {base}</label>
                    <input
                      type="number"
                      step={priceDecimals(selectedPair) === 2 ? "0.01" : "0.0001"}
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white text-[#2f2d42] px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#5b5cf6]/30 focus:border-[#5b5cf6] font-mono tabular-nums"
                      placeholder="0"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Доступный баланс: {quoteBalance ? formatPrice(quoteBalance.available, amountDecimals(selectedPair)) : "0.00"} {quote}
                    </div>
                  </div>
                )}

                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  Good til canceled (GTC)
                </label>

                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Сумма:</span>
                    <span className="font-medium text-gray-900 tabular-nums">
                      {price && amount ? formatPrice(parseFloat(amount) * parseFloat(price), priceDecimals(selectedPair)) : "0.00"} {quote}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Комиссия (до ~0.2%):</span>
                    <span className="font-medium text-gray-900 tabular-nums">
                      {price && amount
                        ? formatPrice(parseFloat(amount) * parseFloat(price) * 0.002, priceDecimals(selectedPair))
                        : "0.00"}{" "}
                      {quote}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold text-gray-900 pt-1 border-t border-gray-100">
                    <span>Всего:</span>
                    <span className="tabular-nums">
                      {price && amount ? formatPrice(parseFloat(amount) * parseFloat(price), priceDecimals(selectedPair)) : "0.00"} {quote}
                    </span>
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                    {error}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className={`w-full px-4 py-3.5 rounded-xl text-white font-bold shadow-md transition-all touch-manipulation ${
                    side === "buy"
                      ? "bg-primary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                      : "bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  }`}
                >
                  {loading ? "Размещение..." : side === "buy" ? "КУПИТЬ" : "ПРОДАТЬ"}
                </button>
              </div>
            </div>

            {/* Книга ордеров — как на референсе: покупка сверху, продажа снизу */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm w-full min-w-0 overflow-hidden">
              <div className="p-3 sm:p-4 border-b border-gray-100">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-sm text-gray-900">Ордеры на покупку</h3>
                  <span className="text-[10px] text-gray-400 tabular-nums">
                    {secondsAgo < 3 ? "только что" : `обновлено ${secondsAgo} сек назад`}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Объём: {orderbook.bids.reduce((s, b) => s + parseFloat(b.total || "0"), 0).toLocaleString(undefined, { maximumFractionDigits: 2 })} {base}
                </p>
              </div>
              <div className="p-2 overflow-x-hidden">
                <div className="text-[10px] uppercase tracking-wide text-gray-500 mb-1.5 px-2 flex justify-between gap-2 font-medium">
                  <span className="min-w-0 flex-1 text-right w-20">ВСЕГО ({quote})</span>
                  <span className="min-w-0 flex-1 text-right w-16">СУММА ({base})</span>
                  <span className="min-w-0 flex-1 text-right w-20">ЦЕНА ({quote})</span>
                </div>
                <div className="space-y-0 max-h-[200px] overflow-y-auto font-mono text-xs tabular-nums">
                  {orderbook.bids.slice(0, 12).map((bid, i) => {
                    const width = maxBidTotal > 0 ? (parseFloat(bid.total || "0") / maxBidTotal) * 100 : 0;
                    return (
                      <div
                        key={`bid-${i}`}
                        className="flex justify-between gap-2 cursor-pointer hover:bg-green-50/50 py-1 px-2 rounded relative min-w-0"
                        onClick={() => handlePriceClick(bid.price)}
                      >
                        <div className="absolute left-0 top-0 bottom-0 rounded bg-green-500/10" style={{ width: `${width}%` }} aria-hidden />
                        <span className="relative z-10 min-w-0 flex-1 text-right text-gray-700">{formatPrice(bid.total || "0", amountDecimals(selectedPair))}</span>
                        <span className="relative z-10 min-w-0 flex-1 text-right font-medium text-gray-900">{formatPrice(bid.amount, amountDecimals(selectedPair))}</span>
                        <span className="relative z-10 min-w-0 flex-1 text-right font-medium text-green-600 w-20">{formatPrice(bid.price, priceDecimals(selectedPair))}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="p-2 border-t border-gray-100 bg-amber-50/30">
                <div className="flex justify-between gap-2 py-1.5 px-2 font-semibold text-sm">
                  <span className="text-gray-900 tabular-nums">
                    {selectedMarket ? formatPrice(selectedMarket.last, priceDecimals(selectedPair)) : "—"}
                  </span>
                  <span className="text-gray-500 text-xs font-normal">Последняя цена</span>
                </div>
              </div>
              <div className="p-3 sm:p-4 border-t border-gray-100">
                <h3 className="font-semibold text-sm text-gray-900">Ордеры на продажу</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Объём: {orderbook.asks.reduce((s, a) => s + parseFloat(a.total || "0"), 0).toLocaleString(undefined, { maximumFractionDigits: 2 })} {base}
                </p>
              </div>
              <div className="p-2 overflow-x-hidden">
                <div className="text-[10px] uppercase tracking-wide text-gray-500 mb-1.5 px-2 flex justify-between gap-2 font-medium">
                  <span className="min-w-0 flex-1 text-right w-20">ЦЕНА ({quote})</span>
                  <span className="min-w-0 flex-1 text-right w-16">СУММА ({base})</span>
                  <span className="min-w-0 flex-1 text-right w-20">ВСЕГО ({quote})</span>
                </div>
                <div className="space-y-0 max-h-[200px] overflow-y-auto font-mono text-xs tabular-nums">
                  {orderbook.asks.slice(0, 12).reverse().map((ask, i) => {
                    const width = maxAskTotal > 0 ? (parseFloat(ask.total || "0") / maxAskTotal) * 100 : 0;
                    return (
                      <div
                        key={`ask-${i}`}
                        className="flex justify-between gap-2 cursor-pointer hover:bg-red-50/50 py-1 px-2 rounded relative min-w-0"
                        onClick={() => handlePriceClick(ask.price)}
                      >
                        <div className="absolute left-0 top-0 bottom-0 rounded bg-red-500/10" style={{ width: `${width}%` }} aria-hidden />
                        <span className="relative z-10 min-w-0 flex-1 text-right font-medium text-red-600 w-20">{formatPrice(ask.price, priceDecimals(selectedPair))}</span>
                        <span className="relative z-10 min-w-0 flex-1 text-right font-medium text-gray-900">{formatPrice(ask.amount, amountDecimals(selectedPair))}</span>
                        <span className="relative z-10 min-w-0 flex-1 text-right text-gray-700">{formatPrice(ask.total || "0", amountDecimals(selectedPair))}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Orders History — 10 на страницу, фильтры, пагинация */}
          <div className="rounded-xl border bg-white shadow-sm w-full min-w-0 overflow-hidden">
            <div className="p-4 border-b">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold text-sm">История ордеров</h3>
                <div className="flex gap-1.5 text-xs">
                  {(["all", "open", "filled"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setOrderFilter(f)}
                      className={`px-2.5 py-1.5 rounded-lg transition-colors ${
                        orderFilter === f ? "bg-primary/15 text-primary font-medium" : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                      }`}
                    >
                      {f === "all" ? "Все" : f === "open" ? "Открытые" : "Исполненные"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-3 sm:p-4 overflow-x-hidden">
              {paginatedOrders.length > 0 ? (
                <>
                  <div className="space-y-2 overflow-x-hidden">
                    {paginatedOrders.map((o) => (
                      <div key={o.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-2 sm:p-3 rounded border hover:bg-gray-50 text-xs min-w-0">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${o.side === "buy" ? "bg-green-500" : "bg-red-500"}`} />
                          <div className="min-w-0">
                            <div className="font-semibold text-gray-900 truncate">{o.pair}</div>
                            <div className="text-gray-500 text-xs truncate">{new Date(o.createdAt).toLocaleString()}</div>
                          </div>
                        </div>
                        <div className="text-left sm:text-right min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {o.price ? parseFloat(o.price).toLocaleString() : "Рыночная"}
                          </div>
                          <div className="text-gray-500 text-xs truncate">
                            {parseFloat(o.remaining).toFixed(4)} / {parseFloat(o.amount).toFixed(4)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-1 rounded text-xs whitespace-nowrap ${
                            o.status === "open" ? "bg-green-100 text-green-700" :
                            o.status === "filled" ? "bg-blue-100 text-blue-700" :
                            o.status === "partial" ? "bg-yellow-100 text-yellow-700" :
                            "bg-gray-100 text-gray-700"
                          }`}>
                            {o.status === "open" ? "Открыт" : o.status === "filled" ? "Исполнен" : o.status === "partial" ? "Частично" : "Отменен"}
                          </span>
                          {(o.status === "open" || o.status === "partial") && (
                            <button
                              onClick={() => handleCancelOrder(o.id)}
                              className="px-2 py-1 rounded border hover:bg-red-50 text-red-600 text-xs whitespace-nowrap"
                            >
                              Отменить
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {totalOrderPages > 1 && (
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                      <span className="text-gray-500">
                        Страница {orderPage} из {totalOrderPages} · всего {filteredOrdersByStatus.length}
                      </span>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => setOrderPage((p) => Math.max(1, p - 1))}
                          disabled={orderPage <= 1}
                          className="px-2.5 py-1.5 rounded border bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                          Назад
                        </button>
                        <button
                          type="button"
                          onClick={() => setOrderPage((p) => Math.min(totalOrderPages, p + 1))}
                          disabled={orderPage >= totalOrderPages}
                          className="px-2.5 py-1.5 rounded border bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                          Вперёд
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center text-gray-500 py-8">Нет ордеров</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-3 space-y-4 w-full min-w-0 overflow-x-hidden">
          {/* Лента активности — что-то меняется */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm w-full min-w-0 overflow-hidden">
            <div className="p-3 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-sm text-gray-900">Активность</h2>
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" title="В реальном времени" />
            </div>
            <div className="p-2 min-h-[80px]">
              {activityFeed.length === 0 ? (
                <p className="text-xs text-gray-400 py-2">Сделки появятся здесь...</p>
              ) : (
                <ul className="space-y-1.5 text-xs text-gray-700">
                  {activityFeed.map((line, i) => (
                    <li key={`${i}-${line}`} className="flex items-center gap-2 py-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                      {line}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="rounded-xl border bg-white shadow-sm w-full min-w-0 overflow-hidden">
            <div className="p-3 sm:p-4 border-b">
              <h2 className="font-semibold text-sm">Активные ордера</h2>
            </div>
            <div className="p-3 sm:p-4 overflow-x-hidden">
              {orders.filter((o) => o.status === "open" || o.status === "partial").length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto overflow-x-hidden">
                  {orders
                    .filter((o) => o.status === "open" || o.status === "partial")
                    .map((o) => (
                      <div key={o.id} className="p-3 rounded-lg border hover:bg-gray-50">
                        <div className="flex justify-between mb-2">
                          <span className="font-semibold text-sm text-gray-900">{o.pair}</span>
                          <span className={`text-xs font-medium px-2 py-1 rounded ${
                            o.side === "buy" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          }`}>
                            {o.side === "buy" ? "Покупка" : "Продажа"}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 mb-1">
                          Цена: <span className="font-medium">{o.price ? parseFloat(o.price).toLocaleString() : "Рыночная"}</span>
                        </div>
                        <div className="text-xs text-gray-600 mb-2">
                          Осталось: <span className="font-medium">{parseFloat(o.remaining).toFixed(4)}</span> / {parseFloat(o.amount).toFixed(4)}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                          <div 
                            className={`h-1.5 rounded-full ${o.side === "buy" ? "bg-green-500" : "bg-red-500"}`}
                            style={{ width: `${((parseFloat(o.amount) - parseFloat(o.remaining)) / parseFloat(o.amount)) * 100}%` }}
                          />
                        </div>
                        <button
                          onClick={() => handleCancelOrder(o.id)}
                          className="w-full px-3 py-1.5 rounded border text-xs hover:bg-red-50 text-red-600 font-medium"
                        >
                          Отменить
                        </button>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500 text-center py-8">Нет активных ордеров</div>
              )}
            </div>
          </div>

          <div className="rounded-xl border bg-white shadow-sm w-full min-w-0 overflow-hidden">
            <div className="p-3 sm:p-4 border-b">
              <h2 className="font-semibold text-sm">Последние сделки</h2>
            </div>
            <div className="p-2 overflow-x-hidden">
              <div className="text-xs text-gray-500 mb-2 px-2 flex justify-between gap-2">
                <span className="min-w-0 flex-1 text-right">Цена</span>
                <span className="min-w-0 flex-1 text-right">Кол-во</span>
                <span className="min-w-0 flex-1 text-right">Время</span>
              </div>
              <div className="space-y-0.5 text-xs max-h-96 overflow-y-auto overflow-x-hidden">
                {trades.slice(0, 50).map((trade, i) => (
                  <div key={i} className="flex justify-between gap-2 px-2 py-1 hover:bg-gray-50 rounded min-w-0">
                    <span className={`font-medium min-w-0 flex-1 text-right truncate ${trade.buyOrderId ? "text-green-600" : "text-red-600"}`}>
                      {parseFloat(trade.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
                    </span>
                    <span className="text-gray-700 min-w-0 flex-1 text-right truncate">{parseFloat(trade.amount).toFixed(4)}</span>
                    <span className="text-gray-500 min-w-0 flex-1 text-right truncate text-xs">
                      {new Date(trade.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Мобильный выбор пары — bottom sheet */}
      {pairPickerOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          aria-modal="true"
          role="dialog"
        >
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setPairPickerOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] rounded-t-2xl bg-white shadow-xl flex flex-col animate-slide-in">
            <div className="p-3 border-b flex items-center justify-between shrink-0">
              <h2 className="font-semibold text-base">Выбрать пару</h2>
              <button
                type="button"
                onClick={() => setPairPickerOpen(false)}
                className="p-2 -m-2 rounded-lg hover:bg-gray-100 text-gray-500"
                aria-label="Закрыть"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <input
              type="text"
              placeholder="Поиск пары..."
              value={mobileSearch}
              onChange={(e) => setMobileSearch(e.target.value)}
              className="mx-3 mt-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm"
            />
            <div className="overflow-y-auto flex-1 min-h-0 py-2">
              {mobileFilteredMarkets.map((m) => {
                const pair = `${m.base}/${m.quote}`;
                const lastPrice = parseFloat(m.last || "0");
                const low24h = parseFloat(m.low24h || "0");
                const change = low24h > 0 ? ((lastPrice - low24h) / low24h) * 100 : 0;
                return (
                  <button
                    key={pair}
                    type="button"
                    onClick={() => {
                      setSelectedPair(pair);
                      setPrice(formatPrice(m.last, priceDecimals(pair)));
                      setPairPickerOpen(false);
                      setMobileSearch("");
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
                      selectedPair === pair ? "bg-primary/10 border-l-4 border-l-primary" : "hover:bg-gray-50 active:bg-gray-100"
                    }`}
                  >
                    <span className="font-semibold text-gray-900">{pair}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${change >= 0 ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"}`}>
                        {change >= 0 ? "+" : ""}{change.toFixed(2)}%
                      </span>
                      <span className="text-sm font-bold text-gray-900 tabular-nums">
                        ${lastPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
    </div>
  );
}
