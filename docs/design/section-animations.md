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

### AllProjects: Reveal

AllProjects usa `Reveal delayEnter` para el heading y un unico `Reveal
delayEnter` de contenedor para el grid (sin stagger ni items por card).
En mobile (<768px) el grid anade `earlyOnMobile`: dispara en la misma
linea 85% que el heading (`threshold: 0` + `rootMargin -15%`, sin exigir el
15% del grid completo que en 1 columna mide ~3000px) con +0.15s de delay
para entrar por detras del titulo. En desktop el trigger y los tiempos
quedan intactos.
Es la seccion de proyectos no destacados, no una seccion principal, por lo
que usa la familia Reveal en vez de GSAP. Metrica del tick de ~58ms atribuido
al frameLoop de framer-motion: la migracion a CSS quita el animation loop del
main thread en esta seccion; el numero nuevo queda pendiente de la pasada de
perfil del usuario (ver `docs/issues/all-projects-entry-jank.md`), con CLS 0
y decode fuera del main thread en la linea base.

### Footer

Dos bloques con `Reveal`: el grid de navegacion (sin delay) y la barra de
copyright (`delay={0.1}`). Los iconos sociales mantienen su hover con
framer-motion, que sigue siendo la unica razon por la que el footer importa
`motion`.

### Navbar: hide-on-scroll (Framer)

El header es un `motion.header`. Hoy su entrada tambien sale de framer
(`initial`: `y: -24px` + `opacity: 0`), asi que sin JS el navbar no aparece; la
entrada esta en la work unit de navbar del track css-first-reveal. Lo que se
queda en framer en cualquier caso es el hide-on-scroll de mobile, unico dueno
de `transform` en ese nodo.

### Hero: GSAP timeline on-load

Hero usa un GSAP timeline con stagger secuencial (portrait, badge, label,
title, description, chips, cta, scroll). No usa scrollTrigger porque es la
primera seccion y se anima on-load.

## Gate de reveal (CSS-first)

Desde 2026-10-19 el contenido de la home es visible por defecto. El
ocultamiento es una capa que solo existe si el JS arranco bien:

1. `app/layout.tsx` inyecta un `<script>` inline al principio del `<body>`
   (antes de cualquier nodo de contenido, asi que corre antes del primer
   paint). Si existe `IntersectionObserver`, pone `data-reveal="on"` en
   `<html>` y programa una red de seguridad de 2s.
2. `app/globals.css` oculta `[data-reveal-item]` solo bajo `[data-reveal="on"]`
   y solo hasta que el item lleva `data-reveal-item="shown"`.
3. `components/reveal.tsx` observa, escribe `shown` y deja de observar. Un
   IntersectionObserver compartido por perfil (`rootMargin` + `threshold`), sin
   estado de React, sin re-render y sin animation loop. La entrada es una
   transicion CSS de opacidad de 0.55s, con `--reveal-delay` para delays.

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

Pendiente en este mismo track: hero y about (12 estilos inline) y la entrada
del navbar.

## Deuda unica

- Medir el tick de AllProjects tras la migracion a CSS
  (`docs/issues/all-projects-entry-jank.md`). Hasta que el usuario corra las
  pasadas de perfil, el canon no puede afirmar mejora: solo que el animation
  loop de framer-motion ya no corre en esa seccion.
- Los reveals de `components/project-detail.tsx` siguen en framer-motion. Otra
  superficie, sin migrar.

## Known issue (diferido)

- **FOUC con ancla:** carga fria con `/#precios` o `/#contacto` -> el SSR pinta la
  seccion visible, GSAP aplica el estado "from" (opacity:0) al crearse el tween y
  la vuelve a animar: doble render visible. Cosmetico, solo con ancla, bajo trafico.
  El gate CSS ("Gate de reveal") es la idea "hidden state en CSS" que este punto
  proponia, pero hoy solo cubre las secciones con `Reveal`; en las de GSAP (About,
  Pricing, Contact) el estado oculto lo sigue aplicando el tween en runtime, asi
  que el FOUC con ancla SIGUE ABIERTO para ellas.
