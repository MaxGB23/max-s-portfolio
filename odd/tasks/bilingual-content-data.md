# Feature: Contenido bilingüe ES/EN (bilingual-content-data)

## Objective
Que TODO el contenido visible del portfolio responda al locale: contenido de las 9 fichas de proyecto (hook, metric, summary, problem, role, solution, stack, metrics, gallery alts, grafo de arquitectura), `pricing tiers`, `products[]` y los labels de enlace. Hoy el chrome se traduce con `t()` y el contenido queda en español hardcodeado: en locale EN el sitio está a medias.

## Problem
`data/projects.ts` NO pasa por la capa i18n. La UI llama `t()` solo para el chrome y lee `project.hook`, `project.metric`, `project.detail.*`, `project.architecture` directo, en español hardcodeado. `components/pricing-section.tsx:23` y `components/products-section.tsx` van peor: el data vive DENTRO del componente como `const` module-scope, violando el canon dos veces (texto visible hardcodeado + data en componente). Esto viola la regla del propio AGENTS.md y la fila de `docs/i18n.md:19`.

## Why
- Es un bug de i18n vivo, no una mejora estética: el sitio declara `<html lang="en">` y muestra español.
- El usuario decidió el modelo: **la data es siempre la misma**, y tocar data obliga a actualizar ambos idiomas. La regla tiene que ser un invariante del compilador, no una convención.
- El árbol está limpio: un commit por work unit da retorno seguro si la implementación no convence.

## Decisión de arquitectura
`L = { es: string; en: string }` **inline por campo, NO opcional**. Falta `en` → `tsc` falla. Eso convierte la regla del repo en invariante del compilador.

Descartado: espejo `projects-en.ts` con tipos opcionales (permite drift silencioso; el compilador no puede exigir el inglés) y claves planas `caf.detail.role.7` en `translations.ts` (el data es estructurado: arrays, markdown y un árbol recursivo `architecture`; un mapa plano no lo expresa y las claves quedan frágiles ante un reorder).

- Tipos explícitos (`ProjectL`, `MetricL`, `NodeL`, `LinkL`, `ProjectImageL`), no un mapped type genérico: un mapped type no sabe que `image.src`/`url`/`tags` no se traducen. **El tipo es el checklist.**
- `Localize<T>` resuelve `L → string`, `string → string`, arrays y objetos recursivamente. Efecto: los consumidores siguen leyendo `project.hook` — no cambia el acceso a campos.
- Tipo transitorio `ProjectEntry = ProjectL | ProjectEs` para que cada work unit compile y sea revertible por separado. `ProjectEs` desaparece al convertir la ficha 9.
- Granularidad: un archivo por proyecto en `data/projects/<id>.ts`, barrel `data/projects/index.ts` que preserva la API pública (`projects`, `getProjectById`). Replica la convención por proyecto de `docs/projects/candidatos/*.md`.
- Localizar en el RENDER CLIENTE (el toggle es state de cliente; un proyecto localizado en el server queda stale). El server solo lo usa para metadata, donde `cookies()` ya resuelve lang.

> **Supersede** lo acordado el 2026-09-21 en `odd/tasks/language-switcher.md:71` y posiblemente en `docs/ideas-features/language.md` (modelo "mirror `data/projects-en.ts` + `getProjects(lang)`"). Revisar y actualizar esas referencias en WU13.

## Scope
- **Nuevos:** `data/projects/types.ts`, `data/projects/index.ts`, `data/projects/<id>.ts` × 9, `data/pricing.ts`, `data/products.ts`, `scripts/audit-i18n-content.mjs`
- **Modificados:** los 6 consumidores client (`project-card`, `project-detail`, `project-architecture`, `all-projects`, `featured-projects`, `featured-project-panel`), `pricing-section`, `products-section`, `app/proyectos/[id]/page.tsx`, `data/translations.ts` (labels de enlace por `kind`), `docs/i18n.md`, `docs/ideas-features/language.md`
- **NO incluye:** traducir los espejos `docs/projects/candidatos/*.md` (siguen siendo la fuente editorial ES; el EN se deriva del data layer, no al revés)

