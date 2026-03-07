"use client";

import { useEffect, useRef } from "react";

/**
 * A fixed top-of-page progress bar driven by GSAP ScrollTrigger.
 * The bar width reflects how far down the page the user has scrolled.
 */
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ctx: import("gsap").Context | undefined;

    const init = async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");

      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        gsap.to(barRef.current, {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: document.documentElement,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.3,
          },
        });
      });
    };

    init();

    return () => {
      ctx?.revert();
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[60] h-[2px] pointer-events-none"
    >
      <div
        ref={barRef}
        className="h-full origin-left"
        style={{
          backgroundColor: "var(--accent-purple)",
          transform: "scaleX(0)",
        }}
      />
    </div>
  );
}
