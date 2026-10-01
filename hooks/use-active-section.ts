"use client";

import { useEffect, useState } from "react";

/**
 * Active-section scroll spy (D2/D4 of navbar-active-state).
 *
 * Observes the given sections with an IntersectionObserver against a centered
 * band of the viewport (`rootMargin: "-40% 0px -40% 0px"` -> middle 20%) and
 * returns the active section id, or `null`:
 *
 * - The hero (`#inicio`) CLEARS the state: at the top no link is active.
 * - In gaps between anchors (no section in the band) the LAST ACTIVE WINS;
 *   only the hero resets.
 * - Among ALL sections currently in the band, the earliest in document order
 *   wins. The set is maintained across callbacks: `entries` only carries
 *   targets that CHANGED in the current batch, so a batch-local tie-break
 *   let the next section override an earlier one during an animated anchor
 *   landing (iPad portrait: About is short at md and shares the band with
 *   Projects, entering in successive batches -> Projects used to win).
 * - Plain DOM + IntersectionObserver: no dependencies, agnostic to the scroll
 *   engine (works the same with Lenis on desktop and native scroll on mobile).
 *
 * @param sectionIds Section ids in document order. Must be a STABLE reference
 *   (module-level const in the consumer): changing it re-observes.
 */
export function useActiveSection(sectionIds: readonly string[]): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const targets = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;

    // Document order to break ties: the earliest section in the band wins, so
    // the hero wins at the top and clears instead of activating.
    const order = new Map(sectionIds.map((id, i) => [id, i]));

    // Full set of sections currently in the band, updated incrementally per
    // callback (entries are change-only deltas — see the header comment).
    const intersecting = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id;
          if (entry.isIntersecting) intersecting.add(id);
          else intersecting.delete(id);
        }

        // Empty set = gap between anchors -> last active wins (no clear).
        if (intersecting.size === 0) return;

        let earliest: string | null = null;
        for (const id of intersecting) {
          if (earliest === null || (order.get(id) ?? 0) < (order.get(earliest) ?? 0)) {
            earliest = id;
          }
        }
        if (earliest === null) return;

        setActiveId(earliest === "inicio" ? null : earliest);
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: 0 }
    );

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [sectionIds]);

  return activeId;
}
