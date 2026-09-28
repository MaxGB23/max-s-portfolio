# Feature: Language switcher ES/EN (language-switcher)

## Objective
Implementar el plan aprobado en `docs/ideas-features/language.md` (commit `7ce3ad8`): switch ES/EN en el navbar con detección automática del idioma en el servidor (cookie → Accept-Language → 'es'), persistencia por cookie y cero flash de contenido. Sin `next-intl` (decisión de peso, documentada en el plan).

## Problem
El portfolio es 100% español hardcodeado. Un switch de idioma clásico (detección cliente con `navigator.language` en useEffect) recrea flash de contenido en el primer acceso. La cookie permite que el servidor decida antes del primer byte.

## Why
- El usuario aprobó el plan y pidió continuar con el pendiente.
- Accesibilidad/SEO: `<html lang>` debe reflejar el idioma real desde SSR.

## Scope (work unit 1 — infra + navbar + hero)
- **Nuevos:** `data/translations.ts`, `contexts/language-context.tsx`, `components/language-toggle.tsx`
- **Modificados:** `app/layout.tsx` (getInitialLang server: cookie → Accept-Language → 'es'), `components/navbar.tsx` (toggle desktop + mobile, `t()` en textos), `components/hero-section.tsx` (`t()` en textos visibles)
- **NO incluye** (work units siguientes, según plan "resto de secciones — según se implementen"): about, featured-projects, all-projects, pricing, products, contact, footer, project-detail/card.

## Constraints
- Verificación: `pnpm build` limpio (sin test runner configurado; TDD off).
- Cero flash real: `initialLang` se resuelve en el servidor; `<html lang>` sincronizado en `setLang`.
- `TranslationKey` derivado de `es`; `en` con `satisfies Record<TranslationKey, string>` (clave faltante o de más = error de compilación).
- Cookie: `path=/; max-age=31536000; samesite=lax; secure`.
- ASCII, conventional commits en inglés, pnpm siempre.
- No reescribir fuentes con PowerShell (usar herramientas de edición).
- El toggle usa clases del design system existente (border-border, bg-foreground, text-muted-foreground, cn) — no inventar tokens.

## Tasks
- [x] T1: `data/translations.ts` — claves tipadas ES/EN para navbar + hero
- [x] T2: `contexts/language-context.tsx` — LanguageProvider + useLanguage + setLang (html lang + cookie)
- [x] T3: `app/layout.tsx` — RootLayout async, getInitialLang (cookies()/headers() async), provider wrap, `<html lang={initialLang}>`
- [x] T4: `components/language-toggle.tsx` — botón ES | EN (aria-pressed)
- [x] T5: `components/navbar.tsx` — toggle desktop (junto a Contacto) + mobile (junto a hamburguesa), navLinks y textos con `t()`
- [x] T6: `components/hero-section.tsx` — textos visibles con `t()` (role, description, CTA, stack, scroll)
- [x] T7: verificación: `pnpm build` + `npx tsc --noEmit` limpios
- [ ] T8: `translations.ts` — claves `section.*` / `common.*` para chrome de secciones (WU2)
- [ ] T9: about-section — label, title split, párrafos, aria (WU2)
- [ ] T10: featured-projects + featured-project-panel + all-projects — headings, "Ver caso de estudio" (clave compartida), aria (WU2)
- [ ] T11: products-section — chrome ES (eyebrow, h2, sub, "Saber más"); data products queda EN (WU2)
- [ ] T12: pricing-section — chrome (badge, "desde", h2, sub, footer); data tiers queda ES (WU2)
- [ ] T13: contact-section — badge, h2, sub, CTAs, botón copiar (estado copied/no-copied), aria (WU2)
- [ ] T14: footer — bio, heading, copyright interpolado (WU2)
- [ ] T15: project-card + project-detail + project-architecture — labels, tabs, lightbox, placeholders, plural "módulo(s)"; data-driven content queda ES (WU2)
- [ ] T16: `app/proyectos/[id]/page.tsx` — "Proyecto no encontrado" resuelto server-side vía cookie (WU2)
- [ ] T17: verificación WU2: `pnpm build` + `pnpm exec tsc --noEmit` limpios

