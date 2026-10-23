import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/hero-section";
import { AboutSection } from "@/components/about-section";
import { FeaturedProjects } from "@/components/featured-projects";
import { AllProjects } from "@/components/all-projects";
import { ProductsSection } from "@/components/products-section";
import { PricingSection } from "@/components/pricing-section";
import { ContactSection } from "@/components/contact-section";
import { Footer } from "@/components/footer";
import { ScrollProgress } from "@/components/scroll-progress";
import { PageSpacing } from "@/components/page-spacing";
import { SECTION_GAP_HALF } from "@/lib/rhythm";
import { projects } from "@/data/projects";
import { getLiveMetrics } from "@/lib/live-metrics";

export default async function Home() {
  // Una metrica puede venir de un registry: se resuelve en el servidor y las
  // cards reciben la cifra ya formateada, para que la home y la ficha del
  // proyecto no muestren numeros distintos. La respuesta se cachea 24 h.
  const liveMetrics = await getLiveMetrics(projects);

  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <ScrollProgress />
      <Navbar />

      <HeroSection />
      <PageSpacing pair="hero-about" />

      <AboutSection />
      <PageSpacing pair="about-projects" />

      <FeaturedProjects liveMetrics={liveMetrics} />
      <PageSpacing pair="projects-all-projects" />

      <AllProjects liveMetrics={liveMetrics} />
      <PageSpacing pair="all-projects-pricing" />

      <PricingSection />

      {/* El ritmo se parte 50/50 — media altura como
          spacer de página y media dentro de #contacto (SECTION_GAP_Y), para
          que el arrival ring encierre la mitad de aire. El espacio negativo total
          sigue siendo 96/128px. */}
      <PageSpacing pair="pricing-contact" height={SECTION_GAP_HALF} />
      <ContactSection />
      <PageSpacing pair="contact-footer" height={SECTION_GAP_HALF} />

      <Footer />
    </main>
  );
}
