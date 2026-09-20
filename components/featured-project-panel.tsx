"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { FadeIn } from "@/components/motion-primitives";
import { StackIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { saveHomeScroll } from "@/hooks/use-lenis";
import { FEATURED_GAP, FEATURED_GAP_LG } from "@/lib/rhythm";

export interface FeaturedProject {
  id: string;
  index: number;
  title: string;
  description: string;
  metric: string;
  tags: string[];
  image: string;
  imageAlt: string;
  category: string;
  bgColor: string; // subtle panel bg for differentiation
}

interface FeaturedProjectPanelProps {
  project: FeaturedProject;
  children?: React.ReactNode;
  /**
   * Optional heading rendered as an in-flow block at the top of the panel
   * (desktop lg+ with min-height 768px only; hidden below). Because it
   * participates in the document flow, it can never overlap the centered card
   * content — the heading sits at the top and the card content centers in the
   * remaining space (flex-1). It scrolls/scales away together with the panel
   * as the stack advances.
   */
  overlay?: React.ReactNode;
}

export function FeaturedProjectPanel({ project, children, overlay }: FeaturedProjectPanelProps) {
  // Extract last word for the purple accent styling
  const words = project.title.trim().split(/\s+/);
  const lastWord = words.pop();
  const mainTitle = words.join(" ");


  const ContentWrapper = project.index === 1 ? FadeIn : "div";

  /**
   * .featured-panel - target for GSAP ScrollTrigger pinning.
   * data-panel-id - unique identifier per panel for GSAP selectors.
   * min-h-screen + centering keeps every stacking panel full-viewport.
   */
  return (
    <article
      className="debug-l4 featured-panel relative flex items-center portrait:lg:mb-24 w-full px-6 md:px-8 lg:px-12"
      data-panel-id={project.id}
      style={{ backgroundColor: project.bgColor }}
      aria-labelledby={`featured-title-${project.id}`}
    >
      <ContentWrapper
        className={`debug-l1 panel-content w-full max-w-7xl mx-auto landscape:lg:h-full flex flex-col justify-center ${FEATURED_GAP} ${FEATURED_GAP_LG} pt-12 md:pt-14 lg:pt-0 `}
      >

        {/* Section heading (desktop lg+ with min-height 768px): in-flow block at
            the top of this panel. It can never overlap the centered card content:
            it sits above the flex-1 area that centers the card. Being part of
            panel 1 it stacks/scales away with the card as GSAP advances. On
            mobile (<lg) it is hidden; the standalone heading handles it there.
            NOTE: no overflow-y-auto here on purpose — it turns the panel into a
            scroll container and forces overflow-x: auto, which produced a
            phantom horizontal scrollbar during the pin. Content taller than the
            viewport is clipped by the section's overflow:hidden instead. */}
        {overlay && (
          <div className="hidden lg:flex flex-col debug-l2 items-center text-center shrink-0 mb-8 portrait:lg:mb-8">
            {overlay}
          </div>
        )}

        <div className="flex flex-col justify-center">
          {/* Es útil si en el futuro se desea que ciertos paneles tengan contenido dinámico o único arriba de la tarjeta sin modificar el componente interno. Por ejemplo:
              Banners publicitarios o promocionales (ej. "¡Nuevo lanzamiento!").
              Filtros o pestañas secundarias en un proyecto específico.
              Alertas / Avisos especiales. */}
          {children && (
            <div className="w-full mb-12 md:mb-16">
              {children}
            </div>
          )}

          <div className="debug-l2 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-0 justify-center items-center">
          {/* Left - Text */}
          <div className="debug-l3 flex flex-col order-2 lg:order-1">

            {/* Index + Category */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm 2xl:text-lg font-mono text-muted-foreground tabular-nums font-bold">
                {String(project.index).padStart(2, "0")}
              </span>
              <span
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide bg-purple-accent text-white"
              >
                {project.category}
              </span>
            </div>

            {/* Title */}
            <h2
              id={`featured-title-${project.id}`}
              className="font-serif font-black text-fluid-featured text-foreground leading-[1.05] tracking-tight text-balance mb-6 lg:[@media(max-height:800px)]:text-4xl"
            >
              {mainTitle && <span>{mainTitle} </span>}
              <span className="text-purple-accent brightness-125">{lastWord}</span>
            </h2>

            {/* Description */}
            <p className="debug-l4 text-fluid-body leading-relaxed text-content mb-6 mr-6 sm:mr-0 max-w-[50ch]">
              {project.description}
            </p>

            {/* Key metric */}
            <div className="inline-flex self-start items-center gap-2 rounded-full border border-purple-accent/30 bg-purple-accent/10 px-4 py-2 mb-8">
              <span className="text-xs sm:text-sm font-semibold text-purple-accent">
                {project.metric}
              </span>
            </div>

            {/* Tech stack tags */}
            <div className="flex items-center gap-1.5 mb-10" aria-label="Technologies used">
              {project.tags.map((tag, index) => (
                <div
                  key={index}
                  className="flex items-center justify-center w-10 h-10 2xl:w-12 2xl:h-12 rounded-full shadow-sm bg-card hover:scale-110 transition-transform duration-200 cursor-default group"
                  title={tag}
                >
                  <StackIcon
                    name={tag}
                    className="w-5 h-5 2xl:w-6 2xl:h-6 text-foreground opacity-90 group-hover:opacity-100 mix-blend-plus-lighter"
                    labelClassName="text-[10px] 2xl:text-xs font-bold text-foreground/70 uppercase tracking-tighter"
                  />
                </div>
              ))}
            </div>

            {/* CTA */}
            <div>
              <Button asChild variant="primary">
                <Link
                  href={`/proyectos/${project.id}`}
                  onClick={() => saveHomeScroll(window.scrollY)}
                  aria-label={`Ver caso de estudio de ${project.title}`}
                >
                  Ver caso de estudio
                  <ChevronRight size={16} aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Right - Image mockup */}
          <div className="relative order-1 lg:order-2">
            <div className="relative w-full aspect-4/3 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/5">
              {project.image ? (
                <Image
                  src={project.image}
                  alt={project.imageAlt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority={project.index === 1}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-accent/10 to-transparent">
                  <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground px-4 text-center">
                    {project.category}
                  </span>
                </div>
              )}
            </div>
            {/* Subtle floating index badge */}
            <div
              className="absolute -bottom-4 -right-4 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black font-serif shadow-lg border border-border bg-background text-foreground"
              aria-hidden="true"
            >
              {project.index}
            </div>
          </div>

        </div>
        </div>
      </ContentWrapper>
    </article>
  );
}