## Acceptance criteria
- `pnpm build` y `npx tsc --noEmit` compilan sin errores.
- Primer acceso sin cookie: idioma decidido por Accept-Language en el servidor (cero flash). Cookie presente: respeta la elección previa.
- Toggle ES/EN visible en desktop y mobile; cambia el idioma, persiste cookie y sincroniza `<html lang>`.
- `t('nav.abut')` (typo) NO compila; añadir clave a `es` sin traducir en `en` NO compila.
- Resto de secciones (about, proyectos, pricing, contacto, footer) siguen en español en ES; su traducción es work unit posterior (listada en Next Steps).

## Progress
- Work unit 1 implementada (2026-09-21): infra + navbar + hero. 6 archivos (3 nuevos, 3 modificados). Delegado a writer `general`, gatekeeper OK.
- Work unit 1 commit: `3d471e0` "feat: add ES/EN language switcher with server-side detection" (7 archivos, 261+/47-).
- Work unit 2 implementada (2026-09-21): chrome UI de todas las secciones (about, featured/all-projects, panel, products, pricing, contact, footer, project-card, project-detail, project-architecture, [id]/page metadata). 59 claves nuevas (11 common.* + 48 section.*). Delegado a writer `general`, gatekeeper OK.
- Work unit 3 (2026-09-21, UI ajuste): `language-toggle.tsx` rediseñado a 1 botón tipo switch (patrón DarkModeToggle) con knob deslizante ES/EN, tamaño h-9 w-20 alineado al navbar (antes text-xs). Claves nuevas `nav.aria.switchToEn/switchToEs`. COMMIT 839b8da.
- Work unit 4 (2026-09-21, navbar responsive): desborde real a 768px en español (badge + "Sobre mí" a 2 líneas). Decisión content-driven: breakpoint custom `--breakpoint-nav: 830px` (token Tailwind v4 en @theme). Navbar pasa de gate `md:` a `nav:` (links desktop, right side, hamburguesa, menú móvil); toggle responsivo: switch en sm:+ (h-10, empata altura con el Button sm de Contacto en desktop), pill compacto propio solo < sm (el Button sm heredado se veía muy grande junto a la hamburguesa; vuelve a escala propia con hover:opacity-80 del sistema). Breakpoint final 830px (dato del usuario, validado: contenido desktop ~767px + colchón ~63px; iPad Air 820 queda móvil, iPad Pro 11" 834 desktop). tsc+build OK. Pendiente verificación visual del usuario (320/640/768/830/834) y commit.

## Verification evidence
- Work unit 1: `pnpm build` → exit 0 (13/13); `pnpm exec tsc --noEmit` → exit 0; assess medium/under_budget; spot check OK.
- next-env.d.ts: ruido de build (ruta de tipos dev), revertido antes del commit.
- Work unit 2: `pnpm build` → exit 0; `pnpm exec tsc --noEmit` → exit 0 (paridad ES/EN garantizada por `satisfies Record<TranslationKey, string>`); assess medium/under_budget (388 líneas agregadas en diff WU2); spot check + readback de diff en pricing/project-detail/[id]/page + copy EN revisado.
- Decisión de diseño WU2: pares responsive usan 2 claves (lg vs mobile) porque los textos difieren; claves compartidas common.caseStudyOfTitle/backToProjects/technologiesUsed/responseTime24h; keys de React siguen data-driven (nunca traducción).

## Next steps (work units posteriores)
- **[PENDIENTE — data bilingüe]** Traducir el contenido de `data/projects.ts` (~330 strings: descriptions, metrics, problem/role/solution con markdown, gallery alts, architecture). Decisión del usuario (2026-09-21): la data aún no es final; se traduce cuando se congele. Enfoque acordado: **modelo bilingüe** (`data/projects-en.ts` mirror + selector `getProjects(lang)` vía cookie server-side / `useLanguage()` cliente), NO claves planas — separa contenido de chrome, evita monolito en translations.ts y permite traducir una sola vez.
- `data/index.ts` es código muerto (0 imports) — candidato a borrar en work unit aparte si el usuario lo aprueba.
- Sync `docs/design/` si el cambio afecta componentes/tokens (en aprobación de work unit).
- Actualizar `docs/ideas-features/language.md` estado a implementado al cerrar.