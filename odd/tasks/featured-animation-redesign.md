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
- [x] `prefers-reduced-motion` respected per site policy (`docs/issues/reduced-motion.md`): entrances play for everyone like every `FadeIn`; no gated motion left in the section (parallax removed after QA)
- [ ] Lighthouse CLS = 0 on mobile/desktop
- [ ] Adding a 4th project = data entry only (no animation recalculation)
- [ ] Visual impact ≥ current (staggered reveal + micro-interactions)
- [x] GSAP lines of code reduced by ≥60% (**zero GSAP in the section**: reveal/title = shared primitives; decorative parallax removed after QA)

## Variants (Branches)
| Variant | Branch | Status |
|---------|--------|--------|
| A - Staggered Reveal on Scroll | `feat/featured-stagger-reveal` | ✅ Implemented (v2: FadeIn reveal + in-flow heading) |
| B - Horizontal Snap Carousel | `feat/featured-horizontal-snap` | ⏳ If A fails impact |
| C - Parallax Layers + Staggered Reveal | `feat/featured-parallax-layers` | ⏳ If A fails impact |
| D - CSS Scroll-Driven Animations | `feat/featured-css-scroll-driven` | ⏳ If A fails impact |
| E - Static Cards + Hover/Tap Expand | `feat/featured-static-expand` | ⏳ If A fails impact |

## QA Findings Round 1 (2026-09-29) → v2 rework
Reported by owner after testing on `:3001`:
1. **Cards looked static** — owner had `prefers-reduced-motion: reduce` ON; the custom GSAP guard forced `opacity: 1` while the heading still animated (inconsistent). Decision: reveal with the shared `FadeIn` primitive so entrances behave exactly like every section title for all users.
2. **Heading overlapped About on desktop** — `PAGE_SPACER_CLASSES["about-projects"]` was `landscape:lg:hidden` (pin-era: the title lived inside panel 1 on lg+) and the new heading added `-mt-12 lg:-mt-16`. Fix: heading moved inside `#proyectos`, wrapper retired to `""`.
3. **Heading faded too early + empty band** — fade trigger `firstPanel top 85%` fired almost immediately; `opacity: 0` kept occupying space; the `sticky` was a no-op (parent = FadeIn wrapper with zero travel + `main overflow-x-hidden` scrollport). Fix: all three removed; heading is standard in-flow `FadeIn delayEnter`.
4. **Next card revealed too early** — triggers fired at the viewport edge. Fix: reveal margin `-40%` (panel top crosses 60% of viewport).
5. **Images "sank" with scroll** — the decorative parallax (`yPercent: 15`, no overscan on a `fill` image) drifted the photo down inside its frame as you scrolled; very noticeable on desktop 2-col vs the static text column. Decision (owner): **remove the parallax** — the section is now GSAP-free.

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

### Task 3: Reveal (v2) with shared `FadeIn` primitive
- [x] Panels render in natural document flow (static layout)
- [x] Each panel wrapped in `<FadeIn viewport={{ once: true, amount: "some", margin: "0px 0px -40% 0px" }}>` — same entrance as titles, fires when the panel top crosses 60% of the viewport
- [x] Deleted the whole custom GSAP reveal (initial `gsap.set` + 4 triggers per panel; `gsap.batch()` does not exist in GSAP 3.14 core — see `d5d8387`)
- [x] Entrance plays for all users per `docs/issues/reduced-motion.md` policy (consistent with every other title)

### Task 4: Optional subtle parallax (decorative only) — REMOVED after QA
- [x] Implemented, then removed on owner decision: in-frame drift without overscan read as the image "sinking" (desktop 2-col showed it hardest); section is now GSAP-free
- [x] `featured-panel-bg` targeting class removed from `featured-project-panel.tsx`

### Task 5: Title behavior (v2) - in-flow like every other section title
- [x] Heading lives inside `#proyectos` (also the `aria-labelledby` target — `sr-only` duplicate removed)
- [x] Standard `<FadeIn delayEnter>` pattern, no sticky, no fade-out trigger, no negative margins (sticky discarded in QA round 1: no sticky travel, overlapped About, faded early, left an empty band)

### Task 6: Update `featured-project-panel.tsx`
- [x] Remove GSAP-dependent classes (absolute positioning, `h-full`, etc.)
- [x] Ensure panels use natural height (removed `min-h-screen`, `landscape:lg:h-full`)
- [x] Keep `FEATURED_GAP` / `FEATURED_GAP_LG` from `lib/rhythm.ts` for internal spacing
- [x] Remove `overlay` prop complexity (heading now a separate in-flow block)
- [x] Added `featured-panel-bg` class for optional parallax targeting

### Task 7: Update `hooks/use-lenis.tsx` - ScrollRestorer
- [x] Remove `PIN_MEDIA` / `FEATURED_STACK_GATE` pin logic
- [x] Remove pin-spacer watchdog (`hasPinSpacer`, `check`, `watch` loops)
- [x] Simplify to: `lenis.resize()` → `lenis.scrollTo(target, { immediate: true })`
- [x] Keep `saveHomeScroll` / `takeHomeScroll` for route handoff

