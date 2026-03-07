"use client";

/**
 * hooks/use-gsap-animation.ts
 *
 * Reusable hook that:
 *  - Registers ScrollTrigger once (idempotent).
 *  - Accepts a setup callback where you define your GSAP animations.
 *  - Wraps everything in gsap.context() tied to a container ref so all
 *    tweens are scoped and automatically reverted on unmount - no memory leaks.
 *
 * Usage:
 *   const containerRef = useGsapAnimation((gsap, ScrollTrigger) => {
 *     gsap.from(".my-el", { opacity: 0, y: 20 });
 *   });
 *   return <section ref={containerRef}>...</section>;
 */

import { useEffect, useRef, useLayoutEffect } from "react";
import type { RefObject } from "react";

// Use useLayoutEffect on the client, useEffect as a safe SSR fallback.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

type SetupFn = (
  gsap: typeof import("gsap").gsap,
  ScrollTrigger: typeof import("gsap/ScrollTrigger").ScrollTrigger
) => void;

export function useGsapAnimation<T extends HTMLElement = HTMLDivElement>(
  setup: SetupFn,
  deps: React.DependencyList = []
): RefObject<T | null> {
  const containerRef = useRef<T>(null);

  useIsomorphicLayoutEffect(() => {
    let ctx: any;

    const init = async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");

      // Register once - GSAP guards against double registration.
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        setup(gsap, ScrollTrigger);
      }, containerRef);
    };

    init();

    return () => {
      ctx?.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return containerRef;
}
