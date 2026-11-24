# Plan — Volver contextual y cue de llegada (antes del primer write)

Estado: **borrador para juicio**, no implementado. Feature: `projects-catalog`.
Alcance: dos defectos de navegación posteriores a la página `/proyectos`.
Decisión ya tomada y fuera de discusión: **el catálogo conserva la navbar**, sin "Volver".

## Evidencia leída (citas verificadas en este árbol)

- `hooks/use-lenis.tsx:278-280` — `saveHomeScroll(y: number)` guarda un **número suelto** en un módulo
  (`savedHomeScroll`), sin ruta de origen. Comentario: "Called on portfolio card clicks".
- `hooks/use-lenis.tsx:283-290` — `takeHomeScroll()` consume ese número y lo marca en `pendingRestore`.
- `hooks/use-lenis.tsx:306-314` — un `popstate` promueve `savedHomeScroll` a `pendingRestore` antes de
  que el efecto de pathname lo consuma (cubre el botón atrás del navegador).
- `hooks/use-lenis.tsx:321-330` — `ScrollRestorer`: efecto con deps `[pathname, lenis]`; la última línea
  leída del bloque es `if (pathname === "/") {`. **La restauración está condicionada a la home.**
- `components/project-detail.tsx:372-380` — `handleBack()`: si `takeHomeScroll() != null` hace
  `router.back()` y devuelve; si no, navegación determinista.
- `components/project-detail.tsx:653-657` — el "Volver" es un `<a href="/">` con `preventDefault()`:
  el href nunca se sigue, `handleBack()` decide. (El contrato documentado dice `<a href="/">`; el
  comportamiento real es "volver por historial cuando hay posición guardada".)
- `components/project-card.tsx:111` y `components/featured-project-panel.tsx:135` — ambos hacen
  `saveHomeScroll(window.scrollY)` al click, sin pasar la ruta actual.
- `hooks/use-lenis.tsx:35` — `announceArrival(href)` es **privada** (sin `export`), y según el comentario
  `:27-28` "Plays the CSS arrival cue on the target element via a class".

## C1..C9 — afirmaciones que el juez debe confirmar o refutar

- **C1.** La causa del reset no es que falte contexto de origen: es que `ScrollRestorer` solo restaura
  cuando el destino es `/` (`use-lenis.tsx:330`). Por eso `router.back()` sí vuelve a `/proyectos` y
  aterriza en el tope.
- **C2.** Por lo tanto el arreglo mínimo del "Volver" **no** requiere cambiar el formato guardado
  (número → objeto con ruta) ni el mecanismo de historial: alcanza con permitir la restauración en la
  ruta del catálogo.
- **C3.** El valor guardado sigue siendo de una sola página por vez, y `pendingRestore` se consume en un
  solo efecto, así que no hay riesgo de aplicar una coordenada a dos destinos distintos dentro del mismo
  flujo.
- **C4.** El cue de llegada (ring de contacto) no se dispara al navegar desde otra ruta porque
  `announceArrival` solo se invoca desde la ruta de click de ancla, y es privada; no existe hoy un punto
  de entrada que lo dispare al montar la home con `#contacto`.
- **C5.** Atar el cue a la llegada (una vez, al montar, si el hash corresponde a una sección conocida) no
  requiere interceptar clicks en el navbar ni añadir trabajo por frame.
- **C6.** El repo no tiene banco de pruebas de componentes: `pnpm test` corre `node --test` sobre
  `scripts/*.test.mjs` y `lib/*.test.ts`. La aceptación de ambos arreglos será una corrida manual en
  navegador, no un test automatizado.
- **C7.** La propagación de `#contacto` desde `/proyectos` resuelve a `/#contacto` (navbar route-aware,
  `components/navbar.tsx` `resolveHref`). El aterrizaje en la sección lo resuelve el navegador/Lenis; que
  el ring no aparezca indica que el scroll sí ocurre y solo falta el anuncio. **Esta premisa es
  inferencial: no la medí.**
- **C8.** Ninguno de los dos arreglos introduce trabajo por frame: el de scroll corre una vez al cambiar
  de ruta, y el del cue una vez al montar o al cambiar de ruta.
- **C9.** El plan no toca la home, ni el ancho, ni el diseño aprobado de `/proyectos`, ni la navbar
  (salvo que C4 exija un export).

## Tareas propuestas

**T-N1 — Restauración de scroll en el catálogo.**
Cambiar la condición de `ScrollRestorer` para que restaure también cuando el destino es `/proyectos`
(allowlist explícita de rutas, no "cualquier ruta"). Sin cambios de formato, sin estado nuevo.
Aceptación manual: `/proyectos` → scrollear hasta la fila de "Trabajo anterior" → abrir una ficha →
"Volver" → vuelve a `/proyectos` en esa posición exacta. Y el flujo desde la home sigue idéntico.

