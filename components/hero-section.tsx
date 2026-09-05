"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDown, Download } from "lucide-react";
import { motion } from "framer-motion";
import { useGsapAnimation } from "@/hooks/use-gsap-animation";
import Aurora from "@/components/animations/Aurora";
import { useState, useEffect } from "react";
import { StackIcon } from "@/components/icons";

const HERO_DATA = {
  role: "Full Stack Developer",
  title: {
    first: "Max González",
    last: "Ballesteros",
  },
  description: "Desarrollo aplicaciones web rápidas y escalables con Next.js y React, cuidando el rendimiento, la experiencia de usuario y calidad del código."
};

export function HeroSection() {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Initialize from the DOM (matches the DarkModeToggle's method)
    const html = document.documentElement;
    setIsDark(html.classList.contains("dark"));
    setMounted(true);

    // Watch for .dark class changes on <html>
    const observer = new MutationObserver(() => {
      setIsDark(html.classList.contains("dark"));
    });
    observer.observe(html, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);

  // GSAP timeline: sequences all hero elements on load.
  const containerRef = useGsapAnimation<HTMLElement>((gsap) => {
    const elements = [
      ".hero-portrait",
      ".hero-badge",
      ".hero-label",
      ".hero-title",
      ".hero-description",
      ".hero-chips",
      ".hero-cta",
      ".hero-scroll",
    ];

    // Set initial hidden state synchronously BEFORE the timeline starts.
    // autoAlpha sets both opacity:0 and visibility:hidden so there's no flash.
    gsap.set(elements, { autoAlpha: 0 });

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.to(".hero-portrait", {
      autoAlpha: 1,
      x: 0,
      duration: 0.5,
      startAt: { x: 40 },
    })
      .to(
        ".hero-badge",
        { autoAlpha: 1, scale: 1, duration: 0.4, ease: "back.out(1.4)", startAt: { scale: 0.6 } },
        "-=0.4"
      )
      .to(
        ".hero-label",
        { autoAlpha: 1, y: 0, duration: 0.5, startAt: { y: 12 } },
        "-=0.4"
      )
      .to(
        ".hero-title",
        { autoAlpha: 1, x: 0, duration: 0.4, startAt: { x: -20 } },
        "-=0.3"
      )
      .to(
        ".hero-description",
        { autoAlpha: 1, y: 0, duration: 0.2, startAt: { y: 10 } },
        "-=0.2"
      )
      .to(
        ".hero-chips",
        { autoAlpha: 1, y: 0, duration: 0.1, startAt: { y: 10 } },
        "-=0.2"
      )
      .to(
        ".hero-cta",
        { autoAlpha: 1, y: 0, duration: 0.3, startAt: { y: 10 } },
        "-=0.2"
      )
      .to(
        ".hero-scroll",
        { autoAlpha: 1, duration: 0.4 },
        "-=0.1"
      );
  });

  return (
    <section
      id="inicio"
      ref={containerRef}
      aria-label="Introducción"
      className="debug-l1 relative min-h-[85vh] flex flex-col items-center justify-center pt-[88px] sm:pt-24 2xl:pt-40 px-6 md:px-8 lg:px-12"
    >
      {/* Background Aurora */}
      <div
        className="absolute inset-0 z-0 pointer-events-none border"
        style={{
          maskImage: "linear-gradient(to bottom, black 60%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 60%, transparent 100%)"
        }}
      >
        {mounted && isDark && (
          <Aurora
            colorStops={["#223068", "#000000", "#3b337a"]}
            blend={0.5}
            amplitude={1.0}
            speed={1.0}
          />
        )}
      </div>
      {/* Main hero layout */}
      <div className="debug-l2 relative z-10 flex flex-col items-center w-full gap-10 2xl:gap-14">
        <div className="debug-l3 relative flex flex-col md:flex-row items-center justify-center w-full max-w-7xl mx-auto gap-8 md:gap-12 lg:gap-20">

          {/* Left Column: Info */}
          <div className="hero-info flex flex-col items-center md:items-start text-center md:text-left z-10 max-w-2xl">

            <p className="hero-label text-muted-foreground brightness-125 uppercase tracking-[0.2em] 2xl:tracking-widest font-medium mb-4 text-fluid-eyebrow" style={{ opacity: 0, visibility: 'hidden' }}>
              {HERO_DATA.role}
            </p>
            <h1 className="hero-title font-serif grid grid-cols-1 gap-3 font-black uppercase text-fluid-display leading-[0.9] tracking-tighter text-foreground mb-6" style={{ opacity: 0, visibility: 'hidden' }}>
              <span>{HERO_DATA.title.first}</span>
              <span className="text-purple-accent  sm:tracking-[0.01em]">{HERO_DATA.title.last}</span>
            </h1>

            <p className="hero-description debug-l4 px-4 sm:px-16 md:px-0 max-w-lg text-fluid-body leading-relaxed brightness-125 text-muted-foreground md:max-w-[440px] 2xl:max-w-[625px] lg:max-w-[480px]" style={{ opacity: 0, visibility: 'hidden' }}>
              {HERO_DATA.description}
            </p>


            {/* CTA buttons */}
            {/* <div className="hero-cta mt-6 flex flex-wrap items-center justify-center gap-4" style={{ opacity: 0, visibility: 'hidden' }}>
              <Link
                href="#productos"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-foreground text-background text-sm font-semibold hover:opacity-80 transition-opacity duration-200 shadow-md"
              >
                Ver Proyectos
                <ArrowDown size={15} aria-hidden="true" />
              </Link>
              <a
href="/documents/Maximiliano_Gonzalez_AI_Engineer_Resume.pdf"
                download
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border text-foreground text-sm font-semibold hover:bg-secondary transition-colors duration-200"
              >
                Descargar CV
                <Download size={15} aria-hidden="true" />
              </a>
            </div> */}

            {/* Tech Stack Ticker */}
            {/* <div className="hero-chips flex items-center gap-3 w-full mt-8" style={{ opacity: 0, visibility: 'hidden' }}>

              <div className="flex gap-6 justify-start">
                <StackIcon name="Next.js" className="h-6 w-auto opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-200" />
                <StackIcon name="React" className="h-6 w-auto opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-200" />
                <StackIcon name="TypeScript" className="h-6 w-auto opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-200" />
                <StackIcon name="PostgreSQL" className="h-6 w-auto opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-200" />
              </div>
            </div> */}

          </div>

          {/* Right Column: Portrait */}
          <div
            className="hero-portrait relative rounded-4xl shrink-0 shadow-xl w-[240px] sm:w-[300px] md:w-[260px] lg:w-[300px] 2xl:w-[400px] aspect-8/9 z-0 mt-4 md:mt-0"
            style={{ opacity: 0, visibility: 'hidden' }}
          >
            <div className="w-full h-full rounded-4xl overflow-hidden relative">
              <Image
                src="/images/max-gb-pfp.png"
                alt="Maximiliano González Ballesteros Full Stack Developer Profile Picture"
                fill
                priority
                className="object-cover object-top"
                sizes="(max-width: 768px) 240px, (max-width: 1200px) 30vw, 380px"
              />
            </div>

            {/* Waving Hand Badge */}
            <motion.div
              className="hero-badge absolute -bottom-6 -right-6 md:-bottom-10 md:-right-10 w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center shadow-2xl z-20 cursor-pointer"
              style={{ backgroundColor: "#5865F2", border: "12px solid var(--background)", opacity: 0, visibility: 'hidden' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
              aria-hidden="true"
            >
              <motion.span
                className="text-4xl md:text-5xl text-white origin-bottom-right"
                role="img"
                aria-label="wave"
                animate={{ rotate: [0, 20, -10, 20, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2, repeatDelay: 1, ease: "easeInOut" }}
              >
                🖐
              </motion.span>
            </motion.div>
          </div>
        </div>

        {/* Skill chips */}
        {/* <div className="hero-chips mt-8 flex flex-wrap items-center justify-center gap-2" style={{ opacity: 0, visibility: 'hidden' }}>
          <span className="px-4 py-1.5 rounded-full border border-border text-xs font-medium text-muted-foreground tracking-wide">
            Frontend Developer
          </span>
          <span
            className="px-4 py-1.5 rounded-full text-xs font-medium tracking-wide text-white bg-purple-accent"
          >
            Full Stack Developer
          </span>
        </div> */}


        {/* CTA buttons */}
        <div className="hero-cta flex flex-wrap items-center justify-center gap-4" style={{ opacity: 0, visibility: 'hidden' }}>
          <Link
            href="#productos"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-foreground text-background text-sm 2xl:text-base font-semibold hover:opacity-80 transition-opacity duration-200 shadow-md"
          >
            Ver Proyectos
            <ArrowDown size={15} aria-hidden="true" />
          </Link>
          <a
            href="/documents/Maximiliano_Gonzalez_AI_Engineer_Resume.pdf"
            download
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border text-foreground text-sm 2xl:text-base font-semibold hover:bg-secondary transition-colors duration-200"
          >
            Descargar CV
            <Download size={15} aria-hidden="true" />
          </a>
        </div>


        {/* Tech Stack Ticker */}
        <div className="hero-chips flex flex-col justify-center items-center gap-3 w-full " style={{ opacity: 0, visibility: 'hidden' }}>
          <p className="text-xs uppercase tracking-widest text-muted-foreground/60 font-semibold 2xl:text-base">
            Stack Principal
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <StackIcon name="Next.js" className="size-6 2xl:size-7 w-auto opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-200" />
            <StackIcon name="React" className="size-6 2xl:size-7 w-auto opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-200" />
            <StackIcon name="TypeScript" className="size-6 2xl:size-7 w-auto opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-200" />
            <StackIcon name="PostgreSQL" className="size-6 2xl:size-7 w-auto opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-200" />
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="hero-scroll flex flex-col items-center gap-2 text-muted-foreground" style={{ opacity: 0, visibility: 'hidden' }}>
          <span className="text-xs 2xl:text-base tracking-widest uppercase">Deslizar</span>
          <motion.div
            className="w-px h-8 bg-border"
            animate={{ scaleY: [1, 0.4, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            style={{ originY: 0 }}
            aria-hidden="true"
          />
        </div>

      </div>
    </section >
  );
}
