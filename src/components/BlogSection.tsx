import Image from "next/image";
import Link from "next/link";

const posts = [
  {
    href: "/blog/article/how-to-pay-taxes-when-trading-cryptocurrency",
    title: "Как платить налоги при торговле криптовалютой",
    src: "https://ext.same-assets.com/1411108151/554872682.jpeg",
    date: "15 января 2025",
    category: "Налоги",
  },
  {
    href: "/blog/article/what-is-a-mining-farm",
    title: "Что такое майнинг-ферма",
    src: "https://ext.same-assets.com/1411108151/99675774.jpeg",
    date: "12 января 2025",
    category: "Майнинг",
  },
  {
    href: "/blog/article/crypto-games-the-best-games-to-earn-money",
    title: "Крипто-игры: лучшие игры для заработка",
    src: "https://ext.same-assets.com/1411108151/4082155006.jpeg",
    date: "10 января 2025",
    category: "Игры",
  },
  {
    href: "/blog/article/how-to-earn-money-on-cryptocurrency-from-scratch",
    title: "Как заработать на криптовалюте с нуля (2025)",
    src: "https://ext.same-assets.com/1411108151/2236332473.jpeg",
    date: "8 января 2025",
    category: "Обучение",
  },
];

export default function BlogSection() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Блог ATAIX</h2>
        <Link href="/blog" className="text-primary font-semibold hover:underline">
          Все статьи →
        </Link>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {posts.map((p) => (
          <Link
            key={p.href}
            href={p.href}
            className="group block rounded-xl border overflow-hidden bg-white hover:shadow-lg transition-all hover:-translate-y-1"
          >
            <div className="relative overflow-hidden">
              <Image
                src={p.src}
                alt={p.title}
                width={600}
                height={400}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 left-3 px-2 py-1 rounded bg-white/90 backdrop-blur-sm text-xs font-semibold text-gray-900">
                {p.category}
              </div>
            </div>
            <div className="p-4">
              <div className="text-xs text-gray-500 mb-2">{p.date}</div>
              <div className="font-semibold text-gray-900 line-clamp-2 group-hover:text-primary transition-colors">
                {p.title}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
