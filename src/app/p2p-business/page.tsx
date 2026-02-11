import Link from "next/link";

export default function P2PBusinessPage() {
  return (
    <div className="container py-12 max-w-3xl">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">P2P для бизнеса</h1>
      <p className="text-gray-600 text-lg mb-10">
        Крупные объёмы, индивидуальные условия и персональное сопровождение сделок.
      </p>

      <div className="space-y-6 mb-10">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="font-bold text-lg text-gray-900 mb-2">Крупные объёмы</h2>
          <p className="text-gray-600 text-sm">
            Обмен и покупка криптовалюты крупными суммами с выгодным курсом и фиксированными условиями.
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="font-bold text-lg text-gray-900 mb-2">Безопасность</h2>
          <p className="text-gray-600 text-sm">
            Escrow-сделки, верифицированные контрагенты и поддержка на всех этапах сделки.
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="font-bold text-lg text-gray-900 mb-2">Связь с нами</h2>
          <p className="text-gray-600 text-sm">
            Для обсуждения условий и объёмов напишите в поддержку или перейдите в раздел P2P и создайте сделку.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <Link
          href="/p2p"
          className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-white font-semibold hover:opacity-90 transition-opacity"
        >
          Перейти в P2P
        </Link>
        <Link
          href="/support"
          className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-6 py-3 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
        >
          Служба поддержки
        </Link>
      </div>
    </div>
  );
}
