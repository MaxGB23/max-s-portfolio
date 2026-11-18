"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import type { ProjectLink } from "@/data/projects";
import { StackIcon } from "@/components/icons";
import { saveHomeScroll } from "@/hooks/use-lenis";
import { useLanguage } from "@/contexts/language-context";
import { projectSeal, type ProjectSeal } from "@/lib/projects-catalog";
import type { TranslationKey } from "@/data/translations";

export interface Project {
  id: string;
  title: string;
  description: string;
  metric: string;
  image: string;
  imageAlt: string;
  /** Como encaja la media en su marco. Ausente = "cover" (campo de la ficha). */
  category: string;
  tags?: string[];
  links?: ProjectLink[];
  /** Ciclo de vida de la ficha. Lo lee el sello, no el borde de la card. */
  status?: "active" | "pre-release" | "finished";
  /** API PROPIA de la card (borde destacado). Quien la pase la deriva de la
      superficie de la ficha (`home === "featured"`), no de un flag del modelo. */
  featured?: boolean;
}

/**
 * Sello de la media: etiqueta de cada estado en su hoja de traduccion. El tipo
 * `Record<ProjectSeal, ...>` es el checklist: un sello nuevo sin etiqueta no
 * compila.
 */
const SEAL_LABEL_KEYS: Record<ProjectSeal, TranslationKey> = {
  "pre-release": "section.projects.seal.preRelease",
  featured: "section.projects.seal.featured",
};

/**
 * Geometria del sello, tomada del tratamiento A de `09-badge-destacada.html` y
 * del specimen 03 de `10-destacada-sin-etiqueta.html` (board 09 lo dibuja a
 * 16px; el board 10, sobre la card real de la grilla, a 12px - gana 12px).
 *
 * El velo `rgb(0 0 0 / .55)` con `blur(6px)` es lo que hace que el sello no
 * dependa de la media: blanco sobre ese velo pasa con cualquier imagen. El
 * borde `rgb(255 255 255 / .18)` y el punto morado son decorativos.
 */
const SEAL_CLASS =
  "absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-[rgb(255_255_255_/_0.18)] bg-[rgb(0_0_0_/_0.55)] px-2.5 py-1 text-[10px] font-bold uppercase leading-[1.6] tracking-[0.1em] text-white backdrop-blur-[6px]";

/** Punto morado de 5px: decorativo, por eso `aria-hidden`. */
const SEAL_DOT_CLASS = "size-[5px] flex-none rounded-full bg-purple-accent";

/**
 * Sizes of the card image.
 *
 * The real slot is NOT 100vw: the section inset is `px-6` (48px) and the
 * grid is 1/2/3 columns with a 24px gap, so the card is
 * `100vw - 48px`, `(100vw - 72px) / 2` and `(100vw - 96px) / 3`.
 * The grid ALSO stops growing at the section's 1280px max width, so from
 * ~1328px of viewport upward the third branch must stop growing too: without
 * the cap a 2048px window declared a 650px slot for a 411px card and the
 * browser picked the 828w variant (4x the pixels the card paints, measured).
 * Declaring the real width matters twice: the browser picks the variant
 * that fits the slot instead of the next one up, and the GPU uploads a
 * texture that matches what gets painted. With `100vw` a 448px slot in a
 * 1440px viewport asked for 640w; the trace showed the slow frame at the
 * grid going entirely to the GPU process (texture upload and scaling)
 * with the renderer main thread idle.
 *
 * The breakpoints match the grid (`sm`=640, `lg`=1024). `1232px` is the
 * grid's own width once the container is capped: 1280 - 48 of insets.
 */
const CARD_IMAGE_SIZES =
  "(max-width: 640px) calc(100vw - 48px), (max-width: 1024px) calc((100vw - 72px) / 2), calc(min(100vw - 96px, 1232px) / 3)";

interface ProjectCardProps {
  project: Project;
}

/**
 * Media que hay que LEER ENTERA (diagramas, infografias con texto): `contain`
 * ajusta la imagen al marco en vez de recortarla, con 12px de inset para que no
 * toque los bordes. El fondo ya es `bg-muted`, la superficie que la card usa
 * para la media. Cover sigue siendo el default: una captura de producto llena
 * el marco y el recorte no quita informacion. El zoom de hover y la geometria
 * de la card (`aspect-16/10`, radio, sello) no cambian en ninguno de los dos.
 */

