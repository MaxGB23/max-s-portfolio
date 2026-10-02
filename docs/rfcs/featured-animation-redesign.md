# RFC: Featured Section Animation Redesign

> **STATUS: CLOSED — no open work items.**
>
> | | Outcome | Commit |
> |---|---|---|
> | Variant A (Staggered Reveal) — the primary direction | **Shipped** | `280a483` |
> | Deferred: navbar CTA separation + active state | **Shipped** | `b5e7cba` |
> | Variants B–E | Not built — A met the bar, so they were skipped per the decision gate | — |
>
> This document is kept as the **decision record**: it explains *why* the featured
> section is built the way it is. The "Next Actions" and "Timeline" sections below
> are the original plan and were executed as written; they do not describe work
> still to do.
>
> Archived from `backlog.md` (repo root) — the name invited new items, but this was
> never a backlog. Explore-and-decide documents live in `docs/rfcs/`.
> Audit findings and open technical items live in `docs/issues/`.

---

# Backlog: Featured Section Animation Redesign

## Problem Statement

The current **Featured Projects** section uses a **GSAP full-viewport pin + scrub** animation that creates a stacking card effect. This approach causes systemic issues:

### Root Cause
- **Layout controlled by animation**: `height: 100vh` + `end: +=${(n-1)*80}%` makes section spacing a function of viewport dimensions, not design tokens
- **Rhythm system broken**: The `SECTION_GAP` / `FEATURED_GAP` tokens from `lib/rhythm.ts` are overridden by GSAP's pin-spacer
- **Inconsistent across environments**:
  - OS-level scaling (125%, 150%) breaks viewport calculations
  - Browser zoom alters pin duration and spacer height
  - Tablets (iPad Pro portrait) incorrectly trigger desktop gate
  - Ultra-wide / short-height viewports clip content or create massive gaps
- **Media query debt**: 8+ custom media queries attempting to patch symptoms
- **Accessibility gap**: `prefers-reduced-motion` cannot disable pin without breaking layout
- **Maintenance burden**: Adding/removing projects requires recalculating `end` percentage and re-testing 5+ viewport combinations

### Current Architecture Conflict
```
Rhythm System (predictable, token-based)  ❌  VS  ❌  GSAP Pin (viewport-dependent, imperative)
```

---

## Objective

**Replace the pin-based stacking animation with a scroll-reactive animation that preserves the design system's rhythm, works predictably across all viewports, and maintains premium editorial feel.**

### Success Criteria
- [ ] Section spacing governed **exclusively** by `lib/rhythm.ts` tokens
- [ ] Zero media queries for spacing fixes
- [ ] `prefers-reduced-motion` fully respected (animations off, layout intact)
- [ ] Lighthouse CLS = 0 on mobile/desktop
- [ ] Adding a 4th project = data entry only (no animation recalculation)
- [ ] Visual impact ≥ current (staggered reveal + micro-interactions)
- [ ] GSAP lines of code reduced by ≥60%

---

## Variants to Explore (One Branch Each)

### 🎯 Variant A — **Staggered Reveal on Scroll** (Primary — Team Consensus)
**Branch**: `feat/featured-stagger-reveal`

**Approach**
- Panels render in **natural document flow** (static layout)
- Each panel reveals with the site's shared **`FadeIn` primitive** (`opacity` + `translateY(20px)`), triggered when the panel's top crosses 60% of the viewport (`margin: 0px 0px -40% 0px`, `once`) so the reader finishes the previous card before the next appears — same entrance as every section title, for all users (`docs/issues/reduced-motion.md` policy)
- **Parallax: removed after QA** (in-frame `yPercent: 15` without overscan made images "sink" on desktop 2-col; the section is GSAP-free)
- **One slide at a time**: panels 1..n are visible iff their top crossed the 60% line and the next panel's hasn't; panel 0 + title are the entry slide — panel 0 sticks once entered and title + card 0 exit ONLY when panel 1 advances past the line (scrolling up toward About scrolls them off naturally); opacity + 20px rise via CSS (level-triggered geometry, self-healing); animations keep running under `prefers-reduced-motion` (owner decision, consistent with the rest of the site; visual only — space in flow stays, rhythm contract untouched)
- **Title**: in-flow heading inside `#proyectos` with the standard `FadeIn delayEnter` pattern used by every other section title (sticky variant discarded in QA: overlapped About on desktop, faded too early, left an empty band)
- **CSS scroll-driven animations** for simple reveals where GSAP adds no value

