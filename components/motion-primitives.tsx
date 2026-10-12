"use client";

/**
 * motion-primitives.tsx
 * ---------------------
 * Reusable Framer Motion wrappers used across all sections.
 * Each primitive is intentionally lean - drop one in, pass className/children.
 *
 * FadeIn        - fades & rises from below on scroll enter.
 * FadeInStagger - wraps a list; each child animates in sequence.
 */

import { motion, type Variants, type HTMLMotionProps } from "framer-motion";
import { type ReactNode } from "react";
import { useIsMobile } from "@/components/ui/use-mobile";

// ---------------------------------------------------------------------------
// Shared viewport config - trigger once when 15% of the element is visible.
// ---------------------------------------------------------------------------
const VIEWPORT = { once: true, amount: 0.15 } as const;

// Delayed variant: a negative bottom rootMargin waits until the element is
// ~15% of the viewport height into the screen before animating, matching the
// GSAP rhythm of AboutSection ("top 85%"): content only reveals once the user
// has scrolled INTO it, not the instant it peeks from the bottom edge.
const VIEWPORT_DELAYED = { once: true, amount: 0.15, margin: "0px 0px -15% 0px" } as const;

// Early trigger for tall single-column grids on mobile: fires when the grid
// top reaches ~15% above the viewport bottom (same 85% line as the heading),
// not at the first pixel on the bottom edge and not after 15% of the whole
// tall element is visible.
const VIEWPORT_EARLY = { once: true, amount: "some", margin: "0px 0px -15% 0px" } as const;

// Mobile-only ordering delay for early triggers: the early viewport fires at
// the first pixel while a delayEnter heading still waits for its -15% margin,
// so without this the grid would win the race and appear before the title.
// A small transition delay restores title-first ordering on mobile only;
// desktop timing stays exactly as passed.
const EARLY_MOBILE_ORDER_DELAY = 0.15;

// Stagger containers can be very tall on mobile (a single-column grid is
// several thousand px). A %-of-element threshold would force the user to
// scroll deep into the list before the animation fires. "some" triggers as
// soon as the container starts entering the viewport, so items animate as
// they scroll into view instead of appearing long after they were seen.
const STAGGER_VIEWPORT = { once: true, amount: "some" } as const;

// Delayed variant for stagger containers: same rootMargin delay as
// VIEWPORT_DELAYED so the cascade starts only once the grid is well inside
// the viewport instead of at its first pixel.
const STAGGER_VIEWPORT_DELAYED = { once: true, amount: "some", margin: "0px 0px -15% 0px" } as const;

// ---------------------------------------------------------------------------
// FadeIn
// ---------------------------------------------------------------------------
const fadeInVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

interface FadeInProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  delay?: number;
  as?: keyof typeof motion;
  /** Wait until the element is ~15% of the viewport height into the screen before animating. */
  delayEnter?: boolean;
  /** On mobile (<768px) trigger at first entry with no negative margin; desktop keeps delayEnter logic. */
  earlyOnMobile?: boolean;
}

export function FadeIn({ children, delay = 0, className, delayEnter = false, earlyOnMobile = false, ...rest }: FadeInProps) {
  // False on server and first client render, so no hydration mismatch; only
  // the viewport observer options and transition delay update after mount.
  const isMobile = useIsMobile();
  const isEarlyMobile = earlyOnMobile && isMobile;
  const viewport = isEarlyMobile ? VIEWPORT_EARLY : delayEnter ? VIEWPORT_DELAYED : VIEWPORT;
  const effectiveDelay = isEarlyMobile ? delay + EARLY_MOBILE_ORDER_DELAY : delay;
  return (
    <motion.div
      variants={fadeInVariants}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      transition={{ delay: effectiveDelay }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// FadeInStagger - parent container; children must use FadeInItem.
// ---------------------------------------------------------------------------
const staggerContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

interface FadeInStaggerProps {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
  /** Wait until the container is ~15% of the viewport height into the screen before starting the cascade. */
  delayEnter?: boolean;
}

export function FadeInStagger({ children, className, stagger = 0.1, delay = 0.05, delayEnter = false }: FadeInStaggerProps) {
  const variants: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: stagger, delayChildren: delay },
    },
  };

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={delayEnter ? STAGGER_VIEWPORT_DELAYED : STAGGER_VIEWPORT}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// FadeInItem - direct child of FadeInStagger.
// ---------------------------------------------------------------------------
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

interface FadeInItemProps {
  children: ReactNode;
  className?: string;
}

export function FadeInItem({ children, className }: FadeInItemProps) {
  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// FadeInItemFade - opacity-only child of FadeInStagger.
// Same contract as FadeInItem but without the y transform, for dense grids
// (e.g. AllProjects) where transform on every card competes with image
// decoding at section entry and causes a hitch. Duration is shorter so the
// cascade still feels fast.
// ---------------------------------------------------------------------------
const fadeItemVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
};

export function FadeInItemFade({ children, className }: FadeInItemProps) {
  return (
    <motion.div variants={fadeItemVariants} className={className}>
      {children}
    </motion.div>
  );
}
