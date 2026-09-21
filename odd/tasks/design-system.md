# Feature: Design system phase 2 — align code with identity README (design-system)

## Objective
Alinear el código y el canon con la identidad declarada en `docs/design/README.md` (Fase 1, commit `1427c7b`): eliminar código muerto verificado, cerrar deudas tipográficas reales y actualizar `typography-families.md`/`buttons.md` para que el canon deje de declarar deuda ya resuelta. No introduce nuevas decisiones de diseño ni tokens — solo ejecuta lo ya decidido.

## Problem
El canon declara deuda que el código ya resolvió (navbar `text-[15px]`, clase malformada `2xl mx-auto` de pricing), mientras deudas reales siguen abiertas: `SlideIn`/`ScaleIn` son código muerto (0 consumidores) y el precio de pricing no tiene `tabular-nums`. Un canon que miente sobre el estado actual invalida su propio propósito: "los docs canónicos son la fuente de verdad".

## Why
- El propietario aprobó la Fase 1 (README de identidad) y pidió continuar con la Fase 2 (ejecución).
- La convención del repo: el estado del código es la verdad absoluta; los canon la reflejan.
- No tocar `app/layout.tsx` (Geist Mono) — el propietario lo edita en paralelo; la deuda queda documentada como pendiente.

## Scope
- `components/motion-primitives.tsx`: eliminar `SlideIn` / `ScaleIn` (muertos, sin consumidores).
- `components/pricing-section.tsx`: añadir `tabular-nums` al precio (`font-serif font-black text-fluid-price leading-none`).
- `docs/design/typography-families.md`: actualizar deuda conocida (2xl mx-auto resuelto, tabular-nums resuelto, Geist Mono sigue pendiente).
- `docs/design/buttons.md`: actualizar deuda si declara `text-[15px]` (resuelto).
- NO tocar: `app/layout.tsx`, tokens, layout, componentes con consumidores.

## Constraints
- Verificación: `pnpm build` limpio (o `npx tsc --noEmit` + build) tras cada work unit.
- `FadeIn`/`FadeInStagger`/`FadeInItem` se CONSERVAN (tienen consumidores).
- ASCII, conventional commits en inglés, pnpm siempre.
- El propietario trabaja en paralelo en `app/layout.tsx` — no editar ese archivo en esta feature.

## Tasks
- [x] T1: `motion-primitives.tsx` — eliminar `SlideIn`/`ScaleIn` + tipos e interfaces huérfanas
- [x] T2: `pricing-section.tsx` — `tabular-nums` en el precio
- [x] T3: `typography-families.md` — marcar resueltas 2xl mx-auto + tabular-nums; Geist Mono sigue pendiente
- [x] T4: `buttons.md` — marcar resuelto el `text-[15px]` del navbar si se declara
- [x] T5: verificación final (build + estado del árbol)

## Acceptance criteria
- `pnpm build` compila sin errores.
- Cero referencias a `SlideIn`/`ScaleIn` en el repo.
- El precio de pricing alinea dígitos (clase `tabular-nums` presente).
- El canon ya no declara deuda inexistente; la pendiente real queda listada.
- Ningún cambio en `app/layout.tsx`.