# funky-ai — Framework CLI para desarrollo asistido por IA (Consolidado)

> Fuente única de contenido para el portfolio. Editar aquí; luego se refleja en `data/projects.ts`.
> Última actualización: 2026-08-28

---

## 1. Brief — Vista normal (card destacada del grid)

| Campo | Valor |
| --- | --- |
| `id` | `funky-ai` |
| `title` | funky-ai |
| `category` | Dev Tools / AI Engineering |
| `hook` | Framework CLI para desarrollo de software asistido por IA: pipeline SDD con contexto just-in-time, memoria persistente y planificación de proyectos en un solo comando. |
| `metric` | -40% consumo de tokens (contexto just-in-time, estimación interna) |
| `tags` | Node.js · TypeScript · CLI · pnpm · Vitest · GitHub Actions |
| `image` | TBD — ⚠️ capturas reales de terminal/CLI en acción |
| `imageAlt` | Terminal del CLI de funky-ai mostrando el pipeline SDD |
| `links` | Repo: [funky-ai](https://github.com/MaxGB23/funky-ai) (público) · npm: no publicado |

---

## 2. Detail — Vista detallada

### Headline

**Un framework CLI para desarrollo de software asistido por IA**

### Summary

funky-ai unifica reglas agénticas, plantillas spec-driven y herramientas de planificación en un único CLI de Node.js (pnpm), sin superficie GUI. Orquesta el desarrollo como un pipeline determinista — proposal → specs → design → tasks → apply → verify → archive — cargando contexto just-in-time para proteger la ventana de tokens, con memoria persistente basada en archivos Markdown y endurecimiento de dependencias para proyectos pnpm. Todas las cifras de impacto son estimaciones internas del autor, no métricas externas.

### Metrics

| Value | Label |
| --- | --- |
| -40% | consumo de tokens vs. contexto always-loaded (SDD just-in-time) |
| 30–50% | menor costo de recall de memoria (funkygram vs. recargar contexto monolítico) |
| ~50% | más rápido de idea difusa a arquitectura costeada (funky-forge) |
| ~30% | menos riesgo de supply chain (funky secure) |
| -40% | rework fuera de alcance (TDD + issue-first workflow) |

> Todas las métricas son **estimaciones internas del autor** basadas en uso propio, no benchmarks externos.

### Problem

Las tareas grandes de IA asistida que arrancan de un único prompt masivo fallan de forma predecible: la ventana de contexto se desborda, el modelo alucina sobre partes que ya no recuerda y no hay punto natural de intervención humana. Los agentes no tienen memoria confiable entre sesiones, cada sesión re-aprende desde cero recargando contexto caro, y la planificación de proyectos ocurre ad-hoc, después de elegir el stack.

### Role

- Diseñé el ecosistema CLI completo: pipeline SDD con contexto just-in-time y separación orquestador/sub-agentes.
- Construí funkygram (memoria persistente), funky-forge (planificación) y funky secure (hardening de dependencias).
- Apliqué TDD con Vitest y workflow issue-first desde el inicio: cada cambio rastreado a un issue triado.
- Mantuve CI/CD con GitHub Actions (toolchain pineado a SHAs) y documentación viva verificada contra el CLI real.

### Solution

- **SDD framework** — pipeline determinista de fases con artefactos Markdown, 3 tiers que escalan el esfuerzo al impacto (T1 Flash: fixes de 1–2 archivos sin docs; T2 Standard: sub-agentes por fase; T3 Insano: rediseños arquitectónicos con sub-agentes aislados), 3 modos de ejecución (Interactive, Auto, Handoff) y puertas humanas antes de operaciones destructivas y Git.
- **funkygram** — memoria persistente en archivos Markdown dentro del repo: 7 categorías con shards O(1), esquema fijo (What/Why/Where/Learned), índice central auto-actualizado y recall deliberadamente low-tech y barato.
- **funky-forge** — de idea difusa a arquitectura costeada: `init` (canvases de proyecto e infra), `assess` (revisión de arquitectura con registro de decisiones), `estimate` (guía de costos con buffers y TCO), `pipeline` (estado compartido entre fases). La CLI prepara material, no juzga.
- **funky secure** — endurecimiento de dependencias pnpm: `doctor` (diagnóstico read-only), `init` (política idempotente), `check` (gate CI fail-closed). Incluye cuarentena de versiones frescas (72h) contra campañas tipo ChainDrop/Shai-Hulud y detección de secretos commitheados.
- **Prácticas** — issue-first (no hay código sin issue), CI en GitHub Actions con SHAs pineados, releases estructurados (bump, notas, tag) y docs vivas sincronizadas con el binario real.

### Stack

- **Lenguaje / Runtime:** Node.js, TypeScript
- **Package manager:** pnpm
- **CLI:** Node.js CLI (sin GUI)
- **Testing:** Vitest (TDD, Red → Green → Refactor)
- **CI/CD:** GitHub Actions (toolchain pineado a SHAs)
- **Memoria:** archivos Markdown (shards + índice central)
- **Pipeline:** plantillas SDD en Markdown, contexto just-in-time

### Escalabilidad

Tres tiers de orquestación escalan el proceso a la magnitud del cambio: el camino barato es realmente barato (T1 sin artefactos generados) y el camino profundo es realmente profundo (T3 con diseño y validación de NFRs en sub-agentes aislados). El principio just-in-time aplica a todo el sistema: contexto, reglas y memoria solo se cargan cuando se necesitan.

### Gallery

1. Terminal mostrando el pipeline SDD (fase + artefacto generado)
2. Shards de funkygram + índice central
3. `funky secure check` corriendo como gate en CI
4. `funky estimate` / pricing guide (opcional)

> ⚠️ Capturas reales pendientes — son herramientas de terminal, cualquier screenshot debe mostrar el CLI en acción, no mockups.

### CTA

_"¿Buscas incorporar IA en tu flujo de desarrollo con proceso y sin caos? Este framework es mi laboratorio público."_