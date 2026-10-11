# Feature: contact-ring-spacing

**Branch:** `feat/recede-fade` (worktree `M:\worktrees\maxgb23-portfolio\recede-fade`)
**Route:** delegated direct (writer trigger: 4+ files) · **Created:** 2026-09-30

## Objective

El arrival-cue de `#contacto` (ring + wash de `globals.css`) se dibuja en el borde de
la caja de la sección, pero la sección no tiene padding vertical: el ritmo vertical
lo ponen los `PageSpacing` de página. Resultado: el ring queda pegado al contenido
arriba/abajo y con aire a los lados (`px-6`).

Mover el spacing de página **dentro** de `#contacto` como padding para que el ring
encienda aire, sin cambiar el ritmo visual total.

## Why

- Cue de llegada (navbar/pricing → `#contacto`) debe autoidentificar la sección:
  un ring pegado al contenido se lee como borde del contenido, no de la sección.
- Es la única sección con cue visual: la excepción de padding es deliberada.

## Scope

- IN: token vertical, padding en contacto, limpieza de pares en `page.tsx`/`rhythm.ts`,
  QA mirror (contrato + auditoría), compensación de scroll landing, sync del canon.
- OUT (WU2): CV en la sección contacto. OUT: cambios en el resto de secciones.

## Constraints

- Ritmo visual total intacto: 96px mobile / 128px ≥768px entre Pricing↔Contacto
  y Contacto↔Footer (mismos valores que `SECTION_GAP`).
- Valores SIEMPRE tokenizados en `lib/rhythm.ts`, nunca hardcodeados.
- Landmark `#contacto` y su `id` no se mueven.
- Espejo QA (`scripts/rhythm-contract.mjs`, `scripts/section-spacing.mjs`) sigue en verde.

## Tasks

### WU1 — contact owns its vertical spacing
- [x] T1 `lib/rhythm.ts`: nuevo token `SECTION_GAP_Y` (espejo vertical de `SECTION_GAP`);
      eliminar pares `pricing-contact` / `contact-footer` de `PageSpacerPair` + `PAGE_SPACER_CLASSES`.
- [x] T2 `app/page.tsx`: quitar los dos `PageSpacing` eliminados.
- [x] T3 `components/contact-section.tsx`: aplicar `SECTION_GAP_Y` al `Section` externo (`#contacto`).
- [x] T4 `scripts/section-spacing.mjs`: `assertRhythm` mide **blanco visual**
      (con padding) para los dos pares de contacto; resto de pares byte-idéntico.
      `scripts/rhythm-contract.mjs`: actualizar comentario (el gap lo aporta el
      padding de la sección, la aserción no cambia).
- [x] T5 `hooks/use-lenis.tsx`: `scrollToAnchor` compensa el `padding-top` del
      target para que el aterrizaje siga siendo "contenido bajo el navbar".
      Ruta tomada: **generalizada** — verificación de consumidores: todos los
      anchors (`#sobre-mi`, `#proyectos`, `#precios`) tienen `padding-top: 0`,
      así que la compensación es no-op para ellos.
- [x] T6 Canon `docs/design`: `tokens.md` + `components.md` — token nuevo, la
      excepción "contact es dueño de su spacing vertical", pares 6 → 4.
- [x] T7 Verificación: `pnpm exec tsc --noEmit` → PASS · auditoría
      `scripts/section-spacing.mjs` → los 4 pares de contacto OK en los 9
      viewports (blanco total Pricing→Contacto 96/128px, idéntico al previo).
      **Deuda pre-existente detectada (NO de esta WU)**: `RHYTHM FAIL [4]`
      card→card en iPad Pro portrait 1024 y landscape 1280x700 — verificada
      con stash sobre la base de la rama: falla igual SIN este cambio.

### WU1b — el cue se pinta en el contenedor interno (panel, no full-bleed)
Aprobada por el usuario ("aplicalo rapidamente") tras revisar WU1: con el
padding en el shell, el ring seguía siendo un rectángulo full-bleed del ancho
del viewport (aire vertical sí, aéreo a los lados no).

- [x] `components/contact-section.tsx`: `SECTION_GAP_Y` pasa de `className`
      (shell) a `innerClassName` (junto a `max-w-6xl`); nuevo
      `innerId="contact-content"`. El shell queda sin padding.
- [x] `app/globals.css`: `#contacto.arrive` → `#contacto.arrive #contact-content`
      (bloque normal + bloque `prefers-reduced-motion`) y comentario actualizado.
- [x] `hooks/use-lenis.tsx`: compensación de aterrizaje a **regla de 2 niveles**
      (`shell paddingTop + firstElementChild paddingTop`). Verificación de
      consumidores: los otros 3 anchors (`#sobre-mi`, `#proyectos`, `#precios`)
      tienen `padding-top: 0` en ambos niveles → sigue siendo no-op.
- [x] `scripts/section-spacing.mjs`: `contentPadTop/contentPadBottom` (misma
      regla de 2 niveles) usados por `assertRhythm` y por el log de blanco
      visual; comentario del par actualizado.
