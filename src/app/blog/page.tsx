import BlogSection from "@/components/BlogSection";
import Link from "next/link";

const categories = [
  { name: "Все", slug: "all" },
  { name: "Обучение", slug: "education" },
  { name: "Новости", slug: "news" },
  { name: "Аналитика", slug: "analytics" },
  { name: "Безопасность", slug: "security" },
];

const featuredPosts = [
  {
    href: "/blog/article/how-to-pay-taxes-when-trading-cryptocurrency",
    title: "Как платить налоги при торговле криптовалютой",
    excerpt: "Подробное руководство по налогообложению криптовалютных операций в Казахстане",
    src: "https://ext.same-assets.com/1411108151/554872682.jpeg",
    category: "Обучение",
    date: "15 декабря 2024",
  },
  {
    href: "/blog/article/what-is-a-mining-farm",
    title: "Что такое майнинг-ферма",
    excerpt: "Разбираемся в устройстве и принципах работы майнинг-ферм",
    src: "https://ext.same-assets.com/1411108151/99675774.jpeg",
    category: "Обучение",
    date: "12 декабря 2024",
  },
  {
    href: "/blog/article/crypto-games-the-best-games-to-earn-money",
    title: "Крипто-игры: лучшие игры для заработка",
    excerpt: "Обзор популярных игр с возможностью заработка криптовалюты",
    src: "https://ext.same-assets.com/1411108151/4082155006.jpeg",
    category: "Новости",
    date: "10 декабря 2024",
  },
  {
    href: "/blog/article/how-to-earn-money-on-cryptocurrency-from-scratch",
    title: "Как заработать на криптовалюте с нуля (2025)",
    excerpt: "Пошаговое руководство для начинающих инвесторов и трейдеров",
    src: "https://ext.same-assets.com/1411108151/2236332473.jpeg",
    category: "Обучение",
    date: "8 декабря 2024",
  },
];

export default function BlogPage() {
  return (
    <div className="container py-6">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900">Блог ATAIX</h1>
        <p className="text-gray-600 max-w-prose">
          Полезные статьи, новости и аналитика о криптовалютах и блокчейне.
        </p>
      </div>

      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.slug}
              className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-50 text-sm font-medium transition-colors"
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {featuredPosts.map((post) => (
          <Link
            key={post.href}
            href={post.href}
            className="block rounded-xl border overflow-hidden bg-white hover:shadow-lg transition-all hover:-translate-y-1"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={post.src}
                alt={post.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 px-2 py-1 rounded bg-white/90 text-xs font-semibold text-gray-900">
                {post.category}
              </div>
            </div>
            <div className="p-4">
              <div className="text-xs text-gray-500 mb-2">{post.date}</div>
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{post.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-2">{post.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Все статьи</h2>
        <BlogSection />
      </div>

      <div className="rounded-xl border bg-gradient-to-br from-primary/10 to-primary/5 p-6 text-center">
        <h2 className="text-xl font-bold mb-3 text-gray-900">Подпишитесь на обновления</h2>
        <p className="text-gray-700 mb-4">
          Получайте уведомления о новых статьях и важных обновлениях платформы
        </p>
        <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Ваш email"
            className="flex-1 rounded-lg border-2 border-[#edb419] bg-white text-[#2f2d42] px-4 py-3 focus:ring-2 focus:ring-[#edb419]/50"
          />
          <button className="w-full sm:w-auto px-6 py-3 rounded-lg bg-primary text-white hover:opacity-90 font-semibold">
            Подписаться
          </button>
        </div>
      </div>
    </div>
  );
}
