# Plan — pase de documentación (antes del primer write)

Estado: **borrador para juicio**. Cierra la feature `projects-catalog`.

## Hechos medidos (inventario sobre el árbol)

- **C4 (300 líneas) es un `note`, no bloquea**: `scripts/docs.mjs:26` `SIZE_WARN_LINES = 300`,
  emitido como `note` (`:377-383`); `report()` solo bloquea `error`, o `warning` con
  `MIGRATION === false` (`:465-467`). El exit del gate sigue siendo 0.
- **Cinco docs exceden**: `section-animations.md` 390, `platform.md` 375,
  `components-detail.md` 355, `sections.md` 334, `tokens.md` 302.
- **Un split tiene consecuencias duras del gate**: C1 exige que todo doc VIVO sea
  alcanzable desde `docs/README.md` en ≤2 saltos y, con `MIGRATION === false`, esa
  advertencia **bloquea** (`:321-360`); C1 además valida que la celda `](file.md) N.N` del
  `## Mapa de preguntas` corresponda a un encabezado que empiece por `N`/`N.N`
  (`:362-377`); C2 exige TOC a todo archivo >120 líneas (`:25`, `:195-210`); C3 busca
  tokens de DEAD.md **por archivo**, con allow-tokens propio (`:391-400`).
- **Los topes numéricos están duplicados y una copia ya es falsa**: 300 líneas aparece en
  `docs/README.md:11` y en `scripts/docs.mjs:26`, y el RFC `docs-lifecycle.md` conserva una
  variante vieja de "250" (`:128,337,391`). Pasa lo mismo con 120 (TOC), 40 (filas del
  mapa) y 80 (AGENTS).
- **Once reglas viven en dos o más archivos** (listadas por el inventario), incluidas la
  propiedad de QA, el inventario de guards y la obligación de DEAD.

## Decisiones propuestas

**D1. No se sube el límite.** 300 líneas es una regla del propio canon
(`docs/README.md:11`: "un doc que lo pase es dos docs") y hoy no bloquea nada. Subirlo
para que los archivos entren sería mover el objetivo, no resolverlo.

**D2. Se parte por tema, no por número.** Un doc 2-34 líneas por encima no es un doc con
dos temas: partirlo produce archivos delgados que nadie lee. Se parte donde hay dos temas
reales y el resto queda como está, con la desviación anotada.

**D3. El contenido se corrige ANTES de partir.** Partir un doc que afirma cosas viejas
obliga a corregirlas en dos lugares.

**D4. El tope se declara una sola vez.** Los docs no repiten el número: apuntan a
`scripts/docs.mjs` como autoridad, y se corrige la variante vieja del RFC.

## C1..C8 — afirmaciones a confirmar o refutar

- **C1.** C4 no bloquea hoy, así que la deuda es de legibilidad, no de CI, y ninguna
  tarea de este plan puede romper el gate por el límite de líneas.
- **C2.** Partir un doc puede **romper el gate** por C1 (doc inalcanzable bloquea con
  `MIGRATION === false`), no por el límite. Toda partición necesita su fila en
  `docs/README.md` y, si el hijo pasa de 120 líneas, su propio TOC.
- **C3.** `platform.md` tiene dos temas separables: el aparato de anclas/scroll
  (`useScrollToAnchor`, `announceArrival`, `anchor-arrival`, `scrollOwnerClaim`, F5) y el
  resto (tema, fondo del navbar, debug). La frontera no rompe anclas citadas.
- **C4.** `components-detail.md` tiene dos temas separables: cards/detalle y la página
  del catálogo (4.5 + 4.5b).
- **C5.** `sections.md` y `tokens.md`, aunque exceden, **no** tienen dos temas: su exceso
  es densidad de una sola cosa.
- **C6.** Ninguna de las once reglas duplicadas requiere tocar código; se resuelven
  dejando una afirmación y una referencia. La excepción es el RFC, que está fuera del
  gate (`docs/rfcs/**` no es VIVO) y solo necesita la corrección del número viejo.
- **C7.** Corregir las afirmaciones de esta rama es independiente de partir archivos, y
  puede shipearse solo.
- **C8.** El pase de docs no introduce riesgo de comportamiento: ningún archivo de
  `app/`, `components/`, `hooks/` ni `lib/` se toca.

## Tareas

**T-D1 — Corregir las afirmaciones de esta rama** (independiente, primero).
`components-detail.md` (modelo `home`, enlace al catálogo y su rampa, 4.5b con
`SECTION_GAP_Y`, `mediaFit` como contrato de la ficha y no de la card, sello, borde);
`platform.md` (handoff de las dos grillas, `scrollOwnerClaim`, guarda de pathname, F5);
`sections.md` (navbar route-aware, montaje del catálogo, `pathname` decidiendo el activo);
`tokens.md` (si `SECTION_GAP_Y` deja de ser "excepción única" de contacto).

**T-D2 — Declarar el tope una sola vez.** `docs/README.md` y `AGENTS.md` apuntan a
`scripts/docs.mjs` como autoridad del número; se corrige la variante 250 del RFC
`docs-lifecycle.md`.

**T-D3 — Partir dos archivos, por tema.**
`platform.md` → `platform.md` (tema/fondo/debug) + `scroll-and-anchors.md` (el aparato de
anclas, scroll y restauración). `components-detail.md` → `components-detail.md`
(cards/detalle) + `catalogue.md` (4.5 y 4.5b).
Cada hijo entra en `docs/design/README.md`, en el mapa de preguntas de `docs/README.md` y
en la tabla de dueños de `AGENTS.md`; TOC si pasa de 120 líneas.

