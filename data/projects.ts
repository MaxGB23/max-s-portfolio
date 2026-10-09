// Single source of truth for portfolio projects.
// Extracted from docs/projects/candidatos/*.md. Fields without real content
// stay as empty string or undefined — never invent data.
//
// Los tipos viven en ./projects/types.ts (shape bilingue `L` + el legacy `*Es`).
// Este archivo sigue siendo el modulo publico: reexporta los tipos, asi que
// ningun consumidor cambia su linea de import durante la migracion ficha por
// ficha. Las fichas ya migradas viven en ./projects/<id>.ts como `ProjectL` y se
// reensamblan aqui en el MISMO orden (el orden es contrato de layout); las que
// quedan siguen en `ProjectEs` hasta que cada una migre a `ProjectL`.

import type { ProjectEs, ProjectEntry } from "./projects/types";
import { caf } from "./projects/caf";
import { presidencia } from "./projects/presidencia";
import { funkyAi } from "./projects/funky-ai";
import { grinchmasKart } from "./projects/grinchmas-kart";
import { cumyxel } from "./projects/cumyxel";
import { oneClickTi } from "./projects/one-click-ti";
import { autoshop } from "./projects/autoshop";

export type {
  ProjectEs,
  ProjectDetailEs,
  ProjectMetricEs,
  ProjectImageEs,
  ArchitectureNodeEs,
  ProjectLinkEs,
  ProjectL,
  ProjectEntry,
  MetricL,
  NodeL,
  LinkL,
  ProjectImageL,
  L,
  Localized,
} from "./projects/types";

export { localizeProject } from "./projects/types";

// Alias de compatibilidad hacia los nombres sin sufijo. Sobreviven al renombre
// `*Es` para que ningun consumidor tenga que editar su import durante la
// migracion (p.ej. `components/project-architecture.tsx` importa `ArchitectureNode`).
// Mueren con `ProjectEs` en T12.
export type {
  ProjectEs as Project,
  ProjectDetailEs as ProjectDetail,
  ProjectMetricEs as ProjectMetric,
  ProjectImageEs as ProjectImage,
  ArchitectureNodeEs as ArchitectureNode,
  ProjectLinkEs as ProjectLink,
} from "./projects/types";

