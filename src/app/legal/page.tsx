// ... existing code ... <new file>
import Link from "next/link";

const links = [
  { href: "/legal/terms", label: "Условия использования" },
  { href: "/legal/privacy-policy", label: "Политика конфиденциальности" },
  { href: "/legal/risk-disclosure", label: "Предупреждение о рисках" },
  { href: "/legal/cookie-policy", label: "Политика cookie" },
  { href: "/legal/travel-rule", label: "Правило Travel" },
  { href: "/legal/license", label: "Лицензия" },
  { href: "/legal/publishing-principles", label: "Принципы публикации" },
];

export default function LegalPage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl md:text-4xl font-bold mb-4">Правовая информация</h1>
      <div className="grid md:grid-cols-2 gap-4">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="rounded-xl border p-4 bg-white hover:bg-gray-50">
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
// ... existing code ... <end>
