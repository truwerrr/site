"use client";
import { Suspense } from "react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BuyIcon, SellIcon, AdsIcon, HistoryIcon } from "@/components/Icons";
import { maskEmailForDisplay } from "@/lib/p2p-fake-bots";

interface P2PDealListItem {
  id: string;
  buyerId: string;
  sellerId: string;
  currency: string;
  amount: string;
  priceKZT: string;
  status: string;
  createdAt: string;
  buyer: { email: string };
  seller: { email: string };
}

interface P2PAd {
  id: string;
  userId: string;
  side: string;
  currency: string;
  priceKZT: string;
  available: string;
  limitMin: string;
  limitMax: string;
  paymentMethods: string;
  rating: number;
  trades: number;
  isActive: boolean;
  user?: {
    email: string;
  };
}

function P2PContent() {
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'buy' | 'sell' | 'my-ads' | 'my-deals'>('buy');
  const [ads, setAds] = useState<P2PAd[]>([]);
  const [deals, setDeals] = useState<P2PDealListItem[]>([]);
  const [dealsLoading, setDealsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState('all');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [sortBy, setSortBy] = useState('price');
  const [searchQuery, setSearchQuery] = useState('');
  const [adsPage, setAdsPage] = useState(1);

  const ADS_PER_PAGE = 10;

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "my-ads") setActiveTab("my-ads");
    if (tab === "my-deals") setActiveTab("my-deals");
  }, [searchParams]);

  useEffect(() => {
    setAdsPage(1);
  }, [activeTab, selectedCurrency, selectedPayment, sortBy, searchQuery]);

  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    const ac = new AbortController();
    fetchAds(ac.signal);
    return () => ac.abort();
  }, [activeTab, status]);

  useEffect(() => {
    if (activeTab !== "my-deals" || status !== "authenticated") return;
    let cancelled = false;
    setDealsLoading(true);
    fetch("/api/p2p/deals")
      .then((res) => res.ok ? res.json() : [])
      .then((data) => { if (!cancelled) setDeals(data); })
      .catch(() => { if (!cancelled) setDeals([]); })
      .finally(() => { if (!cancelled) setDealsLoading(false); });
    return () => { cancelled = true; };
  }, [activeTab, status]);

  const fetchAds = async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      const res = await fetch("/api/p2p/ads", { signal });
      if (signal?.aborted) return;
      if (res.ok) {
        const data = await res.json();
        if (signal?.aborted) return;
        setAds(data);
      }
    } catch (err) {
      if ((err as Error)?.name === "AbortError") return;
      console.error("Error fetching ads:", err);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  };

  const filteredAds = ads.filter((ad) => {
    if (activeTab === 'buy' && ad.side !== 'buy') return false;
    if (activeTab === 'sell' && ad.side !== 'sell') return false;
    if (activeTab === 'my-ads' && ad.userId !== session?.user?.id) return false;
    if (selectedCurrency !== 'all' && ad.currency !== selectedCurrency) return false;
    if (!ad.isActive) return false;
    
    const paymentMethods = JSON.parse(ad.paymentMethods || '[]');
    if (selectedPayment !== 'all' && !paymentMethods.includes(selectedPayment)) return false;
    
    const available = parseFloat(ad.available);
    if (minAmount && available < parseFloat(minAmount)) return false;
    if (maxAmount && available > parseFloat(maxAmount)) return false;
    
    if (searchQuery && !ad.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    
    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return parseFloat(a.priceKZT) - parseFloat(b.priceKZT);
      case 'rating':
        return b.rating - a.rating;
      case 'trades':
        return b.trades - a.trades;
      default:
        return 0;
    }
  });

  const totalAdsPages = Math.max(1, Math.ceil(filteredAds.length / ADS_PER_PAGE));
  const paginatedAds = filteredAds.slice((adsPage - 1) * ADS_PER_PAGE, adsPage * ADS_PER_PAGE);

  if (!mounted || status === "loading") {
    return (
      <div className="container py-16 flex flex-col items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="mt-4 text-gray-500 font-medium">Загрузка...</p>
      </div>
    );
  }

  if (status !== "authenticated") {
    return (
      <div className="container py-10 max-w-3xl">
        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 mb-2">P2P</h1>
        <p className="text-slate-500 text-sm sm:text-base mb-6">
          Площадка P2P для безопасного обмена между пользователями.{" "}
          <Link href="/sessions/signin" className="text-primary font-semibold hover:underline">
            Войдите
          </Link>
          , чтобы использовать P2P.
        </p>
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg shadow-gray-200/50">
          <h2 className="font-bold text-xl text-gray-900 mb-6">Преимущества P2P</h2>
          <ul className="space-y-4">
            {[
              'Прямой обмен между пользователями',
              'Гарантия безопасности сделок через escrow',
              'Различные способы оплаты',
              'Низкие комиссии',
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center text-primary font-bold text-sm">{i + 1}</span>
                <span className="text-gray-700 font-medium">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  const inputClass = "w-full rounded-xl border border-gray-300 bg-white text-gray-900 px-4 py-2.5 text-sm font-medium transition-shadow focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary";
  const labelClass = "block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2";

  return (
    <div className="space-y-5">
      <header className="mb-4 sm:mb-5">
        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">P2P</h1>
        <p className="text-slate-500 text-sm sm:text-base mt-0.5">Безопасный обмен криптовалют между пользователями</p>
      </header>

      <div className="space-y-5">
        {/* Tabs — сегментный контроль, без тени и «пузыря» */}
        <div className="border-b border-slate-200 overflow-x-auto -mx-1 px-1">
          <div className="flex gap-0 min-w-max sm:min-w-0">
            {[
              { id: 'buy', label: 'Купить', icon: BuyIcon },
              { id: 'sell', label: 'Продать', icon: SellIcon },
              { id: 'my-ads', label: 'Мои объявления', icon: AdsIcon },
              { id: 'my-deals', label: 'Мои сделки', icon: HistoryIcon },
            ].map((tab) => {
              const IconComponent = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'buy' | 'sell' | 'my-ads' | 'my-deals')}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap border-b-2 -mb-px ${
                    isActive
                      ? 'text-slate-900 border-slate-900'
                      : 'text-slate-500 border-transparent hover:text-slate-700'
                  }`}
                >
                  <IconComponent className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-slate-900' : 'text-slate-400'}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filters */}
        {(activeTab === 'buy' || activeTab === 'sell') && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg shadow-gray-200/50">
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-5">
              <div>
                <label className={labelClass}>ВАЛЮТА</label>
                <select value={selectedCurrency} onChange={(e) => setSelectedCurrency(e.target.value)} className={inputClass}>
                  <option value="all">Все валюты</option>
                  <option value="USDT">USDT</option>
                  <option value="BTC">BTC</option>
                  <option value="ETH">ETH</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>СПОСОБ ОПЛАТЫ</label>
                <select value={selectedPayment} onChange={(e) => setSelectedPayment(e.target.value)} className={inputClass}>
                  <option value="all">Все</option>
                  <option value="Kaspi Bank">Kaspi Bank</option>
                  <option value="Home Credit Bank">Home Credit Bank</option>
                  <option value="Halyk Bank">Halyk Bank</option>
                  <option value="Тинькофф">Тинькофф</option>
                  <option value="Сбербанк">Сбербанк</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>МИН. СУММА</label>
                <input type="number" value={minAmount} onChange={(e) => setMinAmount(e.target.value)} placeholder="0" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>МАКС. СУММА</label>
                <input type="number" value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} placeholder="0" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>СОРТИРОВКА</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={inputClass}>
                  <option value="price">Лучшая цена</option>
                  <option value="rating">Высокий рейтинг</option>
                  <option value="trades">Больше сделок</option>
                </select>
              </div>
            </div>
            <div className="mt-5">
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Поиск по продавцу..." className={inputClass} />
            </div>
          </div>
        )}

        {/* Warning banner + Ads list (table layout) */}
        {(activeTab === 'buy' || activeTab === 'sell') && (
          <div className="space-y-4">
            {/* Warning banner */}
            <div className="rounded-xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 flex items-start gap-3">
              <span className="flex-shrink-0 mt-0.5 text-amber-600" aria-hidden>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.764 1.36-.19 3.064-1.742 3.064H4.42c-1.553 0-2.507-1.705-1.743-3.064l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
              </span>
              <p className="text-sm text-amber-900/90 font-medium">
                Будьте бдительны и остерегайтесь мошенников. Не делитесь контактами (телефон, email) до завершения сделки через платформу.
              </p>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-16 text-center shadow-lg">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <p className="mt-4 text-gray-500 font-medium">Загрузка...</p>
              </div>
            ) : filteredAds.length > 0 ? (
              <div className="rounded-2xl border border-gray-200 bg-white shadow-lg shadow-gray-200/40 overflow-hidden">
                {/* Заголовки таблицы — только десктоп */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-4 bg-gray-50/80 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <div className="col-span-3">Мерчант</div>
                  <div className="col-span-2 text-right">Цена</div>
                  <div className="col-span-3">Доступно / Лимиты</div>
                  <div className="col-span-2">Способ оплаты</div>
                  <div className="col-span-2 text-right">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="hidden sm:inline text-gray-400 font-normal normal-case">Популярное для новых</span>
                      <span className="px-2 py-0.5 rounded-md bg-primary/15 text-primary text-[10px] font-bold uppercase">0% комиссия</span>
                    </span>
                  </div>
                </div>

                {/* Список: мобиле — карточки как в Bybit, десктоп — таблица */}
                <div className="md:block flex flex-col gap-3">
                {paginatedAds.map((ad, index) => {
                  const paymentMethods = JSON.parse(ad.paymentMethods || '[]') as string[];
                  const userName = ad.user?.email?.split('@')[0] || 'User';
                  const isVerified = typeof ad.rating === 'number' && ad.rating >= 98;
                  const responseMins = (index % 3 === 0 ? 15 : index % 3 === 1 ? 30 : 45);
                  const showSupportBadge = index === 0;
                  const priceStr = parseFloat(ad.priceKZT).toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/\s/g, " ");
                  const paymentLine = paymentMethods.length ? "| " + paymentMethods.slice(0, 3).join(" | ") + (paymentMethods.length > 3 ? " | +" + (paymentMethods.length - 3) : "") : "";
                  return (
                    <Link
                      key={ad.id}
                      href={`/p2p/ad/${ad.id}`}
                      className={`block overflow-hidden transition-all active:scale-[0.99] md:contents ${
                        index % 2 === 0 ? 'md:bg-white' : 'md:bg-gray-50/50'
                      } hover:opacity-95 md:hover:bg-primary/[0.03]`}
                    >
                      {/* Мобил: карточка в стиле Bybit */}
                      <div className="rounded-xl bg-gray-50/90 border border-gray-100 md:contents">
                        {index === 0 && (
                          <div className="md:hidden px-3 py-1.5 bg-amber-500 rounded-t-xl flex items-center justify-between gap-2">
                            <span className="text-white text-xs font-medium">Популярное для новых пользователей</span>
                            <button type="button" className="p-0.5 text-white/90 hover:text-white" onClick={(e) => e.preventDefault()} aria-label="Подробнее">
                              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                            </button>
                          </div>
                        )}
                        <div className="p-3 md:flex md:flex-row md:grid md:grid-cols-12 md:gap-4 md:px-5 md:py-4 md:items-center md:border-b md:border-gray-100 md:last:border-b-0 md:bg-transparent md:border-0 md:rounded-none">
                          {/* Мобил: верхняя строка — слева мерчант, справа таймер + ОГРОМНАЯ цена */}
                          <div className="flex items-start justify-between gap-3 mb-2 md:contents">
                            <div className="flex items-center gap-2.5 min-w-0 flex-1 md:col-span-3">
                              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-base">
                                {userName.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-gray-900 truncate text-base">{userName}</span>
                                  {isVerified && (
                                    <span className="flex-shrink-0 text-blue-500" title="Верифицирован">
                                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500 mt-0.5">
                                  {ad.trades} Ордера | {typeof ad.rating === "number" ? ad.rating.toFixed(0) : 0}%
                                </div>
                                <div className="text-[10px] text-gray-400 truncate mt-0.5 md:block hidden" title="Почта">
                                  {maskEmailForDisplay(ad.user?.email)}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-0.5 flex-shrink-0 md:col-span-2 md:flex md:flex-row md:justify-end md:items-center">
                              <div className="flex items-center gap-1 text-[11px] text-gray-500">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <span>{responseMins} мин</span>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-gray-900 tabular-nums text-xl sm:text-2xl md:text-base">KZT {priceStr}</div>
                              </div>
                            </div>
                          </div>
                          {/* Мобил: слева доступно и лимиты, справа кнопка */}
                          <div className="flex items-stretch gap-3 mb-2 md:contents">
                            <div className="flex-1 min-w-0 space-y-0.5 md:col-span-3">
                              <div className="text-sm text-gray-700">
                                <span className="text-gray-500">Доступно </span>
                                <span className="font-semibold tabular-nums">{parseFloat(ad.available).toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 4 })} {ad.currency}</span>
                              </div>
                              <div className="text-xs text-gray-500 tabular-nums">
                                Лимиты {parseFloat(ad.limitMin).toLocaleString("ru-RU", { maximumFractionDigits: 0 })} - {parseFloat(ad.limitMax).toLocaleString("ru-RU", { maximumFractionDigits: 0 })} KZT
                              </div>
                            </div>
                            <div className="flex flex-col justify-center md:col-span-2 md:justify-center">
                              <span className={`inline-flex items-center justify-center py-2.5 px-4 rounded-lg bg-primary text-white font-semibold text-sm whitespace-nowrap gap-1.5 ${showSupportBadge ? "" : ""}`}>
                                {activeTab === "buy" ? `Купить ${ad.currency}` : `Продать ${ad.currency}`}
                                {showSupportBadge && (
                                  <span className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center flex-shrink-0" title="С поддержкой">
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7c0-4.97-4.03-9-9-9z"/></svg>
                                  </span>
                                )}
                              </span>
                            </div>
                          </div>
                          {/* Мобил: способы оплаты одной строкой с | */}
                          <div className="text-[11px] text-gray-500 mb-1.5 md:col-span-2">
                            {paymentLine && <span className="md:hidden">{paymentLine}</span>}
                            <div className="hidden md:flex flex-wrap gap-1">
                              {paymentMethods.slice(0, 2).map((pm: string) => (
                                <span key={pm} className="px-2 py-1 rounded-lg bg-gray-200/80 text-gray-700 text-xs font-medium">{pm}</span>
                              ))}
                              {paymentMethods.length > 2 && <span className="px-2 py-1 rounded-lg bg-gray-200/80 text-gray-500 text-xs">+{paymentMethods.length - 2}</span>}
                            </div>
                          </div>
                          {/* Почта — только мобил (на десктопе в блоке мерчанта) */}
                          <div className="text-[10px] text-gray-400 truncate md:hidden">
                            {maskEmailForDisplay(ad.user?.email)}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
                </div>
                {totalAdsPages > 1 && (
                  <div className="px-4 py-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="text-gray-500">
                      Страница {adsPage} из {totalAdsPages} · всего {filteredAds.length}
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setAdsPage((p) => Math.max(1, p - 1))}
                        disabled={adsPage <= 1}
                        className="px-3 py-1.5 rounded-lg border bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-xs font-medium"
                      >
                        Назад
                      </button>
                      <button
                        type="button"
                        onClick={() => setAdsPage((p) => Math.min(totalAdsPages, p + 1))}
                        disabled={adsPage >= totalAdsPages}
                        className="px-3 py-1.5 rounded-lg border bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-xs font-medium"
                      >
                        Вперёд
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-gray-200 bg-white p-16 text-center shadow-lg">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4 text-3xl">🔍</div>
                <div className="font-semibold text-gray-700 mb-1">Объявления не найдены</div>
                <div className="text-sm text-gray-500">Попробуйте изменить фильтры или валюту</div>
              </div>
            )}
          </div>
        )}

        {/* My Deals Tab */}
        {activeTab === 'my-deals' && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg shadow-gray-200/50">
            <h2 className="font-bold text-xl text-gray-900 mb-6 pb-4 border-b border-gray-200">Мои сделки</h2>
            {dealsLoading ? (
              <div className="py-16 flex justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : deals.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-200">
                      <th className="pb-3 pr-4">Сделка</th>
                      <th className="pb-3 pr-4">Сумма</th>
                      <th className="pb-3 pr-4">Контрагент</th>
                      <th className="pb-3 pr-4">Статус</th>
                      <th className="pb-3 pr-4">Дата</th>
                      <th className="pb-3 text-right">Действие</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deals.map((deal) => {
                      const isBuyer = deal.buyerId === session?.user?.id;
                      const counterparty = isBuyer ? deal.seller : deal.buyer;
                      const statusLabel = deal.status === "pending" ? "Ожидание оплаты" : deal.status === "paid" ? "Оплачено" : deal.status === "released" ? "Завершено" : deal.status === "cancelled" ? "Отменено" : deal.status;
                      return (
                        <tr key={deal.id} className="border-b border-gray-100 hover:bg-gray-50/80">
                          <td className="py-4 pr-4 font-mono text-gray-700">#{deal.id.slice(0, 8)}</td>
                          <td className="py-4 pr-4 font-medium tabular-nums">{deal.amount} {deal.currency}</td>
                          <td className="py-4 pr-4 text-gray-600">{maskEmailForDisplay(counterparty?.email)}</td>
                          <td className="py-4 pr-4">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                              deal.status === "pending" ? "bg-amber-100 text-amber-800" :
                              deal.status === "paid" ? "bg-blue-100 text-blue-800" :
                              deal.status === "released" ? "bg-green-100 text-green-800" :
                              "bg-gray-100 text-gray-700"
                            }`}>{statusLabel}</span>
                          </td>
                          <td className="py-4 pr-4 text-gray-500">{new Date(deal.createdAt).toLocaleString("ru-RU")}</td>
                          <td className="py-4 text-right">
                            <Link href={`/p2p/deal/${deal.id}`} className="text-primary font-semibold hover:underline">Открыть</Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4 text-3xl">📄</div>
                <div className="font-semibold text-gray-700 mb-1">У вас пока нет сделок</div>
                <p className="text-sm text-gray-500">Сделки появятся после того, как вы создадите заказ из объявления</p>
              </div>
            )}
          </div>
        )}

        {/* My Ads Tab */}
        {activeTab === 'my-ads' && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg shadow-gray-200/50">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <h2 className="font-bold text-xl text-gray-900">Мои объявления</h2>
              <Link
                href="/p2p/create"
                className="px-5 py-2.5 rounded-xl bg-primary text-white hover:bg-primary/90 font-bold shadow-md hover:shadow-lg transition-all"
              >
                + Создать объявление
              </Link>
            </div>
            {ads.filter(ad => ad.userId === session?.user?.id).length > 0 ? (
              <div className="space-y-4">
                {ads.filter(ad => ad.userId === session?.user?.id).map((ad) => {
                  const paymentMethods = JSON.parse(ad.paymentMethods || '[]');
                  return (
                    <div key={ad.id} className="p-5 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-300 transition-all">
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                          <div className="font-bold text-gray-900">
                            {ad.side === 'buy' ? 'Покупка' : 'Продажа'} {ad.currency}
                          </div>
                          <div className="text-sm text-gray-600 mt-1 font-medium tabular-nums">
                            Цена: {parseFloat(ad.priceKZT).toLocaleString()} KZT · Доступно: {parseFloat(ad.available).toFixed(2)} {ad.currency}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Лимит: {parseFloat(ad.limitMin).toLocaleString()} – {parseFloat(ad.limitMax).toLocaleString()} KZT
                          </div>
                          {ad.user?.email && (
                            <div className="text-[10px] text-gray-400 mt-1">{maskEmailForDisplay(ad.user.email)}</div>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-4 py-2 rounded-lg text-xs font-bold ${
                            ad.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'
                          }`}>
                            {ad.isActive ? 'Активно' : 'Неактивно'}
                          </span>
                          <Link href={`/p2p/edit/${ad.id}`} className="px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-700 font-semibold text-sm hover:bg-gray-50 hover:border-gray-400 transition-colors inline-block">
                            Редактировать
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4 text-3xl">📋</div>
                <div className="font-semibold text-gray-700 mb-1">У вас нет активных объявлений</div>
                <p className="text-sm text-gray-500 mb-6">Создайте объявление, чтобы начать обмен</p>
                <Link
                  href="/p2p/create"
                  className="inline-block px-6 py-3 rounded-xl bg-primary text-white hover:bg-primary/90 font-bold shadow-md hover:shadow-lg transition-all"
                >
                  Создать объявление
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function P2PPage() {
  return (
    <Suspense
      fallback={
        <div className="container py-16 flex flex-col items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="mt-4 text-gray-500 font-medium">Загрузка...</p>
        </div>
      }
    >
      <P2PContent />
    </Suspense>
  );
}
