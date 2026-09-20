/**
 * Section shell — single source of truth for the top-level section pattern:
 * horizontal inset + optional max-width inner container + QA debug markers.
 *
 * Defaults encode the canonical pattern used across sections:
 *   outer: px-6 md:px-12 + debug-l1
 *   inner: mx-auto max-w-7xl + debug-l2
 *
 * Overrides:
 *   - `insetClassName` REPLACES the default inset. This is intentional: an
 *     override like `px-6` must be able to drop the default `md:px-12`, which
 *     tailwind-merge can't do by appending.
 *   - `innerClassName` APPENDS to the inner container; conflicting utilities
 *     resolve via tailwind-merge (e.g. `innerClassName="max-w-6xl"` replaces
 *     the default `max-w-7xl`).
 *   - `debug` re-maps the QA marker placement. The codebase actually contains
 *     three shapes: l1@outer/l2@inner (default), l2@outer/l1@inner (inverted,
 *     the "Todos los Proyectos" heading block), and none (the featured mobile
 *     heading). Marker levels must be preserved where they exist — QA reads
 *     them.
 *   - `container={false}` opts out of the inner wrapper entirely (full-bleed
 *     inner content).
 *
 * Server-safe: no directives, no hooks. Ref is a plain prop (React 19).
 */
import { type ElementType, type ReactNode, type Ref } from "react";
import { cn } from "@/lib/utils";

const DEFAULT_INSET = "px-6 md:px-12";
const DEFAULT_INNER = "mx-auto max-w-7xl";

type DebugMode = "default" | "inverted" | "none";

const DEBUG_OUTER: Record<DebugMode, string | undefined> = {
  default: "debug-l1",
  inverted: "debug-l2",
  none: undefined,
};

const DEBUG_INNER: Record<DebugMode, string | undefined> = {
  default: "debug-l2",
  inverted: "debug-l1",
  none: undefined,
};

export interface SectionProps {
  /** Rendered element; "div" for wrapper-only blocks (headings, layout). */
  as?: "section" | "div";
  /** Ref to the outermost element (React 19 ref-as-prop). */
  ref?: Ref<HTMLElement>;
  /** id of the outermost element. */
  id?: string;
  /** Accessible label for the section landmark. */
  "aria-label"?: string;
  /** aria-labelledby relationship, preserved from the caller's markup. */
  "aria-labelledby"?: string;
  /** Extra classes appended to the outermost element (section-specific layout). */
  className?: string;
  /**
   * REPLACES the default inset `px-6 md:px-12`.
   * Used by sections that deviate intentionally (e.g. `px-6` only, or
   * `px-6 md:px-8 lg:px-12`).
   */
  insetClassName?: string;
  /**
   * QA debug marker placement on both wrappers:
   * "default" (l1@outer / l2@inner) · "inverted" (l2@outer / l1@inner) · "none".
   */
  debug?: DebugMode;
  /**
   * Renders the inner `max-w-7xl mx-auto` container. Default true;
   * set false when the caller needs full-bleed inner content.
   */
  container?: boolean;
  /** id of the inner container (e.g. `#all-projects-content`, a QA snapshot contract). */
  innerId?: string;
  /** Extra classes appended to the inner container (conflicts resolve via tailwind-merge). */
  innerClassName?: string;
  children?: ReactNode;
}

export function Section({
  as,
  ref,
  id,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  className,
  insetClassName,
  debug = "default",
  container = true,
  innerId,
  innerClassName,
  children,
}: SectionProps) {
  // ElementType keeps the polymorphic `as` simple: a union tag would force
  // per-variant ref typing (Ref<HTMLDivElement>), which no consumer needs —
  // all refs are HTMLElement-generic. We always render a plain DOM element,
  // so the cast is safe and contained.
  const Tag: ElementType = as ?? "section";
  const outer = cn(DEBUG_OUTER[debug], insetClassName ?? DEFAULT_INSET, className);
  const inner = cn(DEBUG_INNER[debug], DEFAULT_INNER, innerClassName);

  return (
    <Tag
      ref={ref as Ref<HTMLDivElement>}
      id={id}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      className={outer}
    >
      {container ? (
        <div id={innerId} className={inner}>
          {children}
        </div>
      ) : (
        children
      )}
    </Tag>
  );
}