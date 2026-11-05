# Peso de las imágenes iniciales: hero sin cambios, About con una compresión menos

> [!NOTE] Estado: CERRADO el 2026-11-04. Hero: no se toca. About: asset reescalado a 1080 px.
> Rastro: issue #33, PR #34, merge `05356fb` en `main`.

La pregunta era si el hero y About pueden pesar menos en mobile, que son las dos imágenes que
cargan al inicio. La respuesta es distinta para cada una: **el hero no tiene margen sin perder
calidad; About sí gana, porque hoy paga una compresión de más.**

## El disparador

En un teléfono de gama baja la imagen del hero daba un mini lag al cargar. La hipótesis inicial
fue bajar `quality`. Era la hipótesis equivocada.

## Punto de partida medido

Build de producción (`pnpm build && next start`), misma máquina, dos viewports:

| | mobile dpr3 (390x844) | desktop dpr1.25 (1600x900) |
|---|---|---|
| total imágenes | 649 KB | 349 KB |
| hero | 135 KB | 44 KB |
| about | 118 KB | 55 KB |
| cards de proyectos (7) | 318 KB | 173 KB |

Que mobile pese casi el doble **no es desperdicio**: pide buckets de 1080 porque una pantalla
dpr3 tiene esos píxeles (390 CSS x 3 = 1170). Desktop pide 640.

## Hero: descartado, no hay punto medio

Sobre la fuente 979x1411 (109 KB, q90), y con el teléfono pidiendo el bucket 1080:

| variante | peso servido | detalle |
|---|---|---|
| original 979 q90 | 109 KB | completo |
| 800 px q80 | 62 KB | blando (rechazado por el dueño en vivo) |
| 900 px q88 | 101 KB | −7%, no justifica el cambio |
| 900 px q90 | 118 KB | más pesado que el original |
| 800 px q92 | 115 KB | más pesado que el original |
| AVIF 979 q60 | 86 KB | sin pérdida visible, −21%, pero decodifica más lento en equipos viejos |

El 62 KB de la variante de 800 px no venía de recortar píxeles de más (el teléfono dpr3 muestra
747 px, y 800 alcanza): venía de **comprimir dos veces**, q80 en el archivo y q90 otra vez en el
pipeline. Subir la calidad del master devuelve el detalle y también el peso. Ningún punto de la
curva paga el cambio.

Caso particular, medido con sha256: cuando la fuente es **más chica que el bucket**, el
optimizador sí sirve el archivo intacto — el hero a 1080 devuelve exactamente los 109 KB de su
fuente. En el resto de las imágenes la fuente mide 2500 px, así que siempre se re-codifica.

## About: aplicado, −19%

`about-max.webp` estaba en 1536x1024 (91 KB) y el teléfono recibía **113 KB**: el pipeline lo
reescalaba a 1080 y lo recomprimía a q90 partiendo de un archivo que ya venía comprimido.

Cambio: el asset pasa a **1080x720, WebP q85 effort 6 (81 KB)**.

| | servido en el bucket 1080 |
|---|---|
| antes (fuente 1536) | 113 KB |
| después (fuente 1080 q85) | **92 KB (−19%)** |

Lo que se midió y no se esperaba: **a igual ancho el optimizador igual re-codifica a q90**. La
doble compresión no desaparece, así que la ganancia es la del reescalado (113 -> 92 KB), no la del
archivo (81 KB si hubiera sido pass-through). Verificación del lado humano: el dueño comparó
`:3000` contra `:3101` en dispositivo y aprobó el resultado el 2026-11-04.

## Si se retoma

La palanca NO es la calidad de las imágenes en general; lo medido apunta a la carga:

- Las 7 cards de proyectos se descargan `eager` a los 21 ms, 318 KB en mobile, compitiendo con el
  hero que es el elemento LCP. Descartado el `lazy` por decisión del dueño (prefiere evitar
  pop-in al scrollear rápido). La alternativa propuesta y no aplicada: una sola card `eager` y el
  resto `lazy`, que es lo que el navegador ya hace con su umbral de ~1250 px.
- Recortar las 45 fuentes de más de 1100 px rinde ~12% (medido en la card más pesada: 85 -> 75 KB),
  no el 54% del hero.
- AVIF reduciría ~21-30%, pero suma trabajo de decodificación en equipos viejos, que es el síntoma
  que se quería quitar.

Cualquier intento futuro empieza repitiendo la medición de la primera tabla, no ajustando números
a ojo.
