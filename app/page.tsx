import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/hero-section";
import { AboutSection } from "@/components/about-section";
import { ProjectsSection } from "@/components/projects-section";
import { ProductsSection } from "@/components/products-section";
import { PricingSection } from "@/components/pricing-section";
import { Footer } from "@/components/footer";
import { ScrollProgress } from "@/components/scroll-progress";
import { Projects } from "@/components/projects-prueba";
import RecentProjects from "@/components/recent-projects";
export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <ScrollProgress />
      <Navbar />
      <HeroSection />
      {/* <RecentProjects />
      <Projects /> */}
      <AboutSection />

      <ProjectsSection />

      {/* Divider */}
      <div className="max-w-6xl mx-auto px-6">
        <hr className="border-border" />
      </div>

      <ProductsSection />

      {/* Divider */}
      <div className="max-w-6xl mx-auto px-6">
        <hr className="border-border" />
      </div>

      <PricingSection />
      <Footer />
    </main>
  );
}
