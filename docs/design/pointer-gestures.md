# Interacciones Pointer / Teclado / Foco — Guía de Buenas Prácticas

Reglas para cualquier sección interactiva del portfolio: galerías, lightboxes, carruseles, modales. Cubre **puntero** (drag, swipe, hover-zoom, tap) y **teclado/foco** (navegación por flechas, trap de foco, retorno del foco). El proyecto **hand-rolls** toda interacción (cero dependencias), así que estas reglas las aplicamos a mano.

Contexto: la galería y el lightbox viven en `components/project-detail.tsx`; la infraestructura de scroll en `hooks/use-lenis.tsx` y `components/smooth-scroll.tsx` (ver `components.md`).

---

## Por qué existen estas reglas

Las 1-7 nacieron de una sola causa: el navegador puede **reclamar un gesto en tres momentos** y cancelar la secuencia de pointer events con `pointercancel` — el handler de swipe nunca recibe `pointerup`, la UI se queda a medias y pueden persistir estados que bloquean la página:

1. **Gestos de scroll/pan** (móvil): `touch-action` decide qué gestos son del navegador.
2. **Drag nativo**: las `<img>` son arrastrables por defecto; un drag que arranca justo cuando el DOM cambia bajo el puntero puede dejar una sesión de arrastre fantasma que captura todos los clics.
3. **Selección de texto**: mousedown+drag sobre una imagen entra en modo selección (recuadro azul) y cancela los pointer events.

Las 8-10 (teclado y foco) no vienen de esa causa: son el otro eje del mismo problema. Un modal declara `aria-modal` y se cierra con `Escape`, lo que hace que el componente *parezca* accesible — pero si `Tab` escapa al fondo, la promesa es falsa, y sin flechas el visor no se puede recorrer sin mouse. Ver el caso canónico: las tres rondas que motivaron estas reglas eran invisibles leyendo el código.

---

## Checklist (aplicar SIEMPRE en interacciones de puntero y teclado)

### 1. Swipe táctil: fija `touch-action` siempre
Un handler de swipe con pointer events **sin** `touch-action` muere en móvil: el browser reclama el gesto horizontal y dispara `pointercancel`.

- Swipe horizontal: `touch-pan-y` en el contenedor (el eje horizontal es tuyo; el vertical sigue siendo del browser).
- Drag 2D total: `touch-none`.
- Botones en pantallas táctiles: `touch-manipulation` (mata el doble-tap zoom, respeta el resto).

### 2. Imágenes interactivas: `draggable={false}`
Toda `<Image>` dentro de una zona clicable o swipeable lleva `draggable={false}`. El drag nativo no debería poder arrancar de una galería/visor.

### 3. Visores y modales: `select-none` en el contenedor
Dentro de un lightbox/modal no hay nada seleccionable: `select-none` en el contenedor raíz (imagen, caption, contador). Evita el recuadro azul y la cancelación de pointer events.

### 4. Red de seguridad: `onDragStart` con `preventDefault()`
En botones que envuelven imágenes, añadir `onDragStart={(e) => e.preventDefault()}` — cubre cualquier dragstart que burle `draggable={false}` (propaga desde los hijos).

### 5. Tap fuera = cerrar: NO hagas `stopPropagation` en contenedores gigantes
Un `<figure>`/`<div>` `w-full` + alto fijo con `stopPropagation()` se traga los taps sobre su **letterbox** (la zona negra alrededor de la imagen con `object-contain`). El tap fuera debe cerrar.

- Hit-test contra el **rectángulo pintado real** de la imagen (contain-fit calculado desde `naturalWidth/naturalHeight` en el click) y `stopPropagation()` SOLO si el punto cayó dentro.
- El fondo negro alrededor de la imagen (letterbox incluido) es backdrop → cierra.

### 6. Tras un drag exitoso, suprime el click sintético
Después de un swipe/arrastre el browser sintetiza un `click` sobre el mismo elemento — si navegaste, ese click cerraría el visor. Patrón: flag `suppressClose` en un ref + timeout de seguridad (~400ms).

### 7. Scroll lock: bloquea TODAS las entradas
Para congelar el fondo con un overlay: `overflow: hidden` en html Y body + `lenis?.stop()` (desktop). Restaurar los valores previos en el cleanup (no hardcodear `""` — respeta el valor que había). En móvil Lenis es `null`, así que `overflow` es el único lock.

### 8. Un modal declara `aria-modal` → tiene que atrapar el foco
`aria-modal="true"` es una **promesa**: "lo que está afuera es inalcanzable". Si el Tab sale del dialog, la promesa es falsa y el lector anuncia "dialog" mientras el foco está en el contenido de detrás. Tres piezas:

