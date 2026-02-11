"use client";

import { useState, useEffect } from "react";

export type MarketRow = {
  id: string;
  base: string;
  quote: string;
  last: string;
  open24h: string;
  high24h: string;
  low24h: string;
  volumeBase24h: string;
  volumeQuote24h: string;
};

const POLL_MS = 15000;

export function useMarkets() {
  const [markets, setMarkets] = useState<MarketRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchMarkets = () =>
      fetch("/api/markets")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (!cancelled && Array.isArray(data)) setMarkets(data);
        })
        .catch(() => {});

    fetchMarkets().finally(() => {
      if (!cancelled) setLoading(false);
    });
    const interval = setInterval(fetchMarkets, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return { markets, loading };
}

export function pairKey(base: string, quote: string): string {
  return `${base}/${quote}`;
}

export function change24h(last: number, open24h: number): number | null {
  if (open24h <= 0) return null;
  return ((last - open24h) / open24h) * 100;
}
