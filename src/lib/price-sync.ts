// Синхронизация цен с реальными биржами
// ВАЖНО: Только на сервере (API routes, server components)
import { prisma } from './prisma';
import { Decimal } from 'decimal.js';
import { getRates, getRateFromRates } from '@/lib/fetch-rates';

export async function syncKZTUSDTPrice() {
  try {
    const rates = await getRates();
    const usdtKzt = getRateFromRates(rates, 'USDT', 'KZT');
    const usdtPrice = usdtKzt && usdtKzt > 0 ? usdtKzt : 505;
    
    // Обновляем цену в базе данных
    const market = await prisma.market.findFirst({
      where: { base: "KZT", quote: "USDT" },
    });
    
    if (market) {
      const currentPrice = new Decimal(market.last || "505");
      const newPrice = new Decimal(usdtPrice.toString());
      const maxChange = currentPrice.times(0.02);
      const priceDiff = newPrice.minus(currentPrice);
      const clampedDiff = Decimal.min(Decimal.max(priceDiff, maxChange.times(-1)), maxChange);
      const clampedPrice = currentPrice.plus(clampedDiff);
      
      const high24h = Decimal.max(new Decimal(market.high24h || "0"), clampedPrice);
      const low24h = market.low24h === "0" || market.low24h === null
        ? clampedPrice
        : Decimal.min(new Decimal(market.low24h), clampedPrice);
      
      await prisma.market.updateMany({
        where: { base: "KZT", quote: "USDT" },
        data: {
          last: clampedPrice.toString(),
          high24h: high24h.toString(),
          low24h: low24h.toString(),
        },
      });
      
      return clampedPrice.toString();
    }
  } catch (error) {
    console.error("Price sync error:", error);
  }
  
  return null;
}

// Синхронизация цен для других пар (BTC/USDT, ETH/USDT и т.д.)
export async function syncMarketPrice(base: string, quote: string) {
  try {
    const symbol = `${base}/${quote}`;
    // Динамический импорт CCXT только на сервере
    const ccxt = await import('ccxt');
    const exchange = new ccxt.binance();
    
    const ticker = await exchange.fetchTicker(symbol);
    
    const market = await prisma.market.findFirst({
      where: { base, quote },
    });
    
    if (market && ticker) {
      const t = ticker as { last?: number; high?: number; low?: number; high24h?: number; low24h?: number; baseVolume?: number; quoteVolume?: number };
      await prisma.market.updateMany({
        where: { base, quote },
        data: {
          last: t.last?.toString() || market.last,
          high24h: (t.high24h ?? t.high)?.toString() || market.high24h,
          low24h: (t.low24h ?? t.low)?.toString() || market.low24h,
          volumeBase24h: t.baseVolume?.toString() || market.volumeBase24h,
          volumeQuote24h: t.quoteVolume?.toString() || market.volumeQuote24h,
        },
      });
      
      return ticker.last;
    }
  } catch (error) {
    console.error(`Error syncing ${base}/${quote}:`, error);
  }
  
  return null;
}
