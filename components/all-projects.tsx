"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProjectCard, type Project } from "@/components/project-card";
import { Reveal } from "@/components/reveal";
import { Section } from "@/components/section";
import { getHomeGrid, localizeProject } from "@/data/projects";
import type { LiveMetricValues } from "@/lib/live-metrics";
import { withLiveMetric } from "@/lib/live-metrics";
import { useLanguage } from "@/contexts/language-context";

// ---------------------------------------------------------------------------
// AllProjects - "Todos los Proyectos" heading + responsive grid
//
// Data - single source of truth: data/projects.ts
// ---------------------------------------------------------------------------
export function AllProjects({ liveMetrics }: { liveMetrics?: LiveMetricValues }) {
  const { t, lang } = useLanguage();

  // El mapeo se resuelve aqui y no a module scope porque depende de `lang`: el
  // toggle tiene que cambiar el CONTENIDO, no solo el chrome. El server render
  // con el lang del provider inicial, asi que no hay mismatch de hidratacion.
  // La grilla sale del selector de superficie (`home: "grid"`), no de filtrar
  // un flag: el eje es uno solo y el orden del array sigue siendo el visible.
  const allProjects: Project[] = getHomeGrid().map((project) => {
    const localized = localizeProject(project, lang);
    return {
      id: localized.id,
      title: localized.title,
      description: localized.hook,
      metric: liveMetrics?.[localized.id]
        ? withLiveMetric(localized.metric, liveMetrics[localized.id])
        : localized.metric,
      image: localized.image,
      imageAlt: localized.imageAlt,
      mediaFit: localized.mediaFit,
      category: localized.category,
      tags: localized.tags,
      links: localized.links,
      // El `featured` de la card es su PROPIA API (borde destacado): se
      // deriva de la superficie de la ficha, no del flag viejo del modelo.
      featured: localized.home === "featured",
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
        <Reveal delayEnter>
          <h2 id="all-projects-heading" className="flex flex-col gap-2 md:gap-3 justify-center items-center font-serif font-black uppercase text-fluid-section leading-[0.9] tracking-tighter text-foreground ">
            <span>{t("section.allProjects.title.first")}</span>
            <span className="text-purple-accent brightness-110">{t("section.allProjects.title.second")}</span>
          </h2>
        </Reveal>
      </Section>

      <Section
        id="all-projects"
        aria-labelledby="all-projects-heading"
        insetClassName="px-6"
        className="pt-6 md:pt-12 lg:pt-16"
        innerId="all-projects-content"
      >
        {/* Sin `will-change` propio. La promocion a capa la hace la transicion
            de `Reveal` (`opacity` + `translate`) mientras dura, y con eso basta:
            dejarla puesta como clase estatica hacia que TODO el grid (6 cards,
            todo el ancho del contenedor) quedara como una unica capa promovida
            para siempre, y cada frame del scroll tenia que re-rasterizarla.
            Medido a 2048x1280 dpr1.25 con `audit-projects.mjs --wheel`: la clase
            permanente dejaba el scroll en 12.1ms de mediana y 363ms de frames
            perdidos; sin ella, 6.1ms y 89ms. Tambien mejora la entrada (85 ->
            67ms). El commit que la introdujo arreglaba el frame de entrada y a
            cambio creaba este coste continuo. */}
        <Reveal delayEnter earlyOnMobile>
          <div className="debug-l3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {allProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>

          {/* Entrada al catalogo. Es navegacion, no conversion: por eso no es
              un boton relleno (el blanco lleno es el peso de pricing y
              contacto) y por eso el morado no aparece aqui: en reposo el sitio
              lo reserva a la jerarquia de encabezado. Centrada bajo la grilla,
              a 32px del ultimo borde, y dentro del mismo `Reveal` del grid — no
              suma un punto de observacion ni toca la coreografia del scroll. */}
          <div className="flex justify-center pt-6 md:pt-12 lg:pt-14">
            <Link
              href="/proyectos"
              className="group inline-flex items-center gap-2 text-base font-medium text-foreground transition-colors duration-100 hover:underline hover:underline-offset-4 focus-visible:underline focus-visible:underline-offset-4"
            >
              {t("section.allProjects.link")}
              <ArrowRight
                aria-hidden="true"
                className="h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-[3px] motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
              />
            </Link>
          </div>
        </Reveal>
      </Section>
    </>
  );
}
