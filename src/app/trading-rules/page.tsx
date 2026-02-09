// ... existing code ... <new file>
export default function TradingRulesPage() {
  const rules = [
    { pair: "USDT/KZT", minOrder: "1 USDT", stepSize: "0.1 USDT", tickSize: "0.01 KZT" },
    { pair: "BTC/USDT", minOrder: "0.00001 BTC", stepSize: "0.0000001 BTC", tickSize: "0.01 USDT" },
    { pair: "ETH/USDT", minOrder: "0.00001 ETH", stepSize: "0.000001 ETH", tickSize: "0.001 USDT" },
  ];
  return (
    <div className="container py-10">
      <h1 className="text-3xl md:text-4xl font-bold mb-4">Правила торговли</h1>
      <p className="text-muted-foreground mb-6 max-w-prose">Основные параметры ордеров для популярных пар.</p>
      <div className="grid md:grid-cols-3 gap-4">
        {rules.map((r) => (
          <div key={r.pair} className="rounded-xl border p-4 bg-white">
            <div className="font-semibold mb-2">{r.pair}</div>
            <div className="text-sm">Мин. ордер: {r.minOrder}</div>
            <div className="text-sm">Шаг: {r.stepSize}</div>
            <div className="text-sm">Тик: {r.tickSize}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
// ... existing code ... <end>
