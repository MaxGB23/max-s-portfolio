# CAF — Puntos de venta (resumen de `docs/security-flow.md`)

> Destilado para debatir qué sube al portfolio. Cada punto es verificable en el repo `centro-caf`. Respetar `11.3 Qué NO decir`.

## 1. Doble perímetro, sin middleware deliberado
Layouts de servidor exigen sesión y rol antes de renderizar; cada Server Action y query sensible valida con guards. Sin `middleware.ts` a propósito: el Edge no puede validar sesiones de base de datos, solo mirar cookies. Vende criterio, no checklist.

## 2. Loop cerrado de usuarios
Sin registro público: el admin crea las cuentas. `role` y `position` con `input: false` — el cliente jamás puede auto-asignarse rol. Vende control operativo real en app privada.

## 3. Tres roles con guards dedicados
Admin (todo + usuarios), Editor (escritura operativa), Viewer (solo lectura). Guards `require*` para páginas (redirect) y `validate*` para actions (throw). Vende RBAC completo, no un `if` en el cliente.

## 4. Validación server-first + errores en español
Zod con `safeParse` antes de cualquier I/O, `ActionResult` tipado (éxito / error / advertencia confirmable) y mapeo central de errores Prisma y auth a mensajes en español. Vende disciplina de backend.

## 5. Caché con criterio de costo
Sesión deduplicada por request con `cache()` (una sola verificación por carga). Analíticas 16 h, histórico 1 semana, invalidación quirúrgica por tag y `revalidatePath` tras cada escritura. Vende que el rendimiento es decisión, no accidente.

## 6. SQL crudo sin inyección
Agregación semana/quincena/mes con `$queryRawUnsafe` pero valores siempre como parámetros `$1/$2` y fragmentos SQL construidos solo desde unión literal cerrada. Vende que lo peligroso se usa con jaula.

## 7. UX anti-error
Formularios con React Hook Form + Zod y diálogos de confirmación que frenan dobles reservas; estado URL validado con Zod + nuqs. Vende que la UX también defiende datos.

## 8. Arquitectura modular por features
`core` transversal, `modules` verticales por dominio, `app` solo routing. Una regla clínica cambia en una action; un mensaje, en `core/errors`. Vende mantenibilidad.

## 9. Frontera cliente-servidor explícita
`useSession` del cliente es solo presentacional; el `auth-client` solo inicia login. Toda autorización ocurre en el servidor. Vende que sabes dónde vive la verdad.

## 10. Límites honestos (también venden)
Single-tenant por diseño: todos los usuarios ven los datos de la única clínica — no venderlo como SaaS ni multi-tenant. Sin auditoría persistente (los forzados van a `console.info`). Vende madurez: declarar límites es senior.

## 11. Evidencia de iteración real
PR #22: el mensaje "sin cupo" distingue reactivación de límite general, y la advertencia de cita pendiente cubre también la reagenda directa. Vende que el sistema aprendió de uso real.
