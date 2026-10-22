# Feature: verificacion de docs antes del merge - gate con anclas, hooks locales y CI (docs-verification)

Endurecer la verificacion documental de este repo: que el gate valide lo que de verdad
se rompe (anclas y rastro de commits), que corra en el momento del commit y no solo al
cerrar un track, y que exista un ejecutor externo antes del merge.

## Specs

S1 - Hooks locales (sin dependencias).
> **`core.hooksPath` local** (sin dependencias): `pre-commit` corre `pnpm lint:docs` solo si hay `docs/`/`AGENTS.md` en el índice; `commit-msg` valida `Docs:`/`Risk:`. Cierra el agujero de hoy en el momento exacto en que se produce.

S2 - Anclas y fixtures del gate.
> **Anclas + fixtures del gate** (código, no política).
> Los anclas no se validan. `LINK_RE` corta en `#` (`target.split('#')[0]`). El mapa de `docs/README.md` vale precisamente por "pregunta → doc **+ ancla de sección**, y un H2 renombrado rompe el enlace sin que nadie se entere. Ya tienes `headings()` y `slugify()` en el script: resolver el fragmento son ~20 líneas. **Es el check con mejor relación coste/valor de todo el gate.**
> Un `test` con 5-6 fixtures (TOC ausente, ancla rota, nombre muerto exento, tabla de dueños con path inexistente) es el trabajo de mayor apalancamiento.

S3 - CI.
> **GitHub Actions** (`.github/workflows/verify.yml`, ~25 líneas: `pnpm install --frozen-lockfile`, `typecheck`, `lint:docs`, `build`). Además te da un badge verde en el repo, que para un reclutador es señal real y respalda la sección "How I work" que acabas de escribir.

S4 - Severidad real.
> **Demover C2 a `note`** y, si quieres que C4 sea regla, que bloquee con fecha límite; si no, corregir la frase de política.

S5 - Granularidad del contrato del agente.
> La regla debe ser: **todo commit que toque `docs/` o `AGENTS.md` corre `pnpm lint:docs`**, y si editas un doc que pasa de 120 líneas, `pnpm docs:toc --write` en el mismo commit.
> propongo mover el detalle operativo del gate a `docs/README.md` y dejar en `AGENTS.md` una línea.

S6 - Verificacion antes del merge.
> el pnpm docs lo solucionamos acabando el readme, no puede suceder esto, debe verificarse todo antes del mergeo

## Tasks

| ID | Spec | Route | Commit |
|---|---|---|---|
| T1 | S2 | inline | `fa01ff4` |
| T2 | S2 | inline | `fa01ff4` |
| T3 | S4 | inline | `fa01ff4` |
| T4 | S1 | inline | `44d2114` |
| T5 | S5 | inline | `44d2114` |
| T6 | S3 | inline | `1399c4b` |
| T7 | S6 | inline | - |

- T1 - `scripts/docs.mjs` exporta sus helpers puros y guarda el CLI; `scripts/docs.test.mjs` con `node:test`; script `pnpm test`. Fixtures: TOC ausente, ancla rota, nombre muerto exento, doc dueno inexistente, enlace roto.
- T2 - Resolver los fragmentos `#ancla` contra los headings reales del doc destino; hallazgo bloqueante cuando el ancla no existe. Tests primero (RED).
- T3 - C2 pasa a `note` (nunca bloquea): documentar y corregir la frase de politica de C4 en `docs/README.md` para que diga lo que el gate hace hoy.
- T4 - `.githooks/pre-commit` y `.githooks/commit-msg`, script `pnpm hooks:install` (`git config core.hooksPath .githooks`), documentado.
- T5 - Regla por commit en `AGENTS.md` (una linea) y detalle operativo en `docs/README.md`.
- T6 - `.github/workflows/verify.yml` con install, typecheck, test, lint:docs y build.
- T7 - Cierre: `pnpm lint:docs`, `pnpm test`, `pnpm typecheck`, build, hooks simulados, y comparacion del salida del gate antes/despues (diff de hallazgos esperado, sin regresiones).

## Log

L1 (usuario, 2026-10-22): dale, hagamos tus recomendaciones con odd

L2 (usuario, 2026-10-22, correccion previa que origino el analisis): el pnpm docs lo solucionamos acabando el readme, no puede suceder esto, debe verificarse todo antes del mergeo

L3 (recomendacion que el usuario acepta, 2026-10-22): orden propuesto 1) `core.hooksPath` local, 2) anclas + fixtures del gate, 3) GitHub Actions, 4) demover C2 a `note` y C4 decidido.

L4 (decision, 2026-10-22): C4 se queda como `note`. Hacerlo bloqueante dejaria main en rojo hoy (dos docs en 311 y 317 lineas) y obligaria a partir dos docs dentro de este track, que es otra unidad. Se corrige la frase de politica para que diga la verdad y la particion queda como deuda declarada.

L5 (decision, 2026-10-22): los hooks se instalan a mano con `pnpm hooks:install` (`core.hooksPath`), no se versiona nada dentro de `.git/`, y toda regla nueva se puede saltar con `--no-verify` a proposito.

L6 (contexto, 2026-10-22): el trabajo del README sigue sin commitear en el checkout principal, rama `docs/readme-refresh` (working tree con `README.md` y `docs/design/motion.md`). Este track vive en un worktree aparte para no tocarlo.

L7 (hallazgo que motiva el track, 2026-10-22): `pnpm lint:docs` en `main` (`a909669`) falla con `error: docs/design/motion.md: C2: falta el bloque TOC (132 lineas)`. `motion.md` cruzo el umbral de 120 lineas al editarse en la PR #6 y el gate solo se ejecutaba "al cerrar un track".

L8 (decision de implementacion, 2026-10-22): WU1 absorbe T3. La severidad de C2 y la frase de politica de C4 son la misma afirmacion que los checks nuevos, y separarlas obligaba a un commit cuyo test suite no podia pasar todavia (los tests fijan `level: 'note'` para C2). Un commit: checks nuevos, tests, severidades y politica.

L9 (medicion que decide el alcance, 2026-10-22): hoy hay **0 enlaces con fragmento** en `docs/` (40 enlaces relativos, todos sanos) y **16 filas del mapa citan una seccion numerica**, las 16 resuelven. Por eso el check de seccion citada se hace bloqueante (protege la convencion real de `docs/README.md`) y el de fragmento se queda como red para enlaces futuros, sin hallazgos hoy.

L10 (verificacion, 2026-10-22): `pnpm test` 27/27, `pnpm lint:docs` 0 bloqueantes (3 avisos: C2 de `motion.md`, C4 de `section-animations.md` 317 y `sections.md` 312), `pnpm typecheck` limpio, `pnpm build` completo. Hooks probados de punta a punta: `commit-msg` rechaza un mensaje sin `Docs:`/`Risk:` y `pre-commit` rechaza un doc VIVO fuera del mapa.

L11 (diferencial, 2026-10-22): el gate VIEJO (`a909669`) sobre el arbol NUEVO reproduce exactamente 1 bloqueante, el C2 preexistente de `motion.md` (archivo que este track no toca), y **ningun hallazgo nuevo** de los checks agregados; el gate NUEVO sobre ese arbol da 0 bloqueantes. Sin regresiones.

L12 (pendiente fuera de este track, 2026-10-22): el badge de CI en el README y el TOC de `motion.md` viajan con la rama `docs/readme-refresh`, que sigue sin commitear en el checkout principal. El badge solo tiene sentido despues del primer run verde en `main`.
