// ... existing code ... <new file>
import Link from "next/link";

export default function SupportPage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl md:text-4xl font-bold mb-4">Служба поддержки</h1>
      <div className="space-y-3">
        <p>WhatsApp: <Link href="https://api.whatsapp.com/send?phone=77015914986" className="text-primary">+7(701) 591 49 86</Link></p>
        <p>Telegram: <Link href="https://t.me/ataixeurasia" className="text-primary">@ataixeurasia</Link></p>
        <p>Email: <Link href="mailto:helpdesk@ataix.kz" className="text-primary">helpdesk@ataix.kz</Link></p>
      </div>
    </div>
  );
}
// ... existing code ... <end>
