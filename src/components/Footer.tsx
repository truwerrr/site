import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-12">
      <div className="h-2 bg-gradient-to-r from-[#5b5cf6] via-[#6558f5] to-[#6f4fe6]" />
      <div className="bg-[#2f2d42] text-[#cfd3e0]">
        <div className="container py-12">
          <div className="grid lg:grid-cols-4 gap-10">
            <div className="lg:col-span-3 grid md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-sm uppercase tracking-widest text-[#9aa0c0] mb-4">Криптовалюты</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/market" className="hover:text-white/90">Рынок</Link></li>
                  <li><Link href="/currencies" className="hover:text-white/90">Доступные крипто</Link></li>
                  <li><Link href="/fees" className="hover:text-white/90">Комиссии</Link></li>
                  <li><Link href="/trading-rules" className="hover:text-white/90">Правила торговли</Link></li>
                  <li><Link href="/widget" className="hover:text-white/90">Виджет ATAIX Eurasia</Link></li>
                  <li><Link href="/secux" className="hover:text-white/90">Холодный кошелёк SecuX</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm uppercase tracking-widest text-[#9aa0c0] mb-4">Пользователю</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/blog" className="hover:text-white/90">Блог</Link></li>
                  <li><Link href="/easy-payments" className="hover:text-white/90">Удобные платежи</Link></li>
                  <li><Link href="/faq" className="hover:text-white/90">FAQ</Link></li>
                  <li><Link href="/affiliate" className="hover:text-white/90">Партнёрская программа</Link></li>
                  <li><Link href="/support" className="hover:text-white/90">Поддержка</Link></li>
                  <li><Link href="/api" className="hover:text-white/90">API</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm uppercase tracking-widest text-[#9aa0c0] mb-4">Правила и политики</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/legal" className="hover:text-white/90">О компании</Link></li>
                  <li><Link href="/legal/terms" className="hover:text-white/90">Условия пользования</Link></li>
                  <li><Link href="/legal/privacy-policy" className="hover:text-white/90">Политика конфиденциальности</Link></li>
                  <li><Link href="/legal/risk-disclosure" className="hover:text-white/90">Предупреждение о рисках</Link></li>
                  <li><Link href="/legal/travel-rule" className="hover:text-white/90">Контроль транзакций</Link></li>
                  <li><Link href="/legal/license" className="hover:text-white/90">Лицензии</Link></li>
                </ul>
              </div>
            </div>
            <aside>
              <div className="rounded-2xl bg-[#34324a] border border-white/10 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Image src="https://ext.same-assets.com/1411108151/1780593096.png" alt="AIFC" width={24} height={24} />
                    <span className="font-semibold text-white">AIFC</span>
                  </div>
                  <Link href="/support" className="px-3 py-1 rounded-md bg-[#5b5cf6] text-white text-xs shadow-sm hover:opacity-90">Служба поддержки</Link>
                </div>
                <p className="text-xs leading-relaxed text-[#c9cbe1]">
                  ATAIX Eurasia Ltd. уполномочена в соответствии с лицензией № AFSA-A-LA-2025-0022 от 15.10.2025,
                  выданной регулятором AFSA, осуществлять деятельность по:
                </p>
                <ul className="mt-2 mb-2 space-y-1 text-xs text-[#c9cbe1]">
                  <li><span className="text-[#9aa0c0]">(a)</span> управлению платформой для торговли цифровыми активами;</li>
                  <li><span className="text-[#9aa0c0]">(b)</span> предоставлению кастодиальных услуг;</li>
                  <li><span className="text-[#9aa0c0]">(c)</span> заключению сделок с цифровыми активами от своего имени и от имени клиентов.</li>
                </ul>
                <p className="text-xs">Проверка лицензии:
                  <Link href="https://publicreg.myafsa.com/licence_details/AFSA-A-LA-2025-0022/" target="_blank" rel="noopener noreferrer" className="ml-1 underline text-[#24f0bf]">реестр AFSA</Link>
                </p>
                <div className="mt-3 space-y-1.5 text-xs">
                  <p>Контакты ATAIX Eurasia: +7(727) 356 11 70; +7(701) 591 49 86 · Email: helpdesk@ataix.kz</p>
                  <p>Адрес: Z05T3D8, РК, г. Астана, Мангылик Ел, 55/17, офис 138, 139, 140</p>
                  <p>Жалобы в AFSA: +7 (7172) 64 72 60 · Email: apd@afsa.kz · Адрес: Z05T3D8, г. Астана, Мангылик Ел, 55/17, блок C3.2</p>
                </div>
              </div>
            </aside>
          </div>

          <div className="mt-10 flex flex-wrap gap-6 items-center justify-center">
            <Image src="https://ext.same-assets.com/1411108151/2643380583.webp" alt="App Store" width={120} height={36} />
            <Image src="https://ext.same-assets.com/1411108151/4125299392.webp" alt="Google Play" width={140} height={36} />
            <Image src="https://ext.same-assets.com/1411108151/3618676521.svg" alt="Huawei" width={100} height={36} />
            <Image src="https://ext.same-assets.com/1411108151/2243604945.svg" alt="cryptolock" width={110} height={32} />
          </div>

          <div className="mt-8 flex flex-wrap gap-8 items-center justify-center">
            <Link href="https://www.instagram.com/ataixeurasia/" className="hover:opacity-80">
              <Image src="https://ext.same-assets.com/1411108151/3810578394.svg" alt="Instagram" width={20} height={20} />
            </Link>
            <Link href="https://www.facebook.com/ATAIX.Eurasia" className="hover:opacity-80">
              <Image src="https://ext.same-assets.com/1411108151/962804640.svg" alt="Facebook" width={20} height={20} />
            </Link>
            <Link href="https://www.linkedin.com/company/ataix-eurasia/" className="hover:opacity-80">
              <Image src="https://ext.same-assets.com/1411108151/3062281404.svg" alt="LinkedIn" width={20} height={20} />
            </Link>
            <Link href="https://t.me/ataixeurasia" className="hover:opacity-80">
              <Image src="https://ext.same-assets.com/1411108151/3959368201.png" alt="Telegram" width={20} height={20} />
            </Link>
            <Link href="https://www.youtube.com/@AtaixEurasia" className="hover:opacity-80">
              <Image src="https://ext.same-assets.com/1411108151/2944107857.svg" alt="YouTube" width={24} height={24} />
            </Link>
            <Link href="https://twitter.com/AtaixEurasia" className="hover:opacity-80">
              <Image src="https://ext.same-assets.com/1411108151/4117707943.svg" alt="Twitter" width={20} height={20} />
            </Link>
          </div>

          <div className="mt-8 border-t border-white/10 pt-6 text-center text-xs text-[#9aa0c0]">© 2026 ATAIX Eurasia Ltd. — Уполномоченная торговая организация МФЦА</div>
        </div>
      </div>
    </footer>
  );
}
