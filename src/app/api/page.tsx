export default function APIPage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl md:text-4xl font-bold mb-4">API Документация</h1>
      <p className="text-muted-foreground mb-6 max-w-prose">
        Интегрируйте ATAIX Eurasia API в ваши приложения для получения данных о рынках и криптовалютах.
      </p>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-xl border p-6 bg-white">
          <h2 className="font-semibold mb-3">Endpoints</h2>
          <div className="space-y-2 text-sm">
            <div>
              <code className="text-primary">GET /api/v1/markets</code>
              <p className="text-muted-foreground mt-1">Получить список рынков</p>
            </div>
            <div>
              <code className="text-primary">GET /api/v1/ticker</code>
              <p className="text-muted-foreground mt-1">Получить тикеры</p>
            </div>
            <div>
              <code className="text-primary">GET /api/v1/currencies</code>
              <p className="text-muted-foreground mt-1">Получить список валют</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border p-6 bg-white">
          <h2 className="font-semibold mb-3">Аутентификация</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Для использования API требуется API ключ. Получите его в разделе настроек профиля.
          </p>
          <div className="text-sm">
            <p className="mb-2"><strong>Заголовок:</strong></p>
            <code className="block p-2 bg-gray-50 rounded text-xs">Authorization: Bearer YOUR_API_KEY</code>
          </div>
        </div>
      </div>
      <div className="mt-6 rounded-xl border p-6 bg-white">
        <h2 className="font-semibold mb-3">Пример запроса</h2>
        <pre className="bg-gray-50 p-4 rounded text-sm overflow-auto">
          <code>{`curl https://api.ataix.kz/api/v1/markets \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</code>
        </pre>
      </div>
      <div className="mt-6">
        <p className="text-sm text-muted-foreground">
          Для получения API ключа свяжитесь с <a href="/support" className="text-primary underline">поддержкой</a>.
        </p>
      </div>
    </div>
  );
}
