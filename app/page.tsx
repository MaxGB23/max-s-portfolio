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
import { SectionSpacing } from "@/components/section-spacing";
export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <ScrollProgress />
      <Navbar />

      <HeroSection />
      <SectionSpacing />

      <AboutSection />
      <SectionSpacing />

      <FeaturedProjects />
      <SectionSpacing />

      <AllProjects />
      <SectionSpacing />

      <PricingSection />
      <SectionSpacing />

      <ContactSection />
      <SectionSpacing />

      <Footer />
    </main>
  );
}
