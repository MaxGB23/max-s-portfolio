# projects-catalog — catálogo de proyectos y linaje de la familia Funky AI

Separa "lo que existe" de "lo que se muestra en la home": un catálogo `/proyectos`
con todas las fichas, y una home con una selección explícita de 3 featured + 6 grid.
funky-forge y funky-secure pasan a ser entradas de primera clase enlazadas desde
funky-ai, no proyectos anidados. Nada de esto reescribe el contenido de los
proyectos existentes: solo su ubicación.

## Specs

### S1 — Selección de la home

La home mantiene **3 featured y 6 cards de grilla**. Criterio: featured es tracción
probada, grilla es profundidad técnica.

- Featured (3, sin cambios): CAF, Presidencia, Funky Theme. El usuario: "no los
  pongo en featured porque no tienen usuarios reales como los 3 que tengo
  actualmente".
- Grilla final (6): funky-ai, funky-forge, funky-secure, one-click-ti, autoshop,
  cumyxel ("Pensaba dejar los dos videojuegos pero por ahora deja solo cumyxel").
- Salen de la grilla al catálogo: color-highlight-v2 ("Color highlight puedo
  sacarlo de los proyectos principales") y grinchmas-kart.
- No salen: "no quiero sacar otros proyectos como one click ti, autoshop o algun
  videojuego".
- **El orden del array `projects` es contrato de layout** (`data/projects.ts:5-8`).
  Esta feature NO reordena ese array: la selección se expresa solo con el campo
  `home`, y el orden visible de la grilla es el que el array ya tiene.

### S2 — Modelo de datos: tres campos ortogonales

`ProjectL` reemplaza `featured?: boolean` por un único eje de superficie, y suma
linaje y ciclo de vida:

```ts
home?: "featured" | "grid";                      // ausente = solo catálogo
lineage?: string;                                // id del proyecto padre
status?: "active" | "pre-release" | "finished";  // ausente = "active"
```

- Un solo flag de curación. No se admite `listed?: boolean` (idea del worktree
  forge, descartada: dos booleanos responden la misma pregunta).
- `getCatalog()` devuelve **todas** las fichas, incluidas las 3 featured. El
  catálogo no es "lo que no entra en la home".
- Selectores derivados en `data/projects.ts`: `getHomeFeatured()`,
  `getHomeGrid()`, `getCatalog()`.
- **Consumidores que el cambio de tipo rompe y que T1 debe actualizar en el mismo
  slice** (verificado, `fed4983`): `components/all-projects.tsx:23` (`!project.featured`)
  y `:38` (`featured: localized.featured`), `components/project-card.tsx:21` (tipo)
  y `:57` (borde), `components/featured-projects.tsx:64`, y el helper
  `getFeaturedProjects()` en `data/projects.ts:64-66`.
- **El test de invariantes no puede importar `data/projects.ts`.** `package.json`
  globa solo `scripts/*.test.mjs` y `lib/*.test.ts`, y `data/projects.ts` importa
  sin extensión (`"./projects/caf"`), así que `node --test` falla con
  `ERR_MODULE_NOT_FOUND`. El test vive en `scripts/projects-catalog.test.mjs` y
  **parsea el AST con `typescript`** (ya es devDependency y es lo que hace
  `scripts/audit-i18n-content.mjs`). No se cambian los especificadores de módulo
  solo para testear.
- Invariantes: `home: "featured"` exactamente 3 y `home: "grid"` exactamente 6. El
  de grilla se agrega en T6, cuando los 6 existen; en T1 solo se verifica que la
  selección visible no cambió (3 featured y los mismos 6 de grilla).
- **`scripts/audit-i18n-content.mjs` debe aceptar los tres props nuevos**:
  `home`, `lineage` y `status` se agregan a `NON_TRANSLATABLE_PROPS`
  (`:43-51`). Sin eso, `home: "featured"` en `data/projects/*.ts` cae como
  `outside-leaf` y el gate se pone rojo.

### S3 — Catálogo `/proyectos`

Ruta nueva que lista **todas** las fichas.

- **Sin métricas vivas**: no abre un fetch por proyecto. La cifra viva sigue en la
  home y en la ficha.
- **No se promete SSG.** `app/layout.tsx` llama `cookies()` y `headers()`, lo que
  vuelve dinámico todo el árbol. Hacer `/proyectos` estático exigiría cambiar el
  layout: fuera de alcance. Lo que se promete es *no agregar fetches por request*.
- **Monta `Navbar` y `Footer`**, a diferencia de `/proyectos/[id]`, que no los
  monta. Sin navbar el catálogo no tiene navegación y S5(d) no tendría sentido.
- Agrupación por linaje: primero el grupo "Funky AI" (funky-ai como entrada,
  funky-forge y funky-secure como productos salidos de él), después el resto.
- `status: "finished"` al final, bajo un divisor "Earlier work".
- **El card es el componente real, sin variantes.** `metric` y los `tags` son
  condicionales en `project-card.tsx`, así que las fichas sin dato verificable los
  omiten; nunca se inventa un dato para llenar el card (S9).
- **El card real no muestra `category` en el cuerpo**: la única etiqueta mono es el
  *fallback* de media cuando no hay imagen. No se agrega una etiqueta de categoría.
- **La grilla es responsive** (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`), no una
  grilla fija de tres columnas.
- Lo único nuevo del card es el **chip de estado**, que hoy no existe en el
  componente: se agrega en T2b y se documenta en `docs/design/components-detail.md` 4.6.
- **Sin conteos en la interfaz.** Ni en el encabezado de la página, ni en los
  encabezados de grupo, ni en la etiqueta del enlace: el usuario los descartó dos veces
  (L10, L11).
- Bilingüe ES/EN con `L` + `t()`. Claves nuevas necesarias, como mínimo:
  la etiqueta del enlace, "Trabajo anterior", las etiquetas de los chips y el aria
  del card. Las claves del encabezado ya existen
  (`section.allProjects.title.first/second`, `data/translations.ts:55-56`).
- Tokens de `IDENTICAL_OK`: la mayoría ya están (`funky-forge`, `funky secure`,
  `funky-ai`, `funkygram`, `Dev Tools / AI Engineering`, `Beta`, `Verified`). Solo
  se agregan los que aparezcan con las categorías o tags nuevos.

### S4 — Home

- El bloque `all-projects` pasa a **6 cards + un enlace "Ver todos los proyectos"**,
  sin número. La grilla sigue siendo `lg:grid-cols-3` de 3×2: no se toca el layout ni
  la coreografía de scroll medida, y el diseño del bloque no se rediseña.
- **El enlace es navegación, no conversión.** No puede ser un botón relleno: el botón
  blanco lleno es el peso de acción principal del sitio (pricing y contacto) y un
  enlace de navegación no debe competir con él.
- **Forma decidida** (board `08-cta-ver-todos.html`, tratamiento A): enlace discreto
  **centrado**, 32 px bajo la grilla, flecha a la derecha, texto y flecha en
  `--foreground`, subrayado solo en hover y `:focus-visible`. Sin `--accent-purple`:
  el morado marca jerarquía de encabezado, no navegación, y en reposo el sitio no lo
  usa para enlaces. Etiqueta: **"Ver todos los proyectos"**, sin número.
- El encabezado del bloque no menciona la cantidad: el conteo se descartó como ruido.
- **El footer de la home no se toca.** No tiene columna de navegación y agregarle un
  enlace es un cambio de diseño en un componente aprobado.

### S5 — Shell y navegación: catálogo con navbar, ficha sin navbar

**Hecho verificado**: la ficha `/proyectos/<id>` **no monta `Navbar`** —es una
superficie de lectura— y su "Volver" es un `<a href="/">` real con restauración de
scroll (`components/project-detail.tsx:646`, `:365-374`), contrato documentado en
`docs/design/components-detail.md:114-118`. La home sí monta la navbar.

- **El catálogo monta `Navbar` y `Footer`.** Es un **índice**: se llega a elegir, no a
  leer. Sin navbar queda sin menú —en móvil el menú vive solo ahí— y sin acceso a
  Contacto o Precios salvo scrollear hasta el footer.
- **La ficha sigue sin navbar.** La regla no es la profundidad de la ruta sino la
  función: superficie de lectura esconde el chrome, superficie de índice lo conserva.
- **Consecuencia asumida**: el "Volver" de la ficha devuelve a la **home**, no al
  catálogo, porque la restauración de scroll es específica de la home. Quien venía del
  catálogo vuelve al inicio. Se acepta en esta feature —el catálogo está a un clic del
  navbar— y se registra como deuda: hacerlo contextual exige un mecanismo de scroll
  propio del catálogo. **No se toca el Volver.**
- **Navbar route-aware, y solo por el catálogo**: en `/proyectos` el ancla `#proyectos`
  no existe, así que "Proyectos" apuntaría a la nada.

  | Superficie | Destino de "Proyectos" |
  |---|---|
  | `/` | `#proyectos` — scrollea a la sección, como hoy |
  | `/proyectos` | `/proyectos`, marcado como actual |
  | `/proyectos/<id>` | no hay navbar: no aplica |

- **Descartado el dropdown** ("Destacados / Todos / Completos"). Son dos destinos, no
  tres: `featured` es el principio de la misma sección, no un lugar. La jerarquía ya es
  visible scrolleando, y un disclosure exige `aria-expanded`, cierre con Escape, foco y
  click afuera, más su variante en el menú móvil reacomodado en el PR #38.
- **No se agrega ni se quita ningún ítem del menú.**
- Entradas al catálogo: (a) el navbar; (b) el enlace "Ver todos los proyectos" al
  final del bloque de la home; (c) un enlace "todos los proyectos" **dentro** de cada
  ficha, junto al título. **(c) no reemplaza el Volver.**

### S6 — El contenido de los proyectos actuales no se toca

El usuario: "no cambies info de proyectos actuales, ya que ha sido seleccionada por
algo, solo la mencion de legacy de forge y secure". La migración de S2 edita solo
ubicación (`home`), linaje y estado. No se reescriben hooks, métricas, resúmenes,
`role`, `solution` ni `architecture`. La única excepción autorizada es la mención de
legacy de forge y secure en funky-ai (S7).

### S7 — funky-ai como hub, no como contenedor

El usuario: "funkygram queda dentro de funky-ai, ya que 'ai' es lo que complementa
al flujo de subagentes de SDD con ia" y "secure y forge tienen esas versiones legacy
pero los potentes son los productos individuales ahora".

- **No se crea un campo `legacy` ni se mueve copy.** Los bullets de Forge y Secure ya
  viven en `data/projects/funky-ai.ts:186-192` (`detail.solution`): se quedan ahí y
  solo ganan un enlace inline a la ficha nueva. Eso es exactamente la "mención de
  legacy" que S6 autoriza.
- Las capturas `funky-forge.webp` y `funky-secure-neon-diagram.webp` son del hub y
  **se quedan en el hub**. Regla de dueño único: la ficha del spoke no las reusa;
  necesita sus propias capturas (S8).
- funkygram **no** tiene ficha propia en este trabajo.

### S8 — Datos y assets de las fichas nuevas

- **Los assets van antes que las fichas.** `ProjectL.image` e `imageAlt` son
  obligatorios (`data/projects/types.ts:101-102`) y hoy solo existen las capturas
  del hub. Cada spoke necesita al menos una imagen propia antes de existir como
  ficha; no se reusan las del hub (S7) ni se inventan.
- funky-forge: el contenido narrativo se rescata del worktree `wip/funky-forge`
  **por archivo** (`git show wip/funky-forge:<ruta>`), nunca con merge.
- funky-secure: datos de prueba. El usuario: "Sobre el nuevo secure mete datos de
  prueba, es el que falta unicamente, pero no nos corresponde ahora".
- Ambos nacen con `status: "pre-release"` (lanzamiento en npm inminente) y
  `lineage: "funky-ai"`.

### S9 — Lo que no se inventa

Se puede inventar narrativa: `hook`, `problem`, `role`, `solution`, `architecture`.
**No** se inventan números (tests, benchmarks, descargas, usuarios), licencias,
URLs, fechas ni versiones.

- Sin cifras verificadas, `detail.metrics` va **vacío**: es render-safe
  (`components/project-detail.tsx:686`). Un array vacío es honesto; una cifra
  inventada no.
- Por eso las fichas nuevas **sí pueden entrar a la grilla** desde el principio: la
  honestidad se garantiza con `metrics: []` y el chip `pre-release`, no postergando
  su existencia. Postergarla dejaría la grilla con 4 cards y dos huecos.

### S10 — Diseño antes de código (fase 0)

- Artboards en `design/projects-catalog/`: catálogo escritorio (dos direcciones),
  catálogo móvil, home con la selección nueva y el card en sus tres estados.
- **El design system sync ya está hecho**: `design/system.md` y `design/system.html`
  existen y son la única fuente de tokens para los bocetos.
- Los bocetos deciden agrupación, densidad y jerarquía de chips; no son código.

### S11 — Fuera de alcance

- Merge o rebase del worktree `wip/funky-forge`: fue un experimento, se descarta
  como estructura. Solo se rescata contenido (S8).
- Ficha propia de funkygram.
- Agregar, quitar o renombrar ítems de la barra de navegación: solo cambia el destino
  de "Proyectos" según la ruta (S5).
- Cualquier cambio en las métricas vivas ya publicadas (`liveMetric` de
  funky-theme).
- Presupuesto de la grilla: no se sube a 7, 8 ni 9 cards.
- Reordenar el array `projects` (S1).
- Hacer `/proyectos` estático: exigiría cambiar el layout raíz (S3).
- Los hallazgos del design system sync que cambian lo que hoy se ve: `--font-mono`
  nombra Geist Mono sin loader ni dependencia, `--font-serif` apunta a Space
  Grotesk (una grotesca) y `styles/globals.css` es un archivo muerto que contradice
  al vivo. El usuario: "visualmente ya se ve bien, por lo que si arreglamos cosas
  como font mono, podría romper lo que ya está aprobado visualmente". Se deciden
  aparte, con medición.

### S12 — Movimiento: la política vigente es canon y se hereda

El usuario: "obligada a entrar sin animacion y sin scroll suave? dijimos que sí lo
mantenemos en toda la pagina".

- `/proyectos` **mantiene el lenguaje de movimiento del sitio**: entrada animada y
  scroll suave, igual que la home. Una ruta sin movimiento se leería como otro
  sitio.
- La ruta **no implementa movimiento propio**: monta el shell compartido
  (`Navbar`, `Footer`, `ScrollProgress`, page spacing) y **hereda** la coreografía.
  Nunca duplicarla por página.
- **No se abre ningún trabajo para "arreglar" `prefers-reduced-motion`.** Es una
  decisión del dueño, documentada y canónica en
  `docs/design/section-animations.md` (sección "Politica de prefers-reduced-motion"):
  las entradas corren siempre, incluso con la preferencia activa, porque la
  preferencia viene activada por defecto en bastantes equipos Windows por
  rendimiento y no por vestibular.
- Frontera que la política ya fija y que esta feature respeta: **permitido sin rama**
  opacidad y desplazamientos cortos (≤24px); **prohibido sin rama** parallax, zoom,
  giros, scroll-jacking o cualquier desplazamiento grande o continuo. Si `/proyectos`
  necesita algo de la lista prohibida, tiene que respetar la preferencia o no entra.
- Pregunta abierta, **no tarea** y fuera de alcance: el suavizado de scroll de Lenis
  (`components/smooth-scroll.tsx`) no tiene rama de reduced motion, y podría leerse
  dentro de "desplazamiento continuo". Se consulta al dueño; no se cambia acá.

### S13 — Verificación de la ruta nueva

- Los scripts de medición solo recorren la home (`scripts/audit-projects.mjs` apunta
  a `#all-projects`); `/proyectos` no queda cubierta por ellos.
- Antes del push: `pnpm typecheck`, `test`, `lint:docs`, `audit:i18n` y `build` en
  verde, más una pasada manual de `/proyectos` en escritorio y móvil registrada en
  `docs/design/iteration-guide.md` (sección 12).
- Contraste: ningún par de texto en AA fallido. Los pares medidos que ya fallan en
  el tema oscuro (`design/system.md` sección 8) no se replican en la ruta nueva.

## Tasks

- T0 — Design system sync + artboards · S10 · inline + worker · commit: —
- T1 — Modelo: `home`/`lineage`/`status`, `NON_TRANSLATABLE_PROPS`, selectores, migración de los 9 **sin cambiar la selección visible**, consumidores de `featured`, test AST de invariantes · S2, S6 · inline · commit: `3fc0da2`
- T2 — `/proyectos`: ruta con las 9 fichas existentes, `Navbar` + `Footer`, agrupación por linaje, "Trabajo anterior", claves i18n, docs · S3, S5, S13 · worker · commit: —
- T2b — Chip de estado en `project-card.tsx` (elemento nuevo, hoy inexistente) + su sección en `docs/design/components-detail.md` 4.6 · S3 · inline · commit: —
- T3 — Home: enlace "Ver todos los proyectos" al final del bloque, encabezado sin conteo (sin cambiar la selección todavía) · S4 · inline · commit: —
- T4 — Assets propios de funky-forge y funky-secure (al menos una captura por ficha) · S8 · inline · commit: —
- T5 — Fichas mínimas de funky-forge y funky-secure: `pre-release`, `lineage: funky-ai`, `metrics: []` · S8, S9 · worker · commit: —
- T6 — Selección nueva de la home + invariante de grilla = 6 · S1, S2 · inline · commit: —
- T7 — Hub: enlaces legacy de forge y secure a sus fichas nuevas · S7 · inline · commit: —
- T8 — Verificación de `/proyectos`: gates, pasada manual escritorio/móvil, contraste y comportamiento de entrada heredado (misma coreografía que la home, sin copia local) · S12, S13 · inline · commit: —
- T9 — Navbar route-aware: `#proyectos` en `/`, `/proyectos` en `/proyectos`, con el ítem marcado como actual · S5 · inline · commit: —

## Log

L1 (usuario, verbatim): "ahora tengo pensado continuar con funky forge pero no es un
cambio que tenga planeado. Si revisas forge verás que se pensó en hacer que dentro de
funky-ai existieran enlaces a otro detalle proyecto, algo anidado. Ya que funky-ai
tenia 4 herramientas que terminaron saliendo como productos independientes mas
robustos. En ese tiempo solo era funky forge, pero ahora ha salido funky secure. Son
proyectos bastante robustos por lo que merecen estar en portfolio. El problema es que
tenerlos anidados no me parece lo mejor. Tambien he pensado que el portfolio puede
crecer y hacer que proyectos antiguos ya no quepan en la lista de 9 + 3 featured, eso
hace tener que reemplazarlos. No sé qué hacer si meter una seccion de proyectos
archivados o algo así."

L2 (usuario, verbatim): "forge y secure son mis proyectos personales mas recientes y
los que mejor reflejan mi experiencia. Aun falta lanzarlos publicos como paquete en
npm pero quiero ir planeando su ubicacion en el portfolio. No los pongo en featured
porque no tienen usuarios reales como los 3 que tengo actualmente, pero en sí son
proyectos muy potentes que merecen su espacio. Color highlight puedo sacarlo de los
proyectos principales, pero no quiero sacar otros proyectos como one click ti,
autoshop o algun videojuego. Por eso he pensado en la /proyectos. Funky-ai mantiene
sus versiones legacy de forge y secure ya que son importantes ya que tienen tests y
mas cosas que venden bien, pero lo principal es SDD y funkygram."

L3 (usuario, verbatim): "estoy por lanzar a npm secure y forge, la data de esos
proyectos la llenaré despues. Pensaba dejar los dos videojuegos pero por ahora deja
solo cumyxel. funkygram queda dentro de funky-ai, ya que 'ai' es lo que complementa
al flujo de subagentes de SDD con ia. secure y forge tienen esas versiones legacy
pero los potentes son los productos individuales ahora. NO llenemos fichas, solo
datos inventados por ahora o unos rescatables del worktree forge."

L4 (usuario, verbatim): "dale, no cambies info de proyectos actuales, ya que ha sido
seleccionada por algo, solo la mencion de legacy de forge y secure. Sobre el nuevo
secure mete datos de prueba, es el que falta unicamente, pero no nos corresponde
ahora. Empezaremos con diseño primero, fase 0. El catalogo es /proyectos, pero el
menu ya contiene un proyectos, por lo que no se cambia, el unico acceso es scrollear
a all projects, o dime si tienes otra recomendacion."

L5 (usuario, verbatim): "visualmente ya se ve bien, por lo que si arreglamos cosas
como font mono, podría romper lo que ya está aprobado visualmente. tambien hay
cosas sobre aunque haya reduced motion, se mantienen animaciones de entrada y
scroll suave. Esto hay que tenerlo en cuenta antes de implementar, los bocetos ya
están listos o donde puedo verlos? o hay que esperar al verifier"

L6 (usuario, verbatim): "obligada a entrar sin animacion y sin scroll suave? dijimos
que sí lo mantenemos en toda la pagina" — corrige la lectura de L5: el movimiento
se mantiene en todo el sitio; lo que hay que tener en cuenta es la deuda de
`prefers-reduced-motion`, no quitarlo de la ruta nueva.

L7 (usuario, verbatim): "de qué va el issue de reducido global? no entiendo" —
pide el contenido del issue propuesto. Al revisarlo se concluye que **el issue no
debe existir**.

E7 (evidencia, revierte la propuesta de issue): el comportamiento no es un
descubierto tardío sino una decisión escrita y canónica:
`docs/design/section-animations.md:274-292` ("Las animaciones de entrada se
ejecutan SIEMPRE ... Es una decision del dueno del producto"), con la frontera
explícita (permitido fades y ≤24px; prohibido parallax, zoom, giros, scroll-jacking
sin rama), y repetida en `app/layout.tsx:66-70`, `app/globals.css:461` y
`components/featured-projects.tsx:50-55` (que además prohíbe ramificar el render
sobre `useReducedMotion()` por riesgo de hydration mismatch). Único punto no
nombrado por la política: el suavizado de `components/smooth-scroll.tsx`, que no
tiene rama de reduced motion.

E1 (evidencia, `fed4983`): 9 fichas; `featured: true` en 3 (caf, presidencia,
funky-theme); `AllProjects` filtra `!project.featured` y renderiza 6 cards en
`lg:grid-cols-3`; no existe índice `/proyectos`, solo `/proyectos/[id]`.

E2 (evidencia): `components/navbar.tsx:18` define `nav.projects` con
`href: "#proyectos"`; `:39` tiene `SECTION_ALIAS = { "all-projects": "proyectos" }`.
Es un ancla, no una ruta; en `/proyectos/<id>` el ancla no existe.

E3 (evidencia): `gentle_design list` reportó 4 design sources y `design/system.md`
ausente, sin diseños previos. **Superada**: el sync ya se ejecutó (E5).

E4 (evidencia): `scripts/audit-i18n-content.mjs` rechaza hojas `L` calculadas
(`outside-leaf`). Toda cifra repetida se escribe como literales documentados.

E5 (evidencia, design system sync): `design/system.md` documenta 32 tokens de color
en `:root` y 32 redefiniciones en `.dark`, 3 familias, 13 escalas `--text-fluid-*` y
1 breakpoint (`--breakpoint-nav: 830px`). No existen tokens de sombra ni de z-index.
Conflictos documentados: `styles/globals.css` no está importado por nadie y
contradice al vivo en 33 declaraciones; `--font-mono` no resuelve a ninguna fuente
real; `--font-serif` es Space Grotesk. Pares que no cumplen AA en el tema oscuro:
`accent-foreground`/`--accent` 3.93, `foreground`/`--accent` 3.50, `white/75` en la
pricing card destacada 2.91, anillo de foco `purple-accent/60` 2.48,
`purple-accent`/`purple-accent-light` 4.46 en oscuro y 3.49 en claro.

E6 (evidencia, segunda opinión `gentle-ai-verify` sobre la v1 de este doc): 20
hallazgos. Cambiaron el plan: (a) el test de invariantes no puede importar
`data/projects.ts` (glob de `package.json` + imports sin extensión) → test AST en
`scripts/`; (b) `home:"grid"` para forge/secure no podía esperar a datos reales sin
dejar dos huecos en la grilla → entran con `metrics: []` y `pre-release`; (c)
`featured` se consume en 4 archivos que ninguna tarea nombraba; (d) los props nuevos
caen como `outside-leaf` → `NON_TRANSLATABLE_PROPS`; (e) el bloque Legacy no tiene
campo en `ProjectL` y mover copy violaría S6 → se quedan los bullets con un enlace;
(f) `/proyectos` no puede prometerse estática (el layout raíz usa `cookies()`/
`headers()`); (g) el "Volver" de la ficha es contrato documentado y no se reemplaza;
(h) el catálogo debe montar `Navbar` y `Footer`, que la ficha de detalle no monta.
Ninguna verificación ejecutable corrió: el worktree nuevo no tiene `node_modules`.

D1 (decisión): linaje como relación (`lineage`), nunca anidamiento de rutas. Un
spin-off puede superar a su padre sin redirect y el catálogo no necesita recorrer un
árbol.

D2 (decisión): no se crea una sección de "archivados". Se usa `status` con `finished`
ordenando al final del catálogo: el archivado como sección es un cementerio y no
resuelve que la home sea una cola.

D3 (decisión): la grilla queda en 6. El bloque está medido para 3×2 y no se cambia
por crecimiento de inventario; el catálogo absorbe el crecimiento.

D4 (decisión): el catálogo lista las 11 fichas, incluidas las 3 featured, y el CTA
muestra el total real. `getCatalog()` no significa "lo que no entra en la home".

D5 (decisión): `status: "finished"` propuesto para Grinchmas Kart y Cumyxel 2D
(académicos, sin mantenimiento activo); el resto `active`. Un campo por ficha,
reversible si el usuario lo corrige.

D6 (decisión): el enlace al catálogo desde una ficha es un enlace nuevo junto al
título; el botón "Volver" se queda como está porque es contrato de layout y de
restauración de scroll.

D7 (decisión, corregida por L6 y E7): el movimiento del sitio se mantiene en
**todas** las páginas, incluida `/proyectos`, mediante el shell compartido. La
política de `prefers-reduced-motion` de `docs/design/section-animations.md` es canon
y no se toca: no hay issue de "movimiento reducido global". Lo único abierto es si
el suavizado de Lenis entra en la cláusula de "desplazamiento continuo", y eso es
una consulta al dueño, no una tarea de esta feature.

L9 (usuario, verbatim): "borra  styles/globals.css si es que nadie lo usa"

E8 (evidencia): `styles/globals.css` no tenía ningún `import` en el código —cero
referencias en `*.ts`, `*.tsx`, `*.js`, `*.mjs`, `*.css` y `*.json`—, `components.json`
declara `"css": "app/globals.css"` y `app/layout.tsx:8` importa `./globals.css`. Retirado
con `git rm` y registrado en `docs/design/DEAD.md`, como exige la regla del repo.

D8 (decisión): se retira `styles/globals.css` y **no** se arreglan sus consecuencias. Las
utilidades `text-chart-*` / `bg-chart-*` siguen vacías porque `app/globals.css` no define
`--chart-1..5`; eso queda documentado en `design/system.md`. El retiro va como work unit
propio, no dentro de las tareas del catálogo.

L10 (usuario, verbatim): "tenemos mucho boceto que no aporta ahora, deja los que
usamos nadamas. En la home el diseño ya está hecho, solo hay que diseñar cómo se va a
mostrar el link para dirigir a proyectos, no me parece muy atractivo actualmente ...
tambien no toquemos footer para mencionar la cantidad de proyectos, solo un link
sencillo para visitar la pagina. El navbar ya tiene un link a proyectos, pero no es la
pestaña dedicada, esto hay que tenerlo en cuenta, no sé si algun tipo dropdown o algo
podría solucionarlo para separar featured, all projects, y proyectos completos,
necesito tu opinion"

L11 (usuario, verbatim): "navbar tal cual recomiendas. eliminar conteos mobile.
eliminar numero en etiqueta ver todos los proyectos"

L12 (usuario, verbatim): "tambien veo que en detalle proyecto no manejamos navbar, solo
un 'back', en la pagina dedicada a proyectos qué hacemos?"

E9 (evidencia): la ficha `/proyectos/<id>` **no monta `Navbar`** —su "Volver" es un
`<a href="/">` con restauración de scroll—, así que en esa ruta el ítem "Proyectos"
no existe y no puede estar muerto. El catálogo sí debe montar la navbar: en móvil el
menú vive solo ahí.

D9 (decisión): navbar **route-aware**, sin dropdown. Un solo ítem, destino según la
superficie (S5); el dropdown se descarta por coste de accesibilidad y porque hay dos
destinos, no tres.

D10 (decisión): la navbar monta el catálogo (es un índice) y no la ficha (es una
superficie de lectura). El "Volver" de la ficha sigue devolviendo a la home; que sea
contextual queda como deuda registrada, no como cambio de esta feature.

D11 (diseño, fase 0): `design/projects-catalog/` contiene
`06-proyectos-desktop.html`, `07-proyectos-movil.html` y `08-cta-ver-todos.html`. Se
descartaron 01–05: dos direcciones de lenguaje visual nuevo para el catálogo, el móvil
de esas direcciones, el board de la home con la selección y el de estados del card. El
tablero del sistema vive en `design/system.md` + `design/system.html`.

D12 (decidida, L13): el enlace de la home es el **tratamiento A** de
`08-cta-ver-todos.html`: discreto, **centrado**, flecha a la derecha, todo en
`--foreground`, sin morado, etiqueta "Ver todos los proyectos" sin número.

E10 (evidencia, `3fc0da2`): T1 con RED/GREEN real: 4 casos fallando antes, 6 en verde
después. `pnpm test` 74/74, `typecheck` 0, `audit:i18n` 0 (594 hojas), `lint:docs` 0,
`build` 0. La selección quedó idéntica a `528a1cc` —verificada leyendo ambos lados del
diff— y cada ficha cambió una sola línea. `getFeaturedProjects()` desapareció: no hizo
falta alias.

E11 (evidencia, medición de slice): contra `origin/main` la rama lleva **2 commits,
19 archivos, +269/−155**. El aviso de 695 líneas del harness mide contra `main` local,
que está atrasado y arrastra los dos commits de zed ya mergeados en `origin/main`; no
es tamaño de esta feature.

D13 (decisión de entrega): un solo PR. El tamaño authored real —269 adiciones, de las
cuales 125 eliminaciones son el CSS muerto— queda bajo el presupuesto de ~400, así que
no se abre cadena de PRs.

D14 (decidida, L15): `design/system.md` y `design/projects-catalog/` se commitean;
`design/system.html` queda fuera con su línea en `.gitignore`, porque se regenera
desde `system.md`. Los boards sí entran: no son regenerables —son el registro de
la fase 0— aunque pesen 804 KB con las fuentes embebidas.

L15 (usuario, verbatim): "fuera system.html, tal como recomendaste, sigamos" y
"fuera system.html, tal como recomendaste, sigamos con t2".

### Estado de los commits

| Tarea | Commit |
|---|---|
| T0 — boards + sistema + spec | `842ba15` |
| T1 — modelo `home`/`lineage`/`status` | `3fc0da2` |
| T5a — fichas forge/secure + `finished` | `7790535` |
| T9 — navbar route-aware | `cd80200` |
| T2 — ruta `/proyectos` | `9110cb5` |
| T3 — enlace en la home | esta slice |
| Fuera de tarea — CSS muerto | `528a1cc` |

E12 (evidencia, `9110cb5`): `/proyectos` sale del build como `ƒ` (dynamic) igual
que `/`, porque el layout raíz usa `cookies()`. La agrupación vive en
`lib/projects-catalog.ts` como regla pura con 6 casos en `node:test`; el total
quedó en 85/85. Sin conteos en la interfaz, verificado por grep.

L16 (usuario, verbatim): "tuve que usar 'pt-6 md:pt-12 lg:pt-14' para que tuviera
el mismo espaciado que el resto de secciones, lo medi con layout debug y con esas
clases va casi preciso, mobile, tablet y desktop, este tipo de cosas no las
consideramos y podrían haber mas incongruencias en tamaños de fonts, etc. Sobre
la navegacion tengo muchos puntos que debatir, pero los dejamos para despues, ya
que son muchos bugs que no contemplamos, recuerdas para no olvidarlos. Estoy
recopilando data para forge y secure, ademas de imagenes, tenme paciencia. El
diseño de las featured no me gusta, tal vez añadir algun tipo badge encima de la
imagen por la esquina, no lo sé la verdad."

### Pendientes que no se pueden perder

1. **Ritmo vertical y escala tipografica** (E13): el board llevo una sola medida
de escritorio (32px) sin rampa, y la implementacion no consumio `lib/rhythm.ts`,
que ya codifica el ritmo (`SECTION_GAP`, `PAGE_SPACER_CLASSES`). El usuario midio
con `debug-l3` y corrigio a `pt-6 md:pt-12 lg:pt-14`. Falta revisar si la pagina
del catalogo consume o no las primitivas de `lib/rhythm.ts` —si no, es la misma
incongruencia en el gap entre secciones— y revisar tamano de fuentes contra la
home en los tres anchos. Regla nueva: toda distancia vertical se escribe con sus
tres valores (mobile/tablet/desktop), medidos o tomados de `lib/rhythm.ts`.
2. **Navegacion** (diferido por el usuario): hay "muchos puntos que debatir" y
"muchos bugs que no contemplamos". No se resuelven en esta feature; quedan
abiertos, pendientes de que el usuario los enumere.
3. **Forge y Secure** (en curso por el usuario): esta recopilando data e imagenes
(`docs/projects/candidatos/portfolio-npm-launch-forge.md` y
`portfolio-npm-launch-secure.md`). T4 y T7 esperan eso; no inventar contenido
mientras tanto.
4. **Diseno de las featured**: al usuario no le gusta. Idea suya, sin confirmar:
un badge de tipo encima de la imagen, en la esquina. Se cruza con T2b (chip de
estado): una sola decision de diseno puede resolver los dos.
5. **Pase de docs**: ejecutado el 2026-11-18 sobre el plan
   `odd/tasks/docs-pass.plan.md` (juicio de plan 2 rondas; la ronda 2 refuto
   tres decisiones). Decision del dueno: **opcion A**, sin partir archivos.
   - Cerrado: `SECTION_GAP_Y` ya no es "excepcion unica de contacto" (el catalogo
     es el segundo consumidor) en `tokens.md`, `components-detail.md` y el
     comentario de `lib/rhythm.ts`; `docs/README.md` declara las cinco
     desviaciones de tamano con su motivo real.
   - Descartado con evidencia: corregir el "250" del RFC (esta congelado:
     `docs/rfcs/docs-lifecycle.md`, "una correccion futura es otro RFC"), hacer
     que los docs apunten a `scripts/docs.mjs` (la politica vive en los docs), y
     partir `platform.md` / `components-detail.md`.
   - Verificado: `pnpm lint:docs` 0 bloqueantes (5 avisos C4), `pnpm typecheck` 0.
     Commit `2121904`.
   - Deuda declarada: partir `platform.md` exige primero que el gate valide las
     citas por numero de seccion fuera de las filas del mapa; hoy solo ahi se
     validan, asi que un split deja referencias muertas en silencio.
6. **Tamano de la entrega**: `origin/main..HEAD` = 22 commits, 8063 lineas, de
   las cuales ~4223 son los tableros de fase 0 (`design/**`, incluye
   `design/system.md`). El codigo ronda las 3800 lineas: la entrega es la PR
   unica acordada (D13), no una PR pequena.
