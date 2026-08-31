"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { StackIcon } from "@/components/icons";
import type { Project } from "@/data/projects";

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={index} className="font-semibold text-foreground">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={index}>{part}</span>
    )
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="font-serif font-bold text-2xl md:text-3xl text-foreground mb-5">
      {children}
    </h2>
  );
}

function StackChips({ tags }: { tags: string[] }) {
  return (
    <div className="flex flex-wrap gap-3">
      {tags.map((tag, index) => (
        <div
          key={index}
          className="flex items-center gap-2 rounded-full border border-border bg-card pl-2 pr-4 py-2"
          title={tag}
        >
          <span className="flex items-center justify-center shrink-0">
            <StackIcon
              name={tag}
              className="w-6 h-6 text-foreground"
              labelClassName="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-[9px] font-bold text-foreground/70 uppercase tracking-tighter"
            />
          </span>
          <span className="text-sm text-foreground">{tag}</span>
        </div>
      ))}
    </div>
  );
}

function metricParts(value: string) {
  const match = value.match(/^([^0-9]*)([0-9]*\.?[0-9]+)?(.*)$/);
  return {
    prefix: match?.[1] ?? "",
    number: match?.[2] ?? "",
    suffix: match?.[3] ?? "",
  };
}

// Count-up for metrics with a numeric core; static for text-only values.
function AnimatedMetric({ value }: { value: string }) {
  const { prefix, number, suffix } = metricParts(value);
  if (!number) {
    return <>{value}</>;
  }
  const decimals = number.includes(".") ? number.split(".")[1].length : 0;
  return (
    <span
      className="detail-metric-value"
      data-numeric="true"
      data-target={Number(number.replace(/,/g, ""))}
      data-decimals={decimals}
    >
      {prefix}
      <span className="detail-metric-number">0</span>
      {suffix}
    </span>
  );
}

