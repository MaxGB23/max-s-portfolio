# Section Title Animations

> [!NOTE] Estado: CANONICO
> Fuente de verdad del codigo: `components/about-section.tsx`,
> `components/hero-section.tsx`, `components/contact-section.tsx`,
> `components/pricing-section.tsx`, `components/products-section.tsx`,
> `components/featured-projects.tsx`, `components/all-projects.tsx`,
> `components/footer.tsx`, `components/navbar.tsx`, `components/reveal.tsx`,
> `app/layout.tsx`, `app/globals.css`.

## Patron unificado (GSAP)

Todas las secciones principales usan el mismo patron de animacion de entrada
para el header (titulo + descripcion):

| Propiedad | Valor |
|-----------|-------|
| Framework | GSAP (`useGsapAnimation`) |
| Direccion | Vertical (`y: 24` -> `y: 0`) |
| Duracion | `0.55s` |
| Ease | `power2.out` |
| Trigger | `scrollTrigger: { start: "top 80%" }` |
| Once | `true` (solo una vez) |

### Trigger `top 80%`

El trigger `top 80%` (antes `top 85%`) hace que la animacion dispare cuando
el header esta un 20% dentro del viewport, dando tiempo al usuario a leer la
seccion anterior sin distracciones.

## Excepciones documentadas

### Contact: CTA dentro del header

La seccion Contact es una excepcion al patron de "header y elementos no-title
por separado". Los botones CTA (LinkedIn, Email, GitHub) estan DENTRO del
`.contact-header` para que entren junto con el titulo y descripcion.

**Razon:** Contact es una seccion muy corta (una sola fila de botones). Si los
botones se animaran por separado, requeririan scroll adicional cerca del
footer, creando una experiencia donde los botones aparecen estaticos antes de
que se anime el titulo.

**Patron:** Todo el contenido de Contact (badge + titulo + descripcion + CTA)
se anima como un solo bloque con `y: 24, 0.55s, power2.out`.

### Featured: Reveal + CSS transitions

Featured usa `Reveal delayEnter` para el heading y CSS `transition-all` para
los panels. Es intencional: la seccion tiene un one-slide rule documentado en
`featured-projects.tsx` que requiere control finamente granular de la
visibilidad de cada panel. En viewports muy altos (iPad portrait, zoom-out) el
avance exige ademas que el titulo haya empezado a pasar el tope (hook
`.featured-heading`) y los paneles 1..n solo enganchan tras la salida de la
entrada: sin saltos ni dobles al entrar por ancla, sin cambios en viewports
normales. Geometric static fallback: if the whole `#proyectos` section fits the
viewport, all panels + heading render visible with no one-slide animation;
detection is geometric only (no devicePixelRatio/zoom).

Sin JS los panels no pueden seguir ocultos: su estado inicial (`opacity-0
translate-y-5`) viene del estado de React y el servidor lo renderiza asi, de
modo que la seccion entera quedaba invisible conservando su espacio. Cada
wrapper lleva la clase `featured-one-slide` y `app/globals.css` la libera con
`html:not([data-reveal="on"]) .featured-one-slide { opacity: 1; translate: none }`
(regla sin capa; en Tailwind v4 la subida es la propiedad `translate`, no
`transform`). Con JS el atributo del gate esta presente y el state machine
recupera el control. Sin JS la seccion degrada a un stack estatico, que es la
forma honesta de mostrar los paneles sin la logica de geometria.

### AllProjects: Reveal

AllProjects usa `Reveal delayEnter` para el heading y un unico `Reveal
delayEnter` de contenedor para el grid (sin stagger ni items por card).
En mobile (<768px) el grid anade `earlyOnMobile`: dispara en la misma
linea 85% que el heading (`threshold: 0` + `rootMargin -15%`, sin exigir el
15% del grid completo que en 1 columna mide ~3000px) con +0.15s de delay
para entrar por detras del titulo. En desktop el trigger y los tiempos
quedan intactos.
Es la seccion de proyectos no destacados, no una seccion principal, por lo
que usa la familia Reveal en vez de GSAP. La migracion a CSS quita el animation
loop de framer-motion del main thread en esta seccion. El tiron que se percibia
al entrar no era ese numero: era `images.unoptimized: true` sirviendo originales
de hasta 4000x2800, con el costo en la GPU (dos `GPUTask` de ~70ms). Causa y
fix: `docs/issues/all-projects-entry-jank.md` §6.2. El tick de ~58ms no se
volvio a medir y no gobierna ninguna decision.

### Footer

