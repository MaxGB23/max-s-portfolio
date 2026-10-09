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

export interface ArchitectureNode {
  /** Nombre del nodo/capa, extraído de la documentación real. */
  name: string;
  /** Descripción breve solo si las fuentes la respaldan. */
  description?: string;
  children?: ArchitectureNode[];
}

export interface ProjectDetail {
  headline: string;
  summary: string;
  /**
   * Imagen introductoria del detail (portada grande, independente de la card).
   * Si falta, el detail cae a `project.image` — los proyectos sin `visual`
   * siguen mostrando la misma imagen de la card.
   */
  visual?: ProjectImage;
  /**
   * Métricas clave del detail.
   * CONVENCIÓN DE ORDEN: `metrics[0]` es la métrica RAÍZ / principal — se
   * renderiza como nodo raíz (columna izquierda) en la topología del detail;
   * el resto son nodos hijos (columna derecha). Mantener la más importante
   * primero, siempre.
   */
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
  /**
   * Árbol de arquitectura real por proyecto (extraído de docs/projects).
   * Vive en `Project` (no en `ProjectDetail`) porque la vista "Grafo Arquitectura"
   * lee `project.architecture` naturalmente y la topología describe el proyecto
   * completo, no su vista detallada. Sin él, la vista muestra un estado vacío
   * honesto — nunca se inventa topología.
   */
  architecture?: ArchitectureNode;
}

