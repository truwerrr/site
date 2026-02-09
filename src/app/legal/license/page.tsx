// ... existing code ... <new file>
import Image from "next/image";
import Link from "next/link";

export default function LicensePage() {
  return (
    <div className="container py-10">
      <h1 className="text-2xl md:text-3xl font-bold mb-4">Лицензия</h1>
      <p className="text-muted-foreground mb-4">ATAIX Eurasia Ltd. лицензия AFSA-A-LA-2025-0022 действительна до 15.10.2025.</p>
      <Link href="https://publicreg.myafsa.com/licence_details/AFSA-A-LA-2025-0022/" className="text-primary underline">Реестр AFSA</Link>
      <div className="grid md:grid-cols-3 gap-4 mt-6">
        <Image src="https://ext.same-assets.com/1411108151/2065923448.jpeg" alt="license" width={400} height={300} className="rounded border" />
        <Image src="https://ext.same-assets.com/1411108151/2685851153.jpeg" alt="license" width={400} height={300} className="rounded border" />
        <Image src="https://ext.same-assets.com/1411108151/1091517905.jpeg" alt="license" width={400} height={300} className="rounded border" />
      </div>
    </div>
  );
}
// ... existing code ... <end>
