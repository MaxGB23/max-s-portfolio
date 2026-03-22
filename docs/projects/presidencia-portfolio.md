# Sistema de Gestión de Apoyos Sociales - Contenido para Portfolio

Este documento contiene la información estructurada lista para ser utilizada en tu portfolio. Se divide en dos secciones principales: la información breve para la tarjeta destacada en la vista inicial, y el contenido extenso para la futura página de detalle del proyecto.

---

## 1. Vista Inicial (Tarjeta Destacada / Hero Card)
*Esta es la información resumida precisa para captar la atención en la página principal, lista para `projects-section.tsx`.*

- **ID:** `presidencia`
- **Título:** Gestión de Apoyos Sociales
- **Categoría:** Full Stack / GovTech
- **Descripción Breve:** Plataforma web full-stack para digitalizar la gestión de solicitudes sociales en gobierno. Elimina procesos manuales, genera documentos legales y mejora la eficiencia operativa.
- **Etiquetas (Stack):** `["Next.js", "TypeScript", "PostgreSQL", "Prisma", "Tailwind CSS"]`
- **Alt de Imagen:** "Dashboard de métricas y gestión de solicitudes del Sistema de Apoyos Sociales"
- **Color de Fondo sugerido (`bgColor`):** `#F8FAFC` (Slate 50) o `#F1F5F9` (Slate 100) dependiendo de la paleta.

---

## 2. Vista Detallada (Página Individual del Proyecto)
*Contenido profundo para cuando el usuario haga clic en "Ver más".*

### Titular Principal
**Digitalización, Transparencia y Eficiencia Gubernamental**

### Resumen (Executive Summary)
Una plataforma Full-Stack escalable desarrollada para revolucionar la administración pública en la Presidencia Municipal de Acámbaro. Implementada para automatizar el ciclo completo de los apoyos sociales, logrando la digitalización total de los flujos de aprobación, mejorando significativamente los tiempos de respuesta y dotando al gobierno de paneles analíticos para la toma de decisiones en tiempo real.

### El Reto
Dependencia de procesos manuales intensivos en el uso de papel para la gestión de solicitudes ciudadanas. Esto ocasionaba tiempos de respuesta lentos, pérdida de trazabilidad administrativa, y una carencia total de reportes o métricas para evaluar la asignación de recursos y rendimiento institucional a corto plazo.

### La Solución
Se diseñó y lideró la creación de un sistema unificado y seguro que centraliza y agiliza las operaciones públicas:
- **Dashboard Estadístico:** Visualización interactiva con `Recharts` para monitorear tendencias, volumen de solicitudes y métricas clave (KPIs) institucionales.
- **Gestión Avanzada de Solicitudes:** Seguimiento de extremo a extremo con filtros complejos (estado, prioridad, área) y asignación controlada a departamentos específicos.
- **Módulo de Documentos Legales:** Generación automatizada de PDFs con validez legal, firma electrónica, y datos dinámicos pre-cargados a partir del expediente del ciudadano.
- **Seguridad y Control de Acceso (RBAC):** Autenticación escalable con `NextAuth` segmentando opciones y vistas según roles (ej., administradores, coordinadores departamentales).
- **Gestión Dinámica Institucional:** Ajuste flexible de autoridades, logotipos y plantillas sin necesidad de intervenir o refactorizar el código base para futuras administraciones.

### Stack Tecnológico
- **Frontend / Fullstack Framework:** Next.js, React
- **Lenguaje:** TypeScript
- **Base de Datos:** PostgreSQL (NeonDB)
- **ORM:** Prisma
- **Autenticación:** NextAuth
- **Componentes / UI:** Tailwind CSS, Shadcn UI, Recharts
- **Despliegue y Gestión:** Vercel, Jira (metodologías ágiles)

### Modalidades y Escalabilidad
El sistema fue construido con una sólida arquitectura enfocada en la persistencia y la configuración dinámica. Las plantillas y opciones administrativas pueden adaptarse fácilmente durante el cambio de periodos de gobierno o actualizarse para agregar nuevos departamentos y tipos de apoyo.

### Galería de Imágenes sugerida (Orden de presentación)
1. **Dashboard Inicial (KPIs):** Resumen analítico y gráficos de tendencias.
2. **Tabla de Gestión Institucional:** Listado avanzado de ciudadanos y estatus de sus trámites.
3. **Módulo de Generación PDF:** Vista previa del contrato de apoyo social completado.
4. **Panel de Administración (RBAC):** Asignación jerárquica de permisos.

### Llamado a la Acción (CTA sugerido al pie de este proyecto)
_"¿Buscas digitalizar procesos administrativos complejos o requieres software seguro a medida? Hablemos."_