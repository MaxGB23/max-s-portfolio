"use client";

import {
  useLayoutEffect,
  useEffect,
  useState,
  useRef,
  useCallback,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowUpRight, BarChart3, ChevronLeft, ChevronRight, Github, Globe, Maximize2, MonitorSmartphone, Network, X } from "lucide-react";
import { StackIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { takeHomeScroll, useLenis } from "@/hooks/use-lenis";
import type { Project, ProjectImage, ProjectLink, ProjectMetric } from "@/data/projects";
import { ArchitectureEmptyState, ProjectArchitecture } from "@/components/project-architecture";

/** Picks a contextual icon for a project link. Unknown kinds fall back to a
    generic external-arrow, so new kinds render safely without code changes. */
function linkIcon(kind?: string) {
  switch (kind) {
    case "code":
      return Github;
    case "demo":
    case "site":
    case "landing":
      return Globe;
    case "app":
      return MonitorSmartphone;
    default:
      return ArrowUpRight;
  }
}

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
    <h2 className="font-serif font-bold text-fluid-subheading text-foreground mb-5">
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
              className="w-6 h-6 2xl:w-7 2xl:h-7 text-foreground"
              labelClassName="flex items-center justify-center w-6 h-6 2xl:w-7 2xl:h-7 rounded-full bg-muted text-[9px] 2xl:text-[10px] font-bold text-foreground/70 uppercase tracking-tighter"
            />
          </span>
          <span className="text-sm 2xl:text-base text-foreground">{tag}</span>
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

/** Grid de métricas del tab "Métricas & KPIs" (2 columnas). Cada montaje
    re-crea los count-ups scoped a su propio root: la vista solo existe en el
    DOM con el tab activo, así que el efecto único del detail no puede
    animarla — este componente posee su ciclo de vida y revierte al desmontar
    (cada re-entrada al tab vuelve a contar, nunca queda en "0"). */
function KpiGrid({ metrics }: { metrics: ProjectMetric[] }) {
  const rootRef = useRef<HTMLDListElement>(null);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const metricValues = gsap.utils.toArray<HTMLElement>(
        ".detail-metric-value[data-numeric]"
      );
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
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <dl ref={rootRef} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className="rounded-2xl border border-border bg-card p-6 flex flex-col justify-between"
        >
          <dt className="sr-only">{metric.label}</dt>
          <dd className="m-0">
            <div className="font-serif font-black text-fluid-metric text-purple-accent">
              <AnimatedMetric value={metric.value} />
            </div>
            <div className="mt-3 text-fluid-card-desc leading-snug text-muted-foreground">
              {metric.label}
            </div>
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function ProjectDetail({ project }: { project: Project }) {
  const rootRef = useRef<HTMLDivElement>(null);
  
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

      // Count-up for metrics — moved to <KpiGrid />, which owns its own
      // lifecycle: the metrics DOM only exists while the "kpis" tab is active,
      // so the one-time effect below would never find it (stuck at "0").

      // Floating back buttons - visible on load, hide on scroll down, reveal
      // on scroll up (mirrors the navbar behaviour). Uses raw scrollY
      // direction instead of getVelocity(), which is unreliable without
      // Lenis on real Android. The 8 px threshold matches the navbar and
      // filters finger tremor / micro-scrolls that would otherwise flicker.
      const BACK_THRESHOLD = 8;
      const backButtons = gsap.utils.toArray<HTMLElement>(".back-btn");
      if (backButtons.length > 0) {
        let prevY = window.scrollY;
        let hidden = false;
        ScrollTrigger.create({
          start: 0,
          end: "max",
          onUpdate: () => {
            const y = window.scrollY;
            const delta = y - prevY;
            // At top of page: always visible
            if (y <= 0) {
              if (hidden) {
                hidden = false;
                gsap.to(backButtons, { opacity: 1, y: 0, duration: 0.25, ease: "power2.out", overwrite: "auto" });
              }
              prevY = y;
              return;
            }
            if (Math.abs(delta) <= BACK_THRESHOLD) return;
            prevY = y;
            const scrollingDown = delta > 0;
            if (scrollingDown === hidden) return;
            hidden = scrollingDown;
            gsap.to(backButtons, {
              opacity: scrollingDown ? 0 : 1,
              y: scrollingDown ? 24 : 0,
              duration: 0.25,
              ease: "power2.out",
              overwrite: "auto",
            });
          },
        });
      }
    }, rootRef);

    return () => ctx.revert();
  }, []);

  const { title, tags, detail } = project;
  const words = title.trim().split(/\s+/);
  const lastWord = words.pop();
  const mainTitle = words.join(" ");

  // Primary visual image - real screenshot or approved temporary placeholder.
  // Nunca usar un retrato/genérico como si fuera captura del producto (dato falso).
  // `detail.visual` es la portada propia del detail (opcional); sin ella cae a
  // `project.image` (la misma de la card) — comportamiento actual.
  const visualImage = detail.visual?.src ?? project.image;
  const visualAlt = detail.visual?.alt ?? project.imageAlt;

  // Gallery items - real captures when wired, else declared placeholders.
  // El placeholder se resuelve en el render con un fondo temático + texto, no
  // con una imagen genérica que pueda pasar por captura real.
  const gallery = detail.gallery.length > 0 ? detail.gallery : [0, 1, 2].map(() => null);
  const showWideFirst = gallery.length >= 3;

  const handleBack = () => {
    // Came from the portfolio grid (position captured on card click): pop the
    // history and let the layout ScrollRestorer put us back exactly where we
    // left — Lenis can't clobber it because we force it to adopt the target.
    if (takeHomeScroll() != null) {
      router.back();
      return;
    }
    // Direct arrival (shared link / refresh): history.length is unreliable
    // (often > 1 even on an empty tab), so navigate deterministically instead
    // of risking leaving the site.
    router.replace("/");
  };

  const [viewMode, setViewMode] = useState<"topology" | "kpis">("kpis");
  const realImages = gallery.filter((g): g is ProjectImage => g !== null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const nextLightbox = useCallback(() => {
    setLightboxIndex((current) => (current === null ? null : (current + 1) % realImages.length));
  }, [realImages.length]);
  const prevLightbox = useCallback(() => {
    setLightboxIndex((current) =>
      current === null ? null : (current - 1 + realImages.length) % realImages.length
    );
  }, [realImages.length]);

  // Scroll lock + Escape-to-close while the lightbox is open. Without this,
  // mobile keeps scrolling the content behind the overlay and the X tap turns
  // into a page scroll instead of a click. Native browsers get `overflow:
  // hidden` on html/body; Lenis (desktop) gets stopped so it can't write
  // scroll on the next RAF and fight the lock.
  const lenis = useLenis();

  useLayoutEffect(() => {
    if (lightboxIndex === null) return;

    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    lenis?.stop();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
      lenis?.start();
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [lightboxIndex, closeLightbox, lenis]);

  // Touch swipe navigation — zero dependencies, plain pointer events. A ~50px
  // deltaX threshold with the horizontal axis dominant (so vertical drags are
  // ignored) keeps accidential small taps from navigating. `touch-pan-y` on
  // the overlay (below) is what makes this work on mobile: without it the
  // browser claims horizontal gestures and fires pointercancel instead of
  // pointerup, so the swipe never lands.
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const suppressClose = useRef(false);
  const onLightboxPointerDown = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    swipeStart.current = { x: event.clientX, y: event.clientY };
  }, []);
  const onLightboxPointerUp = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const start = swipeStart.current;
      swipeStart.current = null;
      if (!start) return;
      const deltaX = event.clientX - start.x;
      const deltaY = event.clientY - start.y;
      if (Math.abs(deltaX) < 50 || Math.abs(deltaX) <= Math.abs(deltaY)) return;
      // After a drag the browser synthesizes a click on the overlay, which
      // would close the very lightbox we just navigated. Suppress that click;
      // the timeout is a safety net for browsers that skip the click after a
      // drag that ends off-element.
      suppressClose.current = true;
      setTimeout(() => {
        suppressClose.current = false;
      }, 400);
      if (deltaX < 0) nextLightbox();
      else prevLightbox();
    },
    [nextLightbox, prevLightbox]
  );

  // Backdrop tap zone: ONLY the painted image (object-contain inside a
  // letterboxed wrapper) counts as "inside"; taps on the black letterbox are
  // background taps and must close. next/image's `fill` spans the whole
  // wrapper, so hit-test the contain-fit rect computed from the loaded
  // natural aspect instead of trusting element bounds.
  const lightboxImageRef = useRef<HTMLImageElement | null>(null);
  const onLightboxImageClick = useCallback((event: ReactMouseEvent<HTMLDivElement>) => {
    const img = lightboxImageRef.current;
    if (!img || !img.naturalWidth || !img.naturalHeight) return; // not painted → let it close
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = img.naturalWidth / img.naturalHeight;
    let w = rect.width;
    let h = w / ratio;
    if (h > rect.height) {
      h = rect.height;
      w = h * ratio;
    }
    const x = rect.left + (rect.width - w) / 2;
    const y = rect.top + (rect.height - h) / 2;
    const inside =
      event.clientX >= x &&
      event.clientX <= x + w &&
      event.clientY >= y &&
      event.clientY <= y + h;
    if (inside) event.stopPropagation();
  }, []);

  const onLightboxBackdropClick = useCallback(() => {
    if (suppressClose.current) {
      suppressClose.current = false;
      return;
    }
    closeLightbox();
  }, [closeLightbox]);

  return (
    <div ref={rootRef}>
{/* Floating back control (all breakpoints): free-floating in the top-left
          corner. The detail page renders without a navbar (only the scroll
          progress bar), so the corner is always free — no conflict with any
          chrome. On scroll down it fades away (see .back-btn ScrollTrigger). */}
      <div className="fixed inset-x-0 top-4 md:top-6 z-50 pointer-events-none">
        <div className="mx-auto w-full max-w-350 pl-5">
          <Button asChild variant="primary" shape="pill" size="md" className="back-btn pointer-events-auto hover:bg-foreground/80 transition-colors">
            <button
              type="button"
              onClick={handleBack}
              aria-label="Volver a proyectos (conserva la posición de scroll)"
              title="Volver a proyectos"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              Volver
            </button>
          </Button>
        </div>
      </div>

      {/* Hero - typographic, image-led proof lives lower in the primary visual. */}
      <section className="debug-l1 detail-hero px-6 md:px-12 lg:px-20 pt-20 md:pt-24 pb-12">
        <div className="debug-l2 max-w-5xl mx-auto">
          <div className="mb-6">
            <span className="px-3.5 py-1.5 rounded-full text-xs 2xl:text-sm font-semibold tracking-wide bg-purple-accent text-white">
              {project.category}
            </span>
          </div>
          <h1 className="font-serif font-black text-fluid-detail text-foreground leading-[1.02] tracking-tight text-balance">
            {mainTitle && <span>{mainTitle} </span>}
            <span className="text-purple-accent brightness-110">{lastWord}</span>
          </h1>
          <p className="mt-6 text-fluid-body text-content max-w-2xl leading-relaxed">
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
      <div className="debug-l1 px-6 md:px-12 lg:px-20 pb-24">
        <div className="debug-l2 max-w-5xl mx-auto">
          {/* Metrics & Architecture Topology */}
          {detail.metrics.length > 0 && (
            <section className="debug-l3 detail-section mb-16" aria-label="Métricas y Arquitectura">
              {/* Header con Tag, Titular, Subtítulo y Switch de Vistas */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <div>

                  <h2 className="font-serif font-bold text-fluid-subheading text-foreground">
                    Métricas clave
                  </h2>
                  <p className="mt-1 text-fluid-body leading-relaxed text-muted-foreground max-w-xl">
                    Resumen técnico y validación operativa de la arquitectura de la solución desplegada.
                  </p>
                </div>

                {/* Switcher de Vistas — Métricas primero (primaria, default),
                    Grafo a la derecha (secundario pero igual de visible) */}
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-card border border-border shrink-0 self-start md:self-auto">
                  <button
                    type="button"
                    onClick={() => setViewMode("kpis")}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm 2xl:text-base font-sans font-medium transition-all duration-200 ${
                      viewMode === "kpis"
                        ? "bg-foreground text-background shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <BarChart3 size={14} className={viewMode === "kpis" ? "text-background" : "text-muted-foreground"} />
                    Métricas & KPIs
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("topology")}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm 2xl:text-base font-sans font-medium transition-all duration-200 ${
                      viewMode === "topology"
                        ? "bg-foreground text-background shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <Network size={14} className={viewMode === "topology" ? "text-background" : "text-muted-foreground"} />
                    Grafo Arquitectura
                  </button>
                </div>
              </div>

              {/* Vista 1: Grafo de Arquitectura Real (árbol extraído de docs/projects) */}
              {viewMode === "topology" &&
                (project.architecture ? (
                  <ProjectArchitecture tree={project.architecture} />
                ) : (
                  <ArchitectureEmptyState />
                ))}

              {/* Vista 2: Vista de Métricas & KPIs Numéricos (Cards Clásicas con Animación) */}
              {viewMode === "kpis" && <KpiGrid metrics={detail.metrics} />}
            </section>
          )}
        </div>

        {/* Primary Visual - wide proof band, full width */}
        <div className="debug-l2 max-w-5xl mx-auto mb-12">
          <div className="detail-primary-visual w-full">
            <figure className="aspect-video rounded-3xl overflow-hidden border border-border relative">
              <Image
                src={visualImage}
                alt={visualAlt}
                fill
                className="object-cover"
                sizes="(max-width: 1280px) 100vw, 1280px"
                priority
              />
            </figure>
          </div>
        </div>

        {/* Project links - acciones tras la prueba visual */}
        {project.links.length > 0 && (
          <div className="max-w-5xl mx-auto mb-16">
            <div className="flex flex-wrap gap-3 justify-center">
              {project.links.map((link, index) => {
                const Icon = linkIcon(link.kind);
                return (
                  <Button key={index} asChild variant="inverted" size="lg">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Icon size={16} aria-hidden="true" />
                      {link.label}
                    </a>
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        <div className="debug-l2 max-w-3xl mx-auto">
          {/* Summary */}
          <section className="detail-section mb-16">
            <SectionTitle>Resumen</SectionTitle>
            <p className="text-content text-base 2xl:text-lg leading-relaxed">{renderInline(detail.summary)}</p>
          </section>

          {/* Problem */}
          {detail.problem && (
            <section className="detail-section mb-16">
              <SectionTitle>Problema</SectionTitle>
              <p className="text-content text-base 2xl:text-lg leading-relaxed">
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
                  <li key={index} className="flex gap-3 text-content text-base 2xl:text-lg leading-relaxed">
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
                <li key={index} className="flex gap-3 text-content text-base 2xl:text-lg leading-relaxed">
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-accent" aria-hidden="true" />
                  <span>{renderInline(item)}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Gallery Spotlight - hover zoom affordance, click opens lightbox */}
          <section className="detail-section detail-gallery mb-16">
            <SectionTitle>Galería</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(() => {
                // Índice dentro de la lista de imágenes reales (para el lightbox).
                let realCount = 0;
                return gallery.map((image, index) => {
                  // Ajusta items reales con showWideFirst según su posición visual y
                  // la cantidad de imágenes reales del bloque.
                  if (image === null) {
                    const isWide = index === 0 && showWideFirst;
                    return (
                      <figure
                        key={index}
                        className={`detail-gallery-item rounded-2xl border border-dashed border-border bg-gradient-to-br from-purple-accent/5 to-transparent flex items-center justify-center min-h-[180px] ${
                          isWide ? "sm:col-span-2 lg:col-span-3" : ""
                        }`}
                      >
                        <span className="font-mono text-xs 2xl:text-sm uppercase tracking-widest text-muted-foreground text-center px-4">
                          Captura próximamente
                        </span>
                      </figure>
                    );
                  }
                  const isWide = index === 0 && showWideFirst;
                  const realIndex = realCount++;
                  return (
                    <figure
                      key={index}
                      className={`group detail-gallery-item rounded-2xl overflow-hidden border border-border ${
                        isWide ? "sm:col-span-2 lg:col-span-3" : ""
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setLightboxIndex(realIndex)}
                        aria-label={`Ampliar imagen: ${image.alt}`}
                        draggable={false}
                        onDragStart={(e) => e.preventDefault()}
                        className={`relative w-full text-left cursor-zoom-in select-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                          isWide ? "aspect-[16/9]" : "aspect-[4/3]"
                        } bg-muted block`}
                      >
                        <Image
                          src={image.src}
                          alt={image.alt}
                          fill
                          draggable={false}
                          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                        <span className="absolute top-3 right-3 inline-flex items-center justify-center w-9 h-9 rounded-full bg-background/70 backdrop-blur-md text-foreground opacity-70 hover:opacity-100 transition-opacity duration-200">
                          <Maximize2 size={16} aria-hidden="true" />
                        </span>
                      </button>
                    </figure>
                  );
                });
              })()}
            </div>
          </section>

          {/* CTA */}
          <section className="detail-section">
            <div className="rounded-3xl border border-purple-accent/30 bg-purple-accent/5 px-6 py-12 md:p-14 text-center">
              <h2 className="font-serif font-bold text-xl md:text-2xl 2xl:text-3xl text-foreground text-balance mb-6">
                {detail.cta}
              </h2>
              <Button asChild variant="primary">
                <Link href="/#proyectos">
                  <ArrowLeft size={16} aria-hidden="true" />
                  Volver a proyectos
                </Link>
              </Button>
            </div>
          </section>
        </div>
      </div>

      {/* Lightbox - full-screen image viewer with prev/next and close on backdrop */}
      {lightboxIndex !== null && (() => {
        // Guard: solo abrir con una imagen real; nunca con un placeholder null.
        const lightboxImage = realImages[lightboxIndex];
        if (!lightboxImage) return null;
        return (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 sm:p-8 touch-pan-y select-none"
          role="dialog"
          aria-modal="true"
          aria-label="Visor de imagen"
          onClick={onLightboxBackdropClick}
          onPointerDown={onLightboxPointerDown}
          onPointerUp={onLightboxPointerUp}
        >
          <button
            type="button"
            onClick={closeLightbox}
            aria-label="Cerrar visor"
            className="absolute top-4 right-4 inline-flex items-center justify-center w-11 h-11 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors duration-200 touch-manipulation"
          >
            <X size={20} aria-hidden="true" />
          </button>

          {realImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); prevLightbox(); }}
                aria-label="Imagen anterior"
                className="absolute left-4 hidden sm:inline-flex items-center justify-center w-11 h-11 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors duration-200 touch-manipulation"
              >
                <ChevronLeft size={20} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); nextLightbox(); }}
                aria-label="Imagen siguiente"
                className="absolute right-4 hidden sm:inline-flex items-center justify-center w-11 h-11 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors duration-200 touch-manipulation"
              >
                <ChevronRight size={20} aria-hidden="true" />
              </button>

              {/* Position affordance for touch users (prev/next hidden below sm):
                  swipe replaces the arrows, "3 / 9" says where you are. */}
              <span
                className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium tabular-nums text-white/80 select-none"
                aria-live="polite"
                onClick={(e) => e.stopPropagation()}
              >
                {lightboxIndex + 1} / {realImages.length}
              </span>
            </>
          )}

          <figure className="relative max-w-5xl w-full max-h-[85vh]">
            <div
              className="relative w-full h-[80vh] max-h-[85vh]"
              onClick={onLightboxImageClick}
            >
              <Image
                ref={lightboxImageRef}
                src={lightboxImage.src}
                alt={lightboxImage.alt}
                fill
                draggable={false}
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 1024px"
              />
            </div>
            <figcaption className="mt-3 text-center text-sm text-white/70">
              {lightboxImage.alt}
            </figcaption>
          </figure>
        </div>
      );
      })()}
    </div>
  );
}

