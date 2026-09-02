"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import type { ProjectLink } from "@/data/projects";
import { StackIcon } from "@/components/icons";

export interface Project {
  id: string;
  title: string;
  description: string;
  metric: string;
  image: string;
  imageAlt: string;
  category: string;
  tags?: string[];
  links?: ProjectLink[];
  featured?: boolean;
}

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const externalLink = project.links?.find((link) => link.external);

  return (
    <article
      className={`project-card group relative flex flex-col h-full bg-card border rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-lg hover:shadow-black/8 ${
        project.featured ? "border-purple-accent/40 ring-1 ring-purple-accent/20" : "border-border"
      }`}
      aria-labelledby={`project-title-${project.id}`}
    >
      {/* Image */}
      <div className="relative w-full aspect-16/10 overflow-hidden bg-muted">
        {project.image ? (
          <Image
            src={project.image}
            alt={project.imageAlt}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full w-full bg-gradient-to-br from-purple-accent/10 to-transparent">
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground/70 px-4 text-center">
              {project.category}
            </span>
          </div>
        )}
        {/* Category badge overlaid on image */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-accent text-white shadow-sm">
            {project.category}
          </span>
        </div>
        {/* Featured badge */}
        {project.featured && (
          <div className="absolute top-3 right-3">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-foreground text-background shadow-sm">
              Destacado
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5">
        <h3
          id={`project-title-${project.id}`}
          className="font-serif font-bold text-lg text-foreground mb-2 text-balance group-hover:text-foreground transition-colors"
        >
          {project.title}
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground flex-1 mb-4 line-clamp-3">
          {project.description}
        </p>

        {/* Key metric */}
        {project.metric && (
          <div className="mb-4">
            <span className="inline-flex items-center rounded-full border border-purple-accent/25 bg-purple-accent/10 px-2.5 py-1 text-[11px] font-semibold text-purple-accent">
              {project.metric}
            </span>
          </div>
        )}

        {/* Tech stack tags - Icons with gap */}
        <div className="flex items-center gap-2" aria-label="Technologies used">
          {project.tags?.map((tag, index) => (
            <div
              key={index}
              className="flex items-center justify-center w-8 h-8 rounded-full border border-black bg-card shadow-sm shadow-gray-700 hover:scale-110 transition-all duration-300 cursor-default group"
              title={tag}
            >
              <StackIcon
                name={tag}
                className="w-4 h-4 text-foreground opacity-80 group-hover:opacity-100 transition-opacity"
                labelClassName="text-[9px] font-bold text-foreground/60 uppercase tracking-tighter"
              />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
          <Link
            href={`/proyectos/${project.id}`}
            aria-label={`Ver caso de estudio de ${project.title}`}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            Ver caso de estudio
          </Link>
          {externalLink ? (
            <a
              href={externalLink.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${project.title} — ${externalLink.label}`}
              className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-secondary text-foreground transition-colors duration-200 group-hover:bg-foreground group-hover:text-background"
            >
              <ArrowUpRight size={13} />
            </a>
          ) : (
            <span
              className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-secondary text-foreground transition-colors duration-200 group-hover:bg-foreground group-hover:text-background"
              aria-hidden="true"
            >
              <ChevronRight size={13} />
            </span>
          )}
        </div>
      </div>
    </article>
  );
}