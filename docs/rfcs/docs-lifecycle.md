# RFC: Ciclo de vida de la documentación — estado declarado, verificación mecánica y gate de cierre

> **STATUS: PROPUESTO (borrador, sin decisiones cerradas).** Nace de la
> auditoría de docs previa al merge del track `css-first-reveal` (2026-10-19),
> que encontró tres documentos afirmando como vigente algo que ya no existía. El
> problema no es la cantidad de documentación ni su taxonomía (canon / RFC /
> issues / ODD): es que nada verifica que los documentos vivos sigan diciendo la
> verdad.
>
> **Estado del archivo: VIVO** mientras está abierto; pasa a DECISIÓN al
> aprobarse (sección 3, regla R1 aplicada a sí misma).
>
> Las correcciones puntuales de ese caso ya están hechas en la rama del track
> (`3a5ef9b`, `3e99920`, `1e438eb`, pendientes de merge). Este RFC no corrige el
> caso: propone lo que evita que vuelva a pasar.
>
> Alcance: convenciones, un script determinista y un gate de cierre. Fuera de
> alcance: reescribir el canon, cambiar la taxonomía, y cualquier automatización
> que decida por sí sola qué docs actualizar.

---

## 1. Por qué existe este RFC

Tres casos reales, todos del mismo patrón: un doc declara el presente cuando su
tema ya murió.

| Documento | Afirmaba | Realidad |
|---|---|---|
| `docs/design/components.md` (3, 4.4, 8, 10, 11), `tokens.md`, `iteration-guide.md` y el índice del canon | El featured es un pin de GSAP gobernado por `FEATURED_STACK_GATE`, con `PIN_MEDIA` en el ScrollRestorer y watchdog del pin-spacer | Nada de eso existe desde el rediseño del featured: `lib/breakpoints.ts` lo conserva como stub `@deprecated` con 0 consumidores |
| `odd/tasks/featured-animation-redesign.md`, `odd/tasks/design-system.md` | `FadeIn`/`FadeInStagger`/`FadeInItem` se conservan y envuelven los paneles | Los tres se borraron con `components/motion-primitives.tsx` (2026-10-19) |
| `docs/issues/reduced-motion.md`, `docs/issues/a11y-and-performance.md` | El riesgo G1 nace de 12 estilos inline `opacity:0`/`visibility:hidden` | Esos estilos se eliminaron; hoy la primera capa es el gate de reveal |

Ninguno se detecta con un grep del nombre del track, ni con memoria. Y ninguno
rompió nada: **el daño de un doc desactualizado es silencioso** hasta que alguien
lee la mentira y decide en base a ella. El caso peor no es la confusión: es
reintroducir una técnica retirada porque el canon la describe como viva.

El motivo de fondo no es falta de disciplina. Es que **no hay bucle de
retroalimentación**: un test que falla se arregla; un doc que miente se queda ahí,
porque no hay nada que falle.

## 2. Diagnóstico: vidas mezcladas en el mismo archivo

Un documento solo puede tener una de estas vidas, y cada una pide un trato
distinto:

| Vida | Qué afirma | Se actualiza | Ejemplos hoy |
|---|---|---|---|
| VIVO | el presente | en cada work unit | `docs/design/**` (canon), `AGENTS.md` |
| DECISIÓN | el porqué de una decisión fechada | se congela al cerrar; se supera con otro, nunca se edita | `docs/rfcs/**` |
| TRABAJO | el plan y el registro de ejecución | cierra al mergear; después es historia | `odd/tasks/**` |
| INSTANTÁNEA | lo que se midió o auditó tal día | nunca finge ser actual | `docs/issues/**` |

La deuda aparece cuando dos vidas conviven. `reduced-motion.md` es el caso de
manual: contiene a la vez una decisión (congelada), un plan (trabajo) y un riesgo
vigente (canon), y se pudrió exactamente en el cruce. Cada mitad pide una
respuesta distinta a "¿esto sigue siendo verdad?".

**Consecuencia operativa:** mientras un archivo no declare qué vida tiene, nadie
—persona o agente— puede saber si está desactualizado o simplemente es viejo. Esa
incertidumbre es la que convierte la revisión de docs en trabajo infinito.

## 3. Vocabulario: el estado se declara en la primera línea

Formato propuesto (ya es el de facto en el repo, p. ej. `CERRADO (2026-10-02)`):

```markdown
# Título

> **Estado: VIVO** - actualizado 2026-10-19
```

Valores válidos: `VIVO`, `DECISIÓN`, `TRABAJO`, `INSTANTÁNEA`, `CERRADO` y
`CONGELADO` (lo que no se edita nunca: `docs/design/archive/**`). Un archivo sin
estado es un defecto, no un olvido: no se puede evaluar.