**Why this wins**
- Rhythm system intact — spacing = design tokens
- Zero GSAP vs ~50 current
- Full accessibility, zero CLS
- Extensible: add projects without touching animation code

**Risk**: May feel "less dramatic" than pin in first 3 seconds — mitigated by craft-quality easing (`expo.out`) and micro-interactions (tag hover, image zoom, CTA ripple)

---

### Variant B — **Horizontal Snap Carousel**
**Branch**: `feat/featured-horizontal-snap`

**Approach**
- Single-row horizontal scroll container: `overflow-x: auto; scroll-snap-type: x mandatory`
- Each panel = `scroll-snap-align: center; flex: 0 0 85%` (mobile) / `flex: 0 0 30%` (desktop)
- GSAP only for **programmatic scroll** (arrow keys, nav buttons, `scrollTo` with `expo.out`)
- Title: Sticky above carousel, always visible
- Native touch scroll, scroll-snap, scrollbar styling

**Pros**
- Rhythm-compatible (height = tallest card natural height)
- Touch-native, zero scrolljacking
- Familiar pattern, low cognitive load

**Cons**
- Loses "editorial vertical narrative" feel
- Horizontal scroll on desktop can feel unexpected for portfolio
- Requires visible scroll indicators / arrows for discoverability

---

### Variant C — **Parallax Layers + Staggered Reveal (Hybrid)**
**Branch**: `feat/featured-parallax-layers`

**Approach**
- Natural flow layout (like Variant A)
- **Depth layers per panel**: background image (`yPercent: 20`), card (`yPercent: 0`), foreground accents (`yPercent: -10`)
- All layers driven by single `ScrollTrigger` with `scrub: 0.5` (no pin)
- Staggered reveal on entry (Variant A) + continuous parallax during scroll
- Title: Sticky, cross-fades to panel 1 title on scroll

**Pros**
- Maximum "premium" depth perception
- Still rhythm-compatible (no pin spacer)
- Showcases GSAP orchestration skill

**Cons**
- Most complex implementation
- Parallax can cause motion sensitivity issues (needs `prefers-reduced-motion` kill switch)
- Performance risk on low-end mobile (multiple scrubbing layers)

---

### Variant D — **CSS Scroll-Driven Animations (Zero-JS Reveals)**
**Branch**: `feat/featured-css-scroll-driven`

**Approach**
- **No GSAP for reveals** — pure CSS `animation-timeline: view()`
- `@keyframes reveal { from { opacity: 0; transform: translateY(40px) scale(0.98); } }`
- `.panel { animation: reveal linear; animation-timeline: view(); animation-range: entry 15% cover 35%; }`
- Stagger via `animation-delay: calc(var(--index) * 150ms)` (CSS variable set inline)
- GSAP retained only for **micro-interactions** (hover, click, CTA)
- Title: Sticky, CSS `opacity` driven by `view-timeline` of panel 1

**Pros**
- Zero JS main-thread cost for reveals
- 60fps guaranteed, works without JS
- Smallest bundle impact

**Cons**
- Limited orchestration (no cross-element coordination)
- Browser support: Chrome 115+, Firefox 114+, Safari 17.2+ (polyfill needed for older)
- Harder to debug/tune than GSAP timeline

---

### Variant E — **Stacked Cards (Static) + Hover/Tap Expand**
**Branch**: `feat/featured-static-expand`

**Approach**
- **No scroll animation at all** — three cards stacked vertically in flow
- Each card: `height: auto`, full content visible
- **Interaction**: hover (desktop) / tap (mobile) expands card to full viewport overlay with case study preview
- GSAP only for expand/collapse animation (`flip` technique)
- Title: Normal heading in flow, no sticky/fade complexity

**Pros**
- Simplest implementation, zero scroll complexity
- Maximum content visibility (no clipping, no timing)
- Touch-friendly, accessible by default
- Rhythm system perfectly preserved

**Cons**
- Least "impressive" on first load — no motion narrative
- Requires strong visual design to compensate
- Expand overlay adds modal complexity (focus trap, ESC, backdrop)

---

## Branch Strategy & Evaluation Process

