# RFC: Reveal CSS-first — entradas fuera de framer-motion + contenido visible sin JS

> **STATUS: APROBADO e IMPLEMENTADO (revisión 2) en la rama
> `feat/css-first-reveal`.** Sin merge hasta la validación en vivo del usuario
> (pase visual desktop y mobile, con y sin JS). No se afirma mejora de
> rendimiento hasta que exista la pasada de perfil de §8.
>
> Revisión 2 corrige cuatro errores de la revisión 1: la premisa sobre
> crawlers/LLMs (§1), el alcance real de AllProjects (§3.2), la ubicación de la
> red de seguridad (§4.1) y el alcance de las work units (§5). Sustituye la
> conclusión de `docs/issues/all-projects-entry-jank.md` §6, que descartó la vía
> "solo-CSS" con un argumento que solo cubría la mitad del cambio.
>
> Durante la implementación hubo tres desvíos respecto a lo aprobado; están
> registrados en §11 y reflejados en §4.1 y §5.

---

## 1. Por qué existe este RFC

Dos motivaciones independientes. La primera es la que decide; la segunda es un
experimento que se mide, no se promete.

**Motivación A — robustez: sin JS la home se ve vacía (media).**
Si el JavaScript no se ejecuta, la home no muestra su contenido: navbar, hero,
about, featured, all-projects y footer salen con `opacity: 0` horneado en el
HTML. Un usuario con un bloqueador agresivo, un proxy corporativo o una red que
corta el bundle ve una página vacía. Es un fallo mudo.

**Corrección a la revisión 1.** Se afirmó que los agentes LLM y los crawlers "no
ven el contenido". **Es falso en lo que importa.** El texto viaja en el HTML
crudo dentro del propio `<div style="opacity:0">`: un fetcher, un extractor o un
crawler que parsea HTML lo lee sin ejecutar nada. Lo que falla sin JS es el
**render visual**, no la presencia textual.

Lo que sí es un fallo real, además de lo visual:

- `opacity: 0` **no** saca contenido del árbol de accesibilidad.
- `visibility: hidden` **sí** lo saca. Hero y about usan las dos propiedades
  inline (`visibility: 'hidden'` en 12 nodos, incluido el `h1`), así que sin JS
  el contenido principal queda fuera del árbol de accesibilidad.

**Motivación B — el tick de ~58 ms en AllProjects (experimento).**
Es 1 long task, ~3-4 frames, una vez por visita fría, con CLS 0 y 0 ms de
decode en el main thread. No es INP. Por sí solo no justifica nada (§9).

---

## 2. La pregunta: ¿es un caso raro desactivar JS?

Sí. Pero "JS no ejecutado" no es un solo escenario, y el texto no desaparece en
ninguno de ellos:

| Escenario | ¿Texto en el HTML? | ¿Render visual? | ¿Nos importa? |
|---|---|---|---|
| Usuario con JS desactivado | Sí | No | Poco: es una elección deliberada |
| JS falla al cargar (bloqueador, proxy, timeout) | Sí | No | **Sí**: es un fallo, no una elección |
| Crawler que solo parsea HTML | Sí | No aplica | No hay problema |
| Crawler que renderiza sin ejecutar JS | Sí (DOM) | No | Poco: los grandes ejecutan JS |
| Agente LLM que hace fetch del HTML | Sí | No aplica | No hay problema |
| Extractor CSS-aware / captura de pantalla | Sí (DOM) | No | Poco, pero molesto |

Conclusión honesta: la motivación A es **más estrecha** de lo que decía la
revisión 1. Sobrevive por dos razones concretas —una página en blanco ante un
fallo de JS y doce nodos fuera del árbol de accesibilidad— no por los
crawlers.

