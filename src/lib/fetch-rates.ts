const CACHE_MS = 60_000;
let cached: { rates: Rates; at: number } | null = null;

export type Rates = Record<string, Partial<Record<string, number>>>;

const FALLBACK: Rates = {
  KZT: { BTC: 32_700_000, USDT: 505, ETH: 1_085_000 },
  BTC: { KZT: 32_700_000, USDT: 70_184, ETH: 32.5 },
  USDT: { KZT: 505, BTC: 0.00001425, ETH: 0.000464 },
  ETH: { KZT: 1_085_000, BTC: 0.0308, USDT: 2153.43 },
};

async function fetchUsdKzt(): Promise<number | null> {
  try {
    const res = await fetch("https://nationalbank.kz/rss/rates_all.xml", {
      next: { revalidate: 0 },
      headers: { "Accept": "application/xml" },
    });
    if (!res.ok) return null;
    const text = await res.text();
    const usdMatch = text.match(/<item>[\s\S]*?<title>USD[\s\S]*?<description>([\d,.]+)<\/description>/i)
      || text.match(/<description>([\d,.]+)<\/description>[\s\S]*?USD/i);
    if (usdMatch) {
      const rate = parseFloat(usdMatch[1].replace(",", "."));
      if (rate > 0 && rate < 10000) return rate;
    }
    const descMatch = text.match(/USD[\s\S]*?(\d{3,4}\.?\d*)/);
    if (descMatch) {
      const rate = parseFloat(descMatch[1]);
      if (rate > 0) return rate;
    }
  } catch (e) {
    console.error("NBRK rates fetch error:", e);
  }
  return null;
}

async function fetchBinanceTicker(symbol: string): Promise<number | null> {
  try {
    const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`, {
      next: { revalidate: 0 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const price = parseFloat(data?.price);
    return Number.isFinite(price) ? price : null;
  } catch (e) {
    console.error("Binance fetch error:", e);
  }
  return null;
}

function buildRates(usdtKzt: number, btcUsdt: number, ethUsdt: number): Rates {
  const btcKzt = btcUsdt * usdtKzt;
  const ethKzt = ethUsdt * usdtKzt;
  return {
    KZT: { USDT: usdtKzt, BTC: btcKzt, ETH: ethKzt },
    USDT: { KZT: usdtKzt, BTC: 1 / btcUsdt, ETH: 1 / ethUsdt },
    BTC: { KZT: btcKzt, USDT: btcUsdt, ETH: btcUsdt / ethUsdt },
    ETH: { KZT: ethKzt, USDT: ethUsdt, BTC: ethUsdt / btcUsdt },
  };
}

export async function getRates(): Promise<Rates> {
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.rates;

  const [usdtKztRaw, btcUsdt, ethUsdt] = await Promise.all([
    fetchUsdKzt(),
    fetchBinanceTicker("BTCUSDT"),
    fetchBinanceTicker("ETHUSDT"),
  ]);

  const usdtKzt = usdtKztRaw && usdtKztRaw > 0 ? usdtKztRaw : 505;
  const btc = btcUsdt && btcUsdt > 0 ? btcUsdt : 70184;
  const eth = ethUsdt && ethUsdt > 0 ? ethUsdt : 2153.43;

  const rates = buildRates(usdtKzt, btc, eth);
  cached = { rates, at: Date.now() };
  return rates;
}

export function getRateFromRates(rates: Rates, from: string, to: string): number {
  if (from === to) return 1;
  const fromRates = rates[from];
  if (!fromRates || !fromRates[to]) return 0;
  return fromRates[to];
}
