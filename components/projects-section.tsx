"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FeaturedProjectPanel, type FeaturedProject } from "@/components/featured-project-panel";
import { ProjectCard, type Project } from "@/components/project-card";
import { FadeIn, FadeInStagger, FadeInItem } from "@/components/motion-primitives";
import { projects, getFeaturedProjects } from "@/data/projects";
import { Check, Copy, Github, Linkedin, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

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
// SectionHeading - "Proyectos Destacados" block, rendered in two variants
// ---------------------------------------------------------------------------
function SectionHeading() {
  return (
    <h2 className="flex flex-col gap-2 md:gap-3 justify-center items-center font-serif font-black uppercase text-fluid-section leading-[0.9] tracking-tighter text-foreground">
      <span>Proyectos</span>      
      <span className="text-purple-accent brightness-110">Destacados</span>
    </h2>
  );
}

const allProjects: Project[] = projects
  .filter((project) => !project.featured)
  .map((project) => ({
    id: project.id,
    title: project.title,
    description: project.hook,
    metric: project.metric,
    image: project.image,
    imageAlt: project.imageAlt,
    category: project.category,
    tags: project.tags,
    links: project.links,
    featured: project.featured,
  }));

// ---------------------------------------------------------------------------
// ContactBanner - contact CTA as a full-width band below the grid.
// Kept OUTSIDE the projects grid so the grid only ever holds projects and its
// layout never depends on "how many projects there are".
// ---------------------------------------------------------------------------
const CONTACT_EMAIL = "maxgonzalezballesteros@gmail.com";

function ContactBanner() {
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API no disponible (contexto no seguro / navegador viejo):
      // fallback al mailto, que sigue siendo la vía directa.
      window.location.href = `mailto:${CONTACT_EMAIL}`;
    }
  };

  return (
    <div className="debug-l3 pt-4 pb-20 md:pb-28">
      <FadeIn className="debug-l4 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-5 lg:gap-8 rounded-2xl border border-dashed border-purple-accent/40 bg-card p-5 md:p-6">
          {/* Copy */}
          <div className="flex-1 min-w-0">
            <span className="inline-flex items-center rounded-full border border-purple-accent/25 bg-purple-accent/10 px-3 py-2 text-xs sm:text-sm font-semibold text-purple-accent mb-3">
              Disponible para proyectos
            </span>
            <h3 className="font-serif font-bold text-fluid-card text-foreground text-balance">
              ¿Trabajamos juntos?
            </h3> 
            <p className="mt-2 leading-relaxed text-fluid-body text-muted-foreground max-w-xl">
              ¿Tienes un proyecto en mente? Escríbeme y hablemos de tu idea.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full lg:w-auto">
            <div className="grid grid-cols-[1fr_auto] gap-2 sm:w-auto">
              <Button asChild variant="primary" size="compact">
                <a href={`mailto:${CONTACT_EMAIL}`}>
                  <Mail size={14} aria-hidden="true" />
                  Escríbeme
                </a>
              </Button>
              <Button
                variant="outline"
                size="compact"
                glow
                type="button"
                onClick={copyEmail}
                aria-label={copied ? "Correo copiado" : "Copiar correo"}
                className={`w-11 px-0 ${
                  copied
                    ? "border-purple-accent/40 bg-purple-accent/10 text-indigo-400"
                    : ""
                }`}
              >
                {copied ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:w-auto">
              <Button asChild variant="outline" size="compact" glow>
                <a
                  href="https://github.com/MaxGB23"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github size={14} aria-hidden="true" />
                  GitHub
                </a>
              </Button>
              <Button asChild variant="outline" size="compact" glow>
                <a
                  href="https://www.linkedin.com/in/maxballesteros"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Linkedin size={14} aria-hidden="true" />
                  LinkedIn
                </a>
              </Button>
            </div>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ProjectsGrid - all projects responsive grid
// ---------------------------------------------------------------------------
function ProjectsGrid() {
  return (
    <section
      id="all-projects"
      aria-labelledby="all-projects-heading"
      className="debug-l1 pt-12 lg:pt-16 px-6"
    >
      <div id="all-projects-content" className="debug-l2 max-w-7xl mx-auto">
        <FadeInStagger className="debug-l3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {allProjects.map((project) => (
          <FadeInItem key={project.id}>
              <ProjectCard project={project} />
            </FadeInItem>
          ))}
        </FadeInStagger>

        {/* Contact CTA as a full-width band below the projects grid */}
        <ContactBanner />
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Transition - "Explore All Projects" bridge between stacking & grid
// ---------------------------------------------------------------------------
function ProjectsTransition() {
  return (
    <div className="debug-l1 relative px-6 text-center">


      <div className="debug-l2 max-w-7xl pt-24 lg:pt-0 mx-auto flex flex-col items-center text-center">
        <FadeIn>
          <h2 id="all-projects-heading" className="flex flex-col gap-2 md:gap-3 justify-center items-center font-serif font-black uppercase text-fluid-section leading-[0.9] tracking-tighter text-foreground ">
            <span>Todos los</span>
            <span className="text-purple-accent brightness-110">Proyectos</span>
          </h2>
        </FadeIn>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ProjectsSection - top-level export consumed by page.tsx
// ---------------------------------------------------------------------------
export function ProjectsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!sectionRef.current) return;
    gsap.registerPlugin(ScrollTrigger);

    // Scope = DOM element (not the ref object): GSAP warns "Invalid scope"
    // when the ref's .current is null at selector-resolution time (HMR /
    // matchMedia re-runs in dev). An element is always resolvable.
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // Stacking animation is desktop editorial only: it needs enough BOTH width
      // (lg+, 1024px) and height (768px+) so the in-flow heading and the full
      // two-column card fit the pinned viewport. Outside that range the panels
      // render in normal flow — each card (CTA included) fully visible with
      // native scroll, no jank, no overlap.
      mm.add("(min-width: 1024px) and (min-height: 768px)", () => {
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

      });
    }, sectionRef.current);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={sectionRef}>
      {/* Section heading, mobile/tablet (<lg): the card stacks image-on-top so
          the title cannot overlay it — it flows as a normal block above the stack. */}
      <div className="px-6 md:px-12 pt-12 md:pt-20 flex justify-center lg:hidden">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <SectionHeading />
        </div>
      </div>

      {/* Featured stacking section — Opción B (desktop lg+): the section heading is
          an in-flow block at the top of panel 1 (never overlaps the centered card),
          and because it lives inside panel 1 it stacks/scales away with the card as
          GSAP advances — it never lingers over the following cards. On mobile (<lg)
          the overlay is hidden and the standalone heading above the stack handles it. */}
      <section
        id="proyectos"
        className="featured-section relative"
        aria-labelledby="featured-projects-label"
      >
        {featuredProjects.map((project, index) => (
          <FeaturedProjectPanel
            key={project.id}
            project={project}
            overlay={
              index === 0 ? (
                <FadeIn>
                  <div id="featured-projects-label" className="debug-l1 flex flex-col items-center text-center">
                    <SectionHeading />
                  </div>
                </FadeIn>
              ) : undefined
            }
          />
        ))}
      </section>

      {/* Transition bridge */}
      <ProjectsTransition />

      {/* All projects grid */}
      <ProjectsGrid />
    </div>
  );
}