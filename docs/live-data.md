# Datos vivos del portfolio

<!-- toc:start -->
- [1. Qué es un dato vivo aquí](#1-qué-es-un-dato-vivo-aquí)
- [2. Las capas y sus ventanas](#2-las-capas-y-sus-ventanas)
- [3. La regla de hidratación](#3-la-regla-de-hidratación)
- [4. Los respaldos, en orden](#4-los-respaldos-en-orden)
- [5. Cómo añadir un dato vivo nuevo](#5-cómo-añadir-un-dato-vivo-nuevo)
- [6. Qué caduca y cuándo](#6-qué-caduca-y-cuándo)
- [7. Diagnóstico](#7-diagnóstico)
<!-- toc:end -->

> [!NOTE] Estado: VIVO
> Qué cuenta como dato vivo, dónde se lee, cómo llega al cliente y qué se publica
> cuando la fuente falla. Cada valor de esta página se puede verificar en el
> archivo que se cita al lado.

## 1. Qué es un dato vivo aquí

Un dato vivo es el que se resuelve en el servidor en cada render (o en cada
revalidación de caché) y no se escribe a mano en `data/`. Hoy existen dos familias:

| Familia | Tipo de fuente | Dónde se declara |
|---|---|---|
| Descargas acumuladas | registry externo (`open-vsx`, `zed`) | `ProjectL.liveMetric` en `data/projects/*.ts` |
| Tiempo en producción | fecha de arranque `YYYY-MM-DD` | `ProjectL.productionSince`, con la constante en `lib/production-since.ts` |

Las dos se leen de `lib/` (`lib/live-metrics.ts`, `lib/tenure.ts`) y las dos
terminan como props de componentes cliente.

**Qué no entra aquí:**

- Un proyecto con periodo **cerrado**. `productionSince` solo se declara en
  sistemas que siguen en producción: una cifra que crece cada mes afirmaría algo
  falso. `data/projects/caf.ts` es hoy el único que la declara
  (`CAF_PRODUCTION_SINCE = "2025-11-22"`).
- Una frase en prosa. Una oración lleva una **fecha** ("medidas el 6 nov 2026"),
  nunca una duración; la duración se calcula. El respaldo escrito de la métrica
  está fechado a propósito para que nadie lo lea como cifra actual.

## 2. Las capas y sus ventanas

| Capa | Constante | Valor literal | Archivo |
|---|---|---|---|
| Ventana del fetch del registry para card y ficha | `LIVE_METRIC_REVALIDATE_SECONDS` | `24 * 60 * 60` | `lib/live-metrics.ts` |
| Tope de espera del fetch | `LIVE_METRIC_TIMEOUT_MS` | `3000` | `lib/live-metrics.ts` |
| Ventana corta que usa el badge | `BADGE_CACHE_SECONDS` | `60 * 60` | `lib/badge-svg.ts` |
| Revalidate de la ruta del badge | `revalidate` | `3600` | `app/badges/[file]/route.ts` |
| Caché de navegador del badge | cabecera `cache-control` | `public, max-age=300` | `app/badges/[file]/route.ts` |

El badge usa una ventana más corta porque se pide mucho menos que la página y su
único propósito es no envejecer. `revalidate = 3600` va como literal porque Next
la lee de forma estática: si cambia `BADGE_CACHE_SECONDS`, hay que cambiar esa
línea también.

**Modo de render que reporta el build** (`pnpm build`, Next 16.1.6):

```
Route (app)               Revalidate  Expire
┌ ƒ /
├ ƒ /_not-found
├ ● /badges/[file]                1h      1y
│ ├ /badges/open-vsx.svg          1h      1y
│ ├ /badges/zed.svg               1h      1y
│ └ /badges/uptime.svg            1h      1y
└ ƒ /proyectos/[id]
```

- `/` y `/proyectos/[id]` son `ƒ` (Dynamic, server-rendered on demand) porque el
  layout raíz lee `cookies()` y la ficha además lo hace en `generateMetadata`.
  Ninguna de las dos páginas declara `export const revalidate`: la frescura sale
  del fetch, no de la ruta.
- `/badges/[file]` es `●` (SSG) con `1h` de revalidación, gracias a
  `generateStaticParams()` (el conjunto es cerrado) más `dynamicParams = false`.

## 3. La regla de hidratación

Esta es la regla que sostiene todo lo demás: **el cliente nunca lee el reloj y
nunca hace fetch**. El servidor resuelve los valores una vez por render y los
pasa hacia abajo como datos ya formateados.

| Paso | Archivo | Qué hace |
|---|---|---|
| Cifras vivas | `app/page.tsx` | `await getLiveMetrics(projects)`: consulta, suma y formatea por proyecto |
| Reloj | `app/page.tsx` | `const productionClock = new Date().toISOString()`, una vez por render |
| Detalle | `app/proyectos/[id]/page.tsx` | `sumDownloads(...)` para ese proyecto y el mismo `productionClock` |
| Consumidores | `components/all-projects.tsx`, `components/featured-projects.tsx`, `components/project-detail.tsx` | solo formatean lo recibido |

Los tres consumidores son componentes `"use client"`. Ninguno llama a `fetch`,
ninguno lee `Date.now()` ni `new Date()`: reciben `productionClock` (ISO) y lo
parsean una vez por render (`productionClock ? new Date(productionClock) : undefined`)
para pasárselo a `localizeProject(project, lang, now)`. `localizeProject` calcula
`productionTenure` con `tenureText(entry.productionSince, lang, now)`.

**El fallo que esto evita.** Si ese reloj se leyera dentro del componente cliente,
el HTML servido (hasta 24 h viejo) y el render de hidratación podían caer en meses
distintos: el mes de arranque cumplido cambia a medianoche UTC, y entonces React
encontraba un texto distinto al del HTML. El resultado era un *hydration
mismatch* y una reescritura silenciosa del texto en pantalla. Con el reloj como
prop, el cliente reproduce exactamente el texto que el servidor publicó.

La única lectura legítima de reloj en un componente cliente es la del footer:
`components/footer.tsx` sustituye `{year}` por `new Date().getFullYear()` en el
copyright. Es un año, cambia una vez cada 365 días y no discrepa entre renders.

Ya resuelto en el servidor, el cliente aplica la precedencia en un solo sitio,
`productionMetricValue(productionTenure, escrito)` (`data/projects/types.ts`):
tiempo calculado > cifra viva del registry > cifra escrita.

## 4. Los respaldos, en orden

| Orden | Respaldo | Valor real | Dónde |
|---|---|---|---|
| 1 | Métrica escrita de la ficha | `"6.8k descargas en Open VSX y Zed"` y `"+10 meses en producción sin caídas"` | `data/projects/funky-theme.ts`, `data/projects/caf.ts` |
| 2 | `fallbackCount` del badge de descargas | `5104` (open-vsx), `1711` (zed) | `lib/badge-svg.ts` |
| 3 | `fallbackText` del badge de tiempo | `"+11 MONTHS"` | `lib/badge-svg.ts` |
| 4 | Tope de espera del fetch | `LIVE_METRIC_TIMEOUT_MS = 3000` | `lib/live-metrics.ts` |

Reglas que hacen que el respaldo funcione:

- Un fallo de fetch, un `!response.ok`, un JSON sin número o un timeout devuelven
  `null`, nunca una excepción: el llamador cae al valor escrito.
- La suma solo se publica **si todas** las fuentes respondieron (`sumDownloads`).
  Una suma parcial omitiría una plataforma y publicaría menos tracción que la
  real sin avisar.
- La respuesta nunca es una imagen rota ni un campo vacío: `renderTenureBadge`
  publica `fallbackText` si la fecha no se puede leer, y la ficha publica el
  literal fechado si el registry no contesta.

**Qué capa sirve el valor escrito y por qué:**

- **Sitio (card y ficha)**: el literal de `data/projects/*.ts`. La cifra viva
  reemplaza solo la parte inicial de la frase (`withLiveMetric`,
  `productionMetricValue`) y la etiqueta cambia con ella: la escrita está
  fechada, y solo la viva puede decir "en vivo" (`labelLive`).
- **Badge**: `fallbackCount` / `fallbackText` de `lib/badge-svg.ts`. La ruta del
  badge no importa `data/`: ahí no hay `ProjectL` que leer, así que la cifra se
  repite como constante. Son los mismos números, medidos el 6 nov 2026, que
  documenta `data/projects/funky-theme.ts`.

## 5. Cómo añadir un dato vivo nuevo

1. **Fuente en `lib/`**: un módulo que reciba la entrada y devuelva el valor o
   `null` si no se pudo leer. Nunca lanza.
2. **Ventana y su constante**: la espera de red va con `AbortSignal.timeout`, y la
   ventana de caché es una constante exportada con nombre (`XX_SECONDS`), igual
   que `LIVE_METRIC_REVALIDATE_SECONDS`.
3. **Respaldo escrito en el archivo de datos**: el valor con fecha explícita, en
   las dos hojas `{es, en}` (el compilador exige paridad).
4. **Consumidor que lo recibe como prop**: el servidor lo resuelve en el `page.tsx`
   y el componente cliente solo lo formatea; jamás vuelve a leer el reloj ni
   vuelve a hacer fetch.
5. **Tests**: un caso por cada camino, éxito y `null` (ver
   `lib/live-metrics.test.ts`, `lib/tenure.test.ts`,
   `data/projects.production-tenure.test.ts`).
6. **Entrada de badge**, solo si se publica como imagen: una entrada en `BADGES`
   con `file`, `label`, `color`, `ariaLabel` y su respaldo. Un color por debajo de
   `BADGE_MIN_CONTRAST` (`4.5`) exige `contrastException` escrito o el dibujo
   falla.

## 6. Qué caduca y cuándo

| Qué ve el lector | Quién lo refresca | Peor caso de obsolescencia |
|---|---|---|
| Cifra de descargas en la card (home) y en la ficha | fetch con `revalidate: 86400` en el render del servidor | 24 h |
| Tiempo en producción en la card y en la ficha | `productionClock` de cada render (ruta `ƒ`) | 0: se recalcula en cada request |
| Badge de descargas o de tiempo en el README del perfil | endpoint `/badges/<file>.svg`: `●` con `revalidate = 3600` en el CDN | 1 h en el CDN, más `max-age=300` de caché de navegador |

Nada de esto necesita un cron ni un commit. Los badges se dibujan en el endpoint
porque GitHub solo sirve archivos y no ejecuta código; el precio es una ruta
pública más, no un trabajo programado. Tampoco hay cifra que actualizar a mano:
si no hay commit, la cifra no se congela.

## 7. Diagnóstico

Cuando una cifra parece vieja, el orden es de fuera hacia dentro:

1. **Cabeceras del badge**: `curl -sI https://<host>/badges/uptime.svg` y mirar
   `cache-control` (`public, max-age=300`) y `X-Vercel-Cache` (`HIT`, `MISS`,
   `STALE`). Un `HIT` con `age` alto dice que el CDN todavía no revalidó.
2. **La ruta**: `app/badges/[file]/route.ts`. `revalidate = 3600` manda en el CDN;
   si se cambió `BADGE_CACHE_SECONDS` y no esta línea, ganan las dos ventanas que
   estén escritas.
3. **La constante del sitio**: `LIVE_METRIC_REVALIDATE_SECONDS` en
   `lib/live-metrics.ts` (24 h). La fuente puede cambiar antes, pero la página no
   la vuelve a leer hasta que expira esa ventana: una cifra de hace unas horas no
   es un bug.
4. **El respaldo**: si el registry devuelve error o no responde en
   `LIVE_METRIC_TIMEOUT_MS` (3000 ms), la página publica el literal fechado y el
   badge su `fallbackCount`. Ver una cifra con fecha es la señal de que la fuente
   falló, no de que el dato esté mal calculado.
5. **Los modos de render**: `pnpm build` imprime la tabla de rutas. `ƒ` en `/` y
   en `/proyectos/[id]` significa que se renderizan por request: si el HTML está
   cacheado en el borde, el problema está en el CDN, no en la página. `●` con `1h`
   en `/badges/[file]` es lo esperado.
