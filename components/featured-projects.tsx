"use client";

import { useLayoutEffect, useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FeaturedProjectPanel, type FeaturedProject } from "@/components/featured-project-panel";
import { FadeIn } from "@/components/motion-primitives";
import { getFeaturedProjects } from "@/data/projects";
import { Section } from "@/components/section";
import { useLanguage } from "@/contexts/language-context";

// ---------------------------------------------------------------------------
// Data - single source of truth: data/projects.ts
// ---------------------------------------------------------------------------

const featuredProjects: FeaturedProject[] = getFeaturedProjects()
  .map((project, index) => ({
    id: project.id,
    index: index + 1,
    title: project.title,
    description: project.hook,
    metric: project.metric,
    tags: project.tags,
    image: project.image,
    imageAlt: project.imageAlt,
    category: project.category,
    bgColor: "var(--background)",
  }));

/**
 * Reveal viewport for each panel: fire when the panel's top has crossed 60% of
 * the viewport (not the bottom edge), so the reader can finish the previous
 * card before the next one starts fading in. `once` keeps it a single entrance.
 */
const PANEL_REVEAL_VIEWPORT = {
  once: true,
  amount: "some",
  margin: "0px 0px -40% 0px",
} as const;

// ---------------------------------------------------------------------------
// SectionHeading - "Proyectos Destacados" block (same in-flow FadeIn pattern
// as every other section title in the site)
// ---------------------------------------------------------------------------
function SectionHeading() {
  const { t } = useLanguage();
  return (
    <h2
      id="featured-projects-label"
      className="flex flex-col gap-2 md:gap-3 justify-center items-center font-serif font-black uppercase text-fluid-section leading-[0.9] tracking-tighter text-foreground"
    >
      <span>{t("section.featured.title.first")}</span>
      <span className="text-purple-accent brightness-110">{t("section.featured.title.second")}</span>
    </h2>
  );
}

// ---------------------------------------------------------------------------
// FeaturedProjects - natural document flow: in-flow heading + FadeIn reveals.
// GSAP only owns the optional decorative parallax (reduced-motion guarded).
// ---------------------------------------------------------------------------
export function FeaturedProjects() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Detect prefers-reduced-motion on mount
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  useLayoutEffect(() => {
    if (!sectionRef.current) return;
    gsap.registerPlugin(ScrollTrigger);

    // Scope = DOM element for HMR safety
    const ctx = gsap.context(() => {
      // Optional subtle parallax on background images (decorative only)
      if (!prefersReducedMotion) {
        const bgImages = gsap.utils.toArray<HTMLElement>(".featured-panel-bg");
        bgImages.forEach((bg) => {
          gsap.to(bg, {
            yPercent: 15,
            ease: "none",
            scrollTrigger: {
              trigger: bg.closest(".featured-panel"),
              start: "top bottom",
              end: "bottom top",
              scrub: 0.3,
            },
          });
        });
      }
    }, sectionRef.current);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <div ref={sectionRef}>
      <section
        id="proyectos"
        className="featured-section relative"
        aria-labelledby="featured-projects-label"
      >
        {/* Section heading — in flow, standard FadeIn delayEnter like other titles */}
        <Section
          as="div"
          debug="none"
          className="debug-l2 flex justify-center"
          innerClassName="flex flex-col items-center text-center"
        >
          <FadeIn delayEnter className="w-full mb-12 lg:mb-16">
            <SectionHeading />
          </FadeIn>
        </Section>

        {/* Panels — natural flow; reveal deep enough to finish reading the previous card */}
        {featuredProjects.map((project) => (
          <FadeIn key={project.id} viewport={PANEL_REVEAL_VIEWPORT}>
            <FeaturedProjectPanel project={project} />
          </FadeIn>
        ))}
      </section>
    </div>
  );
}
