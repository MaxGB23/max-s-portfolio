# Capas de verificación

<!-- toc:start -->
- [1. El orden no es casual](#1-el-orden-no-es-casual)
- [2. El recorrido de una work unit](#2-el-recorrido-de-una-work-unit)
- [3. `AGENTS.md`: la memoria corta](#3-agentsmd-la-memoria-corta)
- [4. El canon VIVO: verdad que se puede verificar](#4-el-canon-vivo-verdad-que-se-puede-verificar)
- [5. El hook `pre-commit`: la puerta barata](#5-el-hook-pre-commit-la-puerta-barata)
- [6. El hook `commit-msg`: el rastro](#6-el-hook-commit-msg-el-rastro)
- [7. CI: el verificador externo](#7-ci-el-verificador-externo)
- [8. Mediciones y `pnpm qa`: lo que solo un navegador dice](#8-mediciones-y-pnpm-qa-lo-que-solo-un-navegador-dice)
- [9. ODD y la revisión nativa: el juicio](#9-odd-y-la-revisión-nativa-el-juicio)
- [10. Lo que no tiene capa, a propósito](#10-lo-que-no-tiene-capa-a-propósito)
- [11. Descartado: gentleman-guardian-angel (GGA)](#11-descartado-gentleman-guardian-angel-gga)
<!-- toc:end -->

> [!NOTE] Estado: VIVO
> Responde una sola pregunta: qué capa atrapa qué error, y por qué vive ahí.
> Las reglas concretas no se copian aquí; cada sección nombra su dueño.

## 1. El orden no es casual

De lo barato a lo caro, y un solo dueño por tipo de error: el criterio vive en
una capa, la que no se puede saltar. Que el hook y CI corran el mismo
`docs.mjs` no es duplicar: es el mismo criterio dos veces, una cerca del commit y
otra donde ya no se puede esquivar. Duplicar sería tener dos implementaciones
parecidas, porque el día que una cambia la otra miente.

| # | Capa | Corre | Atrapa |
|---|---|---|---|
| 1 | `AGENTS.md` y su tabla de dueños | siempre, lo lee el agente | dónde buscar la verdad |
| 2 | canon VIVO en `docs/` | al leer o escribir | conocimiento desactualizado |
| 3 | hook `pre-commit` | cada commit que toca docs | canon roto: mapa, TOC, enlaces |
| 4 | hook `commit-msg` | cada commit | commit sin rastro `Docs:`/`Risk:` |
| 5 | CI (`verify.yml`) | push a main y cada PR | typecheck, tests, i18n, build |
| 6 | `pnpm qa` y mediciones | a mano, con server | regresiones que solo existen en un navegador |
| 7 | ODD y revisión nativa | al cerrar una work unit | diseño y riesgo que ningún test cubre |

## 2. El recorrido de una work unit

El orden práctico, que es lo que se olvida:

1. Leer el dueño del tema en la tabla de `AGENTS.md` antes de escribir.
2. Implementar, con test primero cuando hay comportamiento que se pueda fijar.
3. Correr lo hermético en local: `pnpm typecheck`, `pnpm test`, `pnpm lint:docs`,
   `pnpm audit:i18n`, `pnpm build`. Es exactamente lo que corre CI.
4. Si el cambio toca layout, timeline o scroll, correr `pnpm qa` si ya hay un
   guard para eso, o el script que mide, con build de producción y un server.
5. Commitear: el hook valida docs si tocaste docs, y `commit-msg` exige el
   rastro. Un commit es una work unit, no un tipo de archivo.
6. Push: dispara CI. Y push es deploy; va con aprobación.
7. Cerrar: si cambiaste un valor, nombre u orden, editar la frase del doc dueño.

## 3. `AGENTS.md`: la memoria corta

Es el único archivo que todo agente lee antes de tocar nada. Por eso se mantiene
corto (el gate lo capa en 80 líneas) y delega: una tabla dice qué doc es dueño de
cada tema, y otra lista lo que se paga en requests y tokens.

Por qué es bueno: sin reglas, cada sesión reinventa el repo y discute lo ya
decidido. Con una tabla, el agente llega al doc correcto sin leer doce. Y el
límite de tamaño es mecánico, no una buena intención: un archivo que crece deja
de leerse, y entonces la tabla muere en silencio.

## 4. El canon VIVO: verdad que se puede verificar

`docs/README.md` no es un índice decorativo: es el punto de entrada, con el mapa
de preguntas reales y la vida de cada carpeta. Solo lo VIVO tiene la obligación
de ser verdad hoy, y solo lo VIVO se verifica mecánicamente. Un RFC aprobado o
una incidencia vieja pueden citar algo retirado sin mentir: son el registro de su
momento.

Por qué es bueno: separa "qué es verdad" de "qué decidimos". Sin esa distinción,
o se reescribe la historia y se pierde el porqué, o se deja el canon mintiendo.

## 5. El hook `pre-commit`: la puerta barata

Vive en `.githooks/pre-commit` y corre `node scripts/docs.mjs check`, solo si el
commit staged toca `docs/` o `AGENTS.md`. Valida lo que nadie recuerda: docs VIVO
fuera del mapa, TOC desincronizado, enlaces y anclas, nombres muertos y el
tamaño de `AGENTS.md`.

Por qué es bueno: el error de docs se descubre en el momento en que se comete,
no tres semanas después. Y es barato porque solo mira lo que cambió.

Por qué no corre tests ni typecheck: un hook lento se salta con
`--no-verify`, y un hook que se salta no existe. La verificación cara va a CI,
que no se puede saltar. Los hooks se instalan una vez por clon con
`pnpm hooks:install`.

## 6. El hook `commit-msg`: el rastro

Exige en el cuerpo del commit `Docs: none - <motivo>` o
`Docs: <archivo> - <qué cambió>`, más la línea `Risk:`. Es la única capa que no
puede reconstruirse después: cuando alguien pregunte dentro de seis meses por qué
ese commit no tocó docs, la respuesta está escrita o no está.

Por qué es bueno: convierte "me acordé de actualizar el doc" en un dato
verificable, y obliga a nombrar el riesgo mientras el diff está fresco.

## 7. CI: el verificador externo

`.github/workflows/verify.yml` corre en cada push a main y en cada PR:
`pnpm install --frozen-lockfile`, `typecheck`, `test`, `lint:docs`,
`audit:i18n`, `build`. Las acciones van pinneadas por SHA completo, no por tag,
y el job solo pide `contents: read`.

Por qué es bueno: es hermético (mismo resultado dos veces, sin red ni estado
local) y es la única capa que nadie puede saltarse. Existe porque Vercel construye
la preview pero no corre tests ni el gate de docs: sin CI, el merge no tiene
verificador. El pin por SHA y el permiso mínimo son la parte de seguridad de la
cadena de suministro: un tag se puede mover después del review, y un token con
escritura convierte una acción comprometida en un push.

## 8. Mediciones y `pnpm qa`: lo que solo un navegador dice

`pnpm qa` es la puerta única a los guards de DOM: un runner chico
(`scripts/qa.mjs`) con una lista de guards, que reenvía `--url` a todos y agrega
el veredicto en un solo resultado. Guardar esa lista en el código y no en el doc
es deliberado: un inventario en la documentación envejece en cuanto entra el
tercer guard.

Los guards nacen de bugs reales: cada uno reproduce un fallo que solo existe en
un navegador, con build de producción y un server (navegación, orden de entrada,
scroll, espaciado, escala). Lo que se puede fijar como criterio vive en
`pnpm test`; la medición, que necesita un viewport de verdad, se queda aquí.
Dueño: `docs/design/iteration-guide.md` sección 12.

Agregar un guard no siempre significa escribir un script nuevo: puede ser un
script que ya medía otra cosa y ahora también sirve como guard, y entra con una
línea en la lista. La capa crece por acumulación de casos reales, no por
anticipación, y hoy sigue siendo compacta a propósito: cuando crezca, lo hará
por el runner y no por una lista en un doc.

Por qué es bueno: hay errores que ningún test de unidad ve porque no existen sin
un navegador, un viewport y un scroll. Siguen fuera de CI a propósito: son caros,
frágiles en runners y su lectura visual es del usuario, no del pipeline.

## 9. ODD y la revisión nativa: el juicio

Las tareas ODD en `odd/tasks/` abren el trabajo (specs que citan al usuario
literal, tareas, log) y cierran al mergear. Al cerrar cada work unit, la revisión
nativa da un veredicto por lentes (`risk`, `resilience`, `readability`,
`reliability`) y solo bloquea hallazgos severos causados por el candidato.

Por qué es bueno: es la única capa inferencial del sistema, y está declarada como
tal. Va al final porque juzga sobre algo ya verificado, y su veredicto nunca
autoriza entrega: commit, push y PR siguen siendo decisiones separadas.

## 10. Lo que no tiene capa, a propósito

No hay linter ni formatter: el "lint" de este repo son `pnpm lint:docs` y
`pnpm audit:i18n`. Formatear es una decisión que ya se toma al escribir, y una
herramienta que reescribe archivos agrega un diff que nadie revisa.

Tampoco hay gate de estilo visual automático: lo que solo se ve, se mira.

## 11. Descartado: gentleman-guardian-angel (GGA)

Evaluado el 2026-11-05 contra la versión 2.10.1 del repo
`Gentleman-Programming/gentleman-guardian-angel`.

Qué es: un CLI en Bash que se instala como hook `pre-commit` y manda los archivos
staged a un LLM para que los evalúe contra tu `AGENTS.md`. Agnóstico de proveedor
(Claude, Gemini, Codex, Ollama y otros), con caché de archivos no modificados y
modos `--ci` y `--pr-mode`.

Se parece a dos cosas nuestras: al gate del commit, como lugar; y a la revisión
nativa por lentes, como tipo de juicio. No se parece a CI ni a las mediciones:
esas prueban, GGA opina.

Por qué no entra:

1. Mete un juicio inferencial en el punto más caro del sistema, cada commit.
   Nuestra regla es lo barato primero y lo caro una sola vez.
2. Su veredicto no es reproducible. Un gate de merge tiene que dar lo mismo dos
   veces; si no, el rojo no significa nada.
3. Necesita un CLI de proveedor o una API key: rompe el hermetismo de
   `verify.yml`, que hoy no depende de la red.
4. Duplica el juez que ya tenemos. Dos capas inferenciales con criterios propios
   dan dos verdades, y ninguna con rastro.
5. Lo único que aportaría de verdad son las reglas de `AGENTS.md` que ningún
   script puede chequear. Hoy eso lo cubren el agente y las personas;
   `pnpm audit:i18n` cubre una parte de forma mecánica.

Condición para reconsiderarlo: si algún día hace falta esa capa de estilo no
determinista, entraría como job advisory y no bloqueante, con `--pr-mode`, nunca
dentro del `pre-commit` ni como gate de merge.
