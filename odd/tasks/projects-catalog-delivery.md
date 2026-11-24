# projects-catalog: entrega por PRs encadenados

Plan de entrega de la feature `projects-catalog` en el worktree `M:/worktrees/maxgb23-portfolio/projects-catalog`: rebanar 24 commits en PRs coherentes de ~400 líneas **sin reescribir historia**. El congelado precede a todo corte. La spec funcional sigue en `odd/tasks/projects-catalog.md`.

## Specs

- **S1.** «revisa la ultima memoria, quiero saber si el historial de commits se perdería o no, ya que quiero conservar la fecha de creacion de los commits.» (2026-11-24)
- **S2.** «tenemos suscripcion dedicada, por lo que las requests no son problema, trabaja sin limitaciones.» (2026-11-24)
- **S3.** «Crea el plan para trabajar en este proceso, apoyate de funky judge para juzgar el plan y afirmaciones, comencemos» (2026-11-24)
- **S4.** Regla del dueño del 2026-11-18, guardada textual en Engram #1809: «No seguir agregando features hasta pagar esta deuda: rebanar la rama en PRs coherentes de ~400 lineas y congelar el resultado actual antes de tocar nada».
- **S5.** «Push = deploy. ... Se pide aprobación y se agrupa por lote de work units, nunca uno por commit» (`AGENTS.md` del repo) y «Avoid squash merging: preserve history whenever possible» (`AGENTS.md` global del usuario, `C:/Users/cb147/.pi/agent/AGENTS.md`).
- **S6.** `AGENTS.md` del repo: antes de pushear corren `pnpm typecheck`, `pnpm test`, `pnpm lint:docs`, `pnpm audit:i18n` y `pnpm build`; CI corre en cada PR.

Criterio de aceptación de S1, verificable: las author date de los 24 commits del tag congelado aparecen intactas en `main` al terminar los merges, y ningún commit del rango fue reescrito (mismo hash y misma fecha de creación).

## Medidas

Tomadas el 2026-11-24 en el worktree, contra `origin/main` (no contra `main` local):

| Dato | Valor | Comando |
|---|---|---|
| Commits a entregar | 24, hasta `1d4ca2c` | `git rev-list --count origin/main..1d4ca2c` |
| Diff total | 57 archivos, +8151/−257 = **8408** líneas | `git diff --shortstat origin/main...1d4ca2c` |
| `design/` | 4223 líneas = 50.2 % del diff | `git diff --numstat origin/main...1d4ca2c` filtrado |
| `scripts/` | 1760 líneas | idem |
| `odd/tasks/` | 810 líneas | idem |
| Divergencia | ahead 24, behind 39 | `git status -sb` |
| Tags en el clon | ninguno | `git tag -l` |
| Sin trackear | 3 archivos, 477 líneas | `git status --porcelain` + `wc -l` |
| Fechas | 2026-11-06 → 2026-11-18; author date == committer date en los 24 | `git log --format='%ad %cd' --date=short` |
| GitHub permite | merge, rebase y squash (los tres en `true`) | `gh api repos/MaxGB23/max-s-portfolio` |

El rango entregado son los 24 commits hasta `1d4ca2c`. Los commits de la fila 18 son nuevos (2026-11-24) y no entran en estas medidas.

La suma de presupuestos de los 17 cortes sobre esos 24 commits (8522) supera su diff total (8408) en 114 líneas: es churn entre cortes, no un error. Un corte posterior borra líneas que uno anterior agregó, y cada corte se mide por líneas cambiadas (+ y −), no por el neto.

## Decisión: la historia no se reescribe

- Los cortes son refs a commits existentes (`git branch slice/NN <sha>`): no crean objetos ni tocan fechas.
- La integración con `origin/main` es por **merge**, nunca rebase: un rebase reescribe los 24 hashes y pone la committer date de hoy (la author date sobrevive; la fecha de creación del commit, no).
- El merge en GitHub se hace **con merge commit**. Squash colapsa el PR en un commit fechado hoy; rebase-and-merge conserva la author date pero cambia el hash. Ninguno de los dos se usa.
- GitHub permite los tres métodos, así que la regla la sostiene la disciplina, no la plataforma.
- Único caso de reescritura posible: un corte que no caiga en frontera de commit. El diseño lo evita, porque los cortes caen en fronteras. Si apareciera, `git commit --date="$(git log -1 --format=%aD <sha>)"` conserva el author date y la pérdida se registra en el Log.
- El congelado (T1) es la garantía: mientras el tag exista, cualquier reescritura futura es recuperable.

