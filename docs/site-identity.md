# Identidad del sitio

Qué ve un crawler, un lector de enlaces o un teléfono antes de abrir la página,
y de dónde sale cada valor. Todo lo que necesita un nombre o una URL absoluta se
lee de `lib/site.ts`.

No es trabajo de posicionamiento: el sitio ya aparece al buscar el nombre. Esto
es presentación verificable.

## Archivos

| Archivo | Qué hace | Se regenera con |
|---|---|---|
| `lib/site.ts` | origen canónico, nombre legal, nombre corto, perfiles | a mano |
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
| `scripts/og-image.mjs` | renderiza la tarjeta Open Graph desde HTML con las fuentes reales | `pnpm og:image` |
| `app/opengraph-image.png` | tarjeta 1200×630; Next emite `og:image` y `twitter:image` | `pnpm og:image` |
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
- **La tarjeta OG se renderiza con Chromium, no con SVG.** librsvg resuelve las
  fuentes por fontconfig y caería a una sans del sistema sin avisar; el script
  verifica que Space Grotesk e Inter cargaron antes de capturar. Se renderiza a
  2× y se reduce a 1200×630 para que el eyebrow y la URL no salgan blandos.
- **El nombre de la tarjeta sale de `lib/site.ts`.** Cambiar el título o el rol
  obliga a correr `pnpm og:image`; el PNG está commiteado.

## Pasos manuales

1. **Search Console** (solo el owner): crear la propiedad de
   `https://max-gonzalez-ballesteros.vercel.app`, verificar, inspeccionar la URL
   y pedir indexación. Sin credenciales de su cuenta esto no se puede hacer.
2. **El favicon en Google no es inmediato.** Google cachea el icono y puede
   tardar semanas; ninguna API lo fuerza. Se comprueba en Search Console o en el
   resultado, no en el código.
3. **Imagen Open Graph.** Ya no es manual: `pnpm og:image` la renderiza desde
   `lib/site.ts` y la foto del hero, a 1200×630. Se corre tras cambiar el
   nombre, el rol o la foto. Requiere Chrome instalado o el Chromium de
   Playwright.

## Lo que no se hace

| Ítem | Por qué |
|---|---|
| Contenido, keywords, backlinks | Compiten por términos genéricos; el retorno para un portfolio es negativo |
| Idioma en URL (`/es`, `/en`) + `hreflang` | Toca layout, contexto y todos los anchors; no hay tráfico que lo justifique |
| `Vary: Accept-Language` | Añadirlo a mano puede pisar la cabecera `Vary` que Next usa para el router. Queda como limitación conocida |
| Dominio propio | Decisión del owner: se queda `vercel.app`. `SITE_URL` permite cambiarlo con una variable |
| PWA con service worker | El manifest solo da nombre e icono al atajo; no hay modo offline |
