"use client";

import { ProjectCard, type Project } from "@/components/project-card";
import { FadeIn, FadeInStagger, FadeInItem } from "@/components/motion-primitives";
import { Section } from "@/components/section";
import { projects } from "@/data/projects";

// ---------------------------------------------------------------------------
// Data - single source of truth: data/projects.ts
// ---------------------------------------------------------------------------

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
// AllProjects - "Todos los Proyectos" heading + responsive grid
// ---------------------------------------------------------------------------
export function AllProjects() {
  return (
    <>
      {/* Section heading — previously the transition bridge after the featured
          stack; now it is the natural heading of this section. The gap before it
          is owned by SectionSpacing at the page level. */}
      <Section
        as="div"
        debug="inverted"
        insetClassName="px-6"
        className="relative text-center"
        innerClassName="flex flex-col items-center text-center"
      >
        <FadeIn>
          <h2 id="all-projects-heading" className="flex flex-col gap-2 md:gap-3 justify-center items-center font-serif font-black uppercase text-fluid-section leading-[0.9] tracking-tighter text-foreground ">
            <span>Todos los</span>
            <span className="text-purple-accent brightness-110">Proyectos</span>
          </h2>
        </FadeIn>
      </Section>

      <Section
        id="all-projects"
        aria-labelledby="all-projects-heading"
        insetClassName="px-6"
        className="pt-12 lg:pt-16"
        innerId="all-projects-content"
      >
        <FadeInStagger className="debug-l3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {allProjects.map((project) => (
            <FadeInItem key={project.id}>
              <ProjectCard project={project} />
            </FadeInItem>
          ))}
        </FadeInStagger>
      </Section>
    </>
  );
}