## Cortes

Presupuesto = líneas cambiadas del rango, con `git diff --shortstat <base> <tip>`.

| # | Rama | Commits | Líneas | Base del PR | Unidad revisable |
|---|---|---|---|---|---|
| 01 | `slice/01-dead-stylesheet` | `528a1cc` | 126 | `origin/main` | retirar `styles/globals.css`, que sombreaba los tokens vivos |
| 02 | `slice/02-home-surface-axis` | `3fc0da2` | 298 | `slice/01` | `featured` → eje `home` + selectores |
| 03 | `slice/03-design-boards` | `842ba15` | 3136 | `slice/02` | tableros fase 0 + `design/system.md` + spec — `size:exception` |
| 04 | `slice/04-project-entries` | `7790535` | 389 | `slice/03` | fichas Forge y Secure + cierre de las dos terminadas |
| 05 | `slice/05-route-aware-navbar` | `cd80200` | 71 | `slice/04` | navbar que resuelve por ruta |
| 06 | `slice/06-catalogue-route` | `9110cb5` | 437 | `slice/05` | ruta `/proyectos` + componente + lib + test — `size:exception` |
| 07 | `slice/07-home-catalogue-link` | `2ed504f`, `b724660` | 29 | `slice/06` | CTA "Ver todos los proyectos" + espaciado medido |
| 08 | `slice/08-state-seal` | `3a59069`, `aeae7d8` | 222 | `slice/07` | sello de estado + quitar el borde morado |
| 09 | `slice/09-card-media-labels` | `9eeb7df`, `95eb1ca`, `4271c5d`, `b1a2b3a` | 102 | `slice/08` | diagramas, etiquetas, `mediaFit`, full-bleed |
| 10 | `slice/10-grid-restore` | `c3d2760` | 49 | `slice/09` | restaurar la grilla al volver |
| 11 | `slice/11-arrival-cue` | `48b119d` | 395 | `slice/10` | cue de llegada por ancla |
| 12 | `slice/12-anchor-guard` | `7f22bff` | 504 | `slice/11` | guard del ancla + sus tests — `size:exception` |
| 13 | `slice/13-badge-boards` | `f3b5228` | 1829 | `slice/12` | tableros ronda 2 + planes de navegación — `size:exception` |
| 14 | `slice/14-ficha-media` | `ddc76e8` | 42 | `slice/13` | media de la ficha dentro de su marco |
| 15 | `slice/15-measurement-scripts` | `2ba6290` | 734 | `slice/14` | scripts de medición de ritmo y RSC — `size:exception` |
| 16 | `slice/16-live-docs` | `13aaf00`, `2121904`, `bdc5d61` | 69 | `slice/15` | corregir afirmaciones vivas + registro del pase |
| 17 | `slice/17-forge-data` | `1d4ca2c` | 90 | `slice/16` | datos medidos de la ficha Forge |
| 18 | `slice/18-delivery-record` | commits nuevos | 287 | `slice/17` | este plan (131) + `odd/tasks/docs-pass.plan.md` (156) |

**Excepciones de tamaño (5).** El presupuesto cede en cinco cortes, con motivo:

- 03 y 13: suman 4965 líneas, de las cuales 4223 son `design/` (tableros y `design/system.md`) y 742 son los registros ODD que viajan con ellos (`odd/tasks/projects-catalog.md`, dos planes de navegación y `.gitignore`). Los tableros son artefactos de canvas, no código que se revise línea a línea.
- 06 y 12: una ruta con su test y un fix con sus guards. Partirlos separaría el test de lo que verifica.
- 15: dos scripts de medición independientes. Partirlos exige reescribir el commit: el author date se conservaría con `--date`, pero el hash y la committer date cambiarían, y el corte dejaría de caer en fronteras.

## Reglas de entrega

- Cada PR declara en el cuerpo: inicio, fin, dependencia, trabajo posterior, fuera de alcance, y el diagrama de dependencia con 📍 en el PR actual.
- La base del PR es la rama padre de la tabla. Cuando el padre se mergea, el hijo se retargetea a `main` antes de revisarse, para que su diff traiga solo su unidad.
- Gates locales: una pasada completa por lote (`typecheck`, `test`, `lint:docs`, `audit:i18n`, `build`) sobre la última rama del lote, más CI de GitHub por PR. Cada rama del lote es prefijo de la última, y CI cubre lo que la pasada única no puede afirmar.
- Merge commits siempre; squash y rebase-and-merge, nunca.
- Push por lote con aprobación explícita: el push es deploy (S5).

