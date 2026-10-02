# Feature: Layout debug depth contract — cerrar la deuda 13.6

## Objective
Renumerar los 12 marcadores `debug-lN` que no siguen la profundidad real, fijar la
convencion de profundidad en el canon, anadir el nivel `l5` que la correccion exige,
eliminar el modo `inverted` del shell `Section` (que viola el contrato por
construccion), y cerrar la deuda 13.6.

## Problem
Los colores estaban asignados por ROL (section/wrapper/bloque/hoja) pero nombrados
por PROFUNDIDAD (l1..l4). Dos ejes disfrazados de uno. La firma es
`featured-project-panel.tsx`: sus 5 marcadores usan `l4` (un valor terminal) como
wrapper de una cadena que reinicia en `l1`. El v2 (commit `79ac40e`) arreglo el
MECANISMO pero no los datos: el patron ya es correcto, las marcas no.

La deuda 13.6 listaba 9 marcadores. La auditoria completa encontro **12**: faltaban
`featured-projects.tsx:136` y el `debug="inverted"` de `all-projects.tsx:40`, mas el
prop `inverted` de `section.tsx` que es la causa raiz del segundo.

## Why
Es instrumento de QA manual. Un mapa de profundidad que miente no es peor que no
tenerlo: es peor, porque guia la inspeccion hacia la conclusion equivocada. Ademas,
mientras `inverted` exista, el shell emite una estructura que el contrato prohibe,
asi que cualquier marker nuevo escrito contra el shell nace con la excepcion abierta.

## Convencion (aprobada por el usuario)

**La profundidad se cuenta desde el ancestro marcado mas externo.** Los wrappers sin
marcar (pin GSAP, wrappers de animacion, `motion.div`) NO cuentan. Varias raices
hermanas cada una arranca en l1.

Consecuencia directa: `#proyectos` (`featured-projects.tsx:125`, pin GSAP) queda sin
marcar, asi que el bloque heading y cada panel son raices hermanas independientes.
Marcar `#proyectos` como l1 habria empujado los paneles a l2-l6 y habria exigido un
nivel mas; la convencion de raices hermana es lo que mantiene el techo en l5.

## Scope

**IN (10 archivos)**

| Archivo | Cambio |
|---|---|
| `app/layout.tsx` | anadir `'l5'` a la union `DebugChannel` |
| `app/globals.css` | anadir `[data-debug-l5] .debug-l5` (`#a78bfa`) + actualizar el comentario de mapeo |
| `components/about-section.tsx` | `:65` l4->l3 · `:88` l4->l3 · `:89` l1->`debug-test` |
| `components/hero-section.tsx` | `:147` l1->`debug-test` |
| `components/featured-project-panel.tsx` | `:42` l4->l1 · `:48` l1->l2 · `:59` l2->l3 · `:61` l3->l4 · `:88` l4->l5 |
| `components/featured-projects.tsx` | `:136` l2->l1 (`:37` queda l2, pasa a ser correcto) |
| `components/all-projects.tsx` | `:40` quitar `debug="inverted"` |
| `components/section.tsx` | borrar el modo `inverted` de `DebugMode`, `DEBUG_OUTER`, `DEBUG_INNER` y su doc comment |
| `docs/design/components.md` | §10: documentar la convencion + l5 · §13: cerrar 13.6 |
| `.agents/skills/layout-debug-canon/SKILL.md` | l5 en la tabla de canales + regla de profundidad |

**OUT (explicito)**
- NO tocar la skill global `layout-debug`: su ejemplo CSS es una instalacion minima
  generica con l1-l4, y su propia Hard Rule ya explica como anadir niveles.
  Ampliarlo a 5 haria ruido en un ejemplo que debe ser minimo.
- NO marcar `#proyectos` con un marker.
- NO tocar `debug-lN` en `products-section.tsx`, `pricing-section.tsx`,
  `contact-section.tsx`, `navbar.tsx`, `footer.tsx`, `project-detail.tsx`: auditados y
  correctos bajo esta convencion.
- NO crear scripts de enforcement. NO anadir `l6` (nada llega a profundidad 6).
- NO tocar `data/projects.ts` (WIP ajeno sin commitear).

## Constraints
- `debug-test` NO cuenta como nivel: es ortogonal a la profundidad. Los dos divs que
  envuelven solo `<p>` (hero `:147`, about `:89`) miden la medida del texto, no son
  contenedores de la jerarquia — de ahi que pasen a sonda.
- Sintaxis ASCII estandar. Documentos del canon en espanol SIN acentos.
- Cero cambio visual en produccion: solo clases de debug, que por defecto estan apagadas.
- No cambiar ninguna otra clase, prop o estructura de los componentes.

## Decisiones (cerradas con el usuario)
1. Convencion de profundidad: desde el ancestro marcado mas externo; wrappers sin
   marcar no cuentan; raices hermanas cada una en l1.
2. `featured-projects.tsx:136` -> l1 dejando `#proyectos` sin marcar (paneles en l1-l5).
3. `hero:147` y `about:89` -> `debug-test`, no renumerar: son cajas de texto, no nodos
   de la jerarquia, y son el caso de uso vivo que justifica el canal.
4. Borrar `inverted` de `section.tsx`; `all-projects.tsx:40` pasa a default.

## Cadenas verificadas tras la correccion
- about: shell(l1,l2) -> :65 l3, :88 l3, :89 debug-test
- hero: :112 l1 -> :132 l2 -> :133 l3 -> :146 l4 -> :147 debug-test
- featured-project-panel: :42 l1 -> :48 l2 -> :59 l3 -> :61 l4 -> :88 l5
- featured-projects: :136 l1 -> (:37 l2)
- all-projects: shell l1,l2 (default) | shell l1,l2 -> :60 l3
- products / pricing / contact / navbar / footer / project-detail: sin cambios, ya correctos

## Tasks
- [ ] T1 `app/layout.tsx` + `app/globals.css` — nivel l5 (union + regla `#a78bfa` + comentario).
- [ ] T2 `about-section.tsx` + `hero-section.tsx` — 4 marcadores.
- [ ] T3 `featured-project-panel.tsx` + `featured-projects.tsx` — 6 marcadores.
- [ ] T4 `all-projects.tsx` + `section.tsx` — eliminar el modo `inverted`.
- [ ] T5 `components.md` (convencion + l5 + cerrar 13.6) + `layout-debug-canon` (l5 + regla).
- [ ] T6 Verificar + commit de work unit.

## Acceptance criteria
- Cada cadena de marcadores respeta "el ancestro marcado mas externo +1".
- No queda ningun `debug-lN` cuyo nivel sea <= el de un ancestro marcado.
- `inverted` no existe en `section.tsx` ni en ningun call site.
- El canon documenta la convencion y `l5`; 13.6 deja de listarse como deuda abierta.
- `pnpm typecheck` exit 0.
- `git diff --stat` limitado a los 10 archivos de scope (+ este doc).

## Applicable checks
- `pnpm typecheck` (exit 0)
- `git diff --stat`
- Re-lectura de las 5 cadenas de la seccion anterior para confirmar coherencia

## Route
- Delegated direct (1 writer) — 10 archivos, 5 con contenido nuevo; Writer trigger.

## Delivery strategy
- Work unit unico, commit directo sobre `feat/recede-fade`. Sin PR. Forecast ~35 lineas.
