"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * reveal.tsx
 * ----------
 * CSS-owned section entry. Replaces the framer-motion FadeIn family for the
 * scroll entries of the home page.
 *
 * Why not framer-motion: its `initial="hidden"` bakes `opacity:0` into the
 * server markup, so without JS the section never shows up. Here the markup is
 * visible by default and the hiding is a CSS layer that only exists when the
 * inline gate script (app/layout.tsx) managed to run. The entry itself is a CSS
 * opacity transition, which the compositor can run without a JS animation loop.
 *
 * The node renders `data-reveal-item` on the SERVER on purpose: adding it in the
 * effect would paint the content visible first, hide it, and reveal it again.
 *
 * Observers are shared per profile (rootMargin + threshold), not one per node.
 * The intersection work is one attribute write plus `unobserve`; no React state,
 * no re-render, no animation loop.
 */

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Wait until the element is ~15% of the viewport height into the screen. */
  delayEnter?: boolean;
  /** On mobile (<768px) trigger at first entry with no negative margin. */
  earlyOnMobile?: boolean;
};

const MOBILE_QUERY = "(max-width: 767px)";

// Equivalent to framer-motion's VIEWPORT_DELAYED: a negative bottom rootMargin
// waits until the element is ~15% of the viewport into the screen, matching the
// GSAP rhythm of AboutSection ("top 85%").
const DELAY_ENTER_MARGIN = "0px 0px -15% 0px";

// Framer-motion's `amount: 0.15` equivalent for the default and delayed
// profiles; the early (mobile) profile triggers at the first pixel.
const DEFAULT_THRESHOLD = 0.15;

// Mobile-only ordering delay: the early profile fires at the first pixel while a
// delayEnter heading still waits for its -15% margin, so without this the grid
// would win the race and appear before its title.
const EARLY_MOBILE_ORDER_DELAY = 0.15;

type ObserverProfile = {
  margin: string;
  threshold: number;
};

const observers = new Map<string, IntersectionObserver>();

function getObserver(profile: ObserverProfile): IntersectionObserver {
  const key = `${profile.margin}|${profile.threshold}`;
  const existing = observers.get(key);
  if (existing) return existing;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        (entry.target as HTMLElement).dataset.revealItem = "shown";
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: profile.margin, threshold: profile.threshold },
  );

  observers.set(key, observer);
  return observer;
}

export function Reveal({
  children,
  className,
  delay = 0,
  delayEnter = false,
  earlyOnMobile = false,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // No observer at all: reveal immediately. The gate is not armed in that
    // case either, so this keeps the node correct on its own.
    if (!("IntersectionObserver" in window)) {
      el.dataset.revealItem = "shown";
      return;
    }

    const isEarlyMobile = earlyOnMobile && window.matchMedia(MOBILE_QUERY).matches;
    const profile: ObserverProfile = isEarlyMobile
      ? { margin: DELAY_ENTER_MARGIN, threshold: 0 }
      : delayEnter
        ? { margin: DELAY_ENTER_MARGIN, threshold: DEFAULT_THRESHOLD }
        : { margin: "0px", threshold: DEFAULT_THRESHOLD };

    // Written here instead of during render: the delay depends on matchMedia, so
    // keeping it in the effect avoids state and any hydration mismatch.
    el.style.setProperty(
      "--reveal-delay",
      `${delay + (isEarlyMobile ? EARLY_MOBILE_ORDER_DELAY : 0)}s`,
    );

    const observer = getObserver(profile);
    observer.observe(el);
    return () => observer.unobserve(el);
  }, [delay, delayEnter, earlyOnMobile]);

  return (
    <div ref={ref} data-reveal-item="" className={className}>
      {children}
    </div>
  );
}
