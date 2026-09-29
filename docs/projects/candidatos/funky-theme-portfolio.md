# funky-theme — Tema semántico original para VS Code (Consolidado)

> Fuente única de contenido para el portfolio. Editar aquí; luego se refleja en `data/projects.ts`.
> Última actualización: 2026-09-29

---

## 1. Brief — Vista normal (card del grid)

| Campo | Valor |
| --- | --- |
| `id` | `funky-theme` |
| `title` | funky-theme |
| `category` | Dev Tools / VS Code |
| `hook` | Tema oscuro semántico original para VS Code: 5 variantes derivadas de una paleta jerárquica definida en un único config (SSOT). |
| `metric` | 5 variantes · 1 paleta SSOT · Verified Open VSX Publisher · 2k desc/semana · 84% funnel VS Code Marketplace · Zed + TUI en desarrollo |
| `tags` | VS Code · Theme · pnpm · Token Colors |
| `image` | TBD — ⚠️ captura real del editor con las variantes del tema |
| `imageAlt` | Editor de VS Code mostrando las variantes de funky-theme |
| `links` | Repo: [funky-theme](https://github.com/MaxGB23/funky-theme) (público) · Markets: [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=MaxGB23.funky-theme-vscode) · [Open VSX](https://open-vsx.org/extension/MaxGB23/funky-theme-vscode) |

---

## 2. Detail — Vista detallada

### Headline

**Un tema original, con la paleta gobernada por una única fuente de verdad**

### Summary

Tema oscuro semántico original para VS Code, publicado bajo MIT. Cinco variantes derivadas de una paleta jerárquica definida en un solo archivo de configuración (SSOT): se toca un valor y todo el tema se mantiene coherente, sin colores duplicados entre cientos de archivos. Lanzado como estable en v3.0.0 (21/09/2026) tras 6 release candidates, publicado en VS Code Marketplace y Open VSX. **Verified Open VSX Publisher (namespace MaxGB23)**. Tracción: **2k descargas/semana en Open VSX**, **128 adquisiciones/30 días en VS Code Marketplace** con **funnel de conversión 84.21%** (page views → installs). Soporte **Zed** en mantenimiento activo. Release blindado tras hotfix real: guardias automáticas (changelog empaquetado + vsix vs allowlist). Expansión en curso: **funky-theme-tui** (mismo SSOT para terminales IA: Claude Code, OpenCode, Pi) en desarrollo.

### Metrics

| Value | Label |
| --- | --- |
| 5 | variantes del tema |
| 1 | fuente de verdad: paleta jerárquica en un único config |
| MIT | tema original, sin créditos a terceros |
| 2 | marketplaces: VS Code Marketplace + Open VSX |
| **Verified** | Open VSX Publisher (namespace MaxGB23) |
| **2k/sem** | descargas Open VSX (ritmo sostenido) |
| **128/30d** | adquisiciones VS Code Marketplace |
| **84.21%** | funnel de conversión (page views → installs) |
| **Zed** | soporte en mantenimiento activo |
| 2 | guardias automáticas del release: changelog empaquetado + vsix vs allowlist |
| 1 | repo TUI: funky-theme-tui (terminales IA) en desarrollo |

### Problem

La mayoría de los temas de editor duplican valores de color en cientos de archivos: cualquier cambio exige editar todo a mano y los colores terminan desincronizados. Una paleta única como SSOT elimina el drift — el diseño del tema queda gobernado por un solo archivo.

### Role

- Diseñé un tema original para VS Code publicado bajo licencia MIT.
- Definí la paleta jerárquica como única fuente de verdad (un solo archivo de configuración).
- Derivé las 5 variantes del tema desde esa paleta.
- Gestioné el ciclo completo de release: 6 release candidates (rc.1 → rc.6) hasta el estable v3.0.0, con pipeline propio de build + empaquetado + GitHub Release (SemVer estricto, convención RC → estable).
- Publiqué y operé la extensión en VS Code Marketplace y Open VSX (empaquetado de vsix, keywords optimizados al límite documentado de 30, changelog append-only).
- Blindé el pipeline de release tras un hotfix de packaging: guardias automáticas (changelog empaquetado verificado + vsix coincidente con su allowlist) y el error real documentado como regla dura en la skill de release.

### Solution

- **Paleta semántica SSOT:** colores definidos por rol semántico (UI, sintaxis, estados), no arbitrarios, en un solo config.
- **Variantes separadas por familias visuales:** el feedback de devs en foros y comunidades (Discord, etc.) guía qué se aplica en cada variante — italics, bold, etc. solo donde es deseado; para quien no los quiere, hay una variante a su medida.
- **5 variantes coherentes:** todas se mantienen en sincronía porque comparten la misma fuente.
- **Tema original:** propio, sin copia de otros temas, publicado bajo MIT.
- **Publicación en markets:** release estable en VS Code Marketplace y Open VSX, con keywords optimizados al límite documentado (30) para descubribilidad multiplataforma (VS Code, VSCodium, Google Antigravity, Cursor, Windsurf, Theia).
- **CI / control de calidad:** workflow de build-check con pnpm que valida las 5 variantes (existencia y parseo de los JSON) en cada push y PR; releases SemVer estrictas y trazables.
- **Release blindado tras aprendizaje de errores:** el changelog se finaliza antes de empaquetar (el vsix lleva la sección de la versión) y una guardia verifica que el vsix coincida exactamente con su `.vscodeignore` (sin fugas ni assets faltantes) — un hotfix de packaging real dejó el proceso más robusto y documentado en la skill de release.
- **Tracción validada:** **Verified Open VSX Publisher**; **2k descargas/semana** en Open VSX; **128 adquisiciones/30d** en VS Code Marketplace con **funnel 84.21%** (page views → installs) — posicionamiento SEO orgánico demostrado.
- **Cross-editor:** soporte **Zed** en mantenimiento activo (misma paleta SSOT).
- **Expansión terminal:** **funky-theme-tui** — misma filosofía SSOT para agentes de código en terminal (Claude Code, OpenCode, Pi); repo público, pre-estable.

### Stack

- **Formato:** VS Code theme (token colors)
- **Package manager:** pnpm
- **Licencia:** MIT (original)

### Contexto de carrera

Paso de *tooling* en la curva profesional: PHP/Laravel/Vue → tooling VS Code → especialidad actual. Complementa la extensión color-highlight-v2 y demuestra criterio de diseño + disciplina de datos (SSOT) aplicados a un proyecto pequeño y pulido. El incidente de packaging (changelog ausente en el vsix publicado) se convirtió en guardia automática del release: demuestra experiencia, capacidad de aprender de errores y de blindar procesos. **Expansión deliberada**: misma SSOT → Zed (editor) + funky-theme-tui (terminales IA); demuestra que la arquitectura de paleta única escala a nuevos targets sin duplicar lógica.

### Gallery

1. Editor mostrando las variantes del tema
2. Estructura de la paleta SSOT (opcional)

> ⚠️ Capturas reales pendientes.

### Próximos pasos / Seguimiento

- **Métricas de instalaciones:** consolidar evolución de descargas/instalaciones y rating en ambos markets; funnel de conversión como KPI principal.
- **Reviews:** dar seguimiento a valoraciones y reseñas en VS Code Marketplace y Open VSX.
- **Issues / PRs:** atender, triage y resolver issues y pull requests de la comunidad.
- **Zed:** completar soporte al 100% y publicar en Zed extensions.
- **funky-theme-tui:** llevar a estable; publicar en repositorios de cada agente (Claude Code, OpenCode, Pi) y documentar la SSOT compartida.
- **Oportunidades:** con funnel 84% y 2k/sem, escalar descubribilidad (icono/readme, versión web) y evaluar CI como gate de release.

### CTA

_"¿Te interesa el diseño de temas con paleta semántica gobernada por SSOT? Hablemos."_