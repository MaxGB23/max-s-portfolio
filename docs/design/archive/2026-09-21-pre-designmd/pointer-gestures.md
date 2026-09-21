# Interacciones Pointer / Drag / Select — Guía de Buenas Prácticas

Reglas para cualquier sección interactiva del portfolio que use gestos del puntero: galerías, lightboxes, carruseles, drag, swipe, hover-zoom. El proyecto **hand-rolls** toda interacción (cero dependencias), así que estas reglas las aplicamos a mano.

Contexto: la galería y el lightbox viven en `components/project-detail.tsx`; la infraestructura de scroll en `hooks/use-lenis.tsx` y `components/smooth-scroll.tsx` (ver `components.md`).

---

## Por qué existen estas reglas

El navegador puede **reclamar un gesto en tres momentos** y cancelar la secuencia de pointer events con `pointercancel` — el handler de swipe nunca recibe `pointerup`, la UI se queda a medias y pueden persistir estados que bloquean la página:

1. **Gestos de scroll/pan** (móvil): `touch-action` decide qué gestos son del navegador.
2. **Drag nativo**: las `<img>` son arrastrables por defecto; un drag que arranca justo cuando el DOM cambia bajo el puntero puede dejar una sesión de arrastre fantasma que captura todos los clics.
3. **Selección de texto**: mousedown+drag sobre una imagen entra en modo selección (recuadro azul) y cancela los pointer events.

---

## Checklist (aplicar SIEMPRE en interacciones de puntero)

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

---

## Caso canónico: lightbox del detalle de proyecto (2026-09-16)

Bug reportado por QA en 4 rondas; cada una fue una de las cancelaciones de arriba:

| Ronda | Síntoma | Causa raíz | Fix |
|-------|---------|------------|-----|
| 1 | Swipe no cambiaba imágenes en móvil | `touch-action` por defecto → browser reclamaba el gesto → `pointercancel` | `touch-pan-y` en el overlay |
| 2 | Tap fuera no cerraba en eje Y | `stopPropagation` en `figure` `w-full h-[80vh]` tragaba el letterbox | Hit-test del rect pintado (contain-fit) |
| 2b | Swipe cerraba el visor | Click sintético post-drag | Flag `suppressClose` + timeout |
| 3 | Cursor de lupa congelado + clics muertos en desktop | Drag nativo de imagen interrumpido por el mount/unmount del overlay → sesión de arrastre fantasma de Chromium capturaba los clics | `draggable={false}` + `select-none` en galería + `onDragStart` preventDefault |
| 4 | Recuadro azul de selección en la imagen ampliada | El lightbox no tenía `select-none` (solo la galería) | `select-none` en el overlay del visor |

Lección de sistema: **los tres modos de cancelación se combaten en el mismo lugar** — el contenedor de la interacción. Si una UX "se traba" al entrar/salir rápido, revisa primero si arrancó un scroll, drag o selección nativos.

Archivos: `components/project-detail.tsx` (lightbox + galería), commits `d97b877` (rondas 1-2), `b84353e` (rondas 3-4).