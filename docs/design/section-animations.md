# Section Title Animations

> [!NOTE] Estado: CANONICO
> Fuente de verdad del codigo: `components/about-section.tsx`,
> `components/contact-section.tsx`, `components/pricing-section.tsx`,
> `components/products-section.tsx`, `components/featured-projects.tsx`,
> `components/all-projects.tsx`, `components/motion-primitives.tsx`.

## Patron unificado (GSAP)

Todas las secciones principales usan el mismo patron de animacion de entrada
para el header (titulo + descripcion):

| Propiedad | Valor |
|-----------|-------|
| Framework | GSAP (`useGsapAnimation`) |
| Direccion | Vertical (`y: 24` -> `y: 0`) |
| Duracion | `0.55s` |
| Ease | `power2.out` |
| Trigger | `scrollTrigger: { start: "top 80%" }` |
| Once | `true` (solo una vez) |

### Trigger `top 80%`

El trigger `top 80%` (antes `top 85%`) hace que la animacion dispare cuando
el header esta un 20% dentro del viewport, dando tiempo al usuario a leer la
seccion anterior sin distracciones.

## Excepciones documentadas

### Contact: CTA dentro del header

La seccion Contact es una excepcion al patron de "header y elementos no-title
por separado". Los botones CTA (LinkedIn, Email, GitHub) estan DENTRO del
`.contact-header` para que entren junto con el titulo y descripcion.

**Razon:** Contact es una seccion muy corta (una sola fila de botones). Si los
botones se animaran por separado, requeririan scroll adicional cerca del
footer, creando una experiencia donde los botones aparecen estaticos antes de
que se anime el titulo.

**Patron:** Todo el contenido de Contact (badge + titulo + descripcion + CTA)
se anima como un solo bloque con `y: 24, 0.55s, power2.out`.

### Featured: Framer + CSS transitions

Featured usa `FadeIn delayEnter` (Framer Motion) para el heading y CSS
`transition-all` para los panels. Es intencional: la seccion tiene un
one-slide rule documentado en `featured-projects.tsx` que requiere control
finamente granular de la visibilidad de cada panel.

### AllProjects: Framer Motion

AllProjects usa `FadeIn delayEnter` para el heading y `FadeInStagger
delayEnter` para el grid de cards. Es la seccion de proyectos no destacados,
no una seccion principal, por lo que usa la familia Framer en vez de GSAP.

### Hero: GSAP timeline on-load

Hero usa un GSAP timeline con stagger secuencial (portrait, badge, label,
title, description, chips, cta, scroll). No usa scrollTrigger porque es la
primera seccion y se anima on-load.

## Secciones por familia

| Familia | Secciones | Framework |
|---------|-----------|-----------|
| GSAP principal | Hero, About, Pricing, Contact | GSAP |
| Framer | AllProjects, Featured | Framer Motion + CSS |
| Legacy | Products (no se reintroduce) | GSAP |

## Cambios aplicados (2026-10-01)

1. **About:** trigger `top 85%` -> `top 80%`, ease `power3.out` ->
   `power2.out`, duracion `0.4` -> `0.55s`, direccion `x: 20` -> `y: 24`
2. **Products:** trigger `top 85%` -> `top 80%`
3. **Pricing:** trigger `top 85%` -> `top 80%`
4. **Contact:** Framer `FadeIn` reemplazado por GSAP `fromTo` con el patron
   unificado; CTA movido dentro del `.contact-header`
5. **About:** `min-h-[60dvh] portrait:min-h-[50dvh]` anadido para dar presencia
   visual en desktop; en portrait el alto minimo baja a 50% porque el 60%
   obligaba a un bloque desproporcionado antes del primer proyecto

## Deuda unica

- `motion-primitives.tsx` sigue exportando `FadeIn`, `FadeInStagger` y
  `FadeInItem`. Solo `FadeIn` se usa en `footer.tsx` y `featured-projects.tsx`.
  Si Contact vuelve a usar Framer en el futuro, el patron ya existe.
