import Link from "next/link";

const links = [
  {
    href: "/legal/terms",
    label: "Условия использования",
    description: "Правила и условия использования платформы ATAIX Eurasia",
    icon: "📋",
  },
  {
    href: "/legal/privacy-policy",
    label: "Политика конфиденциальности",
    description: "Как мы собираем, используем и защищаем ваши персональные данные",
    icon: "🔒",
  },
  {
    href: "/legal/risk-disclosure",
    label: "Предупреждение о рисках",
    description: "Информация о рисках, связанных с торговлей криптовалютами",
    icon: "⚠️",
  },
  {
    href: "/legal/cookie-policy",
    label: "Политика cookie",
    description: "Использование файлов cookie на нашем веб-сайте",
    icon: "🍪",
  },
  {
    href: "/legal/travel-rule",
    label: "Правило Travel",
    description: "Требования к передаче информации о транзакциях",
    icon: "✈️",
  },
  {
    href: "/legal/license",
    label: "Лицензия",
    description: "Информация о лицензии и регулировании деятельности",
    icon: "📜",
  },
  {
    href: "/legal/publishing-principles",
    label: "Принципы публикации",
    description: "Принципы публикации контента и информации на платформе",
    icon: "📝",
  },
];

export default function LegalPage() {
  return (
    <div className="container py-6">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900">Правовая информация</h1>
        <p className="text-gray-600 max-w-prose">
          Ознакомьтесь с правовыми документами и политиками платформы ATAIX Eurasia.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-xl border bg-white p-6 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 group"
          >
            <div className="text-4xl mb-3">{l.icon}</div>
            <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-primary transition-colors">
              {l.label}
            </h3>
            <p className="text-sm text-gray-600">{l.description}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-xl border bg-gradient-to-br from-primary/10 to-primary/5 p-6">
        <h2 className="text-xl font-bold mb-3 text-gray-900">Важная информация</h2>
        <div className="space-y-3 text-gray-700 text-sm">
          <p>
            Платформа ATAIX Eurasia работает в соответствии с законодательством Республики Казахстан и требованиями
            регулирующих органов.
          </p>
          <p>
            Все пользователи обязаны ознакомиться с правовыми документами перед использованием платформы.
          </p>
          <p>
            При возникновении вопросов обращайтесь в службу поддержки:{" "}
            <Link href="/support" className="text-primary underline font-semibold">
              Служба поддержки
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
