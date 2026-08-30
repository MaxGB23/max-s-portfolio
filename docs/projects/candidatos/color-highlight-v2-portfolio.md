# color-highlight-v2 — Fork modernizado de extensión VS Code (Consolidado)

> Fuente única de contenido para el portfolio. Editar aquí; luego se refleja en `data/projects.ts`.
> Última actualización: 2026-08-28
> ⚠️ Regla de frame (del doc de estrategia): **siempre "modernized fork", nunca "lo inventé"** — el crédito a autores originales es parte de la historia.

---

## 1. Brief — Vista normal (card del grid)

| Campo | Valor |
| --- | --- |
| `id` | `color-highlight-v2` |
| `title` | color-highlight v2 |
| `category` | Dev Tools / VS Code |
| `hook` | Fork modernizado de la extensión de VS Code que resalta colores en el editor; reconstruido con TypeScript, esbuild y pnpm. |
| `metric` | Render sin lag — debounce de 150ms |
| `tags` | TypeScript · esbuild · pnpm · VS Code |
| `image` | TBD — ⚠️ captura real del resaltado en el editor (antes/después ideal) |
| `imageAlt` | Editor de VS Code con colores resaltados por la extensión |
| `links` | Repo: [color-highlight-v2](https://github.com/MaxGB23/color-highlight-v2) (público) |

---

## 2. Detail — Vista detallada

### Headline

**Un fork modernizado, con crédito a los autores originales**

### Summary

Fork modernizado de `vscode-ext-color-highlight` (GPL-3.0): la extensión de VS Code que resalta colores en el editor, reconstruida con un stack moderno — TypeScript, esbuild y pnpm — e incorporando mejoras de rendimiento y accesibilidad. Se presenta siempre como fork de un proyecto existente, nunca como creación propia.

### Metrics

| Value | Label |
| --- | --- |
| 150ms | debounce → render sin lag en el editor |
| WCAG | auto-contraste sobre el color resaltado |
| .vsix | distribución agnóstica de la tienda (store-agnostic) |
| GPL-3.0 | fork con crédito explícito a los autores originales |

### Problem

La extensión original resolvía un problema real — ver los colores del código directamente en el editor — pero su base había envejecido: sin tipado, build lento y dependencias pesadas. Modernizarla la hace mantenible y rápida sin abandonar la licencia ni el crédito a sus autores.

### Role

- Modernicé un proyecto open source existente (GPL-3.0) reconstruyéndolo con TypeScript, esbuild y pnpm.
- Apliqué mejoras de rendimiento y accesibilidad: render con debounce de 150ms y auto-contraste WCAG.
- Preparé la distribución `.vsix` agnóstica de la tienda de extensiones.
- Mantuve la licencia GPL-3.0 y el crédito a los autores originales — el proyecto se presenta como fork modernizado, nunca como invención propia.

### Solution

- **Stack moderno:** TypeScript (tipado), esbuild (build rápido), pnpm (dependencias modernas y reproducibles).
- **Render sin lag:** debounce de 150ms para no bloquear el editor al teclear.
- **Auto-contraste WCAG:** el color del texto se ajusta para mantener legibilidad sobre cualquier color resaltado.
- **Distribución store-agnostic:** `.vsix` instalable sin depender de una tienda concreta.

### Stack

- **Lenguaje:** TypeScript
- **Build:** esbuild
- **Package manager:** pnpm
- **Plataforma:** API de extensiones de VS Code
- **Licencia:** GPL-3.0 (fork de `vscode-ext-color-highlight`)

### Contexto de carrera

Paso de *tooling* en la curva profesional: PHP/Laravel/Vue → tooling VS Code → especialidad actual. Demuestra la capacidad de trabajar sobre código ajeno con respeto al open source — modernizar sin romper licencia ni crédito.

### Gallery

1. Editor con colores resaltados (antes/después ideal)
2. Detalle de auto-contraste (opcional)

> ⚠️ Capturas reales pendientes.

### CTA

_"¿Quieres ver cómo modernizo un proyecto open source existente sin romper su licencia? Hablemos."_