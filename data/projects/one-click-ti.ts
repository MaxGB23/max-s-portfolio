// Ficha `one-click-ti` (One Click Ti — PWA) en el shape bilingue `ProjectL`.
//
// Copy ES VERBATIM: es el copy editorial ya auditado contra el repo real
// (docs/projects/candidatos/one-click-ti.md). No se reescribe ni se "mejora": la
// hoja `en` va al lado, nunca dentro del texto de origen.
//
// CONTRATO DE ORDEN (ver ProjectL.detail.metrics): `metrics[0]` es la metrica
// raiz del detail, y el orden de `metrics`, `role`, `solution` y `gallery` es
// contrato de layout (KpiGrid de 2 columnas, nodo raiz de la topologia). No
// reordenar al anadir el `en`.
//
// ROLES DE NEGOCIO: la ficha mezcla el stack tecnico con las personas que usan
// el sistema (administradores, el resto del equipo, el cliente). El EN nombra
// esos mismos roles con las palabras inglesas del sector (administrators,
// staff/read-only, client), sin prometer permisos que el ES no promete.

import { linkLabelCode, type ProjectL } from "./types";

export const oneClickTi: ProjectL = {
  id: "one-click-ti",
  title: {
    // Nombre del cliente + sigla del formato: identidad a proposito.
    es: "One Click Ti — PWA",
    en: "One Click Ti — PWA",
  },
  category: {
    // "Full Stack" y "PWA" ya son los terminos del sector en ingles:
    // traducirlos seria inventar jerga. Idéntico al ES a proposito.
    es: "Full Stack / PWA",
    en: "Full Stack / PWA",
  },
  hook: {
    es: "PWA full-stack por contrato para una empresa de TI: catálogo de servicios con precios, captación de leads y panel de gestión en una app instalable.",
    en: "Contract full-stack PWA for an IT company: service catalog with pricing, lead capture and an admin panel inside an installable app.",
  },
  metric: {
    es: "5 módulos CRUD en una PWA instalable",
    en: "5 CRUD modules in an installable PWA",
  },
  // Stack names: no se traducen.
  tags: ["Laravel", "Vue 3", "Inertia.js", "MySQL", "PHP"],
  image: "/images/projects/oneclickti/proyectos.webp",
  imageAlt: {
    es: "Catálogo de servicios publicado en la landing, con precio y categoría",
    en: "Service catalog published on the landing page, with price and category",
  },
  links: [
    {
      label: linkLabelCode,
      kind: "code",
      url: "https://github.com/MaxGB23/ABMODEL",
      external: true,
    },
  ],
  detail: {
    headline: {
      es: "Catálogo de servicios con precios y leads capturados, administrados desde una app instalable",
      en: "Service catalog with pricing and captured leads, managed from an installable app",
    },
    summary: {
      es: "PWA full-stack desarrollada por contrato para One Click Ti (Querétaro, sep – dic 2024) y con 4 meses de soporte en producción. Integra una landing pública con un panel de gestión interno donde el equipo publica servicios con precio y categoría, y donde los contactos que deja el formulario público llegan directo a la tabla de leads. El panel separa permisos: solo los administradores editan, el resto del equipo consulta.",
      // La copia ES no lleva pares `**`: el EN tampoco los inventa (docs/i18n.md:25).
      en: "Full-stack PWA developed on contract for One Click Ti (Querétaro, Sep – Dec 2024) with 4 months of production support. It combines a public landing page with an internal admin panel where the team publishes services with price and category, and where the contacts left by the public form land straight in the leads table. The panel separates permissions: only administrators edit, the rest of the team reads.",
    },
    metrics: [
      {
        // metrics[0] = metrica RAIZ del detail (nodo raiz de la topologia).
        value: {
          // Cifra pura: se traduce por identidad (no hay palabra que traducir).
          es: "5",
          en: "5",
        },
        label: {
          es: "módulos CRUD completos: servicios, categorías, FAQs, contactos y usuarios",
          en: "complete CRUD modules: services, categories, FAQs, contacts and users",
        },
      },
      {
        value: {
          es: "4 meses",
          en: "4 months",
        },
        label: {
          es: "de soporte al cliente en producción (sep – dic 2024)",
          en: "of customer support in production (Sep – Dec 2024)",
        },
      },
      {
        value: {
          // Cifra pura: identidad.
          es: "17",
          en: "17",
        },
        label: {
          es: "iconos y splash screens que cubren los tamaños que exigen iOS y Android",
          en: "icons and splash screens covering the sizes required by iOS and Android",
        },
      },
      {
        value: {
          // Cifra pura: identidad.
          es: "3",
          en: "3",
        },
        label: {
          es: "plataformas instalables desde el navegador: Android, iOS y escritorio, sin pasar por una app store",
          en: "platforms installable from the browser: Android, iOS and desktop, with no app store in the way",
        },
      },
    ],
    problem: {
      es: "La empresa necesitaba dos cosas en una: una presencia pública profesional con su catálogo de servicios y una herramienta interna para administrarlo, sin mantener sistemas separados ni depender de un desarrollador para cambiar precios o actualizar el contenido. Los contactos que llegaban por el formulario público quedaban sueltos, sin consolidarse en un solo lugar. Y al ser una web, obligaba al cliente a entrar por un navegador cada vez.",
      en: "The company needed two things in one: a professional public presence with its service catalog and an internal tool to manage it, without maintaining separate systems or depending on a developer to change prices or update content. The contacts coming in through the public form were left scattered, never consolidated in a single place. And being a website, it forced the client to open a browser every time.",
    },
    role: [
      {
        es: "Desarrollé la PWA full-stack completa con Laravel 11, Vue 3, Inertia.js y MySQL.",
        en: "I developed the complete full-stack PWA with Laravel 11, Vue 3, Inertia.js and MySQL.",
      },
      {
        es: "Construí el catálogo de servicios con precio y categoría, y el panel que lo administra con 5 módulos CRUD.",
        en: "I built the service catalog with price and category, and the panel that manages it with 5 CRUD modules.",
      },
      {
        es: "Conecté el formulario público de contacto con la tabla de leads, para que cada contacto quede registrado sin intervención manual.",
        en: "I connected the public contact form to the leads table, so every contact is recorded with no manual intervention.",
      },
      {
        es: "Implementé la separación de permisos: solo los administradores editan; el resto del equipo consulta.",
        en: "I implemented the permission split: only administrators edit; the rest of the team reads.",
      },
      {
        es: "Configuré la instalación como PWA: manifest con icono propio y pantalla de inicio propia, y service worker con precache de las secciones públicas.",
        en: "I set up the installability as a PWA: a manifest with its own icon and splash screen, plus a service worker that precaches the public sections.",
      },
    ],
    solution: [
      {
        // Cada `**Label:**` abre y cierra aqui, igual que en el ES.
        es: "**Catálogo de servicios:** cada servicio se publica con nombre, descripción, precio, imagen y categoría, sin tocar código.",
        en: "**Service catalog:** every service is published with name, description, price, image and category, without touching code.",
      },
      {
        es: "**Captación de leads:** el formulario público de contacto escribe directo en la tabla de contactos, que el mismo panel administra.",
        en: "**Lead capture:** the public contact form writes straight into the contacts table, which that same panel manages.",
      },
      {
        es: "**Panel de gestión:** 5 módulos CRUD completos —servicios, categorías, FAQs, contactos y usuarios— con filtros y paginación.",
        en: "**Admin panel:** 5 complete CRUD modules —services, categories, FAQs, contacts and users— with filters and pagination.",
      },
      {
        es: "**Permisos por tipo de usuario:** solo los administradores editan; el resto del equipo consulta sin poder modificar datos.",
        en: "**Permissions by user type:** only administrators edit; the rest of the team browses without being able to modify data.",
      },
      {
        es: "**Auditoría de cambios:** cada registro guarda quién lo creó y quién lo actualizó, con claves foráneas a la tabla de usuarios.",
        en: "**Change audit trail:** every record keeps who created it and who updated it, with foreign keys to the users table.",
      },
      {
        es: "**App instalable, no una web más:** se instala desde el navegador como aplicación nativa en móvil y escritorio, con icono propio y pantalla de inicio propia, sin pasar por una app store.",
        en: "**An installable app, not just another website:** it installs from the browser like a native app on mobile and desktop, with its own icon and splash screen, with no app store in the way.",
      },
      {
        es: "**Manifest y service worker:** 8 iconos y 9 splash screens que cubren los tamaños que exigen iOS y Android, precache de las 5 secciones públicas y estrategia network-first para los assets de Vite.",
        en: "**Manifest and service worker:** 8 icons and 9 splash screens covering the sizes required by iOS and Android, precaching of the 5 public sections and a network-first strategy for Vite assets.",
      },
    ],
    // Etiqueta traducida, nombre de stack intacto.
    stack: [
      {
        es: "Backend: Laravel 11 (PHP)",
        en: "Backend: Laravel 11 (PHP)",
      },
      {
        es: "Frontend: Vue 3, Inertia.js",
        en: "Frontend: Vue 3, Inertia.js",
      },
      {
        es: "Base de datos: MySQL",
        en: "Database: MySQL",
      },
      {
        es: "Despliegue: Heroku (Procfile)",
        en: "Deployment: Heroku (Procfile)",
      },
      {
        es: "PWA: manifest + service worker",
        // "manifest" y "service worker" son los nombres del estandar web:
        // identidad a proposito.
        en: "PWA: manifest + service worker",
      },
    ],
    gallery: [
      {
        src: "/images/projects/oneclickti/hero.webp",
        alt: {
          es: "Portada de la landing pública de One Click Ti",
          en: "Cover of the One Click Ti public landing page",
        },
      },
      {
        src: "/images/projects/oneclickti/proyectos.webp",
        alt: {
          es: "Catálogo de servicios publicado en la landing, con precio y categoría",
          en: "Service catalog published on the landing page, with price and category",
        },
      },
      {
        src: "/images/projects/oneclickti/contacto.webp",
        alt: {
          es: "Formulario público de contacto, origen de los leads",
          en: "Public contact form, the source of the leads",
        },
      },
      {
        src: "/images/projects/oneclickti/crud.webp",
        alt: {
          es: "Panel de gestión interna con el CRUD de servicios",
          en: "Internal admin panel with the services CRUD",
        },
      },
    ],
    cta: {
      es: "¿Necesitas un catálogo de servicios que tu equipo pueda actualizar sin depender de un desarrollador? Hablemos.",
      en: "Need a service catalog your team can update without depending on a developer? Let's talk.",
    },
  },
  architecture: {
    name: {
      es: "One Click Ti — PWA",
      en: "One Click Ti — PWA",
    },
    description: {
      es: "PWA full-stack por contrato: catálogo público, captación de leads y panel de gestión en una sola aplicación instalable.",
      en: "Contract full-stack PWA: public catalog, lead capture and admin panel in a single installable application.",
    },
    children: [
      {
        name: {
          es: "Landing pública",
          en: "Public landing page",
        },
        description: {
          es: "Catálogo de servicios por categoría, preguntas frecuentes y formulario de contacto.",
          en: "Service catalog by category, frequently asked questions and a contact form.",
        },
      },
      {
        name: {
          es: "Panel de gestión interna",
          en: "Internal admin panel",
        },
        description: {
          es: "5 módulos CRUD: servicios, categorías, FAQs, contactos (leads) y usuarios.",
          en: "5 CRUD modules: services, categories, FAQs, contacts (leads) and users.",
        },
      },
      {
        name: {
          es: "Permisos por tipo de usuario",
          en: "Permissions by user type",
        },
        description: {
          es: "Los administradores editan; el resto del equipo solo consulta.",
          en: "Administrators edit; the rest of the team only reads.",
        },
      },
      {
        name: {
          es: "Auditoría de cambios",
          en: "Change audit trail",
        },
        description: {
          es: "created_by y updated_by con clave foránea a la tabla de usuarios.",
          // Nombres de columna del schema: identidad a proposito.
          en: "created_by and updated_by with a foreign key to the users table.",
        },
      },
      {
        name: {
          es: "App instalable (PWA)",
          en: "Installable app (PWA)",
        },
        description: {
          es: "Se instala desde el navegador en móvil y escritorio, con icono y pantalla de inicio propios, sin pasar por una app store.",
          en: "It installs from the browser on mobile and desktop, with its own icon and splash screen, with no app store in the way.",
        },
      },
      {
        name: {
          es: "Arquitectura unificada",
          en: "Unified architecture",
        },
        description: {
          es: "Laravel (backend) + Vue 3 e Inertia.js (frontend) en un solo proyecto.",
          en: "Laravel (backend) + Vue 3 and Inertia.js (frontend) in a single project.",
        },
      },
    ],
  },
};