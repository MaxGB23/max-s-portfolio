// Ficha `funky-theme` (Funky Theme) en el shape bilingue `ProjectL`.
//
// Copy ES VERBATIM: es el copy editorial ya auditado contra el repo real. No se
// reescribe ni se "mejora": la hoja `en` va al lado, nunca dentro del ES.
//
// TAGS APROBADOS POR EL USUARIO (6): `VS Code`, `Verified`, `Open VSX`, `Zed`,
// `Token Colors`, `Terminal UI`. No se tocan — son texto de badge/buscador, no
// prosa, y el usuario losaprobo explicitamente.
//
// CONTRATO DE ORDEN (ver ProjectL.detail.metrics): `metrics[0]` es la metrica
// raiz del detail, y el orden de `metrics`, `role`, `solution` y `gallery` es
// contrato de layout (KpiGrid de 2 columnas, nodo raiz de la topologia). No
// reordenar al anadir el `en`.
//
// NIVEL DE DETALLE: el arbol de `architecture` es largo a proposito. El EN
// mantiene la misma granularidad — no se abrevia ni se resume ningun nodo, para
// que la topologia se lea igual en los dos idiomas.
//
// CIFRAS INTACTAS: `3.3k`, `3,296`, `8 oct 2026`, `191/30d`, `97.45%`, `5`,
// `30` (limite de keywords) se traducen sin alterar un solo digito. El ES
// escribe el limite de keywords con coma de miles por error ("30") y con flecha
// (->) que el EN debe respetar tal cual para no divergir del dato upstream.

import { linkLabelCode, type ProjectL } from "./types";

