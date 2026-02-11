"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Market {
  id: string;
  base: string;
  quote: string;
  last: string;
  open24h: string;
  high24h: string;
  low24h: string;
  volumeBase24h: string;
  volumeQuote24h: string;
}

export default function MarketPage() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"volume" | "change" | "price">("volume");
  const [filterQuote, setFilterQuote] = useState<string>("all");

  useEffect(() => {
    fetchMarkets();
    const interval = setInterval(fetchMarkets, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchMarkets = async () => {
    try {
      const res = await fetch("/api/markets");
      if (res.ok) {
        const data = await res.json();
        setMarkets(data);
      }
    } catch (err) {
      console.error("Error fetching markets:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateChange = (market: Market) => {
    const last = parseFloat(market.last || "0");
    const open = parseFloat(market.open24h || "0");
    if (open === 0) return 0;
    return ((last - open) / open) * 100;
  };

  const filteredMarkets = markets
    .filter((m) => {
      const pair = `${m.base}/${m.quote}`;
      if (!pair.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (filterQuote !== "all" && m.quote !== filterQuote) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "volume":
          return parseFloat(b.volumeQuote24h) - parseFloat(a.volumeQuote24h);
        case "change":
          return calculateChange(b) - calculateChange(a);
        case "price":
          return parseFloat(b.last) - parseFloat(a.last);
        default:
          return 0;
      }
    });

  const uniqueQuotes = Array.from(new Set(markets.map((m) => m.quote)));

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Рынки</h1>
        <p className="text-gray-600">Все доступные торговые пары</p>
      </div>

      {/* Filters */}
      <div className="rounded-xl border bg-white p-4 mb-6 shadow-sm">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Поиск</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="BTC/USDT..."
              className="w-full rounded-lg border-2 border-[#edb419] bg-white text-[#2f2d42] px-3 py-2 text-sm focus:ring-2 focus:ring-[#edb419]/50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Базовая валюта</label>
            <select
              value={filterQuote}
              onChange={(e) => setFilterQuote(e.target.value)}
              className="w-full rounded-lg border-2 border-[#edb419] bg-white text-[#2f2d42] px-3 py-2 text-sm focus:ring-2 focus:ring-[#edb419]/50"
            >
              <option value="all">Все</option>
              {uniqueQuotes.map((q) => (
                <option key={q} value={q}>
                  {q}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Сортировка</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full rounded-lg border-2 border-[#edb419] bg-white text-[#2f2d42] px-3 py-2 text-sm focus:ring-2 focus:ring-[#edb419]/50"
            >
              <option value="volume">По объёму</option>
              <option value="change">По изменению</option>
              <option value="price">По цене</option>
            </select>
          </div>
        </div>
      </div>

      {/* Markets Table */}
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Пара</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Последняя цена</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">24ч Изменение</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">24ч High</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">24ч Low</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">24ч Объём</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Действие</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    Загрузка...
                  </td>
                </tr>
              ) : filteredMarkets.length > 0 ? (
                filteredMarkets.map((market) => {
                  const pair = `${market.base}/${market.quote}`;
                  const change = calculateChange(market);
                  const changeColor = change >= 0 ? "text-green-600" : "text-red-600";
                  const changeBg = change >= 0 ? "bg-green-50" : "bg-red-50";

                  return (
                    <tr key={market.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
                        <Link
                          href={`/trade?pair=${pair}`}
                          className="flex items-center gap-2 font-semibold text-gray-900 hover:text-primary"
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center font-bold text-xs">
                            {market.base[0]}
                          </div>
                          <div>
                            <div>{pair}</div>
                            <div className="text-xs text-gray-500">{market.base}</div>
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="font-bold text-gray-900">
                          {parseFloat(market.last || "0").toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 8,
                          })}
                        </div>
                        <div className="text-xs text-gray-500">{market.quote}</div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className={`inline-block px-2 py-1 rounded text-sm font-semibold ${changeColor} ${changeBg}`}>
                          {change >= 0 ? "+" : ""}
                          {change.toFixed(2)}%
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right text-gray-700">
                        {parseFloat(market.high24h || "0").toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 8,
                        })}
                      </td>
                      <td className="px-4 py-4 text-right text-gray-700">
                        {parseFloat(market.low24h || "0").toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 8,
                        })}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="font-medium text-gray-900">
                          {parseFloat(market.volumeBase24h || "0").toFixed(2)} {market.base}
                        </div>
                        <div className="text-xs text-gray-500">
                          {parseFloat(market.volumeQuote24h || "0").toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{" "}
                          {market.quote}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <Link
                          href={`/trade?pair=${pair}`}
                          className="inline-block px-4 py-2 rounded-lg bg-primary text-white hover:opacity-90 font-medium text-sm transition-all"
                        >
                          Торговать
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                    <div className="text-4xl mb-2">🔍</div>
                    <div>Рынки не найдены</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
