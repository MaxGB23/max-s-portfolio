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

## Acceptance criteria
- `pnpm build` y `npx tsc --noEmit` compilan sin errores.
- Primer acceso sin cookie: idioma decidido por Accept-Language en el servidor (cero flash). Cookie presente: respeta la elección previa.
- Toggle ES/EN visible en desktop y mobile; cambia el idioma, persiste cookie y sincroniza `<html lang>`.
- `t('nav.abut')` (typo) NO compila; añadir clave a `es` sin traducir en `en` NO compila.
- Resto de secciones (about, proyectos, pricing, contacto, footer) siguen en español en ES; su traducción es work unit posterior (listada en Next Steps).

## Progress
- Work unit 1 implementada (2026-09-21): infra + navbar + hero. 6 archivos (3 nuevos, 3 modificados). Delegado a writer `general`, gatekeeper OK.

## Verification evidence
- `pnpm build` → exit 0; "Compiled successfully"; 13/13 páginas generadas. Rutas ahora `ƒ (Dynamic)` (esperado: layout lee cookie por request).
- `pnpm exec tsc --noEmit` → exit 0, sin errores (npx bloqueado por permisos; mismo binario).
- `gentle-ai review assess` → medium / under_budget (`review_due: false`). Sin review nativo requerido (RDD off global).
- Spot check del orquestador: tsc re-ejecutado, readback estructural de los 3 archivos nuevos, diff revisado sin drift.
- Decisión del writer: claves extra (`hero.cta.projects`, `hero.cta.cv`, `hero.stack`, `hero.scroll`, `hero.aria.*`, `nav.aria.*`), aria-labels traducidos, `ReactNode` import en lugar de `React.ReactNode`. Aprobado en gatekeeper.

## Next steps (work units posteriores)
- Traducir secciones restantes: about, featured-projects, all-projects, products, pricing, contact, footer, project-detail/card (igual patrón `t()`).
- Sync `docs/design/` si el cambio afecta componentes/tokens (en aprobación de work unit).
- Actualizar `docs/ideas-features/language.md` estado a implementado al cerrar.