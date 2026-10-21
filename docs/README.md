# Documentacion del portfolio

> [!NOTE] Estado: VIVO
> Esto es el punto de entrada y debe ser verdad hoy. `docs/rfcs/` y `docs/issues/`
> son historia fechada; `odd/tasks/` es trabajo; `docs/design/archive/` esta
> congelado. Detalle en "Reglas de vida".

## Como se mantiene

- Si buscas algo y no esta en el mapa, anade la fila: una por pregunta de usuario, no por consulta del agente. Si una fila ya apunta a esa seccion, amplia su vocabulario en vez de duplicarla. El mapa no pasa de 40 filas: al llenarse, fusiona o retira la menos usada.
- El presupuesto de tamano lo fija el gate (`scripts/docs.mjs`, 300 lineas hoy): un doc que lo pase es dos docs.
- `pnpm lint:docs` antes de cerrar un track; `pnpm docs:toc` regenera los indices.
- Un doc cerrado no se actualiza: lo que sigue siendo verdad se muda al canon, lo que murio va a [DEAD.md](design/DEAD.md).

| Que sabes | Donde va |
|---|---|
| Como funciona esta funcion | el codigo |
| Por que esto parece raro | un comentario junto a esa linea |
| Que valor, orden o gate es contrato | el doc del tema |
| Por que elegimos A y no B | RFC o nota de decision |
| Como se repite un proceso | [iteration-guide.md](design/iteration-guide.md) |

Si un recien llegado puede deducirlo leyendo el archivo que toca, no es doc. Un
doc se paga al mantenerlo, no al escribirlo: documentar lo obvio es deuda.

## Mapa de preguntas

Solo entra la pregunta que alguien hizo de verdad. Si no tiene respuesta clara,
eso es una senal sobre el doc, no sobre el indice.

Esto es para humanos: pregunta, doc y ancla. Los agentes entran por la tabla de
docs duenos de `AGENTS.md`.

| Pregunta | Respuesta en una linea | Donde |
|---|---|---|
| Como se compone una seccion nueva? | primitivo `Section` primero (shell + debug), luego tokens y ritmo | [sections.md](design/sections.md) 1 |
| Cual es el gap entre secciones? | `SECTION_GAP` y los pares de espaciadores, en codigo `lib/rhythm.ts` | [sections.md](design/sections.md) 2 |
| Por que el featured se apila en ciertas pantallas? | one-slide rule, sin pin de GSAP | [sections.md](design/sections.md) 4.4 |
| Que geometria tiene el detalle de proyecto? | tabs, galeria y el Volver como `<a href="/">` real | [components-detail.md](design/components-detail.md) 4.10 |
| Que imagen se sirve en cada breakpoint? | gates de media por `sizes` y `quality` | [motion.md](design/motion.md) 3 |
| Como se anima la entrada de un titulo? | patron GSAP unificado, con excepciones documentadas | [motion.md](design/motion.md) 5 |
| Por que la aurora se mueve? | observer + animacion de fondo, no loop de React | [motion.md](design/motion.md) 6 |
| Como se aplica el tema oscuro? | `class="dark"` renderizado por el servidor, sin provider | [platform.md](design/platform.md) 7 |
| Como funciona el scroll suave? | Lenis desktop-only, restaurador y watchdog | [platform.md](design/platform.md) 8 |
| Como activo el overlay de debug? | canal de `Section.debug`; detalle en la skill `layout-debug-canon` | [platform.md](design/platform.md) 10 |
| Que gotchas tiene el entorno? | Turbopack, `@source`, cache de dev | [platform.md](design/platform.md) 11 |
| Que variante de Button uso en cada sitio? | inventario verificado por seccion | [buttons.md](design/buttons.md) 8 |
| Puedo usar `text-white`? | regla y sus excepciones acotadas | [iteration-guide.md](design/iteration-guide.md) 5 |
| Como decido serif, sans o mono? | flujo de decision por familia y funcion | [iteration-guide.md](design/iteration-guide.md) 3 |
| Que token fluido uso para el titulo de una card? | `text-fluid-card-title`; el resto en la tabla de 13 | [typography-families.md](design/typography-families.md) 2 |
| Que valor tiene este color? | tokens de color y sus roles, extraidos de `globals.css` | [tokens.md](design/tokens.md) 2 |
| De donde sale el espejo del tema? | se extrae de `app/globals.css`, no se edita a mano | [tailwind-v4-theme.css](design/tailwind-v4-theme.css) |
| Como se comporta el lightbox con teclado? | trap de foco, lecciones de siete rondas de QA | [pointer-gestures.md](design/pointer-gestures.md) |
| Como se anima cada seccion y por que? | patron unificado y excepciones | [section-animations.md](design/section-animations.md) |
| Por que se tomo esta decision y no otra? | RFC fechado; se congela al aprobar | [docs/rfcs/](rfcs/) |
| Por que pasaba este bug de rendimiento? | auditoria fechada con su metodo | [docs/issues/](issues/) |
| Que se esta trabajando ahora? | tarea ODD abierta, cierra al mergear | [odd/tasks/](../odd/tasks/) |
| Como se dice esto en ingles? | clave en `data/translations.ts` y `t()` | [i18n.md](i18n.md) |
| Donde vivia el canon anterior? | snapshot byte-igual, congelado | [INDEX.md](design/archive/2026-09-21-pre-designmd/INDEX.md) |
| Que simbolo se retiro y que lo sustituye? | tabla de nombres muertos, verifica el gate | [DEAD.md](design/DEAD.md) |

