import { SECTION_GAP } from "@/lib/rhythm";

/**
 * Inter-section vertical rhythm: 96px mobile, 128px ≥768px.
 * Values come from lib/rhythm.ts (SECTION_GAP) — single source of truth.
 * The Featured stack is the documented exception (GSAP pin owns its height).
 */
export function SectionSpacing() {
  return <div aria-hidden="true" className={SECTION_GAP} />;
}