## Tasks

| ID | Tarea | Specs | Ruta |
|---|---|---|---|
| T1 | Congelar: tag anotado `projects-catalog/pre-slice-2026-11-24` + rama `backup/projects-catalog-2026-11-24` en `1d4ca2c` + bundle en `%TEMP%` | S4 | inline, commit: ninguno (refs) |
| T2 | Juzgar este plan con funky-judge (PAIR ciego) y adjudicar en el Log | S3 | subagentes |
| T3 | Empujar tag y rama de respaldo a `origin` | S5 | requiere aprobación de push |
| T4 | Crear las 18 ramas `slice/*` y verificar con `git diff --shortstat` que cada presupuesto coincide | S4 | inline |
| T5 | Lote A: PRs 01–04 | S4, S5 | push + PR |
| T6 | Lote B: PRs 05–07 | S4, S5 | push + PR |
| T7 | Lote C: PRs 08–12 | S4, S5 | push + PR |
| T8 | Lote D: PRs 13–18 | S4, S5 | push + PR |
| T9 | Verificar S1: author dates del tag contra `main` y presencia de los 24 hashes | S1 | inline |
| T10 | Limpiar: worktree y ramas `slice/*` ya mergeadas; conservar el tag | S4 | inline |
| T11 | Decidir el destino de `docs/projects/candidatos/*.md` (321 líneas sin trackear) cuando llegue la data nueva | S1 | decisión del dueño |

## Log

**L1** (2026-11-24, verbatim): «revisa la ultima memoria, quiero saber si el historial de commits se perdería o no, ya que quiero conservar la fecha de creacion de los commits.»

**L2** (2026-11-24, verbatim): «te cuento que no contamos con free tier ahora, tenemos suscripcion dedicada, por lo que las requests no son problema, trabaja sin limitaciones. Crea el plan para trabajar en este proceso, apoyate de funky judge para juzgar el plan y afirmaciones, comencemos»

**L3** (2026-11-24, medición). Los números de la tabla de Medidas salen de este bloque, ejecutado en el worktree con `HEAD` = `1d4ca2c`, antes de este commit:

```
git rev-list --count origin/main..HEAD                    -> 24
git diff --shortstat origin/main...HEAD                   -> 57 files changed, 8151 insertions(+), 257 deletions(-)
git status -sb                                            -> ## feat/projects-catalog...origin/main [ahead 24, behind 39]
git tag -l                                                -> (vacío)
git log --format='%ad %cd' --date=short                   -> 24 pares, author == committer en todos
gh api repos/MaxGB23/max-s-portfolio --jq ...             -> {"merge":true,"rebase":true,"squash":true}
```

Los presupuestos por corte salen de `git diff --shortstat <base> <tip>` en la misma corrida, en el orden de la tabla.

**L4** (2026-11-24, adjudicación de la ronda 1). Jueces `jd-judge-a` y `jd-judge-b`, PAIR ciego sobre el sha256 `3181cb9e…` del commit `d33b072` (118 líneas). A devolvió 6 filas; B, 1; ambas coinciden en el defecto de S5. Ganaron las seis, todas deterministas y verificadas con el comando que cada una traía:

| Fila | Qué era falso | Corrección |
|---|---|---|
| JD-A-001 | `origin/main..HEAD` da 25 después de este commit; 24 corresponde a `1d4ca2c` | las filas de Medidas nombran `1d4ca2c` |
| JD-A-002 | mismo `HEAD`: el diff total da 8269 si incluye este documento | idem, más la nota de que la fila 18 queda fuera de las medidas |
| JD-A-003 | «4965 de las 8408»: en `design/` hay 4223; los 742 restantes son registros ODD | justificación de 03 y 13 reescrita |
| JD-A-004 | la fila 15 decía «renunciar al author date», que el propio plan conserva con `--date` | el costo declarado pasa a ser el hash y la committer date |
| JD-A-005 = JD-B-001 | la regla de no-squash vive en el `AGENTS.md` global, no en el del repo | atribución corregida en S5 |
| JD-A-006 | la fila 18 declaraba ~360 líneas y son 274 | presupuesto corregido |

Ninguna fila fue refutada. Las afirmaciones sobre cortes, contigüidad, bases, orden de dependencias, mecanismo de fechas, ajustes de GitHub y gates quedaron sin fila, que en este protocolo es el resultado limpio.