### Task 8: Update `lib/breakpoints.ts`
- [x] `FEATURED_STACK_GATE` deprecated (stub export to avoid breaking stale imports)
- [x] No consumers remain after pin removal

### Task 8b: Restore rhythm for about→featured (v2)
- [x] `lib/rhythm.ts`: `about-projects` wrapper retired (`""` → plain `SectionSpacing` in every regime)
- [x] QA mirror `scripts/rhythm-contract.mjs`: `about-projects` now asserts `spacing±10` in all regimes (heading is inside `#proyectos`, so the measured gap is only the spacer)
- [x] Synced canon: `docs/design/tokens.md`, `docs/design/components.md`, `odd/tasks/orientation-contract.md`, stale comment in `components/section-spacing.tsx`

### Task 8c: Restore rhythm for featured→all-projects (owner QA comment)
- [x] `lib/rhythm.ts`: `projects-all-projects` wrapper retired (`""`) — featured now spacing-consistent on both sides
- [x] QA mirror: uniform `min: spacing` sanity (the measured gap includes the "Todos" heading, which lives outside `#all-projects`); stale `gate/pin` null case removed
- [x] Synced canon: `docs/design/tokens.md`, `docs/design/components.md`, `odd/tasks/orientation-contract.md`; resolved the pending comment in `app/page.tsx`

### Task 8d: Last panel yields bottom padding (owner QA)
- [x] Last panel renders `pt-12 lg:pt-20` instead of `py-12 lg:py-20` (`isLast` prop) — the page-level `SECTION_GAP` owns the exit; no more double spacing (panel pb + spacer)

### Task 9: Verify rhythm compliance (PENDING - manual QA)
- [ ] Visual diff: no overlap About↔title on desktop; section gaps match `lib/rhythm.ts` tokens at 320px, 768px, 1024px, 1440px, 1920px
- [ ] Rhythm audit: dev server on `:3001` → `node scripts/section-spacing.mjs` → **RHYTHM OK**
- [ ] Reveal timing: next card starts appearing only when its top crosses 60% of the viewport (tune `-40%` live if needed)
- [ ] `prefers-reduced-motion` ON: cards + titles fade identically, no parallax in section, layout intact
- [ ] Test: 125% OS scaling, 150% zoom, iPad Pro (1024×1366), ultra-wide (3440×1440), short laptop (1366×768)
- [ ] Lighthouse mobile: CLS=0, TBT<100ms
- [ ] Add 4th project to `data/projects.ts` → verify no animation code changes needed

### Task 10: Commit and evaluate
- [x] Conventional commits for v1: `e059116`, `d5d8387`
- [x] Commits for v2: code + contract mirrors, docs/canon sync, QA debug toggle (see git log)
- [ ] Run evaluation checklist (backlog.md lines 166-187)
- [ ] Record 10s video for visual impact assessment
- [ ] If all criteria pass → merge to main, stop
- [ ] If "impact" < threshold → implement next variant

## Route (ODD)
- All tasks direct **inline** (parent orchestrator): one non-trivial file (`components/featured-projects.tsx`, fully specified by the approved plan) + mechanical single-line/mirror edits; full file context already loaded — delegating would only re-transfer it. Writer trigger NOT fired (1 non-trivial file); mirror/docs edits mechanical.

## Files Touched
- `components/featured-projects.tsx` — main orchestrator (FadeIn reveal + in-flow heading, GSAP-free)
- `components/featured-project-panel.tsx` — panel internals (natural flow, rhythm spacing, `isLast` yields bottom padding)
- `lib/breakpoints.ts` — deprecated `FEATURED_STACK_GATE`
- `hooks/use-lenis.tsx` — simplified ScrollRestorer (no pin watchdog)
- `lib/rhythm.ts` — `about-projects` wrapper retired (`""`)
- `scripts/rhythm-contract.mjs` — QA mirror updated for `about-projects`
- `components/section-spacing.tsx` — stale pin-exception comment removed
- `docs/design/tokens.md`, `docs/design/components.md` — spacer table synced
- `odd/tasks/orientation-contract.md` — contract table synced
- `backlog.md` — Variant A approach + rhythm notes synced
- `data/projects.ts` — no changes
- `data/translations.ts` — no changes

## Acceptance Criteria
All success criteria met + Variant A evaluation checklist ≥ 27/30 weighted score.

## Next Steps
1. Owner QA on `http://localhost:3001` (worktree dev server): overlap, reveal timing `-40%`, reduced-motion ON/OFF
2. `node scripts/section-spacing.mjs` → RHYTHM OK
3. Run evaluation checklist (backlog.md lines 166-187)
4. **Pre-merge: flip `LAYOUT_DEBUG` back to `false` in `app/layout.tsx`** (committed `true` for QA)
5. If all criteria pass → merge `feat/featured-stagger-reveal` to main
6. After merge → unblock navbar CTA separation + active state (see backlog.md Deferred section)
