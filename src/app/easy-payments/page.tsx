export default function EasyPaymentsPage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl md:text-4xl font-bold mb-4">Удобные платежи</h1>
      <p className="text-muted-foreground mb-6 max-w-prose">
        Пополняйте счёт и выводите средства через партнёрские банки Казахстана.
      </p>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-xl border p-6 bg-white">
          <h2 className="font-semibold mb-3">Пополнение счёта</h2>
          <ul className="text-sm space-y-2 text-muted-foreground">
            <li>• Переводы через Каспий банк</li>
            <li>• Переводы через Хоум кредит банк</li>
            <li>• Другие партнёрские банки</li>
            <li>• Мгновенное зачисление средств</li>
          </ul>
        </div>
        <div className="rounded-xl border p-6 bg-white">
          <h2 className="font-semibold mb-3">Вывод средств</h2>
          <ul className="text-sm space-y-2 text-muted-foreground">
            <li>• Вывод на банковские карты</li>
            <li>• Переводы на счета партнёрских банков</li>
            <li>• Безопасные транзакции</li>
            <li>• Поддержка KZT и других валют</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
