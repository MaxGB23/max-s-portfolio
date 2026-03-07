# 📌 Feature: Smooth Scroll Engine + Scroll Animations

## 🎯 Descripción breve de la feature
Implementar un motor de scroll suavizado (smooth scrolling) que reemplace el scroll nativo del navegador en desktop, permitiendo:
- **Movimiento fluido interpolado** (sin “tics”)
- **Integración** con animaciones basadas en scroll
- **Control preciso** del timing
- **Efectos avanzados** (parallax, reveal, stagger, velocity-based effects)

### El sistema debe:
1. Mantener scroll nativo en mobile.
2. Respetar `prefers-reduced-motion`.
3. Integrarse correctamente con animaciones de **GSAP** y **Framer Motion**.
4. No romper accesibilidad ni performance.

---

## 🧠 Arquitectura recomendada

### 🔹 Motor de scroll: Lenis
Usar **Lenis** como engine principal.
**Por qué:**
- **Liviano:** Pesa muy poco y es moderno.
- **GSAP:** Excelente integración con ScrollTrigger.
- **DOM:** No manipula demasiado el DOM, manteniendo el comportamiento del navegador.
- **Performance:** Mejor que alternativas más antiguas como Locomotive Scroll.

### 🔹 Animaciones de scroll: GSAP + ScrollTrigger
**Por qué:**
- **Control profesional:** Ofrece sincronización perfecta con Lenis.
- **Complejidad:** Ideal para timelines complejos y secuencias largas.
- **Precisión:** Mejor que usar solo Motion para animaciones dependientes del scroll.

### 🔹 Animaciones UI / Microinteracciones: Framer Motion
Usar **Framer Motion** solo para:
- Hover states
- Transiciones entre rutas
- Component enter/exit
- Layout animations
> [!IMPORTANT]
> **No usar Motion como motor de scroll.**

---

## 📱 UX: qué cuidar en Desktop y Mobile

### 🖥 Desktop
- ✅ **Activar smooth scroll:** Interpolación leve (no exagerada).
- ✅ **Sincronización:** No retrasar demasiado la respuesta al wheel. Sincronizar bien con ScrollTrigger.
- ✅ **Navegación:** Mantener funcionalidad del teclado.

**⚠️ Evitar:**
- Smooth demasiado lento (sensación de lag).
- Scroll hijacking agresivo.
- Bloquear comportamiento nativo de anchor links o romper el botón "back".

### 📱 Mobile (MUY IMPORTANTE)
👉 **Recomendación profesional:** NO reemplazar scroll nativo en mobile.
**Por qué:**
- iOS/Android tienen momentum scrolling nativo optimizado.
- Cualquier reemplazo puede generar jank y afectar performance.
- Puede romper overscroll e impactar accesibilidad.

**En mobile:**
- Mantener scroll nativo.
- Solo usar GSAP ScrollTrigger.
- Desactivar Lenis si `window.innerWidth < 1024`.

---

## ♿ Accesibilidad

Implementar detección de movimiento reducido:
```javascript
if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  // Desactivar smooth scroll o animaciones intensas
}
```

**También:**
- No usar scroll para revelar contenido crítico.
- Mantener navegación por teclado funcional.
- Evitar animaciones obligatorias para leer.

---

## ⚙️ Recomendación final de stack
- 🥇 **Setup ideal:** Lenis (Scroll) + GSAP (Animaciones) + Framer Motion (Transiciones).
- 🚀 **Nivel de suavidad:** No uses valores extremos.
  - Buen rango en Lenis: `duration: 1.0 – 1.2`.
  - Valores más altos generan sensación de lag.

---

## 📈 Beneficios de esta feature
- **Sensación premium:** Una navegación fluida eleva la percepción del sitio.
- **Control creativo:** Permite implementar animaciones cinematográficas.
- **Diferenciación:** Percepción de mayor calidad técnica y visual.



## Issues
Al hacer scroll con mouse es smooth, pero al clickar directamente en el scroll vertical del navegador a veces el contenido pareciera como que se empieza a mover de forma rara, como si no estuviera sincronizado correctamente. Esto pasa de vez en cuando, no siempre. Sucede mas cuando vienes de hacer scroll con el mouse y de repente usas el scroll vertical del navegador. Si te mantienes un rato usando el scroll vertical del navegador no pasa, pero si alternas entre mouse y scroll vertical del navegador si pasa.


