import Image from "next/image";

export default async function CurrencyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const map: Record<string, { title: string; icon: string; price: string }> = {
    usdt: { title: "USDT", icon: "https://ext.same-assets.com/1411108151/3376435874.svg", price: "505.00" },
    btc: { title: "BTC", icon: "https://ext.same-assets.com/1411108151/2831370402.svg", price: "70,184.00" },
    eth: { title: "ETH", icon: "https://ext.same-assets.com/1411108151/1694252569.svg", price: "2,153.43" },
    ltc: { title: "LTC", icon: "https://ext.same-assets.com/1411108151/4280945660.svg", price: "55.4707" },
    sol: { title: "SOL", icon: "https://ext.same-assets.com/1411108151/2977942531.svg", price: "87.90" },
  };
  const data = map[slug] ?? { title: slug.toUpperCase(), icon: "https://ext.same-assets.com/1411108151/2831370402.svg", price: "—" };
  return (
    <div className="container py-10">
      <h1 className="text-3xl md:text-4xl font-bold mb-4">{data.title}</h1>
      <div className="rounded-xl border p-6 bg-white max-w-xl">
        <div className="flex items-center gap-3">
          <Image src={data.icon} alt={data.title} width={32} height={32} />
          <div className="text-lg font-semibold">Текущая цена: {data.price}</div>
        </div>
        <p className="text-muted-foreground mt-3 text-sm">Детальная страница валюты. Контент будет расширен.</p>
      </div>
    </div>
  );
}
// ... existing code ... <end>
