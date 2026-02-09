// ... existing code ... <new file>
import Image from "next/image";
import Link from "next/link";

const items = [
  { slug: "usdt", title: "USDT", price: "505.00", icon: "https://ext.same-assets.com/1411108151/3376435874.svg" },
  { slug: "btc", title: "BTC", price: "70,184.00", icon: "https://ext.same-assets.com/1411108151/2831370402.svg" },
  { slug: "eth", title: "ETH", price: "2,153.43", icon: "https://ext.same-assets.com/1411108151/1694252569.svg" },
  { slug: "ltc", title: "LTC", price: "55.4707", icon: "https://ext.same-assets.com/1411108151/4280945660.svg" },
  { slug: "sol", title: "SOL", price: "87.90", icon: "https://ext.same-assets.com/1411108151/2977942531.svg" },
];

export default function CurrenciesPage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl md:text-4xl font-bold mb-4">Курсы криптовалют</h1>
      <div className="grid md:grid-cols-5 gap-4">
        {items.map((c) => (
          <Link key={c.slug} href={`/currencies/${c.slug}`} className="rounded-xl border p-4 bg-white">
            <div className="flex items-center gap-2">
              <Image src={c.icon} alt={c.title} width={22} height={22} />
              <div className="font-medium">{c.title}</div>
            </div>
            <div className="mt-1 text-muted-foreground text-sm">Цена</div>
            <div className="text-lg font-semibold">{c.price}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
// ... existing code ... <end>
