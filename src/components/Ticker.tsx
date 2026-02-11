"use client";
import Image from "next/image";
import Link from "next/link";
import { useRates } from "@/hooks/useRates";

const STATIC_ITEMS = [
  { key: "LTC", title: "LTC Litecoin", pair: "USDT", price: 55.4707, change: "+1.076%", icon: "https://ext.same-assets.com/1411108151/4280945660.svg" },
  { key: "SOL", title: "SOL Solana", pair: "USDT", price: 87.9, change: "-0.980%", icon: "https://ext.same-assets.com/1411108151/2977942531.svg" },
  { key: "POL", title: "POL Polygon", pair: "USDT", price: 0.0948, change: "0.000%", icon: "https://ext.same-assets.com/1411108151/3240735902.svg" },
  { key: "TRX", title: "TRX Tron", pair: "USDT", price: 0.2816, change: "-2.729%", icon: "https://ext.same-assets.com/1411108151/888534390.svg" },
  { key: "1INCH", title: "1INCH 1inch", pair: "USDT", price: 0.0997, change: "+3.746%", icon: "https://ext.same-assets.com/1411108151/2161554591.svg" },
];

function formatPrice(val: number, pair: string): string {
  if (pair === "KZT" || val >= 1000) return val.toLocaleString("ru", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (val >= 1) return val.toFixed(2);
  return val.toFixed(4);
}

export default function Ticker() {
  const { rates } = useRates();
  const usdtKzt = rates.USDT?.KZT ?? 505;
  const btcUsdt = rates.BTC?.USDT ?? 70184;
  const ethUsdt = rates.ETH?.USDT ?? 2153.43;

  const items = [
    { key: "USDT", title: "USDT Tether", pair: "KZT", price: usdtKzt, change: "0.000%", icon: "https://ext.same-assets.com/1411108151/3376435874.svg" },
    { key: "BTC", title: "BTC Bitcoin", pair: "USDT", price: btcUsdt, change: "0.000%", icon: "https://ext.same-assets.com/1411108151/2831370402.svg" },
    { key: "ETH", title: "ETH Ethereum", pair: "USDT", price: ethUsdt, change: "0.000%", icon: "https://ext.same-assets.com/1411108151/1694252569.svg" },
    ...STATIC_ITEMS,
  ];

  const double = [...items, ...items];
  return (
    <div className="ticker-mask py-4">
      <div className="ticker-track">
        {double.map((it, i) => {
          const base = it.title.split(" ")[0];
          const pair = `${base}/${it.pair}`;
          const priceStr = typeof it.price === "number" ? formatPrice(it.price, it.pair) : String(it.price);
          return (
            <Link
              key={`${it.key}-${i}`}
              href={`/trade?pair=${pair}`}
              className="min-w-[240px] rounded-xl border p-4 bg-white hover:shadow-lg transition-all hover:-translate-y-1 group"
            >
              <div className="flex items-center gap-2 mb-2">
                <Image src={it.icon} alt={it.title} width={24} height={24} className="rounded-full" />
                <div className="text-sm font-semibold text-gray-900 group-hover:text-primary transition-colors">{it.title}</div>
              </div>
              <div className="text-xs text-gray-500 mb-1">{it.pair}</div>
              <div className="text-xl font-bold text-gray-900 mb-1">{priceStr}</div>
              <div className={`text-sm font-semibold px-2 py-0.5 rounded inline-block ${
                it.change.startsWith("-") ? "bg-red-50 text-red-600" : it.change === "0.000%" ? "bg-gray-50 text-gray-600" : "bg-green-50 text-green-600"
              }`}>
                {it.change}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
