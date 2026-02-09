// ... existing code ... <new file>
import Image from "next/image";
import Link from "next/link";

const banners = [
  { href: "/fees", src: "https://ext.same-assets.com/1411108151/3779276537.webp", alt: "Fees" },
  { href: "https://t.me/ataixeurasia", src: "https://ext.same-assets.com/1411108151/760056705.webp", alt: "Telegram" },
  { href: "/secux", src: "https://ext.same-assets.com/1411108151/206462238.webp", alt: "SecuX" },
];

export default function Banners() {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {banners.map((b) => (
        <Link
          key={b.href}
          href={b.href}
          className="block overflow-hidden rounded-xl border bg-white"
          target={b.href.startsWith('http') ? '_blank' : undefined}
          rel={b.href.startsWith('http') ? 'noopener noreferrer' : undefined}
        >
          <Image src={b.src} alt={b.alt} width={800} height={300} className="w-full h-40 md:h-48 object-cover" />
        </Link>
      ))}
    </div>
  );
}
// ... existing code ... <end>
