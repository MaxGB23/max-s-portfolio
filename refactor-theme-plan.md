# Plan de Refactorización: Variables de Color a Tailwind Theme

## Análisis del Problema
Actualmente, el proyecto utiliza variables CSS nativas inyectadas a través de estilos en línea (ej. `style={{ color: "var(--accent-purple)" }}`) o clases arbitrarias de Tailwind (ej. `bg-[var(--nav-bg)]`). Aunque esto funciona visualmente, trae desventajas en mantenibilidad, escalabilidad y consistencia (no hay IntelliSense ni verificación en el IDE, el código es más verboso de lo necesario).

## Archivos Afectados

Durante la inspección de la carpeta `components/`, se detectó que los siguientes 12 archivos hacen uso de esta práctica:

1. `components/about-section.tsx`
2. `components/dark-mode-toggle.tsx`
3. `components/featured-project-panel.tsx`
4. `components/footer.tsx`
5. `components/hero-section.tsx`
6. `components/navbar.tsx`
7. `components/pricing-section.tsx`
8. `components/products-section.tsx`
9. `components/project-card.tsx`
10. `components/projects-section.tsx`
11. `components/scroll-progress.tsx`

Las variables específicas en uso de esta manera son:
- `--nav-bg`
- `--accent-purple`
- `--accent-purple-light`
- `--hero-text` (declarada en `globals.css` pero actualmente no usada mediante estilos en línea/arbitrarios).

## Plan de Acción

### Paso 1: Configurar el Tema de Tailwind (v4)
Como se está utilizando Tailwind CSS v4, el tema se debe extender directamente desde el archivo `app/globals.css` usando la regla `@theme inline`.
Añadiremos los colores personalizados como variables del tema:

```css
/* En app/globals.css */
@theme inline {
  /* ... resto de extensiones del tema ... */
  --color-nav: var(--nav-bg);
  --color-purple-accent: var(--accent-purple);
  --color-purple-accent-light: var(--accent-purple-light);
  --color-hero-text: var(--hero-text);
}
```

### Paso 2: Refactorizar Componentes (Eliminar Estilos Arbitrarios)
Se deberán recorrer los archivos afectados para transicionar el formato. Ejemplos de reemplazo:

**Uso en colores de texto:**
- *Antes:* `style={{ color: "var(--accent-purple)" }}` o `text-[var(--accent-purple)]`
- *Después:* `className="... text-purple-accent"`

**Uso en colores de fondo:**
- *Antes:* `style={{ backgroundColor: "var(--accent-purple-light)" }}` o `bg-[var(--accent-purple-light)]`
- *Después:* `className="... bg-purple-accent-light"`

**Uso en bordes:**
- *Antes:* `border-[var(--accent-purple)]`
- *Después:* `className="... border-purple-accent"`

**Casos especiales (Framer Motion y pseudo-estilos condicionales):**
Hay lugares, como en `footer.tsx` (`whileHover={{ scale: 1.1, borderColor: "var(--accent-purple)" }}`) o en `pricing-section.tsx` (`style={tier.highlighted ? { ... } : {}}`), donde el refactor puede implicar el uso de condicionales con la utilidad `cn` (clsx/tailwind-merge) usando clases estándar de Tailwind en lugar del prop `style`, o pasando la paleta usando variables HSL si se requiere animación de Framer. En su mayoría, casi todas pueden pasar por clase estándar.

### Paso 3: Validación Total
1. Correr la aplicación localmente (`pnpm dev`).
2. Verificar que los estilos de text, bg y bordes se sigan aplicando correctamente.
3. Confirmar que el Dark Mode / Light Mode se sigue respetando (dado que estas utilidades dependen de las variables base que ya estaban cambiando según el scope `.dark`).
