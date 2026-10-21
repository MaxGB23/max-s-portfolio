# RFC: documentación navegable — partir el canon por pregunta, un índice que no puede mentir y el seguro de los nombres muertos

> **STATUS: PROPUESTO (revisión 2, alcance: este repo).** La revisión 1
> proponía el flujo completo (SSOT con ancla, índice seccional por doc, estado
> por archivo, linter de cinco checks). Medido contra este repo, ese flujo es de
> otra escala: aquí hay ocho archivos de canon, un dev y un agente. Esta
> revisión conserva lo que sí paga y descarta el resto; el flujo completo queda
> documentado en el RFC hermano de `funky-ai`, para proyectos grandes.
>
> Evidencia: auditoría de docs previa al merge de `css-first-reveal`
> (2026-10-19) y medición de tamaños del canon.

---

## 1. Qué se midió

Medición del 2026-10-19 (base previa al merge de `css-first-reveal`) y
re-medición del 2026-10-21 (base `c3b90e5`, tras los 18 commits de imágenes,
scroll y navegación). Manda la segunda.

| Archivo | Líneas (10-19) | Líneas (10-21) |
|---|---|---|
| `docs/design/components.md` | 721 | 754 |
| `docs/design/section-animations.md` | 281 | 304 |
| `docs/design/tokens.md` | 281 | 290 |
| `docs/design/typography-families.md` | 246 | 246 |
| `docs/design/iteration-guide.md` | 198 | 199 |
| `buttons.md` + `pointer-gestures.md` + `README.md` | 295 | 143 + 89 + 63 = 295 |

2.088 líneas de markdown en ocho archivos, más 302 del espejo CSS. Dos cifras no
envejecieron: `typography-families.md` y el trío de archivos menores. Las demás
crecieron entre 1 y 33 líneas.

`docs/design/README.md` ya tiene un mapa rápido de ocho preguntas. Funciona, y
ese es el punto de partida: **no hay que inventar la navegación, hay que
completarla y ponerla donde se busca.**

## 2. Diagnóstico: dos problemas distintos

**a) Encontrar (crónico).** Tres causas concretas:

- El mapa cubre solo el canon. `docs/issues/`, `docs/rfcs/`, `docs/projects/` y
  `odd/tasks/` no aparecen en ningún índice: para saber si un tema ya se
  investigó hay que hacer grep o recurrir a la memoria.
- El mapa apunta a archivo, no a sección con respuesta. "components.md 10"
  obliga a abrir un archivo de 721 líneas y buscar.
- Los archivos son demasiado grandes para que el puntero sirva. `components.md`
  tiene 13 secciones y 721 líneas: es un doc que se lee una vez y no se vuelve
  a navegar.

**b) Ser verdad (episódico, y aquí se cubre bien).** Los tres casos de la
auditoría (pin de GSAP, `FadeIn*`, los 12 estilos inline del riesgo G1) se
corrigieron, y la regla actual —sincronizar el tema al aprobar cada work
unit— los habría cazado antes si se hubiera aplicado también en el cierre del
track. No hay evidencia de que haga falta un SSOT ni de que haya que prohibir
tocar docs durante el track: con un dev y un agente, la regla por work unit
funciona.

Entonces: la propuesta ataca (a) con fuerza y (b) con un seguro barato, sin
importar maquinaria.

## 3. Qué no se propone (y por qué)

- **SSOT de filas con condición "Aplica si..."**: aquí hay ocho archivos de
  canon; el índice de preguntas ya es el SSOT.
- **Índice seccional mantenido a mano por doc**: se pudre. Evidencia de
  `funky-ai`: el índice de `skills.md` listaba 8 de 12 headings y nada lo
  detectaba. Se genera.
- **Línea de estado por archivo**: la carpeta ya declara la vida (sección 5).
  Una línea por archivo es ceremonia sin verificación.
- **Linter de cinco checks**: tres, más un warning de tamaño.
- **Prohibir editar docs durante el track**: la regla por work unit funciona y
  el track es corto. El hueco estaba en el cierre, no en la ejecución.

## 4. Punto de entrada único

`docs/README.md` (hoy no existe), con tres bloques:

1. **Mapa de preguntas** (unas 20-25 filas): pregunta, respuesta en una línea,
   enlace con sección. Cubre todas las áreas del repo.
2. **Áreas** (cuatro filas): canon (`docs/design/README.md`), decisiones
   (`docs/rfcs/`), auditorías (`docs/issues/`), trabajo (`odd/tasks/`).
