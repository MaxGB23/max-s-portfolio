/**
 * Audit del data layer bilingue: reporta hojas sin traducir, markdown
 * perdido y strings visibles fuera de una hoja `L`.
 *
 * Que revisa: `data/products.ts`, `data/pricing.ts`, `data/projects.ts` y
 * `data/projects/*.ts` — parseados con el AST de TypeScript (devDependency
 * del repo), sin ejecutar el codigo.
 *
 * Clases de problema:
 *  1. `untranslated` — hoja `{es, en}` con `en` identico a `es` y fuera del
 *     allowlist IDENTICAL_OK (strings que no necesitan traduccion: marcas,
 *     cifras, nombres de stack, terminos del sector, copy ya publicado en
 *     ingles). Anadir una entrada aqui es una decision editorial consciente,
 *     no un parche para callar el script.
 *  2. `markdown` — conteo de ocurrencias de `**` distinto entre `es` y `en`
 *     (docs/i18n.md:25: los pares `**` se preservan al traducir).
 *  3. `outside-leaf` — string visible fuera de una hoja `L` donde una es
 *     obligatoria. Solo se permiten literales en props no traducibles
 *     (`id`, `tags`, `image`, `src`, `url`, `kind`, `price`) y los module
 *     specifiers de los imports. `data/projects/types.ts` se excluye de ESTE
 *     chequeo: contiene tipos + maquinaria `localize` cuyos strings de codigo
 *     ("object", "es", "en") no son copy visible; sus hojas `L` (las 4
 *     constantes `linkLabel*`) si pasan los chequeos 1 y 2.
 *
 * Salida: exit 0 en limpio; exit 1 con el reporte cuando hay problemas.
 */

import { readdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, posix } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const ts = require("typescript");

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

// Props que contienen strings NO traducibles (rutas, urls, ids, cifras con
// moneda, nombres de stack, categorias de enlace). Todo literal fuera de una
// hoja `L` y fuera de estas props es copy visible sin `en` -> problema.
const NON_TRANSLATABLE_PROPS = new Set([
  "id",
  "tags",
  "image",
  "src",
  "url",
  "kind",
  "price",
]);

// Strings donde `en === es` es el estado terminal CORRECTO, no una traduccion
// pendiente. Semantica del allowlist: "este string no necesita traduccion", asi
// que una colision futura con el mismo texto exacto tambien pasaria — por
// construccion solo contiene tokens no traducibles (marcas, cifras, stack,
// terminos del sector, copy ya publicado en ingles). Las frases completas en
// ingles (descripciones de productos) vienen de T14: el copy ES publicado ya
// era US English, identidad documentada en `data/products.ts`.
const IDENTICAL_OK = new Set([
  // -- Productos (T14: copy ya publicado en ingles, identidad a proposito)
  "UI Kit Pro",
  "A comprehensive Figma & React component library built for speed - covering every pattern you need to ship a polished product.",
  "200+ production-ready React components",
  "Full Figma source files included",
  "Storybook documentation & live preview",
  "Design System",
  "Motion Studio",
  "Plug-and-play Framer Motion presets and animation hooks that bring your interfaces to life without sacrificing performance.",
  "50+ pre-built animation variants",
  "Custom React hooks for scroll & hover",
  "Zero-dependency, tree-shakable bundle",
  "Animation",
  "Deploy Blueprint",
  "A Next.js starter template with auth, database, payments, and CI/CD pre-wired so you can go from idea to production in hours.",
  "Next.js 16 + Tailwind + Supabase auth",
  "Stripe payments integrated out of the box",
  "GitHub Actions CI/CD pipeline included",
  "Starter Template",
  // -- Pricing: terminos del sector y nombres de stack (ver data/pricing.ts)
  "Landing Page",
  "Stack Next.js + TypeScript",
  // -- Marcas y nombres propios (titulos, repos, marketplaces, comandos)
  "AutoShop Taller",
  "Color Highlight v2",
  "Cumyxel 2D",
  "Cumyxel (MIT)",
  "Cumyxel-code",
  "Funky AI",
  "Funky Theme",
  "Funky-AI logo",
  "Funky Theme Dark - TSX code",
  "Funky Theme Darker - TS code",
  "Grinchmas Kart",
  "One Click Ti — PWA",
  "VSCode Marketplace",
  "Open VSX",
  "Open VSX Publisher (namespace MaxGB23)",
  "funky-ai",
  "funky-theme",
  "funky-forge",
  "funkygram",
  "funky secure",
  "Cross-editor: Zed",
  "SDD framework",
  // -- Categorias: terminos del sector ya en ingles (no inventar jerga)
  "Full Stack / PHP",
  "Full Stack / PWA",
  "Full Stack / GovTech",
  "Full Stack / HealthTech",
  "Game Dev / Unity",
  "Dev Tools / VS Code",
  "Dev Tools / AI Engineering",
  // -- Cifras, unidades y valores cualitativos que son tokens, no prosa
  "2",
  "3",
  "5",
  "8",
  "10",
  "11",
  "17",
  "27",
  "443",
  "47+7",
  "38 KB",
  "150 ms",
  "100%",
  "-40%",
  "~80%",
  "97.45%",
  "3.3k",
  "191/30d",
  "FSM",
  "RL",
  "MIT",
  "Beta",
  "Verified",
  // -- Lineas de stack: la etiqueta puede traducirse, los nombres no
  "Frontend: HTML5, CSS3, JavaScript, Bootstrap",
  "Frontend: Vue 3, Inertia.js",
  "Backend: Laravel 11 (PHP)",
  "Framework: Next.js, React",
  "ORM: Prisma",
  "Package manager: pnpm",
  "PWA: manifest + service worker",
  "Testing: Vitest (TDD, Red → Green → Refactor)",
  "C# · uGUI + TextMeshPro · Mecanim · Timeline · Tilemap · Physics2D",
  "C# · Cinemachine · ProBuilder · Timeline · TextMeshPro",
  "ML-Agents · Barracuda · Burst",
  // -- Nombres de tiers del producto (identificadores, no prosa)
  "3 tiers: T1 Flash, T2 Standard, T3 Insano",
]);

