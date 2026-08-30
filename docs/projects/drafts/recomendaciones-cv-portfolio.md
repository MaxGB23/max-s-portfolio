# Recomendaciones: incluir experiencia en CV y Portfolio

> Documento de propuesta para revisión y aprobación. Nada de esto está aplicado todavía.

## 1. Principio rector

- **La especialidad es el héroe:** Next.js / TypeScript / PostgreSQL + AI tooling + apps en producción.
- **Los proyectos previos son evidencia de trayectoria:** se referencian con una línea o un snippet corto, nunca con badges ni secciones gigantes.
- **Regla de la entrevista:** todo claim debe poder defenderse en vivo. Si no se puede defender, no va al documento.

## 2. Inventario y narrativa

| Proyecto | Stack real | Frame honesto | Dónde va |
| --- | --- | --- | --- |
| Centro CAF | Next.js, TS, Prisma, PostgreSQL, Vercel | App en producción con usuarios reales (staff médico) | CV (experiencia) · README · portfolio |
| funky-ai | Node.js CLI (pnpm) | Framework propio de desarrollo asistido por IA (SDD + funkygram + forge + secure) | CV (proyecto destacado) · README · portfolio |
| Municipal Gov | Next.js, TS, Supabase/PostgreSQL | Práctica profesional, plataforma municipal | CV (ya está) |
| ABMODEL | Laravel, Vue, Inertia.js, Laravel Breeze | PWA completa temprana (manifest, service worker, admin) | CV (Earlier Projects) — NO al README |
| 2 proyectos PHP | PHP puro | Primera experiencia profesional en prácticas | CV (Earlier Projects, una línea) |
| color-highlight-v2 | VS Code extension, TS, esbuild, pnpm | Fork + refactor modernizado (GPL-3.0) | CV (Earlier) · README (ya está) |
| funky-theme | VS Code theme, pnpm | Tema original MIT, paleta semántica SSOT | CV (Earlier) · README (ya está) |

**Narrativa que vende:** PHP/Laravel/Vue (PWA y prácticas) → tooling VS Code (extensión + theme) → especialidad actual (Next.js/TS/Postgres + funky-ai). Curva de crecimiento de junior con dirección clara.

## 3. CV

### 3.1 Estructura final sugerida (fusión de cv-legacy.md + CV-funky-ai.md)

1. Encabezado + Educación + Languages (igual)
2. Technical Skills (igual, ya enfocado)
3. Relevant Experience (Centro CAF + Municipal — igual)
4. **Featured Projects** (nuevo): funky-ai con 3 bullets (SDD pipeline, ecosistema CLI, TDD)
5. **Earlier Projects** (nuevo, sección corta): los proyectos previos
6. Leadership (igual)

### 3.2 Snippet listo para "Earlier Projects" (inglés)

```markdown
## Earlier Projects

- **ABMODEL** — Laravel + Vue PWA ("One Click Ti"): PWA manifest, service worker, landing page and admin panel with Inertia.js. Auth and roles with Laravel Breeze. Early full-stack project that introduced PWA and SPA patterns.
- **color-highlight-v2** — VS Code extension: modernized fork of `vscode-ext-color-highlight`; zero-lag render (150ms debounce), WCAG auto-contrast, store-agnostic `.vsix` distribution. GPL-3.0.
- **funky-theme** — semantic dark VS Code theme: 4 variants, tiered palette from a single source-of-truth config. MIT.
- **PHP internship projects** (2) — first professional experience during internships; pure PHP web applications.
```

### 3.3 Reglas del CV

- Cada proyecto: 1–3 líneas, sin fechas inventadas, sin métricas para ABMODEL.
- color-highlight-v2 siempre como "modernized fork", nunca "lo inventé".
- funky-ai: solo "author estimates" si se citan porcentajes (como ya hace CV-funky-ai.md).

## 4. Portfolio

- **NO** meter estos proyectos dentro de los tool files (`sdd-framework.md`, `funkygram.md`, etc.) — ruido que ensucia el foco.
- **Opción A (recomendada):** una página `journey.md` en `portfolio-funky-ai/` con la historia de evolución:
  1. *Empezando* — PHP/Laravel/Vue (ABMODEL PWA, prácticas PHP)
  2. *Tooling* — color-highlight-v2, funky-theme
  3. *Hoy* — funky-ai + apps en producción (CAF)
  - En inglés, sin badges del stack viejo, narrativa + links.
- **Opción B:** dejar que viva en el portfolio personal (`max-s-portfolio`, hoy privado) si ese es el destino natural.

## 5. Reglas de honestidad (resumen)

| Proyecto | Claim seguro |
| --- | --- |
| color-highlight-v2 | Fork modernizado de proyecto GPL-3.0 con crédito a autores originales |
| funky-theme | Original, MIT |
| ABMODEL | Primer proyecto full-stack completo, sin métricas |
| Porcentajes | Solo author estimates o datos medidos |

## 6. Orden de aplicación propuesto (requiere aprobación)

1. CV: fusionar funky-ai + sección Earlier Projects
2. Portfolio: crear `journey.md`
3. README del profile: ya aplicado (sección 🧩 Also built, commit `2da7cf7`)