3. **Reglas de vida** (sección 5).

El mapa de preguntas que hoy vive en `docs/design/README.md` **se muda** a
`docs/README.md`; el canon conserva solo su tabla de archivos. Una sola fuente
por cosa.

Criterio para una fila: solo entra si alguien la preguntó de verdad. No es un
índice de archivos, es un índice de preguntas. Si una pregunta no tiene
respuesta clara, eso es una señal sobre el doc, no sobre el índice.

## 5. Vida declarada por carpeta

| Carpeta | Vida | Obligación |
|---|---|---|
| `docs/design/` | VIVO | debe ser verdad hoy |
| `docs/rfcs/` | DECISIÓN | se congela al aprobar; se supera con otro |
| `docs/issues/` | INSTANTÁNEA | fechada; nunca finge ser actual |
| `docs/projects/` | DECISIÓN o TRABAJO | según el doc; si no se sabe, no es canon |
| `odd/tasks/` | TRABAJO | cierra al mergear |
| `docs/design/archive/` | CONGELADO | no se edita |
| `docs/*.md` (raíz, hoy `i18n.md`) | VIVO | guía corta; mismo trato que el canon |

Consecuencia operativa: solo VIVO tiene la obligación de ser verdad hoy, y solo
VIVO se verifica mecánicamente. Un doc de `issues/` puede citar una técnica
retirada sin mentir: es el registro de su momento.

Y una regla explícita: **un doc cerrado no se actualiza.** Si una tarea ODD
vieja o un RFC cerrado dice algo que ya no es cierto, no se reescribe: dejaría
de ser el registro de lo que se decidió. Lo que siga siendo verdad se muda al
canon; lo que murió, a `DEAD.md`. El linter no los lee como verdad, así que
nunca te va a pedir que los toques.

## 6. Presupuesto y partición de `components.md`

Regla: un doc VIVO no pasa de unas 250 líneas; si las pasa, son dos docs. No es
estética: un doc que no se lee de un tirón no se navega. El aviso del linter
salta a 300 (sección 10). Medido el 2026-10-21 **después** de insertar los TOC,
quedan por encima: `components.md` (770, desaparece con la partición),
`section-animations.md` (316) y `tokens.md` (302). Los dos últimos se quedan como
excepción documentada: el bloque TOC suma 12-16 líneas y es el precio de que el
índice exista.

Partición (754 líneas, decidida el 2026-10-21 tras la re-medición):

| Secciones actuales | Líneas | Doc destino |
|---|---|---|
| 1 Shell, 2 contrato de ritmo, 4.1-4.4 navbar/hero/sobre-mí/featured, 9 cue | 289 | `docs/design/sections.md` |
| 3 gates de media, 5 reveal y motion, 6 aurora | 55 | `docs/design/motion.md` |
| 7 tema y dark mode, 8 infraestructura de scroll, 10 debug overlay, 11 gotchas | 114 | `docs/design/platform.md` |
| 4.5-4.13 all-projects, card, pricing, contacto, footer, detalle y auxiliares | 233 | `docs/design/components-detail.md` |
| 12 checklist | 10 | `docs/design/iteration-guide.md` (es proceso, no componente) |
| 13 deuda única | 27 | se distribuye al tema dueño |

El reparto por número de sección no servía: daba 524 / 55 / 114 porque la sección
4 sola ocupa 446 líneas (105-550). Su primera mitad —navbar, hero, about,
featured— pertenece al relato de la home; la segunda abre otra superficie
(listas, pricing y la página de detalle). Partida por ese corte, `components.md`
desaparece y cada mitad se lee en el contexto en que se busca.

`sections.md` queda en 289: por encima de las 250 de la regla blanda y por debajo
del aviso de 300, que es la excepción documentada. Se acepta a sabiendas: cortar
más habría partido la geometría de la home en dos archivos sin ganar navegación.
`motion.md` (55) y `platform.md` (114) nacen cortos y crecen con la deuda
distribuida de la sección 13.

Coste real de las referencias: 70 menciones a `components.md` en el repo, de las
cuales solo **9 son vivas** (4 en `docs/design/README.md`; 1 cada una en
`pointer-gestures.md`, `tokens.md`, `buttons.md`, `iteration-guide.md` y la skill
`layout-debug-canon`). `AGENTS.md` **no** cita el archivo: la revisión 1 daba por
hecho que sí. El resto es registro (`odd/tasks/` 33, `docs/rfcs/` 7,
`docs/issues/` 1, `archive/` 7) y no se toca. El argumento para hacerlo ahora
sigue valiendo, pero por navegación, no por volumen.

