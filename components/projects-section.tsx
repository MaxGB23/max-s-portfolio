"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FeaturedProjectPanel, type FeaturedProject } from "@/components/featured-project-panel";
import { ProjectCard, type Project } from "@/components/project-card";
import { FadeIn, FadeInStagger, FadeInItem } from "@/components/motion-primitives";
import { projects, getFeaturedProjects } from "@/data/projects";

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
// ProjectsGrid - all projects responsive grid
// ---------------------------------------------------------------------------
function ProjectsGrid() {
  return (
    <section
      id="all-projects"
      aria-labelledby="all-projects-heading"
      className="debug-l1 pt-12 lg:pt-16 px-6"
    >
      <div id="all-projects-content" className="debug-l2 max-w-7xl mx-auto pb-12 lg:pb-16">
        <FadeInStagger className="debug-l3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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