// ... existing code ... <new file>
import Image from "next/image";

const diagrams = [
  "https://ext.same-assets.com/1411108151/82478555.webp",
  "https://ext.same-assets.com/1411108151/2051827128.webp",
  "https://ext.same-assets.com/1411108151/65995950.webp",
];

export default function Diagrams() {
  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-bold mb-6">Как работает ATAIX</h2>
      <div className="overflow-x-auto">
        <div className="flex gap-4 snap-x snap-mandatory">
          {diagrams.map((src, i) => (
            <div key={i} className="min-w-[80%] md:min-w-[600px] snap-start rounded-xl border bg-white">
              <Image src={src} alt={`Diagram ${i + 1}`} width={1000} height={600} className="w-full h-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
// ... existing code ... <end>
