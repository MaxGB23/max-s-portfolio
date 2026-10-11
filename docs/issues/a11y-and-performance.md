# Accesibilidad y rendimiento — auditoría

> **CERRADO (2026-10-02). No es una lista de trabajo activa.**
> Lo implementado está en "Qué se hizo" (abajo) con su commit; lo cerrado sin
> hacer, con su motivo, en "Cerrado sin hacer". Ningún punto de este documento
> está pendiente de ejecución. Se conserva como registro de qué se consideró y
> por qué se descartó — el razonamiento es lo valioso, no la lista.
>
> **Objetivo que mandaba: solo lo mínimo necesario.** Si una corrección no
> aportaba valor visible o no era un defecto real, no se hizo. Evitar
> sobreingeniería.
>
> Contexto: el sitio está desplegado en Vercel y funciona en móvil y desktop. El
> diseño visual está aprobado, así que nada que altere el render entró en
> alcance sin comparación visual previa.
>
> Método: lectura de código y `grep`/`glob`. Sin medición en runtime (sin
> Lighthouse, sin axe, sin profiling). *[por verificar]* = necesita confirmación
> con herramienta o en dispositivo real.

---

## 1. Accesibilidad

| # | Hallazgo | Ubicación | Acción | Esfuerzo |
|---|---|---|---|---|
| A1 | No hay skip-link al contenido | `app/layout.tsx` | Skip-link visible al enfocar. **Depende de S1** | Bajo |
| A2 | El emoji 🖐 se declara decorativo (`aria-hidden`) y a la vez imagen con etiqueta (`role="img"` + `aria-label`). Una de las dos sobra | `hero-section.tsx:170-187` | Dejar una sola intención | Bajo |
| A3 | El switcher Métricas/Topología no usa semántica de tabs: sin `role="tablist"`, `role="tab"`, `aria-selected` | `project-detail.tsx:491-515` | Patrón ARIA de tabs | Medio |
| A4 | El lightbox declara `role="dialog"` + `aria-modal` pero no atrapa el foco | `project-detail.tsx:697-772` | Focus trap | Medio |

### Decisiones ya tomadas (no son hallazgos)

- **Reduced motion: no se implementa, a propósito.** Registrado como decisión del
  owner, con auditoría técnica y plan de remediación, en
  `docs/issues/reduced-motion.md` (2026-09-20). El motivo: las animaciones del
  sitio son entradas pequeñas (opacity/translate ≤ 20px, una sola vez), fuera del
  alcance estricto de WCAG 2.3.3.
  Ese doc además documenta el riesgo **G1**: hero y about ocultan el contenido
  dos veces (inline `opacity:0/visibility:hidden` + `gsap.set(autoAlpha:0)`), así
  que un gate a medias los dejaría invisibles para siempre.
  Restricción de implementación, registrada aparte en
  `featured-projects.tsx:66-71`: no bifurcar el render sobre `useReducedMotion()`
  —provoca `ReactHydrationError` por desajuste SSR/cliente. Eso descarta solo el
  branch de render; `gsap.matchMedia()` y `<MotionConfig reducedMotion="user">`
  corren fuera del render y no están descartados por esa regla.
  **Este documento no duplica la decisión: la fuente es `reduced-motion.md`.**

**No requiere trabajo:** `aria-label`/`aria-labelledby` en secciones,
`aria-current` en navbar, `role="dialog"` + Escape + scroll-lock en lightbox,
`aria-hidden` en iconos, `sr-only` en métricas, `lang` en `<html>`,
`next/font` sin CLS.

---

## 2. Separación de responsabilidades

**Criterio: solo si no cambia el comportamiento actual.** La operación es un
*move* de código — el JSX y los hooks se trasladan tal cual, sin reescribir
lógica ni tocar clases. Por construcción no altera el render; el riesgo real
es humano (olvidar un import, duplicar un estado), no visual.

### 2.1 `project-detail.tsx` — 776 líneas (el peor caso)

Verificado: mezcla **6 responsabilidades**.