Dos bloques con `Reveal`: el grid de navegacion (sin delay) y la barra de
copyright (`delay={0.1}`). Los iconos sociales mantienen su hover con
framer-motion, que sigue siendo la unica razon por la que el footer importa
`motion`.

### Navbar: entrada CSS + hide-on-scroll (Framer)

La entrada del header son dos keyframes CSS en `.nav-arrive`, con los mismos
tiempos que las dos pistas de framer-motion en main: opacidad 0 -> 1 en 0.45s
`ease-out` y `translate: 0 -24px -> none` en 0.35s
`cubic-bezier(0.22, 1, 0.36, 1)`. Un unico keyframe de 0.45s para ambas se
percibia mas lento que main: el movimiento es la pista que se nota, y 0.35s con
un ease-out fuerte no es lo mismo que 0.45s `ease-out`. Antes era el `initial`
de framer-motion (`y: -24px` + `opacity: 0`), que horneaba `opacity:0` en el
markup del servidor: sin JS el navbar no aparecia nunca.

El desplazamiento va por la propiedad `translate`, NO por `transform`:
framer-motion sigue escribiendo `transform` para el hide-on-scroll mobile, y
`translate` es una propiedad independiente que compone en vez de pisarse. Ese
fue el motivo real de que el `-24px` desapareciera en la primera version del
track (dos escritores sobre `transform` se pisan); con `translate` el problema
no existe. El desplazamiento es decorativo (heredado del `useGsapAnimation`
original, commit `ab90565`), nunca fue proteccion contra jitter: el jitter se
arregla con el deadband de 4px y el umbral de 14px.

Lo que queda en framer es el hide-on-scroll de mobile, unico dueno de
`transform` en ese nodo. La entrada CSS puede tocar `opacity` y `translate`
porque son canales distintos; lo que no puede tocar es `transform`.

El disparador del hide-on-scroll acumula el delta SOLO mientras la direccion no
cambie y lo reinicia al cambiar de sentido, con umbral de 14px en la misma
direccion. Un temblor de dedo oscila de direccion, asi que nunca acumula y
nunca esconde el navbar; un scroll lento y sostenido si acumula y dispara. El
bug anterior: el umbral era 8px y `lastY` solo se actualizaba al cruzar el
umbral, de modo que los deltas de jitter se sumaban entre eventos (3+3+3) y el
navbar se escondia sin scroll real.

### Hero: GSAP timeline on-load

Hero usa un GSAP timeline con stagger secuencial (portrait, badge, label,
title, description, chips, cta, scroll). No usa scrollTrigger porque es la
primera seccion y se anima on-load.

El bloque de descripcion se alinea con el ancho real del titulo (`useTitleWidth`
+ `min(ancho, 60ch)` inline). El hook solo mide en md+ y en useLayoutEffect, asi
que sin JS el parrafo necesita un techo estatico propio: `md:max-w-[42ch]`. Ese
numero NO es el tope del JS (60ch) a proposito: `min(ancho del titulo, 60ch)`
suele dar bastante menos que 60ch en md+, asi que un fallback de 60ch dejaba el
parrafo visiblemente mas ancho que el render con JS en TODAS las resoluciones a
partir de md. `42ch` es el valor que mejor aproxima el ancho tipico del titulo
medido, elegido a ojo en el testeo en vivo. En mobile no aplica: ahi el hook
devuelve null y el parrafo usa el ancho natural de la columna.

## Gate de reveal (CSS-first)

Desde 2026-10-19 el contenido de la home es visible por defecto. El
ocultamiento es una capa que solo existe si el JS arranco bien:

1. `app/layout.tsx` inyecta un `<script>` inline al principio del `<body>`
   (antes de cualquier nodo de contenido, asi que corre antes del primer
   paint). Si existe `IntersectionObserver`, pone `data-reveal="on"` en
   `<html>` y programa una red de seguridad de 2s (que el bundle cancela al
   evaluarse; ver reglas abajo).
2. `app/globals.css` oculta `[data-reveal-item]` solo bajo `[data-reveal="on"]`
   y solo hasta que el item lleva `data-reveal-item="shown"`.
3. `components/reveal.tsx` observa, escribe `shown` y deja de observar. Un
   IntersectionObserver compartido por perfil (`rootMargin` + `threshold`), sin
   estado de React, sin re-render y sin animation loop. La entrada es una
   transicion CSS de opacidad y `translate` (ascenso de 20px) de 0.55s, con
   `--reveal-delay` para delays. El `translate` restaura el `y: 20 -> 0` que
   animaba el `FadeIn` de framer-motion en main: sin el, la entrada queda mas
   seca y el branch deja de ser indistinguible del original.

