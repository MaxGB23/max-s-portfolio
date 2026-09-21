# Feature: Restructure design docs into multi-file token canon (design-docs-restructure)

## Objective
Reestructurar `docs/design/` al formato design.md *spirit* (tablas token, geometría de componentes, elevación, responsive, iteration guide) en multi-archivo, conservando la razón/historia que nos diferencia. Decisión del propietario: multi-archivo (lectura perezosa por tema, menos ruido de contexto para agents) + snapshot de los docs actuales como histórico no-canónico ANTES de reescribir (no perder data en refactor).

## Problem
El canon actual tiene el alma (razón, historia, deuda) pero no el esqueleto consumible: no hay tablas completas token→valor→rol, geometría de componentes, elevación explícita, ni iteration guide. Los ejemplos (bugatti/framer) tienen el esqueleto pero para otro sitio. Un agente entiende la filosofía en nuestro README pero debe abrir `globals.css` para saber valores exactos.

## Why
- Decisión del propietario (2026-09-21): los ejemplos son superiores en forma, nosotros en pensamiento — fusionar: adoptar estructura design.md sin perder historia/razón.
- Multi-archivo: cada tema se lee solo cuando hace falta, economiza tokens de contexto de agents/devs.
- No perder data: snapshot congelado + inventario de migración auditable antes de reescribir.

## Scope
- NUEVO `docs/design/tokens.md` — tablas token→valor→rol (color, tipografía, spacing, radius, elevación).
- NUEVO `docs/design/tailwind-v4-theme.css` — espejo REAL extraído de `app/globals.css` (no el de ejemplos).
- `docs/design/typography-families.md` — convertir al formato token table, conservando historia/razón como callouts.
- `docs/design/components.md` — mantener + geometría por componente.
- `docs/design/buttons.md` — mantener, alinear al formato de geometría.
- `docs/design/pointer-gestures.md` — mantener (no requiere reestructura si ya es tema puro).
- NUEVO `docs/design/iteration-guide.md` — proceso de decisión para agents.
- NUEVO `docs/design/archive/2026-09-21-pre-designmd/` — snapshot byte-igual de los 5 canon files actuales, marca no-canónica.
- `docs/design/README.md` — actualizar índice con los nuevos archivos + vínculo al snapshot histórico + marcar ejemplos como referencia externa.
- NO tocar: `ejemplos/` contenido, `app/globals.css` (solo leer), componentes, `ideas-features/`.

