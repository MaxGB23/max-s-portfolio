# Documentación del portfolio

> [!NOTE] Estado: VIVO
> Esto es el punto de entrada y debe ser verdad hoy. `docs/rfcs/` y `docs/issues/`
> son historia fechada; `odd/tasks/` es trabajo; `docs/design/archive/` está
> congelado. Detalle en "Reglas de vida".

## Cómo se mantiene

- Si buscas algo y no está en el mapa, añade la fila: una por pregunta de usuario, no por consulta del agente. Si una fila ya apunta a esa sección, amplía su vocabulario en vez de duplicarla. El mapa no pasa de 40 filas: al llenarse, fusiona o retira la menos usada.
- El presupuesto de tamaño lo avisa el gate (`scripts/docs.mjs`, 300 líneas hoy): un doc que lo pase es dos docs. El aviso no bloquea; la partición es deuda declarada, no un mergeo roto.
- El gate valida además los enlaces (destino y ancla) de los docs VIVO y la sección citada en cada fila de este mapa: un H2 renombrado o renumerado pone el gate en rojo.
- El gate lo corre el hook `pre-commit` en cada commit que toque `docs/` o `AGENTS.md` (`pnpm hooks:install`, una vez por clon), y `commit-msg` valida el rastro `Docs:`/`Risk:` de `AGENTS.md`. Los hooks viven en `.githooks/` y se saltan a propósito con `git commit --no-verify`.
- `pnpm lint:docs` antes de cerrar un track; `pnpm docs:toc` regenera los índices.
- Un doc cerrado no se actualiza: lo que sigue siendo verdad se muda al canon, lo que murió va a [DEAD.md](design/DEAD.md).

| Qué sabes | Dónde va |
|---|---|
| Cómo funciona esta función | el código |
| Por qué esto parece raro | un comentario junto a esa línea |
| Qué valor, orden o gate es contrato | el doc del tema |
| Por qué elegimos A y no B | RFC o nota de decisión |
| Cómo se repite un proceso | [iteration-guide.md](design/iteration-guide.md) |

Si un recién llegado puede deducirlo leyendo el archivo que toca, no es doc. Un
doc se paga al mantenerlo, no al escribirlo: documentar lo obvio es deuda.

## Mapa de preguntas

Solo entra la pregunta que alguien hizo de verdad. Si no tiene respuesta clara,
eso es una señal sobre el doc, no sobre el índice.

Esto es para humanos: pregunta, doc y ancla. Los agentes entran por la tabla de
docs dueños de `AGENTS.md`.

| Pregunta | Respuesta en una línea | Dónde |
|---|---|---|
| Cómo se compone una sección nueva? | primitivo `Section` primero (shell + debug), luego tokens y ritmo | [sections.md](design/sections.md) 1 |
| Cuál es el gap entre secciones? | `SECTION_GAP` y los pares de espaciadores, en código `lib/rhythm.ts` | [sections.md](design/sections.md) 2 |
| Por qué el featured se apila en ciertas pantallas? | one-slide rule, sin pin de GSAP | [sections.md](design/sections.md) 4.4 |
| Qué geometría tiene el detalle de proyecto? | tabs, galería y el Volver como `<a href="/">` real | [components-detail.md](design/components-detail.md) 4.10 |
| Qué imagen se sirve en cada breakpoint? | gates de media por `sizes` y `quality` | [motion.md](design/motion.md) 3 |
| Cómo se anima la entrada de un título? | patrón GSAP unificado, con excepciones documentadas | [motion.md](design/motion.md) 5 |
| Por qué la aurora se mueve? | observer + animación de fondo, no loop de React | [motion.md](design/motion.md) 6 |
| Cómo se aplica el tema oscuro? | `class="dark"` renderizado por el servidor, sin provider | [platform.md](design/platform.md) 7 |
| Cómo funciona el scroll suave? | Lenis desktop-only, restaurador y watchdog | [platform.md](design/platform.md) 8 |
| Cómo activo el overlay de debug? | canal de `Section.debug`; detalle en la skill `layout-debug-canon` | [platform.md](design/platform.md) 10 |
| Qué gotchas tiene el entorno? | Turbopack, `@source`, caché de dev | [platform.md](design/platform.md) 11 |
| Qué variante de Button uso en cada sitio? | inventario verificado por sección | [buttons.md](design/buttons.md) 8 |
| Puedo usar `text-white`? | regla y sus excepciones acotadas | [iteration-guide.md](design/iteration-guide.md) 5 |
| Cómo decido serif, sans o mono? | flujo de decisión por familia y función | [iteration-guide.md](design/iteration-guide.md) 3 |
| Qué token fluido uso para el título de una card? | `text-fluid-card-title`; el resto en la tabla de 13 | [typography-families.md](design/typography-families.md) 2 |
| Qué valor tiene este color? | tokens de color y sus roles, extraídos de `globals.css` | [tokens.md](design/tokens.md) 2 |
| De dónde sale el espejo del tema? | se extrae de `app/globals.css`, no se edita a mano | [tailwind-v4-theme.css](design/tailwind-v4-theme.css) |
| Cómo se comporta el lightbox con teclado? | trap de foco, lecciones de siete rondas de QA | [pointer-gestures.md](design/pointer-gestures.md) |
| Cómo se anima cada sección y por qué? | patrón unificado y excepciones | [section-animations.md](design/section-animations.md) |
| Se rompió en silencio alguna entrada de la página (navbar, About, ...)? | `pnpm qa` lista y corre los guards manuales sobre un server; cada veredicto vive en `pnpm test` | [iteration-guide.md](design/iteration-guide.md) 12 |
| Qué capa de verificación atrapa cada error y por qué está ahí? | hooks, CI, mediciones, qa y revisión, de lo barato a lo caro | [verification-layers.md](verification-layers.md) |
| Por qué se tomó esta decisión y no otra? | RFC fechado; se congela al aprobar | [docs/rfcs/](rfcs/) |
| Por qué pasaba este bug? | auditoría o incidencia fechada con su método (rendimiento, navegación, teléfono vs devtools) | [docs/issues/](issues/) |
| Qué se está trabajando ahora? | tarea ODD abierta, cierra al mergear | [odd/tasks/](../odd/tasks/) |
| Cómo se dice esto en inglés? | clave en `data/translations.ts` y `t()` | [i18n.md](i18n.md) |
| De dónde sale la cifra de descargas o el tiempo en producción? | cifra viva del registry y duración calculada desde una fecha, con respaldo escrito | [live-data.md](live-data.md) 2 |
| Dónde vivía el canon anterior? | snapshot byte-igual, congelado | [INDEX.md](design/archive/2026-09-21-pre-designmd/INDEX.md) |
| Qué símbolo se retiró y qué lo sustituye? | tabla de nombres muertos, verifica el gate | [DEAD.md](design/DEAD.md) |

