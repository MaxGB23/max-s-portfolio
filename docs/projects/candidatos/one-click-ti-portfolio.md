# One Click Ti — PWA de gestión y presencia digital (Consolidado)

> Fuente única de contenido para el portfolio. Editar aquí; luego se refleja en `data/projects.ts`.
> Última actualización: 2026-10-08
> ⚠️ Nombres: **One Click Ti** es la empresa (cliente); **ABMODEL** es solo el nombre del repo. Usar One Click Ti en el portfolio.
> ⚠️ El repo público es una versión parcial: el sistema de permisos por tipo de usuario (solo administradores editan) corresponde a la versión entregada al cliente, no al snapshot público.

---

## 1. Brief — Vista normal (card del grid)

| Campo | Valor |
| --- | --- |
| `id` | `one-click-ti` |
| `title` | One Click Ti — PWA |
| `category` | Full Stack / PWA |
| `hook` | PWA full-stack por contrato para una empresa de TI: catálogo de servicios con precios, captación de leads y panel de gestión en una app instalable. |
| `metric` | 5 módulos CRUD en una PWA instalable |
| `tags` | Laravel · Vue 3 · Inertia.js · MySQL · PHP |
| `image` | `/images/projects/oneclickti/proyectos.webp` |
| `imageAlt` | Catálogo de servicios publicado en la landing, con precio y categoría |
| `links` | Repo: [ABMODEL](https://github.com/MaxGB23/ABMODEL) (público, versión parcial) |

---

## 2. Detail — Vista detallada

### Headline

**Catálogo de servicios con precios y leads capturados, administrados desde una app instalable**

### Summary

PWA full-stack desarrollada por contrato para One Click Ti (Querétaro, sep – dic 2024) y con 4 meses de soporte en producción. Integra una landing pública con un panel de gestión interno donde el equipo publica servicios con precio y categoría, y donde los contactos que deja el formulario público llegan directo a la tabla de leads. El panel separa permisos: solo los administradores editan, el resto del equipo consulta.

### Metrics

| Value | Label |
| --- | --- |
| 5 | módulos CRUD completos: servicios, categorías, FAQs, contactos y usuarios |
| 4 meses | de soporte al cliente en producción (sep – dic 2024) |
| 17 | iconos y splash screens que cubren los tamaños que exigen iOS y Android |
| 3 | plataformas instalables desde el navegador: Android, iOS y escritorio, sin pasar por una app store |

### Problem

La empresa necesitaba dos cosas en una: una presencia pública profesional con su catálogo de servicios y una herramienta interna para administrarlo, sin mantener sistemas separados ni depender de un desarrollador para cambiar precios o actualizar el contenido. Los contactos que llegaban por el formulario público quedaban sueltos, sin consolidarse en un solo lugar. Y al ser una web, obligaba al cliente a entrar por un navegador cada vez.

### Role

- Desarrollé la PWA full-stack completa con Laravel 11, Vue 3, Inertia.js y MySQL.
- Construí el catálogo de servicios con precio y categoría, y el panel que lo administra con 5 módulos CRUD.
- Conecté el formulario público de contacto con la tabla de leads, para que cada contacto quede registrado sin intervención manual.
- Implementé la separación de permisos: solo los administradores editan; el resto del equipo consulta.
- Configuré la instalación como PWA: manifest con icono propio y pantalla de inicio propia, y service worker con precache de las secciones públicas.

### Solution

- **Catálogo de servicios:** cada servicio se publica con nombre, descripción, precio, imagen y categoría, sin tocar código.
- **Captación de leads:** el formulario público de contacto escribe directo en la tabla de contactos, que el mismo panel administra.
- **Panel de gestión:** 5 módulos CRUD completos —servicios, categorías, FAQs, contactos y usuarios— con filtros y paginación.
- **Permisos por tipo de usuario:** solo los administradores editan; el resto del equipo consulta sin poder modificar datos.
- **Auditoría de cambios:** cada registro guarda quién lo creó y quién lo actualizó, con claves foráneas a la tabla de usuarios.
- **App instalable, no una web más:** se instala desde el navegador como aplicación nativa en móvil y escritorio, con icono propio y pantalla de inicio propia, sin pasar por una app store.
- **Manifest y service worker:** 8 iconos y 9 splash screens que cubren los tamaños que exigen iOS y Android, precache de las 5 secciones públicas y estrategia network-first para los assets de Vite.

### Stack

- **Backend:** Laravel 11 (PHP)
- **Frontend:** Vue 3, Inertia.js
- **Base de datos:** MySQL
- **Despliegue:** Heroku (Procfile)
- **PWA:** manifest + service worker

### Contexto de carrera

Proyecto de la primera etapa profesional en Laravel + Vue y en el modelo PWA, anterior a la especialidad actual en Next.js/TypeScript. Deja la base de backend con framework y la adopción temprana de instalación web.

### Gallery

| Archivo | Qué muestra |
| --- | --- |
| `hero.webp` | Portada de la landing pública |
| `proyectos.webp` | Catálogo de servicios con precio y categoría |
| `contacto.webp` | Formulario público de contacto, origen de los leads |
| `crud.webp` | Panel de gestión interna con el CRUD de servicios |

> ⚠️ Capturas reales pendientes de actualizar al catálogo con precios.

### CTA

_"¿Necesitas un catálogo de servicios que tu equipo pueda actualizar sin depender de un desarrollador? Hablemos."_

---

## 3. Evidencia en el repo público (ABMODEL)

Verificado en `MaxGB23/ABMODEL` (público). Sirve de respaldo para lo que sí aparece en el snapshot:

- **7 migraciones**, 4 tablas de dominio (`categorias`, `servicios`, `faqs`, `contactos`) + `users`, `sessions`, `jobs`, `cache`.
- **16 controllers**; 5 recursos REST (`users`, `categorias`, `faqs`, `contactos`, `servicios`).
- `servicios`: `servicio`, `descripcion`, `precio decimal(10,2)`, `image_path`, FK `categoria_id`, FK `created_by` y `updated_by`.
- `ContactoController::store()` y `::add()` escriben con `Contacto::create($request->validated())` → leads del formulario público a la tabla del panel.
- **PWA real:** `public/manifest.json` con 8 iconos y 9 splash screens; `public/sw.js` precachea las 5 rutas públicas y usa network-first para `/build/assets/`.
- **Procfile** de Heroku presente.
- **32 páginas Vue** en `resources/js/Pages`.

⚠️ Lo que NO aparece en el snapshot público: la separación de permisos por tipo de usuario (columna `role`, Gates o middleware de admin). Ese sistema corresponde a la versión entregada al cliente.

> Nota de higiene: el repo público conserva tres árboles Vue duplicados (`Components/`, `TempComponent/`, `TempComponents/`) que son archivos muertos. No afecta al portfolio, pero conviene saberlo antes de usar ese repo como referencia de código limpio.