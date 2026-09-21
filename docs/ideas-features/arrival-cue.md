# 📌 Feature: Arrival cue en sección de contacto

## 🎯 Descripción
Cuando el usuario hace clic en un CTA de la sección de precios ("Solicitar cotización", "Cotizar mi proyecto", "Agendar llamada") o en el botón "Contacto" del navbar, la página hace smooth-scroll a `#contacto`. Al completar el scroll, la sección destino se ilumina brevemente (wash púrpura + anillo interior que se disipan) para anunciar visualmente la llegada.

## 🧠 Por qué existe
En desktop las secciones están prácticamente pegadas (~128px de gap) y la cabecera de contacto usa exactamente el mismo estilo tipográfico que la de precios (`font-serif black uppercase` + span en `text-purple-accent`). Con un delta de scroll pequeño y cero feedback de URL, el usuario no registra que cambió de sección y concluye que el botón no funciona.

## ⚙️ Mecanismo
`hooks/use-lenis.tsx` — `announceArrival(href)`:
1. **Hash en URL**: `history.replaceState` con el fragmento (sin entradas extra en historial, sin salto nativo).
2. **Cue visual**: añade la clase `arrive` al elemento destino → dispara la animación CSS.
3. **Limpieza**: remueve la clase tras ~2.2s (deja el DOM limpio y permite replay).

Disparo:
- **Desktop**: en `onComplete` del scroll de Lenis (`duration: 1.4`) — el cue cae exactamente al aterrizar, no antes.
- **Mobile** (sin Lenis): `setTimeout` ~1000ms tras el smooth scroll nativo (sin señal de completado; mobile no era el caso de percepción rota).

Replay (segundo clic en el mismo CTA): `classList.remove("arrive")` → forced reflow (`void target.offsetWidth`) → `classList.add("arrive")`.

## 🧱 CSS — `app/globals.css`
- `#contacto.arrive` → animación `contact-arrive` **1.5s**: wash púrpura **5%** + ring inset **2px al 25%**, hold 20%, fade out suave (volumen final; fue calibrado en vivo desde 22% hasta 5%).
- `prefers-reduced-motion` → versión **ESTÁTICA** (wash 10% + ring 2px 35%) mientras la clase está presente (~2.2s). Degradar el feedback, nunca eliminarlo.
- `section[id] { scroll-margin-top: 5rem }` → al refrescar con hash, el target cae debajo del navbar fijo (64px).

## ⚠️ Lecciones (gotchas — dolor real)
1. **`history.replaceState` NO actualiza `:target`.** Aunque el hash esté en la URL, el navegador no ejecuta fragment-navigation, así que el elemento jamás matchea `#contacto:target` (confirmado headless: hash presente + target `false`). La animación debe dispararse por **clase**, no por pseudo-clase.
2. **`prefers-reduced-motion` + `animation: none` borra el feedback al 100%.** En Windows con "Animation effects" desactivado el cue era invisible por completo (fue el caso real del usuario). La accesibilidad exige degradar, no eliminar.
3. **Lenis es time-based**: `duration: 2` se sentía lento para saltos cortos (~2.2s hasta ver feedback). Con `1.4` el feedback total llega en ~1.5s.

## 📁 Archivos
- `hooks/use-lenis.tsx` — `announceArrival()` + `duration: 1.4`
- `app/globals.css` — `#contacto.arrive` + keyframes + bloque reduced-motion + scroll-margin
- `docs/ideas-features/arrival-cue.md` — este doc