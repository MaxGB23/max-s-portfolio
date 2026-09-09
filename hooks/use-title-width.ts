"use client";

/**
 * hooks/use-title-width.ts
 *
 * Measures the width of the widest line inside a title (e.g. the longest
 * <span> row of a stacked h1) and exposes it, so supporting text can be
 * constrained to the same visual width as the title.
 *
 * Why: the max-width of a description should follow the real rendered title,
 * not hand-tuned media queries ("values mágicos"). The title scales with
 * clamp() and its content is fixed, so measuring keeps them in proportion at
 * every resolution with zero magic numbers.
 *
 * Scope: the constraint only makes sense in multi-column layouts (md+, default
 * 768px) where the title shares the row with other content. Below that the
 * hook returns null so the supporting text uses the natural container width.
 *
 * Usage:
 *   const { ref: titleRef, width: titleWidth } = useTitleWidth<HTMLHeadingElement>("span");
 *   <h1 ref={titleRef}>...<span>Line 1</span><span>Line 2</span></h1>
 *   <p style={{ maxWidth: titleWidth ?? undefined }}>...</p>
 */

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { RefObject } from "react";

// Use useLayoutEffect on the client, useEffect as a safe SSR fallback.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function useTitleWidth<T extends HTMLElement = HTMLDivElement>(
  selector: string,
  minWidth = 768
): { ref: RefObject<T | null>; width: number | null } {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState<number | null>(null);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Only constrain when the title shares the row with other content
    // (multi-column layouts, md+). In single-column mobile the supporting
    // text should use the natural container width instead.
    const mq = window.matchMedia(`(min-width: ${minWidth}px)`);

    const measure = () => {
      if (!mq.matches) {
        setWidth(null);
        return;
      }
      const items = Array.from(el.querySelectorAll<HTMLElement>(selector));
      if (items.length === 0) {
        // Fallback: whole title as a single block (e.g. single-line titles).
        setWidth(el.scrollWidth);
        return;
      }
      let max = 0;
      for (const item of items) {
        if (item.scrollWidth > max) max = item.scrollWidth;
      }
      setWidth(max);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    const onMqChange = () => measure();
    mq.addEventListener?.("change", onMqChange);
    return () => {
      ro.disconnect();
      mq.removeEventListener?.("change", onMqChange);
    };
  }, [selector, minWidth]);

  return { ref, width };
}