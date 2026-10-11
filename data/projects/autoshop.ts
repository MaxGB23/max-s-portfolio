// Ficha `autoshop` (AutoShop Taller) en el shape bilingue `ProjectL`.
//
// Copy ES VERBATIM: es el copy editorial ya auditado contra el repo real
// (docs/projects/candidatos/autoshop.md). No se reescribe ni se "mejora": la
// hoja `en` va al lado, nunca dentro del texto de origen.
//
// CONTRATO DE ORDEN (ver ProjectL.detail.metrics): `metrics[0]` es la metrica
// raiz del detail, y el orden de `metrics`, `role`, `solution` y `gallery` es
// contrato de layout (KpiGrid de 2 columnas, nodo raiz de la topologia). No
// reordenar al anadir el `en`.
//
// VALORES CUALITATIVOS: `metrics[2]` ("Sin frameworks") y `metrics[3]` ("2
// niveles de acceso") NO son cifras: describen una propiedad del sistema, asi
// que el EN traduce el significado ("No frameworks") en vez de traducir la
// palabra suelta. El numero de `metrics[3]` ("2") si se conserva, porque es la
// cifra que la KpiGrid muestra en grande.

import type { ProjectL } from "./types";

export const autoshop: ProjectL = {
  id: "autoshop",
  title: {
    // Nombre del taller: identidad a proposito.
    es: "AutoShop Taller",
    en: "AutoShop Taller",
  },
  category: {
    // "Full Stack" ya es el termino del sector en ingles: identidad a proposito.
    es: "Full Stack / PHP",
    en: "Full Stack / PHP",
  },
  hook: {
    es: "Sitio web y panel de administración para un taller de servicios automotrices: el personal gestiona servicios, promociones por calendario y consultas sin depender de un desarrollador.",
    en: "Website and admin panel for an automotive service shop: staff manage services, calendar-based promotions and inquiries without depending on a developer.",
  },
  metric: {
    es: "CMS de gestión por módulos, sin código",
    en: "Modular management CMS, no code",
  },
  // Stack names: no se traducen.
  tags: ["PHP", "MySQL", "JavaScript", "Bootstrap", "HTML5"],
  image: "/images/projects/autoshop/main.webp",
  imageAlt: {
    es: "Hero de la landing de AutoShop Taller: logo, eslogan y navegación principal",
    en: "Hero of the AutoShop Taller landing page: logo, tagline and main navigation",
  },
  links: [],
  detail: {
    headline: {
      es: "El taller gestiona sus servicios, promociones y consultas sin depender de un desarrollador",
      en: "The shop manages its services, promotions and inquiries without depending on a developer",
    },
    summary: {
      es: "Sitio web full-stack para un taller de servicios automotrices en Maravatío, Michoacán (prácticas profesionales, may – ago 2023). El taller no tenía presencia digital profesional ni forma de actualizar su propio contenido: cambiar un servicio o publicar una promoción requería abrir un ticket y esperar días. Construí la landing pública y un panel de administración con el que el personal gestiona servicios, promociones por calendario y consultas por sí mismo.",
      // La copia ES no lleva pares `**`: el EN tampoco los inventa (docs/i18n.md:25).
      en: "Full-stack website for an automotive service shop in Maravatío, Michoacán (professional internship, May – Aug 2023). The shop had no professional digital presence and no way to update its own content: changing a service or publishing a promotion meant opening a ticket and waiting days. I built the public landing page and an admin panel that lets staff manage services, calendar-based promotions and inquiries on their own.",
    },
    metrics: [
      {
        // metrics[0] = metrica RAIZ del detail (nodo raiz de la topologia).
        value: {
          // Cifra pura: se traduce por identidad (no hay palabra que traducir).
          es: "3",
          en: "3",
        },
        label: {
          es: "módulos de gestión en el panel: servicios, promociones por calendario y consultas",
          en: "management modules in the panel: services, calendar-based promotions and inquiries",
        },
      },
      {
        value: {
          es: "4 meses",
          en: "4 months",
        },
        label: {
          es: "de proyecto en producción para un taller real (may – ago 2023)",
          en: "of project in production for a real shop (May – Aug 2023)",
        },
      },
      {
        // Valor cualitativo, no cifra: se traduce el significado.
        value: {
          es: "Sin frameworks",
          en: "No frameworks",
        },
        label: {
          es: "PHP, MySQL y JavaScript escritos a mano: SQL, sesiones y enrutado sin abstracciones que oculten el comportamiento",
          en: "hand-written PHP, MySQL and JavaScript: SQL, sessions and routing with no abstractions hiding the behavior",
        },
      },
      {
        value: {
          // Cifra pura: identidad.
          es: "2",
          en: "2",
        },
        label: {
          es: "niveles de acceso (admin / staff), sin cuentas para clientes",
          en: "access levels (admin / staff), with no customer accounts",
        },
      },
    ],
    problem: {
      es: "El taller necesitaba dos cosas: una presencia pública profesional que le llamara clientes y una herramienta interna para actualizar su contenido. Antes, cambiar un servicio o publicar una promoción exigía intervención técnica, y el contenido se quedaba congelado entre visitas.",
      en: "The shop needed two things: a professional public presence that would bring in customers and an internal tool to update its content. Previously, changing a service or publishing a promotion required technical intervention, and the content stayed frozen between visits.",
    },
    role: [
      {
        es: "Desarrollé el sitio full-stack completo en PHP, MySQL, JavaScript, Bootstrap y HTML5, sin framework.",
        en: "I developed the complete full-stack site in PHP, MySQL, JavaScript, Bootstrap and HTML5, with no framework.",
      },
      {
        es: "Construí el panel de administración que permite al personal no técnico gestionar servicios, promociones por calendario y consultas sin tocar código.",
        en: "I built the admin panel that lets non-technical staff manage services, calendar-based promotions and inquiries without touching code.",
      },
      {
        es: "Implementé dos niveles de acceso (admin / staff), sin cuentas de acceso para clientes.",
        en: "I implemented two access levels (admin / staff), with no customer accounts.",
      },
      {
        es: "Acompañé al equipo administrativo para estructurar el contenido y la presentación de los servicios.",
        en: "I worked alongside the administrative team to structure the content and the presentation of the services.",
      },
    ],
    solution: [
      {
        // Cada `**Label:**` abre y cierra aqui, igual que en el ES.
        es: "**Landing pública:** cara profesional del taller, orientada a captar clientes.",
        en: "**Public landing page:** the shop's professional face, aimed at bringing in customers.",
      },
      {
        es: "**Panel de administración:** el personal gestiona servicios, promociones y consultas sin depender de un desarrollador.",
        en: "**Admin panel:** staff manage services, promotions and inquiries without depending on a developer.",
      },
      {
        es: "**Promociones por calendario:** el taller programa y publica promociones por fecha, sin que nadie tenga que editar código.",
        en: "**Calendar-based promotions:** the shop schedules and publishes promotions by date, with nobody having to edit code.",
      },
      {
        es: "**Control de acceso:** dos niveles (admin / staff); los clientes no necesitan cuenta para ver el catálogo.",
        en: "**Access control:** two levels (admin / staff); customers need no account to view the catalog.",
      },
    ],
    // Etiqueta traducida, nombre de stack intacto.
    stack: [
      {
        es: "Backend: PHP puro (sin framework)",
        en: "Backend: plain PHP (no framework)",
      },
      {
        es: "Frontend: HTML5, CSS3, JavaScript, Bootstrap",
        // Nombres de tecnologias: identidad a proposito.
        en: "Frontend: HTML5, CSS3, JavaScript, Bootstrap",
      },
      {
        es: "Base de datos: MySQL",
        en: "Database: MySQL",
      },
    ],
    gallery: [
      {
        src: "/images/projects/autoshop/HomeCensured.webp",
        alt: {
          es: "Portada de la landing pública de AutoShop",
          en: "Cover of the AutoShop public landing page",
        },
      },
      {
        src: "/images/projects/autoshop/ServiciosCensured.webp",
        alt: {
          es: "Catálogo de servicios del taller en la landing pública",
          en: "The shop's service catalog on the public landing page",
        },
      },
      {
        src: "/images/projects/autoshop/crud.webp",
        alt: {
          es: "Panel de administración de AutoShop: gestión de servicios y promociones",
          en: "AutoShop admin panel: services and promotions management",
        },
      },
      {
        src: "/images/projects/autoshop/main.webp",
        alt: {
          es: "Hero de la landing de AutoShop Taller con el logo del taller",
          en: "Hero of the AutoShop Taller landing page with the shop's logo",
        },
      },
    ],
    cta: {
      es: "¿Tu negocio actualiza sus servicios o promociones con un desarrollador? Hablemos.",
      en: "Does your business update its services or promotions with a developer? Let's talk.",
    },
  },
  architecture: {
    name: {
      es: "AutoShop Taller",
      en: "AutoShop Taller",
    },
    description: {
      es: "Sitio web full-stack para un taller de servicios automotrices: landing pública y panel de administración con gestión de servicios, promociones y consultas.",
      en: "Full-stack website for an automotive service shop: public landing page and admin panel with services, promotions and inquiries management.",
    },
    children: [
      {
        name: {
          es: "Landing pública",
          en: "Public landing page",
        },
        description: {
          es: "Cara profesional del taller, orientada a captar clientes.",
          en: "The shop's professional face, aimed at bringing in customers.",
        },
      },
      {
        name: {
          es: "Panel de administración",
          en: "Admin panel",
        },
        description: {
          es: "3 módulos de gestión: servicios, promociones por calendario y consultas.",
          en: "3 management modules: services, calendar-based promotions and inquiries.",
        },
      },
      {
        name: {
          es: "Promociones por calendario",
          en: "Calendar-based promotions",
        },
        description: {
          es: "El taller programa promociones por fecha sin intervención técnica.",
          en: "The shop schedules promotions by date with no technical intervention.",
        },
      },
      {
        name: {
          es: "Control de acceso",
          en: "Access control",
        },
        description: {
          es: "Dos niveles (admin / staff), sin cuentas de acceso para clientes.",
          en: "Two levels (admin / staff), with no customer accounts.",
        },
      },
    ],
  },
};