export const projects: ProjectEntry[] = [
  caf,
  presidencia,
  funkyAi,
  grinchmasKart,
  cumyxel,
  oneClickTi,
  autoshop,
  {
    id: "color-highlight-v2",
    title: "Color Highlight v2",
    category: "Dev Tools / VS Code",
    hook: "Fork modernizado de la extensión que resalta colores en el editor: debounce de 150 ms, build con esbuild, 38 KB y 2 dependencias.",
    metric: "38 KB compilados, 2 dependencias en runtime",
    tags: ["TypeScript", "esbuild", "pnpm", "VS Code"],
    image: "/images/projects/color-highlight-v2/main.webp",
    imageAlt: "Mockup de Color Highlight v2: logo, eslogan y una ventana de VS Code resaltando colores en CSS y SCSS",
    links: [
      {
        label: "Ver código",
        kind: "code",
        url: "https://github.com/MaxGB23/color-highlight-v2",
        external: true,
      },
    ],
    detail: {
      headline:
        "Escaneo con debounce de 150 ms y build con esbuild: 38 KB y 2 dependencias",
      summary:
        "Fork modernizado de `vscode-ext-color-highlight` (GPL-3.0), la extensión que resalta los colores directamente en el editor. El original relanzaba un escaneo completo en cada tecla: añadí un debounce de 150 ms que elimina ese cuello de botella. También sustituí su cadena de build (webpack + babel + npm) por esbuild + pnpm, dejando el artefacto en 38 KB y las dependencias en runtime de 4 a 2, y migré el núcleo a TypeScript. Fork bajo GPL-3.0, con crédito explícito a los autores originales.",
      metrics: [
        {
          value: "38 KB",
          label: "del artefacto compilado de la extensión",
        },
        {
          value: "150 ms",
          label:
            "de debounce añadido: el original relanzaba el escaneo completo en cada tecla",
        },
        {
          value: "2",
          label: "dependencias en runtime, de 4 en el original a 2 en el fork",
        },
        {
          value: "11",
          label:
            "estrategias de detección de color en 6 formatos: SCSS, LESS, CSS vars, Hex/RGB, HSL y HWB",
        },
      ],
      problem:
        "La extensión original resolvía un problema real — ver los colores del código directamente en el editor — pero su base había envejecido: relanzaba un escaneo completo en cada tecla, su build pasaba por webpack y babel con cuatro dependencias en runtime, y el núcleo no estaba tipado. Modernizarla la hace mantenible y ligera sin abandonar la licencia ni el crédito de sus autores.",
      role: [
        "Sustituí la cadena de build (webpack + babel + npm) por esbuild + pnpm: el artefacto compilado quedó en 38 KB y las dependencias en runtime bajaron de 4 a 2.",
        "Añadí un debounce de 150 ms al motor de resaltado, que antes relanzaba el escaneo completo con cada tecla; el motivo está documentado en el código.",
        "Migré el núcleo a TypeScript (motor de resaltado, mapa de decoraciones, contraste e importer de Sass) y añadí un script `check-types` al pipeline.",
        "Reescribí el mapa de decoraciones con ciclo de vida y liberación explícita, corrigiendo las fugas de memoria de decoraciones.",
        "Mantuve la licencia GPL-3.0 y el crédito a los autores originales: el proyecto se presenta como fork modernizado, nunca como invención propia.",
      ],
      solution: [
        "**Debounce de 150 ms:** el motor deja de relanzar el escaneo completo en cada tecla, que es de donde venía el atasco al escribir.",
        "**Build con esbuild:** sustituye a webpack + babel, sin transpilación intermedia ni esa cadena de toolchain.",
        "**38 KB y 2 dependencias:** el paquete se empaqueta con `--no-dependencies`, así que instala en VS Code, Cursor, Windsurf, VSCodium y Antigravity sin arrastrar nada.",
        "**Núcleo en TypeScript:** motor, mapa de decoraciones, contraste e importer de Sass con tipado, verificados en cada build con `check-types`.",
      ],
      stack: [
        "Lenguaje: TypeScript (núcleo) + JavaScript (estrategias heredadas)",
        "Build: esbuild (antes webpack + babel)",
        "Package manager: pnpm",
        "Plataforma: API de extensiones de VS Code (VS Code 1.90+)",
        "Licencia: GPL-3.0 (fork de `vscode-ext-color-highlight`)",
      ],
      gallery: [
        {
          src: "/images/projects/color-highlight-v2/demo-vscode.webp",
          alt: "VS Code con los colores resaltados en un archivo CSS real",
        },
        {
          src: "/images/projects/color-highlight-v2/main.webp",
          alt: "Mockup de Color Highlight v2 con el logo y el eslogan de la extensión",
        },
      ],
      cta: "¿Tu editor se atasca al escribir y quieres una extensión que no pese? Hablemos.",
    },
    architecture: {
      name: "Color Highlight v2",
      description:
        "Fork modernizado de vscode-ext-color-highlight (GPL-3.0): debounce añadido al motor, build con esbuild y 38 KB de artefacto.",
      children: [
        {
          name: "Debounce de 150 ms",
          description:
            "El motor deja de relanzar el escaneo completo en cada tecla, que era el atasco al escribir.",
        },
        {
          name: "Build con esbuild",
          description:
            "Sustituye a webpack + babel + npm; sin transpilación intermedia.",
        },
        {
          name: "Dependencias reducidas",
          description:
            "De 4 a 2 en runtime: color y color-name, sin @babel/runtime ni file-importer.",
        },
        {
          name: "Núcleo en TypeScript",
          description:
            "Motor, mapa de decoraciones, contraste e importer de Sass, con check-types en cada build.",
        },
        {
          name: "Mapa de decoraciones",
          description:
            "Ciclo de vida y dispose explícitos: corrige las fugas de memoria de decoraciones.",
        },
      ],
    },
  },
  {
    id: "funky-theme",
    title: "Funky Theme",
    category: "Dev Tools / VS Code",
    hook: "Tema oscuro semántico original compatible en cualquier VSCode-based editor y Terminales: 5 variantes derivadas de una paleta jerárquica definida en un único config (SSOT).",
    metric: "3.3k descargas en Open VSX",
    tags: ["VS Code", "Verified", "Open VSX", "Zed", "Token Colors", "Terminal UI"],
    image: "/images/projects/funky-theme/funky-theme-demo.webp",
    imageAlt: "Captura de VS Code con el tema funky-theme aplicado a un editor",
    featured: true,
    links: [
      {
        label: "Ver código",
        kind: "code",
        url: "https://github.com/MaxGB23/funky-theme",
        external: true,
      },
      {
        label: "VSCode Marketplace",
        kind: "landing",
        url: "https://marketplace.visualstudio.com/items?itemName=MaxGB23.funky-theme-vscode",
        external: true,
      },
      {
        label: "Open VSX",
        kind: "landing",
        url: "https://open-vsx.org/extension/MaxGB23/funky-theme-vscode",
        external: true,
      },
      {
        label: "Terminales (TUI)",
        kind: "code",
        url: "https://github.com/MaxGB23/funky-theme-tui",
        external: true,
      },
    ],
    detail: {
      headline:
        "Un tema original, con la paleta gobernada por una única fuente de verdad",
      summary:
        "Tema oscuro semántico original bajo MIT, operado como producto multi-marketplace: cinco variantes desde una paleta jerárquica en un solo config (SSOT) para editores. Estable v3.2.2 en VS Code Marketplace y Open VSX con tracción real, Zed recién lanzado y expansión a terminales IA en beta. Instalación en un clic desde cada marketplace y variantes a medida para el usuario; SSOT, CI y SemVer estricto para el mantenimiento.",
      metrics: [
        {
          value: "3.3k",
          label:
            "descargas acumuladas en Open VSX (3,296 medidas el 8 oct 2026)",
        },
        { value: "191/30d", label: "adquisiciones VS Code Marketplace" },
        { value: "97.45%", label: "funnel de conversión (page views → installs)" },
        { value: "5", label: "variantes del tema" },
        {
          value: "Verified",
          label: "Open VSX Publisher (namespace MaxGB23)",
        },
        {
          value: "Beta",
          label: "integración con 3 agentes IA (Claude Code, OpenCode, Pi)",
        },
      ],
      visual: {
        src: "/images/projects/funky-theme/perifericos.webp",
        alt: "Editor de VS Code mostrando funky-theme",
      },
      problem:
        "La mayoría de los temas de editor duplican valores de color en cientos de archivos: cualquier cambio exige editar todo a mano y los colores terminan desincronizados. Una paleta única como SSOT elimina el drift — el diseño del tema queda gobernado por un solo archivo.",
      role: [
        "Diseñé un tema original para VS Code publicado bajo licencia MIT.",
        "Definí la paleta jerárquica como única fuente de verdad para editores (un solo archivo de configuración).",
        "Derivé las 5 variantes del tema desde esa paleta.",
        "Gestioné el ciclo completo de release: 6 release candidates (rc.1 → rc.6, solo instalación manual desde el repo) hasta el estable v3.0.0, primera publicación en markets, con pipeline propio de build + empaquetado + GitHub Release (SemVer estricto, convención RC → estable).",
        "Publiqué y operé la extensión en VS Code Marketplace y Open VSX (empaquetado de vsix, keywords optimizados al límite documentado de 30, changelog append-only).",
        "Blindé el pipeline de release tras un hotfix de packaging: guardias automáticas (changelog empaquetado verificado + vsix coincidente con su allowlist) y el error real documentado como regla dura en la skill de release.",
      ],
      solution: [
        "**Paleta semántica SSOT:** colores definidos por rol semántico (UI, sintaxis, estados), no arbitrarios, en un solo config.",
        "**Variantes separadas por familias visuales:** el feedback de devs en foros y comunidades (Discord, etc.) guía qué se aplica en cada variante — italics, bold, etc. solo donde es deseado; para quien no los quiere, hay una variante a su medida. Las 5 se mantienen en sincronía porque comparten la misma fuente.",
        "**Publicación en markets:** release estable en VS Code Marketplace y Open VSX, con keywords optimizados al límite documentado (30) para descubribilidad multiplataforma (VS Code, VSCodium, Google Antigravity, Cursor, Windsurf, Theia).",
        "**CI / control de calidad:** workflow de build-check con pnpm que valida las 5 variantes (existencia y parseo de los JSON) en cada push y PR; el mismo CI empaqueta el artefacto de Zed y prepara su PR al marketplace; releases SemVer estrictas y trazables.",
        "**Release blindado tras aprendizaje de errores:** el changelog se finaliza antes de empaquetar (el vsix lleva la sección de la versión) y una guardia verifica que el vsix coincida exactamente con su `.vscodeignore` (sin fugas ni assets faltantes) — un hotfix de packaging real dejó el proceso más robusto y documentado en la skill de release.",
        "**Tracción validada:** **Verified Open VSX Publisher**; **3.3k descargas acumuladas** en Open VSX (3,296 medidas el 8 oct 2026); **191 adquisiciones/30d** en VS Code Marketplace con **funnel 97.45%** (page views → installs) — posicionamiento SEO orgánico demostrado.",
        "**Cross-editor:** soporte **Zed** lanzado hoy con instalación manual mientras se acepta el PR al marketplace (misma paleta de editores).",
        "**Expansión terminal:** **funky-theme-tui** — variaciones mínimas para terminales con agentes de código (Claude Code, OpenCode, Pi), en repo aparte y en beta.",
      ],
      stack: [
        "Formato: VS Code theme (token colors)",
        "Package manager: pnpm",
        "Licencia: MIT (original)",
        "Editores: VS Code, VSCodium, Cursor, Windsurf, Zed (instalación manual, PR pendiente), Theia",
        "Distribución: VS Code Marketplace, Open VSX, .vsix store-agnostic",
        "Terminal IA: funky-theme-tui (Claude Code, OpenCode, Pi) — variaciones de terminal en repo aparte, beta",
      ],
      gallery: [
        {
          src: "/images/projects/funky-theme/funky-tui-opencode.webp",
          alt: "Funky Theme en TUI OpenCode",
        },
        {
          src: "/images/projects/funky-theme/funky-dark-tsx.webp",
          alt: "Funky Theme Dark - TSX code",
        },
        {
          src: "/images/projects/funky-theme/funky-darker-typescript.webp",
          alt: "Funky Theme Darker - TS code",
        },
        {
          src: "/images/projects/funky-theme/IDE-completo.webp",
          alt: "Funky Theme en VSCode",
        },
      ],
      cta: "¿Te interesa el diseño de temas con paleta semántica gobernada por SSOT? Hablemos.",
    },
    architecture: {
      name: "funky-theme",
      description:
        "Tema oscuro semántico original para VS Code (MIT): 5 variantes derivadas de una paleta jerárquica en un único config (SSOT) para editores — se toca un valor y todo el tema se mantiene coherente. Expansión cross-editor (Zed, instalación manual) y terminal IA (funky-theme-tui, con variaciones propias) desde la misma base.",
      children: [
        {
          name: "Paleta semántica SSOT",
          description:
            "Colores definidos por rol semántico (UI, sintaxis, estados), no arbitrarios, en un solo config. Única fuente de verdad para los editores.",
        },
        {
          name: "5 variantes por familias visuales",
          description:
            "Derivadas de la misma fuente; italics y bold solo donde es deseado, con una variante a medida para quien no los quiere.",
        },
        {
          name: "Tema original",
          description: "Propio, sin copia de otros temas, publicado bajo MIT.",
        },
        {
          name: "Publicación y release blindado",
          description:
            "VS Code Marketplace + Open VSX (Verified Publisher). Keywords optimizados (límite 30). CI pnpm valida 5 variantes. Release guardado: changelog empaquetado verificado + vsix vs allowlist exacto (hotfix real → skill de release).",
        },
        {
          name: "Cross-editor: Zed",
          description:
            "Soporte en mantenimiento activo. Misma paleta SSOT → tema Zed sin duplicar lógica de color.",
        },
        {
          name: "Terminal IA: funky-theme-tui",
          description:
            "Repo público (MaxGB23/funky-theme-tui). Misma filosofía SSOT para Claude Code, OpenCode, Pi. Pre-estable. Demuestra que la arquitectura de paleta única escala a nuevos targets sin duplicar lógica.",
        },
      ],
    },
  },
];

export function getProjectById(id: string): ProjectEntry | undefined {
  return projects.find((project) => project.id === id);
}

export function getFeaturedProjects(): ProjectEntry[] {
  return projects.filter((project) => project.featured);
}
