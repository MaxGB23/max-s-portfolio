"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { StackIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { saveHomeScroll } from "@/hooks/use-lenis";
import { FEATURED_GAP, FEATURED_GAP_LG } from "@/lib/rhythm";
import { useLanguage } from "@/contexts/language-context";

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
  bgColor: string;
}

interface FeaturedProjectPanelProps {
  project: FeaturedProject;
  children?: React.ReactNode;
  /** Last panel: top-only padding — the page-level SECTION_GAP owns the exit. */
  isLast?: boolean;
}

export function FeaturedProjectPanel({ project, children, isLast = false }: FeaturedProjectPanelProps) {
  const { t } = useLanguage();

  // Extract last word for the purple accent styling
  const words = project.title.trim().split(/\s+/);
  const lastWord = words.pop();
  const mainTitle = words.join(" ");

  return (
    <article
      className="debug-l1 featured-panel relative w-full px-6 md:px-8 lg:px-12"
      data-panel-id={project.id}
      style={{ backgroundColor: project.bgColor }}
      aria-labelledby={`featured-title-${project.id}`}
    >
      <div
        className={`debug-l2 panel-content w-full max-w-7xl mx-auto flex flex-col ${FEATURED_GAP} ${FEATURED_GAP_LG} ${
          isLast ? "" : "pb-12 lg:pb-20"
        }`}
      >
        <div className="flex flex-col justify-center">
          {children && (
            <div className="w-full mb-12 md:mb-16">
              {children}
            </div>
          )}

          <div className="debug-l3 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-0 justify-center items-start">
            {/* Left - Text */}
            <div className="debug-l4 flex flex-col order-2 lg:order-1">
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

              {/* Title — h3: hijo lógico del h2 de la sección (#proyectos).
                  Las otras tres rejillas ya usan h2 de sección + h3 de tarjeta;
                  aquí el título del panel era hermano del h2 de sección. Todo el
                  estilo viene de clases explícitas y ningún selector CSS depende
                  de la etiqueta, así que el render no cambia. */}
              <h3
                id={`featured-title-${project.id}`}
                className="font-serif font-black text-fluid-featured text-foreground leading-[1.05] tracking-tight text-balance mb-6 lg:[@media(max-height:800px)]:text-4xl"
              >
                {mainTitle && <span>{mainTitle} </span>}
                <span className="text-purple-accent brightness-125">{lastWord}</span>
              </h3>

              {/* Description */}
              <p className="debug-l5 text-fluid-body leading-relaxed text-content mb-6 mr-6 sm:mr-0 max-w-[50ch]">
                {project.description}
              </p>

              {/* Key metric */}
              <div className="inline-flex self-start items-center gap-2 rounded-full border border-purple-accent/30 bg-purple-accent/10 px-4 py-2 mb-8">
                <span className="text-xs sm:text-sm font-semibold text-purple-accent">
                  {project.metric}
                </span>
              </div>

              {/* Tech stack tags */}
              <div className="flex items-center gap-1.5 mb-10" aria-label={t("common.technologiesUsed")}>
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
                    aria-label={t("common.caseStudyOfTitle").replace("{title}", project.title)}
                  >
                    {t("common.caseStudy")}
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
      </div>
    </article>
  );
}