// ... existing code ... <new file>
import Image from "next/image";
import Link from "next/link";

const posts = [
  {
    href: "/blog/article/how-to-pay-taxes-when-trading-cryptocurrency",
    title: "Как платить налоги при торговле криптовалютой",
    src: "https://ext.same-assets.com/1411108151/554872682.jpeg",
  },
  {
    href: "/blog/article/what-is-a-mining-farm",
    title: "Что такое майнинг-ферма",
    src: "https://ext.same-assets.com/1411108151/99675774.jpeg",
  },
  {
    href: "/blog/article/crypto-games-the-best-games-to-earn-money",
    title: "Крипто-игры: лучшие игры для заработка",
    src: "https://ext.same-assets.com/1411108151/4082155006.jpeg",
  },
  {
    href: "/blog/article/how-to-earn-money-on-cryptocurrency-from-scratch",
    title: "Как заработать на криптовалюте с нуля (2025)",
    src: "https://ext.same-assets.com/1411108151/2236332473.jpeg",
  },
];

export default function BlogSection() {
  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-bold mb-6">Блог ATAIX</h2>
      <div className="grid md:grid-cols-4 gap-4">
        {posts.map((p) => (
          <Link key={p.href} href={p.href} className="block rounded-xl border overflow-hidden bg-white hover:bg-gray-50">
            <Image src={p.src} alt={p.title} width={600} height={400} className="w-full h-40 object-cover" />
            <div className="p-3 text-sm font-medium">{p.title}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
// ... existing code ... <end>
