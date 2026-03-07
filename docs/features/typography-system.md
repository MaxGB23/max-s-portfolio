# Sistema de Tipografía Responsiva

Estrategia de font sizes por breakpoint para garantizar legibilidad y jerarquía visual consistente en todos los dispositivos.

---

## Breakpoints de Referencia (Tailwind CSS defaults)

| Alias     | Min-width | Descripción              |
|-----------|-----------|--------------------------|
| *(base)*  | 0px       | Mobile portrait          |
| `sm:`     | 640px     | Mobile landscape / small |
| `md:`     | 768px     | Tablet                   |
| `lg:`     | 1024px    | Desktop small            |
| `xl:`     | 1280px    | Desktop standard         |
| `2xl:`    | 1536px    | Desktop large / 4K       |

> El sistema cubre **5 rangos clave**: base, `sm:`, `lg:`, `xl:`, `2xl:`.
> `md:` se usa solo como ajuste puntual si un caso lo requiere.

---

## Escala de Font Sizes por Breakpoint

### Display / Hero Titles (`h1`)

| Breakpoint | Clase Tailwind         | Valor     | Uso                        |
|------------|------------------------|-----------|----------------------------|
| base       | `text-5xl`             | 3rem      | Mobile portrait            |
| `sm:`      | `sm:text-6xl`          | 3.75rem   | Mobile landscape           |
| `lg:`      | `lg:text-7xl`          | 4.5rem    | Desktop small              |
| `xl:`      | `xl:text-8xl`          | 6rem      | Desktop standard           |
| `2xl:`     | `2xl:text-9xl`         | 8rem      | Desktop large / 4K         |

### Section Titles (`h2`)

| Breakpoint | Clase Tailwind         | Valor     | Uso                        |
|------------|------------------------|-----------|----------------------------|
| base       | `text-4xl`             | 2.25rem   | Mobile                     |
| `sm:`      | `sm:text-5xl`          | 3rem      | Mobile landscape           |
| `lg:`      | `lg:text-6xl`          | 3.75rem   | Desktop small              |
| `xl:`      | `xl:text-7xl`          | 4.5rem    | Desktop standard           |
| `2xl:`     | `2xl:text-8xl`         | 6rem      | Desktop large / 4K         |

### Subsection / Card Titles (`h3`)

| Breakpoint | Clase Tailwind         | Valor     | Uso                        |
|------------|------------------------|-----------|----------------------------|
| base       | `text-2xl`             | 1.5rem    | Mobile                     |
| `sm:`      | `sm:text-3xl`          | 1.875rem  | Mobile landscape           |
| `lg:`      | `lg:text-4xl`          | 2.25rem   | Desktop small              |
| `xl:`      | `xl:text-5xl`          | 3rem      | Desktop standard           |
| `2xl:`     | `2xl:text-5xl`         | 3rem      | Desktop large (igual a xl) |

### Body / Descriptions (`p`)

| Breakpoint | Clase Tailwind         | Valor     | Uso                        |
|------------|------------------------|-----------|----------------------------|
| base       | `text-sm`              | 0.875rem  | Mobile                     |
| `sm:`      | `sm:text-base`         | 1rem      | Mobile landscape           |
| `lg:`      | `lg:text-lg`           | 1.125rem  | Desktop small              |
| `xl:`      | `xl:text-lg`           | 1.125rem  | Desktop standard (igual)   |
| `2xl:`     | `2xl:text-xl`          | 1.25rem   | Desktop large / 4K         |

### Labels / Eyebrows (`p` uppercase)

| Breakpoint | Clase Tailwind         | Valor     | Uso                        |
|------------|------------------------|-----------|----------------------------|
| base       | `text-xs`              | 0.75rem   | Mobile                     |
| `sm:`      | `sm:text-sm`           | 0.875rem  | Mobile landscape           |
| `lg:`      | `lg:text-base`         | 1rem      | Desktop small              |
| `xl:`      | `xl:text-base`         | 1rem      | Desktop standard (igual)   |
| `2xl:`     | `2xl:text-sm`          | 0.875rem  | Desktop large (igual a sm) |

---

## Patrón de Aplicación

```tsx
// Ejemplo de Hero Title con el sistema aplicado
<h1 className="
  text-5xl
  sm:text-6xl
  lg:text-7xl
  xl:text-8xl
  2xl:text-9xl
  font-serif font-black uppercase leading-[0.9] tracking-tighter
">
  Full Stack Developer
</h1>
```

```tsx
// Ejemplo de Section Title
<h2 className="
  text-4xl
  sm:text-5xl
  lg:text-6xl
  xl:text-7xl
  2xl:text-8xl
  font-serif font-black uppercase leading-[0.9] tracking-tighter
">
  Sobre Mí
</h2>
```

---

## Notas de Implementación

- **Reemplaza `clamp()`**: Actualmente el hero usa `text-[clamp(3.5rem,8vw,6.5rem)]`. Este sistema de breakpoints explícitos es más predecible y fácil de mantener.
- **`2xl:` activo en todos los niveles**: Se escala una vez más en pantallas ≥ 1536px para aprovechar el espacio disponible sin sobrecargarlo.
- **Leading y tracking no cambian por breakpoint**: `leading-[0.9]` y `tracking-tighter` se mantienen en todos los tamaños de display.
- **Body text escala mínimo en `2xl:`**: Sube de `text-lg` a `text-xl` solo en pantallas muy grandes para mantener el line-length ideal (45-75 chars) teniendo en cuenta el `max-w-7xl` del contenedor.
