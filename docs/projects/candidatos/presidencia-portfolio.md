# Presidencia Municipal — Gestión de Apoyos Sociales (Consolidado)

> Fuente única de contenido para el portfolio. Editar aquí; luego se refleja en `data/projects.ts`.
> Última actualización: 2026-10-08

---

## 1. Brief — Vista normal (tarjeta destacada)

| Campo | Valor |
| --- | --- |
| `id` | `presidencia` |
| `title` | Gestión de Apoyos Sociales |
| `category` | Full Stack / GovTech |
| `hook` | Plataforma web full-stack para digitalizar la gestión de solicitudes sociales en gobierno. Elimina procesos manuales, genera documentos legales y mejora la eficiencia operativa. |
| `metric` | 100% digitalización del flujo de solicitudes |
| `tags` | Next.js · React · TypeScript · PostgreSQL · Prisma · Tailwind CSS |
| `image` | `/images/projects/presidencia-acambaro/presidencia-demo.webp` |
| `imageAlt` | Dashboard de métricas y gestión de solicitudes del Sistema de Apoyos Sociales |
| `links` | Repo: [Presidencia-Municipal-Acambaro](https://github.com/MaxGB23/Presidencia-Municipal-Acambaro) (público) |

---

## 2. Detail — Vista detallada

### Headline

**Digitalización, Transparencia y Eficiencia Gubernamental**

### Summary

Plataforma full-stack escalable construida para la Presidencia Municipal de Acámbaro, desarrollada durante una estadía profesional (enero – abril 2025). Lideré su creación para automatizar el ciclo completo de los apoyos sociales: digitalización total de los flujos de aprobación y paneles analíticos en tiempo real para la toma de decisiones institucionales.

### Metrics

| Value | Label |
| --- | --- |
| 100% | digitalización del flujo de solicitudes de apoyo social |
| 4 meses | de cero a producción en gobierno (estadía ene-abr 2025) |
| Trazable | cada solicitud registra quién la modificó |
| PDF legal | auto-generado del expediente y listo para imprimir; sin Word manual, solo faltan las firmas |

### Problem

El gobierno municipal dependía de procesos manuales intensivos en papel para gestionar las solicitudes ciudadanas. Esto ocasionaba tiempos de respuesta lentos, pérdida de trazabilidad administrativa y una carencia total de reportes o métricas para evaluar la asignación de recursos y el rendimiento institucional.

### Role

- Lideré el desarrollo de la plataforma completa: arquitectura, planificación, implementación y despliegue.
- Trabajé en un equipo de 2 personas bajo Scrum y Jira, a cargo del desarrollo del software durante la estadía universitaria.
- Diseñé y desarrollé la aplicación full-stack con Next.js, TypeScript, PostgreSQL y Prisma.
- Implementé autenticación y control de acceso por roles (RBAC) por departamento.
- Construí dashboards interactivos con Recharts y la generación dinámica de PDFs legales con datos autocompletados y espacios de firma para el ciudadano y la autoridad encargada.

### Solution

- **Dashboard estadístico:** visualización interactiva con Recharts para monitorear tendencias, volumen de solicitudes y KPIs institucionales.
- **Gestión avanzada de solicitudes:** seguimiento de extremo a extremo con filtros (estado, departamento, categoría del apoyo) y asignación controlada a departamentos. Cada solicitud concentra los datos del ciudadano y la subcategoría del apoyo, y la categoría orienta qué departamento debe gestionarla.
- **Módulo de documentos legales:** generación automatizada de PDFs con validez legal y datos dinámicos pre-cargados del expediente del ciudadano, con espacios de firma para el ciudadano y la autoridad encargada.
- **Seguridad y control de acceso (RBAC):** segmentación de opciones y vistas según roles (administradores, coordinadores departamentales), con validación en frontend, server actions y middleware.
- **Administración de usuarios:** CRUD de usuarios con roles y departamentos, reservado al rol admin.
- **Gestión dinámica institucional:** los datos precargados del PDF (logotipo, presidente municipal y cargos clave) se editan desde un CRUD para futuros documentos, sin intervenir el código base, pensado para los cambios de administración.

### Stack

- **Framework:** Next.js, React
- **Lenguaje:** TypeScript
- **Base de datos:** PostgreSQL (NeonDB)
- **ORM:** Prisma
- **Autenticación:** NextAuth
- **UI / Componentes:** Tailwind CSS, Shadcn UI, Recharts
- **Despliegue y gestión:** Vercel, Scrum + Jira

> **Nota de infraestructura:** la base de datos se migró a NeonDB porque era suficiente para el volumen de datos (la mención a Supabase del CV quedó obsoleta).

### Escalabilidad

Arquitectura orientada a la persistencia y la configuración dinámica: las plantillas y opciones administrativas se adaptan fácilmente durante cambios de periodo de gobierno, nuevos departamentos o tipos de apoyo, sin refactorizar el código base.

### Gallery

1. Dashboard inicial (KPIs): resumen analítico y gráficos de tendencias
2. Tabla de gestión institucional: listado avanzado de ciudadanos y estatus de trámites
3. Módulo de generación PDF: vista previa del contrato de apoyo social completado
4. Panel de administración (RBAC): asignación jerárquica de permisos

### CTA

_"¿Buscas digitalizar procesos administrativos complejos o requieres software seguro a medida? Hablemos."_