# 📌 Decisión: reduced-motion — auditado y planeado, NO aplicado

## Estado
Audit de accesibilidad `prefers-reduced-motion` completado (2026-09-20, resumen técnico en Engram — obs 838). La remediación quedó **planeada pero no aplicada** por decisión explícita.

## Por qué no se aplica
- Las animaciones del sitio son **entradas pequeñas** (opacity/translate ≤ 20px, una sola vez). La regla estricta de WCAG 2.3.3 apunta a movimiento grande no esencial disparado por interacción (parallax agresivo, loops infinitos), no a fades de entrada.
- Coste/beneficio: el pase completo = gates en 6+ archivos + CSS de contingencia + re-test; el beneficio es honrar una preferencia "nice-to-have" sin un bug real reportado (el único caso real fue el arrival cue, ya resuelto).
- Lo que **sí** está cubierto: el arrival cue tiene fallback estático bajo `reduce` (único punto del repo que lee la media query, `app/globals.css`).

## Plan si algún día se aplica (en orden)
1. `MotionConfig reducedMotion="user"` en `app/layout.tsx` — 1 línea, cubre todo Framer Motion (mantiene fades de opacidad, que es lo recomendado).
2. Gate en `components/smooth-scroll.tsx` — saltar Lenis bajo `reduce` (el único movimiento por inercia del sitio).
3. Opcional: gate en `hooks/use-gsap-animation.ts` + bloque CSS `!important` para hero/about. ⚠️ Riesgo G1: hero y about ocultan el contenido dos veces (inline `opacity:0/visibility:hidden` + `gsap.set(autoAlpha:0)`); un gate a medias los dejaría invisibles para siempre.

## Gatillo para revisar
- Si el sitio incorpora parallax, loops infinitos o movimiento de gran amplitud → aplicar al menos los puntos 1–2.
- Si alguien retoca las animaciones de hero/about → resolver G1 antes de tocar nada.