export function ProjectDetail({ project }: { project: Project }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const backBtnRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Hero entrance - kept separate from the per-section reveals below.
      gsap.from(".detail-hero > *", {
        opacity: 0,
        y: 26,
        duration: 0.65,
        ease: "power2.out",
        stagger: 0.1,
      });

      // Per-section scroll reveal for each content section below the hero.
      const sections = gsap.utils.toArray<HTMLElement>(".detail-section");
      sections.forEach((section) => {
        gsap.from(section, {
          opacity: 0,
          y: 26,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 85%",
            once: true,
          },
        });
      });

      // Primary visual - slow parallax on the inner image (moves ~85% of scroll speed).
      const visualWrap = document.querySelector<HTMLElement>(".detail-primary-visual");
      const visualImage = visualWrap?.querySelector<HTMLElement>(".detail-primary-visual img");
      if (visualWrap && visualImage) {
        gsap.to(visualImage, {
          yPercent: -12,
          ease: "none",
          scrollTrigger: {
            trigger: visualWrap,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      }

      // Gallery - vertical curtain wipe clip-path reveal.
      const galleryItems = gsap.utils.toArray<HTMLElement>(".detail-gallery-item");
      if (galleryItems.length > 0) {
        gsap.from(galleryItems, {
          clipPath: "inset(100% 0% 0% 0%)",
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.15,
          scrollTrigger: {
            trigger: ".detail-gallery",
            start: "top 80%",
            once: true,
          },
        });
      }

      // Count-up for metrics with a numeric core.
      const metricValues = gsap.utils.toArray<HTMLElement>(".detail-metric-value[data-numeric]");
      metricValues.forEach((el) => {
        const numberEl = el.querySelector<HTMLElement>(".detail-metric-number");
        if (!numberEl) return;
        const target = Number(el.dataset.target);
        const decimals = Number(el.dataset.decimals ?? 0);
        const proxy = { value: 0 };
        gsap.to(proxy, {
          value: target,
          duration: 1.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el.closest("section"),
            start: "top 85%",
            once: true,
          },
          onUpdate: () => {
            const formatted = proxy.value.toLocaleString("en-US", {
              minimumFractionDigits: decimals,
              maximumFractionDigits: decimals,
            });
            numberEl.textContent = formatted;
          },
        });
      });

      // Floating back button - hide on scroll down, reveal on scroll up.
      if (backBtnRef.current) {
        ScrollTrigger.create({
          start: 0,
          end: "max",
          onUpdate: (self) => {
            if (self.direction === 1) {
              gsap.to(backBtnRef.current, { opacity: 0, y: 24, duration: 0.3 });
            } else {
              gsap.to(backBtnRef.current, { opacity: 1, y: 0, duration: 0.3 });
            }
          },
        });
      }
    }, rootRef);

    return () => ctx.revert();
  }, []);

  const { title, tags, links, detail } = project;
  const words = title.trim().split(/\s+/);
  const lastWord = words.pop();
  const mainTitle = words.join(" ");
  const externalLinks = links.filter((link) => link.external);

  // Primary visual image - real screenshot or approved temporary placeholder.
  const visualImage = project.image || "/images/about-max.png";

  // Gallery items - real captures when wired, else temporary placeholders.
  let gallery = detail.gallery;
  if (gallery.length === 0) {
    // TEMPORARY: replace with real screenshots when available.
    gallery = [0, 1, 2].map(() => ({
      src: "/images/about-max.png",
      alt: "Captura próximamente (diseño provisional)",
    }));
  }
  const showWideFirst = gallery.length >= 3;

  const handleBack = () => {
    window.history.length > 1 ? router.back() : router.push("/#proyectos");
  };

  return (
    <div ref={rootRef}>
      {/* Floating back control - preserves exact scroll position via router.back() */}
      <button
        ref={backBtnRef}
        type="button"
        onClick={handleBack}
        aria-label="Volver a proyectos (conserva la posición de scroll)"
        title="Volver a proyectos"
        className="detail-back-btn fixed bottom-6 left-6 z-50 inline-flex items-center gap-2 h-12 px-5 rounded-full border border-border bg-background/80 backdrop-blur-md shadow-lg text-sm font-semibold text-foreground hover:border-purple-accent/40 hover:text-purple-accent transition-colors duration-200"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Volver
      </button>

      {/* Hero - typographic, image-led proof lives lower in the primary visual. */}
      <section className="detail-hero px-6 md:px-12 lg:px-20 pt-14 md:pt-20 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide bg-purple-accent text-white">
              {project.category}
            </span>
          </div>
          <h1 className="font-serif font-black text-4xl md:text-6xl xl:text-7xl text-foreground leading-[1.02] tracking-tight text-balance">
            {mainTitle && <span>{mainTitle} </span>}
            <span className="text-purple-accent brightness-110">{lastWord}</span>
          </h1>
          <p className="mt-6 text-base md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
            {detail.headline}
          </p>
          {tags.length > 0 && (
            <div className="mt-8">
              <StackChips tags={tags} />
            </div>
          )}
        </div>
      </section>

      {/* Content */}
      <div className="px-6 md:px-12 lg:px-20 pb-24">
        <div className="max-w-3xl mx-auto">
          {/* Metrics */}
          <section className="detail-section mb-16" aria-label="Métricas clave">
            <SectionTitle>Métricas clave</SectionTitle>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {detail.metrics.map((metric, index) => (
                <div key={index} className="rounded-2xl border border-border bg-card p-5">
                  <dt className="sr-only">{metric.label}</dt>
                  <dd className="m-0">
                    <div className="font-serif font-black text-2xl md:text-3xl text-purple-accent">
                      <AnimatedMetric value={metric.value} />
                    </div>
                    <div className="mt-2 text-xs sm:text-sm text-muted-foreground leading-snug">
                      {metric.label}
                    </div>
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        {/* Primary Visual - wide proof band, full width */}
        <div className="max-w-7xl mx-auto mb-16">
          <div className="detail-primary-visual w-full">
            <figure className="aspect-[16/9] rounded-3xl overflow-hidden border border-border relative">
              <Image
                src={visualImage}
                alt={project.imageAlt}
                fill
                className="object-cover scale-[1.15]"
                sizes="(max-width: 1280px) 100vw, 1280px"
                priority
              />
            </figure>
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          {/* Summary */}
          <section className="detail-section mb-16">
            <SectionTitle>Resumen</SectionTitle>
            <p className="text-muted-foreground leading-relaxed">{renderInline(detail.summary)}</p>
          </section>

          {/* Problem */}
          {detail.problem && (
            <section className="detail-section mb-16">
              <SectionTitle>Problema</SectionTitle>
              <p className="text-muted-foreground leading-relaxed">
                {renderInline(detail.problem)}
              </p>
            </section>
          )}

          {/* Role */}
          {detail.role && detail.role.length > 0 && (
            <section className="detail-section mb-16">
              <SectionTitle>Mi rol</SectionTitle>
              <ul className="space-y-3">
                {detail.role.map((item, index) => (
                  <li key={index} className="flex gap-3 text-muted-foreground leading-relaxed">
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-accent" aria-hidden="true" />
                    <span>{renderInline(item)}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Solution */}
          <section className="detail-section mb-16">
            <SectionTitle>Solución</SectionTitle>
            <ul className="space-y-3">
              {detail.solution.map((item, index) => (
                <li key={index} className="flex gap-3 text-muted-foreground leading-relaxed">
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-accent" aria-hidden="true" />
                  <span>{renderInline(item)}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Gallery Spotlight */}
          <section className="detail-section detail-gallery mb-16">
            <SectionTitle>Galería</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {gallery.map((image, index) => (
                <figure
                  key={index}
                  className={`detail-gallery-item rounded-2xl overflow-hidden border border-border ${
                    index === 0 && showWideFirst ? "sm:col-span-2 lg:col-span-3" : ""
                  }`}
                >
                  <div
                    className={`relative w-full ${
                      index === 0 && showWideFirst ? "aspect-[16/9]" : "aspect-[4/3]"
                    } bg-muted`}
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                </figure>
              ))}
            </div>
          </section>

          {/* External links */}
          {externalLinks.length > 0 && (
            <section className="detail-section mb-16">
              <SectionTitle>Enlaces</SectionTitle>
              <div className="flex flex-wrap gap-3">
                {externalLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card text-sm font-semibold text-foreground hover:border-purple-accent/40 hover:text-purple-accent transition-colors duration-200"
                  >
                    {link.label}
                    <ArrowUpRight size={14} aria-hidden="true" />
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* CTA */}
          <section className="detail-section">
            <div className="rounded-3xl border border-purple-accent/30 bg-purple-accent/5 px-6 py-12 md:p-14 text-center">
              <h2 className="font-serif font-bold text-xl md:text-2xl text-foreground text-balance mb-6">
                {detail.cta}
              </h2>
              <Link
                href="/#proyectos"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-foreground text-background text-sm font-semibold hover:opacity-80 transition-opacity duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Volver a proyectos
                <ArrowLeft size={16} aria-hidden="true" />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
