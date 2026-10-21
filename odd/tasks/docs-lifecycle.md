# Feature: documentacion navegable - canon partido por pregunta, indice que no miente y registro de nombres muertos (docs-lifecycle)

## Objective
Implementar `docs/rfcs/docs-lifecycle.md` (revision 2) en el worktree `docs-lifecycle`, rama `docs/lifecycle`, ya rebaseada sobre `origin/main` c3b90e5. Entrega: `docs/README.md` como punto de entrada unico con mapa de preguntas, particion de `components.md` en tres docs, TOC generado por script, `docs/design/DEAD.md` con el linter C1-C3 + aviso C4, y la regla por afirmacion en `AGENTS.md`.

Cinco work units. La primera es una **re-medicion**, no codigo: el RFC se midio antes de los 18 commits que main mergeo despues.

## Problem
La evidencia del RFC (tabla de lineas de la seccion 1, particion de la seccion 6, "seis docs de mas de 120 lineas", "mas de 40 referencias") se tomo contra el canon anterior al merge de `css-first-reveal` y del track de imagenes/scroll/navegacion. Ese merge toco `docs/design/components.md`, `section-animations.md`, `tokens.md`, `iteration-guide.md`, `docs/issues/*` y `AGENTS.md`.

Partir un archivo de 721 lineas usando secciones de otra version es el fallo tipico de este refactor: la tabla de la seccion 6 apunta a numeros de seccion, y esos numeros ya pueden haber cambiado; C2 (TOC) y C4 (aviso de 300) eligen destinatarios por conteo de lineas; C3 depende de que los tokens de `DEAD.md` sigan apareciendo en el canon vivo.

## Why
- Cada cifra vieja convierte una WU de movimiento en una WU de arqueologia. El RFC pide "movimiento, no resumen" (seccion 14); mover exige saber que hay hoy.
- La medicion cuesta una sesion de lectura y comandos; hacer el refactor sobre el mapa viejo cuesta el refactor entero.
- El resultado de la medicion es tambien un criterio de aceptacion: si la particion de la seccion 6 ya no cubre las secciones actuales, el plan no estaba listo.

## Scope

**IN**

| Archivo | Cambio |
|---|---|
| `odd/tasks/docs-lifecycle.md` | nuevo: este plan + bloque de medicion (T1) |
| `docs/rfcs/docs-lifecycle.md` | solo secciones 1 y 6 (cifras y particion), si la medicion las desmiente |
| `scripts/docs.mjs` + `package.json` | nuevo; alias `lint:docs` y `docs:toc` (T2) |
| docs VIVO de mas de 120 lineas | bloque `toc:start`/`toc:end` (T2, regenerado en T3) |
| `docs/design/sections.md`, `motion.md`, `platform.md`, `components-detail.md` | nuevos, por particion de `components.md` (decision 1) |
| `docs/design/iteration-guide.md` | recibe la seccion 12 (checklist) y las deudas distribuidas (T3) |
| `docs/README.md` | nuevo: mapa de preguntas, areas, reglas de vida (T3) |
| `docs/design/README.md` | conserva solo la tabla de archivos; el mapa se muda (T3) |
| referencias a `components.md` | grep + actualizacion de las **vivas** en la misma WU (T3) |
| `docs/design/DEAD.md` | nuevo + regla C3 (T4) |
| `AGENTS.md` | regla por afirmacion, tabla de docs duenos, gate de cierre (T5) |

**OUT (explicito)**
- NO reescribir el contenido del canon: mover y partir, nunca resumir (seccion 16).
- NO cambiar la taxonomia de carpetas ni crear `docs/README` por area extra.
- NO tocar `docs/design/archive/` (congelado).
- NO tocar tareas ODD cerradas ni RFCs aprobados aunque citen `components.md`: son registro (seccion 5).
- NO SSOT con columna "Aplica si", NO frontmatter de estado, NO index seccional a mano.
- NO workflow de CI ni hooks de git: el gate es un paso del cierre.
- NO tocar codigo de la app, `app/globals.css` incluido.

