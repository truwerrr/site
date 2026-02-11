import type { Metadata, Viewport } from "next";
import { Lato } from "next/font/google";
import "./globals.css";
import ClientBody from "./ClientBody";
import Script from "next/script";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Providers } from "./providers";

const lato = Lato({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Первая казахстанская лицензионная криптобиржа | ATAIX",
  description:
    "Инвестируйте, зарабатывайте и управляйте криптоактивами ✴️ Купить или обменять криптовалюту в Казахстане ✴️ Первая казахстанская лицензионная криптобиржа",
  metadataBase: new URL("https://ataix-p.kz"),
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
        <Providers>
          <ClientBody>
            <Header />
            {children}
            <Footer />
          </ClientBody>
        </Providers>
      </body>
    </html>
  );
}
