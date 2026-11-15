# search-images

Señales de imagen: exclusión de la foto del hero en Google Imágenes y el nombre
completo en los `alt`. Nace de dos rondas de `funky-judge` que retiraron del
alcance el `ImageObject`, el sitemap de imágenes y el pie de foto.

## Specs

- **S1** — La foto real del hero (`/images/max-gb-pfp.webp`) no debe ser
  indexable en Google Imágenes. Cita: «no quisiera mostrar mi foto de hero».
- **S2** — Las dos variantes del nombre viajan en los textos de imagen, sin
  perder la que ya funciona. Cita: «que aparezca "max" y "maximiliano"».
- **S3** — Sin cambios visuales ni de contenido. Cita: «no queremos cambiar
  contenido visual de nada, nos quedamos con el alt».
- **S4** — La tarjeta OG no se excluye y sigue siendo la de LinkedIn. Cita: «no
  excluyas la og, esa sí se muestra».
- **S5** — Los docs no pueden quedar afirmando lo contrario. Cita: «igual no
  olvides mencionar actualizar docs».

## Tareas

| ID | Tarea | Spec | Commit |
|---|---|---|---|
| T1 | Grupo `Googlebot-Image` en `robots.ts`, derivado de `PERSON.image`, y comentario del archivo reescrito | S1, S5 | — |
| T2 | `alt` del hero al sistema de traducciones y `alt` del About con los dos nombres, ES y EN | S2, S3 | — |
| T3 | Enmendar `docs/site-identity.md`: tabla de archivos, escalera de palancas, alcance y bloque de exclusiones; TOC si cruza 120 líneas | S1-S5 | — |

## Decisiones

- **El `alt` es el único canal.** Nada de `figcaption` ni de texto oculto: un pie
  visible cambia la página, y esconderlo es texto oculto para buscadores.
- **Los dos nombres, juntos y naturales**: `Maximiliano "Max" González
  Ballesteros`. Se registra el coste: se pierde la cadena contigua `Max González
  Ballesteros` en el `alt`; sigue en el título, en `WebSite.name` y en el `h1`.
- **El patrón de robots se deriva de `PERSON.image`**, para que cambiar la foto
  no rompa la exclusión en silencio.
- **`Person.image` no se toca** y no se declara `ImageObject`: dos rondas de
  jueces no encontraron evidencia de que influya en Imágenes.
- **Bing queda fuera** de esta feature (índice aparte, trámite manual en su
  consola); se documenta como paso pendiente.

## Log

- **L1** — «no quisiera mostrar mi foto en las busquedas de google, pero en
  opengraph si, dime qué recomiendas».
- **L2** — «lo único documentado que sí mueve imágenes es la imagen en sí y su
  contexto» → el owner elige no tocar contenido: «nos quedamos con el alt
  únicamente».
- **L3** — Juicio ronda 1: fuera el sitemap de imágenes (solo `<image:loc>`, sin
  señal de nombre, y metía capturas censuradas) y fuera el riesgo R1 (el comodín
  sí casa con `/_next/image?url=…`).
- **L4** — Juicio ronda 2: fuera el `ImageObject` (mezclaba la imagen excluida
  con la del About y no hay evidencia de efecto); la verificación del JSON-LD no
  puede entrar en `pnpm test` porque los globs no lo alcanzan.