## Snapshot & migración (checklist — fuente: archive/2026-09-21-pre-designmd/)
Antes de reescribir, inventariar CADA pieza de razón/deuda/historia de los 5 canon files actuales y confirmar que aterriza en su nuevo archivo:
- [x] T1: snapshot byte-igual de los 5 canon files en `archive/2026-09-21-pre-designmd/` + cabecera no-canónica
- [x] T2: inventario de migración — listar piezas de razón/deuda/historia por archivo actual y destino (obs engram #851)
- [x] T3: `tokens.md` + `tailwind-v4-theme.css` espejo real desde `globals.css`
- [x] T4: `typography-families.md` → formato token table (historia como callouts)
- [x] T5: `components.md` + `buttons.md` → geometría por componente
- [x] T6: sección Elevación + Responsive (donde vivan hoy, sin inventar)
- [x] T7: `iteration-guide.md` (extraído de excepciones cerradas + do/don'ts + flujo serif/sans/mono)
- [x] T8: `README.md` → índice nuevo + snapshot link + ejemplos marcados no-canon
- [x] T9: verificación (tablas referenciadas existen en código; solo docs → sin build) — PASS: 7 archivos en árbol, espejo valores == globals.css, ref corregida, ContactSection VIVO documentado, 13 tokens completos; typo fixed

## Mapa de migración (T2 — VERIFICADO contra código, 2026-09-21)
Resumen de destinos; el detalle completo (47 razones / 13 deudas / 20 gotchas) vive en engram #851 y en el informe del worker.
- `tokens.md`: identidad (dark-first, acento único morado), tabla de 13 tokens `text-fluid-*` COMPLETA (incluye `card-title`/`card-desc` — README §5 los omitía), colores shadcn + custom + sidebars (nota: si-deuda), `--radius` + derivados, scrollbar, elevación (~NO hay tokens `--shadow-*`; documentar patrones reales: `shadow-purple-accent/60` opt-in de Button, `shadow-md` hero, `hover:shadow-lg shadow-black/8` cards, `shadow-2xl ring-1 ring-black/5` featured-panel).
- `tailwind-v4-theme.css` (NUEVO, espejo REAL de `app/globals.css`): todo el bloque `@theme inline` + preservar duplicación `.dark` directa de `--color-purple-accent`/`--color-nav` (NO "normalizar" — E10) + `@source not "../docs"` (E1/E3) + `overflow-x: clip` razón explícita (E4/G4) + `section[id] scroll-margin-top: 5rem`.
- `typography-families.md` → token table: las 11 razones de escalera (historial 2026-09-14/17, price < section medido, fallback alto ELIMINADO, régimen altura hero) como CALLOUTS; 2 escalas (editorial fluid / UI estática), botones NUNCA fluidos; `content` 3 niveles + contrastes 9.2:1/10.0:1; pulsador `ch`; padding horizontal por sección; deudas: Geist Mono sin next/font (layout.tsx — NO tocar), chart-1..5 sin definición.
- `components.md`: tabla por componente REVERIFICADA (añadir ContactSection VIVO — estaba ausente; E4), geometría por componente; contrato de ritmo (`lib/rhythm.ts` + espejo `scripts/rhythm-contract.mjs`), `FEATURED_STACK_GATE` única fuente, excepciones Featured/Hero/Volver, Lenis desktop-only, handoff scroll + ScrollRestorer + watchdog, Aurora (MutationObserver), DarkModeToggle desmontado, cue `arrive`, `cn()`/extendTailwindMerge gotcha, paneles sin `overflow-y-auto`, Section.debug; corregir ref rota components.md:68 → `docs/ideas-features/hero-design.md`; `useScrollToAnchor` duration real 1.4 (docs decían 2).
- `buttons.md`: geometría en vivo re-verificada (inventario Banner OBSOLETO — real `size="lg"`+`glow` + "Conectemos en LinkedIn"; E5); variantes/shapes/sizes/fullWidth/glow reales de `button.tsx`; razones hover (`opacity-80` > `bg-white/80`; `/5+/30` únicos outlines); shadow morado firma con excepciones; v1→v2→v3 historial; deudas: shadow-md Ver Proyectos (abierta), unificar transitions, accent reservada; NO copiar deuda falsa Products `hover:bg-secondary` (ya usa variant outline, E6).
- `pointer-gestures.md`: se mantiene (tema puro); verificar refs a components.md sigan vivas.
- `iteration-guide.md` (NUEVO): do/don'ts + criterios "no copiamos" + jerarquía por tamaño/tracking no opacidad + gradientes escasos + DECIDIR E9: `brightness-110/125` sobre acento morado es patrón de facto (7+ instancias) — declararlo patrón, no excepción; DECIDIR blancos (`text-white`/`bg-white` pricing highlighted/lightbox/badges) — acotar regla; `@source` gotcha; Turbopack no hot-reloada fluid tokens (reintentar dev con .next purgado); decidir nota stale Vercel Preview feat/fluid-typo.
- `README.md`: índice completo; snapshot link; ejemplos no-canon; deuda UNA fuente de verdad (E2); SlideIn/ScaleIn → "no reintroducir" (ya eliminados, E7).

## Riesgos del refactor (T2 — verificar en T9)
- E2: README §5 incompleto + §11 desactualizado → no copiar la omisión ni deudas ya resueltas.
- E7: SlideIn/ScaleIn están documentados como "exportados sin consumidores" pero el código ya no los exporta → canon dirá "no reintroducir".
- E8: refs de línea driftean (ScrollProgress :15, brightness-125 :112, duration 1.4) → re-verificar contra código, no copiar.
- E9/E15/G15: regla absoluta de opacidad/white/brightness contradicha por el código → canon decide patrón vs excepción.
- E10: doble definición dark de `--color-purple-accent`/`--color-nav` → mantener fiel al extraer espejo.
- E12: fuente del espejo = `app/globals.css` (importado en layout.tsx:6), NO `styles/globals.css` huérfano.
- E13: snapshot/INDEX.md menciona destinos previstos — no confundir con canon vivo.
- E16: verificado OK: commits 748c17e/352ab13/d97b877/b84353e existen; button.tsx API documentado exacto; pointer-gestures implementado; forcedTheme="dark" layout.tsx:40.

## Constraints
- Todo valor documentado viene del código real (globals.css / componentes) — verificar con grep, no inventar.
- Historia/razón/deuda se MIGRA, no se descarta: cada pieza del inventario T2 debe tener destino.
- Snapshot es congelado y no-canónico: nunca más se edita; los nuevos archivos son la fuente.
- ASCII, español neutro en docs, conventional commits en inglés.
- NO tocar `app/globals.css` ni componentes en esta feature.

## Acceptance criteria
- `tokens.md` cubre todos los tokens definidos en `globals.css` (grep verificable).
- Cada pieza del inventario T2 aparece en su archivo destino.
- Un agente puede responder "qué tokens existen / cómo se ve un button / cómo decido tipografía" leyendo UN archivo.
- El snapshot histórico es byte-igual al estado actual pre-refactor.
- El README índice apunta a todos los archivos.