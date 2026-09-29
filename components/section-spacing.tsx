import { SECTION_GAP } from "@/lib/rhythm";

/**
 * Inter-section vertical rhythm: 96px mobile, 128px ≥768px.
 * Values come from lib/rhythm.ts (SECTION_GAP) — single source of truth.
 */
export function SectionSpacing() {
  return <div aria-hidden="true" className={SECTION_GAP} />;
}
