### Idioma (conversación)
Cuando respondas en español, usa siempre español neutro. Evita el voseo y los regionalismos.

### Idioma (artefactos)
Código, comentarios, commits, ramas, README, issues y PRs en inglés; este archivo, `docs/` y las tareas ODD en español.

### Requests y tokens (IMPORTANTE)
- **Agrupa comandos y tools en una sola llamada.** El free tier se mide en requests diarias, no en tokens: cada llamada cuenta como una. Lo independiente va junto: varias lecturas, varios greps, `git status` + `git diff --stat` + conteo de líneas.
- **El lote es solo para lo independiente y de solo lectura.** Nunca en la misma llamada una escritura con su verificación, ni un paso que dependa de la salida del anterior: si falla a medias, no sabes qué se aplicó.
- Presupuesto de referencia: un fix de 1-5 líneas cuesta 3-4 requests (ver el estado, editar, comprobar, commitear si está autorizado). Si pasa de cinco, la causa suele ser que no sabes dónde está lo que buscas; arregla eso, no acumules comandos.
- Si el árbol ya coincide con la decisión y la comprobación pasa, cierra: no re-audites, no repitas `git diff` ni vuelvas a preguntar lo ya respondido.

### Git
- **Push = deploy.** Un push a `main` publica en producción; uno a una rama crea una preview en Vercel. Se pide aprobación y se agrupa por lote de work units, nunca uno por commit.
- Commitear es local y libre; pushear es entregar.
- Si el lote incluye commits que no deben publicarse todavía, dilo antes de pushear: `git log origin/main..HEAD --oneline` es la prueba de qué viaja en ese push.
- Antes de operaciones destructivas de git (`git checkout --`, `git reset --hard`, force-push): ejecuta `git status` y revisa el diff. Si el archivo tiene cambios no commiteados, confirma explícitamente qué se pierde antes de revertir.

### Dependencias
- Siempre usar pnpm.
- No hay linter ni formatter: el "lint" de este repo es `pnpm lint:docs` + `pnpm audit:i18n`. Antes de pushear: `pnpm typecheck`, `pnpm test`, `pnpm lint:docs`, `pnpm audit:i18n` y `pnpm build`; son herméticos y son exactamente lo que corre CI.
- Esa lista no es toda la verificación: la capa de navegador (`pnpm qa`) y los scripts de `scripts/` que miden layout, timeline o scroll son manuales a propósito, necesitan un server y CI no los corre. Su dueño es `docs/design/iteration-guide.md` 12.
- CI corre en cada push a main y en cada PR: un push directo sin PR también se verifica, pero después de publicar, así que esa corrida local va antes del push. El hook local es más chico a propósito: valida el gate de docs (solo si se toca `docs/` o este archivo) y el rastro `Docs:`/`Risk:`, no typecheck ni tests.
- Un bug que solo aparece en un telefono real no se cierra con Chromium ni con el emulador mobile de DevTools: se verifica en WebKit (`npx playwright install webkit`; `scripts/navbar-active.mjs` ya lo usa) o en el dispositivo.

### Dev servers (bajo demanda; el pase visual es del usuario)
- Se levanta uno solo cuando una medicion lo necesita (los scripts de `scripts/` que miden layout o timeline exigen build de produccion); la lectura visual sigue siendo del usuario. Detalle en `iteration-guide.md` 8.
- Puerto por defecto `3000` (scripts de QA incluidos, vía `scripts/audit-base.mjs`: no hardcodear URLs); si está ocupado, el siguiente libre. UN solo server por defecto; dos en paralelo solo si el usuario pide comparación A/B.
- Lo que arrancas, lo cierras: sondear el puerto antes de asumir, nunca matar una instancia que responde, y tratar `Unable to acquire lock` sin respuesta como zombie (matar solo esa).
- Un comando con timeout largo no reporta progreso: no encadenar arranque + build sin necesidad.