### Branch Creation
```bash
# From main (clean commit)
git checkout -b feat/featured-stagger-reveal      # Variant A
git checkout -b feat/featured-horizontal-snap     # Variant B
git checkout -b feat/featured-parallax-layers     # Variant C
git checkout -b feat/featured-css-scroll-driven   # Variant D
git checkout -b feat/featured-static-expand       # Variant E
```

### Evaluation Checklist (Per Variant)

| Criterion | Weight | How to Test |
|-----------|--------|-------------|
| **Rhythm compliance** | 25% | Visual diff: section gaps match `lib/rhythm.ts` tokens at 320px, 768px, 1024px, 1440px, 1920px |
| **Viewport resilience** | 20% | Test: 125% OS scaling, 150% zoom, iPad Pro (1024×1366), ultra-wide (3440×1440), short laptop (1366×768) |
| **Accessibility** | 15% | `prefers-reduced-motion`: animations off, layout perfect; keyboard nav; screen reader order |
| **Performance** | 15% | Lighthouse mobile: CLS=0, TBT<100ms, no long tasks from animation |
| **Visual impact** | 15% | Subjective: "Does it feel premium/editorial?" — record 10s video each |
| **Maintainability** | 10% | Time to add 4th project (data only vs code changes) |

### Decision Matrix Template

| Variant | Rhythm | Viewports | A11y | Perf | Impact | Maint | **Total** |
|---------|--------|-----------|------|------|--------|-------|-----------|
| A Stagger | 5 | 5 | 5 | 5 | 4 | 5 | **29** |
| B Horizontal | 5 | 5 | 5 | 5 | 3 | 4 | 27 |
| C Parallax | 5 | 4 | 3 | 3 | 5 | 2 | 22 |
| D CSS-only | 5 | 5 | 5 | 5 | 3 | 4 | 27 |
| E Static | 5 | 5 | 5 | 5 | 2 | 5 | 27 |

*Score 1-5 per criterion. Weights applied in final decision.*

---

## Implementation Notes (Shared Across Variants)

### Files Likely Touched
- `components/featured-projects.tsx` — main orchestrator
- `components/featured-project-panel.tsx` — panel internals
- `lib/breakpoints.ts` — may simplify/remove `FEATURED_STACK_GATE`
- `lib/rhythm.ts` — `about-projects` wrapper retirado (el título vive dentro de `#proyectos`)
- `hooks/use-lenis.tsx` — remove `PIN_MEDIA` / scroll restorer pin logic
- `data/projects.ts` — no changes (data source unchanged)
- `data/translations.ts` — no changes

### GSAP Patterns to Reference
- ~~`gsap.batch()`~~ — NO existe en GSAP 3.14 core (error real en `d5d8387`); el reveal final usa la primitiva compartida `FadeIn`
- `ScrollTrigger` — `start: "top 85%"`, `toggleActions: "play none none reverse"`
- `gsap.timeline()` — orchestration
- `ScrollTrigger.matchMedia()` — responsive enable/disable (if needed)
- `Flip` plugin — Variant E expand animation

### CSS Scroll-Driven References (Variant D)
- `animation-timeline: view()`
- `animation-range: entry 15% cover 35%`
- `@supports (animation-timeline: view())` progressive enhancement

---

## Timeline & Decision Gate

| Phase | Duration | Owner |
|-------|----------|-------|
| Branch creation & scaffold | 30 min | — |
| Variant A implementation | 2-3 hrs | — |
| Variant B implementation | 1.5-2 hrs | — |
| Variant C implementation | 2-3 hrs | — |
| Variant D implementation | 1.5-2 hrs | — |
| Variant E implementation | 1-1.5 hrs | — |
| **Cross-variant QA session** | 1 hr | Team |
| **Decision meeting** | 30 min | All |
| Merge winning variant → main | 15 min | — |

**Decision gate**: No variant merges to `main` until explicit team agreement. Losing branches preserved for reference.

---

## Open Questions (Resolve Before/During Implementation)

1. **Title behavior**: Sticky + fade-out (Variant A) vs always-visible sticky (B, C, E) — test both
2. **Parallax intensity**: If Variant C pursued, what `yPercent` range feels premium not nauseating?
3. **CSS-only fallback**: Variant D needs `@supports` strategy — polyfill or graceful degradation?
4. **Expand UX (Variant E)**: Modal vs inline expansion? Focus management?
5. **Analytics**: Should we track interaction rates per variant during testing?