Sigue habiendo una inconsistencia de producto: el commit `e6efdee` ("dos
tabpanels siempre montados con ids fijos, inactivo con `hidden`") existe para
que el detalle de un proyecto sea legible por crawlers. Esa decisión ya está
tomada; esto es la misma decisión aplicada a la home.

---

## 3. Diagnóstico verificado

### 3.1 Qué sale en el HTML sin JS

Verificado renderizando los primitivos con `react-dom/server`:

```
FadeIn                 => <div style="opacity:0;transform:translateY(20px)">...</div>
motion.header (navbar) => <header style="opacity:0;transform:translateY(-24px)">
```

El contenido (`...`) **está dentro**. Eso corrige la premisa de §1.

| Componente | Nodos ocultos por el SSR | Mecanismo | ¿Fuera del árbol a11y? |
|---|---|---|---|
| `navbar.tsx` | 1 (header) | `motion.header initial` | No |
| `hero-section.tsx` | 8 | `style` inline + `gsap.set(autoAlpha:0)` | **Sí** (`visibility:hidden`) |
| `about-section.tsx` | 4 | `style` inline + `gsap.set(autoAlpha:0)` | **Sí** |
| `featured-projects.tsx` | 1 (`FadeIn`, heading) | `initial="hidden"` | No |
| `all-projects.tsx` | 2 (`FadeIn`) | `initial="hidden"` | No |
| `footer.tsx` | 2 (`FadeIn`) | `initial="hidden"` | No |
| `pricing-section.tsx` | 0 | `gsap.fromTo` (estado inicial en runtime) | No |
| `contact-section.tsx` | 0 | `gsap.fromTo` | No |

Y en **tema claro**: `forcedTheme="dark"` aplica `.dark` desde un script de
next-themes; sin JS el `<html>` no la tiene y ganan los tokens de `:root`.

### 3.2 El hueco del veredicto anterior — corregido otra vez

`docs/issues/all-projects-entry-jank.md` §6 descartó la vía solo-CSS así:

> "Un grid solo-CSS rompería el patrón de la sección sin ganancia garantizada:
> el heading seguiría en framer-motion y el loop global despertaría igual."

El argumento es correcto si solo se cambia el grid. Pero el dato de partida
también está desactualizado: **AllProjects no tiene 7 nodos en framer-motion,
tiene 2.** Tras el fix de entrada solo-opacidad hay un `FadeIn` para el heading
(`all-projects.tsx:48`) y **uno** para el grid completo (`all-projects.tsx:63`);
las cards no animan individualmente. En total: **5 nodos `FadeIn`** en tres
componentes (2 + 1 + 2) más el `motion.header` del navbar. Los paneles de
Featured ya son CSS (`opacity-0 translate-y-5` → `opacity-100`, controlados por
estado de scroll), no framer.

Eso corta el techo de la hipótesis por dos lados:

- Quitar 2 animaciones de opacidad no es quitar 7.
- El long task mide 97.9% del self time en `frameLoop`/`processFrame`, pero con
  solo 2 nodos animándose, 58 ms es demasiado para 2 interpolaciones: parte del
  coste puede ser el re-render de arranque de la animación, y parte puede no
  ser framer en absoluto.

**No está medido.** Por eso WU2 es una medición, no una promesa (§8).

---

## 4. Propuesta

### 4.1 Patrón: el contenido es visible por defecto

El estado por defecto del HTML es **visible**. El ocultamiento es una capa que
solo existe si JS arrancó correctamente. Es la inversión exacta del patrón
actual (`initial="hidden"` en el markup).

**a) Script inline de arranque** (en el `<body>`, antes de cualquier nodo de
contenido, síncrono, ~8 líneas; el porqué de `<body>` y no `<head>` está en
§11). Contiene **el gate y la red de seguridad en el mismo bloque**: si la red
viviera en el bundle, moriría justo en el fallo que debe cubrir (bundle que no
carga).

```html
<script>
  if ('IntersectionObserver' in window) {
    document.documentElement.dataset.reveal = 'on';
    setTimeout(function () {
      var pending = document.querySelectorAll('[data-reveal-item]:not([data-reveal-item="shown"])');
      for (var i = 0; i < pending.length; i++) { pending[i].dataset.revealItem = 'shown'; }
    }, 2000);
  }
</script>
```

- Corre antes del primer paint: no hay flash de visible-a-oculto.
- Una sola condición decide todo: sin IO la marca nunca se pone y la página se
  muestra completa y estática. **No hay segunda condición**: la versión
  aprobada consultaba además `prefers-reduced-motion`, y se quitó durante la
  implementación (§11).
- La red de seguridad no depende del bundle, de React ni de GSAP.

**b) CSS del gate** (`app/globals.css`):

```css
[data-reveal='on'] [data-reveal-item]:not([data-reveal-item='shown']) {
  opacity: 0;
}

[data-reveal='on'] [data-reveal-item='shown'] {
  opacity: 1;
}

.reveal-fade {
  transition: opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1);
  transition-delay: var(--reveal-delay, 0s);
}
```

