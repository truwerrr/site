// ... existing code ... <new file>
import Image from "next/image";

const bullets = [
  "Быстрая покупка и обмен криптовалют",
  "Мультивалютный кошелёк",
  "Уведомления и безопасность",
];

export default function MobileApp() {
  return (
    <section className="bg-white rounded-2xl border p-6 md:p-10">
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">ATAIX Eurasia Mobile</h2>
          <p className="text-muted-foreground mb-5 max-w-prose">
            Управляйте криптоактивами где угодно. Устанавливайте официальное мобильное приложение ATAIX Eurasia.
          </p>
          <ul className="space-y-2 mb-6">
            {bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-primary" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-3 items-center">
            <Image src="https://ext.same-assets.com/1411108151/2643380583.webp" alt="App Store" width={140} height={44} />
            <Image src="https://ext.same-assets.com/1411108151/4125299392.webp" alt="Google Play" width={160} height={44} />
            <Image src="https://ext.same-assets.com/1411108151/3618676521.svg" alt="Huawei" width={120} height={44} />
          </div>
        </div>
        <div className="flex justify-center items-center relative">
          <div className="relative">
            {/* Decorative gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-3xl blur-3xl -z-10 transform scale-110" />
            
            {/* Phone frame with shadow */}
            <div className="relative rounded-3xl p-4 bg-gradient-to-br from-gray-50 to-white shadow-2xl border border-gray-100">
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
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
// ... existing code ... <end>