export const projects: Project[] = [
  {
    id: "caf",
    title: "Sistema de Gestión Clínica",
    category: "Full Stack / HealthTech",
    hook: "Plataforma web full-stack en producción para la gestión integral de citas, pacientes y control de pagos en centros de salud.",
    metric: "+10 meses en producción sin caídas",
    tags: [
      "Next.js",
      "React",
      "TypeScript",
      "PostgreSQL",
      "Prisma",
      "Tailwind CSS",
    ],
    image: "/images/projects/caf/caf-demo.webp",
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
        "Plataforma web full-stack construida desde cero que reemplaza el uso de Excel y agendas manuales en un centro real de fisioterapia y rehabilitación. En uso diario por el staff médico con más de **10 meses en producción sin una sola caída**, incluso durante major releases con cambios críticos en la base de datos.",
      metrics: [
        {
          value: "+10 meses",
          label: "en producción sin caídas, incluyendo major releases",
        },
        { value: "100%", label: "uptime: el cliente nunca ha reportado una caída" },
        {
          value: "-40%",
          label:
            "latencia de recuperación de registros de pacientes (estimada sobre el salto a índice + cache())",
        },
        {
          value: "En uso diario",
          label: "por staff real en clínica en producción (admin + fisios)",
        },
      ],
      problem:
        "Las clínicas pequeñas y medianas dependen de herramientas genéricas, procesos manuales en papel o múltiples aplicaciones desconectadas para agendar, llevar historiales médicos y cobrar. Esto genera pérdidas de tiempo, dobles reservas y descontrol financiero. No existía una solución a medida accesible para centros que trabajan por sesiones o paquetes.",
      role: [
        "Diseñé un sistema modular por features usando Next.js, TypeScript y Prisma para mejorar mantenibilidad y acelerar la entrega de funcionalidades.",
        "Implementé control de acceso por roles (Admin, Editor, Viewer) con doble perímetro: layouts de servidor exigen sesión y rol antes de renderizar y cada Server Action valida con guards; sin registro público (el admin crea las cuentas y el rol no se fija desde el cliente) y sin middleware deliberado, porque el Edge no puede validar sesiones de base de datos.",
        "Reduje un 40% la latencia de recuperación de registros con un índice en `sessionDate` y caching server-side con `cache()` de React. La cifra es una estimación conservadora del salto de seq scan a index scan, no una medición en producción.",
        "Validé cada mutación con Zod en el servidor antes de cualquier I/O, con resultado tipado y errores centralizados en español; los conflictos de agenda responden advertencia confirmable en dos pasos, y el frontend solo muestra mensajes amigables, nunca errores crudos del backend.",
        "Apliqué cero confianza en el input: cupo del paquete, pendiente única y choques de horario se verifican en el servidor, y hasta el ID para revalidar se lee de la base de datos, nunca del cliente.",
        "Usé SQL crudo solo con jaula: valores siempre como parámetros y fragmentos construidos desde una unión cerrada, sin camino del input al query.",
        "Blindé la UX ante fallos: los boundaries traducen errores de auth a pantallas accionables y los 404 contextuales devuelven al dashboard, nunca una pantalla en blanco.",
        "Migré los nombres y precios que vivían hardcodeados en un combobox a una UI de paquetes CRUD que los actualiza, con migraciones de Prisma sobre datos existentes. El cliente necesitaba subir precios por la inflación del país y los valores hardcodeados lo impedían. Las migraciones se aplicaron en producción sin un solo incidente de datos: ningún paquete legacy se rompió.",
        "En paralelo descarté una branch completa que no cumplía los estándares del proyecto, antes de que llegara a producción.",
        "Desplegué y mantengo la plataforma en Vercel con NeonDB (PostgreSQL) hace más de 10 meses, sin que el cliente haya reportado una sola caída.",
        "Desarrollé la landing page pública integrada con el sistema interno; estable en uptime y generando contactos de nuevos pacientes.",
      ],
      solution: [
        "**Agenda inteligente:** calendario interactivo con prevención automática de conflictos y control de sesiones (pendiente, asistida, cancelada).",
        "**Expediente electrónico:** alta y búsqueda rápida de pacientes, historial de sesiones y pagos, seguimiento individual.",
        "**Módulo financiero:** venta de paquetes de sesiones, balance por paciente y registro de ingresos. Los paquetes se administran desde una UI CRUD en lugar de valores hardcodeados, lo que permite actualizar precios sin desplegar — necesario para responder a la inflación del mercado.",
        "**Panel de control (dashboard):** analíticas de ingresos mensuales, pacientes activos, ganancias y métricas operativas, con filtros por periodo (30 días, 3 meses, 1 año e histórico), cache con refresh manual y tarjetas + gráficos. El histórico usa cache extendido por costo.",
        "**Landing page pública:** optimizada para SEO, enfocada a captación de nuevos pacientes e integrada con el sistema interno.",
        "**Seguridad y roles:** doble perímetro con layouts y guards por rol (Admin, Editor, Viewer), loop cerrado sin registro público y autorización siempre en el servidor; el cliente solo presenta, nunca autoriza.",
        "**Cuenta de usuario autocontrolada (perfil):** edición de nombre y contraseña desde el propio perfil, con vista de tipo red social (foto de perfil y portada). El correo queda bloqueado para el usuario (input deshabilitado) y su cambio se solicita a un administrador, preservando la trazabilidad de la cuenta.",
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
          src: "/images/projects/caf/editar_profile.webp",
          alt: "Edición de perfil de usuario",
        },
        {
          src: "/images/projects/caf/dashboard-light.webp",
          alt: "Dashboard Principal",
        },

        {
          src: "/images/projects/caf/agenda-light.webp",
          alt: "Agenda de citas del Sistema de Gestión Clínica",
        },
        {
          src: "/images/projects/caf/analiticas-caf.webp",
          alt: "Panel de analíticas adicional del Sistema de Gestión Clínica",
        },
      ],
      cta: "¿Buscas modernizar tu clínica o necesitas un sistema a medida? Hablemos.",
    },
    architecture: {
      name: "Sistema de Gestión Clínica",
      description:
        "Arquitectura modular por features diseñada para escalar a múltiples especialidades (fisioterapia, psicología, nutrición, odontología) y funcionar como base tipo SaaS.",
      children: [
        {
          name: "Agenda inteligente",
          description:
            "Calendario interactivo con prevención automática de conflictos y control de sesiones (pendiente, asistida, cancelada).",
          children: [
            { name: "Prevención automática de conflictos" },
            { name: "Control de sesiones" },
          ],
        },
        {
          name: "Expediente electrónico",
          description:
            "Alta y búsqueda rápida de pacientes, historial de sesiones y pagos, seguimiento individual.",
        },
        {
          name: "Módulo financiero",
          description:
            "Venta de paquetes de sesiones, balance por paciente y registro de ingresos.",
          children: [
            { name: "Paquetes de sesiones" },
            { name: "Balance por paciente" },
            { name: "Registro de ingresos" },
          ],
        },
        {
          name: "Panel de control (dashboard)",
          description:
            "Analíticas de ingresos mensuales, pacientes activos, ganancias y métricas operativas, con filtros por periodo y tarjetas + gráficos.",
          children: [
            { name: "Analíticas mensuales" },
            { name: "Filtros por periodo (30 días, 3 meses, 1 año)" },
          ],
        },
        {
          name: "Landing page pública",
          description:
            "Optimizada para SEO, enfocada a captación de nuevos pacientes e integrada con el sistema interno.",
        },
        {
          name: "Seguridad y roles",
          description: "Accesos por tipo de usuario y manejo seguro de sesiones.",
        },
        {
          name: "Cuenta de usuario",
          description:
            "Perfil autocontrolado: el usuario edita nombre y contraseña; el correo queda bloqueado y su cambio se solicita a un administrador.",
        },
      ],
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
    image: "/images/projects/presidencia-acambaro/presidencia-demo.webp",
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
        "Plataforma full-stack escalable construida para la Presidencia Municipal de Acámbaro, desarrollada durante una estadía profesional (enero – abril 2025). Lideré su creación para automatizar el ciclo completo de los apoyos sociales: digitalización total de los flujos de aprobación y paneles analíticos en tiempo real para la toma de decisiones institucionales.",
      metrics: [
        {
          value: "100%",
          label: "digitalización del flujo de solicitudes de apoyo social",
        },
        {
          value: "4 meses",
          label: "de cero a producción en gobierno (estadía ene-abr 2025)",
        },
        {
          value: "Trazable",
          label: "cada solicitud registra quién la modificó",
        },
        {
          value: "PDF legal",
          label:
            "auto-generado del expediente y listo para imprimir; sin Word manual, solo faltan las firmas",
        },
      ],
      problem:
        "El gobierno municipal dependía de procesos manuales intensivos en papel para gestionar las solicitudes ciudadanas. Esto ocasionaba tiempos de respuesta lentos, pérdida de trazabilidad administrativa y una carencia total de reportes o métricas para evaluar la asignación de recursos y el rendimiento institucional.",
      role: [
        "Lideré el desarrollo de la plataforma completa: arquitectura, planificación, implementación y despliegue.",
        "Trabajé en un equipo de 2 personas bajo Scrum y Jira, a cargo del desarrollo del software durante la estadía universitaria.",
        "Diseñé y desarrollé la aplicación full-stack con Next.js, TypeScript, PostgreSQL y Prisma.",
        "Implementé autenticación y control de acceso por roles (RBAC) por departamento.",
        "Construí dashboards interactivos con Recharts y la generación dinámica de PDFs legales con datos autocompletados y espacios de firma para el ciudadano y la autoridad encargada.",
      ],
      solution: [
        "**Dashboard estadístico:** visualización interactiva con Recharts para monitorear tendencias, volumen de solicitudes y KPIs institucionales.",
        "**Gestión avanzada de solicitudes:** seguimiento de extremo a extremo con filtros (estado, departamento, categoría del apoyo) y asignación controlada a departamentos. Cada solicitud concentra los datos del ciudadano y la subcategoría del apoyo, y la categoría orienta qué departamento debe gestionarla.",
        "**Módulo de documentos legales:** generación automatizada de PDFs con validez legal y datos dinámicos pre-cargados del expediente del ciudadano, con espacios de firma para el ciudadano y la autoridad encargada.",
        "**Seguridad y control de acceso (RBAC):** segmentación de opciones y vistas según roles (administradores, coordinadores departamentales), con validación en frontend, server actions y middleware.",
        "**Administración de usuarios:** CRUD de usuarios con roles y departamentos, reservado al rol admin.",
        "**Gestión dinámica institucional:** los datos precargados del PDF (logotipo, presidente municipal y cargos clave) se editan desde un CRUD para futuros documentos, sin intervenir el código base, pensado para los cambios de administración.",
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
          src: "/images/projects/presidencia-acambaro/login.webp",
          alt: "Panel de métricas del Sistema de Apoyos Sociales (tema claro)",
        },
        {
          src: "/images/projects/presidencia-acambaro/solicitudes.webp",
          alt: "Panel de métricas del Sistema de Apoyos Sociales (tema oscuro)",
        },
        {
          src: "/images/projects/presidencia-acambaro/estadisticas.webp",
          alt: "Panel de métricas del Sistema de Apoyos Sociales (tema oscuro)",
        },
        {
          src: "/images/projects/presidencia-acambaro/generacion-pdf.webp",
          alt: "Panel de métricas del Sistema de Apoyos Sociales (tema oscuro)",
        },
      ],
      cta: "¿Buscas digitalizar procesos administrativos complejos o requieres software seguro a medida? Hablemos.",
    },
    architecture: {
      name: "Gestión de Apoyos Sociales",
      description:
        "Arquitectura orientada a la persistencia y la configuración dinámica: las plantillas y opciones administrativas se adaptan durante cambios de periodo de gobierno, nuevos departamentos o tipos de apoyo, sin refactorizar el código base.",
      children: [
        {
          name: "Dashboard estadístico",
          description:
            "Visualización interactiva con Recharts para monitorear tendencias, volumen de solicitudes y KPIs institucionales.",
        },
        {
          name: "Gestión avanzada de solicitudes",
          description:
            "Seguimiento de extremo a extremo con filtros (estado, departamento, categoría del apoyo) y asignación controlada a departamentos.",
          children: [
            { name: "Filtros por estado, departamento y categoría del apoyo" },
            { name: "Asignación controlada a departamentos" },
          ],
        },
        {
          name: "Módulo de documentos legales",
          description:
            "Generación automatizada de PDFs con validez legal y datos dinámicos pre-cargados del expediente del ciudadano, con espacios de firma para el ciudadano y la autoridad encargada.",
          children: [
            { name: "Espacios de firma (ciudadano y autoridad encargada)" },
            { name: "Datos autocompletados del expediente" },
          ],
        },
        {
          name: "Seguridad y control de acceso (RBAC)",
          description:
            "Segmentación de opciones y vistas según roles (administradores, coordinadores departamentales), con validación en frontend, server actions y middleware.",
        },
        {
          name: "Administración de usuarios",
          description:
            "CRUD de usuarios con asignación de roles y departamentos; acceso restringido a administradores.",
        },
        {
          name: "Gestión dinámica institucional",
          description:
            "Los datos precargados del PDF (logotipo, presidente municipal y cargos clave) se editan desde un CRUD para futuros documentos, sin intervenir el código base, pensado para los cambios de administración.",
        },
      ],
    },
  },
  {
    id: "funky-ai",
    title: "Funky AI",
    category: "Dev Tools / AI Engineering",
    hook: "CLI modular `funky` con 10 comandos para planificar, construir y endurecer proyectos con proceso repetible.",
    metric: "10 comandos · 443 tests · 27 reglas",
    tags: ["Node.js", "TypeScript", "CLI", "pnpm", "Vitest", "GitHub Actions"],
    image: "/images/projects/funky-ai/funky-ai-main.webp",
    imageAlt: "Terminal del CLI de funky-ai mostrando el pipeline SDD",
    links: [
      {
        label: "Ver código",
        kind: "code",
        url: "https://github.com/MaxGB23/funky-ai",
        external: true,
      },
    ],
    detail: {
      headline: "De idea a release con proceso, en un solo CLI",
      summary:
        "funky-ai es un solo CLI con 10 comandos independientes para planificar, construir y endurecer proyectos sin imponer memoria ni interfaz gráfica; se instala por clonar + symlink con pnpm (npm no publicado, pnpm-first). Deja una base mínima para arrancar, solo inyecta OpenSpec cuando se pide con `funky sdd install`, y Forge ayuda a aprender a planificar y a saber cómo cobrar con asesoría de IA. Secure es asistido y honesto: diagnostica y recomienda sin bloquear por defecto. SDD se conserva como metodología vigente; ODD no está implementado, se plantea como línea futura: cada fase SDD equivaldría a una tarea ODD con su work-unit commit.",
      metrics: [
        {
          value: "10",
          label: "comandos en un solo CLI para planificar, construir y asegurar",
        },
        {
          value: "47+7",
          label: "plantillas base para arrancar cualquier proyecto en minutos",
        },
        {
          value: "27",
          label: "reglas de IA que ordenan el trabajo entre agente y humano",
        },
        {
          value: "443",
          label: "pruebas automatizadas con Vitest en verde que cuidan cada cambio en 36 archivos",
        },
        {
          value: "3",
          label: "acciones de CI fijadas por SHA",
        },
        {
          value: "Asistido",
          label:
            "revisión de dependencias que avisa antes de instalar algo riesgoso",
        },
      ],
      visual: {
        src: "/images/projects/funky-ai/funky-ai-main.webp",
        alt: "Funky-AI logo",
      },
      problem:
        "Las tareas grandes de IA asistida que arrancan de un único prompt masivo fallan de forma predecible: la ventana de contexto se desborda, el modelo alucina sobre partes que ya no recuerda y no hay punto natural de intervención humana. Los agentes no tienen memoria confiable entre sesiones, cada sesión re-aprende desde cero recargando contexto caro, y la planificación de proyectos ocurre ad-hoc, después de elegir el stack.",
      role: [
        "Diseñé el ecosistema CLI completo: pipeline SDD con contexto just-in-time y separación orquestador/sub-agentes.",
        "Construí funkygram (memoria persistente), funky-forge (planificación) y funky secure (hardening de dependencias).",
        "Apliqué TDD con Vitest y workflow issue-first desde el inicio: cada cambio rastreado a un issue triado.",
        "Mantuve CI/CD con GitHub Actions (SHA fijados por seguridad) y documentación viva verificada contra el CLI real.",
      ],
      solution: [
        "**Scaffold base mínima para arrancar** — deja lo justo para empezar un proyecto en minutos, con estructura interoperable. No impone metodología; funciona con la memoria que ya tengas.",
        "**funkygram, memoria persistente opcional** — guarda el conocimiento del proyecto en archivos Markdown dentro del repo, organizado por temas con índice central. Es opcional: si ya tienes otra memoria, la respeta; las sesiones dejan de reaprender desde cero.",
        "**Framework SDD propio con prompt based harnesses** — pipeline por fases (proposal, specs, design, tasks, apply, verify, archive) con 27 reglas que ordenan la delegación entre orquestador y sub-agentes, cargando contexto solo cuando se necesita. Es la base de mi experiencia creando harnesses a medida y adaptándome a cada modelo y plataforma. SDD sigue vigente; ODD no está implementado, se plantea como línea futura.",
        "**OpenSpec solo cuando se pide** — solo un comando instala OpenSpec; el resto del CLI no lo impone ni lo mezcla con la base inicial.",
        "**Forge para aprender a planificar y saber cómo cobrar** — prepara material de planificación, revisión de arquitectura y estimación de costos con asesoría de IA. La herramienta ordena las ideas, no decide por ti.",
        "**Secure asistido honesto** — diagnostica dependencias y recomienda buenas prácticas. La cuarentena y la revisión de secretos funcionan como guía asistida, no como bloqueo automático.",
        "**Prácticas** — sin código sin issue previo, pruebas con Vitest, integración continua con SHA fijados, versiones ordenadas con notas de cambio y documentación verificada contra el CLI real. El mismo flujo sirve a personas y a agentes: en terminal pregunta antes de sobrescribir, en CI falla de forma documentada; si no puede comprobar el estado, no sobrescribe. Objetivos de diseño, no medidos: menos tokens con contexto justo a tiempo, menos costo de recordar, más rápido de idea difusa a arquitectura costeada y menos riesgo en dependencias.",
      ],
      stack: [
        "Lenguaje / Runtime: Node.js, TypeScript",
        "Package manager: pnpm",
        "CLI: sin interfaz gráfica",
        "Testing: Vitest (TDD, Red → Green → Refactor)",
        "CI/CD: GitHub Actions (SHA fijados por seguridad)",
        "Memoria: archivos Markdown por temas + índice central",
        "Pipeline: plantillas SDD en Markdown, contexto justo a tiempo",
        "Capa agéntica: 27 reglas de trabajo entre agente y humano + formato fijo de lecciones",
      ],
      gallery: [
        {
          src: "/images/projects/funky-ai/funky-forge.webp",
          alt: "Pipeline Funky Forge",
        },
        {
          src: "/images/projects/funky-ai/funky-secure-neon-diagram.webp",
          alt: "Vista general de Funky Secure",
        },
        {
          src: "/images/projects/funky-ai/funkygram-neon.webp",
          alt: "Interfaz de terminal de Funkygram",
        },
        {
          src: "/images/projects/funky-ai/funky-sdd-neon.webp",
          alt: "Ejecución del pipeline SDD de funky-ai",
        },
      ],
      cta: "¿Buscas incorporar IA en tu flujo de desarrollo con proceso y sin caos? Este framework es mi laboratorio público.",
    },
    architecture: {
      name: "funky-ai",
      description:
        "Ecosistema de un solo CLI en Node.js con pnpm y sin interfaz gráfica: une reglas de trabajo con IA, plantillas de planificación y herramientas de costos en un único punto de entrada.",
      children: [
        {
          name: "SDD framework",
          description:
            "Proceso por fases con documentos Markdown y contexto justo a tiempo; las decisiones delicadas siempre piden confirmación humana.",
          children: [
            {
              name: "Pipeline de fases (proposal → specs → design → tasks → apply → verify → archive)",
            },
            { name: "3 tiers: T1 Flash, T2 Standard, T3 Insano" },
            { name: "3 modos de ejecución: Interactive, Auto, Handoff" },
            { name: "Puertas humanas antes de Git y operaciones destructivas" },
          ],
        },
        {
          name: "funkygram",
          description:
            "Memoria persistente en archivos Markdown dentro del repo, organizada por temas con formato fijo de lecciones e índice central que se actualiza solo.",
          children: [
            { name: "Shards O(1) por categoría" },
            { name: "Esquema What/Why/Where/Learned" },
            { name: "Índice central auto-actualizado" },
          ],
        },
        {
          name: "funky-forge",
          description:
            "De idea difusa a plan con costos; la herramienta prepara material para aprender a planificar y saber cómo cobrar, no decide por ti.",
          children: [
            { name: "init (canvases de proyecto e infra)" },
            { name: "assess (revisión de arquitectura con registro de decisiones)" },
            { name: "estimate (guía de costos con buffers y TCO)" },
            { name: "pipeline (estado compartido entre fases)" },
          ],
        },
        {
          name: "funky secure",
          description:
            "Cuidado de dependencias con pnpm: diagnostica y recomienda como guía asistida, sin bloquear por defecto.",
          children: [
            { name: "doctor (diagnóstico read-only)" },
            { name: "init (política idempotente)" },
            { name: "check (gate CI fail-closed)" },
          ],
        },
        {
          name: "Capa de contratos agénticos",
          description:
            "27 reglas que ordenan el trabajo entre agente y humano y solo cargan contexto cuando se necesita.",
          children: [
            { name: "7 contratos T2 por fase" },
            { name: "9 workflows T3" },
            { name: "Contratos de exploración y memoria" },
            { name: "Carga just-in-time" },
          ],
        },
        {
          name: "Prácticas",
          description:
            "Disciplina transversal que mantiene el proceso honesto: sin código sin issue previo, integración continua, releases ordenados y pruebas primero.",
          children: [
            { name: "Issue-first (no hay código sin issue)" },
            { name: "CI con GitHub Actions (toolchain pineado a SHAs)" },
            { name: "Releases estructurados y docs vivas" },
            { name: "TDD con Vitest" },
          ],
        },
      ],
    },
  },
   {
    id: "grinchmas-kart",
    title: "Grinchmas Kart",
    category: "Game Dev / Unity",
    hook: "Kart racing 3D end-to-end (ABMODEL Games) con IA rival entrenada con Reinforcement Learning (ML-Agents), físicas arcade y modelos 3D propios en Blender.",
    metric: "IA rival con Reinforcement Learning (ML-Agents)",
    tags: ["Unity", "C#", "Blender", "ML-Agents"],
    image: "/images/projects/grinchmas-kart/inicio.webp",
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
        "Lideré un kart 3D en equipo de 4 y le enseñé al rival a conducir solo",
      summary:
        "Grinchmas Kart (3D, sep – dic 2023) es un kart racing end-to-end de ABMODEL Games, equipo universitario de 4 integrantes. Lideré ~80% del proyecto: código, gameplay, IA, flujo de niveles, dirección y modelos 3D propios en Blender. El objetivo fue superar el juego de muestra oficial (Karting Microgame 5.0.1) con físicas arcade creíbles y un rival que aprende a conducir con Reinforcement Learning.",
      metrics: [
        {
          value: "RL",
          label: "IA rival con reinforcement learning en un nivel de carrera",
        },
        {
          value: "5",
          label: "niveles encadenados en la misma partida hasta los créditos",
        },
        {
          value: "~80%",
          label:
            "del proyecto liderado en equipo de 4: código, IA, flujo y 3D",
        },
        {
          value: "8",
          label:
            "modelos 3D propios en blender: kart, pista, personajes y escenarios",
        },
      ],
      problem:
        "Un kart racing creíble exige físicas arcade bien parametrizadas, una IA rival que compita de verdad y un loop de partida completo, no un demo técnico. Partimos de la base oficial de Unity y la convertimos en juego propio: integramos la IA rival con Reinforcement Learning y la hicimos funcionar en un nivel de carrera; en el resto, los rivales replican los movimientos del jugador principal, con 5 niveles encadenados hasta los créditos.",
      role: [
        "Lideré el proyecto (~80%): código, gameplay, integración de ML-Agents, flujo de niveles, dirección e integración.",
        "Integré la IA rival con Reinforcement Learning y la hice funcionar en un nivel de carrera: comparte la entrada del jugador, observa con sensores de distancia, velocidad y dirección al punto de control, con recompensas por progreso y penalizaciones por choque, en modos entrenamiento e inferencia. En el resto de niveles, los rivales replican los movimientos del jugador principal.",
        "Modelé en Blender los assets propios: personajes (Grinch, Santa, Mono de Nieve y Pingüino), sus vehículos, pista y escenarios; HUD navideño, trailer y créditos en video y audio propios.",
        "Diseñé el flujo de partida encadenando 5 niveles hasta los créditos (modifiqué `GameFlowManager`).",
      ],
      solution: [
        "**Arquitectura en capas** con `asmdefs` bien definidos (KartGame, KartGame.Editor, KartGame.AI, KartGame.AI.Editor).",
        "**IA rival que aprende a conducir:** integramos el módulo de Reinforcement Learning en nuestro proyecto y lo hicimos funcionar en un nivel de carrera. Usa la misma entrada que el jugador, así el kart no distingue quién lo maneja. Detecta la pista con sensores de distancia, mide su velocidad y apunta al siguiente punto de control; gana puntos por avanzar rápido y los pierde por chocar. En el resto de niveles, los rivales replican los movimientos del jugador principal.",
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
          src: "/images/projects/grinchmas-kart/inicio.webp",
          alt: "Pantalla de inicio de Grinchmas Kart",
        },
        {
          src: "/images/projects/grinchmas-kart/nivel1.webp",
          alt: "Gameplay del nivel 1 de Grinchmas Kart",
        },
        {
          src: "/images/projects/grinchmas-kart/countdown.webp",
          alt: "Cuenta atrás de la carrera en Grinchmas Kart",
        },
        {
          src: "/images/projects/grinchmas-kart/victoria.webp",
          alt: "Pantalla de victoria de Grinchmas Kart",
        },
      ],
      cta: "¿Quieres ver cómo se entrena una IA para jugar con Reinforcement Learning dentro de un juego Unity? Hablemos.",
    },
    architecture: {
      name: "Grinchmas Kart",
      description:
        "Kart racing 3D end-to-end sobre el template Karting Microgame 5.0.1: físicas arcade creíbles y un rival que aprende a conducir con Reinforcement Learning (ML-Agents).",
      children: [
        {
          name: "Arquitectura en capas",
          description:
            "Presentación → Sistemas de juego → Física/Gameplay → Controladores → Input, con asmdefs bien definidos (KartGame, KartGame.Editor, KartGame.AI, KartGame.AI.Editor).",
          children: [
            {
              name: "Presentación: UI + audio + cámaras (Cinemachine)",
            },
            {
              name: "Sistemas de juego: GameFlowManager, ObjectiveManager, TimeManager",
            },
            {
              name: "Física/Gameplay: ArcadeKart, KartBounce, KartAnimation",
            },
            {
              name: "Controladores intercambiables: KeyboardInput y KartAgent producen el mismo InputData",
            },
          ],
        },
        {
          name: "IA con Reinforcement Learning (ML-Agents)",
          description:
            "El rival comparte la misma interfaz IInput que el jugador: el ArcadeKart recibe un InputData sin distinguir quién lo conduce.",
          children: [
            {
              name: "Observaciones por raycasts + velocidad local + dirección al checkpoint",
            },
            {
              name: "Recompensas por progreso y velocidad, penalizaciones por choque",
            },
            { name: "Modos Training/Inferencing" },
          ],
        },
        {
          name: "Física arcade",
          description:
            "Rigidbody + 4 WheelColliders, suspensión parametrizada (tunable sin código), derrape con VFX y power-ups extensibles.",
          children: [
            { name: "Suspensión parametrizada" },
            { name: "Derrape con VFX" },
            { name: "Power-ups extensibles (struct Stats)" },
          ],
        },
        {
          name: "Flujo de partida",
          description:
            "5 niveles encadenados dentro de una misma partida, victoria/derrota y pantalla de créditos con video (GameFlowManager modificado).",
          children: [
            { name: "5 niveles encadenados hasta los créditos" },
            { name: "Victoria / derrota (LoseScene)" },
          ],
        },
        {
          name: "Modelos 3D y dirección",
          description:
            "Assets originales en Blender (Grinch, Santa, Mono de Nieve y Pingüino, con sus vehículos, pista y escenarios), HUD navideño, trailer y créditos en video y audio propios.",
        },
      ],
    },
  },
  {
    id: "cumyxel",
    title: "Cumyxel 2D",
    category: "Game Dev / Unity",
    hook: "Juego de plataformas 2D pixel-art con todo el gameplay escrito desde cero y escenarios y animaciones hechos a mano: salto variable, combate con disparo y enemigos con máquina de estados.",
    metric: "Mejor Videojuego — Expo Proyectos, Universidad Tecnológica de León",
    tags: ["Unity", "C#", "Blender"],
    image: "/images/projects/cumyxel/nivel1.webp",
    imageAlt:
      "Gameplay de Cumyxel: juego de plataformas 2D pixel-art con enemigos y salto variable",
    links: [
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
        "Un juego de plataformas 2D hecho de la física al pixel-art, reconocido como Mejor Videojuego",
      summary:
        "Cumyxel (2D, ene – abr 2024) es un juego de plataformas 2D pixel-art de ABMODEL Games, equipo universitario de 4 integrantes. Escribí todo el gameplay y armé a mano los escenarios (tilesets) y las animaciones, usando sprites de licencia permisiva. El foco fue el game-feel: salto variable, combate con disparo como mecánica principal y enemigos que persiguen y atacan de verdad. Recibió el reconocimiento a Mejor Videojuego en la Expo Proyectos de la Universidad Tecnológica de León (abr 2024).",
      metrics: [
        {
          value: "Mejor Videojuego",
          label:
            "Expo Proyectos · Universidad Tecnológica de León (abr 2024)",
        },
        {
          value: "FSM",
          label: "enemigos con máquina de estados: idle → persecución → ataque",
        },
        {
          value: "A mano",
          label: "escenarios y animaciones: sprites, sprite sheets, tilesets y tilemap",
        },
        {
          value: "MIT",
          label: "repo Cumyxel-code: el código de gameplay, separado y reusable",
        },
      ],
      visual: {
        src: "/images/projects/cumyxel/logo.webp",
        alt: "Logotipo de Cumyxel",
      },
      problem:
        "Un juego de plataformas 2D no se sostiene con sprites decorativos: el juego exige game-feel real. El salto debía sentirse bien en dos fases, hacía falta un combate con disparo como mecánica principal, y los enemigos tenían que perseguir y atacar con lógica propia en vez de moverse en línea recta. La meta fue convertir un prototipo en un juego jugable de principio a fin.",
      role: [
        "Escribí todo el gameplay: salto variable en dos fases, plataformas one-way, enemigos con FSM, combate de disparo y pisotón, y un dash con onda de agua que impulsa al personaje por el mapa.",
        "Construí los escenarios a mano: armé tilesets y los compuse en tilemap con sprites de licencia permisiva, e integré en el motor sus colisiones, plataformas y zonas de golpe.",
        "Animé a mano a los personajes en Unity (Timeline), frame a frame, para ataque, movimiento y salto; prototipé animaciones en Blender.",
        "Publiqué y documenté: repo de contenido y un repo MIT con solo el código de gameplay (Cumyxel-code), separando código del contenido.",
      ],
      solution: [
        "**Salto variable** que se siente bien: corrección de gravedad en dos fases (subida sin tecla / caída) — física 2D cuidada, game-feel.",
        "**Combate con disparo** como mecánica principal: disparar elimina enemigos; además se les baja la vida saltando encima de ellos (pisotón).",
        "**Enemigos con FSM** que persiguen y atacan de verdad: por anillos de distancia idle → persecución → ataque (esqueleto arquero y murciélago).",
        "**Dash con onda de agua:** animación que impulsa al personaje como un boost y le permite moverse rápido por el escenario, con su efecto visual de onda de agua.",
        "**Escenarios a mano:** tilesets armados y compuestos en tilemap a partir de sprites de licencia permisiva, con colisiones, plataformas one-way y zonas de golpe integradas en el motor.",
        "**Animación a mano:** personajes animados frame a frame en Unity (Timeline) para ataque, movimiento y salto, con prototipos en Blender.",
        "**Cumyxel-code:** repo público MIT con solo el código de gameplay, separado del contenido — mentalidad open-source.",
      ],
      stack: [
        "Unity 2022.3.19f1 LTS (Built-in RP, lineal)",
        "C# · uGUI + TextMeshPro · Mecanim · Timeline · Tilemap · Physics2D",
        "~1,055 LOC en 11 scripts de gameplay",
        "Escenarios (tilesets) a mano con sprites de licencia permisiva · Blender para prototipos de animación",
      ],
      gallery: [
        {
          src: "/images/projects/cumyxel/nivel1.webp",
          alt: "Nivel 1 de Cumyxel",
        },
        {
          src: "/images/projects/cumyxel/bossfight.webp",
          alt: "Combate contra el jefe en Cumyxel",
        },
        {
          src: "/images/projects/cumyxel/npc-interaction.webp",
          alt: "Interacción con un NPC en Cumyxel",
        },
        {
          src: "/images/projects/cumyxel/tutorial.webp",
          alt: "Tutorial de Cumyxel",
        },
      ],
      cta: "¿Quieres ver un juego de plataformas 2D completo, de la física al pixel-art, con todo el gameplay escrito desde cero? Hablemos.",
    },
    architecture: {
      name: "Cumyxel 2D",
      description:
        "Plataformero 2D pixel-art con game-feel real: salto variable, combate con disparo como mecánica principal y enemigos con FSM; escribí todo el gameplay y armé a mano escenarios y animaciones.",
      children: [
        {
          name: "Salto variable",
          description:
            "Corrección de gravedad en dos fases (subida sin tecla / caída) — física 2D cuidada.",
        },
        {
          name: "Combate con disparo",
          description:
            "Mecánica principal del juego: disparar elimina enemigos; además se les baja la vida con un pisotón saltando encima.",
        },
        {
          name: "Enemigos con FSM",
          description:
            "Por anillos de distancia: idle → persecución → ataque (esqueleto arquero y murciélago), proyectiles por corrutinas.",
        },
        {
          name: "Plataformas one-way",
          description:
            "Implementadas con Physics2D.IgnoreCollision y par trigger/collider.",
        },
        {
          name: "Dash con onda de agua",
          description:
            "Animación que impulsa al personaje como un boost para moverse rápido por el escenario, con su efecto visual de onda de agua.",
        },
        {
          name: "Escenarios y tilesets a mano",
          description:
            "Niveles armados a mano con tilesets y tilemap a partir de sprites de licencia permisiva; colisiones, plataformas y zonas de golpe integradas en el motor.",
        },
        {
          name: "Animación a mano",
          description:
            "Personajes animados frame a frame en Unity (Timeline) para ataque, movimiento y salto; prototipos en Blender.",
        },
        {
          name: "Cumyxel-code",
          description:
            "Repo público MIT con solo el código de gameplay: separa código del contenido y muestra mentalidad open-source.",
        },
      ],
    },
  },
  {
    id: "one-click-ti",
    title: "One Click Ti — PWA",
    category: "Full Stack / PWA",
    hook: "PWA full-stack para una empresa de TI: landing pública + sistema de gestión interno, instalable en dispositivos.",
    metric: "PWA instalable (manifest + service worker)",
    tags: ["Laravel", "Vue 3", "Inertia.js", "MySQL", "Laravel Breeze"],
    image: "/images/projects/oneclickti/proyectos.webp",
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
          label: "entregado a cliente real (sep - dic 2024)",
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
          src: "/images/projects/oneclickti/hero.webp",
          alt: "Landing pública de One Click Ti",
        },
        {
          src: "/images/projects/oneclickti/proyectos.webp",
          alt: "Sección de proyectos de la landing de One Click Ti",
        },
        {
          src: "/images/projects/oneclickti/contacto.webp",
          alt: "Sección de contacto de One Click Ti",
        },
        {
          src: "/images/projects/oneclickti/crud.webp",
          alt: "Sistema de gestión interno de One Click Ti",
        },
      ],
      cta: "¿Necesitas una PWA instalable que combine presencia digital y gestión interna? Hablemos.",
    },
    architecture: {
      name: "One Click Ti — PWA",
      description:
        "PWA full-stack por contrato: una sola aplicación instalable que integra landing pública y sistema de gestión interno.",
      children: [
        {
          name: "Landing pública",
          description:
            "Cara profesional de la empresa, conectada con el sistema interno.",
        },
        {
          name: "Sistema de gestión interno",
          description: "Administración de contenido y operación del negocio.",
        },
        {
          name: "Autenticación y roles",
          description: "Laravel Breeze con RBAC para separar accesos.",
        },
        {
          name: "PWA instalable",
          description:
            "Manifest + service worker; instalable y utilizable como app nativa.",
        },
        {
          name: "Arquitectura unificada",
          description:
            "Laravel (backend) + Vue 3 e Inertia.js (frontend) en un solo proyecto.",
        },
      ],
    },
  },
  {
    id: "autoshop",
    title: "AutoShop Taller",
    category: "Full Stack / PHP",
    hook: "Sitio full-stack para una empresa de servicios automotrices: landing pública + panel admin con CMS propio hecho desde cero en PHP puro.",
    metric: "De días a minutos en actualización de contenido",
    tags: ["PHP", "MySQL", "JavaScript", "Bootstrap", "HTML5", "CSS3"],
    image: "/images/projects/autoshop/main.webp",
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
          src: "/images/projects/autoshop/HomeCensured.webp",
          alt: "Landing pública de AutoShop",
        },
        {
          src: "/images/projects/autoshop/ServiciosCensured.webp",
          alt: "Sección de servicios de AutoShop",
        },
        {
          src: "/images/projects/autoshop/crud.webp",
          alt: "Panel de administración (CMS) de AutoShop",
        },
        {
          src: "/images/projects/autoshop/main.webp",
          alt: "Panel de administración (CMS) de AutoShop",
        },
      ],
      cta: "¿Te interesa ver cómo se construye un CMS a medida partiendo de cero, sin framework? Hablemos.",
    },
    architecture: {
      name: "AutoShop Taller",
      description:
        "Sitio full-stack para una empresa de servicios automotrices: landing pública + panel admin con CMS propio en PHP puro, sin framework.",
      children: [
        {
          name: "Landing pública",
          description: "Cara profesional del taller, orientada a captar clientes.",
        },
        {
          name: "Panel de administración + CMS a medida",
          description:
            "El staff gestiona servicios, promociones por calendario y consultas sin tocar código.",
        },
        {
          name: "Control de acceso por roles",
          description:
            "Niveles admin/staff para el equipo del taller, sin cuentas para clientes.",
        },
      ],
    },
  },
  {
    id: "color-highlight-v2",
    title: "Color Highlight v2",
    category: "Dev Tools / VS Code",
    hook: "Fork modernizado de la extensión de VS Code que resalta colores en el editor; reconstruido con TypeScript, esbuild y pnpm.",
    metric: "Render sin lag — debounce de 150ms",
    tags: ["TypeScript", "esbuild", "pnpm", "VS Code"],
    image: "/images/projects/color-highlight-v2/main.webp",
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
      gallery: [
        {
          src: "/images/projects/color-highlight-v2/demo-vscode.webp",
          alt: "Color Highlight v2 en VS Code",
        },
        {
          src: "/images/projects/color-highlight-v2/main.webp",
          alt: "Color Highlight v2 en VS Code",
        },
      ],
      cta: "¿Quieres ver cómo modernizo un proyecto open source existente sin romper su licencia? Hablemos.",
    },
    architecture: {
      name: "color-highlight-v2",
      description:
        "Fork modernizado de vscode-ext-color-highlight (GPL-3.0) reconstruido con TypeScript, esbuild y pnpm, con mejoras de rendimiento y accesibilidad.",
      children: [
        {
          name: "Stack moderno",
          description:
            "TypeScript (tipado), esbuild (build rápido), pnpm (dependencias modernas y reproducibles).",
        },
        {
          name: "Render sin lag",
          description:
            "Debounce de 150ms para no bloquear el editor al teclear.",
        },
        {
          name: "Auto-contraste WCAG",
          description:
            "El color del texto se ajusta para mantener legibilidad sobre cualquier color resaltado.",
        },
        {
          name: "Distribución store-agnostic",
          description:
            "Archivo .vsix instalable sin depender de una tienda concreta.",
        },
      ],
    },
  },
  {
    id: "funky-theme",
    title: "Funky Theme",
    category: "Dev Tools / VS Code",
    hook: "Tema oscuro semántico original compatible en cualquier VSCode-based editor y Terminales: 5 variantes derivadas de una paleta jerárquica definida en un único config (SSOT).",
    metric: "3.2k descargas en Open VSX",
    tags: ["VS Code", "Verified", "Open VSX", "Zed", "Token Colors", "Terminal UI"],
    image: "/images/projects/funky-theme/funky-theme-demo.webp",
    imageAlt: "Editor de VS Code mostrando funky-theme",
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
        "Tema oscuro semántico original bajo MIT, operado como producto multi-marketplace: cinco variantes desde una paleta jerárquica en un solo config (SSOT) para editores. Estable v3.0.0 en VS Code Marketplace y Open VSX con tracción real, Zed recién lanzado y expansión a terminales IA en beta. Instalación en un clic desde cada marketplace y variantes a medida para el usuario; SSOT, CI y SemVer estricto para el mantenimiento.",
      metrics: [
        {
          value: "3.2k",
          label: "descargas acumuladas en Open VSX (medido el 8 oct 2026)",
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
        "**Tracción validada:** **Verified Open VSX Publisher**; **3.2k descargas acumuladas** en Open VSX; **191 adquisiciones/30d** en VS Code Marketplace con **funnel 97.45%** (page views → installs) — posicionamiento SEO orgánico demostrado.",
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

export function getProjectById(id: string): Project | undefined {
  return projects.find((project) => project.id === id);
}

export function getFeaturedProjects(): Project[] {
  return projects.filter((project) => project.featured);
}
