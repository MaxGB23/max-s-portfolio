# Navegación: el aviso de llegada borraba la transición en vuelo

> **Resuelto (2026-10-20).** Se conserva el método porque el bug no se
> reproducía con la caché caliente y la causa no estaba en el código de
> navegación, sino en un efecto secundario de un temporizador.

## 1. Síntoma

Desde la home: clic en un ancla del navbar (`#proyectos`) y, poco después, clic
en "Ver caso de estudio". La URL se quedaba en `/#proyectos` y la ficha no
pintaba nunca: el `<h1>` del detalle no aparecía (`detailHero = 0`). Con la
caché caliente no se reproducía.

## 2. Reproducción

Playwright/Chromium, con la respuesta RSC de `/proyectos/*` interceptada y
retrasada **2.6 s** (el caso real: primera visita, red lenta). Después:

1. `goto("/")`.
2. Clic en `header a[href="#proyectos"]` (el link del navbar; `a[href="#proyectos"]`
   a secas agarra el del hero).
3. A los ~500 ms, clic por coordenadas en el CTA de la card destacada.

El retraso es obligatorio: sin él la navegación se resuelve antes de que el
aviso tardío pueda pisarla.

## 3. Causa raíz

`announceArrival` (`hooks/use-lenis.tsx`) fijaba el hash con:

```js
window.history.replaceState(null, "", base + href);
```

Ese `null` no es un detalle: Next guarda en `history.state` el árbol de la
navegación en curso. Al pasar `null`, el estado se borra. Si el aviso llegaba
mientras una transición estaba en vuelo — primera visita, RSC lento — el router
se quedaba sin lo que necesitaba para confirmarla y la URL se quedaba en el
ancla de la página anterior.

El aviso no viene solo de `onComplete`: también lo dispara un backstop de
`ARRIVAL_FALLBACK_MS = 1600 ms` que cubre un scroll interrumpido. Ese backstop
podía ejecutarse cuando el visitante ya había pulsado otra cosa, y además no
comprobaba que el ancla existiera en el documento actual: reescribía la URL de
la página de destino con un ancla ajena.

## 4. Fix

1. `replaceState` conserva el estado: `window.history.replaceState(window.history.state, "", base + href)`.
2. `announceArrival` sale antes de tocar la URL si `document.getElementById(id)`
   no encuentra el target.

Verificado con la misma reproducción: antes, a los 3 s la URL era
`/#proyectos` con `detailHero = 0`; después, `/proyectos/caf` con
`detailHero = 1`.

## 5. Lección de método

- En App Router, cualquier llamada manual a `history.replaceState` debe
  arrastrar `history.state`. `null` es una destrucción silenciosa de estado
  ajeno.
- Un temporizador que reproduce una intención anterior (aquel clic de hace 1.6 s)
  necesita validar contra el documento actual antes de actuar: la intención
  pudo quedar obsoleta.
- Un bug "intermitente" suele ser una carrera con una condición de red. Si solo
  se reproduce en frío, hay que fabricar esa latencia en el test; esperar a que
  aparezca sola no es una estrategia.

## 6. Referencias

- `hooks/use-lenis.tsx` — `announceArrival`, `useScrollToAnchor`.
- `docs/design/components.md` §8 — contrato de la infraestructura de scroll.
