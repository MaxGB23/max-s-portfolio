### Idioma (conversación)
Cuando respondas en español, usa siempre español neutro. Evita el voseo y los regionalismos.

### Commits
- Conventional commits siempre en inglés.
- Un commit = una work unit (behavior, fix o docs). Nunca separar por tipo de archivo. Consultar la skill `work-unit-commits` para planificar los commits.
- **Commitea al terminar cada work unit.** No acumules cambios sin commitear durante la sesión: un cambio no commiteado es trabajo sin punto de recuperación.
- **El agente nunca asume que debe commitear.** Tras cualquier cambio (aunque sea mínimo), PREGUNTA al usuario antes de hacer commit — siempre hay ajustes pendientes.
- Antes de operaciones destructivas de git (`git checkout --`, `git reset --hard`, force-push): ejecuta `git status` y revisa el diff. Si el archivo tiene cambios no commiteados, confirma explícitamente qué se pierde antes de revertir.
- No reescribas archivos fuente con PowerShell (`Set-Content`/`Get-Content -Raw` corrompe UTF-8 en PS 5.1) — usa las herramientas de edición del asistente.

### Dependencias
- Siempre usar pnpm.
- Nunca pushear a main con errores de lint o build.

### Worktrees (pruebas A/B en vivo)
- Los worktrees viven en `M:\worktrees\maxgb23-portfolio` — NUNCA dentro del repo ni en `~`.
- Convención de nombre: `<nombre-experimento>` (ej: `fluid-typo`).
- Estrategia para probar 2 versiones en vivo:
  1. Commitear el estado actual (punto de retorno limpio).
  2. `git worktree add "M:\worktrees\maxgb23-portfolio\<nombre>" -b feat/<experimento>` desde el commit base.
  3. `pnpm install` en el worktree (node_modules/.next son por-checkout).
  4. Dev servers en paralelo: principal `:3000`, worktree `:3001` (`pnpm dev --port 3001`).
  5. Aplicar cambios SOLO en el worktree; comparar en vivo contra `:3000`.
  6. Al aprobar: merge a la rama principal y `git worktree remove` para limpiar.
- Al borrar un worktree: `git worktree remove <ruta>`; si tiene cambios sin mergear, confirmar antes con el usuario.