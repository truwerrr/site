"use client";
import { useEffect, useRef, useState } from "react";
import { createChart, IChartApi, ISeriesApi, ColorType, LineStyle } from "lightweight-charts";

interface Kline {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface TradingChartProps {
  pair: string;
  interval?: string;
}

// Calculate SMA
function calculateSMA(data: number[], period: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(NaN);
    } else {
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      result.push(sum / period);
    }
  }
  return result;
}

// Calculate EMA
function calculateEMA(data: number[], period: number): number[] {
  const result: number[] = [];
  const multiplier = 2 / (period + 1);
  let ema = data[0];
  result.push(ema);
  
  for (let i = 1; i < data.length; i++) {
    ema = (data[i] - ema) * multiplier + ema;
    result.push(ema);
  }
  return result;
}

export default function TradingChart({ pair, interval = "1h" }: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const smaSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const emaSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const [timeframe, setTimeframe] = useState(interval);
  const [loading, setLoading] = useState(true);
  const [showSMA, setShowSMA] = useState(true);
  const [showEMA, setShowEMA] = useState(true);
  const [marketInfo, setMarketInfo] = useState<{ last: string; change24h: number; high24h: string; low24h: string; volume24h: string } | null>(null);
  const [indicatorValues, setIndicatorValues] = useState<{ sma: number | null; ema: number | null }>({ sma: null, ema: null });
  const lastCandleRef = useRef<{ time: number; open: number; high: number; low: number; close: number } | null>(null);
  const currentPriceRef = useRef<number>(0);
  const isInitializedRef = useRef(false);
  const marketInfoRef = useRef<{ last: string; change24h: number; high24h: string; low24h: string; volume24h: string } | null>(null);

  // Инициализация графика
  useEffect(() => {
    if (!chartContainerRef.current || isInitializedRef.current) return;

    const containerWidth = chartContainerRef.current.clientWidth || 800;
    
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#fafbfc" },
        textColor: "#374151",
        fontSize: 11,
      },
      width: containerWidth,
      height: 360,
      autoSize: true,
      grid: {
        vertLines: { color: "#e5e7eb", style: 0 },
        horzLines: { color: "#e5e7eb", style: 0 },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: "#d1d5db",
        borderVisible: true,
      },
      rightPriceScale: {
        borderColor: "#d1d5db",
        scaleMargins: { top: 0.08, bottom: 0.2 },
        entireTextOnly: false,
      },
      crosshair: {
        mode: 0,
        vertLine: {
          width: 1,
          color: "#9ca3af",
          style: 2,
          labelBackgroundColor: "#5b5cf6",
        },
        horzLine: {
          width: 1,
          color: "#9ca3af",
          style: 2,
          labelBackgroundColor: "#5b5cf6",
        },
      },
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: "#0e9f6e",
      downColor: "#dc2626",
      borderVisible: true,
      borderUpColor: "#047857",
      borderDownColor: "#b91c1c",
      wickVisible: true,
      wickUpColor: "#0e9f6e",
      wickDownColor: "#dc2626",
      priceFormat: {
        type: "price",
        precision: 2,
        minMove: 0.01,
      },
    });

    const volumeSeries = chart.addHistogramSeries({
      priceFormat: { type: "volume" },
      priceScaleId: "",
      ...({ scaleMargins: { top: 0.82, bottom: 0 } } as Record<string, unknown>),
    });

    const smaSeries = chart.addLineSeries({
      color: "#3b82f6",
      lineWidth: 3,
      lineStyle: LineStyle.Dashed,
      title: "SMA 20",
      priceFormat: {
        type: "price",
        precision: 2,
        minMove: 0.01,
      },
      lastValueVisible: true,
      priceLineVisible: true,
      lastPriceAnimation: 0,
    });

    const emaSeries = chart.addLineSeries({
      color: "#f59e0b",
      lineWidth: 3,
      lineStyle: LineStyle.Solid,
      title: "EMA 20",
      priceFormat: {
        type: "price",
        precision: 2,
        minMove: 0.01,
      },
      lastValueVisible: true,
      priceLineVisible: true,
      lastPriceAnimation: 0,
    });

    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;
    volumeSeriesRef.current = volumeSeries;
    smaSeriesRef.current = smaSeries;
    emaSeriesRef.current = emaSeries;
    isInitializedRef.current = true;

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        const width = chartContainerRef.current.clientWidth;
        chartRef.current.applyOptions({ width });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        isInitializedRef.current = false;
      }
    };
  }, []);

  // Загрузка и обновление данных
  useEffect(() => {
    if (!isInitializedRef.current || !candlestickSeriesRef.current || !volumeSeriesRef.current) {
      // Ждем инициализации
      const checkInit = setInterval(() => {
        if (isInitializedRef.current && candlestickSeriesRef.current && volumeSeriesRef.current) {
          clearInterval(checkInit);
          // Запускаем загрузку данных после инициализации
          const event = new Event('chartReady');
          window.dispatchEvent(event);
        }
      }, 100);
      
      const timeout = setTimeout(() => {
        clearInterval(checkInit);
        setLoading(false);
      }, 5000);

      const handleReady = () => {
        clearInterval(checkInit);
        clearTimeout(timeout);
        window.removeEventListener('chartReady', handleReady);
      };
      
      window.addEventListener('chartReady', handleReady);
      
      return () => {
        clearInterval(checkInit);
        clearTimeout(timeout);
        window.removeEventListener('chartReady', handleReady);
      };
    }

    setLoading(true);
    setIndicatorValues({ sma: null, ema: null });
    lastCandleRef.current = null;
    currentPriceRef.current = 0;
    const ac = new AbortController();

    const fetchKlines = async () => {
      try {
        const response = await fetch(`/api/klines?pair=${pair}&interval=${timeframe}&limit=200`, { signal: ac.signal });
        if (!response.ok) throw new Error("Failed to fetch klines");
        const data: Kline[] = await response.json();
        if (ac.signal.aborted) return;
        if (!data || data.length === 0) {
          setLoading(false);
          return;
        }

        const toTimeSeconds = (t: number | string): number => {
          const ms = typeof t === 'number' ? t : parseInt(String(t), 10);
          return ms > 1000000000000 ? Math.floor(ms / 1000) : ms;
        };

        const roundPrice = (v: number) => Math.round(v * 100) / 100;
        const candlestickData = data.map((k) => {
          const timeSeconds = toTimeSeconds(k.time);
          const open = roundPrice(k.open);
          const close = roundPrice(k.close);
          const high = roundPrice(Math.max(k.high, open, close));
          const low = roundPrice(Math.min(k.low, open, close));
          return {
            time: timeSeconds as any,
            open,
            high,
            low,
            close,
          };
        });

        const volumeData = data.map((k) => {
          const timeSeconds = toTimeSeconds(k.time);
          return {
            time: timeSeconds as any,
            value: k.volume,
            color: k.close >= k.open ? "#10b981" : "#ef4444",
          };
        });

        if (candlestickSeriesRef.current && volumeSeriesRef.current) {
          candlestickSeriesRef.current.setData(candlestickData);
          volumeSeriesRef.current.setData(volumeData);

          // Сохраняем последнюю свечу
          if (candlestickData.length > 0) {
            const lastCandle = candlestickData[candlestickData.length - 1];
            lastCandleRef.current = {
              time: lastCandle.time as number,
              open: lastCandle.open,
              high: lastCandle.high,
              low: lastCandle.low,
              close: lastCandle.close,
            };
            currentPriceRef.current = lastCandle.close;
          }

          // Индикаторы
          const closes = data.map((k) => k.close);
          const sma20 = calculateSMA(closes, 20);
          const ema20 = calculateEMA(closes, 20);

          const smaData = data.map((k, i) => {
            const timeSeconds = toTimeSeconds(k.time);
            return {
              time: timeSeconds as any,
              value: isNaN(sma20[i]) ? undefined : sma20[i],
            };
          }).filter((d) => d.value !== undefined);

          const emaData = data.map((k, i) => {
            const timeSeconds = toTimeSeconds(k.time);
            return {
              time: timeSeconds as any,
              value: ema20[i],
            };
          });

          if (showSMA && smaSeriesRef.current) {
            smaSeriesRef.current.setData(smaData as any);
            smaSeriesRef.current.applyOptions({ visible: true });
          } else if (smaSeriesRef.current) {
            smaSeriesRef.current.applyOptions({ visible: false });
          }

          if (showEMA && emaSeriesRef.current) {
            emaSeriesRef.current.setData(emaData as any);
            emaSeriesRef.current.applyOptions({ visible: true });
          } else if (emaSeriesRef.current) {
            emaSeriesRef.current.applyOptions({ visible: false });
          }

          const lastSma = smaData.length > 0 ? (smaData[smaData.length - 1] as { value: number }).value : null;
          const lastEma = emaData.length > 0 ? (emaData[emaData.length - 1] as { value: number }).value : null;
          if (!ac.signal.aborted) setIndicatorValues({ sma: lastSma ?? null, ema: lastEma ?? null });

          // Market info
          const last = data[data.length - 1].close;
          const first = data[0].open;
          const change24h = first > 0 ? ((last - first) / first) * 100 : 0;
          const high24h = Math.max(...data.map((k) => k.high));
          const low24h = Math.min(...data.map((k) => k.low));
          const volume24h = data.reduce((sum, k) => sum + k.volume, 0);

          const info = {
            last: last.toFixed(2),
            change24h,
            high24h: high24h.toFixed(2),
            low24h: low24h.toFixed(2),
            volume24h: volume24h.toFixed(2),
          };
          if (ac.signal.aborted) return;
          setMarketInfo(info);
          marketInfoRef.current = info;
        }
      } catch (error) {
        if ((error as Error)?.name === "AbortError") return;
        console.error("Error fetching klines:", error);
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    };

    fetchKlines();

    const interval = setInterval(fetchKlines, 30000);
    return () => {
      ac.abort();
      clearInterval(interval);
    };
  }, [pair, timeframe, showSMA, showEMA]);

  const tfLabels: Record<string, string> = {
    "1m": "1М", "5m": "5М", "15m": "15М", "1h": "1Ч", "4h": "4Ч", "1d": "1Д",
  };
  const tfButtons = ["1m", "5m", "15m", "1h", "4h", "1d"];

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Header: Цена, 24 Ч., МАКС, МИН — на телефоне сетка 2x2, на десктопе строка */}
      {marketInfo && (
        <div className="px-3 py-2.5 border-b border-gray-100 bg-[#f8f9fb] grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-x-4 gap-y-2 sm:gap-y-1 text-xs min-w-0">
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-gray-500 text-[10px] uppercase">Цена</span>
            <span className="font-semibold tabular-nums text-gray-900 truncate">{marketInfo.last}</span>
          </div>
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-gray-500 text-[10px] uppercase">24 Ч.</span>
            <span className={`font-semibold tabular-nums ${marketInfo.change24h >= 0 ? "text-green-600" : "text-red-600"}`}>
              {marketInfo.change24h >= 0 ? "+" : ""}{marketInfo.change24h.toFixed(2)}%
            </span>
          </div>
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-gray-500 text-[10px] uppercase">Макс.</span>
            <span className="font-semibold tabular-nums text-gray-900 truncate">{marketInfo.high24h}</span>
          </div>
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-gray-500 text-[10px] uppercase">Мин.</span>
            <span className="font-semibold tabular-nums text-gray-900 truncate">{marketInfo.low24h}</span>
          </div>
          <div className="col-span-2 sm:col-span-1 flex flex-col gap-0.5 sm:ml-auto min-w-0">
            <span className="text-gray-500 text-[10px] uppercase">Объём</span>
            <span className="font-semibold tabular-nums text-gray-700 truncate">
              {Number(marketInfo.volume24h) >= 1e6
                ? (Number(marketInfo.volume24h) / 1e6).toFixed(2) + " M"
                : Number(marketInfo.volume24h).toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      )}

      {/* Chart area + легенда индикаторов */}
      <div className="relative h-[320px] sm:h-[400px] w-full min-w-0 overflow-hidden bg-[#fafbfc]">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#fafbfc] z-10">
            <div className="text-gray-500 text-sm">Загрузка графика...</div>
          </div>
        )}
        <div ref={chartContainerRef} className="h-full w-full" />
        {!loading && (indicatorValues.sma != null || indicatorValues.ema != null) && (
          <div className="absolute top-2 right-2 z-20 flex flex-col gap-1.5 pointer-events-none">
            {showSMA && indicatorValues.sma != null && (
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/95 shadow-md border border-gray-200/80">
                <span className="w-6 h-0.5 rounded bg-[#3b82f6] border border-[#3b82f6]" style={{ borderStyle: "dashed" }} aria-hidden />
                <span className="text-[10px] font-semibold text-gray-500 uppercase">SMA 20</span>
                <span className="text-sm font-bold tabular-nums text-gray-900">{indicatorValues.sma.toFixed(2)}</span>
              </div>
            )}
            {showEMA && indicatorValues.ema != null && (
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/95 shadow-md border border-gray-200/80">
                <span className="w-6 h-0.5 rounded bg-[#f59e0b]" aria-hidden />
                <span className="text-[10px] font-semibold text-gray-500 uppercase">EMA 20</span>
                <span className="text-sm font-bold tabular-nums text-gray-900">{indicatorValues.ema.toFixed(2)}</span>
              </div>
            )}
            {marketInfo && (
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/95 shadow-md border border-gray-200/80">
                <span className="text-[10px] font-semibold text-gray-500 uppercase">Объём</span>
                <span className="text-sm font-bold tabular-nums text-gray-700">
                  {Number(marketInfo.volume24h) >= 1e6
                    ? (Number(marketInfo.volume24h) / 1e6).toFixed(2) + " M"
                    : Number(marketInfo.volume24h).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom toolbar: таймфреймы + индикаторы */}
      <div className="px-3 py-2 border-t border-gray-100 bg-[#f8f9fb] flex flex-wrap items-center gap-2">
        <div className="flex gap-0.5 rounded-lg bg-gray-100 p-0.5">
          {tfButtons.map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => setTimeframe(tf)}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors touch-manipulation ${
                timeframe === tf
                  ? "bg-[#5b5cf6] text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tfLabels[tf] || tf}
            </button>
          ))}
        </div>
        <div className="flex gap-1 ml-2">
          <button
            type="button"
            onClick={() => setShowSMA(!showSMA)}
            className={`px-2 py-1 rounded text-xs whitespace-nowrap touch-manipulation ${
              showSMA ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            SMA
          </button>
          <button
            type="button"
            onClick={() => setShowEMA(!showEMA)}
            className={`px-2 py-1 rounded text-xs whitespace-nowrap touch-manipulation ${
              showEMA ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            EMA
          </button>
        </div>
      </div>
    </div>
  );
}
