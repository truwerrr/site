// ... existing code ... <new file>
import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="container relative pt-16 md:pt-24 pb-10">
        <div className="relative mx-auto max-w-5xl text-center">
          <h1 className="text-3xl md:text-6xl font-bold leading-tight tracking-tight text-[#2f2d42]">
            Инвестируйте, зарабатывайте и управьте своими
            <span className="font-extrabold"> криптоактивами</span> на
            <br />
            <span className="font-extrabold">ATAIX Eurasia</span>
            <span className="text-[#24f0bf]">.</span>
          </h1>
          <p className="mt-4 text-lg md:text-xl text-[#6b6e8a]">Казахстанская лицензированная криптобиржа</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/sessions/signup" className="px-5 py-2.5 rounded-md bg-primary text-white hover:opacity-90">
              Начать
            </Link>
            <Link href="/fees" className="px-5 py-2.5 rounded-md border bg-white hover:bg-gray-50">
              Комиссии
            </Link>
          </div>
        </div>

        {/* Mini market cards */}
        <div className="mt-12 grid md:grid-cols-4 gap-4">
          {mini.map((m) => (
            <div key={m.title} className="rounded-2xl border bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between text-xs text-[#6b6e8a]">
                <div className="flex items-center gap-2">
                  <Image src={m.icon} alt={m.title} width={18} height={18} />
                  <span>{m.title}</span>
                </div>
                <span className={m.delta.startsWith("-") ? "text-red-500" : "text-green-500"}>{m.delta}</span>
              </div>
              <div className="mt-2 text-[#2f2d42]">
                <div className="text-sm">{m.quote}</div>
                <div className="text-xl font-semibold">{m.price}</div>
              </div>
              <div className="mt-3 h-10 w-full rounded bg-gradient-to-r from-[#eef2ff] to-[#f7fbff]" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const mini = [
  {
    title: "USDT Tether",
    quote: "KZT",
    price: "510.90",
    delta: "+1.168%",
    icon: "https://ext.same-assets.com/1411108151/3376435874.svg",
  },
  {
    title: "LTC Litecoin",
    quote: "USDT",
    price: "55.4707",
    delta: "+1.076%",
    icon: "https://ext.same-assets.com/1411108151/4280945660.svg",
  },
  {
    title: "SOL Solana",
    quote: "USDT",
    price: "87.90",
    delta: "-0.980%",
    icon: "https://ext.same-assets.com/1411108151/2977942531.svg",
  },
  {
    title: "BTC Bitcoin",
    quote: "USDT",
    price: "70,896.68",
    delta: "-0.163%",
    icon: "https://ext.same-assets.com/1411108151/2831370402.svg",
  },
];
// ... existing code ... <end>
