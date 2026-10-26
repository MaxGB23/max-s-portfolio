"use client";

import Image from "next/image";
import { useGsapAnimation } from "@/hooks/use-gsap-animation";
import { Section } from "@/components/section";
import { useLanguage } from "@/contexts/language-context";

export function AboutSection() {
  const { t } = useLanguage();

  // GSAP timeline: sequences all elements when scrolled into view.
  const containerRef = useGsapAnimation<HTMLElement>((gsap) => {
    // One set of tween vars per element, and TWO sequences: the desktop row
    // puts the portrait on the left (it enters first, read left to right) while
    // the mobile column is `flex-col-reverse`, so the portrait sits BELOW the
    // text and the reading order is text first, portrait last. The cascade
    // follows the visual order: same rule as EARLY_MOBILE_ORDER_DELAY in
    // components/reveal.tsx (a block below never wins the race against what is
    // above it). Mobile uses an even 0.12s cadence that lands at the same
    // 0.86s total as the desktop chain, so neither layout feels slower.
    const steps = {
      portrait: { autoAlpha: 1, x: 0, duration: 0.5, startAt: { x: -40 } },
      label: { autoAlpha: 1, y: 0, duration: 0.5, startAt: { y: 12 } },
      title: { autoAlpha: 1, y: 0, duration: 0.55, startAt: { y: 24 } },
      description: { autoAlpha: 1, y: 0, duration: 0.2, startAt: { y: 10 } },
    };
    type Step = keyof typeof steps;
    type Sequence = [Step, number | string][];

    // Desktop keeps the relative offsets it always had (portrait first).
    const desktop: Sequence = [
      ["portrait", 0],
      ["label", "-=0.4"],
      ["title", "-=0.3"],
      ["description", "-=0.2"],
    ];
    const mobile: Sequence = [
      ["label", 0],
      ["title", 0.12],
      ["description", 0.24],
      ["portrait", 0.36],
    ];

    // Set initial hidden state synchronously BEFORE any timeline starts, so the
    // timelines are deterministic even if the reveal gate never armed (no
    // IntersectionObserver). Before paint the hiding comes from the gate CSS,
    // not from the markup: these nodes used to carry inline
    // `opacity:0; visibility:hidden`, which kept them out of the a11y tree and
    // invisible forever when the JS never ran.
    gsap.set(
      Object.keys(steps).map((name) => `.about-${name}`),
      { autoAlpha: 0 }
    );

    // gsap.matchMedia (not a one-time window.matchMedia read): rotating the
    // phone changes which sequence is active, and GSAP reverts the previous
    // context on its own.
    const media = gsap.matchMedia();
    for (const [query, sequence] of [
      ["(min-width: 768px)", desktop],
      ["(max-width: 767px)", mobile],
    ] as const) {
      media.add(query, () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
          },
          defaults: { ease: "power2.out" },
        });
        for (const [name, at] of sequence) {
          tl.to(`.about-${name}`, steps[name], at);
        }
      });
    }
  });

  return (
    <Section
      id="sobre-mi"
      ref={containerRef}
      aria-label={t("section.about.ariaLabel")}
      className="relative flex flex-col items-center justify-center min-h-[60dvh] 2xl:min-h-[70dvh] portrait:min-h-[50dvh]"
      insetClassName="px-6 md:px-8 lg:px-12"
      innerClassName="relative z-10 flex flex-col-reverse md:flex-row items-center justify-center w-full max-w-5xl gap-6 md:gap-12 lg:gap-14 xl:gap-16"
    >
      {/* Left Column: Portrait */}
      <div className="about-portrait debug-l3 relative rounded-4xl shadow-xl aspect-11/9 w-full max-w-[400px] sm:max-w-[440px] mx-auto md:mx-0 md:max-w-full md:w-auto md:h-[280px] lg:h-[320px] xl:h-[360px] 2xl:h-[380px] shrink-0 z-0" data-reveal-item="">
        <div className="w-full h-full rounded-4xl overflow-hidden relative">
          <Image
            src="/images/about-max.webp"
            alt={t("section.about.imageAlt")}
            fill
            quality={90}
            className="object-cover object-top 2xl:object-right"
            sizes="(max-width: 768px) 400px, (max-width: 1200px) 464px, 490px"
          />
        </div>
      </div>

      {/* Right Column: Info */}
      <div className="about-info flex flex-col items-center md:items-start text-center md:text-left z-10">
        <p className="about-label uppercase tracking-[0.2em] font-medium text-muted-foreground mb-2 text-fluid-eyebrow" data-reveal-item="">
          {t("section.about.label")}
        </p>

        <h2 className="about-title md:flex md:gap-4 font-serif font-black uppercase text-fluid-section leading-[0.9] tracking-tighter text-foreground mb-4 md:mb-6" data-reveal-item="">
          <span>{t("section.about.title.first")}</span>
          <span className="text-purple-accent"> {t("section.about.title.second")}</span>
        </h2>

        <div className="debug-l3 px-4 sm:px-16 md:px-0 about-description text-fluid-body leading-relaxed text-content max-w-[48ch] space-y-4" data-reveal-item="">
          <div className="debug-test">
            <p>{t("section.about.paragraph1")}</p>
            <p>{t("section.about.paragraph2")}</p>
          </div>

        </div>
      </div>
    </Section>
  );
}