- [x] Canon: `docs/design/tokens.md`, `docs/design/components.md`,
      `docs/ideas-features/arrival-cue.md`, espejo `docs/design/tailwind-v4-theme.css`.
- [x] Verificación observada (ver Checks): tsc PASS · auditoría idéntica al
      baseline de WU1 · Playwright desktop/mobile/reduced.

### WU2 — CV en contacto (hecha)
- [x] Botón `outline glow lg` con icono `Download` en la CTA row, **antes de
      GitHub** (orden por prioridad: contacto > evidencia).
- [x] i18n: `section.contact.ctaCv` ES "Descargar CV" / EN "Download Resume",
      `ctaCvShort` ES "CV" / EN "Resume" (variante corta <sm, truco de
      `copy.emailShort`). `hero.cta.cv` EN pasó a "Download Resume" para no
      contradecir contacto.
- [x] PDF por idioma: `data/cv.ts` con `cvHref(lang)` — fuente única para hero
      y contacto. Hoy ES y EN apuntan al mismo PDF EN (no existe versión ES;
      el dueño la añadirá después).
- [x] Layout CTA row: `md:flex-row` → **`lg:flex-row`** (los 5 no caben desde
      `md`); por debajo se apila en bloques de 2 columnas — grupos
      [Escríbeme + copiar correo] y **[CV + GitHub]**.
- [x] Canon: `docs/design/buttons.md` (filas + orden) y
      `docs/design/components.md` (CTA row 216+, hero CTA 122+).

## Acceptance criteria

- Ring/wash de `#contacto` encierra ≥96px (mobile) / ≥128px (≥768px) arriba y abajo.
- El ring es un **panel `max-w-6xl` centrado**, no un rectángulo full-bleed
  (aire horizontal a ambos lados en ≥1152px de ancho).
- Distancia visual Pricing→Contacto y Contacto→Footer = 96/128px (sin cambios).
- Clic en Contacto (navbar + pricing) aterriza con badge/título justo bajo el navbar.
- `node scripts/section-spacing.mjs` → pares OK en los 9 viewports (la deuda
  card→card pre-existente queda fuera del alcance, ver T7).

## Checks / evidence

- `pnpm exec tsc --noEmit` → PASS (WU globe `63aff8e`, WU1 completa, y WU1b).
- `node scripts/section-spacing.mjs` (dev `:3001`, 9 viewports) → idéntico al
  baseline de WU1: Pricing→Contacto 96/128px, Contacto→Footer 160/192px en
  todos; `RHYTHM FAIL [4]` son los card→card pre-existentes (ver T7).
- Landing verificado con Playwright (desktop 1280 + mobile 390): el contenido
  de `#contacto` aterriza a 64px (mobile) / 85px (desktop) del top — desktop va
  21px corto porque Lenis clampa en `maxScroll` (fin de documento), no por el
  offset. Antes del cambio el contenido aterrizaba a 192px. **Idéntico antes y
  después de WU1b** (misma regla de 2 niveles).
- Geometría del cue medida en vivo: desktop → `#contact-content` ancho 1152px,
  left 64px (panel centrado; shell 1280px); mobile 390 → inner 342px, left 24px
  (`px-6`). `animationName: contact-arrive` sobre el inner.
- `prefers-reduced-motion: reduce` emulado → `animationName: none` y wash 0.1 +
  ring 2px 0.35 **sobre el inner** (el bloque reducido matchea el selector nuevo).
- Sync de canon: T6 (WU1) + WU1b (`tokens.md`, `components.md`,
  `arrival-cue.md`, espejo `tailwind-v4-theme.css`).
- WU2 — layout de la CTA row medido con Playwright: 390px → 3 bloques
  (LinkedIn / Escríbeme+Correo / CV+GitHub, cortos `CV` y `Correo`); 768px →
  sigue en 3 bloques (no en 1); **1024px → 1 sola fila** con los 5 (ancho total
  68..956, cabe); 390px con cookie `lang=en` → label "Resume". `tsc` PASS.

## Deuda detectada

- ~~Wash del cue 12% en código vs 5% en el espejo~~ → **RESUELTO** en `4ea4a64`
  (espejo `tailwind-v4-theme.css` llevado a 12%; el usuario confirmó que 12% es
  el valor bueno).
- Pre-existente y fuera de alcance: `RHYTHM FAIL [4]` card→card (ver T7).

## Progress

- [x] Diagnóstico confirmado en código (ring = `box-shadow: inset` en `#contacto`).
- [x] WU1 + WU1b — commit `4ea4a64 feat(contact): split vertical rhythm and
      paint arrival cue on inner panel` (14 archivos).
- [x] Regla de dev servers en `AGENTS.md` — commit `0d6a0ab`.
- [x] WU2 (CV en contacto) implementada, tsc PASS — pendiente de commit.
- [ ] Auditoría de 9 viewports con el split mitad/mitad (pedido ir por la
      visual primero; correr con server transitorio antes del merge).
