import Hero from "@/components/Hero";
import Ticker from "@/components/Ticker";
import ExchangeWidget from "@/components/ExchangeWidget";
import MobileApp from "@/components/MobileApp";
import Banners from "@/components/Banners";
import BlogSection from "@/components/BlogSection";
import Partners from "@/components/Partners";
import Diagrams from "@/components/Diagrams";

export default function Home() {
  return (
    <main>
      <Hero />
      <section className="container py-6">
        <Ticker />
      </section>
      <section className="container py-8">
        <ExchangeWidget />
      </section>
      <section className="container py-10">
        <MobileApp />
      </section>
      <section className="container py-10">
        <Banners />
      </section>
      <section className="container py-10">
        <BlogSection />
      </section>
      <section className="container py-10">
        <Partners />
      </section>
      <section className="container py-10">
        <Diagrams />
      </section>
    </main>
  );
}