---

## Deferred — Blocked Until Refactor Merges

Carried here so it is not lost. Deliberately **not** started before the Featured Section refactor lands.

### Item: Navbar — mobile CTA separation + section active state

**Status**: ✅ Done — implemented by work unit `odd/tasks/navbar-active-state.md`
(branch `feat/recede-fade`, 2026-09-30): `hooks/use-active-section.ts`
(IntersectionObserver scroll-spy, `rootMargin -40% 0 -40% 0`, hero clears,
last-active-wins, no Lenis coupling) + `aria-current="page"` and static
underline on desktop AND mobile + menu `gap-6` with the CTA at
`mt-4 justify-start pl-5` (44px axis intact). QA: `scripts/navbar-active.mjs`.

**Why it was blocked**

1. **Geometry coupling** — the scroll-spy `rootMargin` must be calibrated against real section heights. `#proyectos` is the section being refactored, including the GSAP pin and its pin-spacer growth (see `hooks/use-lenis.tsx` for the documented growth race). Calibrating now means calibrating against geometry that is about to change.
2. **One alignment pass, not two** — the mobile `pl-5` is a deliberate alignment contract, not an arbitrary indent (below). An active-state marker must live inside that same axis, so the separation and the active state have to be designed together. Doing the separation first means redoing the alignment reasoning.
3. **The separator is spacing, not a component** — with the alignment contract intact, separating the CTA reduces to asymmetric spacing (`gap-6` between links + larger `mt-*` before the CTA). Small, but it belongs in the same work unit as the active state.

**Alignment contract — do not break this**

The mobile menu link indent equals the logo text indent, by construction:

| Element | Computation | Left edge |
|---------|-------------|-----------|
| Logo text (availability copy) | `px-6` (24) + dot `size-2` (8) + `gap-3` (12) | **44px** |
| Mobile menu links | `px-6` (24) + `pl-5` (20) | **44px** |

`pl-5` = `8px (dot) + 12px (gap-3)`. Setting the links to `pl-0`, or changing `px-6`, `gap-3`, or the dot size, desyncs the menu from the logo. Any active-state marker must be positioned inside this axis.

**Fragility note**: the alignment currently holds because the menu is `nav:hidden` (mobile widths only, below 1152px), where `max-w-6xl` and `max-w-7xl` both collapse to `100%`. Above 1152px the two containers resolve to different widths and would desync. Not a live bug — do not let the pattern be reused above that threshold without recalculating.

**Scope when unblocked**

- `hooks/use-active-section.ts` (new) — `IntersectionObserver` scroll-spy, ~50 lines, no new dependencies
- `components/navbar.tsx` — consume in **both** the desktop link list and the mobile menu list; do not build it mobile-only, the same hook serves both
- Do **not** couple the spy to Lenis. It must stay agnostic to the Lenis (desktop) and native (mobile) scroll worlds
- Active state needs `aria-current="page"`, not color alone
- The desktop underline is hover-only (`w-0 → group-hover:w-full`) — it needs a static active variant, not a reuse of the hover transition
- Open sub-question: gap sections between anchors need a "last active wins" fallback, otherwise the active item deactivates while scrolling through the whitespace

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-09-29 | Variant A = primary direction | Team consensus: rhythm compliance + accessibility + maintainability |
| 2026-09-29 | 5 variants to branches | Empirical comparison > theoretical debate |
| 2026-09-29 | Evaluation checklist defined | Objective criteria prevent "gut feeling" bias |
| 2026-09-29 | Navbar CTA separation + active state deferred | Blocked on refactor merge: `rootMargin` calibration depends on the final `#proyectos` geometry and pin behavior |

---

## Next Actions

- [ ] Create 5 branches from `main`
- [ ] Implement Variant A first (highest confidence)
- [ ] Run evaluation checklist on Variant A
- [ ] If Variant A passes all criteria → **stop, merge, ship**
- [ ] Only implement B/C/D/E if Variant A fails subjective "impact" threshold
- [ ] **After** the winning branch is merged → unblock and schedule the navbar CTA separation + active state (see [Deferred](#deferred--blocked-until-refactor-merges))

---

*Document version: 1.1 — Created 2026-09-29, navbar deferral added 2026-09-29*
*Next review: After Variant A QA session*