**T-D4 — Dejar anotadas las dos desviaciones** (`sections.md` 334, `tokens.md` 302) con
una línea que diga por qué no se parten, para que el próximo no las descubra como deuda
nueva.

**T-D5 — Juicio LIGHT de las afirmaciones.** Antes de cerrar, las afirmaciones escritas en
T-D1 pasan por el flujo `outbound-text.md` de la skill de jueces: un lector que verifica
contra el código, no contra mi resumen.

## Lo que el plan no resuelve

- El gate no distingue "doc largo" de "doc con dos temas": el criterio de T-D3 es juicio,
  no una regla verificable.
- Los rangos de línea del inventario dentro de bullets largos son aproximados.
- `docs/projects/**` queda fuera del gate y fuera de este plan; sus docs se actualizan con
  el contenido de Forge y Secure, después.

## Adjudicación — ronda 1 (jueces A y B, hash `15d3ae53`)

**Coinciden (queda cerrado):**
- **Todas mis citas a `docs.mjs` estaban mal.** Ambos corrigieron las ocho. Las heredé del
  inventario sin abrir el archivo, que es exactamente lo que el protocolo prohíbe. Las
  correctas: límite `:18`, emisión `:320-324`, bloqueo `:474-476`, C1 `:263-301`, citas
  `:304-318`, TOC `:17`, DEAD `:328-350`.
- **C1 confirmada**: ambos corrieron el gate, `exit 0`, C4 es `note`.
- **C2 parcial, mismo mecanismo**: lo que bloquea un split es `checkMapSections`
  (`:304-318`, `error`), no la alcanzabilidad. Un TOC faltante es `note`, y un hijo
  enlazado desde `design/README.md` es alcanzable en 2 saltos: la fila en `README.md` es
  política, no gate. (B detectó que la fila es innecesaria para el gate; A que el error
  por cita de sección no lo nombré.)
- **C4 parcial, ambos**: mover 4.5/4.5b deja un hijo de ~42-45 líneas — el archivo
  delgado que D2 mismo previene — y el padre en 313, todavía sobre 300: una **sexta**
  desviación sin declarar. Además `components-detail.md:15` "(4.5-4.13)" queda falso y
  `docs/design/sections.md:92` apunta a `components-detail.md 4.5b`.
- **C5 confirmada**, **C7 y C8 confirmadas**.
- **Los cuatro topes numéricos no son de carga**: los cuatro mapean a `note`.

**Discrepan y decide un hecho:**
- **C6 refutada (A).** Yo proponía corregir la variante "250" del RFC. El RFC está
  **congelado por política**: `docs-lifecycle.md:5-6` ("Se congela aquí: una corrección
  futura es otro RFC") y `docs/README.md:84,95-99`. Y su "250" no es una copia vieja:
  `:128-130` la contrasta con el aviso actual de 300. T-D2 **se cae**.
- **D4 invertida (A).** `scripts/docs.mjs:3` dice "Policy lives in docs/README.md and
  AGENTS.md, never here". Los números viven en los docs como política y el código los
  implementa; hacer que los docs apunten al código es al revés.
- **C3 parcial (A contra B).** §8 es 290 de 375 líneas — el split queda **invertido** —
  y hay hechos de anclas FUERA de §8 (`platform.md:351`, `:361-372`): moverlo sin ellos
  duplica la regla. La frontera correcta es §8 + esos dos bloques.

**La inversión que ambos se señalaron:** lo de carga no son los números, es el
**contrato de citas de sección** — y el gate solo lo exige para `docs/README.md`
(`:304-318`), así que `DEAD.md:21`, `sections.md:92` y `AGENTS.md:56` se pudren en silencio.

### Tareas corregidas (superseden a T-D2, T-D3 y T-D4)

**T-D1 — sin cambios.** Corregir las afirmaciones de esta rama. Es lo único obligatorio e
independiente.

**T-D2' — Reparar las citas que el gate no vigila.** `docs/design/sections.md:92` →
`components-detail.md 4.5b`; `AGENTS.md:56` (nombra scroll bajo `platform.md`);
`docs/design/README.md:27` ("4.5-4.13") y `:29` ("7, 8, 10, 11"); `DEAD.md:21`. Y
`docs/README.md:11`, cuya frase "un doc que lo pase es dos docs" este plan vuelve falsa
si no se toca.

**T-D3' — Partir solo `platform.md`, con los hechos fuera de §8.** Nuevo
`docs/design/scroll-and-anchors.md` = §8 + `:351` + `:361-372`; repuntar
`docs/README.md:46` al hijo; fila en `docs/design/README.md`; partir el vocabulario de
`AGENTS.md:53,56`. **Repuntar, nunca renumerar**: `design/README.md:37-40` dejó la
numeración fija "vivan donde vivan".

**T-D4' — No partir `components-detail.md`.** Un hijo de 45 líneas y un padre de 313 no
resuelve nada y empeora la lectura. La desviación se anota con ese motivo, junto con
`sections.md` y `tokens.md`. Tampoco se toca el RFC.

**T-D5 — sin cambios.** Juicio LIGHT de las afirmaciones antes de cerrar.
