# Menú mobile: el scroll cancelado dejaba links "muertos"

> **Resuelto (2026-10-24).** Dos incidentes, una sola causa: **2026-09-14**, en
> un Android real, ningún link del menú mobile funcionaba; **2026-10-24**, en
> producción, funcionaban todas las anclas y solo "Inicio" no hacía nada. El
> primero se parcheó a medias; este documento existe para que no haya un tercero.

## 1. Síntoma

**Incidente de 2026-10-24 (Inicio).** En un teléfono, con el menú mobile abierto,
tocar "Inicio" cierra el menú y deja la página donde estaba. Ninguno de los otros
tres links falla. En el emulador mobile de Chrome DevTools los cuatro funcionan.

**Incidente de 2026-09-14 (anclas).** El mismo cuadro, pero con **todas** las
anclas: el menú se cerraba y el scroll no llegaba nunca a la sección.

## 2. Causa raíz

Los dos caminos de navegación del navbar arrancaban el scroll **en la misma tarea
que cierra el menú**:

```js
// 2026-09-14, antes del primer fix
if (scrollToAnchor(href)) { e.preventDefault(); setMobileOpen(false); }
// 2026-10-24, handleHomeClick (asi quedo hasta hoy)
window.history.replaceState(window.history.state, "", "/");
scrollToTop();            // -> window.scrollTo({ top: 0, behavior: "smooth" })
setMobileOpen(false);
```

En mobile no hay Lenis (gate de 768px), así que el scroll es el nativo del
navegador. `AnimatePresence` anima el cierre del menú con `height: auto -> 0`; si
el scroll suave arranca en el mismo frame en que esa animación empieza, el motor
lo **cancela a los pocos frames**. El resultado es un enlace que "parece muerto":
el menú se cierra y la página se queda quieta.

El primer fix (commit `2d82f60`) reordenó **solo** `handleAnchorClick`
(cerrar -> doble rAF -> scroll) y cambió `scrollIntoView({ smooth })` por
`window.scrollTo({ top: y, behavior: "smooth" })`. `handleHomeClick` se quedó con
el orden inverso: ese día se arreglaron cuatro links y el quinto siguió roto seis
semanas con la misma causa. `f735a22` (limpiar el hash al ir a Inicio) tocó el
`replaceState`, no el orden, así que no fue el culpable.

## 3. Reproducción

Chromium no sirve para este bug: en este entorno resuelve los smooth scroll
programáticos sin animación, o sea sin la ventana en la que ocurre la
cancelación, y por eso DevTools mobile da verde. Hay que usar el motor de Safari:

```js
// playwright, webkit + devices["iPhone 14"], build de producción (pnpm build && pnpm start)
```

Desde `scrollY = 7380`, menú abierto, tocar "Inicio" (medido 2026-10-24):

| Orden ejecutado | Resultado |
| --- | --- |
| scroll y **después** cerrar (código con el bug) | `7380 -> 6715` (arranca y muere) |
| cerrar, 1 rAF, scroll | `7380 -> 0` |
| cerrar, 2 rAF, scroll | `7380 -> 0` |

Control con la misma sesión y el mismo tap: el ancla `#sobre-mi` aterriza exacta
(`7380 -> 1022`), así que el motor sí scrollea; lo que falla es la carrera.

## 4. Fix

Los dos caminos comparten una sola implementación, `closeMenuThenScroll(scroll)`
en `components/navbar.tsx`: cierra el menú, espera el cierre commiteado (doble
rAF) y recién entonces ejecuta el scroll. Con el menú cerrado (desktop) el scroll
sale en el acto, sin rAF. Una sola implementación a propósito: mientras cada
camino tenía su propio orden, el que quedaba fuera se rompía.

La aserción vive en `scripts/navbar-active.mjs` (§`f`) y corre en `webkit`; con
el código arreglado pasa, con el anterior falla con `before=7380 after=7220`.

## 5. Lección de método

- **Un fix de carrera se aplica a la regla, no al síntoma.** Reordenar solo el
  camino que el usuario reportó dejó vivo el mismo defecto en el camino vecino.
  Si la causa es "scroll antes de cerrar", el arreglo pertenece al punto único
  por el que pasan los dos caminos.
- **El emulador equivocado da verde siempre.** Chromium/DevTools mobile no
  reproduce esta clase de bug (ni en 2026-09-14 ni hoy). Cuando el reporte es
  "en el teléfono no funciona", la verificación tiene que cambiar de motor, no
  de tamaño de viewport.
- **Un comentario no es un contrato.** La regla del orden vivía únicamente en el
  comentario de `handleAnchorClick`; quien tocó `handleHomeClick` no tenía por
  qué leerlo. Ahora vive también en `docs/design/platform.md` §8 y en una
  aserción ejecutable.

## 6. Referencias

- `components/navbar.tsx` — `closeMenuThenScroll`, `handleAnchorClick`,
  `handleHomeClick`.
- `hooks/use-lenis.tsx` — `useScrollToTop` y la rama nativa de `useScrollToAnchor`.
- `docs/design/platform.md` §8 — contrato de la infraestructura de scroll.
- `scripts/navbar-active.mjs` §`f` — la aserción en WebKit.
