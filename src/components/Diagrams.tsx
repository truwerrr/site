import Image from "next/image";

const diagrams = [
  {
    src: "https://ext.same-assets.com/1411108151/82478555.webp",
    title: "Регистрация и верификация",
    description: "Быстрая регистрация и прохождение KYC",
  },
  {
    src: "https://ext.same-assets.com/1411108151/2051827128.webp",
    title: "Пополнение счёта",
    description: "Множество способов пополнения через банки и криптовалюту",
  },
  {
    src: "https://ext.same-assets.com/1411108151/65995950.webp",
    title: "Торговля и управление",
    description: "Профессиональные инструменты для торговли",
  },
];

export default function Diagrams() {
  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900">Как работает ATAIX</h2>
        <p className="text-gray-600">Простой и понятный процесс работы с платформой</p>
      </div>
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-6 snap-x snap-mandatory">
          {diagrams.map((diagram, i) => (
            <div
              key={i}
              className="min-w-[85%] md:min-w-[600px] snap-start rounded-xl border bg-white shadow-sm hover:shadow-lg transition-shadow"
            >
              <div className="relative">
                <Image
                  src={diagram.src}
                  alt={diagram.title}
                  width={1000}
                  height={600}
                  className="w-full h-auto rounded-t-xl"
                />
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-semibold text-gray-900">
                  Шаг {i + 1}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{diagram.title}</h3>
                <p className="text-gray-600">{diagram.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
