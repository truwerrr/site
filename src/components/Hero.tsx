"use client";
import Image from "next/image";
import Link from "next/link";
import { useRates } from "@/hooks/useRates";
import HeroCandlesSvg from "@/components/HeroCandlesSvg";

const STATIC_MINI = [
  { title: "LTC Litecoin", quote: "USDT", price: 55.4707, delta: "+1.076%", icon: "https://ext.same-assets.com/1411108151/4280945660.svg" },
  { title: "SOL Solana", quote: "USDT", price: 87.9, delta: "-0.980%", icon: "https://ext.same-assets.com/1411108151/2977942531.svg" },
];

function fmt(n: number, q: string): string {
  if (q === "KZT" || n >= 1000) return n.toLocaleString("ru", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (n >= 1) return n.toFixed(2);
  return n.toFixed(4);
}

export default function Hero() {
  const { rates } = useRates();
  const usdtKzt = rates.USDT?.KZT ?? 505;
  const btcUsdt = rates.BTC?.USDT ?? 70184;

  const mini = [
    { title: "USDT Tether", quote: "KZT", price: usdtKzt, delta: "0.00%", icon: "https://ext.same-assets.com/1411108151/3376435874.svg" },
    { title: "BTC Bitcoin", quote: "USDT", price: btcUsdt, delta: "0.00%", icon: "https://ext.same-assets.com/1411108151/2831370402.svg" },
    ...STATIC_MINI,
  ];

  return (
    <section className="relative overflow-hidden hero-bg">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-300/80 to-transparent" aria-hidden />
      {/* Оригинальный SVG свечей: левая колонка — левая половина, правая — правая половина (как на ATAIX) */}
      <div className="absolute inset-0 pointer-events-none z-0" aria-hidden>
        <div className="absolute top-0 bottom-0 w-[28%] min-w-[140px] max-w-[260px] overflow-hidden hero-candles-left hidden md:block">
          <div className="absolute inset-0 w-[200%] h-full -left-0 hero-candles-svg-float">
            <HeroCandlesSvg />
          </div>
        </div>
        <div className="absolute top-0 bottom-0 right-0 w-[28%] min-w-[140px] max-w-[260px] overflow-hidden hero-candles-right hidden md:block">
          <div className="absolute top-0 bottom-0 w-[200%] h-full hero-candles-svg-float" style={{ left: "auto", right: 0 }}>
            <HeroCandlesSvg />
          </div>
        </div>
      </div>
      <div className="container relative pt-16 md:pt-24 pb-14 z-10">
        <div className="relative mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/12 text-primary text-xs font-bold uppercase tracking-wider mb-6 border border-primary/20 shadow-sm">
            ПЕРВАЯ КАЗАХСТАНСКАЯ ЛИЦЕНЗИРОВАННАЯ КРИПТОБИРЖА
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight text-gray-900 mb-5">
            Инвестируйте, зарабатывайте и управляйте своими
            <span className="text-primary"> криптоактивами</span> на
            <br />
            <span className="text-primary">ATAIX Eurasia</span>
            <span className="text-[#24f0bf]">.</span>
          </h1>
          <p className="mt-4 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Казахстанская лицензированная криптобиржа с полным спектром услуг для торговли и управления цифровыми активами
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/sessions/signup"
              className="px-6 py-3.5 rounded-xl bg-primary text-white font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              Начать торговлю
            </Link>
            <Link
              href="/fees"
              className="px-6 py-3.5 rounded-xl border-2 border-gray-200 bg-white text-gray-700 hover:border-primary/30 hover:bg-primary/5 hover:text-primary font-semibold transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-sm"
            >
              Комиссии
            </Link>
            <Link
              href="/market"
              className="px-6 py-3.5 rounded-xl border-2 border-gray-200 bg-white text-gray-700 hover:border-primary/30 hover:bg-primary/5 hover:text-primary font-semibold transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-sm"
            >
              Рынки
            </Link>
          </div>
        </div>

        <div className="mt-14 grid md:grid-cols-4 gap-4">
          {mini.map((m) => {
            const symbol = m.title.split(" ")[0];
            return (
              <div key={m.title} className="rate-card-hover">
                <Link
                  href={`/trade?pair=${symbol}/${m.quote}`}
                  className="group flex flex-col rounded-2xl border border-gray-200/80 bg-white p-5 shadow-md shadow-gray-200/50 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/20 transition-all duration-200 hover:-translate-y-1 h-full"
                >
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                    <div className="flex items-center gap-2">
                      <Image src={m.icon} alt={m.title} width={20} height={20} className="rounded-full" />
                      <span className="font-medium">{m.title}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded font-semibold ${m.delta.startsWith("-") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
                      {m.delta}
                    </span>
                  </div>
                  <div className="text-gray-900">
                    <div className="text-xs text-gray-500 mb-1">{m.quote}</div>
                    <div className="text-2xl font-bold">{typeof m.price === "number" ? fmt(m.price, m.quote) : m.price}</div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <span className="rate-card-btn">
                      Трейд {symbol}
                    </span>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
