# CAF — Sistema de Gestión Clínica (Consolidado)

> Fuente única de contenido para el portfolio. Editar aquí; luego se refleja en `data/projects.ts`.
> Última actualización: 2026-10-05

---

## 1. Brief — Vista normal (tarjeta destacada)

| Campo | Valor |
| --- | --- |
| `id` | `caf` |
| `title` | Sistema de Gestión Clínica |
| `category` | Full Stack / HealthTech |
| `hook` | Plataforma web full-stack en producción para la gestión integral de citas, pacientes y control de pagos en centros de salud. |
| `metric` | +10 meses en producción sin caídas |
| `tags` | Next.js · React · TypeScript · PostgreSQL · Prisma · Tailwind CSS |
| `image` | `/images/projects/caf/caf-demo.webp` |
| `imageAlt` | Dashboard principal y agenda del Sistema de Gestión Clínica |
| `links` | Landing: [centrocafacambaro.vercel.app](https://centrocafacambaro.vercel.app) · App: [caf-usage-test.vercel.app/dashboard](https://caf-usage-test.vercel.app/dashboard) · Repo: [centro-caf](https://github.com/MaxGB23/centro-caf) (público) · [centro-caf-landing](https://github.com/MaxGB23/centro-caf-landing-page) |
---

## 2. Detail — Vista detallada

### Headline

**Gestión Clínica Inteligente y Escalable**

### Summary

Plataforma web full-stack construida desde cero que reemplaza el uso de Excel y agendas manuales en un centro real de fisioterapia y rehabilitación. En uso diario por el staff médico con más de **10 meses en producción sin una sola caída**, incluso durante major releases con cambios críticos en la base de datos.

### Metrics

| Value | Label |
| --- | --- |
| +10 meses | en producción sin caídas, incluyendo major releases |
| 100% | uptime: el cliente nunca ha reportado una caída |
| -40% | latencia de recuperación de registros de pacientes (estimada sobre el salto a índice + cache()) |
| En uso diario | por staff real en clínica en producción (admin + fisios) |

### Problem

Las clínicas pequeñas y medianas dependen de herramientas genéricas, procesos manuales en papel o múltiples aplicaciones desconectadas para agendar, llevar historiales médicos y cobrar. Esto genera pérdidas de tiempo, dobles reservas y descontrol financiero. No existía una solución a medida accesible para centros que trabajan por sesiones o paquetes.

### Role

- Arquitecté un sistema modular por features usando Next.js, TypeScript y Prisma para mejorar mantenibilidad y acelerar la entrega de funcionalidades.
- Implementé control de acceso por roles (Admin, Editor, Viewer) con doble perímetro: layouts de servidor exigen sesión y rol antes de renderizar y cada Server Action valida con guards; sin registro público (el admin crea las cuentas y el rol no se fija desde el cliente) y sin middleware deliberado, porque el Edge no puede validar sesiones de base de datos.
- Reduje un 40% la latencia de recuperación de registros con un índice en `sessionDate` y caching server-side con `cache()` de React. La cifra es una estimación conservadora del salto de seq scan a index scan, no una medición en producción.
- Validé cada mutación con Zod en el servidor antes de cualquier I/O, con resultado tipado y errores centralizados en español; los conflictos de agenda responden advertencia confirmable en dos pasos, y el frontend solo muestra mensajes amigables, nunca errores crudos del backend.
- Apliqué cero confianza en el input: cupo del paquete, pendiente única y choques de horario se verifican en el servidor, y hasta el ID para revalidar se lee de la base de datos, nunca del cliente.
- Usé SQL crudo solo con jaula: valores siempre como parámetros y fragmentos construidos desde una unión cerrada, sin camino del input al query.
- Blindé la UX ante fallos: los boundaries traducen errores de auth a pantallas accionables y los 404 contextuales devuelven al dashboard, nunca una pantalla en blanco.
- Migré los nombres y precios que vivían hardcodeados en un combobox a una UI de paquetes CRUD que los actualiza, con migraciones de Prisma sobre datos existentes. El cliente necesitaba subir precios por la inflación del país y los valores hardcodeados lo impedían. Las migraciones se aplicaron en producción sin un solo incidente de datos: ningún paquete legacy se rompió.
- En paralelo descarté una branch completa que no cumplía los estándares del proyecto, antes de que llegara a producción.
- Desplegué y mantengo la plataforma en Vercel con NeonDB (PostgreSQL) hace más de 10 meses, sin que el cliente haya reportado una sola caída.
- Desarrollé la landing page pública integrada con el sistema interno; estable en uptime y generando contactos de nuevos pacientes.

### Solution

- **Agenda inteligente:** calendario interactivo con prevención automática de conflictos y control de sesiones (pendiente, asistida, cancelada).
- **Expediente electrónico:** alta y búsqueda rápida de pacientes, historial de sesiones y pagos, seguimiento individual.
- **Módulo financiero:** venta de paquetes de sesiones, balance por paciente y registro de ingresos. Los paquetes se administran desde una UI CRUD (`src/modules/package-definitions/`) en lugar de valores hardcodeados, lo que permite actualizar precios sin desplegar — necesario para responder a la inflación del mercado.
- **Panel de control (dashboard):** analíticas de ingresos mensuales, pacientes activos, ganancias y métricas operativas, con filtros por periodo (30 días, 3 meses, 1 año e histórico), cache con refresh manual y tarjetas + gráficos. El histórico usa cache extendido por costo.
- **Landing page pública:** optimizada para SEO, enfocada a captación de nuevos pacientes e integrada con el sistema interno.
- **Seguridad y roles:** doble perímetro con layouts y guards por rol (Admin, Editor, Viewer), loop cerrado sin registro público y autorización siempre en el servidor; el cliente solo presenta, nunca autoriza.
- **Perfil del usuario:** el propio usuario edita su **nombre** y **contraseña** desde su perfil, con una vista de tipo red social (foto de perfil y portada). El **correo queda bloqueado para el usuario**: tiene el input deshabilitado con un mensaje que indica solicitar el cambio a un administrador.

### Arquitectura (grafo del detalle)

Espejo de `detail.architecture` en `data/projects.ts`, que renderiza la vista "Grafo Arquitectura". **Si editas la sección Solution, edita también este bloque y el `.ts` en la misma work unit**: son la misma información en dos superficies y ya se desincronizaron una vez.

- **Raíz — Sistema de Gestión Clínica:** Plataforma de gestión clínica en producción con arquitectura modular por features: módulos verticales por dominio (agenda, clientes, paquetes, pagos, sesiones, usuarios) sobre un núcleo transversal de autenticación, base de datos y errores.
  - **Agenda inteligente:** Calendario interactivo con prevención automática de conflictos y control de sesiones (pendiente, asistida, cancelada).
    - Prevención automática de conflictos
    - Control de sesiones
  - **Expediente electrónico:** Alta y búsqueda rápida de pacientes, historial de sesiones y pagos, seguimiento individual.
  - **Módulo financiero:** Venta de paquetes de sesiones, balance por paciente y registro de ingresos. Los paquetes y sus precios se administran desde una UI CRUD, así que subirlos no exige desplegar código.
    - Paquetes de sesiones
    - Balance por paciente
    - Registro de ingresos
    - Paquetes y precios editables sin deploy
  - **Panel de control (dashboard):** Analíticas de ingresos mensuales, pacientes activos, ganancias y métricas operativas, con tarjetas y gráficos.
    - Analíticas mensuales
    - Filtros por periodo (30 días, 3 meses, 1 año e histórico)
    - Cache con refresh manual
  - **Seguridad y roles:** Doble perímetro con layouts de servidor y guards por rol: la autorización se resuelve siempre en el servidor y el cliente solo presenta, nunca autoriza.
    - Roles: Admin, Editor y Viewer
    - Layouts de servidor exigen sesión y rol antes de renderizar
    - Guards en cada Server Action y query sensible
    - Sin registro público: el admin crea las cuentas y el rol no se fija desde el cliente
  - **Endurecimiento por capas:** Validación y fallo seguro en cada mutación: nada se confía desde el cliente y ningún error crudo llega al usuario.
    - Zod con safeParse antes de cualquier I/O
    - Cupo, cita pendiente y choques de horario verificados en el servidor
    - SQL solo con parámetros y fragmentos de una unión cerrada
    - Errores de auth y 404 contextuales con salida accionable
  - **Estructura modular por capas:** Routing, dominio y transversalidad separados, para que una regla clínica se cambie en un solo lugar.
    - app: solo routing, layouts y páginas, sin lógica de negocio
    - modules: vertical por dominio (actions, schemas, queries, componentes)
    - core: transversal (auth, db, errores, proveedores, UI)
    - shared: utilidades usadas por dos o más módulos
  - **Perfil del usuario:** El usuario edita su nombre y contraseña desde su perfil, con vista de foto de perfil y portada. El correo queda bloqueado y su cambio se solicita a un administrador.
  - **Landing page pública:** Optimizada para SEO, enfocada a captación de nuevos pacientes e integrada con el sistema interno.

Fuente de la verificación técnica: `docs/projects/caf-seguridad/security-flow.md` (documentado contra `2c8207c`).

### Decisiones de diseño

- **El correo no se edita desde el perfil del usuario.** Es el identificador único que ata la trazabilidad de cada cuenta (historial, pagos, permisos); permitir cambiarlo libremente rompería esa trazabilidad y generaría ambigüedad entre registros. Por eso el input aparece deshabilitado con un mensaje que remite a solicitar el cambio a un administrador, quien lo gestiona centralizadamente.
- **La vista de perfil usa estética de red social** (foto de perfil y portada) para que la cuenta se sienta propia y moderna. En la demo las imágenes son estáticas: el upload real a storage quedó como siguiente paso, priorizando features de negocio sobre el mantenimiento de un storage en línea.

### Notas de veracidad (auditoría 2026-10-05 contra MaxGB23/centro-caf)

Estos puntos son **hechos verificados**. No reintroducirlos sin volver a comprobar.

- **NeonDB es la base de datos real**, no Supabase. El README de `centro-caf` dice Supabase y está mal; el portfolio dice bien. El README lo actualiza el dueño al final, no este repo.
- **`-40%` es una estimación, no una medición.** El mecanismo sí es real y verificable: migración `20260220200602_add_session_date_index` (`CREATE INDEX session_records_sessionDate_idx`) + `cache()` de React en `core/auth/guards.ts`. La magnitud es una estimación conservadora del salto de seq scan a index scan. Se conserva el número porque ya figura en el CV del dueño y la cifra va acompañada de su base. **No presentarlo como medición en producción.**
- **`100%` de uptime y ~10 meses son reales.** El cliente nunca ha reportado que la página esté caída. La cifra no viene de un SLO medido sino de la ausencia de reportes de caída del cliente — por eso el copy dice "el cliente nunca ha reportado una caída" y no "100% uptime" a secas.
- **La migración de paquetes CRUD SÍ ocurrió y es verificable.** Evidencia en el repo: `prisma/migrations/20260209033856_add_package_definitions_and_string_type`, `prisma/migrations/20260209040259_update_positions_and_package_status`, el módulo `src/modules/package-definitions/` (create/update/delete/archive) y el modelo `PackageDefinition`. Sustituyó nombres y precios hardcodeados en un combobox.
- **La migración llegó a producción y funciona.** `docs/poduction-fails/feature-package-defs.md` registra un fallo de deploy *posterior*, ya clonado el repo en otra máquina: las dos migraciones se aplicaron correctamente (`All migrations have been successfully applied`) y lo que falló fue el **build** — Turbopack no resolvía `@/core/db/generated/prisma` porque el Prisma Client se generaba en una ruta personalizada. Al ser un fallo de build, el deploy quedó **bloqueado**: nada defectuoso llegó a producción. **No mencionarlo en el portfolio.** Un deploy bloqueado es el gate funcionando, no un incidente de producción, y lo que sí llegó a producción no ha fallado según los reportes del cliente. Decisión del dueño, 2026-10-05.
- **Cal.com NO está implementado.** 0 referencias a `cal` en `src/`, sin dependencia en `package.json`, `src/app/api/` solo contiene `auth` (sin webhooks) y el roadmap del README lo tiene sin marcar (`- [ ] Calendario de citas sincronizado con Cal.com`). La sección "Integraciones / Cal.com" del README es aspiracional → **no añadir Cal.com a `tags` ni a `stack`**.
- **nuqs sí es real** (`nuqs ^2.8.6`) pero no se lista en `tags`: la lista es sobria por decisión de diseño, no exhaustiva.
- **El repo legacy `Centro-CAF-Acambaro` ya está en private.** El problema de dos repos públicos quedó resuelto.

### Stack

- **Framework:** Next.js, React
- **Lenguaje:** TypeScript
- **Base de datos:** PostgreSQL (NeonDB)
- **ORM:** Prisma
- **Estilos:** Tailwind CSS
- **Despliegue:** Vercel

### Escalabilidad

Arquitectura modular diseñada para crecer hacia más especialidades (fisioterapia, psicología, nutrición, odontología).

> **No reintroducir "base tipo SaaS" ni "multi-tenant".** `security-flow.md:368` lo prohíbe explícitamente: el modelo es single-tenant por diseño, no existe `userId` en las entidades de dominio y cualquier usuario autenticado ve todos los pacientes de la clínica.

### Gallery

1. Landing pública (la más importante para clientes)
2. Agenda semanal
3. Perfil/expediente de paciente
4. Dashboard / analíticas
5. Gestión de paquetes (opcional)

### CTA

_"¿Buscas modernizar tu clínica o necesitas un sistema a medida? Hablemos."_