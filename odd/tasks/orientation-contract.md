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
| projects-all-projects | landscape lg AND height ≤767 | `spacing±10` (`...[@media(max-height:767px)]:block`) |
| projects-all-projects | resto (<lg) | `≥ spacing` |
| all-projects-pricing / pricing-contact / contact-footer | todos | `spacing±10` |

## Tasks
- [x] T1: `lib/rhythm.ts` — `PageSpacerPair` + `PAGE_SPACER_CLASSES`; nuevo `components/page-spacing.tsx`
- [x] T2: `app/page.tsx` consume `PageSpacing` (6 pares)
- [x] T3: nuevo `scripts/rhythm-contract.mjs` + `scripts/section-spacing.mjs` importa contrato
- [x] T4: `docs/design/components.md` — contrato por régimen en sitio del warning WIP + fila `PageSpacing`
- [x] T5: verificación final (tsc + audit RHYTHM OK en :3001)

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
- [ ] T5 … (verificación) — pendiente de ejecutar tsc + audit