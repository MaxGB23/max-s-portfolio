# Feature: Contrato de ritmo por orientación (orientation-contract)

## Objective
Convertir los condicionales WIP de `app/page.tsx` (referencia `352ab13`) en un **contrato de ritmo por orientación de una sola fuente**: qué spacer se renderiza entre cada par de secciones y qué gap se espera por régimen (portrait/landscape, lg, alturas umbral). Elimina el whack-a-mole: el mapa vive en `lib/rhythm.ts`, la página solo consume tokens, y el audit valida contra el mismo contrato (ya no reporta "8 desviaciones" — las declara).

## Problem
`352ab13` envuelve los `SectionSpacing` de la página en condicionales inline (`portrait:md:hidden`, `landscape:lg:hidden` + media arbitraria) escritos a mano. El audit `scripts/section-spacing.mjs` sigue asertando el contrato clásico (96/128 fijos) → RHYTHM FAIL [8] permanente, y las excepciones no tienen una fuente única: cambiarlas requiere tocar page.tsx + audit + docs, con riesgo de desincronización.

## Why
- El propietario ACEPTÓ el estado `352ab13` (cada régimen resuelve su layout; la última variante ordenada gana).
- El audiv debe poder volver a verde declarando qué es correcto por régimen, no reportando desviaciones.
- Una fuente única (clases + contrato QA) evita que el próximocambio de ritmo vuelva a ser whack-a-mole.

## Scope
- `lib/rhythm.ts`: + tipo `PageSpacerPair` + mapa `PAGE_SPACER_CLASSES` (clase del wrapper condicional por par; `""` = sin condicional).
- NUEVO `components/page-spacing.tsx`: componente `PageSpacing({ pair })` que renderiza el wrapper condicional + `SectionSpacing` (sin condicional → `SectionSpacing` a pelo).
- `app/page.tsx`: sustituir los `<div className="...">` inline por `<PageSpacing pair="..." />` (6 pares).
- NUEVO `scripts/rhythm-contract.mjs`: contrato QA puro (sin playwright) — `expectedGap(pair, viewport)` con la tabla por régimen; `regime(vp)` replica Tailwind v4 (portrait = width < height; lg = width ≥ 1024; umbrales 768/767).
- `scripts/section-spacing.mjs`: importar `expectedGap`; eliminar `RHYTHM`/`rhythmExpectations` inline.
- `docs/design/components.md`: documentar el contrato final (reemplaza el warning WIP), nueva fila de `PageSpacing`.
- NO tocar: valores de las clases del wrapper (semántica byte-igual que `352ab13`), `SectionSpacing`, featured panel, gate GSAP.

## Constraints
- Tailwind v4; las cadenas de variantes del mapa DEBEN ser exactamente las del estado actual de `page.tsx` (los media arbitrarios ganan por orden de CSS — "la última variante ordenada resuelve bien").
- El wrapper solo decide `display`; `SectionSpacing` sigue `aria-hidden` e idéntico.
- Verificación: `npx tsc --noEmit` limpio; audit en server B `:3001` → esperado **RHYTHM OK** en los 8 viewports (con excepciones declaradas por régimen).

## Contract table (QA mirror — fuente: scripts/rhythm-contract.mjs)

`spacing = 96 (width<768) | 128 (≥768)`, `tol = 10`. Rangos: `[min..max]`; `null` = sin asertar.

| Par | Régimen | Esperado |
|-----|---------|----------|
| hero-about | portrait width ≥768 | `0..10` (wrapper `portrait:md:hidden`) |
| hero-about | resto (landscape / mobile) | `≥ spacing` (excepción Hero: sanity, nunca exacto) |
| about-projects | landscape lg AND height >768 | `0..10` (`landscape:lg:hidden`) |
| about-projects | landscape lg AND height ≤768 | `spacing±10` (`...[@media(max-height:768px)]:block`) |
| about-projects | portrait lg (≥1024) | `spacing±10` (heading mobile oculto en lg+ → exacto) |
| about-projects | resto (<lg: portrait tablets, mobile, landscape <lg) | `≥ spacing` (heading visible suma altura → sanity) |
| projects-all-projects | gate GSAP (landscape ≥1024×768) | `null` (el pin es dueño de su altura) |
| projects-all-projects | portrait lg | `≥ 96` (wrapper oculto; manda mb-24 del panel = 96) |
| projects-all-projects | landscape lg AND height ≤767 | `≥ spacing` (sanity: spacer 128 + heading "Todos" fluido fuera de `#all-projects`; `last:mb-0` → la última card ya NO empuja) |
| projects-all-projects | resto (<lg) | `≥ spacing` |
| all-projects-pricing / pricing-contact / contact-footer | todos | `spacing±10` |
| featured-card-card | gate GSAP (landscape ≥1024×768) | `null` (el pin es dueño de su altura) |
| featured-card-card | portrait lg | `96±10` (`portrait:lg:mb-24` en el `article`) |
| featured-card-card | landscape lg AND height ≤767 | `96±10` (nuevo: `landscape:lg:[@media(max-height:767px)]:mb-24`) |
| featured-card-card | resto (mobile, tablets portrait, landscape <lg) | `null` (sin mb por diseño; validado en vivo) |

