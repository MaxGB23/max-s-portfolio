// Ficha `caf` (Clinical Management System) en el shape bilingue `ProjectL`.
//
// Copy ES VERBATIM: es el copy editorial ya auditado contra el repo real
// (docs/projects/candidatos/caf.md). No se reescribe ni se "mejora": la hoja
// `en` va al lado, nunca dentro del texto de origen.
//
// Fuente editorial ES: docs/projects/candidatos/caf.md
// Repos: github.com/MaxGB23/centro-caf, github.com/MaxGB23/centro-caf-landing-page
//
// CONTRATO DE ORDEN (ver ProjectL.detail.metrics): `metrics[0]` es la metrica
// raiz del detail, y el orden de `metrics`, `role`, `solution` y `gallery` es
// contrato de layout (KpiGrid de 2 columnas, nodo raiz de la topologia). No
// reordenar al anadir el `en`.

import { linkLabelApp, linkLabelCode, linkLabelLanding, type ProjectL } from "./types";

export const caf: ProjectL = {
  id: "caf",
  title: {
    es: "Sistema de Gestión Clínica",
    en: "Clinical Management System",
  },
  category: {
    es: "Full Stack / HealthTech",
    // "Full Stack" y "HealthTech" ya son los terminos del sector en ingles:
    // traducirlos seria inventar jerga. Idéntico al ES a proposito.
    en: "Full Stack / HealthTech",
  },
  hook: {
    es: "Plataforma web full-stack en producción para la gestión integral de citas, pacientes y control de pagos en centros de salud.",
    en: "Production full-stack web platform for end-to-end management of appointments, patients and payments across healthcare centers.",
  },
  metric: {
    es: "+10 meses en producción sin caídas",
    en: "+10 months in production with zero outages",
  },
  // Stack names: no se traducen.
  tags: ["Next.js", "React", "TypeScript", "PostgreSQL", "Prisma", "Tailwind CSS"],
  image: "/images/projects/caf/caf-demo.webp",
  imageAlt: {
    es: "Dashboard principal y agenda del Sistema de Gestión Clínica",
    en: "Main dashboard and appointment calendar of the Clinical Management System",
  },
  featured: true,
  links: [
    {
      label: linkLabelCode,
      kind: "code",
      url: "https://github.com/MaxGB23/centro-caf",
      external: true,
    },
    {
      label: {
        es: "Ver código de la landing",
        en: "View landing page code",
      },
      kind: "code",
      url: "https://github.com/MaxGB23/centro-caf-landing-page",
      external: true,
    },
    {
      label: linkLabelLanding,
      kind: "landing",
      url: "https://centrocafacambaro.vercel.app",
      external: true,
    },
    {
      label: linkLabelApp,
      kind: "app",
      url: "https://caf-usage-test.vercel.app/dashboard",
      external: true,
    },
  ],
  detail: {
    headline: {
      es: "Gestión Clínica Inteligente y Escalable",
      en: "Smart, Scalable Clinical Management",
    },
    summary: {
      es: "Plataforma web full-stack construida desde cero que reemplaza el uso de Excel y agendas manuales en un centro real de fisioterapia y rehabilitación. En uso diario por el staff médico con más de **10 meses en producción sin una sola caída**, incluso durante major releases con cambios críticos en la base de datos.",
      // Un par `**` que abre y cierra la MISMA claim que en el ES (docs/i18n.md:25).
      en: "Full-stack web platform built from scratch that replaced Excel and manual calendars in a real physiotherapy and rehabilitation center. Used daily by clinical staff for over **10 months in production with zero outages**, including through major releases with critical database changes.",
    },
    metrics: [
      {
        // metrics[0] = metrica RAIZ del detail (nodo raiz de la topologia).
        value: {
          es: "+10 meses",
          en: "+10 months",
        },
        label: {
          es: "en producción sin caídas, incluyendo major releases",
          en: "in production with no outages, including major releases",
        },
      },
      {
        value: {
          es: "100%",
          // Cifra pura: se traduce por identidad (no hay palabra que traducir).
          en: "100%",
        },
        label: {
          es: "uptime: el cliente nunca ha reportado una caída",
          en: "uptime: the client has never reported an outage",
        },
      },
      {
        value: {
          es: "-40%",
          // Cifra pura: se traduce por identidad.
          en: "-40%",
        },
        label: {
          es: "latencia de recuperación de registros de pacientes (estimada sobre el salto a índice + cache())",
          en: "patient record retrieval latency (estimated from the switch to index scan + cache())",
        },
      },
      {
        value: {
          es: "En uso diario",
          en: "In daily use",
        },
        label: {
          es: "por staff real en clínica en producción (admin + fisios)",
          en: "by real clinic staff in production (admins + physiotherapists)",
        },
      },
    ],
    problem: {
      es: "Las clínicas pequeñas y medianas dependen de herramientas genéricas, procesos manuales en papel o múltiples aplicaciones desconectadas para agendar, llevar historiales médicos y cobrar. Esto genera pérdidas de tiempo, dobles reservas y descontrol financiero. No existía una solución a medida accesible para centros que trabajan por sesiones o paquetes.",
      en: "Small and mid-sized clinics depend on generic tools, paper-based manual processes or several disconnected applications to schedule appointments, keep medical records and bill patients. That wastes time, causes double bookings and leaves finances out of control. No affordable custom solution existed for clinics that bill by session or package.",
    },
    role: [
      {
        es: "Diseñé un sistema modular por features usando Next.js, TypeScript y Prisma para mejorar mantenibilidad y acelerar la entrega de funcionalidades.",
        en: "Designed a feature-modular system with Next.js, TypeScript and Prisma to improve maintainability and speed up feature delivery.",
      },
      {
        es: "Implementé control de acceso por roles (Admin, Editor, Viewer) con doble perímetro: layouts de servidor exigen sesión y rol antes de renderizar y cada Server Action valida con guards; sin registro público (el admin crea las cuentas y el rol no se fija desde el cliente) y sin middleware deliberado, porque el Edge no puede validar sesiones de base de datos.",
        en: "Implemented role-based access control (Admin, Editor, Viewer) with a double perimeter: server layouts require a session and role before rendering, and every Server Action validates through guards. No public sign-up (admins create the accounts and the role is never set from the client) and deliberately no middleware, because the Edge cannot validate database sessions.",
      },
      {
        es: "Reduje un 40% la latencia de recuperación de registros con un índice en `sessionDate` y caching server-side con `cache()` de React. La cifra es una estimación conservadora del salto de seq scan a index scan, no una medición en producción.",
        en: "Cut record retrieval latency by 40% with an index on `sessionDate` and server-side caching with React `cache()`. The figure is a conservative estimate of the jump from seq scan to index scan, not a production measurement.",
      },
      {
        // Los mensajes de error siguen en español en el producto: es un hecho de
        // la app clinica, no una descripcion del copy. El EN lo dice igual.
        es: "Validé cada mutación con Zod en el servidor antes de cualquier I/O, con resultado tipado y errores centralizados en español; los conflictos de agenda responden advertencia confirmable en dos pasos, y el frontend solo muestra mensajes amigables, nunca errores crudos del backend.",
        en: "Validated every mutation with Zod on the server before any I/O, with a typed result and centralized error messages kept in Spanish. Schedule conflicts return a two-step confirmable warning, and the frontend only shows friendly messages, never raw backend errors.",
      },
      {
        es: "Apliqué cero confianza en el input: cupo del paquete, pendiente única y choques de horario se verifican en el servidor, y hasta el ID para revalidar se lee de la base de datos, nunca del cliente.",
        en: "Applied zero trust to input: package quota, the single pending appointment and schedule clashes are verified on the server, and even the ID used for revalidation is read from the database, never from the client.",
      },
      {
        es: "Usé SQL crudo solo con jaula: valores siempre como parámetros y fragmentos construidos desde una unión cerrada, sin camino del input al query.",
        en: "Used raw SQL only inside a cage: values always bound as parameters and fragments built from a closed union, with no path from input to query.",
      },
      {
        es: "Blindé la UX ante fallos: los boundaries traducen errores de auth a pantallas accionables y los 404 contextuales devuelven al dashboard, nunca una pantalla en blanco.",
        en: "Hardened the UX against failures: boundaries translate auth errors into actionable screens, and contextual 404s route back to the dashboard instead of a blank screen.",
      },
      {
        es: "Migré los nombres y precios que vivían hardcodeados en un combobox a una UI de paquetes CRUD que los actualiza, con migraciones de Prisma sobre datos existentes. El cliente necesitaba subir precios por la inflación del país y los valores hardcodeados lo impedían. Las migraciones se aplicaron en producción sin un solo incidente de datos: ningún paquete legacy se rompió.",
        en: "Migrated the names and prices that were hardcoded in a combobox into a CRUD package UI that updates them, with Prisma migrations over the existing data. The client needed to raise prices because of inflation in the country, and the hardcoded values made that impossible. The migrations were applied in production without a single data incident: no legacy package broke.",
      },
      {
        es: "En paralelo descarté una branch completa que no cumplía los estándares del proyecto, antes de que llegara a producción.",
        en: "In parallel I discarded an entire branch that did not meet the project standards, before it reached production.",
      },
      {
        es: "Desplegué y mantengo la plataforma en Vercel con NeonDB (PostgreSQL) hace más de 10 meses, sin que el cliente haya reportado una sola caída.",
        en: "Deployed and maintain the platform on Vercel with NeonDB (PostgreSQL) for over 10 months, without the client reporting a single outage.",
      },
      {
        es: "Desarrollé la landing page pública integrada con el sistema interno; estable en uptime y generando contactos de nuevos pacientes.",
        en: "Built the public landing page integrated with the internal system: stable uptime and generating new patient inquiries.",
      },
    ],
    solution: [
      {
        // Cada `**Label:**` abre y cierra aqui, igual que en el ES.
        es: "**Agenda inteligente:** calendario interactivo con prevención automática de conflictos y control de sesiones (pendiente, asistida, cancelada).",
        en: "**Smart scheduling:** interactive calendar with automatic conflict prevention and session tracking (pending, attended, canceled).",
      },
      {
        es: "**Expediente electrónico:** alta y búsqueda rápida de pacientes, historial de sesiones y pagos, seguimiento individual.",
        en: "**Electronic records:** patient registration and fast search, session and payment history, individual tracking.",
      },
      {
        es: "**Módulo financiero:** venta de paquetes de sesiones, balance por paciente y registro de ingresos. Los paquetes se administran desde una UI CRUD en lugar de valores hardcodeados, lo que permite actualizar precios sin desplegar — necesario para responder a la inflación del mercado.",
        en: "**Financial module:** session package sales, per-patient balance and income tracking. Packages are managed from a CRUD UI instead of hardcoded values, so prices can be updated without a deploy — necessary to respond to market inflation.",
      },
      {
        es: "**Panel de control (dashboard):** analíticas de ingresos mensuales, pacientes activos, ganancias y métricas operativas, con filtros por periodo (30 días, 3 meses, 1 año e histórico), cache con refresh manual y tarjetas + gráficos. El histórico usa cache extendido por costo.",
        en: "**Dashboard:** monthly income analytics, active patients, profits and operational metrics, with period filters (30 days, 3 months, 1 year and all time), cache with manual refresh and cards + charts. History uses extended cache for cost.",
      },
      {
        es: "**Landing page pública:** optimizada para SEO, enfocada a captación de nuevos pacientes e integrada con el sistema interno.",
        en: "**Public landing page:** SEO-optimized, focused on attracting new patients and integrated with the internal system.",
      },
      {
        es: "**Seguridad y roles:** doble perímetro con layouts y guards por rol (Admin, Editor, Viewer), loop cerrado sin registro público y autorización siempre en el servidor; el cliente solo presenta, nunca autoriza.",
        en: "**Security and roles:** double perimeter with layouts and per-role guards (Admin, Editor, Viewer), a closed loop with no public sign-up and authorization always on the server; the client only presents, never authorizes.",
      },
      {
        es: "**Perfil del usuario:** edición de nombre y contraseña desde el propio perfil, con vista de tipo red social (foto de perfil y portada). El correo queda bloqueado para el usuario (input deshabilitado) y su cambio se solicita a un administrador, preservando la trazabilidad de la cuenta.",
        en: "**User profile:** name and password editing from the profile itself, with a social-network-style view (profile picture and cover). Email stays locked for the user (disabled input) and any change is requested from an admin, preserving account traceability.",
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
        es: "Estilos: Tailwind CSS",
        en: "Styling: Tailwind CSS",
      },
      {
        es: "Despliegue: Vercel",
        en: "Deployment: Vercel",
      },
    ],
    gallery: [
      {
        src: "/images/projects/caf/editar_profile.webp",
        alt: {
          es: "Edición de perfil de usuario",
          en: "User profile editing",
        },
      },
      {
        src: "/images/projects/caf/dashboard-light.webp",
        alt: {
          es: "Dashboard Principal",
          en: "Main dashboard",
        },
      },
      {
        src: "/images/projects/caf/agenda-light.webp",
        alt: {
          es: "Agenda de citas del Sistema de Gestión Clínica",
          en: "Appointment calendar of the Clinical Management System",
        },
      },
      {
        src: "/images/projects/caf/analiticas-caf.webp",
        alt: {
          es: "Panel de analíticas adicional del Sistema de Gestión Clínica",
          en: "Additional analytics panel of the Clinical Management System",
        },
      },
    ],
    cta: {
      es: "¿Buscas modernizar tu clínica o necesitas un sistema a medida? Hablemos.",
      en: "Looking to modernize your clinic or need a custom system? Let's talk.",
    },
  },
  architecture: {
    name: {
      es: "Sistema de Gestión Clínica",
      en: "Clinical Management System",
    },
    description: {
      es: "Plataforma de gestión clínica en producción con arquitectura modular por features: módulos verticales por dominio (agenda, clientes, paquetes, pagos, sesiones, usuarios) sobre un núcleo transversal de autenticación, base de datos y errores.",
      en: "Clinical management platform in production with feature-modular architecture: vertical domain modules (scheduling, clients, packages, payments, sessions, users) on top of a cross-cutting core for authentication, database and errors.",
    },
    children: [
      {
        name: {
          es: "Agenda inteligente",
          en: "Smart scheduling",
        },
        description: {
          es: "Calendario interactivo con prevención automática de conflictos y control de sesiones (pendiente, asistida, cancelada).",
          en: "Interactive calendar with automatic conflict prevention and session tracking (pending, attended, canceled).",
        },
        children: [
          {
            name: {
              es: "Prevención automática de conflictos",
              en: "Automatic conflict prevention",
            },
          },
          {
            name: {
              es: "Control de sesiones",
              en: "Session tracking",
            },
          },
        ],
      },
      {
        name: {
          es: "Expediente electrónico",
          en: "Electronic records",
        },
        description: {
          es: "Alta y búsqueda rápida de pacientes, historial de sesiones y pagos, seguimiento individual.",
          en: "Patient registration and fast search, session and payment history, individual tracking.",
        },
      },
      {
        name: {
          es: "Módulo financiero",
          en: "Financial module",
        },
        description: {
          es: "Venta de paquetes de sesiones, balance por paciente y registro de ingresos. Los paquetes y sus precios se administran desde una UI CRUD, así que subirlos no exige desplegar código.",
          en: "Session package sales, per-patient balance and income tracking. Packages and their prices are managed from a CRUD UI, so raising them does not require a code deploy.",
        },
        children: [
          {
            name: {
              es: "Paquetes de sesiones",
              en: "Session packages",
            },
          },
          {
            name: {
              es: "Balance por paciente",
              en: "Per-patient balance",
            },
          },
          {
            name: {
              es: "Registro de ingresos",
              en: "Income tracking",
            },
          },
          {
            name: {
              es: "Paquetes y precios editables sin deploy",
              en: "Packages and prices editable without a deploy",
            },
          },
        ],
      },
      {
        name: {
          es: "Panel de control (dashboard)",
          en: "Dashboard",
        },
        description: {
          es: "Analíticas de ingresos mensuales, pacientes activos, ganancias y métricas operativas, con tarjetas y gráficos.",
          en: "Monthly income analytics, active patients, profits and operational metrics, with cards and charts.",
        },
        children: [
          {
            name: {
              es: "Analíticas mensuales",
              en: "Monthly analytics",
            },
          },
          {
            name: {
              es: "Filtros por periodo (30 días, 3 meses, 1 año e histórico)",
              en: "Period filters (30 days, 3 months, 1 year and all time)",
            },
          },
          {
            name: {
              es: "Cache con refresh manual",
              en: "Cache with manual refresh",
            },
          },
        ],
      },
      {
        name: {
          es: "Seguridad y roles",
          en: "Security and roles",
        },
        description: {
          es: "Doble perímetro con layouts de servidor y guards por rol: la autorización se resuelve siempre en el servidor y el cliente solo presenta, nunca autoriza.",
          en: "Double perimeter with server layouts and per-role guards: authorization is always resolved on the server, and the client only presents, never authorizes.",
        },
        children: [
          {
            name: {
              es: "Roles: Admin, Editor y Viewer",
              en: "Roles: Admin, Editor and Viewer",
            },
          },
          {
            name: {
              es: "Layouts de servidor exigen sesión y rol antes de renderizar",
              en: "Server layouts require a session and role before rendering",
            },
          },
          {
            name: {
              es: "Guards en cada Server Action y query sensible",
              en: "Guards on every Server Action and sensitive query",
            },
          },
          {
            name: {
              es: "Sin registro público: el admin crea las cuentas y el rol no se fija desde el cliente",
              en: "No public sign-up: admins create the accounts and the role is never set from the client",
            },
          },
        ],
      },
      {
        name: {
          es: "Endurecimiento por capas",
          en: "Layered hardening",
        },
        description: {
          es: "Validación y fallo seguro en cada mutación: nada se confía desde el cliente y ningún error crudo llega al usuario.",
          en: "Validation and safe failure on every mutation: nothing is trusted from the client, and no raw error reaches the user.",
        },
        children: [
          {
            name: {
              es: "Zod con safeParse antes de cualquier I/O",
              en: "Zod safeParse before any I/O",
            },
          },
          {
            name: {
              es: "Cupo, cita pendiente y choques de horario verificados en el servidor",
              en: "Quota, pending appointment and schedule clashes verified on the server",
            },
          },
          {
            name: {
              es: "SQL solo con parámetros y fragmentos de una unión cerrada",
              en: "SQL with bound parameters only, fragments from a closed union",
            },
          },
          {
            name: {
              es: "Errores de auth y 404 contextuales con salida accionable",
              en: "Auth errors and contextual 404s with an actionable way out",
            },
          },
        ],
      },
      {
        name: {
          es: "Estructura modular por capas",
          en: "Layered modular structure",
        },
        description: {
          es: "Routing, dominio y transversalidad separados, para que una regla clínica se cambie en un solo lugar.",
          en: "Routing, domain logic and cross-cutting concerns kept apart, so a clinical rule changes in a single place.",
        },
        children: [
          {
            name: {
              es: "app: solo routing, layouts y páginas, sin lógica de negocio",
              en: "app: routing, layouts and pages only, no business logic",
            },
          },
          {
            name: {
              es: "modules: vertical por dominio (actions, schemas, queries, componentes)",
              en: "modules: vertical per domain (actions, schemas, queries, components)",
            },
          },
          {
            name: {
              es: "core: transversal (auth, db, errores, proveedores, UI)",
              en: "core: cross-cutting (auth, db, errors, providers, UI)",
            },
          },
          {
            name: {
              es: "shared: utilidades usadas por dos o más módulos",
              en: "shared: utilities used by two or more modules",
            },
          },
        ],
      },
      {
        name: {
          es: "Perfil del usuario",
          en: "User profile",
        },
        description: {
          es: "El usuario edita su nombre y contraseña desde su perfil, con vista de foto de perfil y portada. El correo queda bloqueado y su cambio se solicita a un administrador.",
          en: "Users edit their name and password from their profile, with a profile picture and cover view. Email stays locked and any change is requested from an admin.",
        },
      },
      {
        name: {
          es: "Landing page pública",
          en: "Public landing page",
        },
        description: {
          es: "Optimizada para SEO, enfocada a captación de nuevos pacientes e integrada con el sistema interno.",
          en: "SEO-optimized, focused on attracting new patients and integrated with the internal system.",
        },
      },
    ],
  },
};