// Single source of truth for portfolio projects.
// Extracted from docs/projects/candidatos/*.md. Fields without real content
// stay as empty string or undefined — never invent data.

export interface ProjectLink {
  label: string;
  /** Categoría del enlace para elegir icono: "code" | "demo" | "site" | "landing" | "app" | ... */
  kind?: string;
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
    tags: [
      "Next.js",
      "React",
      "TypeScript",
      "PostgreSQL",
      "Prisma",
      "Tailwind CSS",
    ],
    image: "/images/projects/caf/prueba2.webp",
    imageAlt: "Dashboard principal y agenda del Sistema de Gestión Clínica",
    featured: true,
    links: [
      {
        label: "Ver código",
        kind: "code",
        url: "https://github.com/MaxGB23/centro-caf",
        external: true,
      },
      {
        label: "Ver código de la landing",
        kind: "code",
        url: "https://github.com/MaxGB23/centro-caf-landing-page",
        external: true,
      },
      {
        label: "Ver landing",
        kind: "landing",
        url: "https://centrocafacambaro.vercel.app",
        external: true,
      },
      {
        label: "Probar la app",
        kind: "app",
        url: "https://caf-usage-test.vercel.app/dashboard",
        external: true,
      },
    ],
    detail: {
      headline: "Gestión Clínica Inteligente y Escalable",
      summary:
        "Plataforma web full-stack construida desde cero que reemplaza el uso de Excel y agendas manuales en un centro real de fisioterapia y rehabilitación. En uso diario por el staff médico con más de **8 meses en producción sin una sola caída**, incluso durante major releases con cambios críticos en la base de datos.",
      metrics: [
        {
          value: "+8 meses",
          label: "en producción sin caídas, incluyendo major releases",
        },
        { value: "100%", label: "uptime (Vercel + NeonDB)" },
        {
          value: "-40%",
          label:
            "latencia de recuperación de registros de pacientes (índices + caching server-side)",
        },
        {
          value: "0",
          label: "incidentes en migraciones con breaking changes de BD",
        },
        {
          value: "Diario",
          label: "uso del staff médico (administrativo y fisioterapeutas)",
        },
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
        {
          src: "/images/projects/caf/analytics.png",
          alt: "Analíticas de ingresos del Sistema de Gestión Clínica",
        },
        {
          src: "/images/projects/caf/agenda.png",
          alt: "Agenda de citas del Sistema de Gestión Clínica",
        },
        {
          src: "/images/projects/caf/analiticas-caf.png",
          alt: "Panel de analíticas adicional del Sistema de Gestión Clínica",
        },
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
    tags: [
      "Next.js",
      "React",
      "TypeScript",
      "PostgreSQL",
      "Prisma",
      "Tailwind CSS",
    ],
    image: "/images/projects/presidencia-acambaro/presidencia-light.png",
    imageAlt:
      "Dashboard de métricas y gestión de solicitudes del Sistema de Apoyos Sociales",
    featured: true,
    links: [
      {
        label: "Ver código",
        kind: "code",
        url: "https://github.com/MaxGB23/Presidencia-Municipal-Acambaro",
        external: true,
      },
    ],
    detail: {
      headline: "Digitalización, Transparencia y Eficiencia Gubernamental",
      summary:
        "Plataforma full-stack escalable construida para la Presidencia Municipal de Acámbaro, desarrollada durante una estadía profesional (enero – abril 2025). Lideré su creación para automatizar el ciclo completo de los apoyos sociales: digitalización total de los flujos de aprobación, mejora de los tiempos de respuesta y paneles analíticos en tiempo real para la toma de decisiones institucionales.",
      metrics: [
        {
          value: "100%",
          label: "digitalización del flujo de solicitudes de apoyo social",
        },
        { value: "0", label: "uso de papel en el proceso administrativo" },
        {
          value: "Tiempo real",
          label: "paneles estadísticos para la toma de decisiones",
        },
        {
          value: "PDF + firma",
          label: "documentos legales generados automáticamente",
        },
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
        {
          src: "/images/projects/presidencia-acambaro/presidencia-light.png",
          alt: "Panel de métricas del Sistema de Apoyos Sociales (tema claro)",
        },
        {
          src: "/images/projects/presidencia-acambaro/presidencia-dark.png",
          alt: "Panel de métricas del Sistema de Apoyos Sociales (tema oscuro)",
        },
      ],
      cta: "¿Buscas digitalizar procesos administrativos complejos o requieres software seguro a medida? Hablemos.",
    },
  },
  {
    id: "funky-ai",
    title: "Funky AI",
    category: "Dev Tools / AI Engineering",
    hook: "Framework CLI para desarrollo de software asistido por IA: pipeline SDD con contexto just-in-time, memoria persistente y planificación de proyectos en un solo comando.",
    metric:
      "-40% consumo de tokens (contexto just-in-time, estimación interna)",
    tags: ["Node.js", "TypeScript", "CLI", "pnpm", "Vitest", "GitHub Actions"],
    image: "/images/projects/funky-ai/funky-ai-main.jpg",
    imageAlt: "Terminal del CLI de funky-ai mostrando el pipeline SDD",
    links: [
      {
        label: "Ver código",
        kind: "code",
        url: "https://github.com/MaxGB23/funky-ai",
        external: true,
      },
    ],
    featured: true,
    detail: {
      headline: "Un framework CLI para desarrollo de software asistido por IA",
      summary:
        "funky-ai unifica reglas agénticas, plantillas spec-driven y herramientas de planificación en un único CLI de Node.js (pnpm), sin superficie GUI. Orquesta el desarrollo como un pipeline determinista — proposal → specs → design → tasks → apply → verify → archive — cargando contexto just-in-time para proteger la ventana de tokens, con memoria persistente basada en archivos Markdown y endurecimiento de dependencias para proyectos pnpm. Todas las cifras de impacto son estimaciones internas del autor, no métricas externas.",
      metrics: [
        {
          value: "-40%",
          label:
            "consumo de tokens vs. contexto always-loaded (SDD just-in-time)",
        },
        {
          value: "30–50%",
          label:
            "menor costo de recall de memoria (funkygram vs. recargar contexto monolítico)",
        },
        {
          value: "~50%",
          label:
            "más rápido de idea difusa a arquitectura costeada (funky-forge)",
        },
        { value: "~30%", label: "menos riesgo de supply chain (funky secure)" },
        {
          value: "-40%",
          label: "rework fuera de alcance (TDD + issue-first workflow)",
        },
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
      gallery: [
        {
          src: "/images/projects/funky-ai/funky-ai-main.jpg",
          alt: "Pipeline SDD de funky-ai desde la terminal",
        },
        {
          src: "/images/projects/funky-ai/funky-sdd.jpg",
          alt: "Ejecución del pipeline SDD de funky-ai",
        },
        {
          src: "/images/projects/funky-ai/funky-ai.jpg",
          alt: "Vista general del CLI de funky-ai",
        },
        {
          src: "/images/projects/funky-ai/funky-ai.webp",
          alt: "Interfaz de terminal de funky-ai",
        },
      ],
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
    image: "/images/projects/oneclickti/proyectos.png",
    imageAlt: "Landing pública y panel de gestión de One Click Ti",
    links: [
      {
        label: "Ver código",
        kind: "code",
        url: "https://github.com/MaxGB23/ABMODEL",
        external: true,
      },
    ],
    detail: {
      headline:
        "Presencia digital y gestión interna en una sola PWA instalable",
      summary:
        "PWA full-stack desarrollada por contrato para One Click Ti (Querétaro, sep – dic 2024). Integra una landing page pública con un sistema de gestión interno en una sola aplicación instalable, con autenticación y control de acceso por roles. Mi primera aproximación profesional a Laravel + Vue con arquitectura PWA.",
      metrics: [
        {
          value: "PWA",
          label:
            "completa: manifest + service worker, instalable en dispositivos",
        },
        {
          value: "2",
          label:
            "superficies integradas: landing pública + sistema de gestión interno",
        },
        {
          value: "Contrato",
          label: "entregado a cliente real (sep – dic 2024)",
        },
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
      gallery: [
        {
          src: "/images/projects/oneclickti/hero.png",
          alt: "Landing pública de One Click Ti",
        },
        {
          src: "/images/projects/oneclickti/proyectos.png",
          alt: "Sección de proyectos de la landing de One Click Ti",
        },
        {
          src: "/images/projects/oneclickti/contacto.png",
          alt: "Sección de contacto de One Click Ti",
        },
        {
          src: "/images/projects/oneclickti/crud.png",
          alt: "Sistema de gestión interno de One Click Ti",
        },
      ],
      cta: "¿Necesitas una PWA instalable que combine presencia digital y gestión interna? Hablemos.",
    },
  },
  {
    id: "autoshop",
    title: "AutoShop Taller",
    category: "Full Stack / PHP",
    hook: "Sitio full-stack para una empresa de servicios automotrices: landing pública + panel admin con CMS propio hecho desde cero en PHP puro.",
    metric: "De días a minutos en actualización de contenido",
    tags: ["PHP", "MySQL", "JavaScript", "Bootstrap", "HTML5", "CSS3"],
    image: "/images/projects/autoshop/HomeCensured.png",
    imageAlt: "Landing pública y panel de administración de AutoShop",
    links: [],
    detail: {
      headline:
        "Presencia digital y gestión de contenido sin depender de un desarrollador",
      summary:
        "Sitio web full-stack para una empresa de servicios automotrices en Maravatío, Michoacán (prácticas profesionales, may – ago 2023). Incluye landing pública y un panel de administración con CMS desarrollado desde cero en PHP puro — sin framework — con el que el personal no técnico pasó a gestionar servicios, promociones y consultas por sí mismo.",
      metrics: [
        {
          value: "Días → minutos",
          label: "actualización de contenido por staff no técnico (CMS propio)",
        },
        { value: "0", label: "frameworks: CMS completo en PHP puro + MySQL" },
        {
          value: "2",
          label: "superficies: landing pública + panel de administración",
        },
        {
          value: "2",
          label: "niveles de rol (admin/staff), sin cuentas para clientes",
        },
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
      gallery: [
        {
          src: "/images/projects/autoshop/HomeCensured.png",
          alt: "Landing pública de AutoShop",
        },
        {
          src: "/images/projects/autoshop/ServiciosCensured.png",
          alt: "Sección de servicios de AutoShop",
        },
        {
          src: "/images/projects/autoshop/crud.png",
          alt: "Panel de administración (CMS) de AutoShop",
        },
      ],
      cta: "¿Te interesa ver cómo se construye un CMS a medida partiendo de cero, sin framework? Hablemos.",
    },
  },
  {
    id: "color-highlight-v2",
    title: "Color Highlight v2",
    category: "Dev Tools / VS Code",
    hook: "Fork modernizado de la extensión de VS Code que resalta colores en el editor; reconstruido con TypeScript, esbuild y pnpm.",
    metric: "Render sin lag — debounce de 150ms",
    tags: ["TypeScript", "esbuild", "pnpm", "VS Code"],
    image:
      "/images/projects/color-highlight-v2/main.jpg",
    imageAlt: "Editor de VS Code con colores resaltados por la extensión",
    links: [
      {
        label: "Ver código",
        kind: "code",
        url: "https://github.com/MaxGB23/color-highlight-v2",
        external: true,
      },
    ],
    detail: {
      headline: "Un fork modernizado, con crédito a los autores originales",
      summary:
        "Fork modernizado de `vscode-ext-color-highlight` (GPL-3.0): la extensión de VS Code que resalta colores en el editor, reconstruida con un stack moderno — TypeScript, esbuild y pnpm — e incorporando mejoras de rendimiento y accesibilidad. Se presenta siempre como fork de un proyecto existente, nunca como creación propia.",
      metrics: [
        { value: "150ms", label: "debounce → render sin lag en el editor" },
        { value: "WCAG", label: "auto-contraste sobre el color resaltado" },
        {
          value: ".vsix",
          label: "distribución agnóstica de la tienda (store-agnostic)",
        },
        {
          value: "GPL-3.0",
          label: "fork con crédito explícito a los autores originales",
        },
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
    title: "Funky Theme",
    category: "Dev Tools / VS Code",
    hook: "Tema oscuro semántico original para VS Code: 4 variantes derivadas de una paleta jerárquica definida en un único config (SSOT).",
    metric: "4 variantes desde 1 paleta SSOT",
    tags: ["VS Code", "pnpm", "Token Colors"],
    image: "/images/projects/funky-theme/icon.png",
    imageAlt: "Editor de VS Code mostrando las variantes de funky-theme",
    links: [
      {
        label: "Ver código",
        kind: "code",
        url: "https://github.com/MaxGB23/funky-theme",
        external: true,
      },
    ],
    detail: {
      headline:
        "Un tema original, con la paleta gobernada por una única fuente de verdad",
      summary:
        "Tema oscuro semántico original para VS Code, publicado bajo MIT. Cuatro variantes derivadas de una paleta jerárquica definida en un solo archivo de configuración (SSOT): se toca un valor y todo el tema se mantiene coherente, sin colores duplicados entre cientos de archivos.",
      metrics: [
        { value: "4", label: "variantes del tema" },
        {
          value: "1",
          label: "fuente de verdad: paleta jerárquica en un único config",
        },
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
    id: "grinchmas-kart",
    title: "Grinchmas Kart",
    category: "Game Dev / Unity",
    hook: "Kart racing 3D end-to-end (ABMODEL Games) con IA rival entrenada con Reinforcement Learning (ML-Agents), físicas arcade y modelos 3D propios en Blender.",
    metric: "IA rival con Reinforcement Learning (ML-Agents)",
    tags: ["Unity", "C#", "Blender", "ML-Agents"],
    image: "/images/projects/grinchmas-kart/inicio.png",
    imageAlt:
      "Gameplay de Grinchmas Kart: kart 3D en pista navideña con IA rival",
    links: [
      {
        label: "Ver código",
        kind: "code",
        url: "https://github.com/MaxGB23/Grinchmas-Kart",
        external: true,
      },
      {
        label: "Ver demo",
        kind: "demo",
        url: "https://drive.google.com/drive/folders/1bSRON0fCKFBL4qX8gPyTn4LXYGR9Vv6O?usp=sharing",
        external: true,
      },
    ],
    detail: {
      headline:
        "Un kart 3D donde el rival aprende a conducir con Reinforcement Learning",
      summary:
        "Grinchmas Kart (3D, sep – dic 2023) es un kart racing end-to-end desarrollado por ABMODEL Games — equipo universitario de 4 integrantes — con el autor a cargo de ~80% del proyecto: código, gameplay, integración de ML-Agents, flujo de niveles, dirección e integración, y modelos 3D propios en Blender. El objetivo fue superar el 'juego de muestra' oficial (Karting Microgame 5.0.1): físicas arcade creíbles y un rival que aprendiera a conducir con Reinforcement Learning.",
      metrics: [
        {
          value: "RL",
          label: "IA rival entrenada con Reinforcement Learning (ML-Agents)",
        },
        {
          value: "5",
          label: "niveles encadenados dentro de una misma partida",
        },
        {
          value: "~80%",
          label:
            "del proyecto: código, gameplay, IA, flujo, dirección + modelos 3D",
        },
        {
          value: "Blender",
          label: "modelos 3D propios: cart, trineo, motonieve, monte, pista",
        },
      ],
      problem:
        "El template oficial (Karting Microgame 5.0.1) no traía IA: había que diseñar desde cero un rival que aprendiera a conducir. Construir un kart racing creíble exige físicas arcade bien parametrizadas y un loop de partida completo — no un demo técnico.",
      role: [
        "Lideré el proyecto (~80%): código, gameplay, integración de ML-Agents, flujo de niveles, dirección e integración.",
        "Programé la IA rival con Reinforcement Learning: misma interfaz `IInput` que el jugador, observaciones por raycasts + velocidad local + dirección al checkpoint, recompensas por progreso y penalizaciones por choque, modos Training/Inferencing.",
        "Modelé en Blender: `grinchcar`, `Trineo2`, `motonieve`, `Patineta`, `Mono`, `Pista`, `SantaFinal`, `Montaña Grinch`; HUD navideño, trailer y créditos en video y audio propios.",
        "Diseñé el flujo de partida encadenando 5 niveles hasta los créditos (modifiqué `GameFlowManager`).",
      ],
      solution: [
        "**Arquitectura en capas** con `asmdefs` bien definidos (KartGame, KartGame.Editor, KartGame.AI, KartGame.AI.Editor).",
        "**IA con RL (lo más destacado):** el rival comparte la misma interfaz de input que el jugador — el `ArcadeKart` recibe un `InputData` sin distinguir quién lo conduce. Observaciones por raycasts (detección de colisiones), velocidad local y dirección al siguiente checkpoint en capa exclusiva; recompensa por acercarse/pasar el checkpoint y por velocidad, penalización por choque. Checkpoints + raycasts en vez de NavMesh: es una carrera (seguir la línea evitando choques), no una búsqueda de camino — la elección estándar para racing con RL.",
        "**Física arcade:** Rigidbody + 4 WheelColliders, suspensión parametrizada (tunable sin código), derrape con VFX, power-ups extensibles (`struct Stats`), `KartBounce` y reorientación aérea al caer.",
        "**Flujo de partida:** 5 niveles encadenados dentro de una misma partida, victoria/derrota y pantalla de créditos con video.",
        "**Modelos 3D y dirección:** assets originales en Blender, arte navideño y trailer/créditos en video y audio propios.",
      ],
      stack: [
        "Unity 2021.3.8f1 LTS (URP, Forward, lineal)",
        "C# · Cinemachine · ProBuilder · Timeline · TextMeshPro",
        "ML-Agents · Barracuda · Burst",
        "Blender (modelos y animaciones)",
      ],
      gallery: [
        {
          src: "/images/projects/grinchmas-kart/inicio.png",
          alt: "Pantalla de inicio de Grinchmas Kart",
        },
        {
          src: "/images/projects/grinchmas-kart/nivel1.png",
          alt: "Gameplay del nivel 1 de Grinchmas Kart",
        },
        {
          src: "/images/projects/grinchmas-kart/countdown.png",
          alt: "Cuenta atrás de la carrera en Grinchmas Kart",
        },
        {
          src: "/images/projects/grinchmas-kart/victoria.png",
          alt: "Pantalla de victoria de Grinchmas Kart",
        },
      ],
      cta: "¿Quieres ver cómo se entrena una IA para jugar con Reinforcement Learning dentro de un juego Unity? Hablemos.",
    },
  },
  {
    id: "cumyxel",
    title: "Cumyxel 2D",
    category: "Game Dev / Unity",
    hook: "Plataformero 2D pixel-art con programación de gameplay 100% propia: salto variable, enemigos con FSM y efecto ripple de agua en la cámara.",
    metric: "1,055 LOC de gameplay (11 scripts) + pixel-art a mano",
    tags: ["Unity", "C#", "Blender"],
    image: "/images/projects/cumyxel/nivel1.png",
    imageAlt:
      "Gameplay de Cumyxel: plataformero 2D pixel-art con enemigos y salto variable",
    links: [
      {
        label: "Ver código",
        kind: "code",
        url: "https://github.com/MaxGB23/Cumyxel",
        external: true,
      },
      {
        label: "Cumyxel (MIT)",
        kind: "code",
        url: "https://github.com/MaxGB23/Cumyxel-code",
        external: true,
      },
      {
        label: "Ver demo",
        kind: "demo",
        url: "https://drive.google.com/drive/folders/1bSRON0fCKFBL4qX8gPyTn4LXYGR9Vv6O?usp=sharing",
        external: true,
      },
    ],
    detail: {
      headline:
        "Game-feel 2D: salto variable, enemigos con comportamiento real y pixel-art cuidado",
      summary:
        "Cumyxel (2D, ene – abr 2024) es un plataformero 2D pixel-art desarrollado por ABMODEL Games — equipo universitario de 4 integrantes — del que el autor escribió el 100% de la programación de gameplay. El foco fue el *game-feel*: salto variable en dos fases, enemigos con comportamiento real (FSM), plataformas one-way y una cámara con efecto ripple de agua.",
      metrics: [
        {
          value: "1,055",
          label: "LOC de gameplay (11 scripts) + pixel-art a mano",
        },
        { value: "100%", label: "de la programación de gameplay" },
        {
          value: "FSM",
          label: "enemigos con máquina de estados: idle → chase → ataque",
        },
        {
          value: "MIT",
          label: "repo Cumyxel-code: solo código de gameplay, reusable",
        },
      ],
      problem:
        "El objetivo fue superar un 'juego de muestra' con *game-feel* real: un plataformero cuyo salto tuviera dos fases, cuyos enemigos persiguieran y atacaran con un comportamiento de máquina de estados (no sprites decorativos), y una cámara con efectos visuales (ripple de agua) que machasen la sensación de calidad.",
      role: [
        "Escribí el 100% de la programación de gameplay: salto variable en dos fases, plataformas one-way, enemigos con FSM y la cámara con efecto ripple de agua.",
        "Implementé el ground-check con `OverlapCircle` + gizmos de depuración.",
        "Publiqué y documenté: repo de contenido y un repo MIT con solo el código de gameplay (Cumyxel-code), separando código del contenido.",
      ],
      solution: [
        "**Salto variable** con corrección de gravedad en dos fases (subida sin tecla / caída) — física 2D cuidada, *game-feel*.",
        "**Enemigos con FSM** por anillos de distancia: idle → chase → ataque (esqueleto arquero y murciélago), proyectiles por corrutinas.",
        "**Plataformas one-way** con `Physics2D.IgnoreCollision` y par trigger/collider.",
        "**Cámara ortográfica** con efecto ripple de agua (post-proceso: shader + `Graphics.Blit`).",
        "**Ground-check** con `OverlapCircle` + gizmos; Tilemap, Mecanim; escenarios pixel-art dibujados a mano.",
        "**Cumyxel-code:** repo público MIT con solo el código de gameplay — separa código del contenido y muestra mentalidad open-source.",
      ],
      stack: [
        "Unity 2022.3.19f1 LTS (Built-in RP, lineal)",
        "C# · uGUI + TextMeshPro · Mecanim · Tilemap · Physics2D",
        "~1,055 LOC en 11 scripts de gameplay",
        "Pixel-art a mano + assets libres",
      ],
      gallery: [
        {
          src: "/images/projects/cumyxel/nivel1.png",
          alt: "Nivel 1 de Cumyxel",
        },
        {
          src: "/images/projects/cumyxel/bossfight.png",
          alt: "Boss fight de Cumyxel",
        },
        {
          src: "/images/projects/cumyxel/pve.png",
          alt: "Combate del jugador contra enemigos en Cumyxel",
        },
        {
          src: "/images/projects/cumyxel/npc-interaction.png",
          alt: "Interacción con NPC en Cumyxel",
        },
      ],
      cta: "¿Quieres ver cómo se construye un plataformero 2D con game-feel real, FSM y pixel-art a mano? Hablemos.",
    },
  },
];

export function getProjectById(id: string): Project | undefined {
  return projects.find((project) => project.id === id);
}

export function getFeaturedProjects(): Project[] {
  return projects.filter((project) => project.featured);
}