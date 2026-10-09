# funky-theme — Tema semántico original para VS Code (Consolidado)

> Fuente única de contenido para el portfolio. Editar aquí; luego se refleja en `data/projects.ts`.
> Última actualización: 2026-10-08

---

## 1. Brief — Vista normal (card del grid)

| Campo | Valor |
| --- | --- |
| `id` | `funky-theme` |
| `title` | funky-theme |
| `category` | Dev Tools / VS Code |
| `hook` | Tema oscuro semántico original compatible en cualquier VSCode-based editor y Terminales: 5 variantes derivadas de una paleta jerárquica definida en un único config (SSOT). |
| `metric` | 3.3k descargas en Open VSX |
| `tags` | VS Code · Verified · Open VSX · Zed · Token Colors · Terminal UI |
| `image` | `/images/projects/funky-theme/funky-theme-demo.webp` |
| `imageAlt` | Captura de VS Code con el tema funky-theme aplicado a un editor |
| `links` | Repo: [funky-theme](https://github.com/MaxGB23/funky-theme) (público) · Markets: [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=MaxGB23.funky-theme-vscode) · [Open VSX](https://open-vsx.org/extension/MaxGB23/funky-theme-vscode) |

---

## 2. Detail — Vista detallada

### Headline

**Un tema original, con la paleta gobernada por una única fuente de verdad**

### Summary

Tema oscuro semántico original bajo MIT, operado como producto multi-marketplace: cinco variantes desde una paleta jerárquica en un solo config (SSOT) para editores. Estable v3.2.2 en VS Code Marketplace y Open VSX con tracción real, Zed recién lanzado y expansión a terminales IA en beta. Instalación en un clic desde cada marketplace y variantes a medida para el usuario; SSOT, CI y SemVer estricto para el mantenimiento.

### Metrics

| Value | Label |
| --- | --- |
| 3.3k | descargas acumuladas en Open VSX (3,296 medidas el 8 oct 2026) |
| 191/30d | adquisiciones VS Code Marketplace |
| 97.45% | funnel de conversión (page views → installs) |
| 5 | variantes del tema |
| Verified | Open VSX Publisher (namespace MaxGB23) |
| Beta | integración con 3 agentes IA (Claude Code, OpenCode, Pi) |

### Problem

La mayoría de los temas de editor duplican valores de color en cientos de archivos: cualquier cambio exige editar todo a mano y los colores terminan desincronizados. Una paleta única como SSOT elimina el drift — el diseño del tema queda gobernado por un solo archivo.

### Role

- Diseñé un tema original para VS Code publicado bajo licencia MIT.
- Definí la paleta jerárquica como única fuente de verdad para editores (un solo archivo de configuración).
- Derivé las 5 variantes del tema desde esa paleta.
- Gestioné el ciclo completo de release: 6 release candidates (rc.1 → rc.6, solo instalación manual desde el repo) hasta el estable v3.0.0, primera publicación en markets, con pipeline propio de build + empaquetado + GitHub Release (SemVer estricto, convención RC → estable).
- Publiqué y operé la extensión en VS Code Marketplace y Open VSX (empaquetado de vsix, keywords optimizados al límite documentado de 30, changelog append-only).
- Blindé el pipeline de release tras un hotfix de packaging: guardias automáticas (changelog empaquetado verificado + vsix coincidente con su allowlist) y el error real documentado como regla dura en la skill de release.

### Solution

- **Paleta semántica SSOT:** colores definidos por rol semántico (UI, sintaxis, estados), no arbitrarios, en un solo config.
- **Variantes separadas por familias visuales:** el feedback de devs en foros y comunidades (Discord, etc.) guía qué se aplica en cada variante — italics, bold, etc. solo donde es deseado; para quien no los quiere, hay una variante a su medida. Las 5 se mantienen en sincronía porque comparten la misma fuente.
- **Publicación en markets:** release estable en VS Code Marketplace y Open VSX, con keywords optimizados al límite documentado (30) para descubribilidad multiplataforma (VS Code, VSCodium, Google Antigravity, Cursor, Windsurf, Theia).
- **CI / control de calidad:** workflow de build-check con pnpm que valida las 5 variantes (existencia y parseo de los JSON) en cada push y PR; el mismo CI empaqueta el artefacto de Zed y prepara su PR al marketplace; releases SemVer estrictas y trazables.
- **Release blindado tras aprendizaje de errores:** el changelog se finaliza antes de empaquetar (el vsix lleva la sección de la versión) y una guardia verifica que el vsix coincida exactamente con su `.vscodeignore` (sin fugas ni assets faltantes) — un hotfix de packaging real dejó el proceso más robusto y documentado en la skill de release.
- **Tracción validada:** **Verified Open VSX Publisher**; **3.3k descargas acumuladas** en Open VSX (3,296 medidas el 8 oct 2026); **191 adquisiciones/30d** en VS Code Marketplace con **funnel 97.45%** (page views → installs) — posicionamiento SEO orgánico demostrado.
- **Cross-editor:** soporte **Zed** lanzado hoy con instalación manual mientras se acepta el PR al marketplace (misma paleta de editores).
- **Expansión terminal:** **funky-theme-tui** — variaciones mínimas para terminales con agentes de código (Claude Code, OpenCode, Pi), en repo aparte y en beta.

### Stack

- **Formato:** VS Code theme (token colors)
- **Package manager:** pnpm
- **Licencia:** MIT (original)

### Contexto de carrera

Paso de *tooling* en la curva profesional: PHP/Laravel/Vue → tooling VS Code → especialidad actual. Complementa la extensión color-highlight-v2 y demuestra criterio de diseño + disciplina de datos (SSOT) aplicados a un proyecto pequeño y pulido. El incidente de packaging (changelog ausente en el vsix publicado) se convirtió en guardia automática del release: demuestra experiencia, capacidad de aprender de errores y de blindar procesos. **Expansión deliberada**: misma SSOT → Zed (editor) + funky-theme-tui (terminales IA); demuestra que la arquitectura de paleta única escala a nuevos targets sin duplicar lógica.

### Gallery

1. Editor mostrando las variantes del tema (`IDE-completo.webp`)
2. Variante Dark en TSX (`funky-dark-tsx.webp`)
3. Variante Darker en TypeScript (`funky-darker-typescript.webp`)
4. Tema en terminal OpenCode (`funky-tui-opencode.webp`)

### Próximos pasos / Seguimiento

- **Métricas de instalaciones:** consolidar evolución de descargas/instalaciones y rating en ambos markets; funnel de conversión como KPI principal.
- **Reviews:** dar seguimiento a valoraciones y reseñas en VS Code Marketplace y Open VSX.
- **Issues / PRs:** atender, triage y resolver issues y pull requests de la comunidad.
- **Zed:** conseguir aceptación del PR en el marketplace (soporte ya lanzado con instalación manual).
- **funky-theme-tui:** llevar a estable; publicar en repositorios de cada agente (Claude Code, OpenCode, Pi) y documentar la SSOT compartida.
- **Oportunidades:** con funnel 84% y 2k/sem, escalar descubribilidad (icono/readme, versión web) y evaluar CI como gate de release.

### CTA

_"¿Te interesa el diseño de temas con paleta semántica gobernada por SSOT? Hablemos."_