## Constraints
- Un commit por work unit, conventional commits en ingles. Nunca commitear sin permiso explicito.
- Solo lo VIVO tiene obligacion de ser verdad; el linter no lee `issues/`, `rfcs/` ni `odd/`.
- ASCII estandar para sintaxis y operadores; sin caracteres Unicode que sustituyan ASCII.
- La particion conserva el texto: cero perdida de contenido (seccion 14).
- Cada cifra del plan se apoya en un comando reproducido en la tarea, no en memoria.
- EOL preservado por el script: detecta `\r\n` y escribe igual, nunca normaliza el archivo entero.

## Tasks

### T1 (WU1) - Re-medicion del canon contra main `c3b90e5`
Solo lectura sobre el repo; escribe un unico bloque fechado en este archivo y, si procede, corrige las secciones 1 y 6 del RFC.

- [x] M1 conteos reales: `(Get-Content <f>).Count` para los ocho docs del canon, el espejo CSS y `docs/i18n.md`. Comparar con la tabla de la seccion 1.
- [x] M2 secciones de `components.md`: listar H2 con numero de linea (`Select-String '^## '`). Verificar que existen las 13 secciones y que la particion de la seccion 6 (1,2,4,9 / 3,5,6 / 7,8,10,11 / 12 / 13) sigue apuntando a lo que dice.
- [x] M3 mapa de preguntas de `docs/design/README.md`: contar filas y comprobar si sigue en ocho preguntas.
- [x] M4 referencias a `components.md`: `grep -rn` sobre el repo, separando vivas (canon, `AGENTS.md`, skills del usuario) de cerradas (ODD cerradas, RFCs aprobados, `archive/`). Da el numero real a actualizar en T3.
- [x] M5 umbrales: conjunto exacto de docs VIVO de mas de 120 lineas (destinatarios de C2) y de mas de 300 (aviso C4). De aqui sale si "seis docs grandes" es cierto.
- [x] M6 nombres muertos: `grep` de los ocho tokens de la tabla de la seccion 8 (`FadeIn`, `FadeInStagger`, `FadeInItem`, `motion-primitives.tsx`, `FEATURED_STACK_GATE`, `PIN_MEDIA`, `next-themes`, `ThemeProvider`) en docs VIVO. Determina si C3 nace en verde o en rojo.
- [x] M7 areas reales: contenido de `docs/projects/`, `docs/issues/`, `docs/rfcs/`, `odd/tasks/`; confirmar que `docs/README.md` no existe y que la tabla de vida de la seccion 5 no declara carpetas inexistentes.
- [x] M8 superficie: confirmar ausencia de `scripts/docs.mjs`, de los alias en `package.json` y de `.github/workflows`. (Verificado: no hay script, no hay alias, no hay CI.)
- [x] M9 veredicto: escribir una linea por punto con "confirmado" o "corregido (antes -> ahora)" y el veredicto de la particion: sigue valida o mapa nuevo.

### Medicion (re-baseline 2026-10-21, base `c3b90e5`)

Metodo: conteo con `(Get-Content -LiteralPath <f>).Count`. Ojo: `Measure-Object -Line` **no** cuenta lineas en blanco y devuelve 692 para `components.md`; no usarlo.

**M1 - Conteos (antes -> ahora)**

| Archivo | RFC seccion 1 | Real | Delta |
|---|---|---|---|
| `docs/design/components.md` | 721 | 754 | +33 |
| `docs/design/section-animations.md` | 281 | 304 | +23 |
| `docs/design/tokens.md` | 281 | 290 | +9 |
| `docs/design/typography-families.md` | 246 | 246 | = |
| `docs/design/iteration-guide.md` | 198 | 199 | +1 |
| `buttons.md` + `pointer-gestures.md` + `README.md` | 295 | 143 + 89 + 63 = 295 | = |
| espejo `tailwind-v4-theme.css` | 302 | 302 | = |
| total canon (8 md) | ~2.022 | 2.088 | +66 |

**M2 - Secciones de `components.md`: confirmado, 13 y mismo orden.** Rangos: 1:25-40, 2:41-91, 3:92-104, **4:105-550 (446 lineas)**, 5:551-581, 6:582-592, 7:593-605, 8:606-665, 9:666-676, 10:677-700, 11:701-717, 12:718-727, 13:728-754.