| Responsabilidad | Líneas aprox. |
|---|---|
| Utilidades de render (`linkIcon`, `renderInline`, `metricParts`) | ~90 |
| Componentes presentacionales (`SectionTitle`, `StackChips`, `AnimatedMetric`, `KpiGrid`) | ~125 |
| Orquestación de animaciones GSAP/ScrollTrigger | ~90 |
| Estado del lightbox (swipe, teclado, scroll-lock, hit-test) | ~180 |
| Navegación con detección de origen del scroll | ~13 |
| Composición de la página | ~270 |

División propuesta si algún día molesta:

```
components/project-detail/
  project-detail.tsx          # composición pura, ~300
  project-detail-lightbox.tsx # estado + swipe + teclado, ~180
  project-detail-kpis.tsx     # KpiGrid + AnimatedMetric, ~100
  project-detail-header.tsx   # botón back + hero + chips, ~120
```

Al extraer, `KpiGrid` debe moverse con su ciclo de vida propio: el comment en
`project-detail.tsx:117-159` explica por qué no puede vivir en el efecto único
del detail.

### 2.2 Otros archivos

- `navbar.tsx` — 348 líneas: scroll-spy + auto-hide + menú móvil + intercepción
  de anchors, todo en un componente. Aceptable mientras no crezca más.
- `hero-section.tsx` — 246 líneas: timeline GSAP + montar WebGL + `MutationObserver`
  de tema + medición de título. Aceptable.
- `data/projects.ts` — 61 KB. Aceptable como fuente única, pero crece sin cota.

---

## 3. Posibles problemas de rendimiento

*Ninguno confirmado con perfil. Son riesgos con evidencia de código.*

**Restricción del proyecto: el diseño visual está aprobado.** La columna
"Riesgo visual" indica si la corrección puede alterar lo que se ve hoy.

| # | Hallazgo | Ubicación | Acción | Riesgo visual |
|---|---|---|---|---|
| P1 | `Aurora` corría un bucle WebGL con `requestAnimationFrame` que nunca se pausaba | `Aurora.jsx` (pausa offscreen + prop `frozen`) | **Hecho**: se pausa con `IntersectionObserver` (`threshold: 0`) al salir el hero y se reanuda al entrar; reanudar es barato (contexto/shaders siguen montados), el salto de `uTime` es cosmético | — |
| P5 | `images.unoptimized: true` **desactiva la optimización de imágenes**. El componente sigue dando layout y `priority`, pero se pierde el re-dimensionado, la re-codificación y — lo más importante aquí — **el prop `sizes` deja de hacer nada**, así que una pantalla de 390px descarga la captura de 2560px. El trabajo de `sizes` ya escrito en `hero-section`, `featured-project-panel` y la galería está anulado | `next.config.mjs:6-8` | Quitar el flag | **Este sí.** El contenido es el mismo pero la imagen re-codificada y dimensionada puede diferir sutilmente del original. Exige comparación visual lado a lado |
| P2 | Cuatro consumidores del scroll: Lenis, navbar, `featured-projects`, `ScrollTrigger` de los botones back | ver los 4 archivos | **No hacer.** Consolidar cambiaría el orden en que los tres reaccionan al mismo scroll, y ese orden es comportamiento visible | Alto |
| P3 | `featured-projects` lee `getBoundingClientRect()` en todos los paneles por frame | `featured-projects.tsx:89-112` | **No hacer.** Ver la corrección de abajo: el coste real es despreciable | — |
| P4 | Code-splitting inconsistente: `scroll-progress.tsx:16-17` usa `await import("gsap")`, `project-detail.tsx:14-15` importa GSAP estático | ambos | **No hacer.** La dirección correcta (cargar GSAP con `dynamic`) retrasaría las animaciones de entrada → flash visible. La inconsistencia es inocua | Alto |
| P6 | Cuatro sistemas de animación conviviendo: Lenis (RAF), GSAP+ScrollTrigger, Framer Motion, y transiciones CSS | global | **No hacer.** No aporta nada perceptible y el riesgo de regresión visual es alto | Alto |

