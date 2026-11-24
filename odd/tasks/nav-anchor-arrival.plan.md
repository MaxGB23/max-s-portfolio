# Plan — cue de llegada vs. navegación en vuelo (antes del primer write)

Estado: **borrador para juicio**. Continúa `nav-volver-ring.plan.md` (ya adjudicado) y
responde a dos hechos nuevos: un bug reportado por el dueño y un bug histórico
encontrado en git.

## Los dos hechos

**Hecho 1 (reportado por el dueño).** `/` → card → ficha → "Volver" devuelve a `/` pero
el scroll queda en el ancla de la URL, no en la posición original. Causa propuesta: la
URL de la home suele llevar hash (`reflectHashInUrl`), y `AnchorArrival` (nuevo,
`48b119d`) lo re-anuncia **después** de que `ScrollRestorer` restauró, pisando el scroll.

**Hecho 2 (histórico, `a5a45dc`, 20 oct).** `announceArrival` hacía
`history.replaceState(null, ...)`; ese `null` borra `history.state`, que Next usa para
confirmar una transición. En una visita fría con RSC lento, el aviso (o su backstop de
1600 ms) disparaba **mid-transición**: el router no podía confirmar, la URL quedaba en
`/#proyectos` y la ficha nunca pintaba. Se arregló con dos guardas, ambas vivas hoy:
preservar `history.state` (`hooks/use-lenis.tsx:49`) y abortar si el ancla no existe en
la página actual (`:42`).

## C1..C8 — afirmaciones a confirmar o refutar

- **C1.** El bug reportado es efecto de `48b119d` y no existía antes: sin
  `AnchorArrival` no había nada que re-anunciara el hash en la llegada de vuelta.
- **C2.** El cambio ya en `HEAD` **no** reintroduce el bug histórico: no agrega ningún
  `replaceState`, reusa `announceArrival`, y las dos guardas de `a5a45dc` siguen
  intactas.
- **C3.** Un backstop viejo no puede sobrevivir a una llegada nueva, porque
  `useScrollToAnchor` incrementa `arrivalToken`, y el backstop compara contra él. (El
  juez debe verificar que el backstop realmente lea el token antes de disparar, no
  asumirlo.)
- **C4.** La guarda propuesta para el Hecho 1 —"si hay posición pendiente de restaurar,
  no anunciar"— es **fiable por orden de efectos**: `AnchorArrival` es hijo de
  `app/page.tsx` y `ScrollRestorer` vive en el layout, y en React los efectos de un hijo
  corren antes que los del padre **dentro del mismo commit**. Es la premisa más
  atacable del plan: vale mientras ambos monten en el mismo commit y mientras
  `ScrollRestorer` no consuma el valor en un commit anterior al primer disparo de
  `AnchorArrival`.
- **C5.** Existe una alternativa que no depende del orden: que `ScrollRestorer` publique
  el hecho ("esta navegación ya tiene destino") y que `AnchorArrival` lo consulte. Si
  C4 es falsa, esta es la salida, al costo de un flag de módulo más.
- **C6.** Endurecer `announceArrival` para que no haga `replaceState` si el pathname
  actual no es la home **no** previene el bug histórico (en ese caso la página vieja era
  `/`, así que la guarda no habría bloqueado nada). Su valor es acotar la reescritura de
  URL, no la navegación.
- **C7.** El bug histórico **no tiene test durable**: se verificó a mano retrasando el
  RSC ~2.6 s. Un script con `page.route()` sobre `**/proyectos/**` con ese retraso puede
  reproducirlo de forma determinista.
- **C8.** Ninguna de las tres tareas agrega trabajo por frame ni cambia el formato
  guardado (`savedHomeScroll` sigue siendo un número suelto).

## Tareas propuestas

**T-A1 — Guarda de posición pendiente en `AnchorArrival`.**
Antes de anunciar, si hay una posición de scroll capturada y sin consumir para esta
llegada, marcar la llegada como resuelta y no anunciar. Sin cambios en
`ScrollRestorer`. Si C4 resulta falsa, se reemplaza por la variante C5.
Aceptación: caso nuevo en `scripts/mobile-anchor-jump.mjs` — home en `/#proyectos` →
scrollear a una card → click → "Volver" → el scroll vuelve a la card y el cue **no**
suena.

