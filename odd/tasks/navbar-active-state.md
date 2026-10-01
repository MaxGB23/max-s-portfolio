# Feature: Navbar — estado active de sección + alineación CTA mobile (navbar-active-state)

## Objective

Scroll-spy de sección activa en desktop y mobile (underline estático + `aria-current="page"`),
junto con la alineación y separación del CTA de contacto en el menú mobile. **Una sola work
unit**: marker, separación y alineación comparten el eje de 44px y el `rootMargin`.

## Problem

La navbar no indica en qué sección estás (era el único item pendiente del backlog, diferido
hasta merge del refactor de featured — condición YA cumplida: `main` contiene `3c83749` +
`75bf7ed`). Además el CTA mobile rompe el eje de alineación del menú.

## Decisions (aprobadas por el usuario, 2026-09-30)

| # | Decisión | Detalle |
|---|----------|---------|
| D1 | Underline estático en desktop | Estado activo NO reutiliza la transición del hover (`w-0 → group-hover:w-full`). Clase propia con `w-full` permanente + `aria-current="page"` en el `<Link>`. |
| D2 | Alcance del spy | Observa todas las secciones incluida la hero; la hero **limpia** el estado (arriba no hay link activo). Los 4 links participan; `#inicio` no es link del spy. |
| D3 | Marker mobile = mismo underline | Un solo lenguaje visual entre breakpoints; cae dentro del eje 44px sin geometría nueva. Nada de barra lateral ni "solo color". |
| D4 | `rootMargin: -40% 0px -40% 0px` + last-active-wins | Banda centrada 20%. En huecos entre anclas gana el último activo; solo la hero resetea. `IntersectionObserver`, ~50 líneas, sin dependencias, **agnóstico a Lenis** (sin acoplar a su scroll). |
| D5 | Menú mobile: ritmo y targets (**revisado 2026-09-30**) | Links con `py-2.5` (target 44px = Apple HIG, antes ~24px) + `gap-3` (12px ≥ 8dp Material) → ritmo texto-a-texto 56px = **idéntico al `gap-8` histórico** que al usuario. CTA con `mt-7` (12+28 = 40px de separación, antes `gap-6`+`mt-4`). Sin divider. |
| D6 | CTA mobile: `fullWidth` + label **centrado** (**revisado 2026-09-30**) | Se revierte `justify-start pl-5`: el CTA es un *button*, no un item de la lista — el eje 44px es contrato de la lista de links; label centrado = convención de plataforma y distingue la acción de la navegación (mismo criterio que el pill desktop). `fullWidth` se mantiene (práctica estándar de CTA primario móvil). |
| D7 | ~~Hover ≠ active por **fuerza** (patrón Material "reduced state")~~ **SUPERSEDA por D10 (2026-10-01)** | Dos líneas conviviendo (activo 100% + hover con reduced state) no convencieron al usuario tras iteración visual; el código además ya usaba `/60`. Ver D10. |
| D8 | `all-projects` → "Proyectos" (**decisión del usuario**) | `SECTION_ALIAS` en navbar.tsx: dentro de `#all-projects` queda encendido el link Proyectos (misma sección conceptual). `contacto`/`footer` siguen sin link → nada encendido. |
| D9 | Spy: set COMPLETO de intersecciones (**fix iPad portrait, 2026-10-01**) | Los `entries` del IO son deltas por batch: el tie-break local dentro del batch dejaba que la sección siguiente pisara a la anterior durante el aterrizaje **animado** (About corto a 2 cols en md comparte la banda 409..819 con Projects, cuyo top está a ~552 en 768×1024). Fix: mantener el `Set` de intersecting y ganar SIEMPRE por orden documental sobre ese set completo. Corrige también el scroll hacia arriba (simétrico). Rojo→verde con test (e) en `scripts/navbar-active.mjs`. |
| D10 | Underline de **canal único** (**decisión del usuario, 2026-10-01**) | Una sola línea a la vez: activa = «estás aquí», hover = «puedes ir aquí». Al hacer hover en OTRO link el activo **se colapsa** (`w-0`, 200ms) y el hover toma el canal al 100%; hover sobre el propio activo no cambia nada (D1 intacta). Grosor único `h-px` + `bg-purple-accent` 100% en ambas ramas — se retiran el `/60` y el `1.5px`. `aria-current` permanece siempre (accesibilidad). Implementación: estado `hovered` en `navbar.tsx` (se limpia al cerrar el menú mobile, cuyo desmontaje no dispara `mouseleave`). **Retorno SECUENCIAL (mini-fix 2026-10-01)**: al retirar el puntero el hover colapsa (200ms) y el activo espera `delay-[200ms]` y crece en `duration-[400ms]` — handoff secuencial, nunca dos líneas ni rebote rápido (medido en rojo: el activo ya estaba al 96% a los 150ms con la línea hover aún viva). |

## Pendiente (debate abierto — NO implementar aún)

- **Banda del spy anclada al navbar**: cambiar `rootMargin "-40% 0px -40% 0px"` →
  `"-64px 0px -60% 0px"` (zona y64..40%vh; el aterrizaje a top=64 queda dentro por
  construcción). Diagnóstico medido 2026-10-01 en 2560×1440: banda y576..864, About
  aterriza en y64..444 y NO toca la banda (regla: sección enciende solo si
  `h ≥ 0.4·vh − 64` → About ≈380px falla con vh > ~1110), Projects (top 572) gana.
  Conservaría D9/D2/D4. **El usuario pospuso el fix** hasta debatir tamaños de
  secciones y espaciados, que pueden cambiar el diagnóstico. Al implementar:
  tests (b)/(c5) pasan de `centerOn` a *landOn* y se añade test (f) 2560×1440.

