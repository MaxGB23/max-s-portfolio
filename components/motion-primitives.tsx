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

// ---------------------------------------------------------------------------
// Shared viewport config - trigger once when 15% of the element is visible.
// ---------------------------------------------------------------------------
const VIEWPORT = { once: true, amount: 0.15 } as const;

// Delayed variant: a negative bottom rootMargin waits until the element is
// ~15% of the viewport height into the screen before animating, matching the
// GSAP rhythm of AboutSection ("top 85%"): content only reveals once the user
// has scrolled INTO it, not the instant it peeks from the bottom edge.
const VIEWPORT_DELAYED = { once: true, amount: 0.15, margin: "0px 0px -15% 0px" } as const;

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
}

export function FadeIn({ children, delay = 0, className, delayEnter = false, ...rest }: FadeInProps) {
  return (
    <motion.div
      variants={fadeInVariants}
      initial="hidden"
      whileInView="visible"
      viewport={delayEnter ? VIEWPORT_DELAYED : VIEWPORT}
      transition={{ delay }}
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
