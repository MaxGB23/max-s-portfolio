### Idioma (conversación)
Cuando respondas en español, usa siempre español neutro. Evita el voseo y los regionalismos.

### Evitar vueltas, requests y tokens innecesarios (IMPORTANTE)
- Una vez verificado que el estado del árbol coincide con la decisión del usuario (los cambios pedidos por el usuario) y que la comprobación (build/tsc/tests) pasa, CIERRA. No re-audites, no re-verifiques lo ya verificado, no preguntes de nuevo preguntas ya respondidas y no sigas consumiendo tokens en confirmaciones redundantes.
- Si no hay nada que editar, dilo en una línea y para. No juegues al "no puedo creer que no haya cambios" repitiendo git diff / diff --stat cada turno.
- No "verifiques" pidiendo permiso una y otra vez para lo ya aplicado: cuando el usuario ya eligió una opción, ejecútala una vez y confirma en una línea.
- **Agrupa comandos y tools en una sola llamada.** El free tier se mide en requests diarias, no en tokens: cada llamada cuenta como una. Lo independiente va junto: varias lecturas, varios greps, `git status` + `git diff --stat` + conteo de líneas.
- **El lote es solo para lo independiente y de solo lectura.** Nunca en la misma llamada una escritura con su verificación, ni un paso que dependa de la salida del anterior: si falla a medias, no sabes qué se aplicó.
- Presupuesto de referencia: un fix de 1-5 líneas cuesta 3-4 requests (ver el estado, editar, commitear). Si pasa de cinco, la causa suele ser que no sabes dónde está lo que buscas; arregla eso, no acumules comandos.

### Commits
- Conventional commits siempre en inglés.
- Un commit = una work unit (behavior, fix o docs). Nunca separar por tipo de archivo. Consultar la skill `work-unit-commits` para planificar los commits.
- **Commitea al terminar cada work unit.** No acumules cambios sin commitear durante la sesión: un cambio no commiteado es trabajo sin punto de recuperación.
- **El agente nunca asume que debe commitear.** Tras cualquier cambio (aunque sea mínimo), PREGUNTA al usuario antes de hacer commit — siempre hay ajustes pendientes.
- Antes de operaciones destructivas de git (`git checkout --`, `git reset --hard`, force-push): ejecuta `git status` y revisa el diff. Si el archivo tiene cambios no commiteados, confirma explícitamente qué se pierde antes de revertir.
- PowerShell no es seguro con UTF-8 en PS 5.1: no escribir archivos fuente con `Set-Content`/`Out-File` (corrompe acentos y em dash), y no leerlos con `Get-Content` para COMPARAR (lee UTF-8 como Windows-1252: una raya `—` U+2014 se ve como guion). Para editar, las herramientas del asistente; para inspeccionar caracteres, `[System.IO.File]::ReadAllText($p, [System.Text.Encoding]::UTF8)` y `[int]$c`.

### Delegaciones (subagentes)
- Delega SOLO con `gentle-ai-worker` o el subagente `general`. Por ahora los demas fallan (ej: `explore`).

### Dependencias
- Siempre usar pnpm.
- Nunca pushear a main con errores de lint o build.

### Dev servers (gestion del usuario; el agente no los levanta)
- **El agente NO levanta dev servers**: no ve la pantalla, asi que un audit con browser le da numeros sin contexto. Verificacion por defecto = `tsc --noEmit`, `build`, grep sobre el CSS compilado y checks de rutas de imagen. El pase visual es del usuario; los audits de `scripts/` son herramientas suyas. Detalle en `iteration-guide.md` 8.
- Puerto por defecto `3000` (scripts de QA incluidos, via `scripts/audit-base.mjs`: no hardcodear URLs); si esta ocupado, el siguiente libre. UN solo dev server por defecto; dos en paralelo solo si el usuario pide comparacion A/B (ver `### Worktrees`).
- Si el usuario levanta uno, reutilizarlo y no cerrarlo: sondear el puerto antes de asumir, nunca matar una instancia que responde, y tratar `Unable to acquire lock` sin respuesta como zombie (matar solo esa).
- Un comando con timeout largo no reporta progreso: no encadenar arranque + build sin necesidad.

### Worktrees (pruebas A/B en vivo)
- **Alcance (leer primero)**: esta estrategia de dos servers en paralelo SOLO aplica cuando el usuario la pide explícitamente — cambios grandes que exigen comparar versiones en vivo. Por defecto se trabaja con UN solo dev server (ver arriba); no asumir `:3000` + `:3001` ni levantar dos por cuenta propia.
- Los worktrees viven en `M:\worktrees\maxgb23-portfolio` — NUNCA dentro del repo ni en `~`.
- Convención de nombre: `<nombre-experimento>` (ej: `fluid-typo`).
- Estrategia para probar 2 versiones en vivo:
  1. Commitear el estado actual (punto de retorno limpio).
  2. `git worktree add "M:\worktrees\maxgb23-portfolio\<nombre>" -b feat/<experimento>` desde el commit base.
  3. `pnpm install` en el worktree (node_modules/.next son por-checkout).
  4. Dev servers en paralelo (principal `:3000`, worktree `:3001` — `pnpm dev --port 3001`), solo dentro de esta estrategia A/B.
  5. Aplicar cambios SOLO en el worktree; comparar en vivo contra `:3000`.
  6. Al aprobar: merge a la rama principal y `git worktree remove` para limpiar.
- Al borrar un worktree: `git worktree remove <ruta>`; si tiene cambios sin mergear, confirmar antes con el usuario.
- **Copias entre worktrees/ramas:** Antes de copiar archivos entre worktrees o ramas, verificar con `git diff <origen> <destino> -- <archivo>` que la versión de origen no sea más antigua que la del destino. Si hay diferencias a favor del destino, no copiar — aplicar los cambios manualmente en el destino.

### Código fuente y sintaxis
- Usar siempre caracteres ASCII estándar para sintaxis y operadores. Nunca sustituir caracteres ASCII por caracteres Unicode visualmente similares.

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
  | gates de media, reveal, aurora | `docs/design/motion.md` |
  | tema, dark mode, scroll, debug overlay, gotchas | `docs/design/platform.md` |
  | color, spacing, radio, sombra, z-index | `docs/design/tokens.md` |
  | familias, escala, tracking, OpenType | `docs/design/typography-families.md` |
  | botones, gestos de puntero | `docs/design/buttons.md`, `docs/design/pointer-gestures.md` |
  | proceso y checklist de iteración | `docs/design/iteration-guide.md` |

- Al cerrar un track, antes del push: las tres preguntas del gate, `git diff --diff-filter=D --name-only <base>...HEAD` y `pnpm lint:docs`.
- El estado de una tarea o un RFC se escribe como hecho verificable (rama, commit, merge), no como adjetivo.
- Al retirar un símbolo o técnica, añade su fila a `docs/design/DEAD.md` en el mismo work unit (solo símbolos que ya no existen).
- Punto de entrada, vida de cada carpeta, reglas de tamaño e índice del canon: `docs/README.md`.
- Este archivo no pasa de 80 líneas: si crece, el detalle se muda a `docs/README.md`, donde el gate lo puede ver.