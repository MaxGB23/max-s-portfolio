"use client";

import { ProjectCard, type Project } from "@/components/project-card";
import { FadeIn, FadeInStagger, FadeInItem } from "@/components/motion-primitives";
import { Section } from "@/components/section";
import { projects, localizeProject } from "@/data/projects";
import { useLanguage } from "@/contexts/language-context";

// ---------------------------------------------------------------------------
// AllProjects - "Todos los Proyectos" heading + responsive grid
//
// Data - single source of truth: data/projects.ts
// ---------------------------------------------------------------------------
export function AllProjects() {
  const { t, lang } = useLanguage();

  // El mapeo se resuelve aqui y no a module scope porque depende de `lang`: el
  // toggle tiene que cambiar el CONTENIDO, no solo el chrome. El server render
  // con el lang del provider inicial, asi que no hay mismatch de hidratacion.
  const allProjects: Project[] = projects
    .filter((project) => !project.featured)
    .map((project) => {
      const localized = localizeProject(project, lang);
      return {
        id: localized.id,
        title: localized.title,
        description: localized.hook,
        metric: localized.metric,
        image: localized.image,
        imageAlt: localized.imageAlt,
        category: localized.category,
        tags: localized.tags,
        links: localized.links,
        featured: localized.featured,
      };
    });
  return (
    <>
      {/* Section heading — previously the transition bridge after the featured
          stack; now it is the natural heading of this section. The gap before it
          is owned by SectionSpacing at the page level. */}
      <Section
        as="div"
        insetClassName="px-6"
        className="relative text-center"
        innerClassName="flex flex-col items-center text-center"
      >
        <FadeIn delayEnter>
          <h2 id="all-projects-heading" className="flex flex-col gap-2 md:gap-3 justify-center items-center font-serif font-black uppercase text-fluid-section leading-[0.9] tracking-tighter text-foreground ">
            <span>{t("section.allProjects.title.first")}</span>
            <span className="text-purple-accent brightness-110">{t("section.allProjects.title.second")}</span>
          </h2>
        </FadeIn>
      </Section>

      <Section
        id="all-projects"
        aria-labelledby="all-projects-heading"
        insetClassName="px-6"
        className="pt-6 md:pt-12 lg:pt-16"
        innerId="all-projects-content"
      >
        <FadeInStagger delayEnter className="debug-l3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
