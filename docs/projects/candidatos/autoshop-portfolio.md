# AutoShop Taller — Sitio + panel de administración en PHP puro (Consolidado)

> Fuente única de contenido para el portfolio. Editar aquí; luego se refleja en `data/projects.ts`.
> Última actualización: 2026-10-08
> ⚠️ **Sin repo publicado.** No existe repositorio público de este proyecto. Las métricas son afirmaciones propias, no datos verificables en código. Si se publica código sanitizado, se pueden extraer números reales como en one-click-ti.

---

## 1. Brief — Vista normal (card del grid)

| Campo | Valor |
| --- | --- |
| `id` | `autoshop` |
| `title` | AutoShop Taller |
| `category` | Full Stack / PHP |
| `hook` | Sitio web y panel de administración para un taller de servicios automotrices: el personal gestiona servicios, promociones por calendario y consultas sin depender de un desarrollador. |
| `metric` | CMS de gestión por módulos, sin código |
| `tags` | PHP · MySQL · JavaScript · Bootstrap · HTML5 |
| `image` | `/images/projects/autoshop/main.webp` |
| `imageAlt` | Hero de la landing de AutoShop Taller: logo, eslogan y navegación principal |
| `links` | — (sin repo publicado, sin URL live) |

> Nota: `CSS3` se quitó de los tags por redundante con Bootstrap, pero sigue declarando en Stack.

---

## 2. Detail — Vista detallada

### Headline

**El taller gestiona sus servicios, promociones y consultas sin depender de un desarrollador**

### Summary

Sitio web full-stack para un taller de servicios automotrices en Maravatío, Michoacán (prácticas profesionales, may – ago 2023). El taller no tenía presencia digital profesional ni forma de actualizar su propio contenido: cambiar un servicio o publicar una promoción requería abrir un ticket y esperar días. Construí la landing pública y un panel de administración con el que el personal gestiona servicios, promociones por calendario y consultas por sí mismo.

### Metrics

| Value | Label |
| --- | --- |
| 3 | módulos de gestión en el panel: servicios, promociones por calendario y consultas |
| 4 meses | de proyecto en producción para un taller real (may – ago 2023) |
| Sin frameworks | PHP, MySQL y JavaScript escritos a mano: SQL, sesiones y enrutado sin abstracciones que oculten el comportamiento |
| 2 | niveles de acceso (admin / staff), sin cuentas para clientes |

> Regla: el conteo de métricas debe ser par, porque `KpiGrid` usa 2 columnas (`sm:grid-cols-2` en `components/project-detail.tsx`). Con 3 métricas la tercera queda huérfana en la segunda fila.
>
> "Sin frameworks" va como texto, no como `0`. Un `0` en un KPI se lee como ausencia, no como virtud.

### Problem

El taller necesitaba dos cosas: una presencia pública profesional que le llamara clientes y una herramienta interna para actualizar su contenido. Antes, cambiar un servicio o publicar una promoción exigía intervención técnica, y el contenido se quedaba congelado entre visitas.

### Role

- Desarrollé el sitio full-stack completo en PHP, MySQL, JavaScript, Bootstrap y HTML5, sin framework.
- Construí el panel de administración que permite al personal no técnico gestionar servicios, promociones por calendario y consultas sin tocar código.
- Implementé dos niveles de acceso (admin / staff), sin cuentas de acceso para clientes.
- Acompañé al equipo administrativo para estructurar el contenido y la presentación de los servicios.

### Solution

- **Landing pública:** cara profesional del taller, orientada a captar clientes.
- **Panel de administración:** el personal gestiona servicios, promociones y consultas sin depender de un desarrollador.
- **Promociones por calendario:** el taller programa y publica promociones por fecha, sin que nadie tenga que editar código.
- **Control de acceso:** dos niveles (admin / staff); los clientes no necesitan cuenta para ver el catálogo.

### Stack

- **Backend:** PHP puro (sin framework)
- **Frontend:** HTML5, CSS3, JavaScript, Bootstrap
- **Base de datos:** MySQL

### Contexto de carrera

Primer proyecto en un entorno real, sobre fundamentos puros: PHP, SQL, sesiones y enrutado escritos a mano. Es el cimiento honesto de la curva que después pasa por Laravel/Vue y llega a Next.js/TypeScript.

### Gallery

| Archivo | Qué muestra |
| --- | --- |
| `HomeCensured.webp` | Portada de la landing pública |
| `ServiciosCensured.webp` | Catálogo de servicios del taller en la landing |
| `crud.webp` | Panel de administración: gestión de servicios y promociones |
| `main.webp` | Hero de la landing con el logo del taller |

> `main.webp` es también la imagen de la card. Se mantiene en la galería a propósito: la card no tiene galería dedicada con zoom, así que repetirla no genera hueco y completa la secuencia de pantallas.
> ~~`main.webp` se quitó de la galería~~ — se restauró: dejar la galería en 3 items se veía como un hueco.
>
> ⚠️ Los nombres `*Censured.webp` se conservaron porque las capturas tienen datos del cliente tapados. Renombrarlos es opcional.

### CTA

_"¿Tu negocio actualiza sus servicios o promociones con un desarrollador? Hablemos."_

---

## 3. Cambios aplicados (2026-10-08)

- **Métricas** — se eliminó `Días → minutos` (promesa sin baseline ni fuente) y `0 frameworks` (un `0` se lee como falha). Se agregaron `3` módulos, `4 meses` y `Sin frameworks`. Ahora las 4 son afirmaciones defendibles y el conteo es par.
- **Tags** — de 6 a 5, quitando `CSS3` por redundante con Bootstrap.
- **"Sin framework" ×6 → ×4** — desaparecieron de hook, summary, solution, architecture y CTA, que es donde se volvía dogma. Queda solo donde cumple función: `metric` de la card, la métrica del detail, `role` (qué construí) y `stack` (el stack).
- **"Promociones por calendario" subido a primer plano** — es el feature más específico del proyecto (resuelve un problema real del taller) y estaba enterrado en un bullet genérico.
- **Borrado** — "Tecnología honesta" y "fundamentos al desnudo" (poesía de marketing, no dicen nada verificable).
- **Gallery** — se restauraron las 4 imágenes. El `alt` duplicado literal entre `crud.webp` y `main.webp` se corrigió (era bug de accesibilidad), pero la repetición de `main.webp` se mantiene: repetir la imagen de la card es correcto aquí porque no hay galería dedicada con zoom.
- **`imageAlt` de la card corregido** — decía "Panel de administración de AutoShop", pero `main.webp` es el **hero de la landing** (logo, eslogan y navegación), no el panel. Verificado al ver la imagen.
- **Título** — el espejo decía "AutoShop" y `projects.ts` decía "AutoShop Taller". Unificado.
- **Summary** — deja de abrir con "prácticas profesionales" y de repetir "sin framework" dos veces; primero el problema, luego el outcome, al final el encuadre honesto.
- **CTA** — de curiosidad técnica a valor de cliente.