export function ProjectCard({ project }: ProjectCardProps) {
  const { t } = useLanguage();
  const externalLink = project.links?.find((link) => link.external);
  // Uno o ninguno: la regla vive en `lib/projects-catalog.ts` (pura, testeada).
  const seal = projectSeal(project);
  // Ausente = "cover": las nueve fichas con captura no cambian de render.
  return (
    <article
      className={`project-card group relative flex flex-col h-full bg-card border rounded-2xl overflow-hidden cursor-pointer duration-300 ease-out hover:-translate-y-1.5 hover:shadow-lg ${
        "border-border"
      }`}
      aria-labelledby={`project-title-${project.id}`}
    >
      {/* Whole-card link to the detail page — the primary interaction: clicking
          anywhere on the card navigates to the case study. The external link in
          the footer sits above this overlay (z-20) to stay independently clickable. */}
      <Link
        href={`/proyectos/${project.id}`}
        onClick={() => saveHomeScroll(window.scrollY)}
        aria-label={t("common.caseStudyOfTitle").replace("{title}", project.title)}
        className="absolute inset-0 z-10 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-accent/60"
      />

      {/* Image */}
      <div className="relative w-full aspect-16/10 overflow-hidden bg-muted">
        {project.image ? (
          <Image
            src={project.image}
            alt={project.imageAlt}
            fill
            decoding="async"
            loading="eager"
            className={`object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]`}
            sizes={CARD_IMAGE_SIZES}
          />
        ) : (
          <div className="flex items-center justify-center h-full w-full bg-gradient-to-br from-purple-accent/10 to-transparent">
            <span className="font-mono text-xs 2xl:text-sm uppercase tracking-widest text-muted-foreground px-4 text-center">
              {project.category}
            </span>
          </div>
        )}

        {/* Sello: sobre la media, a 12px del borde superior izquierdo. Es
            decorativo respecto de la card (no es un enlace ni una region), pero
            su texto se lee: no lleva `aria-hidden` en el contenedor. */}
        {seal ? (
          <span className={SEAL_CLASS}>
            <span aria-hidden="true" className={SEAL_DOT_CLASS} />
            {t(SEAL_LABEL_KEYS[seal])}
          </span>
        ) : null}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5">
        <h3
          id={`project-title-${project.id}`}
          className="font-serif font-bold text-fluid-card-title text-foreground mb-2 text-balance group-hover:text-foreground transition-colors"
        >
          {project.title}
        </h3>
        <p className="text-fluid-card-desc leading-relaxed text-content flex-1 mb-4 line-clamp-3 max-h-[4.875em]">
          {project.description}
        </p>

        {/* Key metric */}
        {project.metric && (
          <div className="mb-4">
            <span className="inline-flex items-center rounded-full border border-purple-accent/25 bg-purple-accent/10 px-3 py-2 text-xs 2xl:text-sm font-semibold text-purple-accent">
              {project.metric}
            </span>
          </div>
        )}

        {/* Tech stack tags - Icons with gap */}
        <div className="flex items-center gap-2 mb-4" aria-label={t("common.technologiesUsed")}>
          {project.tags?.map((tag, index) => (
            <div
              key={index}
              className="flex items-center justify-center w-8 h-8 2xl:w-12 2xl:h-12 rounded-full border border-black bg-card shadow-sm shadow-gray-700 transition-all duration-300 cursor-default group"
              title={tag}
            >
              <StackIcon
                name={tag}
                className="w-4 h-4 2xl:w-6 2xl:h-6 text-foreground opacity-80 group-hover:opacity-100 transition-opacity"
                labelClassName="text-[11px] 2xl:text-xs font-bold text-foreground/60 uppercase tracking-tighter"
              />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-border flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs 2xl:text-sm font-semibold text-muted-foreground/90 group-hover:text-foreground transition-colors duration-200">
            {t("section.projects.caseStudyLabel")}
            <ChevronRight className="size-3.5 2xl:size-4" aria-hidden="true" />
          </span>
          {externalLink ? (
            <a
              href={externalLink.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${project.title} — ${externalLink.label}`}
              className="relative z-20 inline-flex items-center justify-center w-7 h-7 2xl:w-8 2xl:h-8 rounded-lg bg-secondary text-foreground transition-colors duration-200 hover:bg-foreground hover:text-background"
            >
              <ArrowUpRight className="size-3.5 2xl:size-4" />
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}