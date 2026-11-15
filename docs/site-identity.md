# Identidad del sitio

Qué ve un crawler, un lector de enlaces o un teléfono antes de abrir la página,
y de dónde sale cada valor. Todo lo que necesita un nombre o una URL absoluta se
lee de `lib/site.ts`.

No es trabajo de posicionamiento: el sitio ya aparece al buscar el nombre. Esto
es presentación verificable.

## Archivos

| Archivo | Qué hace | Se regenera con |
|---|---|---|
| `lib/site.ts` | origen canónico, nombre, perfiles y las dos descripciones | a mano |
| `lib/lang.ts` | resuelve es/en en el servidor: cookie → `Accept-Language` → `es` | — |
| `public/images/m_logo.png` | fuente única del icono (círculo con la M, 192×192) | a mano |
| `scripts/site-icons.mjs` | rasteriza la fuente a los tres iconos | `pnpm icons:site` |
| `app/icon.png` | 192×192, `<link rel="icon">` | `pnpm icons:site` |
| `app/apple-icon.png` | 180×180, `<link rel="apple-touch-icon">` | `pnpm icons:site` |
| `app/favicon.ico` | ICO real con 16/32/48 | `pnpm icons:site` |
| `app/manifest.ts` | nombre e iconos para "añadir a inicio" en Android | — |
| `app/robots.ts` | permite todo y apunta al sitemap absoluto | — |
| `app/sitemap.ts` | home + un entry por proyecto, desde `data/projects` | — |
| `components/structured-data.tsx` | JSON-LD `Person` + `WebSite` con `sameAs` | — |
| `app/opengraph-image.png` | tarjeta 1200×630; Next emite `og:image` y `twitter:image` | a mano |
| `app/opengraph-image.alt.txt` | alt de la tarjeta | a mano |

## Reglas que no son obvias

- **La fuente nunca se upscalea.** `m_logo.png` mide 192 px, que ya es múltiplo
  de 48; todo destino es una reducción. Si se reemplaza por un archivo menor,
  `scripts/site-icons.mjs` aborta en vez de inventar píxeles.
- **`sharp` no escribe ICO.** El contenedor se arma a mano: cabecera `ICONDIR`,
  una entrada de 16 bytes por tamaño y payloads PNG. `file` debe leerlo como
  "MS Windows icon resource - 3 icons".
- **El título de la home lleva el nombre y el rol.** Los detalles no repiten el
  nombre: lo añade `title.template` del layout. Cambiarlo es una línea en
  `lib/site.ts`.
- **La metadata y la UI comparten resolvedor de idioma** (`lib/lang.ts`). Antes,
  una ficha podía renderizarse en inglés y describirse en español.
- **Sin `lastModified` ni `priority` en el sitemap.** Deducir la fecha desde git
  en build es frágil y Google ignora los otros dos.
- **El JSON-LD escapa `<`.** El grafo es estático, pero un valor con `<` no debe
  poder cerrar el `<script>`.
- **Dos descripciones, no una.** La de búsqueda mide 155 caracteres, al límite
  de lo que Google muestra; la de Open Graph y Twitter mide 121, porque las
  previsualizaciones cortan cerca de 125 y el corte caía en "…experiences with".
- **La tarjeta OG es un asset diseñado, no generado.** Se edita a mano a
  1200×630 y se commitea. Si cambia el nombre, el rol o la foto, se rehace. No
  hay comando: un generador producía otra composición y habría sobrescrito esta.
- **La miniatura de la búsqueda no es la tarjeta.** `og:image` alimenta
  LinkedIn, WhatsApp y X; el recuadro que acompana al resultado de Google se
  elige entre las imagenes de la pagina. Como priorizar una: seccion siguiente.

## Cómo priorizar la imagen del resultado

Google elige el recuadro que acompana al resultado de busqueda de forma
**automatica**, entre las imagenes de la pagina. No existe un campo "usa esta".
Si existen palancas documentadas, en orden de fuerza:

1. `primaryImageOfPage` en el nodo `WebPage` del JSON-LD
   (`components/structured-data.tsx`), con la URL absoluta de la imagen o un
   `ImageObject`.
2. Un `image` adjunto a la entidad principal (`mainEntityOfPage`).
3. `og:image`, que es el que ya existe - y el que Google descarta antes, porque
   su guia de imagenes recomienda no usar para esto una imagen con texto, y la
   tarjeta es casi toda texto.

La imagen elegida debe ser representativa de la pagina, **sin texto**, sin
proporcion extrema y en buena resolucion: es lo que pide la guia de imagenes de
Google. Es una influencia, no una orden: despues de rastrear, comprobar el
resultado real.

Hoy el recuadro lo gana la imagen del About (`public/images/about-max.webp`), que
el owner decidio conservar. Si algun dia se anade una imagen definitiva, se
declara con `primaryImageOfPage` y se deja la del About como esta.

**Lo que no se usa para esto:** `max-image-preview: none` apaga la
previsualizacion, pero su documentacion dice que aplica a "todas las formas de
resultados de busqueda (Google web, Google Images, Discover, Assistant)", asi que
arriesga vaciar la pestana Imagenes - justo lo que este sitio no quiere perder.
`noimageindex` es peor: saca las imagenes del indice.

## Pasos manuales

1. **Search Console** (solo el owner): crear la propiedad de
   `https://max-gonzalez-ballesteros.vercel.app`, verificar, inspeccionar la URL
   y pedir indexación. Sin credenciales de su cuenta esto no se puede hacer.
2. **El favicon en Google no es inmediato.** Google cachea el icono y puede
   tardar semanas; ninguna API lo fuerza. Se comprueba en Search Console o en el
   resultado, no en el código.
3. **Imagen Open Graph.** Es un asset diseñado (1200×630). Rehacerla a mano si
   cambia el nombre, el rol o la foto; no hay comando que la regenere.

## Lo que no se hace

| Ítem | Por qué |
|---|---|
| Contenido, keywords, backlinks | Compiten por términos genéricos; el retorno para un portfolio es negativo |
| Idioma en URL (`/es`, `/en`) + `hreflang` | Toca layout, contexto y todos los anchors; no hay tráfico que lo justifique |
| `Vary: Accept-Language` | Añadirlo a mano puede pisar la cabecera `Vary` que Next usa para el router. Queda como limitación conocida |
| Dominio propio | Decisión del owner: se queda `vercel.app`. `SITE_URL` permite cambiarlo con una variable |
| PWA con service worker | El manifest solo da nombre e icono al atajo; no hay modo offline |