La transición va en la clase `.reveal-fade` (que solo renderiza `Reveal`) y no
en el estado `shown`, porque hero y about también son items del gate y su
opacidad la escribe GSAP frame a frame: con la transición en `shown`, la red de
seguridad de 2s entraría en mitad del timeline y amortiguaría cada escritura de
GSAP (§11).

No hace falta `@media (prefers-reduced-motion)` aquí: las entradas corren
siempre, por decisión del dueño del producto (§11, y la política en
`docs/design/section-animations.md`). Una sola fuente de verdad.

**c) Atributo en el markup del servidor.** `data-reveal-item` debe renderizarse
**en el SSR**, no añadirse en un efecto. Si se añade después de hidratar, el
primer frame pinta el contenido visible, el efecto lo oculta y luego se revela:
flash visible→oculto→visible. Es el error más fácil de cometer en este cambio.

### 4.2 Primitivo `Reveal`

Nuevo archivo `components/reveal.tsx` (~50 líneas). Vive fuera de
`motion-primitives.tsx` a propósito: ese archivo es la casa de framer-motion y
no conviene mezclar dos motores en el mismo módulo.

- `IntersectionObserver` compartido (instancias por perfil de `rootMargin`, no
  una por nodo).
- Al intersectar: `el.dataset.revealItem = 'shown'`. Sin estado de React, sin
  re-render, sin loop de animación.
- Conserva la firma útil de `FadeIn` (`delay`, `delayEnter`, `earlyOnMobile`),
  para que la migración sea un reemplazo 1:1 y la coreografía no se recalibre:
  - `delayEnter` → `rootMargin: "0px 0px -15% 0px"`.
  - `earlyOnMobile` → mismo `rootMargin` en desktop y `0` en mobile, más
    `--reveal-delay: 0.15s` para mantener el orden título→grid en mobile.
- Sin framer-motion.

La duración (0.55 s) y el easing se conservan: el render final es idéntico al
actual.

### 4.3 Qué se migra

Son **5 nodos `FadeIn`** en 3 componentes (más el navbar), no una migración de
media app:

| Se migra a `Reveal` | Se queda en framer-motion |
|---|---|
| `all-projects.tsx`: heading + grid (2) | `AnimatePresence` del menú mobile (`navbar.tsx`) |
| `featured-projects.tsx`: heading (1) | Hide/show del navbar por scroll (`animate` con `y`) |
| `footer.tsx`: 2 bloques | Hover micro-interactions |
| `hero` y `about`: quitar el `style` inline de 12 nodos; el gate pasa a CSS | |
| `navbar`: `initial={false}` + keyframe CSS de entrada | |

Los paneles de Featured no se tocan: ya son CSS.

Además, `FadeInStagger`, `FadeInItem` y `FadeInItemFade` **no tienen ningún
consumidor** desde el fix de entrada solo-opacidad: se borran.

framer-motion **no se elimina del proyecto**: sigue haciendo lo que CSS no hace
bien (presencia/exit, gestos, el hide-on-scroll del navbar).

### 4.4 Tema oscuro sin flash: borrar next-themes

El tema es `forcedTheme="dark"` y no hay toggle en ningún sitio. next-themes
solo aporta un script inline que pone una clase. Se sustituye por:

```tsx
<html lang={initialLang} className="dark" suppressHydrationWarning>
```

y se elimina `ThemeProvider` del layout (y la dependencia, si nada más la usa).
Arregla el tema claro sin JS, quita un script del `<head>` y quita una
dependencia. Es menos código, no más.

---

## 5. Alcance: una work unit coherente + una medición

La revisión 1 partía esto en "baseline visible" y "AllProjects CSS". **No es
posible**: mientras una entrada use framer-motion, su estado `hidden` se hornea
como `opacity:0` inline en el SSR, y el contenido sigue invisible sin JS. Una
WU1 que solo tocara hero/about dejaría featured, all-projects y footer rotos, y
una WU2 posterior tendría que repetir la infraestructura. Se unifican.

### WU1 — Reveal CSS-first (3 commits, un solo cambio coherente)

1. **Infraestructura:** script inline (gate + red de seguridad), CSS del gate,
   `components/reveal.tsx`, `class="dark"` en el servidor y eliminación de
   `ThemeProvider`. El script acabó en el `<body>`, no en el `<head>`: §11.
2. **Migración de entradas:** los 5 `FadeIn` a `Reveal`; borrado de las
   primitivas stagger muertas.
