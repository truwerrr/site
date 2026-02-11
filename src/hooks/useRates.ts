"use client";
import { useState, useEffect } from "react";

export type Rates = Record<string, Partial<Record<string, number>>>;

const FALLBACK: Rates = {
  KZT: { USDT: 505, BTC: 32700000, ETH: 1085000 },
  USDT: { KZT: 505, BTC: 0.00001425, ETH: 0.000464 },
  BTC: { KZT: 32700000, USDT: 70184, ETH: 32.5 },
  ETH: { KZT: 1085000, BTC: 0.0308, USDT: 2153.43 },
};

export function useRates() {
  const [rates, setRates] = useState<Rates>(FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchRates = () => {
      fetch("/api/rates")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (!cancelled && data && typeof data === "object") setRates(data);
        })
        .catch(() => {});
    };

    setLoading(true);
    fetch("/api/rates")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data && typeof data === "object") setRates(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    const interval = setInterval(fetchRates, 15000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return { rates, loading };
}

export function priceInUsdt(rates: Rates, currency: string): number {
  if (currency === "USDT") return 1;
  if (currency === "KZT") return 1 / (rates.USDT?.KZT || 505);
  if (currency === "BTC") return rates.BTC?.USDT ?? 70184;
  if (currency === "ETH") return rates.ETH?.USDT ?? 2153.43;
  return 0;
}
