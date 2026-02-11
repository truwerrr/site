import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const pair = searchParams.get("pair");
    const interval = searchParams.get("interval") || "1h";
    const limit = parseInt(searchParams.get("limit") || "100");

    if (!pair) {
      return NextResponse.json({ error: "Pair required" }, { status: 400 });
    }

    const [base, quote] = pair.split("/");
    if (!base || !quote) {
      return NextResponse.json({ error: "Invalid pair" }, { status: 400 });
    }

    // Для KZT/USDT используем симулированные данные
    if (base === "KZT" && quote === "USDT") {
      const klines = generateKZTUSDTKlines(limit, interval);
      return NextResponse.json(klines);
    }

    try {
      const binanceSymbol = `${base}${quote}`.toUpperCase();
      const binanceInterval = interval === "1m" ? "1m" : interval === "5m" ? "5m" : interval === "15m" ? "15m" : interval === "1h" ? "1h" : interval === "4h" ? "4h" : "1d";
      
      const response = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=${binanceSymbol}&interval=${binanceInterval}&limit=${limit}`
      );

      if (!response.ok) {
        throw new Error("Binance API error");
      }

      const data = await response.json();
      const klines = data.map((k: any[]) => ({
        time: k[0], // Binance возвращает время в миллисекундах
        open: parseFloat(k[1]),
        high: parseFloat(k[2]),
        low: parseFloat(k[3]),
        close: parseFloat(k[4]),
        volume: parseFloat(k[5]),
      }));

      return NextResponse.json(klines);
    } catch (binanceError) {
      console.error("Binance error, using fallback:", binanceError);
      
      const fallbackKlines = generateFallbackKlines(limit, base, quote);
      return NextResponse.json(fallbackKlines);
    }
  } catch (error) {
    console.error("Error fetching klines:", error);
    return NextResponse.json({ error: "Failed to fetch klines" }, { status: 500 });
  }
}

function generateKZTUSDTKlines(limit: number, interval: string) {
  const now = Date.now();
  const klines = [];
  let basePrice = 450; // ~450 тенге за USDT
  
  // Интервал в миллисекундах
  const intervalMs: Record<string, number> = {
    "1m": 60000,
    "5m": 300000,
    "15m": 900000,
    "1h": 3600000,
    "4h": 14400000,
    "1d": 86400000,
  };
  const intervalTime = intervalMs[interval] || 3600000;

  // Создаем более реалистичный тренд с волнами
  let trend = 0; // Тренд: -1 (вниз), 0 (боковик), 1 (вверх)
  let trendStrength = 0;

  for (let i = limit - 1; i >= 0; i--) {
    const time = now - i * intervalTime;

    if (i % 10 === 0) {
      trend = Math.random() > 0.5 ? 1 : -1;
      trendStrength = Math.random() * 0.4 + 0.15;
    }

    const trendChange = trend * trendStrength;
    const randomChange = (Math.random() - 0.5) * 0.008;
    const totalChange = trendChange + randomChange;

    const open = basePrice;
    const close = basePrice * (1 + totalChange);

    const volatility = Math.random() * 0.015 + 0.008;
    const high = Math.max(open, close) * (1 + volatility * Math.random());
    const low = Math.min(open, close) * (1 - volatility * Math.random());
    
    // Объем зависит от волатильности (больше движение = больше объем)
    const volumeMultiplier = Math.abs(totalChange) * 10 + 1;
    const volume = (Math.random() * 500000 + 50000) * volumeMultiplier;

    klines.push({ time, open, high, low, close, volume });
    basePrice = close;
    
    // Ограничиваем диапазон 440-470
    if (basePrice < 440) basePrice = 440;
    if (basePrice > 470) basePrice = 470;
  }

  return klines;
}

function generateFallbackKlines(limit: number, base: string, quote: string) {
  const now = Date.now();
  const klines = [];
  // Базовые цены для разных пар
  const basePrices: Record<string, number> = {
    BTC: 70000,
    ETH: 2153,
    SOL: 87.9,
  };
  let basePrice = basePrices[base] || 1;

  for (let i = limit - 1; i >= 0; i--) {
    const time = now - i * 3600000;
    const change = (Math.random() - 0.5) * 0.02;
    const open = basePrice;
    const close = basePrice * (1 + change);
    const high = Math.max(open, close) * (1 + Math.random() * 0.01);
    const low = Math.min(open, close) * (1 - Math.random() * 0.01);
    const volume = Math.random() * 100;

    klines.push({ time, open, high, low, close, volume });
    basePrice = close;
  }

  return klines;
}
