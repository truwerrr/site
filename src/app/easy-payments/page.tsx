export default function EasyPaymentsPage() {
  const paymentMethods = [
    {
      name: "Kaspi Bank",
      icon: "🏦",
      features: [
        "Мгновенное пополнение",
        "Мгновенный вывод",
        "Без комиссии",
        "QR-код для оплаты",
      ],
      minAmount: "100 KZT",
      maxAmount: "5,000,000 KZT",
    },
    {
      name: "Home Credit Bank",
      icon: "🏦",
      features: [
        "Мгновенное пополнение",
        "Быстрый вывод",
        "Без комиссии",
        "Интеграция с банком",
      ],
      minAmount: "100 KZT",
      maxAmount: "3,000,000 KZT",
    },
    {
      name: "Криптовалюта",
      icon: "₿",
      features: [
        "Прямые переводы",
        "Низкие комиссии сети",
        "Быстрое подтверждение",
        "Поддержка всех основных валют",
      ],
      minAmount: "10 USDT",
      maxAmount: "Неограничено",
    },
  ];

  return (
    <div className="container py-6">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900">Удобные платежи</h1>
        <p className="text-gray-600 max-w-prose">
          Пополняйте счёт и выводите средства через партнёрские банки Казахстана и криптовалюту.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        {paymentMethods.map((method, i) => (
          <div key={i} className="rounded-xl border bg-white p-4 md:p-6 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
            <div className="text-3xl md:text-4xl mb-3 md:mb-4">{method.icon}</div>
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4">{method.name}</h2>
            <ul className="space-y-2 mb-4 md:mb-6">
              {method.features.map((feature, j) => (
                <li key={j} className="flex items-start gap-2 text-xs md:text-sm text-gray-700">
                  <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <div className="pt-3 md:pt-4 border-t space-y-2">
              <div className="flex justify-between text-xs md:text-sm">
                <span className="text-gray-600">Мин. сумма:</span>
                <span className="font-semibold text-gray-900">{method.minAmount}</span>
              </div>
              <div className="flex justify-between text-xs md:text-sm">
                <span className="text-gray-600">Макс. сумма:</span>
                <span className="font-semibold text-gray-900">{method.maxAmount}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="rounded-xl border bg-white p-4 md:p-6 shadow-sm">
          <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-gray-900">Пополнение счёта</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold flex-shrink-0">✓</div>
              <div>
                <div className="font-semibold text-gray-900 mb-1">Переводы через Kaspi Bank</div>
                <div className="text-sm text-gray-600">Мгновенное зачисление через QR-код</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold flex-shrink-0">✓</div>
              <div>
                <div className="font-semibold text-gray-900 mb-1">Переводы через Home Credit Bank</div>
                <div className="text-sm text-gray-600">Быстрое зачисление средств</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold flex-shrink-0">✓</div>
              <div>
                <div className="font-semibold text-gray-900 mb-1">Криптовалюта</div>
                <div className="text-sm text-gray-600">Прямые переводы с других кошельков</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold flex-shrink-0">✓</div>
              <div>
                <div className="font-semibold text-gray-900 mb-1">Мгновенное зачисление</div>
                <div className="text-sm text-gray-600">Средства доступны сразу после пополнения</div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-4 md:p-6 shadow-sm">
          <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-gray-900">Вывод средств</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold flex-shrink-0">✓</div>
              <div>
                <div className="font-semibold text-gray-900 mb-1">Вывод на банковские карты</div>
                <div className="text-sm text-gray-600">Поддержка карт Kaspi Bank и других банков</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold flex-shrink-0">✓</div>
              <div>
                <div className="font-semibold text-gray-900 mb-1">Переводы на счета партнёрских банков</div>
                <div className="text-sm text-gray-600">Быстрые и безопасные транзакции</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold flex-shrink-0">✓</div>
              <div>
                <div className="font-semibold text-gray-900 mb-1">Вывод криптовалюты</div>
                <div className="text-sm text-gray-600">На любой внешний кошелёк</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold flex-shrink-0">✓</div>
              <div>
                <div className="font-semibold text-gray-900 mb-1">Безопасные транзакции</div>
                <div className="text-sm text-gray-600">Все операции защищены и проверяются</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 md:mt-8 rounded-xl border bg-gradient-to-br from-primary/10 to-primary/5 p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-gray-900">Важная информация</h2>
        <div className="space-y-2 md:space-y-3 text-sm md:text-base text-gray-700">
          <div>
            <div className="font-semibold mb-1">Комиссии</div>
            <div className="text-sm">Пополнение через банки бесплатно. Комиссия за вывод зависит от валюты и сети.</div>
          </div>
          <div>
            <div className="font-semibold mb-1">Лимиты</div>
            <div className="text-sm">Минимальные и максимальные суммы зависят от выбранного способа оплаты и уровня верификации.</div>
          </div>
          <div>
            <div className="font-semibold mb-1">Время обработки</div>
            <div className="text-sm">Банковские переводы обрабатываются мгновенно. Криптовалютные переводы требуют подтверждения сети (1-3 подтверждения).</div>
          </div>
        </div>
      </div>
    </div>
  );
}
