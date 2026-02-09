// ... existing code ... <new file>
import Image from "next/image";

const markets = [
  { pair: "BTC/KZT", price: "32,700,000.00", icon: "https://ext.same-assets.com/1411108151/2831370402.svg" },
  { pair: "BTC/USDT", price: "70,184.00", icon: "https://ext.same-assets.com/1411108151/2831370402.svg" },
  { pair: "ETH/USDT", price: "2,153.43", icon: "https://ext.same-assets.com/1411108151/1694252569.svg" },
  { pair: "SOL/USDT", price: "87.90", icon: "https://ext.same-assets.com/1411108151/2977942531.svg" },
];

export default function MarketPage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl md:text-4xl font-bold mb-4">Рынки</h1>
      <div className="grid md:grid-cols-4 gap-4">
        {markets.map((m) => (
          <div key={m.pair} className="rounded-xl border p-4 bg-white">
            <div className="flex items-center gap-2">
              <Image src={m.icon} alt={m.pair} width={22} height={22} />
              <div className="font-medium">{m.pair}</div>
            </div>
            <div className="mt-2 text-muted-foreground text-sm">Цена</div>
            <div className="text-lg font-semibold">{m.price}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
// ... existing code ... <end>
