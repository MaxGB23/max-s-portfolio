"use client";

import Image from "next/image";
import { useGsapAnimation } from "@/hooks/use-gsap-animation";
import { Section } from "@/components/section";
import { useLanguage } from "@/contexts/language-context";

export function AboutSection() {
  const { t } = useLanguage();

  // GSAP timeline: sequences all elements when scrolled into view.
  const containerRef = useGsapAnimation<HTMLElement>((gsap) => {
    const elements = [
      ".about-portrait",
      ".about-label",
      ".about-title",
      ".about-description",
    ];

    // Set initial hidden state synchronously BEFORE the timeline starts.
    // autoAlpha sets both opacity:0 and visibility:hidden so there's no flash.
    gsap.set(elements, { autoAlpha: 0 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 80%",
      },
      defaults: { ease: "power2.out" },
    });

    tl.to(".about-portrait", {
      autoAlpha: 1,
      x: 0,
      duration: 0.5,
      startAt: { x: -40 },
    })
      .to(
        ".about-label",
        { autoAlpha: 1, y: 0, duration: 0.5, startAt: { y: 12 } },
        "-=0.4"
      )
      .to(
        ".about-title",
        { autoAlpha: 1, y: 0, duration: 0.55, startAt: { y: 24 } },
        "-=0.3"
      )
      .to(
        ".about-description",
        { autoAlpha: 1, y: 0, duration: 0.2, startAt: { y: 10 } },
        "-=0.2"
      );
  });

  return (
    <Section
      id="sobre-mi"
      ref={containerRef}
      aria-label={t("section.about.ariaLabel")}
      className="relative flex flex-col items-center justify-center min-h-[60dvh] portrait:min-h-[50dvh]"
      insetClassName="px-6 md:px-8 lg:px-12"
      innerClassName="relative z-10 flex flex-col-reverse md:flex-row items-center justify-center w-full max-w-5xl gap-8 md:gap-12 lg:gap-14 xl:gap-16"
    >
      {/* Left Column: Portrait */}
      <div className="about-portrait debug-l3 relative rounded-4xl shadow-xl aspect-11/9 w-full max-w-[400px] sm:max-w-[440px] mx-auto md:mx-0 md:max-w-full md:w-auto md:h-[280px] lg:h-[320px] xl:h-[360px] 2xl:h-[380px] shrink-0 z-0" style={{ opacity: 0, visibility: 'hidden' }}>
        <div className="w-full h-full rounded-4xl overflow-hidden relative">
          <Image
            src="/images/about-max.png"
            alt={t("section.about.imageAlt")}
            fill
            className="object-cover object-top 2xl:object-right"
            sizes="(max-width: 768px) 400px, (max-width: 1200px) 464px, 490px"
          />
        </div>
      </div>

      {/* Right Column: Info */}
      <div className="about-info flex flex-col items-center md:items-start text-center md:text-left z-10">
        <p className="about-label uppercase tracking-[0.2em] font-medium text-muted-foreground mb-2 text-fluid-eyebrow" style={{ opacity: 0, visibility: 'hidden' }}>
          {t("section.about.label")}
        </p>

        <h2 className="about-title md:flex md:gap-4 font-serif font-black uppercase text-fluid-section leading-[0.9] tracking-tighter text-foreground mb-6" style={{ opacity: 0, visibility: 'hidden' }}>
          <span>{t("section.about.title.first")}</span>
          <span className="text-purple-accent"> {t("section.about.title.second")}</span>
        </h2>

        <div className="debug-l3 px-4 sm:px-16 md:px-0 about-description text-fluid-body leading-relaxed text-content max-w-[48ch] space-y-4" style={{ opacity: 0, visibility: 'hidden' }}>
          <div className="debug-test">
            <p>{t("section.about.paragraph1")}</p>
            <p>{t("section.about.paragraph2")}</p>
          </div>

        </div>
      </div>
    </Section>
  );
}