**P1 — resuelto (decisión del owner revertida tras QA en gama baja).** El bucle
ahora se pausa con `IntersectionObserver` (`threshold: 0`) cuando el hero sale
del viewport y se reanuda al entrar: el contexto y los shaders siguen montados,
así que reanudar no recompila nada. El `uTime` (reloj de pared) salta por la
ausencia — cosmético. Prop `frozen` conservada (un solo frame, sin loop) pero
sin uso. Sin parpadeo observado: el hero mide 85dvh, el estado queda fijo fuera
de él.

**Corrección de un análisis previo (P3):** lo presenté como una lectura de
layout forzada por frame. Medido en frío, no lo es: todas las lecturas van
seguidas sin escrituras intercaladas, así que hay un solo layout por frame, y
el guard `unchanged` de `setSlide` evita el re-render cuando nada cambió. Diez
lecturas de `top` cuestan microsegundos. Además afirmé que
`IntersectionObserver` expresaba la misma regla; tampoco es cierto. La lógica
actual compara paneles consecutivos (`top_i <= line && top_{i+1} > line`) — es
una máquina de estados disparada por *nivel*, e `IntersectionObserver` entrega
eventos por *borde*. Convertir una en la otra exigiría seguir leyendo los rects
del resto de paneles. Es optimización prematura sobre la animación de este
worktree: no hacerla.

**Corrección de un análisis previo (Lenis):** se afirmó que GSAP ScrollTrigger
funcionaba sin sincronizar con Lenis. Es falso: la sincronización existe en
`smooth-scroll.tsx:31` (`lenis.on("scroll", ScrollTrigger.update)`), más el
bucle RAF en 34-39 y `lagSmoothing(0)` en 42. Punto descartado, no actuar.

**Imágenes:** bien. `priority` está donde debe (`hero-section.tsx:163` para el
LCP, `project-detail.tsx:542` para la portada) y los tres paneles de Featured
usan `priority` (antes solo el primero: fix del tirón card 3→card 2 al volver
a la sección tras visitar otras).

---

## Nota: semántica HTML

**No vale la pena una pasada dedicada.** La jerarquía de encabezados es
consistente (`h2` de sección → `h3` de tarjeta en las tres rejillas), hay un
solo `h1` por página, `<article>` en las tarjetas, `<dl>` en las métricas. Tres
casos sí importan:

- **S1 — bloqueante de A1.** `<main>` abre en `app/page.tsx:15` y no cierra
  hasta la 42: contiene `<Navbar>` y `<Footer>`. Los landmarks `banner` y
  `contentinfo` quedan dentro de `main`, estructura inválida. Y en consecuencia,
  un skip-link apuntando a `<main>` no ahorra nada. Crear un
  contenedor interno y sacar navbar/footer fuera de `main`.
- **S2** — `featured-project-panel.tsx:75` usa `h2` para el título de cada
  panel, hermano del `h2` de la sección (`featured-projects.tsx:35`). Debería
  ser `h3`, como ya se hace en las otras tres rejillas. Una línea.
- **S3** — Tres landmarks `nav` en home, y `footer.tsx:48` tiene
  `aria-label="Social media links"` fijo en inglés, sin pasar por `t()`.

No tocar: `PageSpacing`/`SectionSpacing` usan `div` vacíos como espaciado, pero
el ritmo visual es un contrato documentado en `lib/rhythm`.

---

## Más adelante: SEO (no es urgente ahora)

Solo dos cosas, y solo si aparece la necesidad:

1. **Metadata + OpenGraph + título consistente** (~media hora). Es lo único que
   se ve de forma inmediata: al compartir el link en LinkedIn o en una
   postulación, hoy sale una URL desnuda. `layout.tsx:26-30` tiene un `title`
   genérico y los detalles usan `"| MaxGB23"`.
2. **El idioma está en una cookie** (`layout.tsx:36-43`), no en la URL. ES y EN
   compiten por la misma dirección, así que no hay forma de indexar las dos
   versiones, ni `hreflang`. Además, leer `cookies()` en el layout raíz hace que
   la ruta dependa de la petición. Arreglarlo toca layout, contexto y todos los
   anchors: barato hoy, caro dentro de un año.

No hacer ahora: `sitemap.xml` y `robots.txt` para 10 páginas, y JSON-LD. Son
inútiles sin tráfico.

---

## Qué se hizo