- **El foco entra al abrir.** Si se queda en el disparador (que está detrás del overlay), el trap no tiene dónde engancharse. Enfocar en `requestAnimationFrame`: un overlay con `backdrop-blur` fuerza compositing en el primer frame, y enfocar en el mismo tick hace que `:focus-visible` se evalúe contra un layout sin asentar.
- **Trap con `preventDefault` en los extremos.** Interceptar Tab solo cuando el foco está en el último (o en el primero con `Shift+Tab`) y envolver. En medio, dejar pasar el Tab nativo para conservar el orden del DOM.
- **El handler va en el `div` del dialog, NUNCA en `window`.** En `window` seguiría atrapando después del desmontaje, porque el cleanup del efecto de scroll-lock corre después del re-render.

Filtrar los focables con `getClientRects().length > 0`: un `querySelectorAll` devuelve también lo que está oculto por `hidden`/`display:none`, y si el último de la lista fuera un control invisible, el wrap saltaría a la nada.

### 9. Cerrar un modal devuelve el foco al disparador
Sin esto el foco cae a `<body>` y el usuario de teclado tiene que volver a tabular desde el principio de la página. Guardar `document.activeElement` al abrir y restaurarlo en el cleanup, con `document.contains(opener)` como guarda — cubre el caso en que el usuario navegó mientras el modal estaba abierto.

**Colgar el efecto de un booleano, no del índice del contenido.** Si el modal tiene estado navegable (galería, pestañas), un efecto que dependa del índice se re-ejecuta en cada cambio de imagen y captura como "opener" un control del propio modal.

### 10. Flechas para navegar contenido, como los botones
Si los botones ◀ ▶ recorren el contenido, `←`/`→` deben hacer lo mismo: no tenerlos deja el visor inutilizable con teclado. Con `preventDefault` (si no, la página scrollea lateralmente) y wrap-around, igual que los botones. Solo cuando hay >1 elemento — con uno solo no hay destino, y es el caso donde los botones tampoco se renderizan.

---

## Caso canónico: lightbox del detalle de proyecto (2026-09-16 → 2026-10-02)

Bug reportado por QA en 4 rondas; cada una fue una de las cancelaciones de arriba:

| Ronda | Síntoma | Causa raíz | Fix |
|-------|---------|------------|-----|
| 1 | Swipe no cambiaba imágenes en móvil | `touch-action` por defecto → browser reclamaba el gesto → `pointercancel` | `touch-pan-y` en el overlay |
| 2 | Tap fuera no cerraba en eje Y | `stopPropagation` en `figure` `w-full h-[80vh]` tragaba el letterbox | Hit-test del rect pintado (contain-fit) |
| 2b | Swipe cerraba el visor | Click sintético post-drag | Flag `suppressClose` + timeout |
| 3 | Cursor de lupa congelado + clics muertos en desktop | Drag nativo de imagen interrumpido por el mount/unmount del overlay → sesión de arrastre fantasma de Chromium capturaba los clics | `draggable={false}` + `select-none` en galería + `onDragStart` preventDefault |
| 4 | Recuadro azul de selección en la imagen ampliada | El lightbox no tenía `select-none` (solo la galería) | `select-none` en el overlay del visor |
| 5 | Controles invisibles sobre capturas de interfaz clara | Velo `bg-white/10` sobre imagen blanca. Medido: 3 de 11 capturas (luminancia 243 / 221 / 203) | `bg-black/40` en lo que puede caer sobre la imagen; `xl:bg-white/10` desde `xl`, donde ya no la toca |
| 6 | Flechas ◀ ▶ recortadas ~28px en ventanas de 830–1144px | El `<figure>` es `relative` y va **después** en el DOM: sin `z-index` la imagen pintaba encima | `z-10` en los tres controles |
| 7 | El lightbox no se podía recorrer con teclado | `onKeyDown` solo manejaba `Escape`; sin flechas solo quedaban botones ocultos bajo `nav` o el swipe | `←`/`→` con wrap-around + trap de foco (reglas 8-10) |

Lección de sistema: **los tres modos de cancelación se combaten en el mismo lugar** — el contenedor de la interacción. Si una UX "se traba" al entrar/salir rápido, revisa primero si arrancó un scroll, drag o selección nativos.

Lección de las rondas 5-7: **las tres eran invisibles leyendo el código**. El componente declaraba `role="dialog"`, `aria-modal`, Escape y scroll-lock — parecía completo. Los tres fallos estaban en cosas que solo se ven mirando el comportamiento: contraste contra contenido real, orden de pintado, y una tecla que faltaba. Una auditoría estática confirma que el código dice lo que debe; no que se vea ni se pueda usar. Por eso el gate de QA de este proyecto es **manual y con teclado, por work unit**, no una suite.

Archivos: `components/project-detail.tsx` (lightbox + galería), commits `d97b877` (rondas 1-2), `b84353e` (rondas 3-4), `a5c675d` / `70c6275` / `22418f2` / `899783c` (rondas 5-7).