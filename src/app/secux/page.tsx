// ... existing code ... <new file>
import Image from "next/image";

export default function SecuxPage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl md:text-4xl font-bold mb-4">SecuX — аппаратный кошелёк</h1>
      <p className="text-muted-foreground mb-6">Безопасное хранение криптовалют и NFT.</p>
      <div className="grid md:grid-cols-3 gap-4">
        {products.map((src, i) => (
          <div key={i} className="rounded-xl border p-3 bg-white flex items-center justify-center">
            <Image src={src} alt="product" width={240} height={160} className="object-contain" />
          </div>
        ))}
      </div>
    </div>
  );
}

const products = [
  "https://ext.same-assets.com/1411108151/1367553708.png",
  "https://ext.same-assets.com/1411108151/2213524177.png",
  "https://ext.same-assets.com/1411108151/1769171780.png",
];
// ... existing code ... <end>
