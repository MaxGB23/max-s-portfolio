"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FeaturedProjectPanel, type FeaturedProject } from "@/components/featured-project-panel";
import { ProjectCard, type Project } from "@/components/project-card";
import { FadeIn, FadeInStagger, FadeInItem } from "@/components/motion-primitives";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const featuredProjects: FeaturedProject[] = [
  {
    id: "brand-system",
    index: 1,
    title: "Unified Brand System",
    description:
      "Architected a comprehensive design system from the ground up - tokens, components, and documentation - adopted across six product teams and cutting design-to-dev handoff time in half.",
    tags: ["Next.js", "React", "TypeScript", "Tailwind CSS", "PostgreSQL"],
    image: "/images/project-brand-system.jpg",
    imageAlt: "Brand design system component library overview",
    category: "Design System",
    bgColor: "var(--background)",
  },
  {
    id: "ecommerce",
    index: 2,
    title: "Meridian Commerce",
    description:
      "End-to-end storefront for a luxury lifestyle brand - performance-first Next.js, seamless Stripe checkout, and a CMS-driven catalog that the team could update without touching code.",
    tags: ["Next.js", "Tailwind CSS", "Stripe", "Sanity CMS", "Vercel"],
    image: "/images/project-ecommerce.jpg",
    imageAlt: "Meridian Commerce e-commerce storefront interface",
    category: "Web Development",
    bgColor: "var(--secondary)",
  },
  {
    id: "dashboard",
    index: 3,
    title: "Atlas Analytics",
    description:
      "Real-time SaaS analytics dashboard with role-based access, interactive chart suite, and a data pipeline handling 50k events per minute with sub-second latency.",
    tags: ["React", "D3.js", "Supabase", "Node.js", "WebSockets"],
    image: "/images/project-dashboard.jpg",
    imageAlt: "Atlas Analytics dark-mode SaaS dashboard",
    category: "SaaS Product",
    bgColor: "var(--background)",
  },
];

const allProjects: Project[] = [
  {
    id: "motion-lib",
    title: "Motion Library",
    description:
      "A zero-dependency animation toolkit with 50+ presets and composable React hooks for scroll, hover, and entrance effects.",
    image: "/images/project-motion.jpg",
    imageAlt: "Abstract animation wave forms representing the motion library",
    category: "Open Source",
    tags: ["React", "TypeScript", "Tailwind CSS"],
  },
  {
    id: "typography",
    title: "Editorial Type Scale",
    description:
      "A fluid typographic scale system for editorial web interfaces - fully responsive, contrast-compliant, and export-ready for Figma.",
    image: "/images/project-typography.jpg",
    imageAlt: "Editorial typography specimens on cream background",
    category: "Design Tool",
    tags: ["Next.js", "React", "Tailwind CSS"],
  },
  {
    id: "mobile-app",
    title: "Forma Mobile App",
    description:
      "iOS productivity app with habit tracking, clean onboarding, and a fully custom SwiftUI component set built from a Figma source of truth.",
    image: "/images/project-mobile.jpg",
    imageAlt: "Forma mobile app UI on iPhone",
    category: "Mobile Design",
    tags: ["React", "TypeScript", "PostgreSQL"],
  },
  {
    id: "ui-kit",
    title: "UI Kit Pro",
    description:
      "200+ production-ready React components with full Figma source files and live Storybook documentation.",
    image: "/images/project-brand-system.jpg",
    imageAlt: "UI Kit Pro component library",
    category: "Product",
    tags: ["React", "Tailwind CSS", "TypeScript"],
  },
  {
    id: "deploy-blueprint",
    title: "Deploy Blueprint",
    description:
      "Next.js starter with auth, payments, CI/CD and database pre-wired - go from idea to production in hours, not days.",
    image: "/images/project-dashboard.jpg",
    imageAlt: "Deploy Blueprint starter template",
    category: "Starter Template",
    tags: ["Next.js", "React", "PostgreSQL", "Tailwind CSS"],
  },
  {
    id: "ecommerce-grid",
    title: "Meridian Storefront v2",
    description:
      "Second iteration of the Meridian Commerce platform - internationalization, A/B testing, and a redesigned mobile checkout flow.",
    image: "/images/project-ecommerce.jpg",
    imageAlt: "Meridian Storefront version 2",
    category: "Web Development",
    tags: ["Next.js", "TypeScript", "PostgreSQL"],
  },
];

