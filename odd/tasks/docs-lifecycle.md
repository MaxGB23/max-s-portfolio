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
| `docs/design/sections.md`, `motion.md`, `platform.md` | nuevos, por particion de `components.md` (T3) |
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

- [ ] M1 conteos reales: `(Get-Content <f> | Measure-Object -Line).Lines` para los ocho docs del canon, el espejo CSS y `docs/i18n.md`. Comparar con la tabla de la seccion 1.
- [ ] M2 secciones de `components.md`: listar H2 con numero de linea (`Select-String '^## '`). Verificar que existen las 13 secciones y que la particion de la seccion 6 (1,2,4,9 / 3,5,6 / 7,8,10,11 / 12 / 13) sigue apuntando a lo que dice.
- [ ] M3 mapa de preguntas de `docs/design/README.md`: contar filas y comprobar si sigue en ocho preguntas.
- [ ] M4 referencias a `components.md`: `grep -rn` sobre el repo, separando vivas (canon, `AGENTS.md`, skills del usuario) de cerradas (ODD cerradas, RFCs aprobados, `archive/`). Da el numero real a actualizar en T3.
- [ ] M5 umbrales: conjunto exacto de docs VIVO de mas de 120 lineas (destinatarios de C2) y de mas de 300 (aviso C4). De aqui sale si "seis docs grandes" es cierto.
- [ ] M6 nombres muertos: `grep` de los ocho tokens de la tabla de la seccion 8 (`FadeIn`, `FadeInStagger`, `FadeInItem`, `motion-primitives.tsx`, `FEATURED_STACK_GATE`, `PIN_MEDIA`, `next-themes`, `ThemeProvider`) en docs VIVO. Determina si C3 nace en verde o en rojo.
- [ ] M7 areas reales: contenido de `docs/projects/`, `docs/issues/`, `docs/rfcs/`, `odd/tasks/`; confirmar que `docs/README.md` no existe y que la tabla de vida de la seccion 5 no declara carpetas inexistentes.
- [ ] M8 superficie: confirmar ausencia de `scripts/docs.mjs`, de los alias en `package.json` y de `.github/workflows`. (Ya verificado al abrir la WU: no hay script, no hay alias, no hay CI.)
- [ ] M9 veredicto: escribir una linea por punto con "confirmado" o "corregido (antes -> ahora)" y el veredicto de la particion: sigue valida o mapa nuevo.

**Salida**: bloque `## Medicion (re-baseline 2026-10-21, base c3b90e5)` en este archivo. Si la medicion contradice el RFC, se corrige ahi mismo en este WU (el RFC esta en estado PROPUESTO: aun no es registro congelado).

**Commit**: `docs(odd): re-baseline the docs canon measurement against main`

### T2 (WU2) - Herramienta y TOC
- [ ] T2.1 `scripts/docs.mjs` con `check` (C1 y C2 en modo aviso) y `toc --write`; `--help` de cinco lineas; sin dependencias; codigos de salida 0/1/2.
- [ ] T2.2 Parser fence-aware, slug compatible con GitHub con sufijo `-1`, `-2` en duplicados, EOL preservado, TOC solo si falta y justo tras el H1.
- [ ] T2.3 `package.json`: `lint:docs` y `docs:toc`.
- [ ] T2.4 Insertar el bloque TOC en los docs VIVO que M5 marque por encima de 120 lineas.
- [ ] T2.5 Verificar: `node --check scripts/docs.mjs`, `pnpm docs:toc` idempotente (segunda pasada sin diff), `pnpm lint:docs` en 0 o solo avisos.
- [ ] T2.6 Commit de la WU.

### T3 (WU3) - Particion y punto de entrada
- [ ] T3.1 Crear `sections.md`, `motion.md`, `platform.md` moviendo las secciones segun el mapa confirmado en M9; seccion 12 a `iteration-guide.md`; seccion 13 distribuida al tema dueno.
- [ ] T3.2 Borrar `components.md` y actualizar con grep las referencias **vivas** del inventario M4; las cerradas no se tocan.
- [ ] T3.3 `docs/README.md`: mapa de preguntas (20-25 filas, criterio: pregunta real, enlace con seccion), areas, reglas de vida, guia de uso de la seccion 15 del RFC.
- [ ] T3.4 `docs/design/README.md`: queda con su tabla de archivos y el enlace al mapa nuevo; fuera el mapa duplicado.
- [ ] T3.5 `pnpm docs:toc` sobre los archivos nuevos; `pnpm lint:docs` sin errores de C1/C2 en los docs tocados.
- [ ] T3.6 Verificar que no se perdio texto: conteo de lineas antes/despues del split y diff de contenido por seccion.
- [ ] T3.7 Commit de la WU.

### T4 (WU4) - Nombres muertos
- [ ] T4.1 `docs/design/DEAD.md` con las tres filas del RFC, ajustadas a lo que M6 demuestre.
- [ ] T4.2 C3 implementado con limites de palabra y exencion `<!-- docs-lint: allow-tokens ... -->`; `DEAD.md` y `archive/` excluidos del escaneo.
- [ ] T4.3 Verificar que C3 pasa sobre el canon partido y falla si se inyecta un token a mano (prueba y revertir).
- [ ] T4.4 Commit de la WU.

### T5 (WU5) - Contrato del agente y gate
- [ ] T5.1 `AGENTS.md`: regla por afirmacion, tabla de docs duenos de la seccion 11, gate de cierre, regla de DEAD, regla de las 250 lineas.
- [ ] T5.2 C1-C3 pasan a bloqueantes (C4 sigue en aviso), documentado en `AGENTS.md` y en `docs/README.md`.
- [ ] T5.3 `docs/README.md`: guia de uso de la seccion 15 (reparto "que sabes / donde va").
- [ ] T5.4 `pnpm lint:docs` en 0; commit de la WU.

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
