# Feature: Layout debug v2 — activacion por canal + marcador desechable

## Objective
Sustituir el flag booleano del overlay de layout por activacion **por canal** (un
atributo `data-debug-<canal>` por nivel), de modo que se pueda ver **un solo nivel a
la vez** al depurar padding/margins, y anadir un canal **`debug-test`** ortogonal a la
profundidad para marcar una caja puntual (iconos, imagenes, spans) sin que se
confunda con un nivel de la jerarquia.

## Problem
1. `app/layout.tsx` expone `const LAYOUT_DEBUG = false` y hace
   `{...(LAYOUT_DEBUG ? { 'data-debug': '' } : {})}`. El CSS usa presencia de atributo
   (`[data-debug] .debug-l1`), asi que el valor `''` no transporta informacion: no
   existe forma de activar un nivel suelto. Depurar el padding de un contenedor obliga
   a ver los 4 niveles anidados a la vez, que es justo el ruido que se quiere evitar.
2. `debug-lN` esta sobrecargado: sirve como mapa de profundidad Y como sonda puntual.
   Marcar un icono con `debug-l1` en profundidad 6 miente sobre la profundidad, pinta
   de rojo lo que la rampa define como "section", y como la skill dice "leave markers
   permanently", queda ahi para siempre. Es el mismo error rol-vs-profundidad que
  ajiesta `featured-project-panel.tsx` (desfasado -3 en sus 5 marcadores).

## Why
El overlay es **instrumento de QA manual** (cero `EventSource` en el repo, se usa solo
con devtools). Su unico proposito es ver limites de contenedor y detectar paddings o
margins inconsistentes. Servir dos problemas con un vocabulario de una sola dimension
 Produce el dano de ambos: ruido cuando quieres precision, y desorientacion cuando
quieres velocidad.

## Scope
**IN (6 archivos)**
1. `app/layout.tsx` — `type DebugChannel` + `LAYOUT_DEBUG: DebugChannel[]` + `debugAttrs`
   derivado; sustituir el spread booleano en `<html>`.
2. `app/globals.css` (~271-286) — 4 selectores `[data-debug]` -> `[data-debug-lN]`,
   anadir `[data-debug-test] .debug-test`. Actualizar el comentario (~225, ~233).
3. `docs/design/tailwind-v4-theme.css` (~267-297) — **borrar** el bloque del overlay.
   Opcion B: nunca fue `@theme`, no genera variable y no se consume desde Tailwind.
   asi que no pertenece al espejo de extraccion. Eliminarlo mata la deriva permanente.
4. `docs/design/components.md` §10 (~410-415) — reescribir: activacion por canal,
   `debug-test`, conserva la documentacion de `Section.debug` tal cual.
5. `docs/design/components.md` §13 — anadir **13.6** (la lista llega hasta 13.5) con la
   deuda de los marcadores mal numerados.
6. `docs/design/iteration-guide.md` §8.6 (~153) — actualizar la linea de QA.
7. **Split de skills** (anadido por peticion del usuario, fuera del scope original):
   - Global `C:\Users\cb147\.config\opencode\skills\layout-debug\SKILL.md` — instalacion
     cross-project. Aqui va la nota de framework (Next.js; otro framework se adapta).
   - Local `.agents/skills/layout-debug-canon/SKILL.md` (renombra, la vieja se borro) —
     uso diario en este repo. Deriva el montaje a la global.
   - Motivo: existian DOS skills `layout-debug` homonimas; la local sombreaba a la global.
     El shadowing se elimino por construccion al renombrar.

**OUT (explicito, no es descuido)**
- NO crear `scripts/debug-levels.mjs` ni ningun script de enforcement.
- NO corregir los 8 marcadores mal numerados (quedan como deuda 13.6).
- NO tocar `Section.debug` / el modo `inverted` ni `components/section.tsx`.
- NO anadir niveles `l5..l8` ni paleta nueva: se anaden el dia que hagan falta, es 1 linea.
- NO tocar los 22 marcadores `debug-lN` en los 11 componentes que ya los tienen.

## Constraints
- Sintaxis ASCII estandar. Sin caracteres Unicode en operadores.
- `outline` + `outline-offset: -1px`; nunca `border` (cero shift de layout).
- Default `[]` (apagado): el proximo build sale limpio.
- Un atributo por canal, no lista separada por espacios (evita la trampa de `~=` con `""`).
- Tipo `DebugChannel` (no `DebugLevel`): `"test"` no es un nivel.
- Los ejemplos de clase en docs van SIEMPRE en bloques de codigo, nunca texto plano
  suelto (`@source not "../docs"` en globals.css — ver iteration-guide.md §9).