**T-A2 — Guarda de pathname en `announceArrival`.**
No reescribir la URL si el pathname actual no es la home. Valor: acotar C6.
Aceptación: los seis casos existentes del script siguen verdes.

**T-A3 — Script de regresión del bug histórico.**
`scripts/rsc-slow-arrival.mjs`: intercepta el RSC de `/proyectos/**` con ~2.6 s de
retraso, carga `/` en frío, scrollea a `#proyectos`, hace click en una card y exige:
la URL termina en `/proyectos/<id>` y el contenido de la ficha está en el DOM.
Debe pasar en `HEAD` y fallar si alguien vuelve a pasar `null` a `replaceState` o si el
anuncio se dispara mid-transición.

## Lo que el plan no resuelve

- Si C4 es falsa, T-A1 tal como está no arregla el bug reportado; hace falta C5.
- T-A3 prueba el escenario histórico con un retraso fijo; una red más lenta que 2.6 s
  queda fuera.
- La aceptación es manual (`scripts/` no corre en CI), igual que el resto de la capa de
  navegador.

## Adjudicación — ronda 1 (jueces A y B, hash `553c019d`)

**Coinciden en lo crítico: C4 refutada por ambos.** `ScrollRestorer` no es ancestro de
`AnchorArrival`: es su **primer hermano** (`components/smooth-scroll.tsx:113`), y React
19.2.4 ejecuta los efectos pasivos de los hijos antes que el del propio fiber, y los
hermanos en orden de montaje. Secuencia real, nombrada por los dos: el "Volver" deja
`pendingRestore` → `ScrollRestorer` lo consume y lo anula → `AnchorArrival` corre después,
ya no encuentra nada y anuncia el ancla, pisando el scroll. **T-A1 tal como estaba no
arregla el bug: la guarda nunca dispara.**

**Arreglo acordado por ambos (queda cerrado):** publicar el traspaso **en el evento**,
fuera de cualquier efecto — dentro de `takeHomeScroll()` (`hooks/use-lenis.tsx:284-290`) y
del promotor de `popstate` (`:307-314`) — y que `AnchorArrival` (`anchor-arrival.tsx:59`)
lo lea y lo limpie. Una variable de módulo, sin dependencia de orden.

**Correcciones al plan:**
- C1: `reflectHashInUrl` **no existe**, es solo un comentario (`hooks/use-lenis.tsx:165`).
  B midió lo que A pedía: `git grep location.hash 48b119d^` no devuelve nada, así que el
  único scroll-a-hash al volver es el que agregó `48b119d`.
- C8: T-A1 **sí** necesita un export nuevo; "sin cambios en `ScrollRestorer`" era falso y
  el plan se contradecía con su propia C5.
- C6 confirmada por ambos: la guarda de pathname no bloquea el caso histórico (la página
  vieja era `/`); su valor es acotar la reescritura de URL, nada más.
- C7: no hay test durable; la reproducibilidad con `page.route` no está medida.
- Ambos señalan el mismo caveat de C3: las llegadas que no pasan por `useScrollToAnchor`
  (la restauración del restorer) no incrementan `arrivalToken`.

### Tareas enmendadas (superseden a T-A1)

**T-A1' — Traspaso por evento.** En `takeHomeScroll()` y en el promotor de `popstate`,
publicar qué navegación ya tiene dueño (variable de módulo con getter y limpiador
exportados). `AnchorArrival` consulta y limpia antes de anunciar. No se toca el efecto de
`ScrollRestorer`. Aceptación en `scripts/mobile-anchor-jump.mjs`: `/#proyectos` → card →
Volver → scroll en la card **y sin cue**; y lo mismo por el botón atrás del navegador.

**T-A2 — Guarda de pathname en `announceArrival`** (sin cambio). Los seis casos actuales
siguen verdes.

**T-A3 — Script de regresión del bug histórico** (sin cambio).

**T-A4 — Aserción AST en CI.** Ningún `replaceState` recibe `null` como primer argumento.
Los dos únicos sitios son `hooks/use-lenis.tsx:49` y `components/navbar.tsx:231`, ambos
preservan `history.state`. Va en `scripts/*.test.mjs` para que corra en `pnpm test`.

**No se corre segunda ronda:** los dos jueces convergieron en la misma corrección y el
riesgo pasó de "arreglo inerte" a una variable de módulo publicada en el evento. Si el
dueño la quiere, ataca solo T-A1' (regla 6: nunca el artefacto entero).