## 7. Índice de secciones generado

Cada doc VIVO lleva al principio un bloque delimitado:

```
<!-- toc:start -->
- [1. Shell Section](#1-shell-section)
<!-- toc:end -->
```

`pnpm docs:toc` lo regenera y `pnpm lint:docs` falla si difiere. Es la única
forma de que el índice no mienta: no depende de que alguien se acuerde. Solo se
exige en docs de más de 120 líneas; en uno corto, el índice estorba más que
ayuda.

## 8. Registro de nombres muertos

`docs/design/DEAD.md`, una tabla de una página:

| Símbolo retirado | Retirado el | Sustituto | Doc que lo gobierna |
|---|---|---|---|
| `FadeIn`, `FadeInStagger`, `FadeInItem`, `motion-primitives.tsx` | 2026-10-19 | `Reveal` | `motion.md` 5 |
| `FEATURED_STACK_GATE`, `PIN_MEDIA`, pin de GSAP del featured | 2026-10 | one-slide rule | `sections.md` 4.4 |
| `next-themes`, `ThemeProvider` | 2026-10-19 | `class="dark"` en el layout | `platform.md` 7 |

Regla: la fila se añade en el mismo work unit que retira la técnica. Es la
respuesta a "¿quién menciona esto?" sin depender de la memoria ni de buscar el
nombre del track.

Solo los tokens entre backticks de la primera celda se verifican (C3); una fila
en prosa —"pin de GSAP del featured"— queda como documentación humana. El
registro no pretende ser exhaustivo: pretende que lo enumerable sea enumerable.

`DEAD.md` es VIVO y entra en la tabla del canon. C3 lo excluye del escaneo,
junto con `archive/`: contiene sus propios tokens por definición, y un check que
se marca a sí mismo no informa de nada.

## 9. El flujo: fix mínimo y cierre de track

El coste no se mide en líneas de código sino en **llamadas a herramientas**:
cada lectura, cada edición y cada comando es una request, y el tier diario se
agota por número, no por tokens. El flujo se ordena entonces por "cuántas
requests cuesta decidir", no por tamaño del cambio.

### 9.1 Fix de 1 a 5 líneas, sin ODD

Una sola pregunta, respondida sobre el diff que ya está delante:

> ¿Este cambio altera algo que un doc VIVO afirma, o solo hace que el código
> cumpla lo que el doc ya dice?

Operativamente: ¿puedes señalar la frase que se vuelve falsa? Si puedes, editas
esa frase. Si no, no hay trabajo documental. Tres niveles:

| Nivel | Cuándo | Coste |
|---|---|---|
| 0 — nada | el código pasa a cumplir lo que el doc ya decía | 0 requests: el commit ya se iba a escribir |
| 1 — una frase | cambia un valor, nombre, orden o comportamiento afirmado | 2: leer la sección y editarla |
| 2 — ODD | comportamiento nuevo, componente nuevo, algo retirado | flujo completo |

El nivel 0 es el caso mayoritario y conviene decirlo en voz alta: **si el código
estaba mal y el doc describía lo correcto, no hay nada que documentar.** El doc
es la especificación; el fix es la deuda que se paga.

El rastro de la decisión no necesita archivo nuevo: va en el cuerpo del commit,
que ya es un artefacto obligatorio. Dos formas, ambas greppables:

```
Docs: none - el doc ya describia este comportamiento
Docs: tokens.md 2 - --gap pasa de 1.5rem a 2rem
```

Para que el nivel 1 cueste dos requests y no cuatro, `AGENTS.md` lleva la tabla
tema → archivo de la sección 11. Está en el contexto desde el arranque, así que
no cuesta ninguna; abrir el mapa para averiguar si el gap vive en `tokens.md` o
en `sections.md` sí.

`pnpm lint:docs` **no corre por fix.** Es local, pero sigue siendo una request.
Corre una vez al cerrar la sesión o el track.

### 9.2 Cierre de track

Tres preguntas antes del push final, más una comprobación que no depende de la
memoria:

1. ¿Qué sección del canon describe lo que acabo de cambiar, y qué dice ahora?
2. ¿Qué símbolo o técnica eliminé, y quién lo menciona?
3. ¿Qué cifra o referencia de este diff caduca?

