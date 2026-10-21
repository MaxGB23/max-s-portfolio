# Motion - canon de animacion y gates de media

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
- En 3G el bundle hidrata a los ~4s, despues de que el visitante ya paso la
  grid: por eso la precarga tiene que ser de servidor (`loading`/`priority` en
  el HTML), no de cliente. Un `IntersectionObserver` que monte una capa
  invisible llega tarde y no adelanta nada.
- `sizes` por componente: card `(max-width: 768px) 100vw, (max-width: 1200px)
  50vw, 33vw`; featured `(max-width: 1024px) 100vw, 50vw`; hero `(max-width:
  768px) 280px, (max-width: 1200px) 34vw, 380px`; about `(max-width: 768px)
  400px, (max-width: 1200px) 464px, 490px`.
- Pendiente, medido y sin aplicar: el `sizes` de la card no coincide con los
  cortes de la grid (`sm`=640, `lg`=1024) y declara `100vw` para un slot de
  `100vw - 48px`; el navegador pide 1200w donde 1080w bastaria.

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