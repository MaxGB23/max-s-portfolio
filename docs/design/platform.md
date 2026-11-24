# Plataforma - tema, scroll, debug y gotchas

<!-- toc:start -->
- [7. Tema y dark mode](#7-tema-y-dark-mode)
- [8. Infraestructura de scroll](#8-infraestructura-de-scroll)
- [10. Debug overlay](#10-debug-overlay)
- [11. Gotchas](#11-gotchas)
- [13. Deuda](#13-deuda)
<!-- toc:end -->
<!-- docs-lint: allow-tokens next-themes ThemeProvider -->

> [!NOTE] Estado: CANONICO
> Parte del canon de geometria que vivia en un solo `components.md` hasta el
> 2026-10-21. Numeracion compartida: este archivo cubre 7, 8, 10 y 11; el resto vive en `sections.md` y `motion.md`.
> Si un cambio visual contradice este archivo, el CODIGO gana y el doc se
> actualiza. Glosario de migracion: `docs/design/archive/2026-09-21-pre-designmd/INDEX.md`.

## 7. Tema y dark mode

- Tema: `class="dark"` renderizado por el SERVIDOR en el `<html>`
  (layout.tsx). No hay provider ni script de tema: `next-themes` y
  `components/theme-provider.tsx` se eliminaron en el track
  `css-first-reveal` (el tema es forzado y no hay toggle, asi que el provider
  solo inyectaba un script). Sin JS el sitio se ve oscuro, porque la clase
  viene en el HTML.
- `DarkModeToggle` esta DESMONTADO (import comentado en navbar.tsx): reintroducirlo
  requiere plan de tema completo; no descomentar a ciegas. El modo light existe
  solo como derivado de tokens (ver seccion 7 y `tokens.md`), sin UI para
  alternar.

## 8. Infraestructura de scroll

- `SmoothScroll` (`smooth-scroll.tsx`): Lenis SOLO desktop (gate reactivo
  sobre `(min-width: 768px)`); config `duration: 0.6`, easing expo-out,
  `smoothWheel: true`, `wheelMultiplier: 1`;
  `gsap.registerPlugin(ScrollTrigger)`,
  `lenisInstance.on("scroll", ScrollTrigger.update)` con rAF nativo y
  `gsap.ticker.lagSmoothing(0)`.
- **El gate de Lenis es reactivo, no una lectura unica al montar.**
  `smooth-scroll.tsx` escucha `matchMedia("(min-width: 768px)")` y arranca o
  destruye Lenis en cada cambio de media. Antes el gate era un
  `window.innerWidth < 768` leido una sola vez en el montaje: un telefono que
  cargaba en landscape (844px) creaba Lenis y lo mantenia VIVO despues de rotar
  a portrait, donde el resto de la app asume `lenis === null`
  (`pointer-gestures.md` 7: en mobile el overflow es el unico scroll lock). El
  teardown devuelve ademas `gsap.ticker.lagSmoothing(500, 33)`, para no dejar al
  mobile con el ajuste que Lenis le puso a GSAP en desktop. Es un defecto
  INDEPENDIENTE del retrato de About: con el gate ya reactivo el retrato seguia
  roto, y esa causa vive en `section-animations.md` ("Entradas creadas dentro de
  `gsap.matchMedia`").
- **`duration` 0.6, no 1: medido.** Con `scripts/audit-projects.mjs` (desktop
  2048x1280 dpr1.25, gesto `--wheel`, iGPU) la animacion de 1s deja 7.8% de
  frames avanzando menos de la mitad del paso y la pagina llega tarde respecto
  a la mano — ese es el "delay" que se percibe. A 0.6 baja a 4.6%, el salto
  maximo por frame de 43-47px a 39-41px y el ratio max/mediana queda en
  5.0-6.6x. **0.6 gana a 0.5 en las tres metricas** (0.5: cola 4.5-5.1% pero
  ratio 7.3-7.7x, o sea cada notch pega mas fuerte), asi que 0.6 es el valor.
- **La curva NO se cambia.** `ease-in-out` (arranque lento) con input
  re-apuntado acumula deuda: `current` se queda atras de un `target` que sigue
  sumando notches y al cesar el gesto la deuda se descarga de golpe. Medido:
  saltos de 1315px en un frame y el scroll terminando en 0.4s. El ease-out
  exponencial es obligatorio.
- **Frames muertos: ~1 por notch, estructurales.** ~12.6% del gesto y ~26% de
  la ventana asentada, identico con `duration 1`, `duration 0.5`, `duration
  0.6`, `lerp 0.1` y `lerp 0.2` (~108 en valor absoluto en las cuatro). Es el frame en que el
  evento nuevo re-apunta la animacion sin que la posicion avance, y ocurre
  justo cuando la mano se mueve: no se percibe como frenazo y NO es ajustable.
- **Un scroll nativo ajeno durante un glide se adopta.** Arrastrar la barra
  nativa, PageDown, buscar en la pagina o el autoscroll del click central
  escribe la posicion mientras Lenis anima: su `onNativeScroll` ignora el
  evento con `isScrolling` en "smooth" y el rAF reescribe la vieja hasta
  400ms despues (upstream #107 abierto, #168 y #365 cerrados sin fix).
  `smooth-scroll.tsx` escucha `scroll` en `window` y adopta con
  `scrollTo(y, { immediate: true })`; el widget de la barra nativa no emite
  evento DOM (solo se ve el resultado) y el repo no consume `scrollend`.
  Medido con `scripts/scroll-guard.mjs`: 25 reversiones y -3092px sin el guard,
  0 y 0px con el.
- `useScrollToAnchor(64)`: `lerp: 0.1` (sin duracion fija, ver
  `useScrollToTop`); aterriza con el CONTENIDO del
  target bajo el navbar (compensa la suma de `padding-top` de 2 niveles:
  shell + primer hijo — para `#contacto` eso lee el `SECTION_GAP_Y` que vive en
  `#contact-content` y devuelve el badge/titulo justo bajo el navbar; para el
  resto de anclas ambos niveles son 0, o sea no-op); al completar — o a los
  `ARRIVAL_FALLBACK_MS = 1600ms`, backstop que cubre un tween interrumpido —
  `announceArrival`
  (fija hash con `history.replaceState` CONSERVANDO `history.state`: pasar
  `null` borra el estado de navegacion de Next y mata la transicion en vuelo,
  ver `docs/issues/navigation-race.md`; aborta si el ancla no existe en el
  documento actual, y aplica la clase `arrive` con reflow forzado; mobile:
  salto propio, ver el bullet siguiente). NO usa `:target`
  (replaceState no lo actualiza, ver seccion 9). La URL solo se reescribe en la
  home (`location.pathname === "/"`): las anclas que el aviso escribe viven solo
  ahi, y el backstop puede llegar cuando la pagina actual ya es otra (el anillo
  se pinta si el id existe, la URL de esa ruta no se toca). **CI**:
  `scripts/anchor-state-guards.test.mjs` (corre en `pnpm test`) recorre las
  llamadas a `replaceState` de `hooks/` y `components/` y falla si alguna pasa
  `null` como PRIMER argumento (el bug de `a5a45dc`); sus casos de fixture
  prueban que el detector discrimina y que un `history.state` conservado no es un
  hallazgo.
- **La llegada con hash anuncia por el MISMO camino que el click
  (`components/anchor-arrival.tsx`, montado solo en la home).** El aviso vivia
  unicamente dentro del callback del click, asi que `/proyectos` -> CTA de
  contacto aterrizaba en la seccion (lo resuelve el navegador/el router) y no
  anunciaba nada; una carga directa de `/#contacto` quedaba igual, sin la clase
  `arrive`. El componente lee `location.hash` UNA vez al montar y, si nombra un
  elemento que existe en el documento, invoca `useScrollToAnchor`: no
  reimplementa `announceArrival` ni agrega un segundo temporizador. Eso arrastra
  el token de llegada, y ese `++arrivalToken` del camino compartido es lo que
  invalida un backstop de 1600 ms rezagado y lo que impide que un montaje con
  hash mas un backstop viejo pinten dos anillos. Se dispara como maximo una vez
  por montaje (`announced` se marca ANTES de llamar): el efecto se re-ejecuta
  cuando Lenis llega una comision despues del montaje (el efecto del hijo corre
  antes que el del padre) y en el doble efecto de StrictMode, y ninguna de esas
  corridas es una segunda llegada. En desktop ESPERA a Lenis en vez de anunciar
  por la rama mobile de una pagina desktop (`(min-width: 768px)` es el mismo
  gate de `smooth-scroll.tsx`); donde no hay ni habra Lenis (mobile) anuncia en
  la primera corrida. Antes de viajar llama `lenis.resize()`: Lenis clampea el
  destino contra el `limit` que midio en la ruta que se ABANDONA
  (lenis.mjs:860) y su propio ResizeObserver llega un frame tarde, asi que
  llegar desde el catalogo clampaba el viaje al limite del catalogo y dejaba la
  seccion 3.087 px fuera de vista (medido en el rig desktop del script, antes
  del `resize`); es el mismo paso que ya da `ScrollRestorer`. No se monta en
  `/proyectos` ni en `/proyectos/[id]`, no observa cambios de hash y se rinde si
  el hash no nombra un elemento de este documento, asi que el click dentro de
  la home sigue siendo el dueno de todo ancla posterior. **Verificacion**: casos
  D de `scripts/mobile-anchor-jump.mjs`, en mobile WebKit (390x844) y desktop
  (1280x800, con Lenis), que exigen la seccion EN VISTA y la clase `arrive`
  aplicada EXACTAMENTE una vez; el conteo usa las subidas de la clase
  (`oldValue` registro a registro), asi que el remove -> reflow -> add de un
  segundo aviso se ve como dos, no como uno.
- **Una llegada con hash que ya tiene dueno NO se anuncia
  (`scrollOwnerClaim`).** `/` aparcada en `/#proyectos` -> card -> ficha ->
  "Volver" (o el boton atras del navegador) devuelve al visitante a la posicion
  capturada, y la URL vuelve con `#proyectos`; sin marca, `anchor-arrival.tsx`
  monta, encuentra el hash y anuncia el ancla, pisando el scroll restaurado. La
  guarda NO puede ser un "hay una posicion pendiente?" dentro de
  `AnchorArrival`: `ScrollRestorer` es su HERMANO y esta montado antes
  (`smooth-scroll.tsx`), y React corre los efectos pasivos de los hermanos en
  orden de montaje, asi que cuando corre el efecto de la pagina el restorer ya
  consumio `pendingRestore` y esa guarda lee false. El dueno lo publica el EVENTO
  que arranca la navegacion (`takeHomeScroll()` en el click de Volver y el
  promotor de `popstate`, los dos antes de que la navegacion se confirme) en una
  variable de modulo con getter y limpiador exportados
  (`consumeAnchorOwnership()`), y `AnchorArrival` la consulta y la limpia ANTES de
  decidir: sin dependencia de orden y sin tocar el efecto del restorer. La marca
  guarda la RUTA donde se capturo la posicion (`savedHomePath`, escrito por
  `saveHomeScroll`), asi que un scroll guardado en `/proyectos` no silencia una
  llegada legitima a la home. **Verificacion**: casos E de
  `scripts/mobile-anchor-jump.mjs` (mobile WebKit 390x844 y desktop 1280x800), en
  el mismo flujo por el pill y por el boton atras, que exigen el scroll restaurado
  (tolerancia 16px) y el conteo de anillos sin subir; medido antes del arreglo:
  mobile 4191 -> 1732 y desktop 3176 -> 1382, con el anillo 1 -> 2 en los cuatro
  casos; despues: 4191 -> 4191 y 3176 -> 3176, anillo 1 -> 1. El caso "back" es
  el que prueba el promotor de `popstate` (el pill publica desde
  `takeHomeScroll`): desactivar esa linea deja verdes los casos "volver" y rojos
  solo los "back".
- **El salto de ancla en mobile es propio (`animateScrollTo`), no
  `window.scrollTo({ behavior: "smooth" })`.** Medido el 2026-11-03 sobre build
  de produccion 390x844 dpr2 (`node scripts/mobile-anchor-jump.mjs`). El defecto,
  en WebKit (el unico motor que anima el nativo: Chromium headless resuelve el
  viaje en UN frame de 6 ms, el mismo enmascaramiento que ya describe
  `docs/issues/mobile-menu-scroll-cancelled.md` 3): el nativo tarda 249 ms en
  1022 px y 222 ms en 9865 px — la duracion la fija el motor y NO crece con la
  distancia, asi que el viaje lejano cruza 8998 px en un solo frame y se lee como
  teletransporte, mientras el cercano se lee como scroll. Es la misma trampa que
  `useScrollToTop` evita en desktop al no usar `duration`: una duracion que no
  mira la distancia. `animateScrollTo` escribe el viaje con
  `requestAnimationFrame` + `easeOutCubic` y una banda de duracion
  (`MOBILE_SCROLL_SHORT_MS` 320 ms, que sube a `MOBILE_SCROLL_MS` 560 ms al
  alcanzar `MOBILE_SCROLL_RAMP_PX` 400 px). La distancia NO entra en la duracion:
  comprimir 9865 px en el presupuesto de un salto corto es exactamente el efecto
  que se quita, asi que el tramo lejano gasta su recorrido. Medido en Chromium
  (cadencia real): 533 ms / 1022 px en 90 frames y 552 ms / 9866 px en 49 frames,
  o sea spread x1.04 entre el destino cercano y el lejano. Medido en WebKit: los
  mismos dos viajes en 8 frames y 441/855 ms — ahi el numero largo es coste de
  pintura del rig (huecos de hasta 424 ms), no la curva, porque el tween escribe
  una vez por frame. Dos efectos buscados: un toque, rueda o tecla cancelan el
  salto — el nativo tambien cede al dedo — y un salto nuevo cancela el anterior;
  y el aviso de llegada pasa a ser una senal real, asi que el `setTimeout(1000)`
  que habia se elimino, porque podia anunciar la llegada antes de aterrizar.
  Contrato verificado por el script: el anillo dispara `MOBILE_CUE_DELAY_MS`
  (180 ms) DESPUES del ultimo movimiento — en el mismo frame se leia como parte
  del frenado y no como la respuesta al click (feedback del dueno en telefono
  real) —, nunca antes, en los dos destinos, y **tambien dispara si el salto se
  interrumpe con un toque** — el viaje cede al dedo, pero el ancla se
  pulso y el aviso se debe; es la misma regla que sostiene el backstop de
  desktop, porque un aviso perdido es peor que uno sobre un destino del que el
  visitante se aparto. Lo unico que no anuncia es un salto reemplazado por otro:
  ahi el aviso escribiria el hash del destino viejo un frame antes de que arranque
  el nuevo, y el mismo `arrivalToken` invalida el aviso pendiente de un salto
  reemplazado, para que el hash viejo no se escriba 180 ms tarde. No esta en `pnpm qa` (`verification-policy.md` 5);
  `PW_ENGINE=chromium` existe solo para separar "el tween pinta pocos frames" de
  "este rig no tiene GPU".
- `useScrollToTop`: `lerp: 0.1`, sin duracion fija. El viaje converge en
  `ln(distancia)/6` segundos: ~0,9s a 300px, ~1,2s a 1200px, ~1,5s a 8000px
  (medido: 1241px -> 1260ms; con `duration` fija eran 2s para cualquier
  distancia). Lenis escala el lerp por delta time, asi que el refresco de
  pantalla no cambia la duracion.
- Inicio desde la propia home (`handleHomeClick`): `preventDefault` +
  `history.replaceState(state, "", "/")` + `useScrollToTop`. El hash se limpia
  en el CLICK, no en un `onComplete`: si el visitante interrumpe el scroll, la
  URL igual queda sin ancla.
- **Contrato de los dos caminos de navegación (`closeMenuThenScroll`)**: el
  scroll programático NUNCA arranca en la misma tarea que cierra el menú móvil.
  Hoy el salto mobile es propio (`animateScrollTo`, bullet anterior), así que el
  motor ya no puede cancelarlo a mitad; el doble rAF se conserva porque el
  contrato es UNO solo para ancla e Inicio (cuando cada camino llevaba su propio
  orden, el que quedó fuera se rompió dos veces) y porque la posición de partida
  se muestrea con el panel ya cerrando. Histórico, y la razón del orden actual:
  con el `window.scrollTo({ behavior: "smooth" })` de entonces el navegador
  cancelaba el scroll si el exit del menú (`height: auto -> 0`) empezaba en el
  mismo frame, y el link parecía muerto. Con el menú ya cerrado (desktop) el
  scroll sale en el acto, sin rAF. El relato completo del defecto y las dos
  mitades que se arreglaron por separado: `docs/issues/mobile-menu-scroll-cancelled.md`.
  **Verificación**: no se reproduce en Chromium ni en el emulador mobile de
  DevTools (ahí los smooth scroll programáticos se resuelven sin animación, o
  sea sin la ventana donde ocurre la cancelación). La aserción que distingue los
  dos órdenes vive en `scripts/navbar-active.mjs` y corre en `webkit` — instala
  el binario una vez con `npx playwright install webkit`.
- Handoff grilla -> detalle: `saveHomeScroll(scrollY)` en el click de las cards de
  la home **y** del catalogo `/proyectos`; `takeHomeScroll`/`ScrollRestorer` en el
  retorno. El restorer solo aplica la posicion guardada en esas DOS rutas: un
  `pendingRestore` promovido por `popstate` no sabe a donde vuelve, asi que una
  puerta por presencia aplicaria una coordenada de grilla a una ficha. Cualquier
  otra ruta conserva el scroll al tope. Sin pin no hay pin-spacer que esperar:
  recalcula el limite de Lenis (`lenis.resize()`) y hace `scrollTo(target, {
  immediate: true })`. `saveHomeScroll` guarda tambien la RUTA donde se capturo
  (`savedHomePath`): es el valor que publican `takeHomeScroll` y el promotor de
  `popstate` en la marca del bullet de la llegada con hash.
- **F5 dentro de una seccion: manda el ancla de la URL, no la posicion
  restaurada.** El hash lo escribe `announceArrival` al ATERRIZAR, y no hay
  ningun spy que lo actualice al scrollear, asi que la URL conserva la ULTIMA
  ancla pulsada, no la seccion visible. En una recarga el navegador aplica
  primero el fragmento y acto seguido la posicion restaurada de la sesion:
  medido el 2026-10-30 (sonda Playwright que muestrea `window.scrollY` por
  frame con `addInitScript` y luego `page.reload()`; 1600x900, hash `#sobre-mi`
  con la pagina en `#contacto`) da `53ms -> 742` y `61ms -> 5693`. Desde el
  montaje con hash de `anchor-arrival.tsx` el viaje al ancla se rehace, asi que
  el estado final es la seccion del hash y no la posicion de la sesion: si el
  hash quedo viejo respecto de donde estaba el visitante, la recarga lo lleva al
  ancla (con el viaje visible). Es el precio de que una llegada con hash se
  anuncie, que es la mitad que faltaba del defecto `/proyectos` -> contacto. NO
  se sincroniza el hash con `use-active-section.ts` para eliminarlo del todo: el
  precio es un tercer escritor de la URL justo donde `a5a45dc` ya mato una
  navegacion en vuelo (`docs/issues/navigation-race.md`). Si se retoma, las
  guardas no negociables son `replaceState(window.history.state, ...)`, solo en
  `pathname === "/"`, y solo si `document.getElementById(id)` existe.
- **Gate de 768px: decision consciente, NO tocar.** `syncTouch = false` es el
  default de Lenis y el codigo no lo overridea, asi que en touch Lenis es
  pasivo: `onVirtualScroll` retorna temprano (lenis.mjs:649-655, sin
  `preventDefault` ni `scrollTo`) y `onNativeScroll` solo adopta la posicion
  del navegador (lenis.mjs:696-707). Por eso la imprecision del gate (un tablet
  o un telefono al rotar cruzan 768px y activan Lenis) no cuesta nada
  perceptible.
- **Descartado: cambiar el gate por `(hover: hover) and (any-pointer: fine)`.**
  Ningun ancho separa desktop de touch (landscape de telefono ~932-956 CSS px
  < portrait de iPad Pro 12.9 = 1024) y ademas seria perdida neta: touch
  dejaria de tener `lenis.scrollTo(..., { onComplete })` preciso para
  `announceArrival` y el `lenis.resize()` del `ScrollRestorer`, degradando a
  `window.scrollTo` + `setTimeout(1000)`.
- **Descartado: mover los imports de `gsap`/`ScrollTrigger` a dynamic.**
  Medido en el chunk del root layout: lenis 4.8 KB + ScrollTrigger 17.4 KB +
  gsap 27.6 KB = 49.9 KB gzip. Ahorraria 0 bytes: `ScrollTrigger` se registra
  solo en `use-gsap-animation.ts:41-45`, `scroll-progress.tsx:17-19` y
  `project-detail.tsx:126,196`, y `ScrollProgress` se renderiza en todas las
  rutas (`app/page.tsx:16`, `app/proyectos/[id]/page.tsx:48`). Solo moveria el
  fetch a un chunk async.
- El 768 es un literal en `smooth-scroll.tsx` (la media query del gate), NO
  vive en `lib/breakpoints.ts` (seccion 3): no lo centralices sin releer esta
  seccion.
  `ScrollTrigger` no depende de que Lenis este vivo, asi que el gate no puede
  romper animaciones de scroll. Nota: `import gsap from "gsap"` resuelve por
  `module: index.js` (bundle completo, 71.1 KB), no a un core minimo.
- **El navegador puede tener la animacion de scroll APAGADA por el SO.**
  Verificado el 2026-11-02 en el worktree sin Lenis: con "Animar los controles y
  elementos dentro de las ventanas" activada (`systempropertiesperformance`,
  Windows) un click del navbar anima el scroll; con la casilla apagada, el mismo
  click salta seco. El interruptor es
  `gfx::Animation::ScrollAnimationsEnabledBySystem()`
  (`ui/gfx/animation/animation_win.cc`, `animation_linux.cc`, `animation_mac.mm`
  en Chromium). Por plataforma: Windows devuelve `ShouldRenderRichAnimation()`,
  que lee `SystemParametersInfo(SPI_GETCLIENTAREAANIMATION)` — **la misma casilla
  que decide `prefers-reduced-motion: reduce`**; Linux devuelve
  `ui::LinuxUi::AnimationsEnabled()` (el ajuste global del toolkit: *Animaciones*
  de GNOME, `gtk-enable-animations`); macOS NO usa Reduce Motion, lee el default
  privado `NSScrollAnimationEnabled`. O sea: en Windows y Linux "animaciones del
  SO apagadas" implica scroll nativo escalonado; en macOS no.
- **El suave de un click sin Lenis es NUESTRO, y es condicional.** `html` fija
  `scroll-behavior: auto` (globals.css:200), asi que la navegacion por fragmento
  es instantanea a proposito; lo que anima es el fallback nativo
  `window.scrollTo({ top, behavior: "smooth" })` (`hooks/use-lenis.tsx:117` en el
  camino mobile, `:144` en `useScrollToTop`). Con la animacion del SO apagada ese
  `behavior: "smooth"` se resuelve como salto — el fallback se degrada en
  silencio, sin error ni log. No hay API web para leer ese interruptor.
- **Decision: Lenis es load-bearing, no decoracion.** Para el perfil Windows o
  GNOME con animaciones del SO apagadas por rendimiento (el mismo perfil que
  dispara `prefers-reduced-motion: reduce` sin intencion de accesibilidad), sin
  Lenis el scroll no queda "menos pulido": queda escalonado. Ademas Lenis da
  curva propia, `onComplete` para el aviso de llegada y `lerp` por distancia, que
  el nativo no expone. El argumento "el nativo ya alcanza" solo es cierto con la
  animacion del SO encendida, y la pagina no puede saber en cual esta.
- **Alcance deliberado:** el dueno del producto corre un Windows sin animaciones
  (instantaneo por rendimiento, no por accesibilidad) y aun asi quiere scroll
  autorado AQUI, no en el sistema. La razon es estetica y de superficie: un SO es
  una herramienta y lo instantaneo se siente correcto en ella; la animacion
  nativa de los controles se percibe falsa; una landing es una superficie de
  presentacion y ahi el movimiento es el producto. Por eso la animacion se autora
  en el sitio en vez de delegarse al SO, y por eso no se "restaura" el nativo.
- **Presupuesto de frame y gate de la entrada de seccion.** A 165 Hz el
  presupuesto es 6,06 ms por frame (8,33 a 120 Hz, 16,7 a 60 Hz): el MISMO
  trabajo de 65 ms son 11 frames perdidos a 165 y 4 a 60, asi que un tiron puede
  depender de la tasa de refresco sin que cambie el coste ni una linea de codigo.
  La entrada a `#all-projects` se mide con `node scripts/audit-projects.mjs
  --profile desktop --viewport 2048x1280 --dpr 1.25 --net off --wheel --headed
  --trace` sobre build de produccion (dev falsifica next/image): la ventana
  `fade de la grid (700ms)` debe quedar con maximo <= 16,7 ms y 0 frames > 32 ms,
  y el `GPUTask` mayor < 10 ms. Estado 2026-10: 18,1 ms y 9,6 ms. Matriz de
  variantes falsificadas, atribucion y metodo en
  `docs/issues/all-projects-entry-jank.md` 6.3.

## 10. Debug overlay

- Convencion de profundidad: se cuenta desde el ancestro marcado mas externo.
  Los wrappers sin marcar (wrappers de animacion, `motion.div`) NO
  cuentan, y varias raices hermanas arrancan cada una en l1. Regla: ningun
  marker puede tener nivel <= el de un ancestro marcado.
- `Section.debug`: `default` (l1 outer / l2 inner) o `none` (sin markers). El
  shell no re-mapea niveles: no puede emitir un marker por encima del de su
  ancestro marcado. Sin cambios de layout en produccion (los markers dependen
  de `data-debug-<canal>` en `<html>`).
- Activacion por canal: `LAYOUT_DEBUG: DebugChannel[]` en `app/layout.tsx`;
  cada entrada del array anade un atributo `data-debug-<canal>` al `<html>`.
  `[]` = apagado.
- `l1`..`l5` son nivel de profundidad (l1 = contenedor marcado mas externo,
  cada marcador anidado +1; paleta en `app/globals.css`). `test` es sonda
  desechable de una caja puntual (icono, imagen, span): marca una caja, no un
  nivel, y es ortogonala la profundidad.
- Un canal solo (`LAYOUT_DEBUG = ['l2']`) para depurar el padding de un
  contenedor sin el ruido de los niveles vecinos.
- Mecanismo: `outline` + `outline-offset: -1px`, nunca `border` (cero shift).
- CSS en `app/globals.css` (`@layer utilities`), una regla por canal.
  Uso diario en la skill `layout-debug-canon`; instalacion en otro
  proyecto en la skill global `layout-debug`.

## 11. Gotchas

- `cn()` necesita el registro de tokens fluidos en `lib/utils.ts` (ver
  typography-families.md seccion 8).
- NO agregar `overflow-y-auto` al stack de featured: crea un scroll container
  anidado (el motivo original era el pin de GSAP, retirado el 2026-10).
- `announceArrival` usa `replaceState` + clase, NO `:target` (no confiable
  con replaceState).
- `copyEmail` con fallback mailto: si un futuro cambio de API lo rompe,
  mantener el fallback.
- `Reveal` escribe `data-reveal-item` en el MARKUP y la transicion del fade en
  `.reveal-fade`, no en el estado `shown`: hero y about tambien son items del
  gate, pero su opacidad la escribe GSAP frame a frame, y una transicion ahi
  amortiguaria cada escritura (ademas la red de seguridad de 2s cae en mitad de
  su timeline).
- `DarkModeToggle` desmontado: no reintroducir sin plan.
- El navbar deriva su fondo tambien de `window.scrollY` **al montar**, no solo
  de eventos `scroll` (`navbar.tsx:118-132`). Al recargar dentro de una seccion
  el navegador restaura el scroll antes de hidratar y despues no se mueve nada:
  sin esa lectura inicial el navbar se quedaba transparente sobre el contenido.
  El valor NO puede ir en `useState`, porque el HTML del servidor no conoce la
  posicion del cliente y el primer render divergiria (mismatch de hidratacion).
  Guard: `pnpm qa:navbar-deep-link` sobre un server levantado (ver
  `odd/tasks/qa-guards.md`); la logica del veredicto corre en `pnpm test`.
  El escenario tiene que ser un ENLACE profundo (`/#precios`), no una recarga:
  recargar una pagina ya scrolleada dispara un evento `scroll` y esconde el bug
  (verificado contra el deployment previo, que pasa ese caso y falla el enlace).

## 13. Deuda

- 13.3 `DarkModeToggle` desmontado (tema light no ofrecido; forcedTheme).