**M3 - Mapa de preguntas: confirmado, 8 filas** (`docs/design/README.md` 54-63). Corregido: 3 de esas filas apuntan a `components.md` (2, 4.4, 10), que la particion reparte en dos docs distintos.

**M4 - Referencias: total 70, vivas 9.** Vivas: `docs/design/README.md` 4, `pointer-gestures.md` 1, `tokens.md` 1, `buttons.md` 1, `iteration-guide.md` 1, `.agents/skills/layout-debug-canon/SKILL.md` 1. `AGENTS.md`: **cero** (el RFC lo listaba; es falso). Cerradas: `odd/tasks/` 33, `docs/rfcs/` 7, `docs/issues/` 1, `archive/` 7. El coste de la seccion 6 ("una hora", "40+ referencias") queda en 9 lineas de 6 archivos.

**M5 - Umbrales: confirmado "seis docs de mas de 120"**: components 754, section-animations 304, tokens 290, typography-families 246, iteration-guide 199, buttons 143. De mas de 300 al nacer: **components 754 y section-animations 304**. Corregido: el RFC predecia aviso en `tokens.md` y `section-animations.md` a 281; `tokens.md` queda por debajo (290) y solo `section-animations.md` mantiene el aviso tras la particion.

**M6 - Nombres muertos en canon vivo: 14 coincidencias. C3 nace en ROJO.** `components.md` 100, 327, 564, 574-575, 596; `iteration-guide.md` 165; `section-animations.md` 159, 237, 245, 248-249, 253; `tokens.md` 248. Son prosa que **explica el retiro** ("se retiro", "NO reintroducir", "ya no existe"), no referencias vivas. Requiere decision de alcance antes de T4.

**M7 - Areas: `docs/projects/` existe** (`caf-seguridad/`, `candidatos/`, `drafts/`, `resumen-portfolio.md`, `Unity.gitignore`). `docs/README.md` no existe. `docs/design/` tiene 8 md + el espejo CSS + `archive/` + `ejemplos/`. `odd/tasks/` tenia 16 tareas antes de esta. La tabla de vida de la seccion 5 no declara carpetas inexistentes.

**M8 - Superficie: confirmado.** No hay `scripts/docs.mjs`, ni `lint:docs`/`docs:toc` en `package.json`, ni `.github/workflows`.

**M9 - Veredicto.** La particion de la seccion 6 **no era valida tal cual**: los numeros de seccion existen, pero el reparto por secciones daba 524 / 55 / 114 lineas (1,2,4,9 / 3,5,6 / 7,8,10,11), con la seccion 4 sola ocupando 446. El RFC prometia "tres docs de 220-250" y su propio doc resultante rompia la regla de 250 que el RFC crea. **Re-decidido con el propietario el 2026-10-21**: ver decision 1. El RFC ya lleva la tabla nueva y los conteos corregidos en las secciones 1 y 6.

## Decisiones (cerradas con el usuario)

1. **Particion de `components.md` (2026-10-21)**: se corta por el limite natural de la seccion 4, no por numero de seccion.

   | Doc | Contenido | Lineas |
   |---|---|---|
   | `sections.md` | 1 Shell, 2 contrato de ritmo, 4.1-4.4 (navbar, hero, about, featured), 9 cue | 311 |
   | `motion.md` | 3 gates de media, 5 reveal y motion, 6 aurora | 67 |
   | `platform.md` | 7 tema/dark, 8 scroll, 10 debug overlay, 11 gotchas | 133 |
   | `components-detail.md` | 4.5-4.13 (all-projects, card, pricing, contacto, footer, detalle, auxiliares) | 262 |
   | `iteration-guide.md` | recibe 12 checklist | +24 |
   | deuda 13 | se distribuye al tema dueno (13.1/13.7 detail, 13.2 motion, 13.3 platform, 13.4 sections, 13.5/13.6 guide) | +27 |

   `sections.md` queda en 311 (no en los 289 estimados: cabecera, bloque TOC y deuda suman 22). Sigue por debajo de `section-animations.md` y se acepta como segunda excepcion de C4. Alternativas descartadas: equilibrado en cuatro docs (rompe la agrupacion por tema) y regla subida a 300 (el doc naceria con 524).

