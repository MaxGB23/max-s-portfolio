"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { FadeIn } from "@/components/motion-primitives";
import { StackIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";

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
   * Optional heading rendered as an absolute overlay pinned to the top of the
   * panel. Because it does NOT participate in the document flow, the panel's
   * own content stays perfectly centered — the heading floats above it (ideal
   * for the section title on the first stacking panel) and scrolls/scales away
   * together with the panel as the stack advances.
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
      className="featured-panel relative flex items-center min-h-screen w-full px-6 md:px-12 lg:px-20"
      data-panel-id={project.id}
      style={{ backgroundColor: project.bgColor }}
      aria-labelledby={`featured-title-${project.id}`}
    >
      {/* Section heading overlay (desktop lg+ only): absolute over the top of the
          first card, does not shift the centered content. Being part of this panel,
          it stacks/scales away together with card 1 as GSAP advances — it does not
          linger over the following cards. On mobile (<lg) it is hidden so it never
          overlaps the image; the standalone heading above the stack handles it. */}
      {overlay && (
        <div className="hidden lg:flex absolute top-0 left-0 right-0 z-20 pointer-events-none justify-center">
          {overlay}
        </div>
      )}

      <ContentWrapper className="panel-content w-full max-w-7xl mx-auto flex flex-col justify-center py-24 md:py-28">

        {children && (
          <div className="w-full mb-12 md:mb-16">
            {children}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-0 justify-center items-center">
          {/* Left - Text */}
          <div className="flex flex-col order-2 lg:order-1">

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
              className="font-serif font-black text-fluid-featured text-foreground leading-[1.05] tracking-tight text-balance mb-6"
            >
              {mainTitle && <span>{mainTitle} </span>}
              <span className="text-purple-accent brightness-125">{lastWord}</span>
            </h2>

            {/* Description */}
            <p className="text-fluid-body leading-relaxed text-muted-foreground mb-6 mr-6 sm:mr-0 lg:max-w-xl 2xl:max-w-[600px]">
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
                  className="flex items-center justify-center w-10 h-10 rounded-full shadow-sm bg-card hover:scale-110 transition-transform duration-200 cursor-default group"
                  title={tag}
                >
                  <StackIcon
                    name={tag}
                    className="w-5 h-5 text-foreground opacity-90 group-hover:opacity-100 mix-blend-plus-lighter"
                    labelClassName="text-[10px] font-bold text-foreground/70 uppercase tracking-tighter"
                  />
                </div>
              ))}
            </div>

            {/* CTA */}
            <div>
              <Button asChild variant="primary">
                <Link
                  href={`/proyectos/${project.id}`}
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
                  <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground/70 px-4 text-center">
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
      </ContentWrapper>

      {/* Bottom separator line */}
      <div className="absolute bottom-0 left-6 right-6 md:left-12 md:right-12 h-px bg-border" aria-hidden="true" />
    </article>
  );
}