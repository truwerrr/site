// ... existing code ... <new file>
import Image from "next/image";

const items = [
  { title: "USDT Tether", pair: "KZT", price: "505.00", change: "0.000%", icon: "https://ext.same-assets.com/1411108151/3376435874.svg" },
  { title: "LTC Litecoin", pair: "USDT", price: "55.4707", change: "+1.076%", icon: "https://ext.same-assets.com/1411108151/4280945660.svg" },
  { title: "SOL Solana", pair: "USDT", price: "87.90", change: "-0.980%", icon: "https://ext.same-assets.com/1411108151/2977942531.svg" },
  { title: "BTC Bitcoin", pair: "USDT", price: "70,184.00", change: "+1.716%", icon: "https://ext.same-assets.com/1411108151/2831370402.svg" },
  { title: "POL Polygon", pair: "USDT", price: "0.0948", change: "0.000%", icon: "https://ext.same-assets.com/1411108151/3240735902.svg" },
  { title: "ETH Ethereum", pair: "USDT", price: "2,153.43", change: "+2.560%", icon: "https://ext.same-assets.com/1411108151/1694252569.svg" },
  { title: "TRX Tron", pair: "USDT", price: "0.2816", change: "-2.729%", icon: "https://ext.same-assets.com/1411108151/888534390.svg" },
  { title: "1INCH 1inch", pair: "USDT", price: "0.0997", change: "+3.746%", icon: "https://ext.same-assets.com/1411108151/2161554591.svg" },
];

export default function Ticker() {
  const double = [...items, ...items];
  return (
    <div className="ticker-mask">
      <div className="ticker-track">
        {double.map((it, i) => (
          <div key={i} className="min-w-[240px] rounded-lg border p-3 bg-white">
            <div className="flex items-center gap-2">
              <Image src={it.icon} alt={it.title} width={22} height={22} />
              <div className="text-sm font-medium">{it.title}</div>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">{it.pair}</div>
            <div className="mt-1 text-lg font-semibold">{it.price}</div>
            <div className={`text-xs ${it.change.startsWith("-") ? "text-red-600" : "text-green-600"}`}>{it.change}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
// ... existing code ... <end>