### Worktrees (pruebas A/B en vivo)
- **Alcance (leer primero)**: esta estrategia de dos servers en paralelo SOLO aplica cuando el usuario la pide explícitamente — cambios grandes que exigen comparar versiones en vivo. Por defecto se trabaja con UN solo dev server (ver arriba); no asumir `:3000` + `:3001` ni levantar dos por cuenta propia.
- Los worktrees viven en `M:\worktrees\maxgb23-portfolio` — NUNCA dentro del repo ni en `~`.
- Al borrar un worktree: `git worktree remove <ruta>`; si tiene cambios sin mergear, confirmar antes con el usuario.
- **Copias entre worktrees/ramas:** Antes de copiar archivos entre worktrees o ramas, verificar con `git diff <origen> <destino> -- <archivo>` que la versión de origen no sea más antigua que la del destino. Si hay diferencias a favor del destino, no copiar — aplicar los cambios manualmente en el destino.

### Código fuente y sintaxis
- El texto en español lleva sus acentos y signos: los archivos son UTF-8 y node, el gate, git y las herramientas del asistente los manejan bien. No se escribe `documentacion` por miedo al encoding. El aviso del global sobre acentos habla de la salida de CLIs nativos (mojibake al leer), no del contenido de los archivos.
- La prohibición es solo en sintaxis y operadores: nunca un carácter Unicode parecido a uno ASCII (`-` no es `–` ni `−`, las comillas son `"` y no las tipográficas, y el espacio es U+0020, no el no separable). Rompe parsers y crea bugs que no se ven.

### Internacionalización
- Todo texto visible va como clave en `data/translations.ts` (ES + EN) y se renderiza con `t()`; nunca hardcodear. Mini guía: `docs/i18n.md`.

### Docs (regla por afirmación)
- Antes de cerrar cualquier cambio, fix de una línea o work unit, responde: ¿qué doc VIVO afirma algo sobre esto? Si ninguna frase se vuelve falsa, escribe `Docs: none - <motivo>` en el commit. Si cambia un valor, nombre, orden o comportamiento, edita esa frase en el doc dueño, en el mismo commit.
- Para saber qué doc es el dueño, usa la tabla de arriba (tema → archivo); el mapa de `docs/README.md` es vocabulario de usuario y anclas de sección. Añade una fila solo si la pregunta la hizo el usuario y no estaba; si una fila ya apunta a esa sección, amplía su vocabulario en vez de duplicarla.
- El rastro va en el cuerpo del commit, en una de estas dos formas: `Docs: none - <motivo>` o `Docs: <archivo> - <qué cambió>`, una línea por archivo si tocas varios. El nivel no se etiqueta: se deduce del commit (si hubo tarea ODD, fue nivel 2).
- Docs dueños:
  | Si tocas... | Doc |
  |---|---|
  | shell, ritmo, geometría, cue de llegada | `docs/design/sections.md` |
  | listas, cards, pricing, contacto, footer, detalle | `docs/design/components-detail.md` |
  | gates de media, familia Reveal (CSS), aurora | `docs/design/motion.md` |
  | orden de entrada de cada sección (timelines GSAP, stagger) | `docs/design/section-animations.md` |
  | tema, dark mode, scroll, debug overlay, gotchas | `docs/design/platform.md` |
  | color, spacing, radio, sombra, z-index | `docs/design/tokens.md` |
  | familias, escala, tracking, OpenType | `docs/design/typography-families.md` |
  | botones, gestos de puntero | `docs/design/buttons.md`, `docs/design/pointer-gestures.md` |
  | cifras vivas (descargas, tiempo en producción), badges del README | `docs/live-data.md` |
  | proceso y checklist de iteración | `docs/design/iteration-guide.md` |
  | hooks, CI, qa, scripts de medición, orden de las capas | `docs/verification-layers.md` |
- Todo commit que toque `docs/` o `AGENTS.md` pasa por el gate: lo corre el hook `pre-commit` (una vez por clon, `pnpm hooks:install`); si editaste un doc de más de 120 líneas, `pnpm docs:toc --write` en el mismo commit. El detalle operativo vive en `docs/README.md`.
- Al cerrar un track, antes del push: las tres preguntas del gate y `git diff --diff-filter=D --name-only <base>...HEAD`.
- El estado de una tarea o un RFC se escribe como hecho verificable (rama y PR, con fecha), no como adjetivo; nunca el hash del merge, que aún no existe.
- Al retirar un símbolo o técnica, añade su fila a `docs/design/DEAD.md` en el mismo work unit (solo símbolos que ya no existen).
- Punto de entrada, vida de cada carpeta, reglas de tamaño e índice del canon: `docs/README.md`.
- Este archivo no pasa de 80 líneas: si crece, el detalle se muda a `docs/README.md`, donde el gate lo puede ver.