3. **Hero, about y navbar:** quitar los 12 `style` inline; `initial={false}` en
   el header + keyframe de entrada. El early-return de GSAP con
   `prefers-reduced-motion` que figuraba aquí se descartó: §11.

**Verificación:** `tsc --noEmit`, build, y `curl` del HTML comprobando que (a)
no queda ningún `style="opacity:0"` de entrada, (b) el HTML no trae el script de
next-themes, (c) hero, about, cards y footer están presentes y sin
`visibility:hidden`. Sin JS en el navegador: la home completa, en oscuro.
Comparación lado a lado de la coreografía (desktop y mobile).

### WU2 — Medición (no es una work unit de código)

1. **Experimento previo (5 minutos, cero código):** en `main`, poner
   `initial={false}` en los 2 `FadeIn` de AllProjects y repetir la carga fría.
   Si el long task desaparece, la hipótesis tiene base. Si no, el tick no era de
   esas animaciones y WU2 se cierra sin escribir nada.
2. Si tiene base: perfilado completo con el protocolo de §8 sobre la rama.

**Criterio de éxito:** long task < 50 ms (o desaparece), CLS sigue 0, scripting
total no sube. **Si no mejora, no se revierte:** WU1 se justifica por robustez y
a11y, y se actualiza el doc de jank con el dato nuevo.

---

## 6. Lo que NO se hace

- **No se usa `animation-timeline: view()`.** Soporte desigual; depender de ella
  reintroduce el problema.
- **No se elimina framer-motion.** Menú mobile, gestos y hide-on-scroll del
  navbar son trabajo real.
- **No se añade `<noscript>`.** Si el script del gate no corre, el gate
  nunca se activa y no hay nada que rescatar. Sería un segundo mecanismo para
  un fallo que el primero ya no puede producir.
- **No se añaden skeletons, blur-up ni render diferido.**
- **No se toca GSAP de las secciones principales.** Solo se mueve su estado
  inicial de "inline en JSX" a "gate CSS"; los timelines no cambian.

---

## 7. Riesgos y mitigaciones

| Riesgo | Prob. | Impacto | Mitigación |
|---|---|---|---|
| `data-reveal-item` ausente en el SSR → flash visible→oculto | Media | Medio | Renderizarlo en el markup, no en un efecto (§4.1c) |
| Flash visible→oculto por orden de scripts | Baja | Medio | Script crudo síncrono en el `<body>`, antes del contenido (§11.2); `next/script` inline NO sirve |
| Hydration mismatch por `data-reveal` en `<html>` | Baja | Alto | `suppressHydrationWarning` ya presente; el atributo lo pone el script, no React |
| IO no dispara y el contenido queda oculto | Baja | Crítico | Red de seguridad de 2 s **en el mismo script** (§4.1a) |
| GSAP no carga y hero/about quedan ocultos | Baja | Crítico | Misma red de seguridad; `autoAlpha:0` ya no está inline |
| Reduced motion: gate off pero GSAP oculta y revela | Media | Medio | Descartado por decisión del dueño del producto: las entradas corren siempre (§11.1) |
| La coreografía cambia de ritmo | Media | Bajo | Mismas constantes de `rootMargin`, duración y easing; comparar lado a lado |
| CSP estricta futura bloquea el inline script | Baja | Medio | Requiere `nonce`; anotado como deuda si se añade CSP |
| WU2 no mejora el tick | **Media** | Bajo | Aceptado: WU1 se justifica solo |

---

## 8. Plan de medición (WU2)

Mismo protocolo que `docs/issues/all-projects-entry-jank.md` §4:

- Prod, incógnito, sin caché, con filmstrip.
- 2 pasadas (scroll natural + rápido).
- Métricas: long tasks, duración del tick, decode en main thread, CLS,
  scripting total.
- Línea base documentada: 1 long task de ~58 ms, scripting 396 ms (main) / 363
  ms (worktree).

**Sin esta pasada, WU2 no se declara exitosa.** Y sin el experimento previo de
§5, WU2 no se implementa.

---

## 9. Opinión honesta

**Sobre el caso "sin JS":** la revisión 1 lo vendía como "invisible para agentes
y crawlers". No es cierto y no hay que apoyarse en eso. Lo que queda es más
pequeño y más sólido: una página que no se queda en blanco si el JS falla, y 12
nodos que hoy están fuera del árbol de accesibilidad. Eso, para un portfolio,
vale más que un argumento SEO inventado.

