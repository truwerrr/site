import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const CRYPTO_PAIRS = ["BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT", "XRP/USDT", "DOGE/USDT", "ADA/USDT", "AVAX/USDT"] as const;

async function fetchBinanceTicker(symbol: string): Promise<{ last: string; high24h: string; low24h: string; open24h: string; volumeBase24h: string; volumeQuote24h: string } | null> {
  try {
    const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`);
    if (!res.ok) return null;
    const d = await res.json();
    return {
      last: d.lastPrice ?? "0",
      high24h: d.highPrice ?? "0",
      low24h: d.lowPrice ?? "0",
      open24h: d.openPrice ?? "0",
      volumeBase24h: d.volume ?? "0",
      volumeQuote24h: d.quoteVolume ?? "0",
    };
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const dbMarkets = await prisma.market.findMany({
      orderBy: { volumeQuote24h: "desc" },
    });
    const withoutKzt = dbMarkets.filter((m) => m.base !== "KZT");

    const cryptoList: Array<{ id: string; base: string; quote: string; last: string; open24h: string; high24h: string; low24h: string; volumeBase24h: string; volumeQuote24h: string }> = [];
    for (const pair of CRYPTO_PAIRS) {
      const [base, quote] = pair.split("/");
      const symbol = `${base}${quote}`;
      const ticker = await fetchBinanceTicker(symbol);
      const last = ticker?.last ?? "0";
      const open24h = ticker?.open24h ?? last;
      const high24h = ticker?.high24h ?? last;
      const low24h = ticker?.low24h ?? last;
      const volumeBase24h = ticker?.volumeBase24h ?? "0";
      const volumeQuote24h = ticker?.volumeQuote24h ?? "0";
      cryptoList.push({
        id: `binance-${pair}`,
        base,
        quote,
        last,
        open24h,
        high24h,
        low24h,
        volumeBase24h,
        volumeQuote24h,
      });
    }

    const combined = [...cryptoList, ...withoutKzt];
    return NextResponse.json(combined);
  } catch (error) {
    console.error("Error fetching markets:", error);
    return NextResponse.json({ error: "Failed to fetch markets" }, { status: 500 });
  }
}