**T-N2 — Cue de llegada atado al hash.**
Exportar un disparador mínimo desde `hooks/use-lenis.tsx` que, dado `#contacto` (o el hash presente al
montar), ejecute el mismo anuncio que hoy corre tras el click. Llamarlo una vez cuando la home monta con
hash, y al cambiar a la home con hash. Sin interceptar el navbar.
Aceptación manual: `/proyectos` → "Contacto" → la home aterriza en contacto **con** ring; click de
"Contacto" estando en la home → idéntico a hoy; abrir `/#contacto` directo → ring.

**Explícitamente fuera de alcance:** navbar del catálogo, etiqueta del botón "Volver a proyectos",
cualquier cambio en `/` que no sea el disparador del cue, y cualquier librería nueva.

## Riesgos que el plan no resuelve

- Si C7 es falsa y el scroll a `#contacto` tampoco ocurre, T-N2 no alcanza: haría falta restaurar también
  el salto entre rutas.
- El allowlist de rutas en T-N1 duplica conocimiento del mapa de rutas; con dos rutas es aceptable, con
  cinco deja de serlo.
- La aceptación es manual en ambos casos y depende del ojo del dueño, no de un test.

## Adjudicación — ronda 1 (jueces A y B, mismo hash)

**Coinciden (queda cerrado):** C1 confirmada por ambos — la causa es la puerta de ruta
(`use-lenis.tsx:330`), no la falta de origen. C2 confirmada: la card del catálogo ya
guarda su posición (`project-card.tsx:111`) y `project-detail.tsx:375-377` ya hace
`router.back()`. C4 confirmada: `announceArrival` es privada y solo se invoca desde
callbacks de click (`:208`, `:227`). C7 **parcial en ambos**: mi inferencia "no aparece
el ring, entonces el scroll sí ocurrió" es inválida; la ausencia no discrimina y hay
que medirla. C9 parcial en ambos: T-N2 exige tocar el montaje de la home, así que la
frase "no toca la home" era contradictoria. Q2: ninguno considera suficiente el
disparo al montar.

**Discrepan en Q1 y decide un hecho:** A propone una puerta por presencia
(`if (pendingRestore != null)`) como arreglo más chico. B la refuta con una secuencia
concreta: home → ficha (guarda posición) → navbar empuja `/proyectos` → atrás del
navegador → `popstate` promueve el valor (`:315-318`) → el efecto corre con la ruta de
la FICHA y aplica una coordenada de grilla al detalle, consumiéndola. Como el destino
del pop no se guarda en ningún lado, **el test de ruta es irreductible**: gana B. Una
denylist es igual de grande, no más chica.

**Pero A gana un punto que B no vio:** escrito como `"/" || "/proyectos"`, una
llegada a `/proyectos` sin valor pendiente sale por el early return (`:332-335`) y se
salta el scroll-al-tope (`:354-360`), que hoy sí aplica. El arreglo correcto es la
puerta relajada **con el tope preservado**, no una línea.

**C6:** A gana el matiz — no hay banco de componentes, pero
`scripts/mobile-anchor-jump.mjs:83` ya verifica la clase `arrive`, así que la
aceptación del ring es automatizable y no solo manual.

**Citas corregidas:** la promoción del popstate está en `:315-318` (no `:306-314`);
`handleBack` en `project-detail.tsx:371` (no 372); el tope en `:354-360`.

### Tareas corregidas (superseden a T-N1 y T-N2)

**T-N0 (prerrequisito, medir antes de escribir).** Correr el flujo real
`/proyectos` → "Contacto" en navegador y registrar: ¿la home aterriza en la sección de
contacto? ¿aparece el ring? Sin ese dato, C7 sigue sin decidir y T-N2 puede quedar
corta.

**T-N1' — Restauración en el catálogo, con el tope preservado.** En `ScrollRestorer`,
entrar al bloque cuando `pathname` es `/` **o** `/proyectos`; dentro, si hay valor
pendiente restaurarlo y salir, y si no hay, caer al scroll-al-tope de hoy. Sin cambio
de formato guardado, sin estado nuevo, sin tocar historial.
Aceptación: los dos flujos existentes siguen igual + el nuevo (`/proyectos` → ficha →
Volver vuelve a la posición) + llegada a `/proyectos` sin valor pendiente sigue yendo
arriba.

**T-N2' — Cue atado a la llegada, reusando la autoridad existente.** No agregar un
segundo anuncio: al montar la home con un hash conocido, invocar **una sola vez** el
mismo camino de `useScrollToAnchor`, que ya posee el token de llegada, el backstop y el
cue. Evita el doble ring que B señala (backstop de 1600 ms sin cancelar, `:212`, y el
token que no se incrementa al montar) y no añade trabajo por frame.
Aceptación automatizable: extender `scripts/mobile-anchor-jump.mjs` para cubrir la
llegada con hash desde otra ruta y verificar que la clase `arrive` se aplica una sola
vez.

**Alcance corregido:** T-N2' toca el montaje cliente de la home (un efecto, nombrado en
la tarea). Nada más de `/` se toca.
