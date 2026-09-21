# Feature: Section shell + rhythm tokens

## Objective
Eliminar la repetición del contenedor de sección (`px-6 md:px-12` + `max-w-7xl` + `debug-l*`) con un componente shell de una sola fuente, y exponer los valores de ritmo como tokens tipados. Estrategia anti-whack-a-mole, capas 1 y 2.

## Problem
Cada sección top-level repite a mano el mismo patrón de inset/max-width con variaciones sutiles (`px-6`, `md:px-12`, `px-6 md:px-12`, anidados `max-w-7xl mx-auto`). Un cambio de inset requiere tocar N archivos y las divergencias se acumulan. El ritmo vertical vive en `section-spacing.tsx` con clases tal cual (`h-24 md:h-32`) sin tokens.

## Why
Consistencia estructural: 1 contenedor = 1 decisión. Si mañana el diseño quiere `px-8 lg:px-16`, se cambia en un solo lugar.

## Scope
- Nuevo `components/section.tsx` — shell que posee el inset horizontal y opcionalmente el inner `max-w-7xl`.
- Refactor de secciones top-level para usarlo: `about-section.tsx`, `pricing-section.tsx`, `contact-section.tsx`, `all-projects.tsx`, y el bloque heading mobile de `featured-projects.tsx`.
- **Excepción verificada**: el `<section id="proyectos" class="featured-section">` (pin GSAP) es full-bleed INTENCIONAL (100vw del pin). NO debe recibir inset del shell. El shell aplica solo al heading mobile que lo precede.
- Nuevo `lib/rhythm.ts` — tokens de ritmo (gap entre secciones 96/128px; gap heading↔card featured 48/120px) consumidos por `section-spacing.tsx` y documentados.
- NO tocar IDs (`#proyectos`, `#all-projects`, `#all-projects-heading`), `aria-labelledby`, ni el comportamiento GSAP.
- NO cambiar valores de espaciado — solo centralizar los existentes.

## Constraints
- TS/JSX, Tailwind v4; imports con alias `@/components/...`.
- Shell debe aceptar `as` (`section`/`div`), `id`, `aria-labelledby`, `className` extra, e inner container opcional; clases debug `debug-l1`/`debug-l2` preservadas (QA) — verificar dónde vive cada nivel actual.
- FeaturedProjects: el pin full-bleed no puede heredar inset.
- Verificación: `npx tsc --noEmit` limpio; `git status` sin sorpresas.

## Tasks
- [ ] T1: Crear `components/section.tsx` con el shell (inset + inner opcional + props)
- [ ] T2: Crear `lib/rhythm.ts` con tokens (SECTION_GAP, FEATURED_GAP) y consumirlos en `section-spacing.tsx`
- [ ] T3: Refactor `about-section.tsx`, `pricing-section.tsx`, `contact-section.tsx`, `all-projects.tsx` y heading mobile de `featured-projects.tsx` al shell
- [ ] T4: Actualizar docs (`docs/design/components.md` — añadir Section a la tabla; sección de tokens en ritmo vertical)

## Acceptance criteria
- Cero repeticiones de `px-6 md:px-12` + `max-w-7xl` fuera del shell en secciones top-level (`section-spacing.tsx` y `hero-section.tsx` pueden conservar excepciones documentadas).
- El pin featured sigue full-bleed en landscape.
- `tsc` limpio; IDs/aria intactos; sin cambios visuales (mismas clases resultantes).

## Applicable checks
- `npx tsc --noEmit` (TSC_EXIT=0)
- `git diff --stat` para confirmar el alcance (no tocar hero, navbar, footer, panels)

## Route
- Delegated direct (1 writer) — 4+ archivos, aplica Writer trigger.

## Delivery strategy
- `ask-on-risk` (default); forecast ≈ 150-250 líneas → bajo 400, sin cadena.

## Progress
- [x] T1: Crear `components/section.tsx` con el shell (inset + inner opcional + props) — done, API: `as`, `ref`, `id`, `aria-label/labelledby`, `className`, `insetClassName` (reemplaza), `debug` (default/inverted/none), `container`, `innerId`, `innerClassName`; twMerge ya era dependencia existente
- [x] T2: Crear `lib/rhythm.ts` con tokens y consumirlos en `section-spacing.tsx` — done: `SECTION_GAP = "h-24 md:h-32"`; `FEATURED_GAP`/`FEATURED_GAP_LG` exportados como referencia canónica; **cableados** en featured-project-panel desde `748c17e` (className `${FEATURED_GAP} ${FEATURED_GAP_LG}`)
- [x] T3: Refactor de secciones al shell — done: about, pricing, contact, all-projects (heading + grid), heading mobile de featured; pin `#proyectos` full-bleed intacto (verificado byte-identical)
- [x] T4: Docs actualizadas (`docs/design/components.md` — tabla + sección shell + ritmo cita lib/rhythm.ts)

Verificación: `npx tsc --noEmit` TSC_EXIT=0 (parent spot check + verifier); verificación independiente PASS (clases equivalentes, scope contenido, IDs/aria intactos, sin dependencias nuevas). Caveat informativo: contact-section gana un wrapper div plano (sin cambio visual).

**Desvío WIP (referencia `352ab13`, cambios del propietario en vivo)**: la página envuelve los `SectionSpacing` en condicionales de orientación (Hero→About `portrait:md:hidden`; About→Projects `landscape:lg:hidden` + bloque ≤768px; Projects→AllProjects oculto en lg salvo landscape corto). El audit `scripts/section-spacing.mjs` cae a 8 desviaciones frente al contrato clásico — desviaciones aceptadas en vivo. Backlog: cerrar contrato por orientación (`rhythm/orientation-contract`, obs engram 824) y sincronizar al audit.