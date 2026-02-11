// ... existing code ... <new file>
export default function WidgetPage() {
  const snippet = `<script src="https://ataix-p.kz/widget/main.js"></script>\n<ataix-kz-widget></ataix-kz-widget>`;
  return (
    <div className="container py-10">
      <h1 className="text-3xl md:text-4xl font-bold mb-4">Бесплатный виджет цены</h1>
      <p className="text-muted-foreground mb-4">Скопируйте и вставьте код на свой сайт:</p>
      <pre className="rounded-xl border p-4 bg-white overflow-auto text-sm"><code>{snippet}</code></pre>
    </div>
  );
}
// ... existing code ... <end>