## Áreas

| Área | Qué hay | Índice |
|---|---|---|
| Canon de diseño | cómo se ve y cómo se comporta el sitio, verificado contra el código | [design/README.md](design/README.md) |
| Decisiones | RFC con alternativas descartadas; se congelan al aprobar | [docs/rfcs/](rfcs/) |
| Auditorías | mediciones e incidencias fechadas | [docs/issues/](issues/) |
| Trabajo | tareas ODD en curso y cerradas | [odd/tasks/](../odd/tasks/) |

Si cambia la estructura del canon (archivo nuevo, renombrado o eliminado),
actualiza la tabla de [design/README.md](design/README.md) en el mismo commit:
ese archivo es el índice de archivos, no de contenido.

## Reglas de vida

| Carpeta | Vida | Obligación |
|---|---|---|
| `docs/design/` | VIVO | debe ser verdad hoy |
| `docs/rfcs/` | DECISIÓN | se congela al aprobar; se supera con otro; el STATUS se escribe antes del merge |
| `docs/issues/` | INSTANTÁNEA | fechada; nunca finge ser actual |
| `docs/projects/` | DECISIÓN o TRABAJO | según el doc; si no se sabe, no es canon |
| `odd/tasks/` | TRABAJO | cierra al mergear |
| `docs/design/archive/` | CONGELADO | no se edita |
| `docs/*.md` (raíz) | VIVO | guía corta; mismo trato que el canon |

Solo VIVO tiene la obligación de ser verdad hoy, y solo VIVO se verifica
mecánicamente. Un doc de `issues/` puede citar una técnica retirada sin mentir:
es el registro de su momento.

**Un doc cerrado no se actualiza.** Si una tarea ODD vieja o un RFC aprobado dice
algo que ya no es cierto, no se reescribe: dejaría de ser el registro de lo que se
decidió. Lo que siga siendo verdad se muda al canon; lo que murió, a
`docs/design/DEAD.md`. El linter no los lee como verdad, así que nunca te va a
pedir que los toques.

Por eso un bloque `STATUS` no afirma nada que ocurra después del merge: lleva
fecha y número de PR (`APROBADO (2026-10-30), PR #19`), que existen cuando se
escribe, y nunca el hash del merge, que se descubre con `git log -- <rfc>`. Un
bloque que promete algo posterior al merge solo se cumple rompiendo la regla de
arriba.

## La regla que sustituye a "esto requiere docs?"

Mira la afirmación, no el tipo de archivo: **puedes señalar la frase de un doc
VIVO que se vuelve falsa?** Si no, `Docs: none - <motivo>` en el commit y cero
lecturas. Si sí, editas esa frase en el doc dueño, en el mismo commit.
`pnpm lint:docs` no decide esto: solo comprueba lo que nadie puede olvidar (mapa,
TOC, nombres muertos y la tabla de docs dueños), una vez al cerrar el track.