## Tasks
- [x] T1: `lib/rhythm.ts` — `PageSpacerPair` + `PAGE_SPACER_CLASSES`; nuevo `components/page-spacing.tsx`
- [x] T2: `app/page.tsx` consume `PageSpacing` (6 pares)
- [x] T3: nuevo `scripts/rhythm-contract.mjs` + `scripts/section-spacing.mjs` importa contrato
- [x] T4: `docs/design/components.md` — contrato por régimen en sitio del warning WIP + fila `PageSpacing`
- [x] T5: verificación final (tsc + audit RHYTHM OK en :3001)
- [x] T6: **Nuevo régimen card→card** (observación del propietario): landscape lg con height ≤767 actualmente 0 separación entre panels (gate OFF, `portrait:lg:mb-24` no aplica) — añadir `landscape:lg:[@media(max-height:767px)]:mb-24` en el `article` de `featured-project-panel.tsx`
- [x] T7: contrato + audit — par `featured-card-card` en `scripts/rhythm-contract.mjs` (tabla arriba) y medición de gaps entre `#proyectos article.featured-panel` consecutivos en `scripts/section-spacing.mjs`
- [x] T8: docs (`components.md`) — fila Card → card y tabla del contrato con el nuevo régimen (y fila `PageSpacing` si falta)

## Acceptance criteria
- `app/page.tsx` sin clases de wrapper inline (todo vía `PageSpacing`).
- `scripts/section-spacing.mjs` sin literales de contrato (todo en `rhythm-contract.mjs`).
- Audit en verde con las excepciones declaradas (RHYTHM OK en 8 viewports).
- Docs describen el contrato final (tabla por régimen) y referencian `rhythm-contract.mjs`.
- Comportamiento visual IDÉNTICO a `352ab13` (clases byte-iguales, solo reubicadas).

## Applicable checks
- `npx tsc --noEmit` (TSC_EXIT=0)
- `node scripts/section-spacing.mjs` (server B :3001) — RHYTHM OK

## Route
- Delegated direct (1 writer) — 3+ archivos de código + docs, aplica Writer trigger.

## Progress
- [x] T1 … (hecho) — `PageSpacerPair` + `PAGE_SPACER_CLASSES` en `lib/rhythm.ts`; `components/page-spacing.tsx` nuevo (wrapper condicional + `SectionSpacing`)
- [x] T2 … (hecho) — `app/page.tsx` consume `PageSpacing` (6 pares); sin wrappers inline ni `SectionSpacing` a pelo
- [x] T3 … (hecho) — `scripts/rhythm-contract.mjs` (contrato QA puro sin playwright) + `section-spacing.mjs` importa `expectedGap`; FAIL/OK y exit-code preservados
- [x] T4 … (hecho) — `docs/design/components.md`: contrato final por régimen (tabla por par), fila `PageSpacing`, warning WIP eliminado
- [x] T5 … (hecho) — verificación final del padré: `npx tsc --noEmit` TSC_EXIT=0 (parent spot check) + `node scripts/section-spacing.mjs` RHYTHM OK exit 0 (audit contra server :3001 propio del worktree); commit `eff976b`
- [x] T6 … (hecho) — `landscape:lg:[@media(max-height:767px)]:mb-24` añadido al `article` de `featured-project-panel.tsx` justo tras `portrait:lg:mb-24` (espejo del régimen `projects-all-projects` de `lib/rhythm.ts`); landscape lg corto → 96px entre cards
- [x] T7 … (hecho) — par `featured-card-card` en `scripts/rhythm-contract.mjs` (gate null · portrait lg 96±10 · landscape lg ≤767 96±10 · resto null, añadido antes del `default` sin tocar el fall-through de `all-projects-pricing`/`pricing-contact`/`contact-footer`) + `scripts/section-spacing.mjs` mide y aserta gaps entre `#proyectos article.featured-panel` (labels Card 1→2, Card 2→3; solo con ≥2 cards; mismo formato FAIL)
- [x] T8 … (hecho) — `docs/design/components.md`: fila Card → card actualizada (96px portrait lg · 96px landscape lg corto ≤767px · 0 dentro del gate) + tabla `Par | Régimen | Esperado` con las 4 filas `featured-card-card` junto al contrato de página y la sección featured
- [x] **Cobertura nueva (spot check del padre)**: viewport `landscape corto 1280×700` añadido a `scripts/section-spacing.mjs` (el escenario exacto del propietario) → **destapó** que el contrato `projects-all-projects` landscape lg ≤767 era erróneo: medición 318px = card mb 96 + spacer 128 + heading "Todos" ~94 (fuera de `#all-projects`). Corregido a sanity `≥ spacing+96−tol` en `rhythm-contract.mjs` + fila de tabla arriba; cards `featured-card-card` miden 96±10 ✓ en ese viewport. Audit a re-verificar.
- [x] **Corrección del propietario (last:mb-0)**: el mb-24 de la ÚLTIMA card inflaba featured→all (318 = 96+128+94). Añadido `landscape:lg:[@media(max-height:768px)]:last:mb-0` en `featured-project-panel.tsx` → última card `mb:0`; featured→all ahora **221.8px** (spacer 128 + heading ~94, ritmo limpio); cards siguen a 96/96. Contrato `projects-all-projects` landscape lg ≤767 → `{ min: spacing }` (sanity, sin el fudge +96).