**Sobre el rendimiento:** el tick de 58 ms no justifica por sí solo migrar el
motor de animación de las entradas. Es 1 long task, una vez, en frío. Si el
experimento de 5 minutos de §5 dice que esas 2 animaciones no son la causa, hay
que cerrar WU2 sin escribir una línea.

**Sobre el coste:** 5 nodos, 3 componentes, ~10 archivos, ninguna API pública
cambiada, ningún cambio visual. El Reveal es comparable en tamaño a lo que
sustituye, y elimina 3 primitivas muertas y una dependencia. No es
sobreingeniería; es sustituir un motor por el mecanismo nativo que ya hace
exactamente esa animación.

**Sobre el veredicto anterior:** no era un error de criterio, era un argumento
incompleto y con datos de un estado anterior del código. El doc existente sigue
siendo correcto para lo que midió.

---

## 10. Decisión (resuelta 2026-10-19)

- [x] ¿Se aprueba WU1 (Reveal CSS-first + home visible sin JS)? — **sí.**
- [x] ¿Se ejecuta el experimento de 5 minutos de §5 para decidir si WU2 existe?
      — **no se ejecutó, y dejó de ser un gate.** La migración era necesaria para
      el baseline (la robustez y la a11y no dependen de la medición), así que el
      experimento solo decide si se **afirma** mejora de rendimiento. Hoy no se
      afirma: la medición sigue pendiente.
- [x] ¿Se reescribe §6 de `docs/issues/all-projects-entry-jank.md` para apuntar
      a este RFC y corregir el argumento del heading y el número de nodos?
      — **hecho.**

---

## 11. Estado de implementación y desvíos (2026-10-19)

Rama `feat/css-first-reveal`, worktree `M:\worktrees\maxgb23-portfolio\css-first-reveal`.
Sin merge, sin push. Nada de este track toca `main` todavía.

| Commit | Contenido |
|---|---|
| `46ff7e5` | `docs(rfc)`: revisión 2 de este documento |
| `ba27e10` | `feat(reveal)`: gate CSS + script inline + `class="dark"`, fuera next-themes, primitivo `Reveal` |
| `db64551` | `refactor(reveal)`: 5 nodos de AllProjects, Featured (heading) y Footer migrados; borrado `motion-primitives.tsx` |
| `1de0797` | `refactor(reveal)`: las entradas corren siempre (política de reduced motion) |
| `6d797d7` | `refactor(reveal)`: hero y about con `data-reveal-item` en vez de los 12 estilos inline |
| `1097457` | `refactor(navbar)`: entrada CSS y deadband direccional del hide-on-scroll |
| `2d417cd` | `docs(rfc)`: STATUS, §11 y §6 del doc de jank |
| `bc704d5` | `docs(design)`: canon de componentes, botones e iteration-guide |
| `6b55773` | `fix(reveal)`: red de seguridad acotada (la cancela el bundle), featured sin JS y techo del párrafo del hero |
| `592382c` | `fix(project-detail)`: el control Volver pasa a enlace real |

Tres desvíos respecto a lo aprobado:

