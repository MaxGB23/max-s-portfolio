// Rhythm contract by orientation regime — QA mirror of lib/rhythm.ts PAGE_SPACER_CLASSES.
// Usage: expectedGap(pair, viewport) → { min, max? } | null (null = unasserted)
export function regime(vp) {
  const W = vp.width, H = vp.height;
  const landscape = W > H;
  const lg = W >= 1024;
  const gate = lg && H >= 768 && landscape; // FEATURED_STACK_GATE
  return { portrait: !landscape, landscape, lg, gate };
}
export function expectedGap(pair, vp) {
  const r = regime(vp);
  const spacing = vp.width >= 768 ? 128 : 96;
  const T = 10;
  switch (pair) {
    case "hero-about":
      if (r.portrait && vp.width >= 768) return { min: 0, max: T };      // portrait:md:hidden
      return { min: spacing };                                            // excepción Hero (sanity)
    case "about-projects":
      if (r.landscape && r.lg && vp.height > 768) return { min: 0, max: T }; // landscape:lg:hidden
      if (r.landscape && r.lg) return { min: spacing - T, max: spacing + T }; // [@media(max-height:768px)]:block
      if (r.portrait && r.lg) return { min: spacing - T, max: spacing + T }; // heading oculto en lg+
      return { min: spacing };                                            // <lg: heading visible (sanity)
    case "projects-all-projects":
      if (r.landscape && r.lg) return vp.height <= 767
        ? { min: spacing }                                                  // spacer + heading "Todos" (fluido, fuera de #all-projects); last:mb-0 evita que la última card empuje
        : null;                                                           // gate: pin dueño (sin asertar)
      if (r.portrait && r.lg) return { min: 96 };                         // wrapper oculto; manda mb-24 (96)
      return { min: spacing };
    case "all-projects-pricing":
    case "pricing-contact":
    case "contact-footer":
      return { min: spacing - T, max: spacing + T };
    case "featured-card-card":
      if (r.gate) return null;                    // pin dueño de su altura
      if (r.portrait && r.lg) return { min: 96 - T, max: 96 + T };  // portrait:lg:mb-24
      if (r.landscape && r.lg && vp.height <= 768) return { min: 96 - T, max: 96 + T }; // landscape corto (≤768: cubre el píxel exacto 768, testeado en vivo; la gate ≥768 se aserta antes)
      return null;                                 // resto sin asertar
    default:
      return null;
  }
}