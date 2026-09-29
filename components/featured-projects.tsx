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

// ---------------------------------------------------------------------------
// SectionHeading - "Proyectos Destacados" block
// ---------------------------------------------------------------------------
function SectionHeading() {
  const { t } = useLanguage();
  return (
    <h2 className="flex flex-col gap-2 md:gap-3 justify-center items-center font-serif font-black uppercase text-fluid-section leading-[0.9] tracking-tighter text-foreground">
      <span>{t("section.featured.title.first")}</span>
      <span className="text-purple-accent brightness-110">{t("section.featured.title.second")}</span>
    </h2>
  );
}

// ---------------------------------------------------------------------------
// FeaturedProjects - Staggered Reveal on Scroll (Variant A)
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
      // Sticky heading fade-out logic
      const heading = document.getElementById("featured-sticky-heading");
      const firstPanel = document.querySelector<HTMLElement>(".featured-panel");

      if (heading && firstPanel) {
        ScrollTrigger.create({
          trigger: firstPanel,
          start: "top 85%",
          end: "bottom top",
          onEnter: () => {
            gsap.to(heading, { opacity: 0, duration: 0.4, ease: "power2.out" });
          },
          onLeaveBack: () => {
            gsap.to(heading, { opacity: 1, duration: 0.4, ease: "power2.out" });
          },
        });
      }

      // Staggered reveal: one ScrollTrigger per panel with index-based delay
      const panels = gsap.utils.toArray<HTMLElement>(".featured-panel");

      if (panels.length > 0) {
        // Initial state (will be animated on enter)
        gsap.set(panels, {
          opacity: prefersReducedMotion ? 1 : 0,
          y: prefersReducedMotion ? 0 : 40,
          scale: prefersReducedMotion ? 1 : 0.98,
        });

        // Create a ScrollTrigger for each panel with staggered delay
        panels.forEach((panel, index) => {
          const delay = index * 0.12; // 120ms between panels

          ScrollTrigger.create({
            trigger: panel,
            start: "top 85%",
            end: "bottom 20%",
            onEnter: () => {
              gsap.to(panel, {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.8,
                ease: "expo.out",
                delay,
              });
            },
            onLeave: () => {
              if (!prefersReducedMotion) {
                gsap.to(panel, {
                  opacity: 0,
                  y: 40,
                  scale: 0.98,
                  duration: 0.5,
                  ease: "power2.in",
                });
              }
            },
            onEnterBack: () => {
              gsap.to(panel, {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.8,
                ease: "expo.out",
                delay,
              });
            },
            onLeaveBack: () => {
              if (!prefersReducedMotion) {
                gsap.to(panel, {
                  opacity: 0,
                  y: 40,
                  scale: 0.98,
                  duration: 0.5,
                  ease: "power2.in",
                });
              }
            },
            once: false, // Allow re-animation on scroll back
          });
        });
      }

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
      {/* Sticky heading above the stack - fades when panel 1 enters */}
      <Section
        as="div"
        debug="none"
        className="debug-l2 flex justify-center"
        innerClassName="flex flex-col items-center text-center"
      >
        <FadeIn delayEnter>
          <div id="featured-sticky-heading" className="sticky top-0 z-10 w-full -mt-12 lg:-mt-16 mb-12 lg:mb-16 px-6">
            <SectionHeading />
          </div>
        </FadeIn>
      </Section>

      {/* Featured section - natural document flow, no pin */}
      <section
        id="proyectos"
        className="featured-section relative"
        aria-labelledby="featured-projects-label"
      >
        <div id="featured-projects-label" className="sr-only">
          <SectionHeading />
        </div>
        {featuredProjects.map((project, index) => (
          <FeaturedProjectPanel
            key={project.id}
            project={project}
          />
        ))}
      </section>
    </div>
  );
}