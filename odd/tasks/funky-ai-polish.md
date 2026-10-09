# funky-ai polish — pulida mínima con mapeo corregido

## Objective
Pulir la ficha de funky-ai (grid all projects) sin borrar SDD: corregir mapeo init/scaffold/sdd, honestidad en secure, 6 métricas pares verificables y ODD como evolución.

## Problem
Ficha con 5 métricas impares (4 estimaciones como hechos), hook==headline, alts de gallery cruzados, scaffold/OpenSpec mezclados, Forge vendido como bin que no existe, secure sobresaliente como automático.

## Why
Usuario autorizó pulida mínima (dale aplicalo). SDD se conserva por relevancia empresarial; ODD como evolución. Vender CLI modular real según auditoría worker del repo funky-ai.

## Scope
- docs/projects/candidatos/funky-ai-portfolio.md
- data/projects.ts (bloque funky-ai idem espejo)

## Constraints
- Español neutro, sin voseo. Mantener estilo prose existente del .md (con acentos).
- Métricas pares (6), labels minúscula, value con mayúscula si palabra.
- Nada de TBD, nada inventado. Solo datos worker: bin funky 10 comandos, scaffold 47+7 base mínima, 27 reglas, 443 tests/36 archivos, 1 workflow SHA, secure asistido.
- SSOT: .md y data/projects.ts siempre juntos y espejo.
- No tocar docs/design/ en esta work unit (deuda declarada).
- ASCII para sintaxis/operadores; no sustituir por Unicode similar.

## Tasks
- [x] T1 — Corregir Brief (hook/headline/metric card) + fix alts gallery + nota install clon+symlink pnpm
- [x] T2 — Reescribir metrics a 6 verificables + bajar % estimados a solution como objetivos de diseño
- [x] T3 — Reescribir solution en 6 bloques con mapeo real: scaffold base mínima (opcional funkygram) / sdd install OpenSpec / forge init-assess-estimate-pipeline enfocado en cómo cobrar / secure asistido honesto / SDD linaje + ODD evolución / prácticas
- [x] T4 — Espejar todo en data/projects.ts + summary 3 frases + headline distinto de hook
- [x] T5 — Pasada de legibilidad: quitar jerga interna ({{project_name}}, rutas, tier3-interactive, mkdir/copies, SHAs, TTY/CI) y traducir a beneficio entendible sin inventar ni perder honestidad
- [x] T6 — Restauración inline sin delegar (orden explícita del usuario): symlink en summary, Vitest y SHA en métricas/role/solution/stack; tier2/tier3 internos se quedan fuera
- [x] T7 — Híbrida de Prácticas + rescate funkygram y framework SDD con arneses (lo mejor de antes y después), inline sin delegar
- [x] T8 — funkygram con viñeta propia + prompt based harnesses en inglés, inline sin delegar
- [x] T9 — Métrica CI 1→3 (acciones fijadas por SHA, más vendible), inline sin delegar

## Authorized scope
Solo los 2 archivos de Scope. Ningún otro archivo.

## Acceptance criteria
- 6 métricas pares verificables, sin % como hechos.
- scaffold ≠ OpenSpec explícito; solo `funky sdd install` inyecta OpenSpec.
- init = Forge explícito; secure como asistido (cuarentena/secretos como guía, estado local + consola).
- hook ≠ headline; summary 3 frases + línea ODD.
- alts gallery correctos (secure→secure, funkygram→funkygram, sdd→sdd).
- .md y .ts espejo exacto en contenido.

## Checks
- Test-first: no aplica RED/GREEN (contenido, sin runner determinista para prosa). Excepción documentada.
- `pnpm typecheck` (tsc --noEmit) debe pasar.
- `git status --short` antes de commitear (usuario edita en paralelo).
- Commit por work unit con conventional commit en inglés, preguntar antes de commitear.

## Route
- delegated direct (writer trigger: 2 archivos no-triviales). Route: parent → 1 writer (gentle-ai-worker) → verificación.
- T6 excepción: inline directo por orden explícita del usuario (sin delegar); cambios mecánicos ya entendidos en las 2 superficies.
- Delivery: work-unit commit en feat/recede-fade, sin push salvo pedido explícito.

## Progress
- 2026-10-09: T1-T4 aplicadas por writer en espejo .md ↔ .ts. typecheck OK (cmd /c pnpm typecheck → TSC-OK). diff --stat: 2 files, 56+/43-. Sin commit (pregunta previa obligatoria).
- 2026-10-09: usuario pide T5 legibilidad (quitar {{project_name}}, rutas, tier3-interactive; vender beneficio).
- 2026-10-09: T5 aplicada por writer + fix mayúsculas. T6 inline sin delegar: restaurados symlink/Vitest/SHA, tier2/tier3 siguen fuera. ODD reescrito en condicional honesto (no implementado, línea futura). T7 inline: Prácticas híbrida (issue-first, Vitest, SHA, releases, docs vivas, doble audiencia con mecanismo, fail-safe) + funkygram nombrado + bullet framework SDD con arneses. T8 inline: funkygram con viñeta propia + prompt based harnesses en inglés. typecheck OK. Sin commit (pregunta previa obligatoria).

## Next step
- Delegar writer T5 en las 2 superficies permitidas.
