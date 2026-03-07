"use client";

import Image from "next/image";
import { useGsapAnimation } from "@/hooks/use-gsap-animation";

export function AboutSection() {
  // GSAP timeline: sequences all elements when scrolled into view.
  const containerRef = useGsapAnimation<HTMLElement>((gsap) => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 75%",
      },
      defaults: { ease: "power3.out" },
    });

    tl.from(".about-portrait", {
      opacity: 0,
      x: -40,
      duration: 0.8,
    })
      .from(
        ".about-label",
        { opacity: 0, y: 12, duration: 0.5 },
        "-=0.4"
      )
      .from(
        ".about-title",
        { opacity: 0, x: 20, duration: 0.6 },
        "-=0.3"
      )
      .from(
        ".about-description",
        { opacity: 0, y: 10, duration: 0.45 },
        "-=0.2"
      );
  });

  return (
    <section
      id="sobre-mi"
      ref={containerRef}
      aria-label="Sobre mí"
      className="relative min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 md:py-24"
    >
      {/* Main layout */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-center w-full max-w-7xl mx-auto gap-8 md:gap-20">

        {/* Left Column: Portrait */}
        <div className="about-portrait relative rounded-4xl shrink-0 shadow-xl w-[clamp(240px,30vw,400px)] aspect-8/9 z-0">
          <div className="w-full h-full rounded-4xl overflow-hidden relative">
            <Image
              src="/images/insano.png"
              alt="Max González Ballesteros - Sobre Mí"
              fill
              className="object-cover object-top"
              sizes="(max-width: 768px) 240px, (max-width: 1200px) 30vw, 380px"
            />
          </div>
        </div>

        {/* Right Column: Info */}
        <div className="about-info flex flex-col items-center md:items-start text-center md:text-left z-10 max-w-2xl">
          <p className="about-label uppercase tracking-[0.2em] font-medium text-muted-foreground mb-4 text-xs md:text-xl">
            Conóceme
          </p>

          <h2 className="about-title font-serif font-black uppercase text-[clamp(3.5rem,8vw,6.5rem)] leading-[0.9] tracking-tighter text-foreground mb-6">
            Sobre <br />
            <span style={{ color: "var(--accent-purple)" }}>Mí</span>
          </h2>

          <div className="about-description text-base md:text-lg leading-relaxed text-muted-foreground max-w-lg space-y-4">
            <p>
              Soy un desarrollador de software con experiencia creando aplicaciones web escalables y eficientes. Mi enfoque principal es crear interfaces atractivas que brinden la mejor experiencia de usuario.
            </p>
            <p>
              Con un perfil full-stack, me adapto a diferentes tecnologías para entregar productos modernos que puedan superar los retos técnicos actuales.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
