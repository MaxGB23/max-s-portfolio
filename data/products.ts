// Products as bilingual data: the editorial data leaves the component and
// lives here, with one `L` leaf per visible string — same pattern as
// data/pricing.ts, re-exported through the public module.
//
// Copy ES VERBATIM: it is the copy already shipped in the component, byte for
// byte. It is not rewritten or "improved" — the `en` leaf goes beside it, never
// inside the source text.
//
// HONEST IDENTITY: unlike the pricing tiers, this copy was ALREADY written in
// English upstream (the component shipped English text under both locales), so
// every `en` leaf below is intentionally identical to its `es` leaf. That is
// the truthful terminal state, not an untranslated leftover: the ES locale
// keeps rendering byte-identical copy, and the EN locale renders the same
// professional US-English text. The audit allowlist in
// scripts/audit-i18n-content.mjs records these strings as needing no
// translation.
//
// CONTRATO DE ORDEN: the array order is a layout contract (3-column grid, one
// card per product) — do not reorder while editing the copy.

import type { L, Localized } from "@/data/projects";
import type { Lang } from "@/data/translations";

/**
 * Producto bilingue: `L` en cada hoja visible. `en` NO opcional (ver `L`):
 * falta `en` y `tsc` falla.
 */
export interface ProductL {
  name: L;
  description: L;
  features: L[];
  tag: L;
}

/**
 * El producto YA resuelto: mismo shape con las hojas en `string`. Es el tipo
 * que renderiza `ProductCard` — un componente de render nunca recibe
 * `ProductL`.
 */
export type LocalizedProduct = Localized<ProductL>;

/**
 * Resuelve las hojas `{es,en}` del producto para `lang`.
 *
 * Mapeo explicito y NO deep-walk generico: el shape de un producto es llano y
 * conocido, asi que el mapeo ES el checklist de que cada hoja se resuelve —
 * igual que en `localizePricingTier`, aqui no hay una hoja que se pueda
 * escapar por agregar un campo nuevo sin que el compilador lo note.
 */
export function localizeProduct(
  product: ProductL,
  lang: Lang,
): LocalizedProduct {
  return {
    name: product.name[lang],
    description: product.description[lang],
    features: product.features.map((feature) => feature[lang]),
    tag: product.tag[lang],
  };
}

export const products: ProductL[] = [
  {
    name: {
      // Nombre propio del producto: identidad a proposito.
      es: "UI Kit Pro",
      en: "UI Kit Pro",
    },
    description: {
      // El ES ya es US English publicado: identidad a proposito.
      es: "A comprehensive Figma & React component library built for speed - covering every pattern you need to ship a polished product.",
      en: "A comprehensive Figma & React component library built for speed - covering every pattern you need to ship a polished product.",
    },
    features: [
      {
        es: "200+ production-ready React components",
        en: "200+ production-ready React components",
      },
      {
        es: "Full Figma source files included",
        en: "Full Figma source files included",
      },
      {
        es: "Storybook documentation & live preview",
        en: "Storybook documentation & live preview",
      },
    ],
    tag: {
      // "Design System" ya es el termino del sector en ingles.
      es: "Design System",
      en: "Design System",
    },
  },
  {
    name: {
      // Nombre propio del producto: identidad a proposito.
      es: "Motion Studio",
      en: "Motion Studio",
    },
    description: {
      // El ES ya es US English publicado: identidad a proposito.
      es: "Plug-and-play Framer Motion presets and animation hooks that bring your interfaces to life without sacrificing performance.",
      en: "Plug-and-play Framer Motion presets and animation hooks that bring your interfaces to life without sacrificing performance.",
    },
    features: [
      {
        es: "50+ pre-built animation variants",
        en: "50+ pre-built animation variants",
      },
      {
        es: "Custom React hooks for scroll & hover",
        en: "Custom React hooks for scroll & hover",
      },
      {
        es: "Zero-dependency, tree-shakable bundle",
        en: "Zero-dependency, tree-shakable bundle",
      },
    ],
    tag: {
      // "Animation" ya es el termino del sector en ingles.
      es: "Animation",
      en: "Animation",
    },
  },
  {
    name: {
      // Nombre propio del producto: identidad a proposito.
      es: "Deploy Blueprint",
      en: "Deploy Blueprint",
    },
    description: {
      // El ES ya es US English publicado: identidad a proposito.
      es: "A Next.js starter template with auth, database, payments, and CI/CD pre-wired so you can go from idea to production in hours.",
      en: "A Next.js starter template with auth, database, payments, and CI/CD pre-wired so you can go from idea to production in hours.",
    },
    features: [
      {
        // Nombres de stack: no se traducen.
        es: "Next.js 16 + Tailwind + Supabase auth",
        en: "Next.js 16 + Tailwind + Supabase auth",
      },
      {
        es: "Stripe payments integrated out of the box",
        en: "Stripe payments integrated out of the box",
      },
      {
        es: "GitHub Actions CI/CD pipeline included",
        en: "GitHub Actions CI/CD pipeline included",
      },
    ],
    tag: {
      // "Starter Template" ya es el termino del sector en ingles.
      es: "Starter Template",
      en: "Starter Template",
    },
  },
];