## Constraints
- Verificación: `pnpm exec tsc --noEmit` + `pnpm build`. No hay test runner. TDD no aplica (data editorial, sin RED determinable) — el proxy es el audit script.
- Conventional commits en INGLÉS. PowerShell 5.1 corrompe UTF-8: usar `git commit -F <archivo>`, nunca `-m`.
- ASCII en sintaxis. pnpm siempre. Nunca pushear sin que lo pida el usuario.
- Preservar los `**` de markdown en `summary` y `solution[]` (`docs/i18n.md:25`).
- Paridad de longitudes en `metrics[]`/`role[]`/`solution[]`/`gallery[]`: garantizada por tipos (mismo literal), no por script.
- El usuario NO levanta dev servers. Verificación visual es suya.

## Tasks
- [ ] T1: `data/projects/types.ts` — `L`, `ProjectEs`, `ProjectL` y derivados, `Localized<T>`, `Localize<T>`, `localizeProject`, `ProjectEntry`. `data/projects.ts` re-exporta los tipos. Cero cambio visual.
- [ ] T2: cableado de los 6 consumidores client + metadata en `[id]/page.tsx`: `const { t, lang } = useLanguage()` y `localizeProject(...)`. Con las 9 fichas aún en `ProjectEs`, el render es idéntico.
- [ ] T3: verificación WU1: `tsc --noEmit` + `pnpm build` limpios (cero cambio visual).
- [ ] T4: convertir `caf` (peor caso: 11 `role[]`, árbol de 9 nodos) a `data/projects/caf.ts` con EN.
- [ ] T5: convertir `presidencia`
- [ ] T6: convertir `one-click-ti`
- [ ] T7: convertir `autoshop`
- [ ] T8: convertir `color-highlight-v2`
- [ ] T9: convertir `funky-ai`
- [ ] T10: convertir `cumyxel`
- [ ] T11: convertir `grinchmas-kart`
- [ ] T12: convertir la ficha restante (la 9) y borrar `ProjectEs` del tipo transitorio
- [ ] T13: `tiers` fuera de `pricing-section.tsx` → `data/pricing.ts` con EN + cableado
- [ ] T14: `products[]` fuera de `products-section.tsx` → `data/products.ts` con EN + cableado
- [ ] T15: labels de enlace por `ProjectLink.kind` → chrome keys en `translations.ts` (elimina "Ver código" repetido en 9 fichas)
- [ ] T16: `scripts/audit-i18n-content.mjs` — reporta EN idéntico a ES (traducción no hecha), `**` markdown perdido, y campos sin `en`
- [ ] T17: sync `docs/i18n.md` (fila 19: data pasa de "pendiente" a bilingüe con `L`) y `docs/ideas-features/language.md` + `odd/tasks/language-switcher.md:71` (supersesión del modelo mirror)

## Acceptance criteria
- `pnpm exec tsc --noEmit` y `pnpm build` limpios.
- Quitar el campo `en` de cualquier hoja `L` → error de compilación (la prueba de que la regla es invariante, no convención).
- En locale EN: chrome Y contenido en inglés, incluidos `summary`, `role[]`, `solution[]` con su `**`, `metrics[].value`/`.label`, alts de galería y cada nodo/descripción del grafo de arquitectura.
- En locale ES: render byte-idéntico al de hoy (el copy ES no se reescribe).
- Topología del detail intacta: `metrics[0]` sigue siendo el nodo raíz y `KpiGrid` sigue en 2 columnas.
- El toggle de idioma cambia también el contenido, no solo el chrome (hoy solo cambia el chrome).
- El audit script reporta 0 problemas.
- Cada work unit cierra con su commit en `feat/recede-fade`.

## Progress
- (2026-10-08) Feature doc creado. Decisión de arquitectura tomada con el usuario: `L` inline no-opcional. RDD **off** (global) → sin ciclo de review; verificación por `tsc` + `build` + audit script + spot check del padre.

## Verification evidence
- (pendiente)

## Next steps
- Merge a la rama principal y push son decisiones del usuario.