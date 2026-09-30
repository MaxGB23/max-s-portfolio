### Idioma (conversación)
Cuando respondas en español, usa siempre español neutro. Evita el voseo y los regionalismos.

### Evitar vueltas y tokens innecesarios (IMPORTANTE)
- Una vez verificado que el estado del árbol coincide con la decisión del usuario (los cambios pedidos por el usuario) y que la comprobación (build/tsc/tests) pasa, CIERRA. No re-audites, no re-verifiques lo ya verificado, no preguntes de nuevo preguntas ya respondidas y no sigas consumiendo tokens en confirmaciones redundantes.
- Si no hay nada que editar, dilo en una línea y para. No juegues al "no puedo creer que no haya cambios" repitiendo git diff / diff --stat cada turno.
- No "verifiques" pidiendo permiso una y otra vez para lo ya aplicado: cuando the user ya eligió una opción, ejecútala una vez y confirma en una línea.

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

### Dev servers
- Los levanta y cierra el usuario; el agente nunca deja uno abierto al terminar.
- Puerto por defecto `3000`; si está ocupado, el siguiente libre. Por defecto se trabaja con UN solo dev server: nunca asumir worktrees en `3001` ni levantar dos en paralelo salvo comparación A/B explícita del usuario (ver `### Worktrees`).
- Antes de levantar, sondear el puerto:
  - Ya responde y sirve este checkout → reutilizar y NO cerrarla.
  - Ya responde y sirve otro checkout/rama → no matarla; usar otro puerto.
  - No responde y Next reclama `Unable to acquire lock` → instancia zombie (no sirve a nadie): matar solo esa y relanzar.
  - Nunca matar una instancia que sí está respondiendo.
- Si la verificación necesita navegador (Playwright, auditoría de ritmo): server transitorio, correr y cerrar en la misma tarea.

### Worktrees (pruebas A/B en vivo)
- **Alcance (leer primero)**: esta estrategia de dos servers en paralelo SOLO aplica cuando el usuario la pide explícitamente — cambios grandes que exigen comparar versiones en vivo. Por defecto se trabaja con UN solo dev server (ver `### Dev servers`); no asumir `:3000` + `:3001` ni levantar dos por cuenta propia.
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

### Código fuente y sintaxis
- Usar siempre caracteres ASCII estándar para sintaxis y operadores. Nunca sustituir caracteres ASCII por caracteres Unicode visualmente similares.

### Internacionalización
- Todo texto visible va como clave en `data/translations.ts` (ES + EN) y se renderiza con `t()`; nunca hardcodear. Mini guía: `docs/i18n.md`.

### Docs de diseño
- No actualices `docs/design/` por cada cambio mínimo: al APROBAR una work unit (igual que el ciclo de commits), sincroniza el archivo tema que corresponda si el cambio afecta componentes, tokens o utilidades de UI. Si no sincronizas en esa work unit, declara la deuda en el archivo tema en cuanto lo sepas — nunca dejes el canon desincronizado del código.
- `docs/design/README.md` es el índice del canon: actualízalo solo cuando cambie la estructura (nuevo/renombrado/eliminado archivo), no por cambios de contenido.
- `docs/design/archive/` es congelado: no editar.