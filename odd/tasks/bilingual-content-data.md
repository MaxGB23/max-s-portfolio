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
- Granularidad: un archivo por proyecto en `data/projects/<id>.ts`, reensamblados por `data/projects.ts` (que sigue siendo el módulo público: `projects`, `getProjectById`, `getFeaturedProjects`). **Sin barrel `data/projects/index.ts`**: colisionaría con `data/projects.ts` en la resolución de `@/data/projects`. Replica la convención por proyecto de `docs/projects/candidatos/*.md`.
- Localizar en el RENDER CLIENTE (el toggle es state de cliente; un proyecto localizado en el server queda stale). El server solo lo usa para metadata, donde `cookies()` ya resuelve lang.
- El prop de `ProjectDetail` se ensancha a `ProjectEntry` en la primera ficha migrada: un prop declarado con el shape legacy no puede recibir una entrada bilingüe.

> **Supersede** lo acordado el 2026-09-21 en `odd/tasks/language-switcher.md:71` y posiblemente en `docs/ideas-features/language.md` (modelo "mirror `data/projects-en.ts` + `getProjects(lang)`"). Revisar y actualizar esas referencias en WU13.

## Scope
- **Nuevos:** `data/projects/types.ts`, `data/projects/<id>.ts` × 9, `data/pricing.ts`, `data/products.ts`, `scripts/audit-i18n-content.mjs`
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
- [x] T1: `data/projects/types.ts` — `L`, `ProjectEs`, `ProjectL` y derivados, `Localized<T>`, `Localize<T>`, `localizeProject`, `ProjectEntry`. `data/projects.ts` re-exporta los tipos. Cero cambio visual.
- [x] T2: cableado de los 6 consumidores client + metadata en `[id]/page.tsx`: `const { t, lang } = useLanguage()` y `localizeProject(...)`. Con las 9 fichas aún en `ProjectEs`, el render es idéntico.
- [x] T3: verificación WU1: `tsc --noEmit` + `pnpm build` limpios (cero cambio visual).
- [x] T4: convertir `caf` (peor caso: 11 `role[]`, árbol de 9 nodos) a `data/projects/caf.ts` con EN.
- [x] T5: convertir `presidencia`
- [x] T6: convertir `one-click-ti`
- [x] T7: convertir `autoshop`
- [x] T8: convertir `color-highlight-v2`
- [x] T9: convertir `funky-ai`
- [x] T10: convertir `cumyxel`
- [x] T11: convertir `grinchmas-kart`
- [x] T12: borrar `ProjectEs`, los aliases de compatibilidad y la aserción de invariancia (las 9 fichas quedan en `ProjectL`)
- [x] T13: `tiers` fuera de `pricing-section.tsx` → `data/pricing.ts` con EN + cableado
- [x] T14: `products[]` fuera de `products-section.tsx` → `data/products.ts` con EN + cableado
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
- **WU1 — commit `d238d2f`** (7 archivos, 463+/124-). `data/projects/types.ts` nuevo con `L`, shapes `*Es`, `ProjectL`, union transitoria `ProjectEntry`, `Localized<T>`, `localizeProject` (deep-walk puramente estructural) y una aserción de invariancia compilable. `data/projects.ts` re-exporta todo para que ningún consumidor cambie su línea de import. Cableados 4 consumidores; `project-card` y `featured-project-panel` **no** se tocaron (reciben props ya localizadas desde su productor) y `project-architecture` tampoco (recibe `tree` ya resuelto).
- **WU2 — commit pendiente.** `caf` migrada a `data/projects/caf.ts` (525 líneas, 90 hojas `L`, 85 con EN propio). El copy ES quedó **byte-idéntico**: 110 literales, mismo orden, mismo SHA256 contra `git show HEAD`. Pares `**` intactos (2+2 en las 8 hojas con markdown).

