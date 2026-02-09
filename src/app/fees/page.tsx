// ... existing code ... <new file>
export default function FeesPage() {
  const tiers = [
    { volume: "< 100,000 USDT", maker: "0.28%", taker: "0.38%" },
    { volume: "< 1,000,000 USDT", maker: "0.24%", taker: "0.34%" },
    { volume: "< 50,000,000 USDT", maker: "0.20%", taker: "0.30%" },
    { volume: "< 100,000,000 USDT", maker: "0.16%", taker: "0.26%" },
    { volume: "< 500,000,000 USDT", maker: "0.12%", taker: "0.22%" },
    { volume: "< 1,000,000,000 USDT", maker: "0%", taker: "0.20%" },
  ];
  return (
    <div className="container py-10">
      <h1 className="text-3xl md:text-4xl font-bold mb-4">Комиссии</h1>
      <p className="text-muted-foreground mb-6 max-w-prose">Упрощённая таблица комиссий. Для полного списка обратитесь к оригинальной странице.</p>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Объём (30 дней)</th>
              <th className="text-left p-2">Maker</th>
              <th className="text-left p-2">Taker</th>
            </tr>
          </thead>
          <tbody>
            {tiers.map((t) => (
              <tr key={t.volume} className="border-b">
                <td className="p-2">{t.volume}</td>
                <td className="p-2">{t.maker}</td>
                <td className="p-2">{t.taker}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
// ... existing code ... <end>