1. **`prefers-reduced-motion` deja de consultarse.** Decisión del dueño del
   producto, no una omisión: la preferencia viene activada por defecto en
   bastantes equipos Windows (por rendimiento, no por vestibular) y matar la
   entrada empobrece la página. Efectos: el gate pierde la segunda condición, se
   cae el early-return de GSAP de §5, y `.nav-arrive` pierde su
   `@media (no-preference)`. Frontera y excepción documentadas en
   `docs/design/section-animations.md` (sección "Politica de
   prefers-reduced-motion"): fades y desplazamientos <= 24px sí; parallax, zoom,
   giros o scroll-jacking tendrían que respetar la preferencia.
2. **El script del gate va en el `<body>`, no en el `<head>`.** Verificado en el
   HTML compilado: un `next/script` inline con `strategy="beforeInteractive"` no
   se ejecuta inline — Next lo serializa en `self.__next_s` y lo corre el chunk
   asíncrono `app-bootstrap`, que puede llegar después del primer paint y
   producir el flash visible -> oculto. Un `<script>` crudo al principio del
   `<body>` corre durante el parseo, antes de que exista cualquier nodo de
   contenido.
3. **La transición del fade se separó del estado `shown`** y vive en la clase
   `.reveal-fade`, que solo renderiza `Reveal`. Motivo: hero y about también son
   items del gate (para el estado oculto pre-paint) pero su opacidad la escribe
   GSAP frame a frame; con la transición en `[data-reveal-item="shown"]`, la red
   de seguridad de 2s caería en mitad del timeline de hero y amortiguaría cada
   escritura de GSAP.

Resultados del canal de verificación del agente (el pase visual es del usuario):
`pnpm typecheck` y `pnpm build` en exit 0; el HTML servido en `next start` trae
0 `opacity:0` inline y 0 `visibility:hidden` inline en la home, el script del
gate inline antes de `<main>`, `class="dark"` en `<html>` y ningún script de
next-themes; el CSS compilado trae las reglas del gate sin capa y el keyframe
`nav-arrive`. `data-reveal-item` en el servidor: 5 nodos de `Reveal` + 12 de
hero/about.

### Correcciones tras el primer testeo en vivo (2026-10-19)

1. **La red de seguridad estaba matando las entradas de todo lo que está bajo el
   pliegue.** Revelaba todo a los 2s, y un scroll natural desde la home llega
   más tarde que eso: la sección llegaba ya visible y sin animación (síntoma
   reportado: F5 con la sección a la vista sí anima; scroll natural desde
   arriba, no). Ahora el bundle la cancela al evaluarse
   (`window.__revealNet` desde `components/reveal.tsx`, en module scope), así
   que solo cubre su caso real: que el bundle no llegue a ejecutarse.
2. **Featured sin JS mostraba la sección vacía.** El estado oculto de los
   paneles es estado de React, y el servidor lo renderiza oculto: sin JS los
   paneles quedaban invisibles conservando su espacio. Se libera con
   `featured-one-slide` + `html:not([data-reveal="on"])` en `app/globals.css`.
3. **El párrafo del hero cambiaba de ancho sin JS**, porque su `max-width` sale
   de medir el título en runtime. La clase trae ahora el mismo techo
   (`md:max-w-[60ch]`).

**La medición de rendimiento no existía al cerrar este RFC, y la primera
observación del usuario no la sustituía**: el tick que percibió "mucho menor" se
midió con la entrada ya disparada por la red de seguridad, es decir sin la
animación.

Actualización 2026-10-20: existe una medición acotada a la entrada
(`docs/issues/all-projects-entry-jank.md` §6.1) y **no encuentra long tasks en
la ventana de entrada**, ni en frío ni en caliente. La causa del tirón apareció
después, fuera del motor de animación: `images.unoptimized: true` servía los
originales (hasta 4000x2800) y el costo estaba en la GPU, no en el main thread
(§6.2 del mismo archivo). Esta migración no fue el fix de rendimiento, y sigue
sin poder atribuírsele una mejora medida en esa ventana.

## 12. Segunda ronda de testeo (2026-10-19): detalle de proyecto sin JS

Este RFC es de la home; lo que sigue es de OTRA superficie, y se registra aquí
porque salió de la misma ronda de validación y porque toca el mismo criterio
(qué debe seguir funcionando cuando el JS no corre).

Con JS apagado, `/proyectos/[id]` no cambia de vista (switcher de tabs muerto),
no abre el lightbox y el control Volver no hacía nada.

Diferencia de umbral respecto a la home: la home era una **página en blanco**
(defecto objetivo). El detalle es una página **degradada pero completa** — las
dos vistas viajan en el HTML desde la decisión de 2026-10-13, así que crawlers y
print ya tenían el contenido. Sin JS solo se pierde el *cambio* de vista y el
lightbox.

Decisión: se arregla UNO, el que era un callejón real, y el resto se acepta.

1. **Volver pasa a ser un enlace real.** La página no renderiza navbar (solo la
   barra de progreso), así que ese control era el único camino de vuelta dentro
   del sitio. Ahora es un `<a href="/">` dentro de `Button asChild` con
   `onClick` que hace `preventDefault()` y ejecuta el handler de siempre: con JS
   el comportamiento es idéntico y el `href` nunca se sigue.
2. **Tabs y lightbox no se tocan.** Deuda ACEPTADA, no pendiente, declarada en
   `docs/design/components.md` §13.7. Reimplementar los tabs con `:target` o con
   radios CSS, o la galería como página aparte, queda DESCARTADO: sería una
   segunda UI para un público que no es el del producto, duplicaría la fuente de
   verdad del estado activo y arriesga la experiencia con JS, que es la que
   importa. Criterio del dueño: sin sobreingeniería, navegar sin JS es
   deliberado y rarísimo.