Preguntas abiertas:

- **Blockquote o frontmatter YAML?** Recomendación: blockquote. Es visible al
  leer, greppable y no exige parser. El frontmatter solo si algún día hace falta
  metadato consultable.
- **Se permite más de un estado por archivo?** Recomendación: no. Si necesitas
  dos vidas, son dos archivos. Es la lección de `reduced-motion.md`.
- **Se renombran los marcadores existentes?** Recomendación: sí, a la forma
  uniforme, durante la migración (sección 7).

## 4. Las cinco reglas

Ordenadas por valor/coste.

- **R1 - Todo doc declara su estado.** Un minuto por archivo, y habilita todo lo
  demás. Sin esto, cualquier verificación automática es adivinación.
- **R2 - Ningún doc VIVO contiene referencias de línea ni conteos.** Se escribe
  el nombre del símbolo (`handleBack` en `project-detail.tsx`), no
  `project-detail.tsx:697-772`. Los números fueron el 100% de las referencias
  rotas de la auditoría, y no rompen nada al caducar.
- **R3 - Registro de nombres muertos.** Tabla única de símbolos y técnicas
  retiradas, con su sustituto y el doc que las gobierna hoy (sección 6). Es el
  artefacto que habría cazado el caso del pin: no se encuentra con memoria ni con
  grep del track, se encuentra con una lista de cosas muertas.
- **R4 - El índice se deriva de los estados, no se mantiene a mano.** El índice
  del canon ya apuntó a un gate retirado: un índice a mano solo es correcto el día
  que se escribió. Si estado y tema son declarativos, la coherencia
  índice <-> archivos se verifica.
- **R5 - El gate está al CERRAR el track, no solo por work unit.** La regla
  actual (sincronizar el tema del canon al aprobar una work unit) es correcta y se
  mantiene, pero el fallo del pin ocurrió en el cierre: el track terminó y el
  canon nunca se enteró. Tres preguntas antes del push final:
  1. ¿Qué sección del canon describe el comportamiento que acabo de cambiar, y
     qué dice ahora?
  2. ¿Qué símbolo o técnica eliminé, y quién lo menciona?
  3. ¿Qué cifra o referencia de este diff caduca mañana?

## 5. Verificación mecánica: `scripts/docs-lint.mjs`

Cinco checks deterministas, sin tokens y sin juicio. Salida
`archivo:linea: motivo`, exit 1 si hay hallazgos.

| # | Check | Qué mira |
|---|---|---|
| C1 | estado presente | Todo `.md` de `docs/` y `odd/` (excepto `docs/design/archive/**`) declara un estado válido en las primeras líneas |
| C2 | nombres muertos | Ningún doc con estado VIVO contiene un token del registro (sección 6) |
| C3 | referencias frágiles | Ningún doc VIVO contiene `\.(ts\|tsx\|css\|mjs):\d+` ni "linea N" |
| C4 | índice coherente | Los `.md` de `docs/design/` y el listado del índice coinciden en ambos sentidos; todo enlace relativo resuelve |
| C5 | instantánea fechada | Todo doc INSTANTÁNEA lleva fecha, y todo CERRADO lleva su fecha de cierre |

Decisiones que C3 obliga a tomar:

- Las referencias a líneas de **terceros** (`lenis.mjs:649-655` en el canon de
  scroll) son evidencia legítima, pero caducan con cada actualización de
  dependencia. Propuesta: directiva inline `<!-- docs-lint: allow-line-ref -->`
  con motivo, en lugar de una lista blanca externa.
- Excluir `docs/design/ejemplos/**` y `archive/**`: son material de referencia,
  no contrato.

Integración: `pnpm lint:docs` y CI. Durante la migración (sección 7) entra en
modo reporte (avisa, no bloquea); al terminar, bloqueante. Un script no negocia, y
esa es su virtud: lo que no rompe el build, se olvida.

## 6. Registro de nombres muertos

`docs/design/DEAD.md`, una tabla de una página:

| Símbolo retirado | Retirado el | Sustituto | Doc que lo gobierna |
|---|---|---|---|
| `FadeIn`, `FadeInStagger`, `FadeInItem`, `motion-primitives.tsx` | 2026-10-19 | `Reveal` | `components.md` 5 |
| `FEATURED_STACK_GATE`, `PIN_MEDIA` | 2026-10 | one-slide rule | `components.md` 4.4 |
| `next-themes`, `ThemeProvider` | 2026-10-19 | `class="dark"` en el layout | `components.md` 7 |
| pin de GSAP del featured | 2026-10 | one-slide rule | `components.md` 4.4 |

Reglas del registro:

- La fila se añade **en el mismo work unit que retira la técnica**: es parte del
  cambio, no una tarea aparte.
- C2 solo lo aplica a docs VIVO. Un doc DECISIÓN, TRABAJO o INSTANTÁNEA puede
  citar nombres muertos: es un registro de su momento, y eso es correcto.
- Es la respuesta sin ambigüedad a "¿quién menciona esto?".

## 7. Migración

Un solo PR:

1. Añadir `DEAD.md` con las cuatro entradas de la sección 6.
2. Añadir `scripts/docs-lint.mjs` y correrlo en modo reporte: esa lista es el
   inventario real de docs sin estado (no hace falta adivinarlo).
3. Sellar estados (mecánico): canon -> VIVO; `docs/rfcs/**` -> DECISIÓN;
   `odd/tasks/**` -> TRABAJO (o CERRADO si ya cerraron); `docs/issues/**` ->
   INSTANTÁNEA o CERRADO con fecha; `archive/**` -> CONGELADO. Uniformar los
   marcadores que ya existen a la forma de la sección 3.
4. Arreglar las referencias frágiles de los docs VIVO (pocas: canon de scroll y
   algún issue) con directiva inline cuando la referencia sea evidencia
   necesaria.
5. Activar el check en CI como bloqueante.
6. Llevar las tres preguntas del gate (R5) a la plantilla ODD y a `AGENTS.md`.

Presupuesto: una o dos horas, la mitad mecánica. Aquí hay que resistir la
tentación de convertirlo en un proyecto: el valor está en las reglas, no en el
tamaño del script.

## 8. Reparto: qué automatiza el script y qué decide un agente

| Trabajo | Quién | Por qué |
|---|---|---|
| Saber si un doc VIVO menciona algo muerto, no declara estado, o referencia líneas | script | determinista, gratis, y puede fallar el build |
| Decidir qué sección del canon describe lo que acabo de cambiar, y si sigue siendo verdad | agente o skill, post-track, acotado al diff | juicio semántico sobre trabajo recién hecho; nadie más lo tiene en la cabeza |

Contrato del skill (a contrastar cuando se revise funky-ai): **entrada** = el diff
del track; **salida** = lista cerrada de secciones del canon a revisar, con
veredicto por sección; **prohibido** = auditar el repo entero. Un skill que revisa
todo no escala, gasta tokens y produce hallazgos que nadie cierra.

## 9. Alternativas consideradas y descartadas

- **Skill que audita las docs en cada feature.** No es determinista, no puede
  fallar el build y no crea bucle de retroalimentación. Se queda con la parte
  semántica (sección 8).
- **Migración manual de los ~30 docs.** Lenta y con criterio inconsistente entre
  archivos; el inventario lo produce el script.
- **Frontmatter YAML en todos.** Metadato invisible al leer y parser obligatorio,
  a cambio de nada que el blockquote no dé hoy.
- **Un índice central mantenido a mano.** Es la causa del puntero roto del canon;
  si el índice se deriva, no puede mentir.
- **Dejar issues abiertos como contenedores de trabajo.**
  `all-projects-entry-jank.md` 6 tiene tres vidas dentro (diagnóstico, medición
  pendiente, conclusión superada). Un issue que no cierra es un doc zombi: la
  decisión se muda al canon y lo pendiente va a ODD.

## 10. Riesgos

- **Ceremonia por ceremonia:** sellar estados sin que el linter corra aporta poco.
  Van juntos o no van.
- **Falsos positivos en C2:** un doc VIVO puede citar legítimamente una técnica
  retirada para explicar historia. Se resuelve moviendo la historia a un doc
  DECISIÓN o con directiva inline; nunca relajando el check.
- **Conocimiento con un solo dueño:** las cinco reglas viven en este RFC; si
  `AGENTS.md` no las enlaza, se olvidan. `AGENTS.md` es el contrato, este RFC el
  porqué.

## 11. Criterios de aceptación

- Un doc que miente falla CI (C2), y un doc sin estado también (C1).
- El índice del canon no puede desincronizarse sin que CI lo note (C4).
- La fila del registro de nombres muertos se añade dentro del mismo work unit que
  retira la técnica.
- El gate de cierre aparece en la plantilla ODD y en `AGENTS.md`, con las tres
  preguntas.
- Nada de esta propuesta cambia el canon vigente: es convención y verificación,
  no rediseño.

## 12. Fuera de alcance

- Reescribir el canon o renombrar carpetas.
- Un skill nuevo: se revisa aparte, con funky-ai como referencia de patrones a
  copiar y a evitar.
- Verificar que el contenido del canon sea *correcto*: eso sigue siendo revisión
  humana.
