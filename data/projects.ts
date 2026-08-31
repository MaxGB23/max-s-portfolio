// Single source of truth for portfolio projects.
// Extracted from docs/projects/candidatos/*.md. Fields without real content
// stay as empty string or undefined — never invent data.

export interface ProjectLink {
  label: string;
  url: string;
  external?: boolean;
}

export interface ProjectMetric {
  value: string;
  label: string;
}

export interface ProjectImage {
  src: string;
  alt: string;
}

export interface ProjectDetail {
  headline: string;
  summary: string;
  metrics: ProjectMetric[];
  problem?: string;
  role?: string[];
  solution: string[];
  stack: string[];
  gallery: ProjectImage[];
  cta: string;
}

export interface Project {
  id: string;
  title: string;
  category: string;
  hook: string;
  metric: string;
  tags: string[];
  image: string;
  imageAlt: string;
  links: ProjectLink[];
  featured?: boolean;
  detail: ProjectDetail;
}

export const projects: Project[] = [
  {
    id: "caf",
    title: "Sistema de Gestión Clínica",
    category: "Full Stack / SaaS",
    hook: "Plataforma web full-stack en producción para la gestión integral de citas, pacientes y control de pagos en centros de salud.",
    metric: "+8 meses en producción sin caídas",
    tags: ["Next.js", "React", "TypeScript", "PostgreSQL", "Prisma", "Tailwind CSS"],
    image: "/images/projects/caf/dashboard.png",
    imageAlt: "Dashboard principal y agenda del Sistema de Gestión Clínica",
    links: [
      { label: "Repo", url: "https://github.com/MaxGB23/centro-caf", external: true },
    ],
    detail: {
      headline: "Gestión Clínica Inteligente y Escalable",
      summary:
        "Plataforma web full-stack construida desde cero que reemplaza el uso de Excel y agendas manuales en un centro real de fisioterapia y rehabilitación. En uso diario por el staff médico con más de **8 meses en producción sin una sola caída**, incluso durante major releases con cambios críticos en la base de datos.",
      metrics: [
        { value: "+8 meses", label: "en producción sin caídas, incluyendo major releases" },
        { value: "100%", label: "uptime (Vercel + NeonDB)" },
        { value: "-40%", label: "latencia de recuperación de registros de pacientes (índices + caching server-side)" },
        { value: "0", label: "incidentes en migraciones con breaking changes de BD" },
        { value: "Diario", label: "uso del staff médico (administrativo y fisioterapeutas)" },
      ],
      problem:
        "Las clínicas pequeñas y medianas dependen de herramientas genéricas, procesos manuales en papel o múltiples aplicaciones desconectadas para agendar, llevar historiales médicos y cobrar. Esto genera pérdidas de tiempo, dobles reservas y descontrol financiero. No existía una solución a medida accesible para centros que trabajan por sesiones o paquetes.",
      role: [
        "Arquitecté un sistema modular por features usando Next.js, TypeScript y Prisma para mejorar mantenibilidad y acelerar la entrega de funcionalidades.",
        "Implementé control de acceso por roles (RBAC) para flujos multi-usuario entre personal administrativo y fisioterapeutas.",
        "Reduje un 40% la latencia de recuperación de registros introduciendo índices en PostgreSQL y estrategias de caching server-side.",
        "Desplegué y mantuve la plataforma en Vercel con NeonDB (PostgreSQL), logrando 100% de uptime en producción, incluyendo major releases con migraciones críticas de base de datos sin incidentes.",
        "Desarrollé la landing page pública integrada con el sistema interno; estable en uptime y generando contactos de nuevos pacientes.",
      ],
      solution: [
        "**Agenda inteligente:** calendario interactivo con prevención automática de conflictos y control de sesiones (pendiente, asistida, cancelada).",
        "**Expediente electrónico:** alta y búsqueda rápida de pacientes, historial de sesiones y pagos, seguimiento individual.",
        "**Módulo financiero:** venta de paquetes de sesiones, balance por paciente y registro de ingresos.",
        "**Panel de control (dashboard):** analíticas de ingresos mensuales, pacientes activos, ganancias y métricas operativas, con filtros por periodo (30 días, 3 meses, 1 año) y tarjetas + gráficos.",
        "**Landing page pública:** optimizada para SEO, enfocada a captación de nuevos pacientes e integrada con el sistema interno.",
        "**Seguridad y roles:** accesos por tipo de usuario y manejo seguro de sesiones.",
      ],
      stack: [
        "Framework: Next.js, React",
        "Lenguaje: TypeScript",
        "Base de datos: PostgreSQL (NeonDB)",
        "ORM: Prisma",
        "Estilos: Tailwind CSS",
        "Despliegue: Vercel",
      ],
      gallery: [
        { src: "/images/projects/caf/analytics.png", alt: "Analíticas de ingresos del Sistema de Gestión Clínica" },
        { src: "/images/projects/caf/agenda.png", alt: "Agenda de citas del Sistema de Gestión Clínica" },
        { src: "/images/projects/caf/analiticas-caf.png", alt: "Panel de analíticas adicional del Sistema de Gestión Clínica" },
      ],
      cta: "¿Buscas modernizar tu clínica o necesitas un sistema a medida? Hablemos.",
    },
  },
  {
    id: "presidencia",
    title: "Gestión de Apoyos Sociales",
    category: "Full Stack / GovTech",
    hook: "Plataforma web full-stack para digitalizar la gestión de solicitudes sociales en gobierno. Elimina procesos manuales, genera documentos legales y mejora la eficiencia operativa.",
    metric: "100% digitalización del flujo de solicitudes",
    tags: ["Next.js", "React", "TypeScript", "PostgreSQL", "Prisma", "Tailwind CSS"],
    image: "/images/projects/presidencia-acambaro/presidencia-light.png",
    imageAlt: "Dashboard de métricas y gestión de solicitudes del Sistema de Apoyos Sociales",
    links: [
      { label: "Repo", url: "https://github.com/MaxGB23/Presidencia-Municipal-Acambaro", external: true },
    ],
    detail: {
      headline: "Digitalización, Transparencia y Eficiencia Gubernamental",
      summary:
        "Plataforma full-stack escalable construida para la Presidencia Municipal de Acámbaro, desarrollada durante una estadía profesional (enero – abril 2025). Lideré su creación para automatizar el ciclo completo de los apoyos sociales: digitalización total de los flujos de aprobación, mejora de los tiempos de respuesta y paneles analíticos en tiempo real para la toma de decisiones institucionales.",
      metrics: [
        { value: "100%", label: "digitalización del flujo de solicitudes de apoyo social" },
        { value: "0", label: "uso de papel en el proceso administrativo" },
        { value: "Tiempo real", label: "paneles estadísticos para la toma de decisiones" },
        { value: "PDF + firma", label: "documentos legales generados automáticamente" },
      ],
      problem:
        "El gobierno municipal dependía de procesos manuales intensivos en papel para gestionar las solicitudes ciudadanas. Esto ocasionaba tiempos de respuesta lentos, pérdida de trazabilidad administrativa y una carencia total de reportes o métricas para evaluar la asignación de recursos y el rendimiento institucional.",
      role: [
        "Lideré el desarrollo de la plataforma completa: arquitectura, planificación, implementación y despliegue.",
        "Coordiné la entrega del proyecto y la ejecución del equipo bajo Scrum y Jira.",
        "Diseñé y desarrollé la aplicación full-stack con Next.js, TypeScript, PostgreSQL y Prisma.",
        "Implementé autenticación y control de acceso por roles (RBAC) por departamento.",
        "Construí dashboards interactivos con Recharts y la generación dinámica de PDFs legales con firma electrónica y datos autocompletados.",
      ],
      solution: [
        "**Dashboard estadístico:** visualización interactiva con Recharts para monitorear tendencias, volumen de solicitudes y KPIs institucionales.",
        "**Gestión avanzada de solicitudes:** seguimiento de extremo a extremo con filtros complejos (estado, prioridad, área) y asignación controlada a departamentos.",
        "**Módulo de documentos legales:** generación automatizada de PDFs con validez legal, firma electrónica y datos dinámicos pre-cargados del expediente del ciudadano.",
        "**Seguridad y control de acceso (RBAC):** segmentación de opciones y vistas según roles (administradores, coordinadores departamentales).",
        "**Gestión dinámica institucional:** ajuste flexible de autoridades, logotipos y plantillas sin intervenir el código base, pensado para los cambios de administración.",
      ],
      stack: [
        "Framework: Next.js, React",
        "Lenguaje: TypeScript",
        "Base de datos: PostgreSQL (NeonDB)",
        "ORM: Prisma",
        "Autenticación: NextAuth",
        "UI / Componentes: Tailwind CSS, Shadcn UI, Recharts",
        "Despliegue y gestión: Vercel, Scrum + Jira",
      ],
      gallery: [
        { src: "/images/projects/presidencia-acambaro/presidencia-light.png", alt: "Panel de métricas del Sistema de Apoyos Sociales (tema claro)" },
        { src: "/images/projects/presidencia-acambaro/presidencia-dark.png", alt: "Panel de métricas del Sistema de Apoyos Sociales (tema oscuro)" },
      ],
      cta: "¿Buscas digitalizar procesos administrativos complejos o requieres software seguro a medida? Hablemos.",
    },
  },
  {
    id: "funky-ai",
    title: "funky-ai",
    category: "Dev Tools / AI Engineering",
    hook: "Framework CLI para desarrollo de software asistido por IA: pipeline SDD con contexto just-in-time, memoria persistente y planificación de proyectos en un solo comando.",
    metric: "-40% consumo de tokens (contexto just-in-time, estimación interna)",
    tags: ["Node.js", "TypeScript", "CLI", "pnpm", "Vitest", "GitHub Actions"],
    image: "",
    imageAlt: "Terminal del CLI de funky-ai mostrando el pipeline SDD",
    links: [
      { label: "Repo", url: "https://github.com/MaxGB23/funky-ai", external: true },
    ],
    featured: true,
    detail: {
      headline: "Un framework CLI para desarrollo de software asistido por IA",
      summary:
        "funky-ai unifica reglas agénticas, plantillas spec-driven y herramientas de planificación en un único CLI de Node.js (pnpm), sin superficie GUI. Orquesta el desarrollo como un pipeline determinista — proposal → specs → design → tasks → apply → verify → archive — cargando contexto just-in-time para proteger la ventana de tokens, con memoria persistente basada en archivos Markdown y endurecimiento de dependencias para proyectos pnpm. Todas las cifras de impacto son estimaciones internas del autor, no métricas externas.",
      metrics: [
        { value: "-40%", label: "consumo de tokens vs. contexto always-loaded (SDD just-in-time)" },
        { value: "30–50%", label: "menor costo de recall de memoria (funkygram vs. recargar contexto monolítico)" },
        { value: "~50%", label: "más rápido de idea difusa a arquitectura costeada (funky-forge)" },
        { value: "~30%", label: "menos riesgo de supply chain (funky secure)" },
        { value: "-40%", label: "rework fuera de alcance (TDD + issue-first workflow)" },
      ],
      problem:
        "Las tareas grandes de IA asistida que arrancan de un único prompt masivo fallan de forma predecible: la ventana de contexto se desborda, el modelo alucina sobre partes que ya no recuerda y no hay punto natural de intervención humana. Los agentes no tienen memoria confiable entre sesiones, cada sesión re-aprende desde cero recargando contexto caro, y la planificación de proyectos ocurre ad-hoc, después de elegir el stack.",
      role: [
        "Diseñé el ecosistema CLI completo: pipeline SDD con contexto just-in-time y separación orquestador/sub-agentes.",
        "Construí funkygram (memoria persistente), funky-forge (planificación) y funky secure (hardening de dependencias).",
        "Apliqué TDD con Vitest y workflow issue-first desde el inicio: cada cambio rastreado a un issue triado.",
        "Mantuve CI/CD con GitHub Actions (toolchain pineado a SHAs) y documentación viva verificada contra el CLI real.",
      ],
      solution: [
        "**SDD framework** — pipeline determinista de fases con artefactos Markdown, 3 tiers que escalan el esfuerzo al impacto (T1 Flash: fixes de 1–2 archivos sin docs; T2 Standard: sub-agentes por fase; T3 Insano: rediseños arquitectónicos con sub-agentes aislados), 3 modos de ejecución (Interactive, Auto, Handoff) y puertas humanas antes de operaciones destructivas y Git.",
        "**funkygram** — memoria persistente en archivos Markdown dentro del repo: 7 categorías con shards O(1), esquema fijo (What/Why/Where/Learned), índice central auto-actualizado y recall deliberadamente low-tech y barato.",
        "**funky-forge** — de idea difusa a arquitectura costeada: `init` (canvases de proyecto e infra), `assess` (revisión de arquitectura con registro de decisiones), `estimate` (guía de costos con buffers y TCO), `pipeline` (estado compartido entre fases). La CLI prepara material, no juzga.",
        "**funky secure** — endurecimiento de dependencias pnpm: `doctor` (diagnóstico read-only), `init` (política idempotente), `check` (gate CI fail-closed). Incluye cuarentena de versiones frescas (72h) contra campañas tipo ChainDrop/Shai-Hulud y detección de secretos commitheados.",
        "**Prácticas** — issue-first (no hay código sin issue), CI en GitHub Actions con SHAs pineados, releases estructurados (bump, notas, tag) y docs vivas sincronizadas con el binario real.",
      ],
      stack: [
        "Lenguaje / Runtime: Node.js, TypeScript",
        "Package manager: pnpm",
        "CLI: Node.js CLI (sin GUI)",
        "Testing: Vitest (TDD, Red → Green → Refactor)",
        "CI/CD: GitHub Actions (toolchain pineado a SHAs)",
        "Memoria: archivos Markdown (shards + índice central)",
        "Pipeline: plantillas SDD en Markdown, contexto just-in-time",
      ],
      gallery: [],
      cta: "¿Buscas incorporar IA en tu flujo de desarrollo con proceso y sin caos? Este framework es mi laboratorio público.",
    },
  },
  {
    id: "one-click-ti",
    title: "One Click Ti — PWA",
    category: "Full Stack / PWA",
    hook: "PWA full-stack para una empresa de TI: landing pública + sistema de gestión interno, instalable en dispositivos.",
    metric: "PWA instalable (manifest + service worker)",
    tags: ["Laravel", "Vue 3", "Inertia.js", "MySQL", "Laravel Breeze"],
    image: "",
    imageAlt: "Landing pública y panel de gestión de One Click Ti",
    links: [
      { label: "Repo", url: "https://github.com/MaxGB23/ABMODEL", external: true },
    ],
    detail: {
      headline: "Presencia digital y gestión interna en una sola PWA instalable",
      summary:
        "PWA full-stack desarrollada por contrato para One Click Ti (Querétaro, sep – dic 2024). Integra una landing page pública con un sistema de gestión interno en una sola aplicación instalable, con autenticación y control de acceso por roles. Mi primera aproximación profesional a Laravel + Vue con arquitectura PWA.",
      metrics: [
        { value: "PWA", label: "completa: manifest + service worker, instalable en dispositivos" },
        { value: "2", label: "superficies integradas: landing pública + sistema de gestión interno" },
        { value: "Contrato", label: "entregado a cliente real (sep – dic 2024)" },
      ],
      problem:
        "La empresa necesitaba dos cosas en una: una presencia pública profesional (landing) y herramientas internas de gestión, sin mantener sistemas separados. Una PWA instalable evita pasar por una app store y funciona offline-first como aplicación de escritorio/móvil.",
      role: [
        "Desarrollé la PWA full-stack completa con Vue 3, MySQL, Laravel e Inertia.js.",
        "Construí la landing page pública y el sistema de gestión interno.",
        "Implementé autenticación, control de acceso por roles (RBAC) y las capacidades PWA (manifest + service worker) usando Laravel Breeze.",
      ],
      solution: [
        "**Landing pública:** cara profesional de la empresa, conectada con el sistema interno.",
        "**Sistema de gestión interno:** administración de contenido y operación del negocio.",
        "**Autenticación y roles:** Laravel Breeze con RBAC para separar accesos.",
        "**PWA instalable:** manifest + service worker, instalable y utilizable como app nativa.",
        "**Arquitectura unificada:** Laravel (backend) + Vue 3 e Inertia.js (frontend) en un solo proyecto.",
      ],
      stack: [
        "Backend: Laravel (PHP)",
        "Frontend: Vue 3, Inertia.js",
        "Base de datos: MySQL",
        "Autenticación: Laravel Breeze",
        "PWA: manifest + service worker",
      ],
      gallery: [],
      cta: "¿Necesitas una PWA instalable que combine presencia digital y gestión interna? Hablemos.",
    },
  },
  {
    id: "autoshop",
    title: "AutoShop",
    category: "Full Stack / PHP",
    hook: "Sitio full-stack para una empresa de servicios automotrices: landing pública + panel admin con CMS propio hecho desde cero en PHP puro.",
    metric: "De días a minutos en actualización de contenido",
    tags: ["PHP", "MySQL", "JavaScript", "Bootstrap", "HTML5", "CSS3"],
    image: "",
    imageAlt: "Landing pública y panel de administración de AutoShop",
    links: [],
    detail: {
      headline: "Presencia digital y gestión de contenido sin depender de un desarrollador",
      summary:
        "Sitio web full-stack para una empresa de servicios automotrices en Maravatío, Michoacán (prácticas profesionales, may – ago 2023). Incluye landing pública y un panel de administración con CMS desarrollado desde cero en PHP puro — sin framework — con el que el personal no técnico pasó a gestionar servicios, promociones y consultas por sí mismo.",
      metrics: [
        { value: "Días → minutos", label: "actualización de contenido por staff no técnico (CMS propio)" },
        { value: "0", label: "frameworks: CMS completo en PHP puro + MySQL" },
        { value: "2", label: "superficies: landing pública + panel de administración" },
        { value: "2", label: "niveles de rol (admin/staff), sin cuentas para clientes" },
      ],
      problem:
        "La empresa automotriz no tenía presencia digital profesional ni forma de actualizar su propio contenido: cualquier cambio en servicios, promociones o consultas requería intervención técnica y tardaba días en el mejor caso.",
      role: [
        "Desarrollé el sitio full-stack completo en PHP puro, sin framework (MySQL, JavaScript, Bootstrap, HTML5, CSS3).",
        "Construí un CMS a medida que permite al personal no técnico auto-gestionar listados de servicios, promociones por calendario y consultas de contacto.",
        "Implementé gestión de usuarios por roles (admin/staff), sin cuentas de acceso para clientes.",
        "Colaboré con el equipo administrativo para optimizar la estructura de contenido y la presentación de servicios.",
      ],
      solution: [
        "**Landing pública:** cara profesional del taller, orientada a captar clientes.",
        "**Panel de administración + CMS a medida:** el staff gestiona servicios, promociones calendario y consultas sin tocar código.",
        "**Control de acceso por roles:** niveles admin/staff para el equipo del taller.",
        "**Tecnología honesta:** PHP puro, MySQL, JavaScript y Bootstrap — sin framework, fundamentos al desnudo.",
      ],
      stack: [
        "Backend: PHP puro (sin framework)",
        "Frontend: HTML5, CSS3, JavaScript, Bootstrap",
        "Base de datos: MySQL",
      ],
      gallery: [],
      cta: "¿Te interesa ver cómo se construye un CMS a medida partiendo de cero, sin framework? Hablemos.",
    },
  },
  {
    id: "color-highlight-v2",
    title: "color-highlight v2",
    category: "Dev Tools / VS Code",
    hook: "Fork modernizado de la extensión de VS Code que resalta colores en el editor; reconstruido con TypeScript, esbuild y pnpm.",
    metric: "Render sin lag — debounce de 150ms",
    tags: ["TypeScript", "esbuild", "pnpm", "VS Code"],
    image: "",
    imageAlt: "Editor de VS Code con colores resaltados por la extensión",
    links: [
      { label: "Repo", url: "https://github.com/MaxGB23/color-highlight-v2", external: true },
    ],
    detail: {
      headline: "Un fork modernizado, con crédito a los autores originales",
      summary:
        "Fork modernizado de `vscode-ext-color-highlight` (GPL-3.0): la extensión de VS Code que resalta colores en el editor, reconstruida con un stack moderno — TypeScript, esbuild y pnpm — e incorporando mejoras de rendimiento y accesibilidad. Se presenta siempre como fork de un proyecto existente, nunca como creación propia.",
      metrics: [
        { value: "150ms", label: "debounce → render sin lag en el editor" },
        { value: "WCAG", label: "auto-contraste sobre el color resaltado" },
        { value: ".vsix", label: "distribución agnóstica de la tienda (store-agnostic)" },
        { value: "GPL-3.0", label: "fork con crédito explícito a los autores originales" },
      ],
      problem:
        "La extensión original resolvía un problema real — ver los colores del código directamente en el editor — pero su base había envejecido: sin tipado, build lento y dependencias pesadas. Modernizarla la hace mantenible y rápida sin abandonar la licencia ni el crédito a sus autores.",
      role: [
        "Modernicé un proyecto open source existente (GPL-3.0) reconstruyéndolo con TypeScript, esbuild y pnpm.",
        "Apliqué mejoras de rendimiento y accesibilidad: render con debounce de 150ms y auto-contraste WCAG.",
        "Preparé la distribución `.vsix` agnóstica de la tienda de extensiones.",
        "Mantuve la licencia GPL-3.0 y el crédito a los autores originales — el proyecto se presenta como fork modernizado, nunca como invención propia.",
      ],
      solution: [
        "**Stack moderno:** TypeScript (tipado), esbuild (build rápido), pnpm (dependencias modernas y reproducibles).",
        "**Render sin lag:** debounce de 150ms para no bloquear el editor al teclear.",
        "**Auto-contraste WCAG:** el color del texto se ajusta para mantener legibilidad sobre cualquier color resaltado.",
        "**Distribución store-agnostic:** `.vsix` instalable sin depender de una tienda concreta.",
      ],
      stack: [
        "Lenguaje: TypeScript",
        "Build: esbuild",
        "Package manager: pnpm",
        "Plataforma: API de extensiones de VS Code",
        "Licencia: GPL-3.0 (fork de `vscode-ext-color-highlight`)",
      ],
      gallery: [],
      cta: "¿Quieres ver cómo modernizo un proyecto open source existente sin romper su licencia? Hablemos.",
    },
  },
  {
    id: "funky-theme",
    title: "funky-theme",
    category: "Dev Tools / VS Code",
    hook: "Tema oscuro semántico original para VS Code: 4 variantes derivadas de una paleta jerárquica definida en un único config (SSOT).",
    metric: "4 variantes desde 1 paleta SSOT",
    tags: ["VS Code", "pnpm", "Token Colors"],
    image: "",
    imageAlt: "Editor de VS Code mostrando las variantes de funky-theme",
    links: [
      { label: "Repo", url: "https://github.com/MaxGB23/funky-theme", external: true },
    ],
    detail: {
      headline: "Un tema original, con la paleta gobernada por una única fuente de verdad",
      summary:
        "Tema oscuro semántico original para VS Code, publicado bajo MIT. Cuatro variantes derivadas de una paleta jerárquica definida en un solo archivo de configuración (SSOT): se toca un valor y todo el tema se mantiene coherente, sin colores duplicados entre cientos de archivos.",
      metrics: [
        { value: "4", label: "variantes del tema" },
        { value: "1", label: "fuente de verdad: paleta jerárquica en un único config" },
        { value: "MIT", label: "tema original, sin créditos a terceros" },
      ],
      problem:
        "La mayoría de los temas de editor duplican valores de color en cientos de archivos: cualquier cambio exige editar todo a mano y los colores terminan desincronizados. Una paleta única como SSOT elimina el drift — el diseño del tema queda gobernado por un solo archivo.",
      role: [
        "Diseñé un tema original para VS Code publicado bajo licencia MIT.",
        "Definí la paleta jerárquica como única fuente de verdad (un solo archivo de configuración).",
        "Derivé las 4 variantes del tema desde esa paleta.",
      ],
      solution: [
        "**Paleta semántica SSOT:** colores definidos por rol semántico (UI, sintaxis, estados), no arbitrarios, en un solo config.",
        "**4 variantes coherentes:** todas se mantienen en sincronía porque comparten la misma fuente.",
        "**Tema original:** propio, sin copia de otros temas, publicado bajo MIT.",
      ],
      stack: [
        "Formato: VS Code theme (token colors)",
        "Package manager: pnpm",
        "Licencia: MIT (original)",
      ],
      gallery: [],
      cta: "¿Te interesa el diseño de temas con paleta semántica gobernada por SSOT? Hablemos.",
    },
  },
  {
    id: "unity-games",
    title: "Grinchmas Kart & Cumyxel",
    category: "Game Dev / Unity",
    hook: "Dos juegos Unity end-to-end de un equipo universitario (ABMODEL Games): kart 3D con IA rival entrenada con Reinforcement Learning y plataformero 2D pixel-art.",
    metric: "IA rival con Reinforcement Learning (ML-Agents)",
    tags: ["Unity", "C#", "Blender", "ML-Agents"],
    image: "",
    imageAlt: "Gameplay de Grinchmas Kart (3D) y Cumyxel (2D)",
    links: [
      { label: "Grinchmas Kart", url: "https://github.com/MaxGB23/Grinchmas-Kart", external: true },
      { label: "Cumyxel", url: "https://github.com/MaxGB23/Cumyxel", external: true },
      { label: "Cumyxel (MIT)", url: "https://github.com/MaxGB23/Cumyxel-code", external: true },
      { label: "Demo", url: "https://drive.google.com/drive/folders/1bSRON0fCKFBL4qX8gPyTn4LXYGR9Vv6O?usp=sharing", external: true },
    ],
    detail: {
      headline: "Dos juegos end-to-end, liderazgo real y una IA entrenada con Reinforcement Learning",
      summary:
        "Grinchmas Kart (3D, sep – dic 2023) y Cumyxel (2D, ene – abr 2024), desarrollados por ABMODEL Games — equipo universitario de 4 integrantes — con el autor al **~80% del kart** (código, gameplay, IA, dirección y modelos 3D) y **toda la programación de gameplay del 2D**. Todo revisado contra el código fuente real y publicado en GitHub.",
      metrics: [
        { value: "RL", label: "IA rival entrenada con Reinforcement Learning (ML-Agents)" },
        { value: "5", label: "niveles encadenados en el kart, hasta créditos" },
        { value: "~80%", label: "del kart: código, gameplay, IA, flujo, dirección + modelos 3D" },
        { value: "1,055", label: "LOC de gameplay en el 2D (11 scripts) + pixel-art a mano" },
        { value: "MIT", label: "repo Cumyxel-code: solo código de gameplay, reusable" },
      ],
      problem:
        "Proyectos universitarios donde el objetivo fue superar el \"juego de muestra\": en el 3D, físicas arcade creíbles y **un rival que aprendiera a conducir con RL** — el template oficial (Karting Microgame 5.0.1) no traía IA y hubo que diseñarla desde cero. En el 2D, un plataformero con *game-feel* (salto variable) y enemigos con comportamiento real (FSM), no sprites decorativos.",
      role: [
        "**Grinchmas Kart — lideré el proyecto (~80%):** código, gameplay, integración de ML-Agents, flujo de niveles, dirección e integración, más modelos 3D propios.",
        "**Programé la IA rival con Reinforcement Learning:** misma interfaz `IInput` que el jugador, observaciones por raycasts + velocidad local + dirección al checkpoint, recompensas por progreso y penalizaciones por choque, modos Training/Inferencing.",
        "**Cumyxel — 100% de la programación de gameplay:** salto variable en dos fases, plataformas one-way, enemigos con FSM, cámara con efecto ripple de agua (shader + `Graphics.Blit`).",
        "**Modelé en Blender:** `grinchcar`, `Trineo2`, `motonieve`, `Patineta`, `Mono`, `Pista`, `SantaFinal`, `Montaña Grinch`; HUD navideño, trailer y créditos en video y audio propios.",
        "**Publiqué y documenté:** repos en GitHub, demo jugable en Google Drive y arquitectura documentada con contexto técnico.",
      ],
      solution: [
        "**Arquitectura en capas** con `asmdefs` bien definidos (KartGame, KartGame.Editor, KartGame.AI, KartGame.AI.Editor).",
        "**IA con RL (lo más destacado):** el rival comparte la misma interfaz de input que el jugador — el `ArcadeKart` recibe un `InputData` sin distinguir quién lo conduce. Observaciones por raycasts (detección de colisiones), velocidad local y dirección al siguiente checkpoint en capa exclusiva; recompensa por acercarse/pasar el checkpoint y por velocidad, penalización por choque. Checkpoints + raycasts en vez de NavMesh: es una carrera (seguir la línea evitando choques), no una búsqueda de camino — la elección estándar para racing con RL.",
        "**Física arcade:** Rigidbody + 4 WheelColliders, suspensión parametrizada (tunable sin código), derrape con VFX, power-ups extensibles (`struct Stats`), `KartBounce` y reorientación aérea al caer.",
        "**Flujo de partida:** 5 niveles encadenados dentro de una misma partida, victoria/derrota y pantalla de créditos con video (modifiqué `GameFlowManager` para encadenar por nombre).",
        "**Salto variable** con corrección de gravedad en dos fases (subida sin tecla / caída) — física 2D cuidada, *game-feel*.",
        "**Enemigos con FSM** por anillos de distancia: idle → chase → ataque (esqueleto arquero y murciélago), proyectiles por corrutinas.",
        "**Plataformas one-way** con `Physics2D.IgnoreCollision` y par trigger/collider.",
        "**Cámara ortográfica** con efecto ripple de agua (post-proceso: shader + `Graphics.Blit`).",
        "**Ground-check** con `OverlapCircle` + gizmos de depuración; Tilemap, Mecanim; escenarios pixel-art dibujados a mano.",
        "**Cumyxel-code:** repo público MIT con solo el código de gameplay — separa código del contenido y muestra mentalidad open-source.",
      ],
      stack: [
        "Grinchmas Kart — Unity 2021.3.8f1 LTS (URP, Forward, lineal)",
        "Grinchmas Kart — C# · Cinemachine · ProBuilder · Timeline · TextMeshPro",
        "Grinchmas Kart — ML-Agents · Barracuda · Burst",
        "Grinchmas Kart — Blender (modelos y animaciones)",
        "Cumyxel — Unity 2022.3.19f1 LTS (Built-in RP, lineal)",
        "Cumyxel — C# · uGUI + TextMeshPro · Mecanim · Tilemap · Physics2D",
        "Cumyxel — ~1,055 LOC en 11 scripts de gameplay",
        "Cumyxel — Pixel-art a mano + assets libres",
      ],
      gallery: [],
      cta: "¿Quieres ver mis inicios en game dev con Unity, C# y Blender — y el primer entrenamiento de IA que escribí? Hablemos.",
    },
  },
];

export function getProjectById(id: string): Project | undefined {
  return projects.find((project) => project.id === id);
}

export function getFeaturedProjects(): Project[] {
  return projects.filter((project) => project.id === "caf" || project.id === "presidencia");
}