**Salida**: bloque `## Medicion (re-baseline 2026-10-21, base c3b90e5)` en este archivo. Si la medicion contradice el RFC, se corrige ahi mismo en este WU (el RFC esta en estado PROPUESTO: aun no es registro congelado).

**Commit**: `docs(odd): re-baseline the docs canon measurement against main`

### T2 (WU2) - Herramienta y TOC
- [x] T2.1 `scripts/docs.mjs` con `check` (C1 y C2 en modo aviso) y `toc --write`; `--help` de cinco lineas; sin dependencias; codigos de salida 0/1/2.
- [x] T2.2 Parser fence-aware, slug compatible con GitHub con sufijo `-1`, `-2` en duplicados, EOL preservado, TOC solo si falta y justo tras el H1.
- [x] T2.3 `package.json`: `lint:docs` y `docs:toc`.
- [x] T2.4 Insertar el bloque TOC en los docs VIVO que M5 marque por encima de 120 lineas.
- [x] T2.5 Verificar: `node --check scripts/docs.mjs`, `pnpm docs:toc` idempotente (segunda pasada sin diff), `pnpm lint:docs` en 0 o solo avisos. PASS: segunda pasada escribe 0 archivos.
- [x] T2.6 Commit de la WU. (`542eacd`)

### T3 (WU3) - Particion y punto de entrada
- [x] T3.1 Crear `sections.md` (§1, §2, §4.1-4.4, §9), `motion.md` (§3, §5, §6), `platform.md` (§7, §8, §10, §11) y `components-detail.md` (§4.5-4.13) moviendo el texto tal cual; seccion 12 a `iteration-guide.md`; seccion 13 distribuida al tema dueno (decision 1).
- [x] T3.2 Borrar `components.md` y actualizar con grep las referencias **vivas** del inventario M4; las cerradas no se tocan. PASS: 9 lineas en 6 archivos (pointer-gestures, tokens, buttons, iteration-guide, `design/README.md`, skill `layout-debug-canon`).
- [x] T3.3 `docs/README.md`: mapa de preguntas (24 filas), areas, reglas de vida, guia de uso de la seccion 15 del RFC.
- [x] T3.4 `docs/design/README.md`: queda con su tabla de archivos y el enlace al mapa nuevo; fuera el mapa duplicado.
- [x] T3.5 `pnpm docs:toc` sobre los archivos nuevos; `pnpm lint:docs` sin errores de C1/C2. PASS: C1 en 0 con enlaces reales.
- [x] T3.6 Verificar que no se perdio texto: los 13 H2 y las 13 subsecciones 4.x tienen destino, y los marcadores (`FEATURED_STACK_GATE`, `Aurora`, `DarkModeToggle`, `ScrollRestorer`, `13.7`, `12. CheckList`) aparecen en su archivo nuevo.
- [x] T3.7 Commit de la WU.

**Hallazgo de T3**: cinco docs (`buttons`, `tokens`, `typography-families`, `iteration-guide`, y el difunto `components`) llevaban una lista manual `Contenido:` que duplicaba el TOC generado. Se borraron las cuatro que siguen vivas; el TOC las sustituye. Efecto medido: `tokens.md` vuelve de 302 a 290 y sale del aviso C4.

**Hallazgo de T3 (split)**: los H3 4.x no viajan con su H2, asi que `components-detail.md` necesitaba un H2 propio; sin el, el TOC del archivo solo listaba la deuda. Corregido con `## 4. Geometria por componente (4.5-4.13)` y, en `sections.md`, `(4.1-4.4)`.

### T4 (WU4) - Nombres muertos
- [x] T4.1 `docs/design/DEAD.md` con las filas del RFC, ajustadas a lo que M6 demostro. PASS: 3 filas; `PIN_MEDIA` se quito porque nunca existio en el canon vivo (0 coincidencias en `HEAD:docs/design/components.md`), solo en la prosa del RFC.
- [x] T4.2 C3 implementado con limites de palabra y exencion `<!-- docs-lint: allow-tokens ... -->`; `DEAD.md` y `archive/` excluidos del escaneo.
- [x] T4.3 Verificar que C3 pasa sobre el canon partido y falla si se inyecta un token a mano. PASS: inyectado `FadeIn` en `sections.md`, C3 lo reporta en la linea exacta; revertido y el archivo vuelve a 311 lineas.
- [x] T4.4 Commit de la WU.

