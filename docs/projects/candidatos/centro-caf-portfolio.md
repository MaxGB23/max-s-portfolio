# CAF — Sistema de Gestión Clínica (Consolidado)

> Fuente única de contenido para el portfolio. Editar aquí; luego se refleja en `data/projects.ts`.
> Última actualización: 2026-08-28

---

## 1. Brief — Vista normal (tarjeta destacada)

| Campo | Valor |
| --- | --- |
| `id` | `caf` |
| `title` | Sistema de Gestión Clínica |
| `category` | Full Stack / SaaS |
| `hook` | Plataforma web full-stack en producción para la gestión integral de citas, pacientes y control de pagos en centros de salud. |
| `metric` | +8 meses en producción sin caídas |
| `tags` | Next.js · React · TypeScript · PostgreSQL · Prisma · Tailwind CSS |
| `image` | `/images/projects/prueba1.png` — ⚠️ reemplazar por screenshot real de mayor calidad |
| `imageAlt` | Dashboard principal y agenda del Sistema de Gestión Clínica |
| `links` | Live: TBD · Repo: [centro-caf](https://github.com/MaxGB23/centro-caf) (público) |

---

## 2. Detail — Vista detallada

### Headline

**Gestión Clínica Inteligente y Escalable**

### Summary

Plataforma web full-stack construida desde cero que reemplaza el uso de Excel y agendas manuales en un centro real de fisioterapia y rehabilitación. En uso diario por el staff médico con más de **8 meses en producción sin una sola caída**, incluso durante major releases con cambios críticos en la base de datos.

### Metrics

| Value | Label |
| --- | --- |
| +8 meses | en producción sin caídas, incluyendo major releases |
| 100% | uptime (Vercel + NeonDB) |
| -40% | latencia de recuperación de registros de pacientes (índices + caching server-side) |
| 0 | incidentes en migraciones con breaking changes de BD |
| Diario | uso del staff médico (administrativo y fisioterapeutas) |

### Problem

Las clínicas pequeñas y medianas dependen de herramientas genéricas, procesos manuales en papel o múltiples aplicaciones desconectadas para agendar, llevar historiales médicos y cobrar. Esto genera pérdidas de tiempo, dobles reservas y descontrol financiero. No existía una solución a medida accesible para centros que trabajan por sesiones o paquetes.

### Role

- Arquitecté un sistema modular por features usando Next.js, TypeScript y Prisma para mejorar mantenibilidad y acelerar la entrega de funcionalidades.
- Implementé control de acceso por roles (RBAC) para flujos multi-usuario entre personal administrativo y fisioterapeutas.
- Reduje un 40% la latencia de recuperación de registros introduciendo índices en PostgreSQL y estrategias de caching server-side.
- Desplegué y mantuve la plataforma en Vercel con NeonDB (PostgreSQL), logrando 100% de uptime en producción, incluyendo major releases con migraciones críticas de base de datos sin incidentes.
- Desarrollé la landing page pública integrada con el sistema interno; estable en uptime y generando contactos de nuevos pacientes.

### Solution

- **Agenda inteligente:** calendario interactivo con prevención automática de conflictos y control de sesiones (pendiente, asistida, cancelada).
- **Expediente electrónico:** alta y búsqueda rápida de pacientes, historial de sesiones y pagos, seguimiento individual.
- **Módulo financiero:** venta de paquetes de sesiones, balance por paciente y registro de ingresos.
- **Panel de control (dashboard):** analíticas de ingresos mensuales, pacientes activos, ganancias y métricas operativas, con filtros por periodo (30 días, 3 meses, 1 año) y tarjetas + gráficos.
- **Landing page pública:** optimizada para SEO, enfocada a captación de nuevos pacientes e integrada con el sistema interno.
- **Seguridad y roles:** accesos por tipo de usuario y manejo seguro de sesiones.

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