Reglas que no se pueden romper:

- `data-reveal-item` se renderiza en el MARKUP DEL SERVIDOR. Anadirlo en un
  efecto produce flash visible -> oculto -> visible.
- La red de seguridad vive en el mismo script inline que el gate. En el bundle
  moriria justo en el fallo que cubre.
- El gate falla ABIERTO: si el script no corre (CSP, error, JS apagado) el
  atributo no se pone y la pagina se ve entera.
- El script es un `<script>` crudo, no `next/script`. Un inline
  `beforeInteractive` se serializa en `self.__next_s` y lo ejecuta el chunk
  async `app-bootstrap`, que puede llegar despues del primer paint.
- Las reglas del gate son CSS sin capa (`@layer`), para que ganen a las
  utilidades de Tailwind sin `!important`.
- La transicion del fade va en la clase `.reveal-fade`, no en el estado
  `[data-reveal-item="shown"]`. Hero y About tambien son items del gate (para
  que los oculte antes del primer paint), pero su opacidad la escribe GSAP
  frame a frame: con la transicion en el estado `shown`, la red de seguridad de
  2s entraria en mitad del timeline de hero y amortiguaria cada escritura de
  GSAP. Solo `components/reveal.tsx` renderiza esa clase.
- Hero y About llevan `data-reveal-item` pero NO los observa `Reveal`: el gate
  solo aporta el estado oculto antes del primer paint, la entrada la sigue
  dirigiendo GSAP. Para ellos la red de seguridad es el unico camino a `shown`,
  y su unico efecto es retirar la regla de opacidad 0 del gate.
- La red de seguridad cubre UN fallo: que el bundle no llegue a ejecutarse. Por
  eso el bundle la cancela en cuanto `components/reveal.tsx` se evalua (el
  script inline deja el id del timeout en `window.__revealNet`). Una red global
  de "revelar todo a los 2s" tambien le quita la entrada a todas las secciones
  por debajo del pliegue: un scroll natural siempre llega despues de esos 2s.
  Se cancela en module scope, no en un efecto: en una hidratacion lenta el
  efecto llegaria tarde. Consecuencia asumida: si el bundle corre pero la
  hidratacion revienta, lo pendiente queda oculto — la misma propiedad que
  tenia el codigo anterior (`whileInView` de framer tampoco dispara sin
  hidratacion).
- El script se inyecta en el LAYOUT, asi que la red se arma en TODAS las
  paginas; solo la cancela `components/reveal.tsx`. En una pagina que no lo
  importa (detalle de proyecto) dispara a los 2s sin nada que revelar: hoy es
  inerte porque los unicos `data-reveal-item` estan en la home. Si alguna vez se
  anaden items fuera de la home, esa pagina tiene que importar `Reveal` (o
  cancelar `window.__revealNet`), o la red los mostrara a los 2s sin animacion.

## Politica de prefers-reduced-motion

Las animaciones de entrada se ejecutan SIEMPRE, tambien con la preferencia
`prefers-reduced-motion: reduce` activa. Es una decision del dueno del
producto, tomada a conciencia: la preferencia viene activada por defecto en
bastantes equipos Windows por rendimiento, no por vestibular, y en ese caso
matar la entrada empobrece la pagina sin ganar nada.

La frontera de esta licencia:

- PERMITIDO sin respetar la preferencia: fades de opacidad y desplazamientos
  cortos (<= 24px), que es todo lo que hay hoy.
- PROHIBIDO sin respetar la preferencia: parallax, zoom, giros, scroll-jacking
  o cualquier desplazamiento grande o continuo. Si alguno de esos entra en el
  sitio, tiene que respetar la preferencia o no entra.

Excepcion ya existente en el codigo: el aviso de llegada a `#contacto`
(`contact-arrive`) si tiene rama de reduced motion, porque su animacion es un
wash con anillo que se repite en cada click.

## Secciones por familia

| Familia | Secciones | Framework |
|---------|-----------|-----------|
| GSAP principal | Hero, About, Pricing, Contact | GSAP |
| Reveal (CSS) | AllProjects, Featured (heading), Footer | IntersectionObserver + transicion CSS |
| Framer (no entrada) | Navbar (hide-on-scroll), menu mobile, hovers | Framer Motion |
| Legacy | Products (no se reintroduce) | GSAP |

## Cambios aplicados (2026-10-01)

1. **About:** trigger `top 85%` -> `top 80%`, ease `power3.out` ->
   `power2.out`, duracion `0.4` -> `0.55s`, direccion `x: 20` -> `y: 24`