## Scope

- `hooks/use-active-section.ts` (nuevo) — IO scroll-spy, sin dependencias.
- `components/navbar.tsx` — consumir en desktop **y** mobile (no mobile-only); separación y
  alineación del CTA mobile.
- Canon: `docs/design/components.md` (nav) + `docs/design/buttons.md` (CTA mobile fullWidth
  alineado al eje) + `backlog.md` (item Deferred → hecho).
- `odd/tasks/language-switcher.md` — limar checkboxes stale de WU2 (deuda mecánica, de paso).

## Out of scope

- `RHYTHM FAIL [4]` card→card (deuda pre-existente, ver `contact-ring-spacing.md` T7).
- Auditoría de viewports: ya ejecutada, 9/9 pares de sección OK con el split mitad/mitad.
- Merge a main / optimización de imágenes / Vercel QA.

## Constraints

- No romper el contrato de alineación: links mobile = `px-6 (24) + pl-5 (20)` = **44px**, igual
  que el texto del logo. El marker vive dentro de ese eje (`backlog.md` L258-269).
- Textos visibles por `t()` en `data/translations.ts` (no aplica: sin texto nuevo, `aria-current`
  no se traduce).
- Hooks sin dependencias nuevas; el spy no se acopla a Lenis.
- Un solo worktree: `feat/recede-fade`. Preguntar antes de commitear.

## Tasks

- [x] T1 `hooks/use-active-section.ts` — IO con `rootMargin -40% 0 -40% 0`, devuelve `activeId`;
      hero (`#inicio`) limpia; huecos → last-active-wins; cleanup al desmontar.
- [x] T2 Desktop: consumir en la lista de links (`navbaar` nav:flex) — `aria-current` +
      underline estático propio (transición separada de la del hover).
- [x] T3 Mobile: consumir en el menú — mismo underline, mismo estado.
- [x] T4 Menú mobile: `gap-8` → `gap-6` + `mt-4` en el CTA; CTA `justify-start pl-5`
      (mantener `fullWidth`).
- [x] T5 Verificación: `pnpm exec tsc --noEmit` PASS · `node scripts/section-spacing.mjs`
      (mismos 4 fails pre-existentes, nada nuevo) · Playwright en `:3001`: underline activo
      sigue el scroll en desktop 1280, limpieza en hero, geometría mobile 390/768 (eje 44px,
      gap del CTA) con el menú abierto.
- [x] T6 Canon + backlog: `components.md`, `buttons.md`, `backlog.md` (Deferred → hecho),
      checkboxes stale de `language-switcher.md`.
- [x] T7 Fix regresión iPad portrait 768×1024 (bug reportado 2026-10-01): tap en "About"
      encendía "Projects" — batches sucesivos del IO pisaban el tie-break local (D9).
      Set completo de intersecciones en `use-active-section.ts` + test (e) de aterrizaje
      animado en `scripts/navbar-active.mjs` (rojo→verde). Verificado: `tsc` exit 0 ·
      `NAVBAR-ACTIVE OK` (48 aserciones) · ritmo solo con los 4 fails pre-existentes.
- [x] T8 Underline de canal único (D10): estado `hovered` + `underlineClass(active, own)`
      en `navbar.tsx` (activo colapsa al hover de OTRO link, se restaura al retirar el
      puntero, reset al cerrar el menú mobile), handlers en desktop y mobile; QA (d)
      reescrito (rojo→verde: las 3 aserciones nuevas). Verificado: `tsc` exit 0 ·
      `NAVBAR-ACTIVE OK`. El QA acepta `BASE_URL` (el dev server del worktree corre
      en :3000).

## Acceptance criteria

1. Al scrollear, solo UN link tiene `aria-current="page"` y underline estático; en la hero,
   ninguno.
2. El hover sobre un link activo no parpadea ni pisa el estado.
3. En mobile (<830px) el marker cae en el mismo eje de 44px que los links y el logo.
4. CTA mobile: label arranca en 44px, `fullWidth` intacto, 40px de separación vs 24px entre links.
5. El spy funciona igual con Lenis (desktop) y scroll nativo (mobile) — sin acoplamiento.
6. `tsc` PASS; auditoría sin fallos nuevos.
7. Aterrizar vía tap en una sección enciende ESA sección aunque otra comparta la banda
   (regresión iPad portrait 768×1024 — test (e) del QA).
8. Hover sobre un link inactivo muestra UNA sola línea (el activo se colapsa y se
   restaura al salir); `aria-current` persiste en el activo; grosor `h-px` unificado
   en ambas ramas (D10 — test (d) del QA).

## Applicable checks

- `pnpm exec tsc --noEmit`
- `node scripts/section-spacing.mjs` (dev en `:3001`)
- `node scripts/navbar-active.mjs` (desktop + mobile 390 + tablet 768×1024)
- Playwright medición en vivo (scripts existentes o inline)

## Route

ODD — directo/delegado, sin SDD.

## Delivery strategy

`ask-on-risk` (default). Forecast: ~150-200 líneas cambiadas → por debajo de 400, PR único.