export const funkyTheme: ProjectL = {
  id: "funky-theme",
  title: {
    // Nombre del tema: identidad a proposito.
    es: "Funky Theme",
    en: "Funky Theme",
  },
  category: {
    // "Dev Tools" ya es el termino del sector en ingles: identidad a proposito.
    es: "Dev Tools / VS Code",
    en: "Dev Tools / VS Code",
  },
  hook: {
    es: "Tema oscuro semántico original compatible en cualquier VSCode-based editor y Terminales: 5 variantes derivadas de una paleta jerárquica definida en un único config (SSOT).",
    en: "Original semantic dark theme compatible with any VSCode-based editor and terminal: 5 variants derived from a hierarchical palette defined in a single config (SSOT).",
  },
  metric: {
    es: "3.3k descargas en Open VSX",
    en: "3.3k downloads on Open VSX",
  },
  // Tags APROBADOS por el usuario: no se tocan.
  tags: ["VS Code", "Verified", "Open VSX", "Zed", "Token Colors", "Terminal UI"],
  image: "/images/projects/funky-theme/funky-theme-demo.webp",
  imageAlt: {
    es: "Captura de VS Code con el tema funky-theme aplicado a un editor",
    en: "Screenshot of VS Code with the funky-theme theme applied to an editor",
  },
  featured: true,
  links: [
    {
      label: linkLabelCode,
      kind: "code",
      url: "https://github.com/MaxGB23/funky-theme",
      external: true,
    },
    {
      // Nombre de marketplace: identidad a proposito.
      label: {
        es: "VSCode Marketplace",
        en: "VSCode Marketplace",
      },
      kind: "landing",
      url: "https://marketplace.visualstudio.com/items?itemName=MaxGB23.funky-theme-vscode",
      external: true,
    },
    {
      // Nombre de marketplace: identidad a proposito.
      label: {
        es: "Open VSX",
        en: "Open VSX",
      },
      kind: "landing",
      url: "https://open-vsx.org/extension/MaxGB23/funky-theme-vscode",
      external: true,
    },
    {
      label: {
        es: "Terminales (TUI)",
        en: "Terminals (TUI)",
      },
      kind: "code",
      url: "https://github.com/MaxGB23/funky-theme-tui",
      external: true,
    },
  ],
  detail: {
    headline: {
      es: "Un tema original, con la paleta gobernada por una única fuente de verdad",
      en: "An original theme, with the palette governed by a single source of truth",
    },
    summary: {
      es: "Tema oscuro semántico original bajo MIT, operado como producto multi-marketplace: cinco variantes desde una paleta jerárquica en un solo config (SSOT) para editores. Estable v3.2.2 en VS Code Marketplace y Open VSX con tracción real, Zed recién lanzado y expansión a terminales IA en beta. Instalación en un clic desde cada marketplace y variantes a medida para el usuario; SSOT, CI y SemVer estricto para el mantenimiento.",
      // El ES no lleva pares `**`: el EN tampoco los inventa (docs/i18n.md:25).
      en: "Original semantic dark theme under MIT, operated as a multi-marketplace product: five variants from a hierarchical palette in a single config (SSOT) for editors. Stable v3.2.2 on VS Code Marketplace and Open VSX with real traction, Zed just launched and expansion to AI terminals in beta. One-click install from each marketplace and custom variants for the user; SSOT, CI and strict SemVer for maintenance.",
    },
    metrics: [
      {
        // metrics[0] = metrica RAIZ del detail (nodo raiz de la topologia).
        value: {
          // Cifra pura: se traduce por identidad (no hay palabra que traducir).
          es: "3.3k",
          en: "3.3k",
        },
        label: {
          es: "descargas acumuladas en Open VSX (3,296 medidas el 8 oct 2026)",
          en: "cumulative downloads on Open VSX (3,296 measured on Oct 8, 2026)",
        },
      },
      {
        value: {
          // "191/30d" es un valor compuesto con su propia unidad: identidad.
          es: "191/30d",
          en: "191/30d",
        },
        label: {
          es: "adquisiciones VS Code Marketplace",
          en: "VS Code Marketplace acquisitions",
        },
      },
      {
        value: {
          // Cifra pura: identidad.
          es: "97.45%",
          en: "97.45%",
        },
        label: {
          // "funnel" es el termino ingles del concepto; la flecha se preserva.
          es: "funnel de conversión (page views → installs)",
          en: "conversion funnel (page views → installs)",
        },
      },
      {
        value: {
          // Cifra pura: identidad.
          es: "5",
          en: "5",
        },
        label: {
          es: "variantes del tema",
          en: "theme variants",
        },
      },
      {
        value: {
          // "Verified" es el badge literal de Open VSX: identidad.
          es: "Verified",
          en: "Verified",
        },
        label: {
          es: "Open VSX Publisher (namespace MaxGB23)",
          // "Publisher" y "namespace" ya son los terminos de Open VSX.
          en: "Open VSX Publisher (namespace MaxGB23)",
        },
      },
      {
        value: {
          // "Beta" ya es la palabra inglesa del estado: identidad.
          es: "Beta",
          en: "Beta",
        },
        label: {
          es: "integración con 3 agentes IA (Claude Code, OpenCode, Pi)",
          en: "integration with 3 AI agents (Claude Code, OpenCode, Pi)",
        },
      },
    ],
    visual: {
      src: "/images/projects/funky-theme/perifericos.webp",
      alt: {
        es: "Editor de VS Code mostrando funky-theme",
        en: "VS Code editor showing funky-theme",
      },
    },
    problem: {
      es: "La mayoría de los temas de editor duplican valores de color en cientos de archivos: cualquier cambio exige editar todo a mano y los colores terminan desincronizados. Una paleta única como SSOT elimina el drift — el diseño del tema queda gobernado por un solo archivo.",
      en: "Most editor themes duplicate color values across hundreds of files: any change means editing everything by hand and the colors end up out of sync. A single palette as SSOT removes the drift — the theme design is governed by one file.",
    },
    role: [
      {
        es: "Diseñé un tema original para VS Code publicado bajo licencia MIT.",
        en: "I designed an original theme for VS Code, published under the MIT license.",
      },
      {
        es: "Definí la paleta jerárquica como única fuente de verdad para editores (un solo archivo de configuración).",
        en: "I defined the hierarchical palette as the single source of truth for editors (one configuration file).",
      },
      {
        es: "Derivé las 5 variantes del tema desde esa paleta.",
        en: "I derived the 5 theme variants from that palette.",
      },
      {
        es: "Gestioné el ciclo completo de release: 6 release candidates (rc.1 → rc.6, solo instalación manual desde el repo) hasta el estable v3.0.0, primera publicación en markets, con pipeline propio de build + empaquetado + GitHub Release (SemVer estricto, convención RC → estable).",
        en: "I managed the full release cycle: 6 release candidates (rc.1 → rc.6, manual install from the repo only) through to stable v3.0.0, first publication on the markets, with my own build + packaging + GitHub Release pipeline (strict SemVer, RC → stable convention).",
      },
      {
        es: "Publiqué y operé la extensión en VS Code Marketplace y Open VSX (empaquetado de vsix, keywords optimizados al límite documentado de 30, changelog append-only).",
        en: "I published and operated the extension on VS Code Marketplace and Open VSX (vsix packaging, keywords optimized to the documented limit of 30, append-only changelog).",
      },
      {
        es: "Blindé el pipeline de release tras un hotfix de packaging: guardias automáticas (changelog empaquetado verificado + vsix coincidente con su allowlist) y el error real documentado como regla dura en la skill de release.",
        en: "I hardened the release pipeline after a packaging hotfix: automatic guards (packaged changelog verified + vsix matching its allowlist) and the real bug documented as a hard rule in the release skill.",
      },
    ],
    solution: [
      {
        // Cada `**Label:**` abre y cierra aqui, igual que en el ES.
        es: "**Paleta semántica SSOT:** colores definidos por rol semántico (UI, sintaxis, estados), no arbitrarios, en un solo config.",
        en: "**SSOT semantic palette:** colors defined by semantic role (UI, syntax, states), not arbitrary, in a single config.",
      },
      {
        es: "**Variantes separadas por familias visuales:** el feedback de devs en foros y comunidades (Discord, etc.) guía qué se aplica en cada variante — italics, bold, etc. solo donde es deseado; para quien no los quiere, hay una variante a su medida. Las 5 se mantienen en sincronía porque comparten la misma fuente.",
        en: "**Variants split by visual family:** dev feedback on forums and communities (Discord, etc.) guides what each variant applies — italics, bold, etc. only where they are wanted; for those who don't want them, there is a variant tailored to them. The 5 stay in sync because they share the same source.",
      },
      {
        es: "**Publicación en markets:** release estable en VS Code Marketplace y Open VSX, con keywords optimizados al límite documentado (30) para descubribilidad multiplataforma (VS Code, VSCodium, Google Antigravity, Cursor, Windsurf, Theia).",
        en: "**Publishing on the markets:** stable release on VS Code Marketplace and Open VSX, with keywords optimized to the documented limit (30) for cross-platform discoverability (VS Code, VSCodium, Google Antigravity, Cursor, Windsurf, Theia).",
      },
      {
        es: "**CI / control de calidad:** workflow de build-check con pnpm que valida las 5 variantes (existencia y parseo de los JSON) en cada push y PR; el mismo CI empaqueta el artefacto de Zed y prepara su PR al marketplace; releases SemVer estrictas y trazables.",
        en: "**CI / quality control:** pnpm build-check workflow that validates the 5 variants (existence and JSON parsing) on every push and PR; the same CI packages the Zed artifact and prepares its PR to the marketplace; strict, traceable SemVer releases.",
      },
      {
        es: "**Release blindado tras aprendizaje de errores:** el changelog se finaliza antes de empaquetar (el vsix lleva la sección de la versión) y una guardia verifica que el vsix coincida exactamente con su `.vscodeignore` (sin fugas ni assets faltantes) — un hotfix de packaging real dejó el proceso más robusto y documentado en la skill de release.",
        en: "**Release hardened after learning from mistakes:** the changelog is finalized before packaging (the vsix carries the version section) and a guard verifies that the vsix matches its `.vscodeignore` exactly (no leaks or missing assets) — a real packaging hotfix left the process more robust and documented in the release skill.",
      },
      {
        // Esta hoja concentra los 5 pares `**` del ES: mismo numero, misma posicion.
        es: "**Tracción validada:** **Verified Open VSX Publisher**; **3.3k descargas acumuladas** en Open VSX (3,296 medidas el 8 oct 2026); **191 adquisiciones/30d** en VS Code Marketplace con **funnel 97.45%** (page views → installs) — posicionamiento SEO orgánico demostrado.",
        en: "**Traction validated:** **Verified Open VSX Publisher**; **3.3k cumulative downloads** on Open VSX (3,296 measured on Oct 8, 2026); **191 acquisitions/30d** on VS Code Marketplace with **97.45% funnel** (page views → installs) — organic SEO positioning demonstrated.",
      },
      {
        es: "**Cross-editor:** soporte **Zed** lanzado hoy con instalación manual mientras se acepta el PR al marketplace (misma paleta de editores).",
        en: "**Cross-editor:** **Zed** support launched today with manual install while the PR to the marketplace is under review (same editor palette).",
      },
      {
        es: "**Expansión terminal:** **funky-theme-tui** — variaciones mínimas para terminales con agentes de código (Claude Code, OpenCode, Pi), en repo aparte y en beta.",
        en: "**Terminal expansion:** **funky-theme-tui** — minimal variations for terminals running coding agents (Claude Code, OpenCode, Pi), in a separate repo and in beta.",
      },
    ],
    // Etiqueta traducida, nombre de stack intacto.
    stack: [
      {
        // "VS Code theme" y "token colors" ya son los terminos del formato.
        es: "Formato: VS Code theme (token colors)",
        en: "Format: VS Code theme (token colors)",
      },
      {
        // "Package manager" ya es la etiqueta inglesa del sector: identidad.
        es: "Package manager: pnpm",
        en: "Package manager: pnpm",
      },
      {
        es: "Licencia: MIT (original)",
        en: "License: MIT (original)",
      },
      {
        es: "Editores: VS Code, VSCodium, Cursor, Windsurf, Zed (instalación manual, PR pendiente), Theia",
        en: "Editors: VS Code, VSCodium, Cursor, Windsurf, Zed (manual install, PR pending), Theia",
      },
      {
        es: "Distribución: VS Code Marketplace, Open VSX, .vsix store-agnostic",
        en: "Distribution: VS Code Marketplace, Open VSX, store-agnostic .vsix",
      },
      {
        es: "Terminal IA: funky-theme-tui (Claude Code, OpenCode, Pi) — variaciones de terminal en repo aparte, beta",
        en: "AI terminal: funky-theme-tui (Claude Code, OpenCode, Pi) — terminal variations in a separate repo, beta",
      },
    ],
    gallery: [
      {
        src: "/images/projects/funky-theme/funky-tui-opencode.webp",
        alt: {
          es: "Funky Theme en TUI OpenCode",
          en: "Funky Theme in the OpenCode TUI",
        },
      },
      {
        src: "/images/projects/funky-theme/funky-dark-tsx.webp",
        alt: {
          // "Dark", "TSX" y "code" ya son ingles: identidad a proposito.
          es: "Funky Theme Dark - TSX code",
          en: "Funky Theme Dark - TSX code",
        },
      },
      {
        src: "/images/projects/funky-theme/funky-darker-typescript.webp",
        alt: {
          es: "Funky Theme Darker - TS code",
          en: "Funky Theme Darker - TS code",
        },
      },
      {
        src: "/images/projects/funky-theme/IDE-completo.webp",
        alt: {
          es: "Funky Theme en VSCode",
          en: "Funky Theme in VSCode",
        },
      },
    ],
    cta: {
      es: "¿Te interesa el diseño de temas con paleta semántica gobernada por SSOT? Hablemos.",
      en: "Are you interested in theme design with a semantic palette governed by an SSOT? Let's talk.",
    },
  },
  architecture: {
    name: {
      // Nombre del tema: identidad a proposito.
      es: "funky-theme",
      en: "funky-theme",
    },
    description: {
      es: "Tema oscuro semántico original para VS Code (MIT): 5 variantes derivadas de una paleta jerárquica en un único config (SSOT) para editores — se toca un valor y todo el tema se mantiene coherente. Expansión cross-editor (Zed, instalación manual) y terminal IA (funky-theme-tui, con variaciones propias) desde la misma base.",
      en: "Original semantic dark theme for VS Code (MIT): 5 variants derived from a hierarchical palette in a single config (SSOT) for editors — you change one value and the whole theme stays coherent. Cross-editor expansion (Zed, manual install) and AI terminal (funky-theme-tui, with its own variations) from the same base.",
    },
    children: [
      {
        name: {
          es: "Paleta semántica SSOT",
          en: "SSOT semantic palette",
        },
        description: {
          es: "Colores definidos por rol semántico (UI, sintaxis, estados), no arbitrarios, en un solo config. Única fuente de verdad para los editores.",
          en: "Colors defined by semantic role (UI, syntax, states), not arbitrary, in a single config. Single source of truth for the editors.",
        },
      },
      {
        name: {
          es: "5 variantes por familias visuales",
          en: "5 variants by visual family",
        },
        description: {
          es: "Derivadas de la misma fuente; italics y bold solo donde es deseado, con una variante a medida para quien no los quiere.",
          en: "Derived from the same source; italics and bold only where they are wanted, with a variant tailored to those who don't want them.",
        },
      },
      {
        name: {
          es: "Tema original",
          en: "Original theme",
        },
        description: {
          es: "Propio, sin copia de otros temas, publicado bajo MIT.",
          en: "Own work, with no copying of other themes, published under MIT.",
        },
      },
      {
        name: {
          es: "Publicación y release blindado",
          en: "Publishing and hardened release",
        },
        description: {
          es: "VS Code Marketplace + Open VSX (Verified Publisher). Keywords optimizados (límite 30). CI pnpm valida 5 variantes. Release guardado: changelog empaquetado verificado + vsix vs allowlist exacto (hotfix real → skill de release).",
          en: "VS Code Marketplace + Open VSX (Verified Publisher). Optimized keywords (limit 30). CI with pnpm validates the 5 variants. Guarded release: verified packaged changelog + vsix against the exact allowlist (real hotfix → release skill).",
        },
      },
      {
        name: {
          // "Cross-editor" ya es el termino ingles del concepto.
          es: "Cross-editor: Zed",
          en: "Cross-editor: Zed",
        },
        description: {
          es: "Soporte en mantenimiento activo. Misma paleta SSOT → tema Zed sin duplicar lógica de color.",
          en: "Support actively maintained. Same SSOT palette → Zed theme with no duplicated color logic.",
        },
      },
      {
        name: {
          es: "Terminal IA: funky-theme-tui",
          en: "AI terminal: funky-theme-tui",
        },
        description: {
          es: "Repo público (MaxGB23/funky-theme-tui). Misma filosofía SSOT para Claude Code, OpenCode, Pi. Pre-estable. Demuestra que la arquitectura de paleta única escala a nuevos targets sin duplicar lógica.",
          en: "Public repo (MaxGB23/funky-theme-tui). Same SSOT philosophy for Claude Code, OpenCode, Pi. Pre-stable. Demonstrates that the single-palette architecture scales to new targets with no duplicated logic.",
        },
      },
    ],
  },
};