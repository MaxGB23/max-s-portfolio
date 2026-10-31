# RFC: Politica de verificacion - que gatea CI, que corre local y como crece

> **STATUS: PROPUESTO (2026-10-30), en la rama `docs/verification-policy`
> (PR #19, sin mergear).** Viaja junto con su primera implementacion, el
> manifiesto de `pnpm icons:build`. Se congela al mergear y se supera con otro
> RFC, segun la tabla de vida de `docs/README.md`.

## 1. Contexto

El repo tiene cinco gates en CI (`typecheck`, `test`, `lint:docs`, `audit:i18n`,
`build`), una capa de scripts manuales con aserciones reales
(`navbar-active.mjs`, `hero-about-audit.mjs`, `audit-*.mjs`) y una sonda
desechable cada vez que aparece un bug raro.

Dos casos recientes delimitan el problema:

- **Navbar y About:** regresiones silenciosas verificadas con sondas que no
  quedaron. El PR #17 (mergeado en `12e9276`) les dio guard: veredicto puro en
  `pnpm test` y recorrido manual en `pnpm qa`.
- **Iconos de marca:** la generacion (`pnpm icons:build`) es local y su salida
  esta commiteada; el invariante "cada SVG tiene su WebP" vive en `pnpm test`.
  El hueco es la frescura, y su causa real es esta: `newer()` compara mtime con
  `>=` (`scripts/brand-icons.mjs:33-40`), y en un clon fresco git escribe todos
  los archivos con el timestamp del checkout, asi que la comparacion deja de
  significar algo y un WebP rancio se conserva sin que nada lo note.

La pregunta del RFC: cuando aparezcan mas casos, que sube a CI, que se queda
local, y con que disparadores crece la estructura sin volverse un cementerio.

## 2. Principio

**El veredicto sube a CI; el recorrido se queda local.**

Lo que se decide sobre *datos* (una clase de DOM, la geometria de un rect, el
hash de un archivo) es una funcion pura: corre en CI, hermetico y en
milisegundos. Lo que necesita *navegador, server, red o reloj* es caro y flaky
por naturaleza: se ejecuta local, cuando alguien lo pide.

Corolario: si un invariante no se puede expresar sobre datos, la pregunta no es
"como lo gateo" sino "por que el codigo no expone ese dato".

## 3. Niveles

| Nivel | Que es | Ejemplos | CI | Bloquea |
| --- | --- | --- | --- | --- |
| **GATE** | Hermetico: sin red, sin navegador, sin reloj | `typecheck`, `test` (incluye los veredictos puros y el manifiesto de iconos), `lint:docs`, `audit:i18n`, `build` | si | si |
| **DRIVER** | Necesita navegador y un server | `pnpm qa` (`navbar-deep-link-bg.mjs`, `about-reveal-order.mjs`), `navbar-active.mjs` | no | no |
| **PROBE** | Medicion de una sola vez, nunca se commitea | la sonda que mide un tiron o una cadencia | no | no |

`audit-*.mjs` son auditorias de layout, no drivers de asercion, y
`audit-i18n-content.mjs` es un GATE: no se mezclan.

Admision a **GATE**: determinista, sin red, sin navegador, sin dependencia de
plataforma. Hoy `pnpm test` son 42 casos en 1.78 s (medido el 2026-10-30); si un
caso cae fuera de ese perfil, no es "todavia no es gate": es DRIVER.

## 4. Criterio para escribir un guard nuevo

Tres preguntas; las tres tienen que ser "si":

1. **Falla en silencio.** Solo se nota si visitas el escenario exacto.
2. **Se rompe por una de estas dos vias:** al editar codigo cercano, o por
   quedarse rancio un artefacto derivado cuya frescura nadie comprueba.
3. **Se observa con una lectura barata.** Una clase, un rect, un hash, un
   atributo. Si hace falta una captura o un modelo, no es guard.

La segunda via existe por el caso de los iconos: agregar un SVG y olvidar
`pnpm icons:build` no se parece a "romper codigo cercano", pero es el mismo tipo
de falla silenciosa sobre un artefacto derivado.

Propiedad exigida, sin numeros arbitrarios: **cada driver se puede borrar sin
tocar a los demas**, y el catalogo no crece si el invariante se puede expresar
como dato.

## 5. Como crece

- **Tercer driver:** recien ahi se decide entre descubrir
  `scripts/guards/*.guard.mjs` por glob o seguir con el array de `scripts/qa.mjs`.
  Con dos, el array se lee y no sorprende.
- **Tercer driver que copie el mismo boilerplate** (launch, `resolveBase`,
  reporte, exit code): se extrae `scripts/lib/guard-harness.mjs`. Antes de eso es
  abstraccion sin evidencia.
- **Docs:** se amplia el vocabulario de la **fila existente** del mapa de
  `docs/README.md` ("como se que X no se rompio"), nunca se agrega una fila por
  guard ni se convierte el mapa en inventario de tests: es vocabulario de
  preguntas del usuario, no politica de agentes.
- **Un guard muere con su invariante.** Si el comportamiento desaparece, el
  guard se borra en la misma work unit; un guard huerfano ensena a ignorar la
  salida.
- **El contexto de cada guard vive en su cabecera de codigo** (que regresion,
  contra que build previo se calibro). El documento de tarea se cierra con el
  track y no es archivo de consulta.

## 6. Como crece `icons`

El invariante de hoy (existe el hermano WebP) no cubre el caso real:
**reemplazar** un SVG y no reconstruir. La fuente de verdad pasa de mtime a hash.

**Manifiesto.** `scripts/brand-icons.manifest.json`, commiteado, junto al script
que lo escribe. NO va bajo `public/`: ese directorio se sirve, y esto es un
registro de build, no un asset.

```json
{
  "version": 1,
  "icons": [
    { "name": "blender", "svgSha256": "...", "webpSha256": "..." }
  ]
}
```

- `name`: basename sin extension. `icons` ordenado por `name` (orden de bytes),
  claves en el orden `name`, `svgSha256`, `webpSha256`, indentacion de 2 espacios
  y salto de linea final: el archivo no genera ruido de diff.
- `version: 1`. El test falla ante cualquier otro valor; sube solo si cambia la
  forma, y un bump reescribe el archivo entero.

**Script.** Rasteriza cuando falta la entrada, cuando `svgSha256` no coincide,
cuando falta el WebP o cuando `webpSha256` no coincide (binario cambiado a mano).
La primera corrida **adopta** lo existente: registra los hashes actuales sin
re-rasterizar, de modo que el registro arranca verdadero y desde ahi la frescura
es detectable.

**Borrados.** Un SVG eliminado se poda: el script borra su entrada y el WebP
huerfano. El test falla si queda un WebP sin SVG o una entrada sin SVG, asi que
esto no depende de que alguien corra el script.

**Test** (`scripts/brand-icons.test.mjs`, GATE): reemplaza el invariante de
hermanos por cinco aserciones.

1. Hay al menos un SVG (guarda al guard: una carpeta vacia pasaria todo lo demas).
2. Cada SVG tiene entrada de manifiesto con `svgSha256` correcto.
3. Cada entrada tiene su SVG y su WebP, y `webpSha256` coincide.
4. No hay WebP sin SVG.
5. `version` es 1.

**CI no ejecuta `icons:build`.** Rasterizar con `sharp`/libvips puede emitir
bytes distintos por plataforma y version: regenerar y diffear daria rojo
permanente por motivos ajenos al codigo.

Consecuencia asumida: reconstruir en otra maquina cambia los bytes, asi que el
WebP y el manifiesto se commitean juntos; el test falla si se commitea uno solo.

## 7. Lo que nunca entra a CI

- Mediciones de timing o de cadencia de frames.
- Diffs visuales y snapshots de pagina.
- Cualquier cosa que dependa de WebKit, de un binario extra o de la red.
- Sondas de una sola vez: si merecen quedarse, se promueven a GATE o a DRIVER
  con su calibracion escrita.

## 8. Esta politica no propone gates nuevos

Ninguna seccion de este documento agrega un gate ni modifica `verify.yml`. Si
alguna vez hiciera falta un gate nuevo —por ejemplo CI filtrado por paths para
los dos componentes mas fragiles— eso es decision aparte y merece su propio RFC,
porque toca `verify.yml` y `AGENTS.md`, no esta politica.

La senal que lo justificaria esta escrita: la casilla del checklist de
`iteration-guide.md` 12 salteada dos veces seguidas.

## 9. Orden de trabajo

1. **icons-manifest** (GATE): manifiesto, script sin mtime, test extendido. Un
   work unit chico, autocontenido, y viaja con este RFC.
2. **qa glob o harness**: solo si aparece el tercer driver. Escrito el disparador,
   el trabajo es mecanico.
3. **RFC de CI filtrado**: solo con la senal de §8.

## 10. Cuando este RFC se supera

Este documento es una DECISION (`docs/README.md`): no se edita despues de
aprobado. Pierde vigencia y se supera con otro RFC cuando:

- aparece un tipo de verificacion que no encaja en GATE, DRIVER ni PROBE;
- se propone un gate nuevo con impacto en `verify.yml`;
- la capa manual falla dos veces seguidas (ver §8), o sea el costo de DRIVER
  deja de ser aceptable.
