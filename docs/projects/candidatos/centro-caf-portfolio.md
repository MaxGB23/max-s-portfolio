# CAF — Sistema de Gestión Clínica (Consolidado)

> Fuente única de contenido para el portfolio. Editar aquí; luego se refleja en `data/projects.ts`.
> Última actualización: 2026-10-05

---

## 1. Brief — Vista normal (tarjeta destacada)

| Campo | Valor |
| --- | --- |
| `id` | `caf` |
| `title` | Sistema de Gestión Clínica |
| `category` | Full Stack / SaaS |
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
- Implementé control de acceso por roles (RBAC) para flujos multi-usuario entre personal administrativo y fisioterapeutas.
- Reduje un 40% la latencia de recuperación de registros con un índice en `sessionDate` y caching server-side con `cache()` de React. La cifra es una estimación conservadora del salto de seq scan a index scan, no una medición en producción.
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
- **Seguridad y roles:** accesos por tipo de usuario y manejo seguro de sesiones.
- **Cuenta de usuario autocontrolada (perfil):** el propio usuario edita su **nombre** y **contraseña** desde su perfil, con una vista de tipo red social (foto de perfil y portada). El **correo queda bloqueado para el usuario**: tiene el input deshabilitado con un mensaje que indica solicitar el cambio a un administrador.

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

Arquitectura modular diseñada para escalar a múltiples especialidades (fisioterapia, psicología, nutrición, odontología) y funcionar como base tipo SaaS.

### Gallery

1. Landing pública (la más importante para clientes)
2. Agenda semanal
3. Perfil/expediente de paciente
4. Dashboard / analíticas
5. Gestión de paquetes (opcional)

### CTA

_"¿Buscas modernizar tu clínica o necesitas un sistema a medida? Hablemos."_