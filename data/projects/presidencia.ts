// Ficha `presidencia` (Presidencia Municipal de Acámbaro) en el shape bilingue
// `ProjectL`.
//
// Copy ES VERBATIM: es el copy editorial ya auditado contra el repo real
// (docs/projects/candidatos/presidencia.md). No se reescribe ni se "mejora": la
// hoja `en` va al lado, nunca dentro del texto de origen.
//
// CONTRATO DE ORDEN (ver ProjectL.detail.metrics): `metrics[0]` es la metrica
// raiz del detail, y el orden de `metrics`, `role`, `solution` y `gallery` es
// contrato de layout (KpiGrid de 2 columnas, nodo raiz de la topologia). No
// reordenar al anadir el `en`.
//
// `metrics[2]` y `metrics[3]` son valores cualitativos, no cifras: "Trazable" y
// "PDF legal" describen una propiedad del sistema, asi que el EN traduce el
// significado ("Traceable", "Legal PDF") en vez de traducir la palabra suelta.

import { linkLabelCode, type ProjectL } from "./types";

export const presidencia: ProjectL = {
  id: "presidencia",
  title: {
    es: "Gestión de Apoyos Sociales",
    en: "Social Assistance Management",
  },
  category: {
    es: "Full Stack / GovTech",
    // "Full Stack" y "GovTech" ya son los terminos del sector en ingles:
    // traducirlos seria inventar jerga. Idéntico al ES a proposito.
    en: "Full Stack / GovTech",
  },
  hook: {
    es: "Plataforma web full-stack para digitalizar la gestión de solicitudes sociales en gobierno. Elimina procesos manuales, genera documentos legales y mejora la eficiencia operativa.",
    en: "Full-stack web platform to digitize the management of social assistance requests in government. It removes manual processes, generates legal documents and improves operational efficiency.",
  },
  metric: {
    es: "100% digitalización del flujo de solicitudes",
    en: "100% digitization of the request workflow",
  },
  // Stack names: no se traducen.
  tags: [
    "Next.js",
    "React",
    "TypeScript",
    "PostgreSQL",
    "Prisma",
    "Tailwind CSS",
  ],
  image: "/images/projects/presidencia-acambaro/presidencia-demo.webp",
  imageAlt: {
    es: "Dashboard de métricas y gestión de solicitudes del Sistema de Apoyos Sociales",
    en: "Metrics dashboard and request management of the Social Assistance System",
  },
  featured: true,
  links: [
    {
      label: linkLabelCode,
      kind: "code",
      url: "https://github.com/MaxGB23/Presidencia-Municipal-Acambaro",
      external: true,
    },
  ],
  detail: {
    headline: {
      es: "Digitalización, Transparencia y Eficiencia Gubernamental",
      en: "Digitization, Transparency and Government Efficiency",
    },
    summary: {
      es: "Plataforma full-stack escalable construida para la Presidencia Municipal de Acámbaro, desarrollada durante una estadía profesional (enero – abril 2025). Lideré su creación para automatizar el ciclo completo de los apoyos sociales: digitalización total de los flujos de aprobación y paneles analíticos en tiempo real para la toma de decisiones institucionales.",
      // La copia ES no lleva pares `**`: el EN tampoco los inventa (docs/i18n.md:25).
      en: "Scalable full-stack platform built for the Acámbaro Municipal Presidency, developed during a professional internship (January – April 2025). I led its creation to automate the full lifecycle of social assistance: complete digitization of the approval flows and real-time analytics panels for institutional decision-making.",
    },
    metrics: [
      {
        // metrics[0] = metrica RAIZ del detail (nodo raiz de la topologia).
        value: {
          es: "100%",
          // Cifra pura: se traduce por identidad (no hay palabra que traducir).
          en: "100%",
        },
        label: {
          es: "digitalización del flujo de solicitudes de apoyo social",
          en: "digitization of the social assistance request workflow",
        },
      },
      {
        value: {
          es: "4 meses",
          en: "4 months",
        },
        label: {
          es: "de cero a producción en gobierno (estadía ene-abr 2025)",
          en: "from zero to production in government (Jan–Apr 2025 internship)",
        },
      },
      {
        // Valor cualitativo, no cifra: se traduce el significado.
        value: {
          es: "Trazable",
          en: "Traceable",
        },
        label: {
          es: "cada solicitud registra quién la modificó",
          en: "every request records who modified it",
        },
      },
      {
        // Valor cualitativo, no cifra: se traduce el significado.
        value: {
          es: "PDF legal",
          en: "Legal PDF",
        },
        label: {
          es: "auto-generado del expediente y listo para imprimir; sin Word manual, solo faltan las firmas",
          en: "auto-generated from the case file and ready to print; no manual Word, only the signatures are missing",
        },
      },
    ],
    problem: {
      es: "El gobierno municipal dependía de procesos manuales intensivos en papel para gestionar las solicitudes ciudadanas. Esto ocasionaba tiempos de respuesta lentos, pérdida de trazabilidad administrativa y una carencia total de reportes o métricas para evaluar la asignación de recursos y el rendimiento institucional.",
      en: "Municipal government relied on paper-heavy manual processes to handle citizen requests. That produced slow response times, loss of administrative traceability and a total lack of reports or metrics to evaluate resource allocation and institutional performance.",
    },
    role: [
      {
        es: "Lideré el desarrollo de la plataforma completa: arquitectura, planificación, implementación y despliegue.",
        en: "I led the development of the complete platform: architecture, planning, implementation and deployment.",
      },
      {
        es: "Trabajé en un equipo de 2 personas bajo Scrum y Jira, a cargo del desarrollo del software durante la estadía universitaria.",
        en: "I worked in a 2-person team under Scrum and Jira, in charge of the software development during the university internship.",
      },
      {
        es: "Diseñé y desarrollé la aplicación full-stack con Next.js, TypeScript, PostgreSQL y Prisma.",
        en: "Designed and developed the full-stack application with Next.js, TypeScript, PostgreSQL and Prisma.",
      },
      {
        es: "Implementé autenticación y control de acceso por roles (RBAC) por departamento.",
        en: "Implemented authentication and per-department role-based access control (RBAC).",
      },
      {
        es: "Construí dashboards interactivos con Recharts y la generación dinámica de PDFs legales con datos autocompletados y espacios de firma para el ciudadano y la autoridad encargada.",
        en: "Built interactive dashboards with Recharts and dynamic generation of legal PDFs with auto-filled data and signature blocks for the citizen and the responsible authority.",
      },
    ],
    solution: [
      {
        // Cada `**Label:**` abre y cierra aqui, igual que en el ES.
        es: "**Dashboard estadístico:** visualización interactiva con Recharts para monitorear tendencias, volumen de solicitudes y KPIs institucionales.",
        en: "**Statistics dashboard:** interactive visualization with Recharts to monitor trends, request volume and institutional KPIs.",
      },
      {
        es: "**Gestión avanzada de solicitudes:** seguimiento de extremo a extremo con filtros (estado, departamento, categoría del apoyo) y asignación controlada a departamentos. Cada solicitud concentra los datos del ciudadano y la subcategoría del apoyo, y la categoría orienta qué departamento debe gestionarla.",
        en: "**Advanced request management:** end-to-end tracking with filters (status, department, support category) and controlled assignment to departments. Each request holds the citizen's data and the support subcategory, and the category determines which department handles it.",
      },
      {
        es: "**Módulo de documentos legales:** generación automatizada de PDFs con validez legal y datos dinámicos pre-cargados del expediente del ciudadano, con espacios de firma para el ciudadano y la autoridad encargada.",
        en: "**Legal documents module:** automated generation of legally valid PDFs with dynamic data pre-loaded from the citizen's case file, with signature blocks for the citizen and the responsible authority.",
      },
      {
        es: "**Seguridad y control de acceso (RBAC):** segmentación de opciones y vistas según roles (administradores, coordinadores departamentales), con validación en frontend, server actions y middleware.",
        en: "**Security and access control (RBAC):** segregation of options and views by role (administrators, department coordinators), with validation in the frontend, server actions and middleware.",
      },
      {
        es: "**Administración de usuarios:** CRUD de usuarios con roles y departamentos, reservado al rol admin.",
        en: "**User administration:** user CRUD with roles and departments, restricted to the admin role.",
      },
      {
        es: "**Gestión dinámica institucional:** los datos precargados del PDF (logotipo, presidente municipal y cargos clave) se editan desde un CRUD para futuros documentos, sin intervenir el código base, pensado para los cambios de administración.",
        en: "**Dynamic institutional data:** the data pre-loaded into the PDF (logo, municipal president and key positions) is edited from a CRUD for future documents, with no change to the base code, designed for administration changes.",
      },
    ],
    // Etiqueta traducida, nombre de stack intacto.
    stack: [
      {
        // "Framework" ya es la palabra inglesa: identidad a proposito.
        es: "Framework: Next.js, React",
        en: "Framework: Next.js, React",
      },
      {
        es: "Lenguaje: TypeScript",
        en: "Language: TypeScript",
      },
      {
        es: "Base de datos: PostgreSQL (NeonDB)",
        en: "Database: PostgreSQL (NeonDB)",
      },
      {
        // "ORM" es el acronimo ingles del patron: identidad a proposito.
        es: "ORM: Prisma",
        en: "ORM: Prisma",
      },
      {
        es: "Autenticación: NextAuth",
        en: "Authentication: NextAuth",
      },
      {
        es: "UI / Componentes: Tailwind CSS, Shadcn UI, Recharts",
        en: "UI / Components: Tailwind CSS, Shadcn UI, Recharts",
      },
      {
        es: "Despliegue y gestión: Vercel, Scrum + Jira",
        en: "Deployment and management: Vercel, Scrum + Jira",
      },
    ],
    gallery: [
      {
        src: "/images/projects/presidencia-acambaro/login.webp",
        alt: {
          es: "Panel de métricas del Sistema de Apoyos Sociales (tema claro)",
          en: "Metrics panel of the Social Assistance System (light theme)",
        },
      },
      {
        src: "/images/projects/presidencia-acambaro/solicitudes.webp",
        alt: {
          es: "Módulo de solicitudes del Sistema de Apoyos Sociales",
          en: "Requests module of the Social Assistance System",
        },
      },
      {
        src: "/images/projects/presidencia-acambaro/estadisticas.webp",
        alt: {
          es: "Panel de métricas y estadísticas del Sistema de Apoyos Sociales",
          en: "Metrics and statistics panel of the Social Assistance System",
        },
      },
      {
        src: "/images/projects/presidencia-acambaro/generacion-pdf.webp",
        alt: {
          es: "Generación de reportes en PDF del Sistema de Apoyos Sociales",
          en: "PDF report generation in the Social Assistance System",
        },
      },
    ],
    cta: {
      es: "¿Buscas digitalizar procesos administrativos complejos o requieres software seguro a medida? Hablemos.",
      en: "Looking to digitize complex administrative processes or need secure custom software? Let's talk.",
    },
  },
  architecture: {
    name: {
      es: "Gestión de Apoyos Sociales",
      en: "Social Assistance Management",
    },
    description: {
      es: "Arquitectura orientada a la persistencia y la configuración dinámica: las plantillas y opciones administrativas se adaptan durante cambios de periodo de gobierno, nuevos departamentos o tipos de apoyo, sin refactorizar el código base.",
      en: "Architecture built around persistence and dynamic configuration: templates and administrative options adapt across government periods, new departments or support types, with no refactor of the base code.",
    },
    children: [
      {
        name: {
          es: "Dashboard estadístico",
          en: "Statistics dashboard",
        },
        description: {
          es: "Visualización interactiva con Recharts para monitorear tendencias, volumen de solicitudes y KPIs institucionales.",
          en: "Interactive visualization with Recharts to monitor trends, request volume and institutional KPIs.",
        },
      },
      {
        name: {
          es: "Gestión avanzada de solicitudes",
          en: "Advanced request management",
        },
        description: {
          es: "Seguimiento de extremo a extremo con filtros (estado, departamento, categoría del apoyo) y asignación controlada a departamentos.",
          en: "End-to-end tracking with filters (status, department, support category) and controlled assignment to departments.",
        },
        children: [
          {
            name: {
              es: "Filtros por estado, departamento y categoría del apoyo",
              en: "Filters by status, department and support category",
            },
          },
          {
            name: {
              es: "Asignación controlada a departamentos",
              en: "Controlled assignment to departments",
            },
          },
        ],
      },
      {
        name: {
          es: "Módulo de documentos legales",
          en: "Legal documents module",
        },
        description: {
          es: "Generación automatizada de PDFs con validez legal y datos dinámicos pre-cargados del expediente del ciudadano, con espacios de firma para el ciudadano y la autoridad encargada.",
          en: "Automated generation of legally valid PDFs with dynamic data pre-loaded from the citizen's case file, with signature blocks for the citizen and the responsible authority.",
        },
        children: [
          {
            name: {
              es: "Espacios de firma (ciudadano y autoridad encargada)",
              en: "Signature blocks (citizen and responsible authority)",
            },
          },
          {
            name: {
              es: "Datos autocompletados del expediente",
              en: "Auto-filled case file data",
            },
          },
        ],
      },
      {
        name: {
          es: "Seguridad y control de acceso (RBAC)",
          en: "Security and access control (RBAC)",
        },
        description: {
          es: "Segmentación de opciones y vistas según roles (administradores, coordinadores departamentales), con validación en frontend, server actions y middleware.",
          en: "Segregation of options and views by role (administrators, department coordinators), with validation in the frontend, server actions and middleware.",
        },
      },
      {
        name: {
          es: "Administración de usuarios",
          en: "User administration",
        },
        description: {
          es: "CRUD de usuarios con asignación de roles y departamentos; acceso restringido a administradores.",
          en: "User CRUD with role and department assignment; access restricted to administrators.",
        },
      },
      {
        name: {
          es: "Gestión dinámica institucional",
          en: "Dynamic institutional data",
        },
        description: {
          es: "Los datos precargados del PDF (logotipo, presidente municipal y cargos clave) se editan desde un CRUD para futuros documentos, sin intervenir el código base, pensado para los cambios de administración.",
          en: "The data pre-loaded into the PDF (logo, municipal president and key positions) is edited from a CRUD for future documents, with no change to the base code, designed for administration changes.",
        },
      },
    ],
  },
};