# RFC: Reveal CSS-first — entradas fuera de framer-motion + contenido visible sin JS

> **STATUS: PROPUESTO (revisión 2). Pendiente de aprobación. No implementado.**
>
> Revisión 2 corrige cuatro errores de la revisión 1: la premisa sobre
> crawlers/LLMs (§1), el alcance real de AllProjects (§3.2), la ubicación de la
> red de seguridad (§4.1) y el alcance de las work units (§5). Sustituye la
> conclusión de `docs/issues/all-projects-entry-jank.md` §6, que descartó la vía
> "solo-CSS" con un argumento que solo cubría la mitad del cambio.

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

**a) Script inline de arranque** (en `<head>`, síncrono, ~5 líneas). Contiene
**el gate y la red de seguridad en el mismo bloque**: si la red viviera en el
bundle, moriría justo en el fallo que debe cubrir (bundle que no carga).

```html
<script>
  if ('IntersectionObserver' in window &&
      !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.dataset.reveal = 'on';
    setTimeout(function () {
      document.querySelectorAll('[data-reveal-item]:not([data-reveal-item="shown"])')
        .forEach(function (el) { el.dataset.revealItem = 'shown'; });
    }, 2000);
  }
</script>
```

- Corre antes del primer paint: no hay flash de visible-a-oculto.
- Una sola condición decide todo: sin IO o con movimiento reducido, la marca
  nunca se pone y la página se muestra completa y estática.
- La red de seguridad no depende del bundle, de React ni de GSAP.

**b) CSS del gate** (`app/globals.css`):

```css
[data-reveal='on'] [data-reveal-item]:not([data-reveal-item='shown']) {
  opacity: 0;
}

[data-reveal='on'] [data-reveal-item='shown'] {
  opacity: 1;
  transition: opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1);
  transition-delay: var(--reveal-delay, 0s);
}
```

No hace falta `@media (prefers-reduced-motion)` aquí: si el usuario reduce
movimiento, el gate nunca se activa. Una sola fuente de verdad.

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

1. **Infraestructura:** script inline en `<head>` (gate + red de seguridad),
   CSS del gate, `components/reveal.tsx`, `class="dark"` en el servidor y
   eliminación de `ThemeProvider`.
2. **Migración de entradas:** los 5 `FadeIn` a `Reveal`; borrado de las
   primitivas stagger muertas.
3. **Hero, about y navbar:** quitar los 12 `style` inline; `initial={false}` en
   el header + keyframe de entrada; early-return de GSAP cuando
   `prefers-reduced-motion: reduce` (si el gate no se activa pero GSAP hace
   `autoAlpha:0`, habría hide-then-show).

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
- **No se añade `<noscript>`.** Si el script del `<head>` no corre, el gate
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
| Flash visible→oculto por orden de scripts | Baja | Medio | Script síncrono en `<head>`, antes del primer paint |
| Hydration mismatch por `data-reveal` en `<html>` | Baja | Alto | `suppressHydrationWarning` ya presente; el atributo lo pone el script, no React |
| IO no dispara y el contenido queda oculto | Baja | Crítico | Red de seguridad de 2 s **en el mismo script** (§4.1a) |
| GSAP no carga y hero/about quedan ocultos | Baja | Crítico | Misma red de seguridad; `autoAlpha:0` ya no está inline |
| Reduced motion: gate off pero GSAP oculta y revela | Media | Medio | Early-return de GSAP con `prefers-reduced-motion` (§5, commit 3) |
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

## 10. Decisión pendiente

- [ ] ¿Se aprueba WU1 (Reveal CSS-first + home visible sin JS)? — recomendado.
- [ ] ¿Se ejecuta el experimento de 5 minutos de §5 para decidir si WU2 existe?
      — recomendado antes de escribir la migración.
- [ ] ¿Se reescribe §6 de `docs/issues/all-projects-entry-jank.md` para apuntar
      a este RFC y corregir el argumento del heading y el número de nodos?
