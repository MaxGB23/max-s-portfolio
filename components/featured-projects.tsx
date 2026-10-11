"use client";

import { useEffect, useState } from "react";
import { FeaturedProjectPanel, type FeaturedProject } from "@/components/featured-project-panel";
import { FadeIn } from "@/components/motion-primitives";
import { getFeaturedProjects, localizeProject } from "@/data/projects";
import { Section } from "@/components/section";
import { useLanguage } from "@/contexts/language-context";

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
// FeaturedProjects - natural document flow, intentionally GSAP-free.
//
// ONE-SLIDE RULE (level-triggered, self-healing): panel i (i >= 1) is visible
// iff its top has crossed the reveal line (60% of the viewport) AND the next
// panel's top has not (last panel: only the first condition). Exactly one of
// those is on screen at a time. Opacity + a 20px rise are driven purely by
// geometry re-read every scroll frame — fast scrolls, resizes and language
// switches cannot leave stale state. Purely visual: panels keep their space in
// flow (rhythm contract untouched).
//
// PANEL 0 + HEADING = the section's entry slide (owner decision):
// - Panel 0 becomes visible once it has crossed the line (sticky) and only
//   disappears when panel 1 advances past the line once the title started
//   past the viewport top — never by its own top crossing. Scrolling up toward About therefore scrolls title + card 0 off
//   naturally, like any other section, instead of fading them mid-screen (the
//   tall-viewport artifact: the 60% line scales with vh, title height does not).
// - The heading enters early (FadeIn delayEnter, coherent with every other
//   section title) and shares panel 0's exit signal (`advanced`) — so title and
//   card 0 leave together, exactly on the advance to card 2.
//
// REDUCED MOTION (owner decision): animations stay active under
// prefers-reduced-motion — the title AND the cards keep fading/rising, same as
// with motion enabled (consistent with the rest of the site, which has no
// MotionConfig reducedMotion). Do NOT branch render output on
// useReducedMotion(): an SSR/client branch over a media query causes hydration
// mismatches (ReactHydrationError).
// ---------------------------------------------------------------------------
export function FeaturedProjects() {
  const { lang } = useLanguage();

  // Data - single source of truth: data/projects.ts. El mapeo se resuelve aqui y
  // no a module scope porque depende de `lang`: el toggle tiene que cambiar el
  // CONTENIDO, no solo el chrome. El orden (y por tanto `index`) no depende del
  // locale, asi que la geometria del one-slide rule queda intacta.
  const featuredProjects: FeaturedProject[] = getFeaturedProjects().map(
    (project, index) => {
      const localized = localizeProject(project, lang);
      return {
        id: localized.id,
        index: index + 1,
        title: localized.title,
        description: localized.hook,
        metric: localized.metric,
        tags: localized.tags,
        image: localized.image,
        imageAlt: localized.imageAlt,
        category: localized.category,
        bgColor: "var(--background)",
      };
    },
  );

  // visible[i] — per-panel visibility; headingHidden — heading exit gate;
  // entered0 — sticky "panel 0 has crossed the line at least once".
  const [slide, setSlide] = useState(() => ({
    visible: featuredProjects.map(() => false),
    headingHidden: false,
    entered0: false,
  }));

  useEffect(() => {
    const panels = Array.from(
      document.querySelectorAll<HTMLElement>("#proyectos .featured-panel"),
    );
    if (panels.length === 0) return;
    const heading = document.querySelector<HTMLElement>(
      "#proyectos .featured-heading",
    );

    let raf = 0;
    const evaluate = () => {
      raf = 0;
      const line = window.innerHeight * 0.6; // reveal line: top crossing 60%
      const tops = panels.map((panel) => panel.getBoundingClientRect().top);
      // The entry slide (and every panel) waits for the title: its top
      // starts past the viewport top before panel 0's does.
      const headingGone =
        !heading || heading.getBoundingClientRect().top <= 0;
      setSlide((prev) => {
        // Advance signal: panel 1 crossed the line AND the title started
        // past the viewport top → the entry slide exits.
        // On normal viewports the title is long past at the crossing and
        // nothing changes; on very tall viewports this retains slide 1 while
        // the title is still visible.
        const advanced = tops.length > 1 && tops[1] <= line && headingGone;
        const entered0 = prev.entered0 || tops[0] <= line;
        const visible = tops.map((top, i) => {
          if (i === 0) return entered0 && !advanced;
          // Panels engage only after the entry slide exited: while the title
          // owns the viewport there is never a double.
          if (!advanced) return false;
          const nextTop = i + 1 < tops.length ? tops[i + 1] : null;
          return top <= line && (nextTop === null || nextTop > line);
        });
        const headingHidden = advanced;
        const unchanged =
          prev.headingHidden === headingHidden &&
          prev.entered0 === entered0 &&
          prev.visible.every((value, i) => value === visible[i]);
        return unchanged ? prev : { visible, headingHidden, entered0 };
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
      {/* Section heading — enters early (FadeIn delayEnter, like every other
          section title); exits ONLY when panel 1 advances past the line — it
          scrolls off naturally toward About. */}
      <Section
        as="div"
        debug="none"
        className="debug-l1 flex justify-center"
        innerClassName="flex flex-col items-center text-center"
      >
        <div
          className={`featured-heading transition-opacity duration-500 ease-out ${
            slide.headingHidden ? "opacity-0" : ""
          }`}
        >
          {/* Espaciado title - Primera card */}
          <FadeIn delayEnter className="w-full mb-6 md:mb-12 lg:mb-16">
            <SectionHeading />
          </FadeIn>
        </div>
      </Section>

      {/* Panels — exactly one of panels 1..n engaged at a time; panel 0 is the
          sticky entry slide (exits only on advance). Opacity + rise via CSS,
          flow untouched — rhythm safe. */}
      {featuredProjects.map((project, index) => (
        <div
          key={project.id}
          className={`transition-all duration-500 ease-out ${
            slide.visible[index] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
          }`}
        >
          <FeaturedProjectPanel
            project={project}
            isLast={index === featuredProjects.length - 1}
          />
        </div>
      ))}
    </section>
  );
}
