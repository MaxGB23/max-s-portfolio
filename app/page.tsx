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
export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <ScrollProgress />
      <Navbar />

      <HeroSection />
      <PageSpacing pair="hero-about" />

      <AboutSection />
      <PageSpacing pair="about-projects" />

      <FeaturedProjects />
      <PageSpacing pair="projects-all-projects" />

      <AllProjects />
      <PageSpacing pair="all-projects-pricing" />

      <PricingSection />
      <PageSpacing pair="pricing-contact" />

      <ContactSection />
      <PageSpacing pair="contact-footer" />

      <Footer />
    </main>
  );
}
