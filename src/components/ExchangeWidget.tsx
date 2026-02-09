"use client";
import { useMemo, useState } from "react";
import Image from "next/image";

const rates: Record<"KZT" | "BTC" | "USDT", Partial<Record<"KZT" | "BTC" | "USDT", number>>> = {
  KZT: { BTC: 32700000, USDT: 505 },
  BTC: { KZT: 32700000, USDT: 70184 },
  USDT: { KZT: 505, BTC: 0.00001425 },
};

const options = [
  { code: "KZT", name: "Tenge", icon: "https://ext.same-assets.com/1411108151/2193445507.svg" },
  { code: "BTC", name: "Bitcoin", icon: "https://ext.same-assets.com/1411108151/2831370402.svg" },
  { code: "USDT", name: "Tether", icon: "https://ext.same-assets.com/1411108151/3376435874.svg" },
] as const;

export default function ExchangeWidget() {
  const [from, setFrom] = useState<"KZT" | "BTC" | "USDT">("KZT");
  const [to, setTo] = useState<"KZT" | "BTC" | "USDT">("BTC");
  const [amount, setAmount] = useState(0);

  const result = useMemo(() => {
    if (from === to) return amount;
    if (amount === 0) return 0;
    const r = rates[from]?.[to];
    if (!r) return 0;
    // If converting from KZT, divide; otherwise multiply
    // For BTC/USDT: if from BTC, multiply; if from USDT, multiply by rate
    if (from === "KZT") {
      return amount / r;
    } else if (to === "KZT") {
      return amount * r;
    } else {
      // BTC <-> USDT conversion
      return amount * r;
    }
  }, [amount, from, to]);

  return (
    <div className="rounded-xl border p-4 md:p-6 bg-white">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <label className="text-sm font-medium">Отдаю</label>
          <div className="flex items-center gap-2">
            <select
              className="w-32 rounded border-2 border-[#edb419] bg-white text-[#2f2d42] px-2 py-2 focus:outline-none focus:ring-2 focus:ring-[#edb419]/50"
              value={from}
              onChange={(e) => setFrom(e.target.value as typeof from)}
            >
              {options.map((o) => (
                <option key={o.code} value={o.code}>{o.code}</option>
              ))}
            </select>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="flex-1 rounded border-2 border-[#edb419] bg-white text-[#2f2d42] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#edb419]/50"
              placeholder="0.00"
            />
          </div>
        </div>
        <div className="space-y-3">
          <label className="text-sm font-medium">Получаю</label>
          <div className="flex items-center gap-2">
            <select
              className="w-32 rounded border-2 border-[#edb419] bg-white text-[#2f2d42] px-2 py-2 focus:outline-none focus:ring-2 focus:ring-[#edb419]/50"
              value={to}
              onChange={(e) => setTo(e.target.value as typeof to)}
            >
              {options.map((o) => (
                <option key={o.code} value={o.code}>{o.code}</option>
              ))}
            </select>
            <input
              type="number"
              value={result || 0}
              readOnly
              className="flex-1 rounded border-2 border-[#edb419] bg-white text-[#2f2d42] px-3 py-2"
            />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 pt-4">
        <Image src="https://ext.same-assets.com/1411108151/1910588351.svg" alt="swap" width={20} height={20} />
        <span className="text-xs text-muted-foreground">Курсы приблизительные и используются для демонстрации</span>
      </div>
    </div>
  );
}