function isStr(node) {
  return ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node);
}

/** Si el objeto es una hoja `{es, en}` con literales, devuelve sus nodos. */
function leafOf(obj) {
  if (!ts.isObjectLiteralExpression(obj)) return null;
  let es = null;
  let en = null;
  for (const prop of obj.properties) {
    if (!ts.isPropertyAssignment(prop) || !ts.isIdentifier(prop.name)) continue;
    if ((prop.name.text === "es" || prop.name.text === "en") && isStr(prop.initializer)) {
      if (prop.name.text === "es") es = prop.initializer;
      else en = prop.initializer;
    }
  }
  return es && en ? { es, en } : null;
}

function countStars(text) {
  return text.split("**").length - 1;
}

function listDataFiles() {
  const fichas = readdirSync(join(ROOT, "data", "projects"))
    .filter((f) => f.endsWith(".ts"))
    .sort()
    .map((f) => posix.join("data", "projects", f));
  return ["data/products.ts", "data/pricing.ts", "data/projects.ts", ...fichas];
}

const problems = [];
let leafCount = 0;
const files = listDataFiles();

for (const rel of files) {
  const abs = join(ROOT, ...rel.split("/"));
  const source = ts.createSourceFile(abs, readFileSync(abs, "utf8"), ts.ScriptTarget.Latest, true);
  const lineOf = (node) => source.getLineAndCharacterOfPosition(node.getStart()).line + 1;
  const leafInits = new Set();

  // Pase 1: hojas `{es, en}` — chequeos 1 (identico) y 2 (markdown).
  (function walkLeaves(node) {
    if (ts.isObjectLiteralExpression(node)) {
      const leaf = leafOf(node);
      if (leaf) {
        leafCount += 1;
        leafInits.add(leaf.es);
        leafInits.add(leaf.en);
        const { es, en } = { es: leaf.es.text, en: leaf.en.text };
        if (es === en && !IDENTICAL_OK.has(es)) {
          problems.push({ type: "untranslated", file: rel, line: lineOf(leaf.es), text: es });
        }
        if (countStars(es) !== countStars(en)) {
          problems.push({
            type: "markdown",
            file: rel,
            line: lineOf(leaf.es),
            text: `es has ${countStars(es)}x "**", en has ${countStars(en)}x "**": ${es.slice(0, 60)}`,
          });
        }
      }
    }
    ts.forEachChild(node, walkLeaves);
  })(source);

  // Pase 2: strings fuera de hoja — chequeo 3. `types.ts` se excluye (ver
  // cabecera): su codigo `localize` contiene strings que no son copy.
  if (rel === "data/projects/types.ts") continue;
  (function walkStrings(node) {
    const stringish = isStr(node) || ts.isTemplateExpression(node);
    if (stringish && !leafInits.has(node)) {
      const parent = node.parent;
      if (!(parent && (ts.isImportDeclaration(parent) || ts.isExportDeclaration(parent)))) {
        let prop = null;
        let cursor = node;
        while (cursor.parent) {
          cursor = cursor.parent;
          if (ts.isPropertyAssignment(cursor) && ts.isIdentifier(cursor.name)) {
            prop = cursor.name.text;
            break;
          }
        }
        if (!prop || !NON_TRANSLATABLE_PROPS.has(prop)) {
          const excerpt = node.getText().slice(0, 80);
          problems.push({ type: "outside-leaf", file: rel, line: lineOf(node), text: `[${prop ?? "?"}] ${excerpt}` });
        }
      }
    }
    ts.forEachChild(node, walkStrings);
  })(source);
}

if (problems.length === 0) {
  console.log(`i18n content audit: 0 problems across ${leafCount} L leaves in ${files.length} files.`);
  process.exit(0);
}

console.log(`i18n content audit: ${problems.length} problem(s) across ${leafCount} L leaves in ${files.length} files:\n`);
for (const p of problems) {
  console.log(`[${p.type}] ${p.file}:${p.line}\n  ${p.text.slice(0, 200)}\n`);
}
process.exit(1);
