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

export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  category: string;
  tags?: string[];
  href?: string;
}

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article
      className="project-card group relative flex flex-col bg-card border border-border rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-lg hover:shadow-black/8"
      aria-labelledby={`project-title-${project.id}`}
    >
      {/* Image */}
      <div className="relative w-full aspect-[16/10] overflow-hidden bg-muted">
        <Image
          src={project.image}
          alt={project.imageAlt}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* Category badge overlaid on image */}
        <div className="absolute top-3 left-3">
          <span
            className="px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm bg-[oklch(0.58_0.22_270/0.12)] border border-[oklch(0.58_0.22_270/0.25)] text-purple-accent"
          >
            {project.category}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5">
        <h3
          id={`project-title-${project.id}`}
          className="font-serif font-bold text-lg text-foreground mb-2 text-balance group-hover:text-foreground transition-colors"
        >
          {project.title}
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground flex-1 mb-4">
          {project.description}
        </p>

        {/* Tech stack tags - Icons with gap */}
        <div className="flex items-center gap-2" aria-label="Technologies used">
          {project.tags?.map((tag, index) => {
            const Icon = iconMap[tag];
            return (
              <div
                key={index}
                className="flex items-center justify-center w-8 h-8 rounded-full border border-black bg-card shadow-sm shadow-gray-700 hover:scale-110 transition-all duration-300 cursor-default group"
                title={tag}
              >
                {Icon ? (
                  <Icon className="w-4 h-4 text-foreground opacity-80 group-hover:opacity-100 transition-opacity" />
                ) : (
                  <span className="text-[9px] font-bold text-foreground/60 uppercase tracking-tighter">
                    {tag.substring(0, 2)}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer link */}
        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
          <a
            href={project.href ?? "#"}
            aria-label={`View ${project.title}`}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            View Project
          </a>
          <span
            className="inline-flex items-center justify-center w-7 h-7 rounded-lg transition-colors duration-200 group-hover:bg-foreground group-hover:text-background"
            style={{ backgroundColor: "var(--secondary)" }}
            aria-hidden="true"
          >
            <ArrowUpRight size={13} />
          </span>
        </div>
      </div>
    </article>
  );
}