Comprobación: `git diff --diff-filter=D --name-only <base>...HEAD`. Cada
borrado es deuda documental probable, y es enumerable.

Y una vez, no por cambio: `pnpm lint:docs`.

## 10. `scripts/docs.mjs`

Un solo archivo, sin dependencias, con dos subcomandos:

```
node scripts/docs.mjs          # check (acción por defecto)
node scripts/docs.mjs check
node scripts/docs.mjs toc --write
```

En `package.json`: `"lint:docs": "node scripts/docs.mjs check"` y
`"docs:toc": "node scripts/docs.mjs toc --write"`. Sin parser, sin flags, sin
`--json`: cada uno es superficie de mantenimiento sin llamador hoy. Códigos de
salida: `0` limpio (también `--help`), `1` hallazgos, `2` uso incorrecto. El
`--help` son cinco líneas y describe la herramienta, nunca la política; la
política vive en `docs/README.md` y `AGENTS.md`.

C1-C3 en modo aviso durante la migración y bloqueantes al terminar (en el gate,
porque este repo no tiene CI). C4 es siempre aviso: nunca bloquea.

| # | Check | Qué mira |
|---|---|---|
| C1 | mapa coherente | Todo doc VIVO es alcanzable desde `docs/README.md` en un salto: enlazado directo o a través del índice de su área. Todo enlace relativo del mapa resuelve; aviso si aparece un `.md` en un área sin clasificar |
| C2 | TOC | En docs de más de 120 líneas, el bloque `toc:start`/`toc:end` existe y coincide con los H2 reales |
| C3 | nombres muertos | Ningún doc de `docs/design/` VIVO contiene un token de `DEAD.md`, salvo `DEAD.md` y `archive/` |
| C4 | presupuesto | Aviso si un doc VIVO pasa de 300 líneas |

C4 es aviso a propósito: hay docs legítimamente largos (una tabla de tokens) y
no quiero una excepción por archivo.

Decisiones de implementación que no son obvias:

- **Parser de headings fence-aware**: ignora las líneas `##` dentro de bloques
  ``` o ~~~. Es el fallo más común de un generador de TOC.
- **Slug compatible con GitHub**: minúsculas, sin puntuación, espacios a
  guiones, y sufijo `-1`, `-2` en headings duplicados por orden de aparición.
- **EOL preservado**: detecta `\r\n` y escribe con el mismo; nunca normaliza el
  archivo entero (evita un diff de 700 líneas por un cambio de retorno).
- **C3 con límites de palabra**, para que `FadeIn` no dispare dentro de
  `FadeInStagger` (que es token propio). Exención por archivo
  `<!-- docs-lint: allow-tokens ... -->`, y el resumen informa cuántas hay.
- **El TOC solo se inserta si falta**, justo después del H1. Nunca reordena
  prosa ni toca nada fuera del bloque delimitado.

Hoy este repo no tiene CI ni hooks de git, así que el gate es un paso
obligatorio al cerrar el track (`pnpm lint:docs`, documentado en `AGENTS.md`),
no una barrera automática. Si algún día se quiere bloqueante, un workflow que
corra `pnpm lint:docs` son quince líneas; el script no cambia.

## 11. Reglas para `AGENTS.md`

Texto propuesto, para reemplazar el párrafo actual de docs de diseño:

```
- docs/README.md es el punto de entrada: si una pregunta no está ahí, añadirla.
- docs/design/** es VIVO (salvo archive/, congelado): debe ser verdad hoy. rfcs
  e issues son historia fechada.
- Antes de cerrar cualquier cambio, fix de una línea o work unit, responde: ¿qué
  doc VIVO afirma algo sobre esto? Si ninguna frase se vuelve falsa, escribe
  `Docs: none - <motivo>` en el commit. Si cambia un valor, nombre, orden o
  comportamiento, edita esa frase en el doc dueño, en el mismo commit.
- Docs dueños (tras la partición de la sección 6):

  | Si tocas... | Doc |
  |---|---|
  | shell, ritmo, geometría, cue de llegada | docs/design/sections.md |
  | gates de media, reveal, aurora | docs/design/motion.md |
  | tema, dark mode, scroll, debug overlay, gotchas | docs/design/platform.md |
  | color, spacing, radio, sombra, z-index | docs/design/tokens.md |
  | familias, escala, tracking, OpenType | typography-families.md |
  | botones, gestos de puntero | buttons.md, pointer-gestures.md |
  | proceso y checklist de iteración | iteration-guide.md |

- Al cerrar un track, antes del push: las tres preguntas del gate, los borrados
  del diff y `pnpm lint:docs`.
- Al retirar un símbolo o técnica, añade su fila a docs/design/DEAD.md en el
  mismo work unit.
- Un doc VIVO de más de 250 líneas es dos docs.
```

## 12. Migración

Una rama, cuatro commits:

1. `scripts/docs.mjs` (C1 y C2 en aviso, con su `--help`), el TOC en los seis
   docs grandes del canon (los de más de 120 líneas) y los dos alias de
   `package.json`.
2. Partición de `components.md`, actualización de las referencias con grep y
   `docs/README.md` con el mapa de preguntas.
3. `DEAD.md` y C3.
4. `AGENTS.md` con la regla por afirmación, la tabla de docs dueños y el gate de
   cierre; `docs/README.md` con la guía de uso (sección 15); C1-C3 bloqueantes
   (hoy no hay CI en este repo).

Presupuesto: una tarde. La partición es la mitad del trabajo.

## 13. Alternativas descartadas

- **El flujo completo (SSOT con ancla por doc)**: es correcto, pero para
  proyectos con decenas de docs y varios colaboradores. Aquí sobra; el RFC
  hermano de `funky-ai` lo documenta.
- **Un solo archivo de canon**: 2.000 líneas; peor que el problema.
- **Frontmatter YAML para el estado**: invisible al leer y exige parser, a
  cambio de nada que la carpeta no dé.
- **Auditoría semántica automatizada**: no existe. El gate de cierre lo hace el
  agente sobre el diff.

## 14. Criterios de aceptación

- Cualquier pregunta de trabajo se responde desde el mapa sin abrir un archivo
  de más de 250 líneas.
- Un doc VIVO no puede citar un nombre muerto sin que falle el gate (C3).
- El TOC no puede desincronizarse (C2).
- Ningún doc vivo queda fuera del mapa (C1).
- El canon no pierde contenido: la partición es movimiento, no resumen.
- Un fix de 1 a 5 líneas cuesta cero requests de docs o dos (leer y editar),
  nunca una cadena de lecturas para decidir.
- Toda decisión documental queda registrada: en el cuerpo del commit o en la
  tarea ODD. Una decisión sin rastro es la que se pierde.

## 15. Guía de uso (tres anclas y el reparto)

No hay manual aparte: el sistema se explica donde se usa. Si alguna de estas
tres piezas crece, es que el sistema creció de más.

**`docs/README.md`**, al principio:

```
## Cómo se mantiene
- Esto es VIVO: debe ser verdad hoy. rfcs/ e issues son historia fechada y no se editan.
- Si buscas algo y no está en el mapa, añade la fila. El mapa es el índice, no un adorno.
- Un doc de más de 250 líneas son dos docs.
- pnpm lint:docs antes de cerrar un track; pnpm docs:toc regenera los índices.

| Qué sabes | Dónde va |
|---|---|
| Cómo funciona esta función | el código |
| Por qué esto parece raro | un comentario junto a esa línea |
| Qué valor, orden o gate es contrato | el doc del tema |
| Por qué elegimos A y no B | RFC o nota de decisión |
| Cómo se repite un proceso | iteration-guide.md |

Si un recién llegado puede deducirlo leyendo el archivo que toca, no es doc. Un
doc se paga al mantenerlo, no al escribirlo: documentar lo obvio es deuda.
```

**`AGENTS.md`**: los bullets y la tabla de docs dueños de la sección 11. Es el
contrato del agente; si no está ahí, no se lee.

**`--help` del script**: cinco líneas con uso, subcomandos y códigos de salida.
Describe la herramienta, nunca la política: un help que repite política se
pudre igual que un doc, pero sin índice ni gate que lo mire.

La regla que sustituye a "¿esto requiere docs?": **mira la afirmación, no el
tipo de archivo.** ¿Puedes señalar la frase de un doc VIVO que se vuelve falsa?
Si no, `Docs: none - <motivo>` en el commit y cero requests. Si sí, editas esa
frase en el doc dueño. `pnpm lint:docs` no decide esto: solo comprueba lo que
nadie puede olvidar (mapa, TOC, nombres muertos), una vez al cerrar.

## 16. Fuera de alcance

- Reescribir el contenido del canon: solo moverlo y partirlo.
- Cambiar la taxonomía de carpetas.
- El flujo de proyectos grandes, que es el otro RFC.
