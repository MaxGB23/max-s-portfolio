# Motion - canon de animacion y gates de media

<!-- toc:start -->
- [3. Gates de media](#3-gates-de-media)
- [5. Reveal y motion](#5-reveal-y-motion)
- [6. Aurora](#6-aurora)
- [13. Deuda](#13-deuda)
<!-- toc:end -->

<!-- docs-lint: allow-tokens FEATURED_STACK_GATE FadeIn FadeInStagger FadeInItem motion-primitives.tsx -->

> [!NOTE] Estado: CANONICO
> Parte del canon de geometria que vivia en un solo `components.md` hasta el
> 2026-10-21. Numeracion compartida: este archivo cubre 3, 5 y 6; el resto vive en `sections.md` y `platform.md`.
> Si un cambio visual contradice este archivo, el CODIGO gana y el doc se
> actualiza. Glosario de migracion: `docs/design/archive/2026-09-21-pre-designmd/INDEX.md`.

## 3. Gates de media

| Gate | Valor | Consumido por |
|---|---|---|
| Featured gap LARGE | `>=1280px` de ancho y `>=900px` de alto | `FEATURED_GAP_LG` |
| Hero pt alto | `lg` + `min-height:700px` | `lg:[@media(min-height:700px)]:pt-34` |
| Cap titulo featured | `max-height:800px` en `lg` | `lg:[@media(max-height:800px)]:text-4xl` |

`FEATURED_STACK_GATE` se retiro con el pin del featured (2026-10; ver 4.4): la
seccion fluye en documento normal y ningun componente consume un gate de pin.
El simbolo sobrevive como stub `@deprecated` en `lib/breakpoints.ts` para no
romper imports viejos; sin consumidores, se puede borrar.

**Carga de imagenes.** Politica de `loading`/`priority`/`sizes`, medida con
`scripts/audit-projects.mjs` (emulador mobile, 3G, `pnpm build && pnpm start`):

- Las cards de "Todos los proyectos" piden su imagen con `loading="eager"`
  (`components/project-card.tsx`). El lazy nativo de Chrome lanza el request
  cuando la card YA esta en pantalla, y el hueco gris de cada card dura
  ~1.0s con scroll rapido y 1.5-3.1s con la cache de imagenes en frio. Con
  `eager` el request sale al parsear el HTML: los mismos bytes, antes en el
  pipe.
- El stack featured precarga SOLO el primer panel (`priority`). La one-slide
  rule deja un panel visible a la vez: eagerly precargar los otros dos
  descargaba capturas invisibles (155KB en mobile) en el load inicial.
- El frame lento al entrar a la grid NO es JS, ni red, ni decode: con un
  trace de Chrome, el tiempo va al proceso GPU (subida de texturas y
  escalado) con el renderer principal ocioso. Por eso lo que mueve la aguja
  son los PIXELES de la textura, no cuando llega el request: la card
  declara el ancho real del slot (`calc(100vw - 48px)` y los repartos de la
  grid de 1/2/3 columnas) y `next.config` declara `480` en `deviceSizes`,
  porque el candidato default mas cercano a un slot de ~411px era 640.
- El grid de la home deja de crecer en el `max-width: 1280px` del
  contenedor, asi que el tercer reparto de `sizes` lleva tope:
  `calc(min(100vw - 96px, 1232px) / 3)`. Sin el, una ventana de 2048px
  declaraba un slot de 650px para una card de 411 y el navegador pedia la
  variante **828w**: 4x los pixeles que la card pinta, de los cuales la
  textura es justo lo que cuesta. Medido a 2048x1280 dpr1.25 con
  `audit-projects.mjs --wheel`: 828w -> 640w, cards de 29-43KB a 20-32KB, y
  el scroll paso de mediana 12.1ms con 363ms de frames perdidos a 6.1ms con
  95ms. Un `sizes` que crece con el viewport cuando el contenedor ya esta
  topado sobre-descarga sin que nada lo delate: ni red, ni JS, ni long tasks.
- El frame de entrada que queda (~67ms, siempre 95-132ms despues del fade) NO
  es la textura: bajarla a 480w lo deja igual o peor (72.5ms) y 828w tampoco
  lo empeora. Es el coste fijo de pintar el area de la grid (bordes, sombras,
  badges, tipografia, iconos) mas el arranque del fade. No buscar ahi mas
  reducciones de imagen: no las hay.
- El grid que entra con fade NO lleva `will-change` propio. La promocion a
  capa la hace la transicion de `Reveal` (`opacity` + `translate`) mientras
  dura, y eso basta para sacar el raster del frame critico. Una clase
  ESTATICA de `will-change: opacity, translate` sobre el wrapper de la grid
  (lo que hubo entre 2026-10 y 2026-10-22) deja TODO el grid como una unica
  capa promovida para siempre, del ancho del contenedor y 3 filas de alto.
  OJO CON EL ORDEN DE LOS FACTORES: a 828w de textura esa capa hundia el
  scroll entero (mediana 12.1ms -> 6.1ms al retirarla, mismo build, mismas
  texturas); a 640w la diferencia cae dentro del ruido (+-100ms entre
  corridas). Se retira igual: un `will-change` que no caduca es una promesa
  permanente que se paga en cada frame, y no hay razon para dejarla cuando la
  transicion ya promueve sola.
- En 3G el bundle hidrata a los ~4s, despues de que el visitante ya paso la
  grid: por eso la precarga tiene que ser de servidor (`loading`/`priority` en
  el HTML), no de cliente. Un `IntersectionObserver` que monte una capa
  invisible llega tarde y no adelanta nada.
- `sizes` por componente: card `calc(100vw - 48px)` / `calc((100vw - 72px) /
  2)` / `calc(min(100vw - 96px, 1232px) / 3)`; featured
  `(max-width: 1023px) calc(100vw - 48px), calc(min(100vw - 48px, 1280px) /
  2)`; hero `(max-width: 768px) 280px, (max-width: 1200px) 34vw, 380px`;
  about `(max-width: 768px) 400px, (max-width: 1200px) 464px, 490px`.
- El panel featured tenia el MISMO defecto y mas caro: declaraba `50vw`, asi
  que a una ventana de 2048px pedia `1024px` de slot cuando su caja mide
  616px, y el navegador bajaba la variante **1920w** (6.2x los pixeles que
  pinta) en los tres paneles, durante el scroll que precede a la grid. El
  corte es `1023px` y no `1024px` a proposito: `lg` de Tailwind arranca en
  1024, y con `max-width: 1024px` el ancho exacto 1024 declaraba una columna
  cuando el layout ya tiene dos.

## 5. Reveal y motion

`components/reveal.tsx` - entradas de seccion:

- `Reveal` (`children`, `className`, `delay`, `delayEnter`, `earlyOnMobile`):
  envuelve el bloque en un `<div data-reveal-item>` y lo revela al entrar al
  viewport. IntersectionObserver COMPARTIDO por perfil (`rootMargin` +
  `threshold`), no uno por nodo; al intersectar escribe
  `data-reveal-item="shown"` y hace `unobserve`. Sin estado de React, sin
  re-render y sin loop de animacion.
- La entrada es una transicion CSS de opacidad + `translate` (ascenso de 20px,
  0.55s) en la clase `.reveal-fade`; `--reveal-delay` (escrito en el efecto, no
  en el render) lleva los delays. El `translate` es paridad con el `y: 20 -> 0`
  del `FadeIn` de framer-motion que sustituyo; usar la propiedad `translate` y
  no `transform` evita pisar cualquier transform de las utilidades de Tailwind.
  Perfiles: default (`threshold` 0.15, sin margen), `delayEnter`
  (0.15 + margen -15%), `earlyOnMobile` en mobile (`threshold` 0 + margen -15% y
  +0.15s para entrar detras del titulo).
- El estado oculto no esta en el markup: lo aporta el gate (script inline del
  layout + CSS del gate, unlayered), que solo se arma si el JS arranco y que
  falla abierto. Reglas completas en `docs/design/section-animations.md`.
- `data-reveal-item` DEBE renderizarse en el SSR. Anadirlo en un efecto produce
  flash visible -> oculto -> visible.
- `components/motion-primitives.tsx` YA NO EXISTE: `FadeIn`, `FadeInStagger`,
  `FadeInItem` y `FadeInItemFade` se borraron en el track `css-first-reveal`
  (sus unicos consumidores eran las entradas de la home). `SlideIn` y `ScaleIn`
  tampoco se exportan: no reintroducirlos.
- framer-motion sigue en el sitio para lo que NO es una entrada: menu mobile
  (`AnimatePresence`), hovers, hide-on-scroll del navbar y los reveals de
  `project-detail.tsx`.

## 6. Aurora

- Solo en el hero, solo en dark (`mounted && isDark` + `MutationObserver`
  sobre la clase del `<html>`): es un canvas de ogl/GLSL que renderiza
  particulas/aurora. No replicarlo fuera del hero (costoso); no portarlo a
  otros componentes.
- El loop se pausa con `IntersectionObserver` (`threshold: 0`) cuando el hero
  sale del viewport y se reanuda al entrar (barato: contexto y shaders siguen
  montados; el `uTime` salta por la ausencia, cosmético). Prop `frozen`
  opcional: pinta un solo frame sin loop (sin uso actualmente).

## 13. Deuda

- 13.2 Los reveals de `project-detail.tsx` siguen en framer-motion: otra
  superficie, sin migrar (deuda compartida con `section-animations.md`).