2. **Products:** trigger `top 85%` -> `top 80%`
3. **Pricing:** trigger `top 85%` -> `top 80%`
4. **Contact:** Framer `FadeIn` reemplazado por GSAP `fromTo` con el patron
   unificado; CTA movido dentro del `.contact-header`
5. **About:** `min-h-[60dvh] 2xl:min-h-[70dvh] portrait:min-h-[50dvh]` anadido para dar presencia
   visual en desktop (70% en 2xl para viewports muy anchos); en portrait el alto minimo baja a 50% porque el 60%
   obligaba a un bloque desproporcionado antes del primer proyecto

## Cambios aplicados (2026-10-19)

1. **Entradas de la home:** `FadeIn` de framer-motion sustituido por `Reveal`
   (IntersectionObserver + transicion CSS de opacidad) en AllProjects
   (heading + grid), Featured (heading) y Footer (2 bloques).
   `components/motion-primitives.tsx` se borra: `FadeInStagger`, `FadeInItem`
   y `FadeInItemFade` no tenian consumidores.
2. **Contenido visible sin JS:** gate CSS + script inline (ver "Gate de
   reveal"). El markup del servidor ya no hornea `opacity:0` en las entradas
   migradas.
3. **Tema oscuro:** `class="dark"` renderizado por el servidor. `next-themes`
   se elimina: el tema es forzado y no tiene toggle, asi que el provider solo
   inyectaba un script.
4. **Politica de reduced motion:** explicitada en "Politica de
   prefers-reduced-motion" y aplicada al gate y a `Reveal`.
5. **Hero y About:** fuera los 12 estilos inline de estado oculto
   (`opacity:0; visibility:hidden`) y `data-reveal-item` en su lugar. El estado
   oculto antes del primer paint lo aporta el gate y GSAP sigue dirigiendo la
   entrada. Efecto colateral buscado: esos nodos vuelven al arbol de
   accesibilidad. La transicion del fade se mueve a `.reveal-fade` (ver "Gate de
   reveal") para no amortiguar las escrituras de GSAP.

6. **Navbar:** entrada por keyframe CSS (`.nav-arrive`: opacidad + `translate`
   de -24px); fuera el `initial` de framer-motion, que horneaba `opacity:0` en
   el servidor. El desplazamiento se restauro el 2026-10-20 por la propiedad
   `translate`, que no compite con el `transform` del hide-on-scroll. El
   hide-on-scroll pasa a acumular el delta en una sola direccion con umbral de
   14px, para que un temblor de dedo no lo esconda.
7. **Red de seguridad acotada:** el bundle la cancela al evaluarse. Antes
   revelaba TODO a los 2s, asi que cualquier seccion por debajo del pliegue
   llegaba ya visible y sin entrada (visto en el primer testeo en vivo: F5 con
   la seccion a la vista si animaba; scroll natural desde la home, no).
8. **Featured sin JS:** clase `featured-one-slide` + regla
   `html:not([data-reveal="on"])` para que los paneles no queden invisibles
   cuando el estado inicial de React nunca se hidrata.
9. **Hero sin JS:** `md:max-w-[60ch]` como techo estatico del parrafo, para que
   el ancho no cambie respecto al render con JS.

Pendiente: nada de esta seccion. Validado en vivo por el usuario (desktop y
mobile, con y sin JS) y desplegado el 2026-10-20. La pasada de perfil del "tick
de AllProjects" ya no aplica: el tiron percibido era de imagenes sin optimizar,
no del motor de animacion.

## Deuda unica

- **AllProjects: sin deuda de medicion.** El tiron quedo atribuido a las
  imagenes sin optimizar y esta resuelto
  (`docs/issues/all-projects-entry-jank.md` §6.2). El tick de ~58 ms no se volvio
  a medir; lo unico que el canon afirma es que el loop de framer-motion ya no
  corre en esa seccion.
- Los reveals de `components/project-detail.tsx` siguen en framer-motion. Otra
  superficie, sin migrar.

## Known issue (diferido)

- **FOUC con ancla:** carga fria con `/#precios` o `/#contacto` -> el SSR pinta la
  seccion visible, GSAP aplica el estado "from" (opacity:0) al crearse el tween y
  la vuelve a animar: doble render visible. Cosmetico, solo con ancla, bajo trafico.
  El gate CSS ("Gate de reveal") resolvio este punto para las secciones que
  llevan `data-reveal-item` (About, AllProjects, Featured, Footer); en Pricing y
  Contact el estado oculto lo sigue aplicando el tween en runtime, asi que el
  FOUC con ancla SIGUE ABIERTO para ellas.
