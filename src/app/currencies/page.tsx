"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const items = [
  { slug: "usdt", title: "USDT Tether", price: "505.00", change: "+1.168%", icon: "https://ext.same-assets.com/1411108151/3376435874.svg", volume: "125,000,000", marketCap: "95,000,000,000" },
  { slug: "btc", title: "BTC Bitcoin", price: "70,184.00", change: "+1.716%", icon: "https://ext.same-assets.com/1411108151/2831370402.svg", volume: "25,000,000", marketCap: "1,380,000,000,000" },
  { slug: "eth", title: "ETH Ethereum", price: "2,153.43", change: "+2.560%", icon: "https://ext.same-assets.com/1411108151/1694252569.svg", volume: "12,000,000", marketCap: "258,000,000,000" },
  { slug: "ltc", title: "LTC Litecoin", price: "55.4707", change: "+1.076%", icon: "https://ext.same-assets.com/1411108151/4280945660.svg", volume: "500,000", marketCap: "4,100,000,000" },
  { slug: "sol", title: "SOL Solana", price: "87.90", change: "-0.980%", icon: "https://ext.same-assets.com/1411108151/2977942531.svg", volume: "2,500,000", marketCap: "38,500,000,000" },
  { slug: "trx", title: "TRX Tron", price: "0.2816", change: "-2.729%", icon: "https://ext.same-assets.com/1411108151/888534390.svg", volume: "800,000", marketCap: "24,800,000,000" },
  { slug: "pol", title: "POL Polygon", price: "0.0948", change: "0.000%", icon: "https://ext.same-assets.com/1411108151/3240735902.svg", volume: "300,000", marketCap: "9,200,000,000" },
  { slug: "1inch", title: "1INCH 1inch", price: "0.0997", change: "+3.746%", icon: "https://ext.same-assets.com/1411108151/2161554591.svg", volume: "150,000", marketCap: "1,200,000,000" },
];

export default function CurrenciesPage() {
  const [search, setSearch] = useState("");

  const filtered = items.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container py-6">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900">Криптовалюты</h1>
        <p className="text-gray-600 max-w-prose">
          Актуальные курсы и информация о доступных криптовалютах на платформе ATAIX Eurasia.
        </p>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Поиск криптовалюты..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-96 rounded-lg border-2 border-[#edb419] bg-white text-[#2f2d42] px-4 py-3 focus:ring-2 focus:ring-[#edb419]/50"
        />
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-left text-sm font-semibold text-gray-700">Валюта</th>
                <th className="p-4 text-right text-sm font-semibold text-gray-700">Цена</th>
                <th className="p-4 text-right text-sm font-semibold text-gray-700">Изменение</th>
                <th className="p-4 text-right text-sm font-semibold text-gray-700">Объём (24ч)</th>
                <th className="p-4 text-right text-sm font-semibold text-gray-700">Капитализация</th>
                <th className="p-4 text-center text-sm font-semibold text-gray-700">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((c) => {
                const isPositive = c.change.startsWith("+");
                return (
                  <tr key={c.slug} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <Link href={`/currencies/${c.slug}`} className="flex items-center gap-3 hover:text-primary">
                        <Image src={c.icon} alt={c.title} width={32} height={32} className="rounded-full" />
                        <div>
                          <div className="font-semibold text-gray-900">{c.title}</div>
                          <div className="text-xs text-gray-500 uppercase">{c.slug}</div>
                        </div>
                      </Link>
                    </td>
                    <td className="p-4 text-right font-semibold text-gray-900">{c.price}</td>
                    <td className={`p-4 text-right font-semibold ${isPositive ? "text-green-600" : "text-red-600"}`}>
                      {c.change}
                    </td>
                    <td className="p-4 text-right text-gray-700">{c.volume}</td>
                    <td className="p-4 text-right text-gray-700">{c.marketCap}</td>
                    <td className="p-4 text-center">
                      <Link
                        href={`/trade?pair=${c.slug.toUpperCase()}/USDT`}
                        className="inline-block px-4 py-2 rounded-lg bg-primary text-white hover:opacity-90 text-sm font-semibold"
                      >
                        Торговать
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filtered.map((c) => {
          const isPositive = c.change.startsWith("+");
          return (
            <Link
              key={c.slug}
              href={`/currencies/${c.slug}`}
              className="block rounded-xl border bg-white p-4 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Image src={c.icon} alt={c.title} width={40} height={40} className="rounded-full" />
                  <div>
                    <div className="font-semibold text-gray-900">{c.title}</div>
                    <div className="text-xs text-gray-500 uppercase">{c.slug}</div>
                  </div>
                </div>
                <div className={`font-semibold ${isPositive ? "text-green-600" : "text-red-600"}`}>
                  {c.change}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Цена</div>
                  <div className="font-semibold text-gray-900">{c.price}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Объём (24ч)</div>
                  <div className="font-medium text-gray-700">{c.volume}</div>
                </div>
              </div>
              <div className="pt-3 border-t">
                <div className="text-xs text-gray-500 mb-1">Капитализация</div>
                <div className="font-medium text-gray-700 mb-3">{c.marketCap}</div>
                <Link
                  href={`/trade?pair=${c.slug.toUpperCase()}/USDT`}
                  onClick={(e) => e.stopPropagation()}
                  className="block w-full text-center px-4 py-2 rounded-lg bg-primary text-white hover:opacity-90 text-sm font-semibold"
                >
                  Торговать
                </Link>
              </div>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">🔍</div>
          <div>Криптовалюта не найдена</div>
        </div>
      )}
    </div>
  );
}