## Decisiones tomadas en la sesión
- **Opción A** para el ensanchamiento del prop: `ProjectDetail` recibe `ProjectEntry`, no un cast a `ProjectEs`. Descartadas B (cambia en silencio el significado del tipo público `Project`) y C (mentira de tipos con `as`).
- **Canon de inglés: US English.** Sin evidencia de UK en `translations.ts`; un portafolio orientado a reclutadores necesita el inglés de mayor alcance. Aplicado: centre→center, enquiries→inquiries, cancelled→canceled.
- **`detail.role[3]` de `caf`**: el EN dice "centralized error messages kept in Spanish" en vez de silenciarlo, porque el producto clínico sí muestra errores en español y callarlo sería un claim falso.
- **Sin barrel `data/projects/index.ts`**: `data/projects.ts` importa y reensambla cada ficha, para no colisionar con la resolución de `@/data/projects`.
- **Los espejos `docs/projects/candidatos/*.md` se quedan en español**: son la fuente editorial; el EN se deriva del data layer, no al revés.

## Verification evidence
- WU1: `pnpm exec tsc --noEmit` EXIT=0; `pnpm build` EXIT=0 (13/13). Invariancia probada **por mutación** (cambiar `ProjectEs.title` de `string` a `L` produjo TS2344 + 9× TS2322): la aserción no es vacía. Spot check del padre: `all-projects.tsx` mapea campos ya localizados al prop plano de la card.
- WU2: `pnpm exec tsc --noEmit` EXIT=0; `pnpm build` EXIT=0 (13/13). RED observado: quitar el `en` de `title` → `TS2741: Property 'en' is missing ... but required in type 'L'`. 5 de 90 hojas con `en` idéntico a `es`, cada una justificada (2 cifras puras, 2 etiquetas de stack ya en inglés, 1 término de sector). Pase editorial del padre sobre hook/summary/role: EN profesional, sin inflación, metáforas del ES conservadas ("only inside a cage").
- **La aserción de invariancia está diseñada para FALLAR en T12.** Quien encuentre ese error debe borrar la aserción junto con `ProjectEs` y los aliases de compatibilidad, no "arreglarla".
- WU3 (`presidencia`, `funky-ai`): ES 72 y 97 literales, hashes idénticos. `presidencia` ES=6/EN=6 pares `**`; `funky-ai` ES=7/EN=7.
- WU4 (`grinchmas-kart`, `cumyxel`): ES 60 y 57 literales, hashes idénticos, `coberturaSinEn=0`. **La verificación por hash de ruta pagaba: atrapó una regresión real de ES** (`derrape con VFX` → `Derrape con VFX`) que `tsc` y `pnpm build` reportaban como limpios.
- WU5 (`one-click-ti`, `autoshop`): ES 53 y 42 literales, hashes idénticos.
- WU6 (`color-highlight-v2`, `funky-theme`): ES 57 y 90 literales, hashes idénticos. Sin reintroducir los claims que se habían retirado en la depuración upstream. `funky-theme` `solution[5]` tiene 10 pares `**` en ambos idiomas.
- **Corrección al doc:** la aserción `_ProjectEsIsUnchangedByLocalize` NO falló al migrar la novena ficha, porque es una propiedad de la *definición* de `ProjectEs`, no de los datos que describe. Era `true` por construcción y jamás iba a fallar: el comentario "debe FALLAR en T12" era un error de razonamiento disfrazado de señal de control. Se borró con su comentario en T12 en vez de buscar un rojo inexistente.
- T12 (limpieza transitoria): `tsc` EXIT=0, `build` EXIT=0, `Select-String` de los 9 nombres retirados sobre 105 archivos `.ts`/`.tsx` → **0 coincidencias**. `git diff` sin ninguna hoja `L` tocada. Los 4 alias sin sufijo que sobreviven apuntan ahora a tipos **ya localizados** (`LocalizedProjectImage`, `LocalizedMetric`, `LocalizedLink`, `LocalizedNode`), porque `project-architecture.tsx` y `project-card.tsx` reciben datos resueltos. `Project` y `ProjectDetail` se borraron por muerto: cero consumidores (`all-projects.tsx` importa `type Project` desde el propio `project-card.tsx`, no desde el data layer).
- Comentarios transitorios de las 9 cabeceras de `data/projects/*.ts` limpiados por el padre: la frase "la migracion solo agrega la hoja `en` al lado" describía un evento futuro que ya no existe. La regla editorial que sí sobrevive ("no reescribas el copy ES") queda explícita.