## Areas

| Area | Que hay | Indice |
|---|---|---|
| Canon de diseno | como se ve y como se comporta el sitio, verificado contra el codigo | [design/README.md](design/README.md) |
| Decisiones | RFC con alternativas descartadas; se congelan al aprobar | [docs/rfcs/](rfcs/) |
| Auditorias | mediciones e incidencias fechadas | [docs/issues/](issues/) |
| Trabajo | tareas ODD en curso y cerradas | [odd/tasks/](../odd/tasks/) |

Si cambia la estructura del canon (archivo nuevo, renombrado o eliminado),
actualiza la tabla de [design/README.md](design/README.md) en el mismo commit:
ese archivo es el indice de archivos, no de contenido.

## Reglas de vida

| Carpeta | Vida | Obligacion |
|---|---|---|
| `docs/design/` | VIVO | debe ser verdad hoy |
| `docs/rfcs/` | DECISION | se congela al aprobar; se supera con otro |
| `docs/issues/` | INSTANTANEA | fechada; nunca finge ser actual |
| `docs/projects/` | DECISION o TRABAJO | segun el doc; si no se sabe, no es canon |
| `odd/tasks/` | TRABAJO | cierra al mergear |
| `docs/design/archive/` | CONGELADO | no se edita |
| `docs/*.md` (raiz) | VIVO | guia corta; mismo trato que el canon |

Solo VIVO tiene la obligacion de ser verdad hoy, y solo VIVO se verifica
mecanicamente. Un doc de `issues/` puede citar una tecnica retirada sin mentir:
es el registro de su momento.

**Un doc cerrado no se actualiza.** Si una tarea ODD vieja o un RFC aprobado dice
algo que ya no es cierto, no se reescribe: dejaria de ser el registro de lo que se
decidio. Lo que siga siendo verdad se muda al canon; lo que murio, a
`docs/design/DEAD.md`. El linter no los lee como verdad, asi que nunca te va a
pedir que los toques.

## La regla que sustituye a "esto requiere docs?"

Mira la afirmacion, no el tipo de archivo: **puedes senalar la frase de un doc
VIVO que se vuelve falsa?** Si no, `Docs: none - <motivo>` en el commit y cero
lecturas. Si si, editas esa frase en el doc dueno, en el mismo commit.
`pnpm lint:docs` no decide esto: solo comprueba lo que nadie puede olvidar (mapa,
TOC, nombres muertos y la tabla de docs duenos), una vez al cerrar el track.