Contexto: el sitio ya funciona en Vercel, en móvil y desktop, y el diseño está
aprobado. Criterio de selección: **cambio pequeño + beneficio real**. Lo que no
aportaba a la meta de búsqueda de empleo no se tocó.

Work units completos, cada uno commiteado (ver `odd/tasks/a11y-roles-and-keyboard.md`):

| # | Acción | Riesgo visual | Commit |
|---|---|---|---|
| **A2** | Emoji 🖐: una decisión de atributo | Ninguno | `6cedb2e` |
| **S2** | `featured-project-panel.tsx:75` `h2` → `h3` | Ninguno | `3f8191b` |
| **S3** | `aria-label` del footer fijo en inglés | Ninguno | `9086820` |
| **A3** | Roles de tab + flechas en el switcher | Ninguno | `50e8b30` |
| **A4** | Focus trap + retorno de foco en el lightbox | Ninguno | `899783c` |
| *(extra)* | Flechas ←/→ en el lightbox (WU4b) | Ninguno | `a5c675d` |
| *(extra)* | `z-10` + breakpoint `nav` (WU4c) | Ninguno | `70c6275` |
| *(extra)* | Contraste en capturas claras (WU4d) | Ninguno | `22418f2` |

Los "extra" no estaban en la auditoría original: los destapó el testing manual
con teclado. Ver la tabla de defectos en el feature doc.

## Cerrado sin hacer — decisión del owner (2026-10-02)

Nada de esto se va a tocar. Se deja registrado el **por qué** para que no se
vuelva a proponer ni se re-audite desde cero.

| # | Ítem | Por qué se cierra |
|---|---|---|
| **S1 + A1** | Reestructurar `<main>` + skip-link | Único punto con riesgo visual real: el navbar hereda `text-foreground` de `<main>`. No vale el riesgo contra el diseño aprobado |
| **2.1** | Dividir `project-detail.tsx` (776 líneas) | Riesgo de regresión silenciosa — `gsap.context` resuelve los selectores por jerarquía DOM, no por árbol de React, así que un componente fuera del `rootRef` deja de animarse sin error. Cero valor para quien ve el sitio |
| **P5** | Quitar `images.unoptimized` | Se mantiene la optimización apagada a propósito. Costo real: un móvil descarga la captura a resolución completa. Aceptado |
| **Reduced motion** | — | Decisión ya auditada en `docs/issues/reduced-motion.md`. No es un hallazgo |
| **SEO** | Metadata + OpenGraph; idioma en URL | Ver "Más adelante" arriba. No urgente: el link se comparte directo, no se busca |
| **P1** | Pausar el bucle de Aurora | **Hecho** (pausa offscreen con reanudación barata; ver sección 3) |
| **P2, P3, P4, P6** | Consolidar scroll, IntersectionObserver, code-splitting, unificar motores de animación | Tacan o arriesgan el comportamiento visual aprobado; P2/P3/P4 sin beneficio demostrable. Correcciones registradas en la sección 3 |
| **Lint** | Instalar ESLint | Fuera del alcance original de esta auditoría (a11y / archivos / rendimiento). Ver nota abajo |

## Nota: no hay lint en el repo — resuelto

**Estado original:** `package.json` declaraba `"lint": "eslint ."`, pero eslint
no estaba en `devDependencies`, no había configuración y no estaba instalado.
`pnpm lint` fallaba con "no se reconoce el comando". El script nunca corrió en
este checkout; era una deuda preexistente.

**Resuelto (mismo commit que `ignoreBuildErrors`):** el script se eliminó y el
chequeo de tipos pasó a tener nombre propio — `pnpm typecheck` (`tsc --noEmit`).

**Sobre `typescript.ignoreBuildErrors`:** estaba en `next.config.mjs` como `true`,
lo que hacía que el build de producción imprimiera "Skipping validation of types"
y dejara pasar errores de tipo a producción en silencio. Se quitó, el build pasó
a reportar "Running TypeScript ..." y terminó limpio: **no había errores ocultos**,
el flag era peso muerto.

Nota: no se instaló ESLint. Es decisión de tooling, no de esta auditoría, y
`tsc` alcanza para el trabajo actual. Si algún día se quiere un linter real, se
instala con su config y su propio script.