## Next steps
- Merge a la rama principal y push son decisiones del usuario.
- T14 (`products[]` → `data/products.ts`): 3 productos reales (UI Kit Pro, Motion Studio, Deploy Blueprint), ES byte-identico al componente revertido, `ProductL` + `localizeProduct` + `LocalizedProduct` segun el patron de pricing, `key` desde el `name` ES. HONEST IDENTITY: el copy ya era US English publicado, asi que los 18 `en` son identicos a proposito (documentado en la cabecera del archivo y cubierto por el allowlist de T16).
- **Work unit de veracidad (NO de traducción), pendiente de autorización del usuario.** El writer bilingüe NÃO tocó claims, por diseño, pero señaló tres que Translated tal cual y que parecen orquestados:
  - `presidencia` `metric` + `metrics[0]`: "100% digitalización del flujo de solicitudes". Un 100% absoluto sin medición de proceso real se lee como aspiracional presentado como hecho medido.
  - `presidencia` `solution[2]` + `architecture`: "PDFs con validez legal". Un PDF autogenerado no esValidity legal por sí mismo en la mayoría de jurisdicciones (suele exigir notaría, hash o registro).
  - `presidencia` `summary`: "escalable", afirmado sobre un proyecto estudiantil de 4 meses sin evidencia de carga.
  - `cumyxel` `role`: "Escribí todo el gameplay". El mismo documento editorial acredita a **cuatro** personas en Cumyxel (tres en modelado 3D, cinemáticas y un nivel), así que el claim solo se sostiene con la lectura de que los pares modelaron pero nadie más programó. La nota de licencias del doc sí respalda el claim más estrecho ("el diseño de escenarios, las animaciones y todo el gameplay").
  - Repetir la verificación que ya está pendiente en `grinchmas-kart` (`5 niveles`, `8 modelos 3D`, `~80%`) contra el repo público. El conteo `8 modelos 3D` no aparece en ningún `docs/`: los docs enumeran las categorías (kart, pista, personajes, escenario) pero nunca una cifra.
  - Inconsistencia ES preexistente que NO se tocó: `data/` dice "Mono de Nieve" donde el draft dice "Muñeco de nieve".
  - `one-click-ti` `metric` + `metrics[0]`: "5 módulos CRUD" aparece en cuatro sitios (metric, metrics[0], role[1], solution[2]). Coherente, pero es un claim repetido, no un dato medido en un punto verificable.
  - `autoshop` `summary`: "prácticas profesionales" es el único sostén del claim de que el sitio estuvo en producción.
  - `autoshop` `role[3]`: "Acompañé al equipo administrativo para estructurar el contenido..." es la afirmación más débil de la ficha.
  - `funky-theme` `solution[6]`: "soporte **Zed** lanzado **hoy**". Ancla temporal relativa en data congelada: envejece mal y ya está desalineada con `summary` ("Zed recién lanzado").
  - `funky-theme` `metrics[2]` + `solution[5]`: "funnel de conversión 97.45% (page views → installs)". Esa tasa en un theme de marketplace solo se sostiene con un funnel de un visitante. Es la cifra más frágil de todo el portfolio.
  - `funky-theme` `solution[5]`: "posicionamiento SEO orgánico **demostrado**". Claim fuerte sostenido en un solo funnel.
  - `funky-theme` `role[3]`: "6 release candidates (rc.1 → rc.6…)" antes del estable. Seis RC se leen como churn de proceso, no como logro.
  - `color-highlight-v2` `summary` + `role[2]`: "migré el núcleo a TypeScript" como migración total, aunque `stack[0]` admite `JavaScript (estrategias heredadas)`. El matiz se conservó.
  - `color-highlight-v2` `role[3]`: "corrigiendo las fugas de memoria de decoraciones", sin evidencia enlazada.