// ---------------------------------------------------------------------------
// ProjectsGrid - all projects responsive grid
// ---------------------------------------------------------------------------
function ProjectsGrid() {
  return (
    <section
      id="all-projects"
      aria-labelledby="all-projects-heading"
      className="py-20 md:py-28 px-6"
    >
      <div className="max-w-7xl mx-auto">
        <FadeInStagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {allProjects.map((project) => (
            <FadeInItem key={project.id}>
              <ProjectCard project={project} />
            </FadeInItem>
          ))}
        </FadeInStagger>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Transition - "Explore All Projects" bridge between stacking & grid
// ---------------------------------------------------------------------------
function ProjectsTransition() {
  return (
    <div className="relative py-20 md:py-24 px-6 text-center" aria-hidden="false">
      {/* Horizontal rule */}
      <div className="max-w-7xl mx-auto">
        <div className="h-px bg-border mb-20" />
      </div>

      <FadeIn>
        <span
          className="inline-block text-xs uppercase tracking-[0.2em] font-medium mb-4"
          style={{ color: "var(--accent-purple)" }}
        >
          Todos los proyectos
        </span>
        <h2
          id="all-projects-heading"
          className="font-serif font-black text-4xl md:text-5xl text-foreground text-balance mb-4"
        >
          Explora todos los proyectos
        </h2>
        <p className="text-base text-muted-foreground max-w-sm mx-auto leading-relaxed">
          Un vistazo completo al trabajo entregado - desde sistemas de diseño hasta aplicaciones en producción.
        </p>
      </FadeIn>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ProjectsSection - top-level export consumed by page.tsx
// ---------------------------------------------------------------------------
export function ProjectsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        const panels = gsap.utils.toArray<HTMLElement>(".featured-panel");
        if (panels.length === 0) return;

        // Container setup
        gsap.set(".featured-section", {
          height: "100vh",
          overflow: "hidden",
          position: "relative"
        });

        // Panels setup
        gsap.set(panels, {
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100vh",
          zIndex: (i) => i
        });

        gsap.set(panels.slice(1), { yPercent: 100 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: ".featured-section",
            start: "top top",
            // Make the scroll distance dependent on the number of transitions (-1)
            // and reduce it slightly to 80% per panel so it feels a bit faster
            end: `+=${(panels.length - 1) * 80}%`,
            pin: true,
            scrub: true,
          }
        });

        panels.forEach((panel, index) => {
          if (index === 0) return;

          const prevPanels = panels.slice(0, index);

          // The incoming panel slides up
          tl.to(panel, {
            yPercent: 0,
            ease: "none"
          });

          // All previously stacked panels shrink concurrently
          tl.to(
            prevPanels,
            {
              scale: 0.95,
              ease: "none"
            },
            "<" // "<" aligns this tween to start at the exact same time as the previous tween
          );
        });

        return () => {
          // matchMedia handles typical cleanup
        };
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={sectionRef}>
      {/* Featured stacking section */}
      <section
        id="proyectos"
        className="featured-section relative"
        aria-labelledby="featured-projects-label"
      >
        {/* Screen-reader label for the stacking group */}
        <h2 id="featured-projects-label" className="sr-only">
          Proyectos destacados
        </h2>

        {featuredProjects.map((project) => (
          <FeaturedProjectPanel key={project.id} project={project} />
        ))}
      </section>

      {/* Transition bridge */}
      <ProjectsTransition />

      {/* All projects grid */}
      <ProjectsGrid />
    </div>
  );
}
