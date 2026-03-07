"use client";

/**
 * motion-primitives.tsx
 * ---------------------
 * Reusable Framer Motion wrappers used across all sections.
 * Each primitive is intentionally lean - drop one in, pass className/children.
 *
 * FadeIn        - fades & rises from below on scroll enter.
 * FadeInStagger - wraps a list; each child animates in sequence.
 * SlideIn       - slides in from a given direction.
 * ScaleIn       - scales up from slightly smaller.
 */

import { motion, type Variants, type HTMLMotionProps } from "framer-motion";
import { type ReactNode } from "react";

// ---------------------------------------------------------------------------
// Shared viewport config - trigger once when 15% of the element is visible.
// ---------------------------------------------------------------------------
const VIEWPORT = { once: true, amount: 0.15 } as const;

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
}

export function FadeIn({ children, delay = 0, className, ...rest }: FadeInProps) {
  return (
    <motion.div
      variants={fadeInVariants}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
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
}

export function FadeInStagger({ children, className, stagger = 0.1, delay = 0.05 }: FadeInStaggerProps) {
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
      viewport={VIEWPORT}
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
// SlideIn - slides from left or right.
// ---------------------------------------------------------------------------
interface SlideInProps {
  children: ReactNode;
  className?: string;
  from?: "left" | "right";
  delay?: number;
}

export function SlideIn({ children, className, from = "left", delay = 0 }: SlideInProps) {
  const x = from === "left" ? -30 : 30;
  const variants: Variants = {
    hidden: { opacity: 0, x },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay },
    },
  };

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// ScaleIn - scales up from slightly smaller.
// ---------------------------------------------------------------------------
interface ScaleInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function ScaleIn({ children, className, delay = 0 }: ScaleInProps) {
  const variants: Variants = {
    hidden: { opacity: 0, scale: 0.94 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay },
    },
  };

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      className={className}
    >
      {children}
    </motion.div>
  );
}
