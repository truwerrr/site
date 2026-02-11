"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { useMarkets, pairKey, change24h, type MarketRow } from "@/hooks/useMarkets";

type BalanceRow = { currency: string; available: string; locked: string };

const ICON_USDT = "https://ext.same-assets.com/1411108151/3376435874.svg";

function formatPrice(value: number, quote: string, compact = false): string {
  const q = quote.toUpperCase();
  if (q === "KZT") return value.toLocaleString("ru", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " KZT";
  const opts = compact
    ? { minimumFractionDigits: 2, maximumFractionDigits: 4 }
    : { minimumFractionDigits: 2, maximumFractionDigits: 8 };
  return value.toLocaleString(undefined, opts) + " " + quote;
}

export default function HeaderAuthBar() {
  const { markets } = useMarkets();
  const [balances, setBalances] = useState<BalanceRow[]>([]);
  const [selectedPair, setSelectedPair] = useState<string>("BTC/USDT");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const triggerRefMobile = useRef<HTMLButtonElement>(null);
  const triggerRefDesktop = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (markets.length > 0 && !markets.some((m) => pairKey(m.base, m.quote) === selectedPair)) {
      setSelectedPair(pairKey(markets[0].base, markets[0].quote));
    }
  }, [markets, selectedPair]);


  useEffect(() => {
    const close = (e: MouseEvent) => {
      const t = e.target as Node;
      const trigger = triggerRefMobile.current ?? triggerRefDesktop.current;
      if (trigger?.contains(t) || panelRef.current?.contains(t)) return;
      const el = (e.target as Element).closest?.("a[href]");
      if (el?.getAttribute("href")?.startsWith("/trade")) return;
      setDropdownOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  useEffect(() => {
    if (!dropdownOpen) return;
    const onScroll = () => setDropdownOpen(false);
    window.addEventListener("scroll", onScroll, true);
    return () => window.removeEventListener("scroll", onScroll, true);
  }, [dropdownOpen]);

  useEffect(() => {
    fetch("/api/balances")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => Array.isArray(data) && setBalances(data))
      .catch(() => {});
  }, []);

  const totalUsdt = balances
    .filter((b) => b.currency === "USDT")
    .reduce((s, b) => s + parseFloat(b.available || "0") + parseFloat(b.locked || "0"), 0);

  const selectedMarket: MarketRow | undefined = markets.find((m) => pairKey(m.base, m.quote) === selectedPair);
  const last = selectedMarket ? parseFloat(selectedMarket.last || "0") : 0;
  const open24 = selectedMarket ? parseFloat(selectedMarket.open24h || "0") : 0;
  const high24 = selectedMarket ? parseFloat(selectedMarket.high24h || "0") : 0;
  const low24 = selectedMarket ? parseFloat(selectedMarket.low24h || "0") : 0;
  const quote = selectedMarket?.quote ?? "USDT";
  const ch24 = change24h(last, open24);

  const updateDropdownPosition = () => {
    const el = triggerRefMobile.current ?? triggerRefDesktop.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const panelW = 200;
    const left = typeof window !== "undefined"
      ? Math.max(8, Math.min(r.left, window.innerWidth - panelW - 8))
      : r.left;
    setDropdownPosition({ top: r.bottom + 4, left });
  };

  const dropdownPortal = dropdownOpen && typeof document !== "undefined" && createPortal(
    <div
      ref={panelRef}
      className="fixed z-[9999] rounded-xl border border-gray-200 bg-white shadow-xl py-1 w-[min(200px,calc(100vw-16px))] max-h-[min(280px,70vh)] overflow-y-auto overscroll-contain"
      style={{ top: dropdownPosition.top, left: dropdownPosition.left }}
    >
      {markets.map((m) => {
        const pair = pairKey(m.base, m.quote);
        return (
          <Link
            key={pair}
            href={`/trade?pair=${encodeURIComponent(pair)}`}
            onClick={() => { setSelectedPair(pair); setDropdownOpen(false); }}
            className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 text-left w-full"
          >
            <Image src={ICON_USDT} alt="" width={18} height={18} className="rounded-full" />
            <span className="font-medium text-[#2F2D42]">{pair}</span>
          </Link>
        );
      })}
    </div>,
    document.body
  );

  const pairButtonClass = "flex items-center gap-2 rounded-lg border border-gray-200 bg-white/80 px-3 py-2.5 min-h-[44px] hover:bg-white active:bg-gray-50 transition-colors min-w-[120px] touch-manipulation";
  const onPairClick = (e: React.MouseEvent) => {
    e.preventDefault();
    updateDropdownPosition();
    setDropdownOpen((o) => !o);
  };

  return (
    <div className="border-t border-gray-200/80 border-b border-gray-300 bg-gradient-to-r from-[#DCE0E6] to-[#D2D6DE] min-h-[52px] flex flex-col justify-center">
      {/* Мобильный: две строки — пара и баланс в первой (всегда видны), статистика во второй */}
      <div className="container py-2 sm:hidden flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <button ref={triggerRefMobile} type="button" onClick={onPairClick} className={pairButtonClass}>
            <Image src={ICON_USDT} alt="" width={20} height={20} className="rounded-full" />
            <span className="font-semibold text-[#2F2D42]">{selectedPair}</span>
            <svg className="w-4 h-4 text-gray-500 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className="rounded-lg border border-gray-200/80 bg-white/60 px-2.5 py-2 min-w-0 flex-1 flex flex-col justify-center max-w-[50%]">
            <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">Баланс</div>
            <div className="flex items-center gap-1.5 font-semibold text-[#2F2D42] text-sm min-w-0">
              <Image src={ICON_USDT} alt="" width={14} height={14} className="rounded-full shrink-0" />
              <span className="truncate">{totalUsdt.toLocaleString("ru", { minimumFractionDigits: 2 })} USDT</span>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto [-webkit-overflow-scrolling:touch] pr-1 -mx-1 px-1">
          <dl className="rounded-xl border border-gray-200/80 bg-white/70 px-3 py-2.5 flex flex-nowrap gap-x-6 gap-y-0.5 text-sm min-w-max">
            <div className="min-w-[5.75rem] shrink-0">
              <dt className="text-gray-500 text-[10px] uppercase tracking-wide mb-0.5">Цена</dt>
              <dd className="font-semibold text-[#2F2D42] tabular-nums text-sm whitespace-nowrap" title={formatPrice(last, quote)}>{formatPrice(last, quote, true)}</dd>
            </div>
            <div className="min-w-[3.5rem] shrink-0">
              <dt className="text-gray-500 text-[10px] uppercase tracking-wide mb-0.5">24 ч.</dt>
              <dd className={`tabular-nums text-sm whitespace-nowrap ${ch24 !== null ? (ch24 >= 0 ? "font-medium text-green-600" : "font-medium text-red-600") : "font-medium text-gray-500"}`}>
                {ch24 !== null ? (ch24 >= 0 ? "+" : "") + ch24.toFixed(2) + "%" : "—"}
              </dd>
            </div>
            <div className="min-w-[5.75rem] shrink-0">
              <dt className="text-gray-500 text-[10px] uppercase tracking-wide mb-0.5">Макс.</dt>
              <dd className="font-medium text-[#2F2D42] tabular-nums text-sm whitespace-nowrap" title={high24 > 0 ? formatPrice(high24, quote) : "—"}>{high24 > 0 ? formatPrice(high24, quote, true) : "—"}</dd>
            </div>
            <div className="min-w-[5.75rem] shrink-0 pr-1">
              <dt className="text-gray-500 text-[10px] uppercase tracking-wide mb-0.5">Мин.</dt>
              <dd className="font-medium text-[#2F2D42] tabular-nums text-sm whitespace-nowrap" title={low24 > 0 ? formatPrice(low24, quote) : "—"}>{low24 > 0 ? formatPrice(low24, quote, true) : "—"}</dd>
            </div>
          </dl>
        </div>
      </div>
      {/* Десктоп: одна строка со скроллом */}
      <div className="hidden sm:block container py-2 overflow-x-auto overflow-y-hidden [-webkit-overflow-scrolling:touch] relative z-10">
        <div className="flex flex-nowrap items-center gap-3 sm:gap-4 min-w-max pr-4">
          <div className="flex flex-nowrap items-center gap-2 sm:gap-4 shrink-0">
            <button ref={triggerRefDesktop} type="button" onClick={onPairClick} className={`${pairButtonClass} relative z-10`}>
              <Image src={ICON_USDT} alt="" width={20} height={20} className="rounded-full" />
              <span className="font-semibold text-[#2F2D42]">{selectedPair}</span>
              <svg className="w-4 h-4 text-gray-500 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <Link
              href={selectedPair ? `/trade?pair=${encodeURIComponent(selectedPair)}` : "/trade"}
              className="relative z-10 inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-primary text-white px-3 py-2 min-h-[44px] font-semibold hover:opacity-90 active:opacity-80 transition-opacity shrink-0 text-sm cursor-pointer touch-manipulation"
            >
              Трейд {selectedPair}
            </Link>
            <dl className="rounded-lg border border-gray-200/80 bg-white/70 px-3 py-2 flex flex-nowrap gap-x-5 gap-y-0.5 text-sm shrink-0">
              <div className="min-w-[5.5rem]">
                <dt className="text-gray-500 text-[10px] uppercase tracking-wide">Цена</dt>
                <dd className="font-semibold text-[#2F2D42] tabular-nums text-sm" title={formatPrice(last, quote)}>{formatPrice(last, quote, true)}</dd>
              </div>
              <div className="min-w-[4.5rem]">
                <dt className="text-gray-500 text-[10px] uppercase tracking-wide">24 ч.</dt>
                <dd className={`tabular-nums text-sm ${ch24 !== null ? (ch24 >= 0 ? "font-medium text-green-600" : "font-medium text-red-600") : "font-medium text-gray-500"}`}>
                  {ch24 !== null ? (ch24 >= 0 ? "+" : "") + ch24.toFixed(2) + "%" : "—"}
                </dd>
              </div>
              <div className="min-w-[5.5rem]">
                <dt className="text-gray-500 text-[10px] uppercase tracking-wide">Макс.</dt>
                <dd className="font-medium text-[#2F2D42] tabular-nums text-sm" title={high24 > 0 ? formatPrice(high24, quote) : "—"}>{high24 > 0 ? formatPrice(high24, quote, true) : "—"}</dd>
              </div>
              <div className="min-w-[5.5rem] hidden md:block">
                <dt className="text-gray-500 text-[10px] uppercase tracking-wide">Мин.</dt>
                <dd className="font-medium text-[#2F2D42] tabular-nums text-sm" title={low24 > 0 ? formatPrice(low24, quote) : "—"}>{low24 > 0 ? formatPrice(low24, quote, true) : "—"}</dd>
              </div>
            </dl>
          </div>
          <div className="w-px h-7 bg-gray-300/80 self-center shrink-0" aria-hidden />
          <div className="rounded-lg border border-gray-200/80 bg-white/60 px-3 py-2 min-w-[100px] shrink-0">
            <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">Баланс</div>
            <div className="flex items-center gap-1.5 font-semibold text-[#2F2D42] text-sm">
              <Image src={ICON_USDT} alt="" width={14} height={14} className="rounded-full shrink-0" />
              <span className="truncate">{totalUsdt.toLocaleString("ru", { minimumFractionDigits: 2 })} USDT</span>
            </div>
          </div>
          <div className="rounded-lg border border-gray-200/80 bg-white/60 px-3 py-2 min-w-[80px] shrink-0">
            <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">Лимит</div>
            <div className="font-semibold text-[#2F2D42] text-sm">0.00 USD</div>
          </div>
        </div>
      </div>
      {dropdownPortal}
    </div>
  );
}
