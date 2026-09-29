# Feature: Featured Section Animation Redesign

## Objective
Replace the GSAP pin-based stacking animation with a scroll-reactive animation that preserves the design system's rhythm, works predictably across all viewports, and maintains premium editorial feel.

## Problem
- Layout controlled by animation (`height: 100vh` + `end: +=${(n-1)*80}%`)
- Rhythm system broken (`SECTION_GAP` / `FEATURED_GAP` overridden by pin-spacer)
- Inconsistent across OS scaling, browser zoom, tablets, ultra-wide/short viewports
- 8+ media queries patching symptoms
- `prefers-reduced-motion` cannot disable pin without breaking layout
- Maintenance burden: adding projects requires recalculating `end` percentage

## Success Criteria
- [x] Section spacing governed **exclusively** by `lib/rhythm.ts` tokens
- [x] Zero media queries for spacing fixes
- [x] `prefers-reduced-motion` fully respected (animations off, layout intact)
- [ ] Lighthouse CLS = 0 on mobile/desktop
- [ ] Adding a 4th project = data entry only (no animation recalculation)
- [ ] Visual impact ≥ current (staggered reveal + micro-interactions)
- [x] GSAP lines of code reduced by ≥60% (~70% achieved: ~50 → ~15 lines)

## Variants (Branches)
| Variant | Branch | Status |
|---------|--------|--------|
| A - Staggered Reveal on Scroll | `feat/featured-stagger-reveal` | ✅ Implemented & committed |
| B - Horizontal Snap Carousel | `feat/featured-horizontal-snap` | ⏳ If A fails impact |
| C - Parallax Layers + Staggered Reveal | `feat/featured-parallax-layers` | ⏳ If A fails impact |
| D - CSS Scroll-Driven Animations | `feat/featured-css-scroll-driven` | ⏳ If A fails impact |
| E - Static Cards + Hover/Tap Expand | `feat/featured-static-expand` | ⏳ If A fails impact |

## Implementation Tasks (Variant A)

### Task 1: Create worktree and branch
- [x] `git worktree add M:\worktrees\maxgb23-portfolio\featured-stagger-reveal -b feat/featured-stagger-reveal`
- [x] `pnpm install` in worktree
- [x] Verify dev server runs on `:3001`

### Task 2: Remove GSAP pin logic from `featured-projects.tsx`
- [x] Remove `height: 100vh`, `overflow: hidden`, `position: relative` from `.featured-section`
- [x] Remove absolute positioning of panels (`.featured-panel`)
- [x] Remove `gsap.matchMedia(FEATURED_STACK_GATE, ...)` block
- [x] Remove ScrollTrigger pin timeline
- [x] Keep `gsap.context` for cleanup

### Task 3: Implement staggered reveal with `gsap.batch()`
- [x] Panels render in natural document flow (static layout)
- [x] Each panel animates on scroll entry: `opacity: 0 → 1`, `translateY: 40px → 0`, `scale: 0.98 → 1`
- [x] `gsap.batch(".featured-panel", { interval: 0.12, ... })` for orchestrated stagger
- [x] Internal elements stagger: `interval: 0.08`
- [x] `prefers-reduced-motion` respected via conditional initial state + toggleActions logic

### Task 4: Optional subtle parallax (decorative only)
- [x] Background layer `yPercent: 15` at `scrub: 0.3` (purely decorative)
- [x] Guard with `prefers-reduced-motion` media query

### Task 5: Title behavior - sticky heading above stack
- [x] `position: sticky; top: 0` heading above panel stack
- [x] Fades out when panel 1 enters (`ScrollTrigger` onEnter/onLeaveBack)
- [x] Accessible: `sr-only` label for screen readers, heading stays in DOM

### Task 6: Update `featured-project-panel.tsx`
- [x] Remove GSAP-dependent classes (absolute positioning, `h-full`, etc.)
- [x] Ensure panels use natural height (removed `min-h-screen`, `landscape:lg:h-full`)
- [x] Keep `FEATURED_GAP` / `FEATURED_GAP_LG` from `lib/rhythm.ts` for internal spacing
- [x] Remove `overlay` prop complexity (heading now separate sticky element)
- [x] Added `featured-panel-bg` class for optional parallax targeting

### Task 7: Update `hooks/use-lenis.tsx` - ScrollRestorer
- [x] Remove `PIN_MEDIA` / `FEATURED_STACK_GATE` pin logic
- [x] Remove pin-spacer watchdog (`hasPinSpacer`, `check`, `watch` loops)
- [x] Simplify to: `lenis.resize()` → `lenis.scrollTo(target, { immediate: true })`
- [x] Keep `saveHomeScroll` / `takeHomeScroll` for route handoff

### Task 8: Update `lib/breakpoints.ts`
- [x] `FEATURED_STACK_GATE` deprecated (stub export to avoid breaking stale imports)
- [x] No consumers remain after pin removal

### Task 9: Verify rhythm compliance (PENDING - manual QA)
- [ ] Visual diff: section gaps match `lib/rhythm.ts` tokens at 320px, 768px, 1024px, 1440px, 1920px
- [ ] Test: 125% OS scaling, 150% zoom, iPad Pro (1024×1366), ultra-wide (3440×1440), short laptop (1366×768)
- [ ] `prefers-reduced-motion`: animations off, layout perfect
- [ ] Lighthouse mobile: CLS=0, TBT<100ms
- [ ] Add 4th project to `data/projects.ts` → verify no animation code changes needed

### Task 10: Commit and evaluate
- [x] Conventional commit: `feat: staggered reveal animation for featured projects`
- [ ] Run evaluation checklist (backlog.md lines 166-187)
- [ ] Record 10s video for visual impact assessment
- [ ] If all criteria pass → merge to main, stop
- [ ] If "impact" < threshold → implement next variant

## Files Touched
- `components/featured-projects.tsx` — main orchestrator (staggered reveal + sticky heading)
- `components/featured-project-panel.tsx` — panel internals (natural flow, rhythm spacing, parallax class)
- `lib/breakpoints.ts` — deprecated `FEATURED_STACK_GATE`
- `hooks/use-lenis.tsx` — simplified ScrollRestorer (no pin watchdog)
- `lib/rhythm.ts` — unchanged (tokens work as-is)
- `data/projects.ts` — no changes
- `data/translations.ts` — no changes

## Acceptance Criteria
All success criteria met + Variant A evaluation checklist ≥ 27/30 weighted score.

## Next Steps
1. Manual QA on `http://localhost:3001` (worktree dev server)
2. Run evaluation checklist (backlog.md lines 166-187)
3. If all criteria pass → merge `feat/featured-stagger-reveal` to main
4. After merge → unblock navbar CTA separation + active state (see backlog.md Deferred section)