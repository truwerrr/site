export default function TradingRulesPage() {
  const rules = [
    {
      pair: "USDT/KZT",
      minOrder: "1 USDT",
      stepSize: "0.1 USDT",
      tickSize: "0.01 KZT",
      makerFee: "0.1%",
      takerFee: "0.2%",
      maxOrder: "1,000,000 USDT",
    },
    {
      pair: "BTC/USDT",
      minOrder: "0.00001 BTC",
      stepSize: "0.0000001 BTC",
      tickSize: "0.01 USDT",
      makerFee: "0.1%",
      takerFee: "0.2%",
      maxOrder: "100 BTC",
    },
    {
      pair: "ETH/USDT",
      minOrder: "0.00001 ETH",
      stepSize: "0.000001 ETH",
      tickSize: "0.001 USDT",
      makerFee: "0.1%",
      takerFee: "0.2%",
      maxOrder: "10,000 ETH",
    },
    {
      pair: "SOL/USDT",
      minOrder: "0.01 SOL",
      stepSize: "0.0001 SOL",
      tickSize: "0.001 USDT",
      makerFee: "0.1%",
      takerFee: "0.2%",
      maxOrder: "100,000 SOL",
    },
    {
      pair: "LTC/USDT",
      minOrder: "0.001 LTC",
      stepSize: "0.00001 LTC",
      tickSize: "0.01 USDT",
      makerFee: "0.1%",
      takerFee: "0.2%",
      maxOrder: "50,000 LTC",
    },
  ];

  return (
    <div className="container py-6">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900">Правила торговли</h1>
        <p className="text-gray-600 max-w-prose">
          Основные параметры ордеров, комиссии и лимиты для торговых пар на платформе ATAIX Eurasia.
        </p>
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-left text-sm font-semibold text-gray-700">Торговая пара</th>
                <th className="p-4 text-right text-sm font-semibold text-gray-700">Мин. ордер</th>
                <th className="p-4 text-right text-sm font-semibold text-gray-700">Шаг размера</th>
                <th className="p-4 text-right text-sm font-semibold text-gray-700">Шаг цены</th>
                <th className="p-4 text-right text-sm font-semibold text-gray-700">Maker комиссия</th>
                <th className="p-4 text-right text-sm font-semibold text-gray-700">Taker комиссия</th>
                <th className="p-4 text-right text-sm font-semibold text-gray-700">Макс. ордер</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rules.map((r) => (
                <tr key={r.pair} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-semibold text-gray-900">{r.pair}</td>
                  <td className="p-4 text-right text-gray-700">{r.minOrder}</td>
                  <td className="p-4 text-right text-gray-700">{r.stepSize}</td>
                  <td className="p-4 text-right text-gray-700">{r.tickSize}</td>
                  <td className="p-4 text-right text-green-600 font-semibold">{r.makerFee}</td>
                  <td className="p-4 text-right text-red-600 font-semibold">{r.takerFee}</td>
                  <td className="p-4 text-right text-gray-700">{r.maxOrder}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Mobile Cards */}
        <div className="md:hidden divide-y">
          {rules.map((r) => (
            <div key={r.pair} className="p-4">
              <div className="font-semibold text-lg text-gray-900 mb-4">{r.pair}</div>
              <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Мин. ордер</div>
                  <div className="font-medium text-gray-900">{r.minOrder}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Макс. ордер</div>
                  <div className="font-medium text-gray-900">{r.maxOrder}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Шаг размера</div>
                  <div className="font-medium text-gray-900">{r.stepSize}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Шаг цены</div>
                  <div className="font-medium text-gray-900">{r.tickSize}</div>
                </div>
              </div>
              <div className="pt-3 border-t grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Maker комиссия</div>
                  <div className="font-semibold text-green-600">{r.makerFee}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Taker комиссия</div>
                  <div className="font-semibold text-red-600">{r.takerFee}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Типы ордеров</h2>
          <div className="space-y-3">
            <div>
              <div className="font-semibold text-gray-900 mb-1">Лимитный ордер</div>
              <div className="text-sm text-gray-600">Ордер исполняется по указанной цене или лучше</div>
            </div>
            <div>
              <div className="font-semibold text-gray-900 mb-1">Рыночный ордер</div>
              <div className="text-sm text-gray-600">Ордер исполняется немедленно по текущей рыночной цене</div>
            </div>
            <div>
              <div className="font-semibold text-gray-900 mb-1">Stop ордер</div>
              <div className="text-sm text-gray-600">Ордер активируется при достижении стоп-цены</div>
            </div>
            <div>
              <div className="font-semibold text-gray-900 mb-1">Stop-Limit ордер</div>
              <div className="text-sm text-gray-600">Комбинация стоп-ордера и лимитного ордера</div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Важная информация</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex items-start gap-2">
              <span className="mt-1.5 inline-block h-2 w-2 rounded-full bg-primary flex-shrink-0" />
              <span>Все ордера проверяются на соответствие минимальным требованиям перед размещением</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-1.5 inline-block h-2 w-2 rounded-full bg-primary flex-shrink-0" />
              <span>Комиссии могут варьироваться в зависимости от объёма торговли</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-1.5 inline-block h-2 w-2 rounded-full bg-primary flex-shrink-0" />
              <span>Лимиты могут быть изменены администрацией платформы</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-1.5 inline-block h-2 w-2 rounded-full bg-primary flex-shrink-0" />
              <span>При нарушении правил ордер будет отклонён системой</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
