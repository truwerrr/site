"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function APIPage() {
  const { data: session, status } = useSession();
  const [copied, setCopied] = useState(false);

  const endpoints = [
    {
      method: "GET",
      path: "/api/v1/markets",
      description: "Получить список всех доступных торговых пар",
      example: "curl https://ataix-p.kz/api/v1/markets",
    },
    {
      method: "GET",
      path: "/api/v1/markets/{pair}/ticker",
      description: "Получить тикер для конкретной торговой пары",
      example: "curl https://ataix-p.kz/api/v1/markets/BTC-USDT/ticker",
    },
    {
      method: "GET",
      path: "/api/v1/markets/{pair}/orderbook",
      description: "Получить книгу ордеров для торговой пары",
      example: "curl https://ataix-p.kz/api/v1/markets/BTC-USDT/orderbook",
    },
    {
      method: "GET",
      path: "/api/v1/markets/{pair}/trades",
      description: "Получить историю сделок для торговой пары",
      example: "curl https://ataix-p.kz/api/v1/markets/BTC-USDT/trades?limit=100",
    },
    {
      method: "GET",
      path: "/api/v1/currencies",
      description: "Получить список всех доступных валют",
      example: "curl https://ataix-p.kz/api/v1/currencies",
    },
    {
      method: "GET",
      path: "/api/v1/klines",
      description: "Получить исторические данные свечей (OHLCV)",
      example: "curl https://ataix-p.kz/api/v1/klines?pair=BTC-USDT&interval=1h&limit=100",
    },
  ];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container py-6">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900">API Документация</h1>
        <p className="text-gray-600 max-w-prose">
          Интегрируйте ATAIX Eurasia API в ваши приложения для получения данных о рынках, криптовалютах и торговле.
        </p>
      </div>

      <div className="space-y-4 md:space-y-6">
        {/* Authentication */}
        <div className="rounded-xl border bg-white p-4 md:p-6 shadow-sm">
          <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-gray-900">Аутентификация</h2>
          <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4">
            Для использования API требуется API ключ. Получите его в разделе настроек профиля.
          </p>
          <div className="space-y-3">
            <div>
              <div className="text-xs md:text-sm font-semibold text-gray-700 mb-2">Заголовок авторизации:</div>
              <div className="flex flex-col sm:flex-row gap-2">
                <code className="flex-1 bg-gray-50 p-2 md:p-3 rounded-lg text-xs md:text-sm border break-all">
                  Authorization: Bearer YOUR_API_KEY
                </code>
                <button
                  onClick={() => handleCopy("Authorization: Bearer YOUR_API_KEY")}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg border hover:bg-gray-50 text-xs md:text-sm font-semibold whitespace-nowrap"
                >
                  {copied ? "✓" : "Копировать"}
                </button>
              </div>
            </div>
            {status !== "authenticated" && (
              <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                <p className="text-sm text-gray-700">
                  <Link href="/sessions/signin" className="text-primary font-semibold underline">
                    Войдите
                  </Link>
                  , чтобы получить API ключ.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Endpoints */}
        <div className="rounded-xl border bg-white p-4 md:p-6 shadow-sm">
          <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-gray-900">Endpoints</h2>
          <div className="space-y-3 md:space-y-4">
            {endpoints.map((endpoint, i) => (
              <div key={i} className="p-3 md:p-4 rounded-lg border bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 mb-2">
                  <span className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${
                    endpoint.method === "GET" ? "bg-green-100 text-green-700" :
                    endpoint.method === "POST" ? "bg-blue-100 text-blue-700" :
                    "bg-gray-100 text-gray-700"
                  }`}>
                    {endpoint.method}
                  </span>
                  <code className="flex-1 text-xs md:text-sm font-mono text-gray-900 break-all">{endpoint.path}</code>
                </div>
                <p className="text-xs md:text-sm text-gray-600 mb-2 md:mb-3">{endpoint.description}</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <code className="flex-1 bg-white p-2 md:p-3 rounded-lg text-xs border font-mono overflow-x-auto break-all">
                    {endpoint.example}
                  </code>
                  <button
                    onClick={() => handleCopy(endpoint.example)}
                    className="w-full sm:w-auto px-3 py-2 rounded-lg border hover:bg-gray-50 text-xs font-semibold whitespace-nowrap"
                  >
                    {copied ? "✓" : "Копировать"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rate Limits */}
        <div className="rounded-xl border bg-white p-4 md:p-6 shadow-sm">
          <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-gray-900">Лимиты запросов</h2>
          <div className="space-y-2 md:space-y-3 text-xs md:text-sm text-gray-700">
            <div className="flex items-start gap-2">
              <span className="mt-1.5 inline-block h-2 w-2 rounded-full bg-primary flex-shrink-0" />
              <span>Публичные endpoints: 120 запросов в минуту</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-1.5 inline-block h-2 w-2 rounded-full bg-primary flex-shrink-0" />
              <span>Приватные endpoints: 60 запросов в минуту</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-1.5 inline-block h-2 w-2 rounded-full bg-primary flex-shrink-0" />
              <span>При превышении лимита возвращается ошибка 429</span>
            </div>
          </div>
        </div>

        {/* Response Format */}
        <div className="rounded-xl border bg-white p-4 md:p-6 shadow-sm">
          <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-gray-900">Формат ответа</h2>
          <p className="text-xs md:text-sm text-gray-600 mb-2 md:mb-3">Все ответы возвращаются в формате JSON:</p>
          <pre className="bg-gray-50 p-3 md:p-4 rounded-lg text-xs md:text-sm overflow-x-auto border">
            <code>{`{
  "success": true,
  "data": {
    // данные ответа
  },
  "timestamp": 1703123456
}`}</code>
          </pre>
        </div>

        {/* Support */}
        <div className="rounded-xl border bg-gradient-to-br from-primary/10 to-primary/5 p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-gray-900">Нужна помощь?</h2>
          <p className="text-xs md:text-sm text-gray-700 mb-3 md:mb-4">
            Если у вас возникли вопросы по использованию API, свяжитесь с нашей службой поддержки.
          </p>
          <Link
            href="/support"
            className="inline-block w-full sm:w-auto px-4 md:px-6 py-2.5 md:py-3 rounded-lg bg-primary text-white hover:opacity-90 font-semibold text-sm md:text-base text-center"
          >
            Связаться с поддержкой
          </Link>
        </div>
      </div>
    </div>
  );
}
