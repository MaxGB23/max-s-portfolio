# RFC: Politica de verificacion - que gatea CI, que corre local y como crece

> **STATUS: PROPUESTO (2026-10-30).** Implementa el estado que abre el PR #17
> (guards manuales de navbar y About) y planifica el crecimiento de `pnpm qa` y
> de `pnpm icons:build`. Se congela cuando el dueno lo apruebe; hasta entonces
> es una propuesta, no canon.

## 1. Contexto

El repo tiene cinco gates en CI (`typecheck`, `test`, `lint:docs`, `audit:i18n`,
`build`), una capa de scripts manuales con aserciones reales
(`navbar-active.mjs`, `hero-about-audit.mjs`, `audit-*.mjs`, ...) y una sonda
desechable cada vez que aparece un bug raro.

Dos casos recientes muestran donde duele:

- **Navbar y About:** regresiones que fallan en silencio y que se habian
  verificado con sondas que no quedaron. El PR #17 les dio guard (veredicto puro
  en `pnpm test`, recorrido manual en `pnpm qa`).
- **Iconos de marca:** la generacion (`pnpm icons:build`) es local y su salida
  esta commiteada; el invariante "cada SVG tiene su WebP" si vive en
  `pnpm test`. El hueco es la frescura: el WebP puede quedar rancio respecto de
  su SVG y nada lo detecta.

La pregunta que este RFC responde: cuando aparezcan mas casos, que sube a CI,
que se queda local, y con que disparadores crece la estructura sin volverse un
cementerio.

## 2. Principio

**El veredicto sube a CI; el recorrido se queda local.**

Todo lo que se puede decidir sobre *datos* (una clase de DOM, la geometria de un
rect, el hash de un archivo) es una funcion pura y corre en CI gratis, hermetico
y en milisegundos. Todo lo que necesita *un navegador, un server, una red o un
reloj* es caro y flaky por naturaleza: se ejecuta local, cuando alguien lo pide.

Corolario: si un invariante no se puede expresar sobre datos, la pregunta no es
"como lo gateo" sino "por que el codigo no expone ese dato".

## 3. Niveles

| Nivel | Que es | Ejemplos | Corre en CI | Bloquea |
| --- | --- | --- | --- | --- |
| **T1** | Gate hermetico | `typecheck`, `test`, `lint:docs`, `audit:i18n`, `build` | si | si |
| **T2** | Veredicto puro dentro de `pnpm test` | fixtures de `reveal-guards.test.mjs`, `brand-icons.test.mjs` | si | si |
| **T3** | Driver de navegador manual | `pnpm qa`, `navbar-active.mjs`, `audit-*.mjs` | no | no |
| **T4** | Medicion desechable | sonda de una sola vez, nunca se commitea | no | no |

Criterios de admision a **T1/T2**: determinista, sin red, sin navegador, sin
dependencia de plataforma, y el total de `pnpm test` se mantiene por debajo de
~5 s. Si algo no cumple, no es que "todavia no es gate": es T3.

Criterios de admision a **T3**: necesita browser/server/reloj, o su veredicto
depende de cadencia de frames.

## 4. Criterio para escribir un guard nuevo

Tres preguntas; las tres tienen que ser "si":

1. **Falla en silencio.** Solo se nota si visitas el escenario exacto.
2. **Alguien lo rompe sin querer.** El codigo que lo produce vive cerca de algo
   que se edita por otros motivos.
3. **Se observa con una lectura barata.** Una clase, un rect, un hash, un
   atributo. Si hace falta una captura o un modelo, no es guard.

Presupuesto: los drivers de T3 se quedan por debajo de **6** y cada uno debe
poder borrarse sin tocar a los demas. Si el catalogo crece mas rapido que eso,
el problema es de contrato de componentes, no de verificacion.

## 5. Como crece `qa`

Disparadores concretos, para que la decision no dependa de esta conversacion:

- **Tercer guard:** `pnpm qa` deja el array literal y descubre
  `scripts/guards/*.guard.mjs` por glob. Registro gratis; nada que recordar.
- **Tercer driver que copie el mismo boilerplate** (launch, `resolveBase`,
  reporte, exit code): se extrae `scripts/lib/guard-harness.mjs`. Antes de eso es
  abstraccion sin evidencia.
- **Docs:** una sola fila en el mapa de `docs/README.md` para la clase de
  pregunta ("como se que X no se rompio"), nunca una fila por guard. La lista de
  lo que corre la imprime `pnpm qa`.
- **Un guard muere con su invariante.** Si el comportamiento desaparece, el
  guard se borra en la misma work unit. Un guard huerfano ensena a ignorar la
  salida.
- **El contexto de cada guard vive en su cabecera de codigo** (que regresion,
  contra que build previo se calibro). El documento de tarea se cierra con el
  track; no es archivo de consulta.

## 6. Como crece `icons`

El invariante de hoy (existe el hermano WebP) no cubre el caso real: **reemplazar**
un SVG y olvidar `pnpm icons:build`. Ademas la idempotencia por mtime no
sobrevive a un clon fresco, donde todos los archivos comparten el timestamp del
checkout.

Plan: cambiar la fuente de verdad de mtime a hash.

- `public/brands/manifest.json` con
  `{ version: 1, icons: [{ name, svgSha256, webpSha256 }] }`.
- `scripts/brand-icons.mjs`: rasteriza cuando falta la entrada o cuando el
  `svgSha256` del manifiesto no coincide con el archivo; escribe el manifiesto.
  Sobra toda la logica de mtime.
- `scripts/brand-icons.test.mjs` (T2, ya existe): extiende el invariante a
  "cada SVG tiene su WebP **y** su entrada de manifiesto con el hash correcto",
  y ademas verifica el `webpSha256` para detectar un binario cambiado a mano.
  Sigue siendo lectura barata: hashes, sin rasterizar.
- CI **no** ejecuta `icons:build`. Rasterizar con `sharp`/libvips puede emitir
  bytes distintos por plataforma y version: regenerar y diffear daria rojo
  permanente por motivos ajenos al codigo.

## 7. Que no entra a CI (ni ahora ni cuando crezca)

- Mediciones de timing o de cadencia de frames.
- Diffs visuales y snapshots de pagina.
- Cualquier cosa que dependa de WebKit, de un binario extra o de la red.
- Sondas de una sola vez: si merecen quedarse, se promueven a T2 o a T3 con su
  calibracion escrita.

## 8. Decisiones abiertas

- **CI filtrado por paths** (`components/navbar.tsx`,
  `components/about-section.tsx`): correria `pnpm qa` solo cuando el riesgo
  existe. No se toma ahora; es la salida si el checklist se saltea dos veces
  seguidas.
- **Gatear un invariante que hoy es T3** exige primero expresarlo como dato.
  Si no se puede, no se gatea: se acepta el costo de T3.

## 9. Orden de trabajo propuesto

1. **icons-manifest** (T2): manifiesto, script sin mtime, test extendido. Un
   work unit chico y autocontenido.
2. **qa glob + harness**: solo cuando aparezca el tercer guard. Escrito el
   disparador, el trabajo es mecanico.
3. **CI filtrado por paths**: solo si el checklist falla dos veces.

## 10. Cuando se revisa este RFC

Se reabre si: entra un guard nuevo, se borra un driver, se propone un gate
nuevo, o el checklist de `iteration-guide.md` 12 se saltea dos veces seguidas.
Ese ultimo es el unico que diria que la capa manual fallo y que hay que pagar el
peaje de CI.
