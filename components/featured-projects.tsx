"use client";

import { useEffect, useState } from "react";
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
      className="debug-l2 flex flex-col gap-2 md:gap-3 justify-center items-center font-serif font-black uppercase text-fluid-section leading-[0.9] tracking-tighter text-foreground"
    >
      <span>{t("section.featured.title.first")}</span>
      <span className="text-purple-accent brightness-110">{t("section.featured.title.second")}</span>
    </h2>
  );
}

// ---------------------------------------------------------------------------
// FeaturedProjects - natural document flow: in-flow heading + FadeIn reveals.
// This section is intentionally GSAP-free (parallax removed after QA).
// ---------------------------------------------------------------------------
export function FeaturedProjects() {
  // Level-triggered truth (NOT event-driven): recede[i] is recomputed from
  // geometry — panel i+1's top above the reveal's 60% line — on every scroll
  // frame. Edge-triggered IntersectionObserver missed crossings during fast
  // scrolls (coalesced to "no change" → state went stale and never healed),
  // leaving cards visible after scrolling back up and down again.
  // Purely visual: the panel keeps its space in flow, so no spacer or section
  // boundary moves (rhythm contract untouched).
  const [receded, setReceded] = useState<boolean[]>(() =>
    featuredProjects.map(() => false),
  );

  useEffect(() => {
    const panels = Array.from(
      document.querySelectorAll<HTMLElement>("#proyectos .featured-panel"),
    );
    if (panels.length < 2) return;

    let raf = 0;
    const evaluate = () => {
      raf = 0;
      const line = window.innerHeight * 0.6; // reveal threshold: top crossing 60%
      setReceded((prev) => {
        let changed = false;
        const next = prev.map((value, i) => {
          const nextPanel = panels[i + 1];
          if (!nextPanel) return value; // last panel never recedes (no successor)
          const shouldRecede = nextPanel.getBoundingClientRect().top <= line;
          if (shouldRecede !== value) {
            changed = true;
            return shouldRecede;
          }
          return value;
        });
        return changed ? next : prev;
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(evaluate);
    };

    evaluate();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
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
        {/* Espaciado title - Primera card */}
        <FadeIn delayEnter className="w-full mb-12 lg:mb-16">
          <SectionHeading />
        </FadeIn>
      </Section>

      {/* Panels — natural flow; reveal deep enough to finish reading the previous card */}
      {featuredProjects.map((project, index) => (
        <FadeIn key={project.id} viewport={PANEL_REVEAL_VIEWPORT}>
          <FeaturedProjectPanel
            project={project}
            isLast={index === featuredProjects.length - 1}
            faded={receded[index]}
          />
        </FadeIn>
      ))}
    </section>
  );
}
