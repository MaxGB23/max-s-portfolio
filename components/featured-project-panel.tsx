"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import {
  ReactIcon,
  TypeScriptIcon,
  NextJsIcon,
  PostgresIcon,
  TailwindIcon
} from "@/components/icons";

const iconMap: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
  "React": ReactIcon,
  "TypeScript": TypeScriptIcon,
  "Next.js": NextJsIcon,
  "PostgreSQL": PostgresIcon,
  "Tailwind CSS": TailwindIcon,
};

export interface FeaturedProject {
  id: string;
  index: number;
  title: string;
  description: string;
  tags: string[];
  image: string;
  imageAlt: string;
  category: string;
  bgColor: string; // subtle panel bg for differentiation
}

interface FeaturedProjectPanelProps {
  project: FeaturedProject;
}

export function FeaturedProjectPanel({ project }: FeaturedProjectPanelProps) {
  return (
    /**
     * .featured-panel - target for GSAP ScrollTrigger pinning.
     * data-panel-id - unique identifier per panel for GSAP selectors.
     * min-h-screen keeps each panel full-viewport.
     */
    <article
      className="featured-panel relative flex items-center min-h-screen w-full px-6 md:px-12 lg:px-20"
      data-panel-id={project.id}
      style={{ backgroundColor: project.bgColor }}
      aria-labelledby={`featured-title-${project.id}`}
    >
      <div className="panel-content w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center py-24 md:py-28">

        {/* Left - Text */}
        <div className="flex flex-col justify-center order-2 lg:order-1">

          {/* Index + Category */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-xs font-mono text-muted-foreground tabular-nums">
              {String(project.index).padStart(2, "0")}
            </span>
            <span
              className="px-3 py-1 rounded-full text-xs font-semibold tracking-wide"
              style={{
                backgroundColor: "var(--accent-purple-light)",
                color: "var(--accent-purple)",
              }}
            >
              {project.category}
            </span>
          </div>

          {/* Title */}
          <h2
            id={`featured-title-${project.id}`}
            className="font-serif font-black text-4xl md:text-5xl xl:text-6xl text-foreground leading-[1.05] tracking-tight text-balance mb-6"
          >
            {project.title}
          </h2>

          {/* Description */}
          <p className="text-base md:text-lg leading-relaxed text-muted-foreground mb-8 max-w-md">
            {project.description}
          </p>

          {/* Tech stack tags */}
          <div className="flex items-center gap-1.5 mb-10" aria-label="Technologies used">
            {project.tags.map((tag, index) => {
              const Icon = iconMap[tag];
              return (
                <div
                  key={index}
                  className="flex items-center bg-gray-900 justify-center w-10 h-10 rounded-full shadow-sm bg-card hover:scale-110 transition-transform duration-200 cursor-default group"
                  title={tag} // tooltip on hover
                >
                  {Icon ? (
                    <Icon className="w-5 h-5 text-foreground opacity-90 group-hover:opacity-100 mix-blend-plus-lighter" />
                  ) : (
                    <span className="text-[10px] font-bold text-foreground/70 uppercase tracking-tighter">
                      {tag.substring(0, 2)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <div>
            <a
              href="#"
              aria-label={`Ver caso de estudio de ${project.title}`}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-foreground text-background text-sm font-semibold hover:opacity-80 transition-opacity duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Visitar proyecto              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </div>
        </div>

        {/* Right - Image mockup */}
        <div className="relative order-1 lg:order-2">
          <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/5">
            <Image
              src={project.image}
              alt={project.imageAlt}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority={project.index === 1}
            />
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

      {/* Bottom separator line */}
      <div className="absolute bottom-0 left-6 right-6 md:left-12 md:right-12 h-px bg-border" aria-hidden="true" />
    </article>
  );
}
