"use client";

import { ProjectCard, type Project } from "@/components/project-card";
import { SECTION_GAP_Y } from "@/lib/rhythm";
import { Reveal } from "@/components/reveal";
import { Section } from "@/components/section";
import { getCatalog, localizeProject } from "@/data/projects";
import { groupCatalog, type CatalogGroupKind } from "@/lib/projects-catalog";
import type { TranslationKey } from "@/data/translations";
import { useLanguage } from "@/contexts/language-context";

// ---------------------------------------------------------------------------
// ProjectsCatalog - "Todos los Proyectos" como pagina de indice (`/proyectos`)
//
// Data - single source of truth: `getCatalog()` en `data/projects.ts`: el
// catalogo es TODAS las fichas, incluidas las 3 destacadas (S3). La particion
// por linaje y ciclo de vida es la regla pura de `lib/projects-catalog.ts`.
//
// Sin metricas vivas (S3): el catalogo no abre un fetch por proyecto. La cifra
// viva, cuando una ficha la declara, sigue en la home y en la ficha.
// ---------------------------------------------------------------------------

/**
 * Etiqueta de cada grupo. El del medio reusa la clave que ya nombra la seccion
 * ("Proyectos" / "Projects"): es el mismo texto del mismo dominio y una clave
 * nueva solo duplicaria la hoja. Los otros dos son copy nuevo.
 */
const GROUP_LABEL_KEYS: Record<CatalogGroupKind, TranslationKey> = {
  family: "section.catalog.group.family",
  projects: "section.allProjects.title.second",
  earlier: "section.catalog.group.earlier",
};

/**
 * Divisor de "Trabajo anterior" (board `06-proyectos-desktop.html`): el mismo
 * encabezado de grupo, con una regla completa encima y mas aire. El margen del
 * primer grupo lo resuelve el indice del map, no el CSS de `:first-child`.
 */
const GROUP_WRAPPER_CLASS: Record<CatalogGroupKind, string> = {
  family: "",
  projects: "mt-12 md:mt-14",
  earlier: "mt-16 pt-7 md:mt-20 md:pt-8",
};

export function ProjectsCatalog() {
  const { t, lang } = useLanguage();

  // El mapeo se resuelve por render y no a module scope porque depende de
  // `lang`: el toggle cambia el CONTENIDO, no solo el chrome. Los grupos ya
  // vienen ordenados y completos de la funcion pura.
  const groups = groupCatalog(getCatalog()).map((group) => ({
    ...group,
    projects: group.projects.map((project): Project => {
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
        // Ciclo de vida: lo consume el sello de la card, no el borde.
        status: localized.status,
        // El `featured` de la card es su PROPIA API (borde destacado): se
        // deriva de la superficie de la ficha, igual que en la home.
        featured: localized.home === "featured",
      };
    }),
  }));

  return (
    <>
      <Section
        as="div"
        insetClassName="px-6"
        className="relative pt-28 md:pt-34 text-center"
        innerClassName="flex flex-col items-center text-center"
      >
        <Reveal delayEnter>
          <h1 className="flex flex-col gap-2 md:gap-3 justify-center items-center font-serif font-black uppercase text-fluid-section leading-[0.9] tracking-tighter text-foreground">
            <span>{t("section.allProjects.title.first")}</span>
            <span className="text-purple-accent brightness-110">
              {t("section.allProjects.title.second")}
            </span>
          </h1>
        </Reveal>
      </Section>

      <Section insetClassName="px-6" className={SECTION_GAP_Y}>
        {groups.map((group) => {
          const headingId = `catalog-group-${group.kind}`;
          return (
            <div key={group.kind} className={GROUP_WRAPPER_CLASS[group.kind]}>
              <Reveal delayEnter>
                <div className="flex items-center gap-3 md:gap-4 mb-5 md:mb-6">
                  <h2
                    id={headingId}
                    className="text-fluid-eyebrow font-semibold uppercase tracking-[0.12em] text-foreground"
                  >
                    {t(GROUP_LABEL_KEYS[group.kind])}
                  </h2>
                  <span aria-hidden="true" className="flex-1 h-px bg-border" />
                </div>
              </Reveal>

              <Reveal delayEnter earlyOnMobile>
                <div
                  aria-labelledby={headingId}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {group.projects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              </Reveal>
            </div>
          );
        })}
      </Section>
    </>
  );
}