## Decisions tomadas (cerradas con el usuario)
- Atributo por canal: `data-debug-l1` … `data-debug-l4`, `data-debug-test`.
- Default: `LAYOUT_DEBUG: DebugChannel[] = []`.
- Canal de prueba: clase `debug-test`, `outline: 1px dashed` en neutro. Tres senales
  de que no es un nivel: discontinuo (los niveles son solidos), neutro (ningun color de
  la rampa), y no es un numero.
- Espejo del tema: opcion B (borrar el bloque).
- Sin script. Sin PR apilado. Work unit commiteada directo sobre `feat/recede-fade`.

## Tasks
- [ ] T1: `app/layout.tsx` — `DebugChannel`, array tipado, `debugAttrs` en `<html>`.
- [ ] T2: `app/globals.css` — 4 selectores por canal + `debug-test`, comentario actualizado.
- [ ] T3: `docs/design/tailwind-v4-theme.css` — borrar el bloque del overlay.
- [ ] T4: `docs/design/components.md` — §10 reescrita + deuda 13.6.
- [ ] T5: `docs/design/iteration-guide.md` §8.6 + `SKILL.md` completo.
- [ ] T6: Verificar + commit de work unit.

## Acceptance criteria
- `LAYOUT_DEBUG = []` -> el HTML servido NO contiene ningun atributo `data-debug-*`.
- `LAYOUT_DEBUG = ["l1"]` -> solo el outline rojo (`.debug-l1`).
- `LAYOUT_DEBUG = ["test"]` -> solo el discontinuo neutro (`.debug-test`); `debug-l1..4`
  intactos y sin outline visible.
- Ningun componente, `Section.debug`, ni `lib/` quedan modificados.
- `npx tsc --noEmit` exit 0.
- `git diff --stat` limited a los 7 archivos de scope.
- La skill abre declarando que es para Next.js y que otro framework puede adaptarla.

## Applicable checks
- `npx tsc --noEmit` (exit 0)
- `git diff --stat` -> confirmar que solo cambian los 7 archivos de scope
- Inspección del HTML servido con `LAYOUT_DEBUG = []`: cero `data-debug-*`

## Route
- Delegated direct (1 writer) — 7 archivos, 3 de ellos con prosa nueva; Writer trigger.

## Delivery strategy
- Work unit unico, commit directo sobre `feat/recede-fade`. Sin PR (cambio aprobado
  para el worktree). Forecast ~45 lineas authored, muy por debajo de 400: sin cadena.

## Debt registrada
- 13.6 (components.md), Opcion A — lista verificada SIN offsets: `featured-project-panel.tsx`
  (:42, :48, :59, :61, :88), `hero-section.tsx:147`, `about-section.tsx` (:65, :88, :89).
- Ojo: este feature doc se escribio inicialmente con numeros de linea de `main` y quedo
  desalineado hasta que el writer lo detecto contra el worktree. Los numeros de linea
  de `recede-fade` NO son los de `main` (hero-section +1, featured-project-panel +4).

## Progress
- [x] T1 `app/layout.tsx` — `DebugChannel` (no `DebugLevel`: `"test"` no es un nivel),
  `LAYOUT_DEBUG: DebugChannel[] = []`, `debugAttrs` con `Object.fromEntries`.
- [x] T2 `app/globals.css` — 4 selectores `[data-debug-lN]` + `[data-debug-test] .debug-test`
  (`1px dashed #f5f5f5`), comentario de cabecera reescrito a canales.
- [x] T3 `docs/design/tailwind-v4-theme.css` — bloque del overlay borrado (opcion B).
- [x] T4 `docs/design/components.md` — §10 activacion por canal; §13.6 con la deuda (opcion A).
- [x] T5 `iteration-guide.md` §8.6 + **split de skills** (global `layout-debug` +
  local `layout-debug-canon`; sombra eliminada).
- [x] T6 Verificado: `pnpm typecheck` exit 0. Sin commit (pendiente de.work unit).

## Desviaciones del spec original (detectadas por el writer, verificadas por el parent)
1. **Lineas del spec erroneas**: el spec inicial cita numeros de `main` aplicados a
   `recede-fade`. Reales: `featured-project-panel.tsx:88` (no `:84`) y
   `hero-section.tsx:147` (no `:146`; `:146` es `debug-l4` y SI es coherente).
2. **"Los 5 desfasados -3" es falso**: la cadena interna `:48→:59→:61→:88`
   (l1→l2→l3→l4) es coherente; la anomalia es `:42` usando `l4` (terminal) como
   wrapper de una cadena que reinicia en l1. Debajo de ninguna lectura los 5 son -3.
3. **Mojibake del frontmatter global: falso positivo del parent**. El archivo nunca
   estuvo corrupto; lo produzco `Get-Content` sin `-Encoding utf8` (PowerShell 5.1
   interpreting UTF-8 as Windows-1252). Verificar corrupcion exige leer bytes crudos.
