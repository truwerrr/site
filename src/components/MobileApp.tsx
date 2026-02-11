import Image from "next/image";
import Link from "next/link";

const bullets = [
  "Быстрая покупка и обмен криптовалют",
  "Мультивалютный кошелёк",
  "Уведомления и безопасность",
  "P2P торговля",
  "24/7 поддержка",
];

export default function MobileApp() {
  return (
    <section className="bg-gradient-to-br from-white via-gray-50 to-white rounded-2xl border shadow-lg p-6 md:p-12 overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-0" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl -z-0" />
      
      <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
        <div>
          <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
            МОБИЛЬНОЕ ПРИЛОЖЕНИЕ
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            ATAIX Eurasia Mobile
          </h2>
          <p className="text-gray-600 mb-6 text-lg leading-relaxed">
            Управляйте криптоактивами где угодно. Устанавливайте официальное мобильное приложение ATAIX Eurasia для iOS и Android.
          </p>
          <ul className="space-y-3 mb-8">
            {bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="mt-1.5 w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                <span className="text-gray-700">{b}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-3 items-center">
            <Link href="https://apps.apple.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
              <Image src="https://ext.same-assets.com/1411108151/2643380583.webp" alt="App Store" width={140} height={44} className="h-11 w-auto" />
            </Link>
            <Link href="https://play.google.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
              <Image src="https://ext.same-assets.com/1411108151/4125299392.webp" alt="Google Play" width={160} height={44} className="h-11 w-auto" />
            </Link>
            <Link href="https://appgallery.huawei.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
              <Image src="https://ext.same-assets.com/1411108151/3618676521.svg" alt="Huawei" width={120} height={44} className="h-11 w-auto" />
            </Link>
          </div>
        </div>
        <div className="flex justify-center items-center relative">
          <div className="relative">
            {/* Decorative gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-3xl blur-3xl -z-10 transform scale-110" />
            
            {/* Phone frame with shadow */}
            <div className="relative rounded-3xl p-4 bg-gradient-to-br from-gray-50 to-white shadow-2xl border border-gray-100 hover:shadow-3xl transition-shadow">
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src="https://ext.same-assets.com/1411108151/2022155443.webp"
                  alt="mobile preview"
                  width={520}
                  height={380}
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
            
            {/* Floating decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl animate-pulse-slow" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
          </div>
        </div>
      </div>
    </section>
  );
}
