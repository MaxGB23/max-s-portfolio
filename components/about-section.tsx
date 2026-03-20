"use client";

import Image from "next/image";
import { useGsapAnimation } from "@/hooks/use-gsap-animation";

const ABOUT_DATA = {
  label: "Conóceme",
  title: {
    first: "Sobre",
    second: "Mí"
  },
  paragraphs: [
    "Soy un desarrollador de software con experiencia creando aplicaciones web escalables y eficientes. Mi enfoque principal es crear interfaces atractivas que brinden la mejor experiencia de usuario.",
    "Con un perfil full-stack, me adapto a diferentes tecnologías para entregar productos modernos que puedan superar los retos técnicos actuales."
  ]
};

export function AboutSection() {
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
        start: "top 85%",
      },
      defaults: { ease: "power3.out" },
    });

    tl.to(".about-portrait", {
      autoAlpha: 1,
      x: 0,
      duration: 0.8,
      startAt: { x: -40 },
    })
      .to(
        ".about-label",
        { autoAlpha: 1, y: 0, duration: 0.5, startAt: { y: 12 } },
        "-=0.4"
      )
      .to(
        ".about-title",
        { autoAlpha: 1, x: 0, duration: 0.4, startAt: { x: 20 } },
        "-=0.3"
      )
      .to(
        ".about-description",
        { autoAlpha: 1, y: 0, duration: 0.45, startAt: { y: 10 } },
        "-=0.2"
      );
  });

  return (
    <section
      id="sobre-mi"
      ref={containerRef}
      aria-label="Sobre mí"
      className="relative border border-red-500  flex flex-col items-center justify-center px-4 py-16 md:py-24"
    >
      {/* Main layout */}
      <div className="relative border border-blue-400 z-10 flex flex-col-reverse md:flex-row items-center justify-center w-full max-w-7xl mx-auto gap-10 2xl:gap-20">

        {/* Left Column: Portrait */}
        <div className="about-portrait relative rounded-4xl shrink-0 shadow-xl w-[360px] sm:w-[390px] md:w-[360px] lg:w-[450px] 2xl:w-[550px] aspect-11/9 border border-red-500 z-0" style={{ opacity: 0, visibility: 'hidden' }}>
          <div className="w-full h-full rounded-4xl overflow-hidden relative">
            <Image
              src="/images/insano.png"
              alt="Max González Ballesteros - Sobre Mí"
              fill
              className="object-cover object-top 2xl:object-right"
              sizes="(max-width: 768px) 240px, (max-width: 1200px) 30vw, 380px"
            />
          </div>
        </div>

        {/* Right Column: Info */}
        <div className="about-info flex flex-col items-center md:items-start text-center md:text-left z-10 max-w-2xl">
          <p className="about-label brightness-125 uppercase tracking-[0.2em] font-medium text-muted-foreground mb-4 text-[15px] sm:text-base lg:text-xl 2xl:text-2xl" style={{ opacity: 0, visibility: 'hidden' }}>
            {ABOUT_DATA.label}
          </p>

          <h2 className="about-title md:flex md:gap-4 font-serif font-black uppercase text-5xl sm:text-6xl lg:text-7xl 2xl:text-8xl leading-[0.9] tracking-tighter text-foreground mb-6" style={{ opacity: 0, visibility: 'hidden' }}>
            <span>{ABOUT_DATA.title.first}</span>
            <span className="text-purple-accent"> {ABOUT_DATA.title.second}</span>
          </h2>

          <div className="border border-red-500 px-4 sm:px-16 md:px-0 about-description text-sm sm:text-base lg:text-lg 2xl:text-xl leading-relaxed text-muted-foreground max-w-lg space-y-4" style={{ opacity: 0, visibility: 'hidden' }}>
            {ABOUT_DATA.paragraphs.map((text, index) => (
              <p key={index}>{text}</p>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
