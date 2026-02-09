import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "./globals.css";
import ClientBody from "./ClientBody";
import Script from "next/script";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const lato = Lato({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
});

export const metadata: Metadata = {
  title: "Первая казахстанская лицензионная криптобиржа | ATAIX.KZ",
  description:
    "Инвестируйте, зарабатывайте и управляйте криптоактивами ✴️ Купить или обменять криптовалюту в Казахстане ✴️ Первая казахстанская лицензионная криптобиржа",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${lato.variable}`}>
      <head>
        <Script crossOrigin="anonymous" src="//unpkg.com/react-grab/dist/index.global.js" />
        <Script crossOrigin="anonymous" src="//unpkg.com/same-runtime/dist/index.global.js" />
      </head>
      <body suppressHydrationWarning className="antialiased">
        <ClientBody>
          <Header />
          {children}
          <Footer />
        </ClientBody>
      </body>
    </html>
  );
}
