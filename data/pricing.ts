// Pricing tiers as bilingual data: the editorial data leaves the component and
// lives here, with one `L` leaf per visible string — same pattern as
// data/projects/types.ts, re-exported through the public module.
//
// Copy ES VERBATIM: it is the copy already audited and shipped in ES, byte for
// byte. It is not rewritten or "improved" — the `en` leaf goes beside it, never
// inside the source text.
//
// PRICES ARE NOT TRANSLATED: `price` is a figure with a currency symbol
// ("$6,000"), so it is a plain `string`, not an `L` leaf. Translating it would
// mean inventing a value. `period` IS translated, because only its words change
// ("por proyecto" -> "per project") while the "MXN ·" prefix stays.
//
// Project names inside `proof` (AutoShop, One Click Ti, CAF, funky-ai) are
// brands: they stay verbatim in both languages. CONTRATO DE ORDEN: the array
// order is a layout contract (3-column grid, one card per tier) — do not
// reorder while editing the copy.

import type { L, Localized } from "@/data/projects";
import type { Lang } from "@/data/translations";

/**
 * Tier bilingue: `L` en cada hoja visible, `price` en `string` porque es una
 * cifra. `en` NO opcional (ver `L`): falta `en` y `tsc` falla.
 */
export interface PricingTierL {
  name: L;
  /** Cifra con simbolo de moneda: no se traduce. */
  price: string;
  period: L;
  description: L;
  features: L[];
  cta: L;
  highlighted: boolean;
  /** Linea de respaldo con nombres de proyecto: marcas, no copy traducible. */
  proof?: L;
}

/**
 * El tier YA resuelto: mismo shape con las hojas en `string`. Es el tipo que
 * renderiza `PricingCard` — un componente de render nunca recibe `PricingTierL`.
 */
export type LocalizedPricingTier = Localized<PricingTierL>;

/**
 * Resuelve las hojas `{es,en}` del tier para `lang` y deja intacto lo que no se
 * traduce (`price`, `highlighted`).
 *
 * Mapeo explicito y NO deep-walk generico: el shape de un tier es llano y
 * conocido, asi que el mapeo ES el checklist de que cada hoja se resuelve —
 * igual que en `localizeProject`, aqui no hay una hoja que se pueda escapar por
 * agregar un campo nuevo sin que el compilador lo note.
 */
export function localizePricingTier(
  tier: PricingTierL,
  lang: Lang,
): LocalizedPricingTier {
  return {
    name: tier.name[lang],
    price: tier.price,
    period: tier.period[lang],
    description: tier.description[lang],
    features: tier.features.map((feature) => feature[lang]),
    cta: tier.cta[lang],
    highlighted: tier.highlighted,
    ...(tier.proof ? { proof: tier.proof[lang] } : {}),
  };
}

export const pricingTiers: PricingTierL[] = [
  {
    name: {
      // El ES ya es el termino ingles del sector: identidad a proposito.
      es: "Landing Page",
      en: "Landing Page",
    },
    price: "$6,000",
    period: {
      es: "MXN · por proyecto",
      en: "MXN · per project",
    },
    description: {
      es: "Página única que presenta tu negocio y convierte visitas en contactos.",
      // "contactos" en el mundo comercial EN es "leads": el registro de venta,
      // no la palabra suelta.
      en: "A single page that presents your business and turns visits into leads.",
    },
    features: [
      {
        es: "Diseño responsivo a medida",
        en: "Custom responsive design",
      },
      {
        es: "SEO básico y velocidad optimizada",
        en: "Basic SEO and optimized speed",
      },
      {
        es: "Formulario de contacto funcional",
        en: "Working contact form",
      },
      {
        es: "Despliegue incluido",
        en: "Deployment included",
      },
      {
        es: "Entrega en 1-2 semanas",
        en: "Delivery in 1-2 weeks",
      },
    ],
    cta: {
      // "cotizacion" ya es "quote" en el chrome EN de la seccion
      // (section.pricing.subtitle: "quoted according to scope").
      es: "Solicitar cotización",
      en: "Request a quote",
    },
    highlighted: false,
    proof: {
      es: "Respaldado por: landings de AutoShop, One Click Ti y CAF.",
      // Marcas intactas; solo la estructura "landings de" se traduce.
      en: "Backed by: the AutoShop, One Click Ti and CAF landing pages.",
    },
  },
  {
    name: {
      // "a Medida" es la idea comercial de "hecho a la medida" del cliente, no
      // "bajo medida": "Custom" conserva el pitch, "Made to measure" suena a
      // garantia de talla.
      es: "Sistema Web a Medida",
      en: "Custom Web System",
    },
    price: "$20,000",
    period: {
      es: "MXN · por proyecto",
      en: "MXN · per project",
    },
    description: {
      es: "Plataforma con panel de administración, usuarios y base de datos. Mi especialidad.",
      // "Mi especialidad" es la frase corta que ya existe como remate de venta.
      en: "Platform with an admin panel, users and a database. My specialty.",
    },
    features: [
      {
        es: "Panel de administración + PostgreSQL",
        en: "Admin panel + PostgreSQL",
      },
      {
        es: "Autenticación y roles de usuario",
        en: "Authentication and user roles",
      },
      {
        es: "Dashboards y reportes",
        // "Reportes" es "reports" en el registro de software de negocio.
        en: "Dashboards and reports",
      },
      {
        // Nombres de stack: no se traducen.
        es: "Stack Next.js + TypeScript",
        en: "Stack Next.js + TypeScript",
      },
      {
        es: "Soporte post-entrega incluido",
        en: "Post-delivery support included",
      },
    ],
    cta: {
      es: "Cotizar mi proyecto",
      en: "Quote my project",
    },
    highlighted: true,
    proof: {
      es: "Respaldado por: CAF en producción y plataforma de Presidencia Municipal.",
      // "Presidencia Municipal" es el nombre de la plataforma (data/projects/
      // presidencia.ts usa "Municipal Presidency" en EN), no una institucion
      // traducida frase por frase.
      en: "Backed by: CAF in production and the Municipal Presidency platform.",
    },
  },
  {
    name: {
      es: "Automatización con IA",
      en: "AI Automation",
    },
    price: "$25,000",
    period: {
      es: "MXN · por proyecto",
      en: "MXN · per project",
    },
    description: {
      es: "Un flujo de tu negocio automatizado con IA, acotado y medible. Sin humo.",
      // "Sin humo" juega con el humo de la exageracion. En ingles comercial el
      // registro equivalente y directo es "no hype": "no fluff" suaviza y
      // "no smoke" es una literalidad sin sentido en ingles.
      en: "One of your business workflows automated with AI, tightly scoped and measurable. No hype.",
    },
    features: [
      {
        // "acotado" se mantiene dos veces: es el argumento del tier, no relleno.
        es: "Piloto acotado: un proceso, un objetivo",
        en: "Tightly scoped pilot: one process, one goal",
      },
      {
        es: "Chatbot o integración LLM sobre tus datos",
        en: "Chatbot or LLM integration over your data",
      },
      {
        es: "Estimación de costos de tokens incluida",
        en: "Token cost estimate included",
      },
      {
        es: "Documentación del piloto entregada",
        en: "Pilot documentation delivered",
      },
    ],
    cta: {
      es: "Agendar llamada",
      en: "Schedule a call",
    },
    highlighted: false,
    proof: {
      es: "Respaldado por: framework funky-ai (SDD, agentes).",
      // "agentes" -> "agents"; funky-ai y SDD son marcas/siglas, intactos.
      en: "Backed by: the funky-ai framework (SDD, agents).",
    },
  },
];