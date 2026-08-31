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

const allProjects: Project[] = projects
  .filter((project) => project.id !== "caf" && project.id !== "presidencia")
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
    <div className="relative t-20 md:pt-24 px-6 text-center">
      {/* Horizontal rule */}
      <div className="max-w-7xl mx-auto">
        <div className="h-px bg-border mb-20" />
      </div>

      <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
        <FadeIn>
          <h2 id="all-projects-heading" className="flex flex-col gap-2 md:gap-3 justify-center items-center font-serif font-black uppercase text-5xl sm:text-5xl lg:text-6xl 2xl:text-7xl leading-[0.9] tracking-tighter text-foreground mb-5">
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
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // mm.add("(min-width: 768px)", () => {
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
      // });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={sectionRef}>
      {/* Main Section Title */}
      <div className="px-6 md:px-12 lg:px-20 w-full flex justify-center">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <FadeIn>
            <h2 id="featured-projects-label" className="flex flex-col gap-2 md:gap-3 justify-center items-center font-serif font-black uppercase text-5xl sm:text-5xl lg:text-6xl 2xl:text-7xl leading-[0.9] tracking-tighter text-foreground mb-5">
              <span>Proyectos</span>
              <span className="text-purple-accent brightness-110">Destacados</span>
            </h2>
            <p className="text-sm sm:text-base lg:text-lg 2xl:text-xl text-muted-foreground max-w-lg lg:max-w-xl 2xl mx-auto leading-relaxed">
              Una selección de mis trabajos más relevantes, donde el diseño minimalista se encuentra con el desarrollo de alto rendimiento.
            </p>
          </FadeIn>
        </div>
      </div>

      {/* Featured stacking section */}
      <section
        id="proyectos"
        className="featured-section relative"
        aria-labelledby="featured-projects-label"
      >
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