**Hallazgo de T4**: las 14 menciones de M6 son historial legitimo, asi que 6 de los 11 docs vivos llevan `allow-tokens` (`motion`, `components-detail`, `platform`, `tokens`, `iteration-guide`, `section-animations`). Es la exencion que el RFC disena, pero conviene saber el numero: un check con media canon exento solo vigila la mitad. Alternativa si molesta: C3 solo dispara cuando la linea **no** contiene una senal de retiro (`retiro`, `ya no`, `antes`, `sustitu`, `reintroducir`...). Se descarto por ahora por ser heuristica, no regla.

### T5 (WU5) - Contrato del agente y gate
- [x] T5.1 `AGENTS.md`: regla por afirmacion, tabla de docs duenos de la seccion 11, gate de cierre, regla de DEAD, regla de las 250 lineas.
- [x] T5.2 C1-C3 pasan a bloqueantes (C4 sigue en aviso), documentado en `AGENTS.md` y en `docs/README.md`. Implementado con `MIGRATION = false` y un nivel `note` propio para C4, para que el aviso de tamano nunca bloquee.
- [x] T5.3 `docs/README.md`: guia de uso de la seccion 15 (reparto "que sabes / donde va") + las reglas de vida.
- [x] T5.4 `pnpm lint:docs` en 0; commit de la WU.

**Prueba negativa del gate (T5)**: inyectar `FadeIn` en `sections.md` da `error` + `exit=1`; el arbol limpio da `exit=0` con dos avisos C4. El gate bloquea de verdad, no solo informa.

**Cierre del track (seccion 9.2 del RFC)**: las tres preguntas, los borrados del diff y `pnpm lint:docs`.

## Acceptance criteria
- Cada cifra de la seccion 1 del RFC esta confirmada o corregida, con el comando que la produjo, en el bloque de medicion.
- La tabla de particion apunta a secciones que existen hoy; toda seccion de `components.md` tiene destino unico.
- `docs/README.md` responde las preguntas del mapa sin abrir un doc de mas de 250 lineas.
- `grep -rn "components.md"` no devuelve coincidencias vivas (canon, `AGENTS.md`); las cerradas siguen intactas.
- `pnpm lint:docs` exit 0 al cerrar; C1, C2 y C3 bloquean, C4 solo avisa.
- Cero perdida de contenido: cada seccion de `components.md` aparece integra en su doc destino.
- `pnpm docs:toc` es idempotente y no normaliza EOL.

## Applicable checks
- `node --check scripts/docs.mjs`
- `pnpm docs:toc` (segunda pasada sin diff)
- `pnpm lint:docs` (exit 0; C4 puede avisar)
- `grep` de referencias a `components.md` y de los tokens de `DEAD.md`
- conteo de lineas antes/despues de la particion
- Sin build ni typecheck por WU: el cambio es markdown, `scripts/` no entra en el bundle y `package.json` solo gana alias. Si T2 toca `package.json` de forma no trivial, `pnpm typecheck` al cerrar el track.

## Route
- Un solo writer, sin subagentes: cada WU depende del estado de la anterior y las decisiones de docs son del propietario.
- T1 es solo lectura + una edicion de markdown: el coste medido en requests es bajo y evita rehacer T3.

## Delivery strategy
- Cinco work units en `docs/lifecycle` (worktree `docs-lifecycle`), un commit por WU.
- Orden obligatorio: T1 mide -> T2 instala la herramienta -> T3 mueve contenido -> T4 vigila nombres -> T5 fija el contrato. T2 es inerte: en modo aviso no bloquea nada.
- Sin PR hasta validacion del usuario; el merge a `main` es del usuario.
- Forecast: la particion es la mitad del trabajo; el resto son tres piezas pequenas.
