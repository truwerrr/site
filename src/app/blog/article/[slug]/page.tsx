export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <div className="container py-10">
      <h1 className="text-3xl md:text-4xl font-bold mb-4">Статья</h1>
      <p className="text-muted-foreground">Идентификатор: {slug}</p>
      <div className="rounded-xl border p-4 bg-white mt-6">Контент статьи будет добавлен позже.</div>
    </div>
  );
}
// ... existing code ... <end>
