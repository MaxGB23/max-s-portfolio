# Flujo de Seguridad y Arquitectura — Centro CAF Acámbaro

> Versión documentada: `2c8207c` (Merge PR #22, versión final a producción).
> Artefacto de portfolio: describe el flujo real implementado en el repositorio, no una propuesta.
> Idioma: títulos y explicación en español; código, identificadores y nombres técnicos en inglés.

---

## 1. Resumen ejecutivo

Centro CAF Acámbaro es un dashboard interno (Next.js App Router + Better Auth + Prisma + PostgreSQL) para la gestión de pacientes, paquetes de sesiones, pagos y agenda de una sola clínica. La seguridad se apoya en dos perímetros complementarios:

1. **Layouts de servidor** que exigen sesión y rol antes de renderizar (`src/app/(dashboard)/layout.tsx`, `src/app/(dashboard)/dashboard/(administracion)/layout.tsx`).
2. **Guards en cada Server Action y query sensible** (`src/core/auth/guards.ts`), que validan la sesión contra la base de datos en el servidor.

**Por qué no hay `middleware.ts`.** Es una decisión deliberada, alineada con la documentación de Next.js y Better Auth:

- El Edge Runtime de un middleware no puede validar de forma confiable una sesión almacenada en base de datos; solo puede inspeccionar cookies sin verificar. La documentación de Better Auth recomienda la validación de sesión en el servidor (`auth.api.getSession` con `headers()`) como fuente de verdad.
- La defensa real vive donde se ejecuta el código sensible: layouts de servidor (redirect) y Server Actions/queries (throw). Un middleware que solo mirara cookies daría una falsa sensación de seguridad sin reducir la superficie de ataque.
- Aclaración importante: **las cookies siguen existiendo**. El plugin `nextCookies()` (`src/core/auth/auth.ts:31`) permite que las Server Actions y los Server Components lean y escriban las cookies de sesión en Next.js. Lo que no se hace es *confiar* en la cookie sin validarla: cada guard llama a `auth.api.getSession({ headers: await headers() })` (`src/core/auth/guards.ts:38-42`), que resuelve la sesión en el servidor contra PostgreSQL.

Contexto histórico: `.agent/implementation_plans/SECURITY_AUDIT.md` (enero 2026) detectó Server Actions sin validación de sesión y rutas sin perímetro como riesgo alto; `.agent/implementation_plans/RBAC_Implementation_Summary.md` documenta la posterior implementación de RBAC con `requireAdmin()` / `validateAdmin()`. Este documento describe el estado final que cerró esas brechas.

---

## 2. Autenticación con Better Auth

### 2.1 Configuración del servidor

Fuente: `src/core/auth/auth.ts:1-36`.

```ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import prisma from "@/core/db/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
  },
  user: {
    additionalFields: {
      role: { type: "string", input: false },
      position: { type: "string", input: false },
    },
  },
  plugins: [nextCookies()],
});
```

Puntos clave:

| Aspecto | Decisión | Ubicación |
|---|---|---|
| Adaptador | `prismaAdapter` contra PostgreSQL | `src/core/auth/auth.ts:7-9` |
| Estrategia | `emailAndPassword` con `autoSignIn: false` (el registro no inicia sesión automáticamente) | `src/core/auth/auth.ts:11-14` |
| Campos extendidos | `role` y `position` con `input: false`: existen en el tipo de sesión pero **no** pueden fijarse desde el cliente en el registro | `src/core/auth/auth.ts:19-30` |
| Cookies en Next.js | Plugin `nextCookies()` para leer/escribir cookies de sesión en Server Components y Server Actions | `src/core/auth/auth.ts:31` |
| Tipos inferidos | `Session` y `User` derivados de `typeof auth.$Infer.Session` | `src/core/auth/auth.ts:34-35` |

`input: false` es una defensa relevante: el rol solo se asigna vía Prisma en el servidor (por ejemplo, el flujo de creación de usuarios de Admin descrito en `RBAC_Implementation_Summary.md`), nunca desde un formulario público.

### 2.2 Obtención de sesión en el servidor

Todos los guards comparten un helper interno con `cache()` de React (`src/core/auth/guards.ts:38-42`):

```ts
const getSession = cache(async (): Promise<AuthContext | null> => {
  return await auth.api.getSession({
    headers: await headers(),
  });
});
```

- `headers()` aporta las cookies de la petición actual.
- `cache()` deduplica la validación **por request**: aunque un layout, una página y varias actions llamen a guards en el mismo render, la verificación contra la base de datos se ejecuta una sola vez.
- Alcance estrictamente por request: no hay intercambio de sesiones entre usuarios (ver sección 10).

### 2.3 Cliente: solo UI

Fuente: `src/core/auth/auth-client.ts:1-10`, `src/app/(auth)/login/login-form.tsx:63-67`.

- El cliente se crea con `createAuthClient` de `better-auth/react` más `inferAdditionalFields<typeof auth>()` para tipar `role`/`position`.
- `authClient.signIn.email()` solo inicia el flujo de login; la autorización posterior siempre ocurre en el servidor.
- `authClient.useSession()` (usado en `AppSidebar`) es **presentacional**: muestra el nombre o el rol, pero nunca decide acceso. La auditoría histórica lo marcó explícitamente como "solo validación visual" (`SECURITY_AUDIT.md:20-21`).
- El formulario de login valida formato con Zod en el cliente (`signInSchema`, `login-form.tsx:27-31`), sanitiza el destino (`redirect?.startsWith("/")`, `login-form.tsx:59`) y traduce errores del servidor con `getErrorMessage(error.code)` (`login-form.tsx:71-74`).
- La página `/login` es un Server Component que redirige a `/dashboard` si ya existe sesión (`src/app/(auth)/login/page.tsx:6-14`), evitando mostrar el login a usuarios autenticados.

---

## 3. Layouts como perímetro

### 3.1 Perímetro autenticado: `(dashboard)/layout.tsx`

Fuente: `src/app/(dashboard)/layout.tsx:7-30`.

```tsx
export default async function DashboardLayout({ children }) {
  const { user } = await requireSession(); // Handles session check & redirect
  return (
    <SidebarProvider ...>
      <AppSidebar user={user} variant="inset" />
      ...
    </SidebarProvider>
  );
}
```

- Toda ruta bajo el grupo `(dashboard)` exige sesión antes de renderizar cualquier hijo.
- `requireSession()` redirige a `/login` si no hay sesión (`src/core/auth/guards.ts:52-60`).

### 3.2 Perímetro Admin: `(administracion)/layout.tsx`

Fuente: `src/app/(dashboard)/dashboard/(administracion)/layout.tsx:1-11`.

```tsx
export default async function AdminLayout({ children }) {
  await requireAdmin();
  return <>{children}</>;
}
```

- Las rutas de administración (por ejemplo, gestión de usuarios en `/dashboard/registro`) exigen rol `Admin`; cualquier otro rol autenticado es redirigido a `/dashboard` (`src/core/auth/guards.ts:66-74`).

### 3.3 Redirect frente a throw

- **Layouts y páginas** usan guards `require*`: llaman a `redirect()` de Next.js. `redirect` funciona lanzando una excepción interna `NEXT_REDIRECT` que el router interpreta; por eso estos guards solo son válidos en Server Components, layouts y páginas, nunca en un `try/catch` de negocio ni en el cliente.
- **Server Actions y queries** usan guards `validate*`: lanzan `UnauthorizedError` / `ForbiddenError`, que el manejador central convierte en `ActionResult` o deja escalar al Error Boundary (ver secciones 4 y 9).

---

## 4. Guards: tabla completa

Fuente única: `src/core/auth/guards.ts:1-139`. El archivo declara `"server-only"` (`guards.ts:1`), por lo que cualquier importación desde un Client Component falla en compilación: **cero leak de lógica de sesión al bundle del cliente**.

### 4.1 Firmas

| Guard | Firma | Efecto sin autorización | Dónde usarlo |
|---|---|---|---|
| `requireSession` | `(): Promise<AuthContext>` | `redirect("/login")` | Layouts y páginas que exigen login |
| `requireAdmin` | `(): Promise<AuthContext>` | `redirect("/dashboard")` si `role !== "Admin"` | Layouts y páginas solo-Admin |
| `requireEditorOrAdmin` | `(): Promise<AuthContext>` | `redirect("/dashboard")` si rol no está en `["Admin", "Editor"]` | Páginas de escritura (clínica, agenda) |
| `validateSession` | `(): Promise<AuthContext>` | `throw new UnauthorizedError()` | Toda Server Action y query sensible |
| `validateAdmin` | `(): Promise<AuthContext>` | `throw new ForbiddenError()` si `role !== "Admin"` | Actions de usuarios, definiciones de paquete |
| `validateEditorOrAdmin` | `(): Promise<AuthContext>` | `throw new ForbiddenError()` si rol es `Viewer` | Actions de clientes, paquetes, sesiones, pagos |

Definiciones exactas:

- `requireSession` — `guards.ts:52-60`.
- `requireAdmin` — `guards.ts:66-74`.
- `requireEditorOrAdmin` — `guards.ts:80-90`.
- `validateSession` — `guards.ts:100-108`.
- `validateAdmin` — `guards.ts:114-122`.
- `validateEditorOrAdmin` — `guards.ts:128-139`.

### 4.2 Reglas de uso

1. **Páginas y layouts → `require*`.** Nunca `validate*` en un Server Component de página: un `throw` mostraría el Error Boundary en lugar de redirigir.
2. **Server Actions, queries y Server Functions invocables → `validate*`.** Nunca `redirect()` dentro de una action que retorna `ActionResult`: rompería el contrato tipado con el cliente.
3. **`Viewer` es solo lectura operativa.** Puede ver el dashboard y ejecutar queries de lectura (`validateSession`), pero cualquier mutación exige `validateEditorOrAdmin` o `validateAdmin`.
4. **Jerarquía interna:** `requireAdmin` y `requireEditorOrAdmin` delegan en `requireSession` (`guards.ts:67,81`); `validateAdmin` y `validateEditorOrAdmin` delegan en `validateSession` (`guards.ts:115,129`). La verificación de existencia de sesión vive en un solo lugar.

### 4.3 Rendimiento y aislamiento

El comentario de arquitectura en `guards.ts:25-37` lo documenta en el código: `cache()` es de alcance por request (aislamiento: ningún dato se comparte entre usuarios o peticiones HTTP) y deduplica la consulta (eficiencia: una sola verificación por carga de página aunque se invoque desde layout, página y componentes).

---

## 5. Server Actions: patrón estándar

### 5.1 El patrón, paso a paso

Toda mutación sigue la misma secuencia (ver `src/modules/clients/actions/create-client.ts:1-46`, `src/modules/packages/actions/create-package.ts:1-91`, `src/modules/sessions/actions/update-session.ts:18-167`):

1. `"use server"` en la primera línea.
2. **Validación Zod con `safeParse`** antes de cualquier I/O. Si falla, retorno temprano con `VALIDATION_ERROR` sin tocar la base de datos (`create-client.ts:14-22`).
3. **Guard de autorización** como primera sentencia del `try` (`await validateEditorOrAdmin()`, `create-client.ts:25`; `create-package.ts:27`; `update-session.ts:30`).
4. **Lógica Prisma**: lecturas de existencia, reglas de dominio (cupo, cita pendiente, conflicto de horario), escrituras.
5. **Errores de dominio esperados** como retornos tipados (`{ success: false, code, error }` o `{ success: false, warning }`), no como excepciones.
6. **Excepciones inesperadas** delegadas a `handleActionError(error)` en el `catch` (`create-client.ts:43-45`).
7. **`revalidatePath`** tras mutación exitosa para invalidar la caché del router (`create-client.ts:41`, `create-package.ts:85`, `update-session.ts:161`).

### 5.2 `ActionResult` tipado

Fuente: `src/types/index.ts:1-10`.

```ts
export type ActionWarning = {
  code: string;
  message: string;
  data?: any;
};

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; code: string; error: string; warning?: never }
  | { success: false; warning: ActionWarning; code?: string; error?: string };
```

Tres estados exhaustivos: éxito con datos, error recuperable con código traducible, o advertencia que requiere confirmación del usuario (ver 5.4). El cliente siempre puede discriminar con `result.success` y `result.warning`.

### 5.3 Ejemplos con ubicación exacta

- **Crear cliente** — `src/modules/clients/actions/create-client.ts:13-46`: `createClientFormSchema.safeParse` → `validateEditorOrAdmin()` → `prisma.client.create` → `revalidatePath("/dashboard", "page")`.
- **Crear paquete** — `src/modules/packages/actions/create-package.ts:15-91`: valida definición contra caché (`getCachedPackageDefinitions`, `create-package.ts:32-33`), verifica que el paquete esté `Activo` (`create-package.ts:43-49`), confirma que el cliente exista (`create-package.ts:51-62`), termina paquetes activos previos (`create-package.ts:65-73`), crea el nuevo y revalida `/dashboard/cliente/${id}` (`create-package.ts:85`).
- **Actualizar sesión** — `src/modules/sessions/actions/update-session.ts:18-167`: caso complejo con tres reglas de dominio encadenadas (cupo del paquete, cita pendiente única, conflicto de horario por hora CDMX) antes del `prisma.sessionRecord.update` (`update-session.ts:152-158`) y `revalidatePath(/dashboard/cliente/${realClientId})` (`update-session.ts:161`). El `clientId` para revalidar se lee de la base de datos (`update-session.ts:74`), nunca del input del cliente.

### 5.4 Advertencias confirmables (flujo de doble paso)

`update-session.ts` no solo falla o escribe: puede responder `{ success: false, warning: { code, message, data } }` para `PENDING_SESSION_EXISTS` (`update-session.ts:87-99`) y `SCHEDULE_CONFLICT` (`update-session.ts:133-145`). El cliente muestra el diálogo de confirmación correspondiente y, si el usuario fuerza la acción, reintenta con `skipWarningCodes` incluyendo el código aceptado. Cada forzado queda registrado con `console.info("[AUDIT] ...")` (`update-session.ts:101-104,146-150`). Es el mecanismo anti-doble-pendiente y anti-doble-reserva de la agenda.

### 5.5 Manejo central de errores

Fuente: `src/core/errors/handle-action-error.ts:1-28`, `src/core/errors/error-mapping.ts:1-104`.

- `handleActionError` registra el error técnico completo (`console.error`), intenta mapearlo a un error de dominio conocido y, si lo logra, retorna `ActionResult` con mensaje en español. Si no lo reconoce, lo **lanza** para que el Error Boundary lo capture: un fallo desconocido nunca se disfraza de error recuperable.
- `mapToAppError` traduce `UnauthorizedError`/`ForbiddenError` (`error-mapping.ts:28-40`), Prisma `P2002`/`P2025`/`P2003` (`error-mapping.ts:45-66`), errores de Better Auth por `body.code` (`error-mapping.ts:70-76`) y códigos legacy por mensaje (`error-mapping.ts:79-84).

---

## 6. Queries: protección y el caso `$queryRawUnsafe`

### 6.1 Cómo se protegen las lecturas

Dos mecanismos, según el caso:

1. **Queries invocadas desde Server Components ya protegidos** heredan el perímetro del layout (`requireSession` en `(dashboard)/layout.tsx`). La página no se renderiza sin sesión, así que sus lecturas hijas no son alcanzables sin autenticación.
2. **Queries invocables directamente (Server Functions / actions de lectura)** se protegen a sí mismas con `validateSession()`. Es el caso de analytics: `getAnalyticsBaseStats` (`src/modules/clients/queries/analytics/get-analytics-data.ts:56-59`), `getHistoricalAnalytics` (`get-analytics-data.ts:80-83`) y `getGroupedAnalyticsData` (`get-analytics-data.ts:213-221`) llaman a `validateSession()` antes de tocar la caché o Prisma. `getChartDataAction` añade su propia validación (`src/modules/clients/queries/analytics/get-chart-data.ts:14-15`).

### 6.2 Analytics con SQL parametrizado

Fuente: `src/modules/clients/queries/analytics/get-analytics-data.ts:88-221`.

La agregación por semana/quincena/mes usa `prisma.$queryRawUnsafe` con dos consultas (`clientsQuery`, `earningsQuery`) ejecutadas en paralelo (`get-analytics-data.ts:164-175`):

```ts
const [clientsData, earningsData] = await Promise.all([
  prisma.$queryRawUnsafe<{ date: string; count: bigint }[]>(
    clientsQuery, startDate, endDate,
  ),
  prisma.$queryRawUnsafe<{ date: string; amount: bigint }[]>(
    earningsQuery, startDate, paymentEndDate ?? endDate,
  ),
]);
```

**Riesgo** (ya identificado en `SECURITY_AUDIT.md:59-70`): la variante `Unsafe` más interpolación de fragmentos SQL (`${dateProjectionSession}`, `${dateProjectionPayment}`) es intrínsecamente peligrosa si algún día se interpolan valores controlados por el usuario.

**Mitigaciones reales en el código:**

- Los valores ligados van como **parámetros** `$1`, `$2` (`get-analytics-data.ts:140-141,156-157`); fechas y rangos nunca se concatenan al SQL.
- Los fragmentos interpolados (`dateProjectionSession`, `dateProjectionPayment`) se construyen exclusivamente desde el parámetro `grouping`, tipado como unión literal `"week" | "fortnight" | "month"` (`get-analytics-data.ts:93`), con ramas `if/else` cerradas (`get-analytics-data.ts:104-128`). No existe camino desde input de usuario hasta el texto SQL: `getChartDataAction` deriva `grouping` de un número de días (`get-chart-data.ts:24-33`), no de un string libre.
- El estado filtrado (`s."status" = 'Asistida'`, `get-analytics-data.ts:143`) es un literal fijo.
- Conversión explícita `BigInt → Number` en la fusión (`get-analytics-data.ts:194-202`).

---

## 7. Formularios en el frontend

### 7.1 React Hook Form + Zod

Ejemplo canónico: `src/modules/clients/components/dialogs/create-client-dialog.tsx:1-247` con `src/modules/clients/schemas.ts:38-63`.

- `useForm` con `zodResolver(createClientFormSchema)` y valores por defecto centralizados (`getCreateClientDefaults()`, `create-client-dialog.tsx:40-44`).
- Cada campo usa `Controller` + componentes `Field`/`FieldError` accesibles (`create-client-dialog.tsx:100-118`).
- El envío corre dentro de `startTransition` (`create-client-dialog.tsx:46-68`): `isPending` deshabilita el `fieldset` completo (`create-client-dialog.tsx:98`), bloquea el cierre del diálogo a mitad de envío (`create-client-dialog.tsx:73-76`), deshabilita "Cancelar" (`create-client-dialog.tsx:231`) y muestra `LoadingButton` con texto de carga (`create-client-dialog.tsx:235-240`). Éxito: `toast.success`, `form.reset()`, cierre. Error: `toast.error(result.error)` con el mensaje en español proveniente del servidor.
- Los schemas viven **por módulo** (`clients/schemas.ts`, `sessions/schemas.ts`, etc.), con distinción entre valores de formulario (`z.input`, acepta strings crudos como la edad) y valores validados (`z.infer`).

### 7.2 Estado en URL con nuqs

Fuente: `src/shared/lib/searchparams.ts:1-242`, `src/core/providers/index.tsx:1-17`.

- Arquitectura de doble capa: **Zod valida en el servidor** (`validateDashboardParams`, `validateClientDetailParams`, `validateUsersParams`; `searchparams.ts:148-191`), **nuqs sincroniza estado en el cliente** (`useQueryStates` con los parsers `dashboardSearchParams`, `clientDetailSearchParams`, `usersSearchParams`; `searchparams.ts:205-227`).
- El proveedor `NuqsAdapter` envuelve la aplicación (`providers/index.tsx:7`).
- La validación con Zod impide que parámetros inválidos (`page`, `status`, `role`, `tab`) lleguen a las consultas; ante fallo, se registran en desarrollo y se aplican valores por defecto seguros (`searchparams.ts:114-130`).

### 7.3 Diálogos de confirmación

`ConfirmPendingSessionDialog` (`src/modules/sessions/components/confirm-pending-session-dialog.tsx:25-90`) y `ConfirmScheduleConflictDialog` implementan el segundo paso del flujo de advertencias de la sección 5.4: muestran la cita existente o el conflicto (fecha y hora formateadas) y solo ante confirmación explícita reenvían la action con `skipWarningCodes`. Es la defensa UX contra dobles reservas accidentales.

---

## 8. Arquitectura de carpetas

```
src/
├── app/        → solo routing: grupos de ruta, layouts (perímetro) y páginas
├── core/       → transversal: auth, db, errors, providers, ui, utils
├── modules/    → vertical por dominio: actions, schemas, queries, components
├── shared/     → compartido entre módulos: components, lib, utils, constants
├── hooks/      → hooks transversales
└── types/      → contratos globales (ActionResult, ActionWarning)
```

| Capa | Contenido | Regla |
|---|---|---|
| `src/core` (`auth`, `db`, `errors`, `providers`, `ui`, `utils`) | Sesión, guards, Prisma, códigos y mensajes de error, mapeo, proveedores globales, sistema de diseño | Nada de dominio clínico; reutilizable por todos los módulos |
| `src/modules` (`agenda`, `clients`, `package-definitions`, `packages`, `payments`, `sessions`, `users`) | Cada módulo agrupa `actions/`, `schemas.ts`, `queries/`, `components/`, `utils.ts` | Las reglas de negocio viven junto a su dominio; los imports cruzados usan queries cacheadas (p. ej. `getCachedPackageDefinitions`) |
| `src/app` | Grupos `(dashboard)`, `(auth)`, layouts, `error.tsx`, `not-found.tsx` | Sin lógica de negocio: delega en guards, actions y queries |
| `src/shared` (`components`, `lib`, `utils`, `constants`) | `searchparams.ts`, `date-helpers`, formato, componentes UI compartidos | Utilidades usadas por dos o más módulos sin ser núcleo |

Cómo facilita el mantenimiento: un cambio de regla clínica (cupo, cita pendiente, conflicto) se hace en una sola action de `modules/sessions`; un cambio de mensaje, en `core/errors`; un cambio de perímetro, en `core/auth/guards.ts` o en un layout. `app` nunca duplica validaciones.

---

## 9. Error boundaries y páginas not-found

### 9.1 `src/app/error.tsx` (raíz)

Fuente: `src/app/error.tsx:1-123`. Client Component que:

- Detecta errores de autenticación por tres señales (`error.tsx:24-29`): mensaje ("Debes iniciar sesión"), `error.name === "UnauthorizedError"` y `error.digest === "AUTH_ERROR"` (necesario porque Next.js ofusca mensajes en producción; el `digest` se fija en `src/core/errors/custom-errors.ts:6,15`).
- Muestra "Sesión Expirada" con acción directa a `/login` (`error.tsx:31-60`).
- Para el resto, muestra "Algo salió mal" con reintento (`reset()`) y salida a `/dashboard` (`error.tsx:62-118`), revelando el mensaje técnico solo en desarrollo (`error.tsx:88-102`).

### 9.2 Not-found raíz frente a segmento dashboard

- `src/app/not-found.tsx:1-39` (raíz, Server Component): 404 global con retorno a `/`.
- `src/app/(dashboard)/not-found.tsx:1-61` (segmento, Client Component): "Recurso no encontrado" contextual con "Regresar" (usa `router.back()` si hay historial, si no va a `/dashboard`; `not-found.tsx:9-15`) e "Inicio". El usuario autenticado nunca es expulsado del shell del dashboard por un 404 interno.

### 9.3 Códigos y mensajes centralizados en español

- `src/core/errors/error-codes.ts:1-112`: códigos Prisma (`P2002`, `P2003`, `P2025`) y códigos de aplicación por dominio (usuarios, paquetes, clientes, pagos, sesiones, auth).
- `src/core/errors/error-messages.ts:1-70` (`APP_ERRORS_ES`): cada código tiene su mensaje en español; `getErrorMessage()` (`src/core/errors/error-mapping.ts:13-18`) es la única vía para traducir.
- `src/core/errors/custom-errors.ts:1-17`: `UnauthorizedError` (`digest: "AUTH_ERROR"`) y `ForbiddenError` (`digest: "FORBIDDEN_ERROR"`) con mensajes por defecto en español.

---

## 10. Caché

| Qué | Mecanismo | Dónde |
|---|---|---|
| Sesión por request | `cache()` de React en `getSession` | `src/core/auth/guards.ts:38-42` |
| Analíticas base (16 h) | `unstable_cache` con tag `analytics-base-stats`, `revalidate: 57600` | `src/modules/clients/queries/analytics/get-analytics-data.ts:13-54` |
| Analíticas históricas (1 semana) | `unstable_cache` con tag `analytics-historical`, `revalidate: 604800` | `get-analytics-data.ts:64-78` |
| Analíticas agrupadas (16 h) | `unstable_cache` con tag `analytics-grouped-data`, `revalidate: 57600` | `get-analytics-data.ts:89-211` |
| Invalidación tras mutación de negocio | `revalidatePath(...)` en cada action de escritura | `create-client.ts:41`, `create-package.ts:85`, `update-session.ts:161` |
| Invalidación de analytics | `revalidateTag("analytics-base-stats")`, `revalidateTag("analytics-grouped-data")`, `revalidateTag("analytics-historical")` | `src/modules/clients/queries/analytics/get-chart-data.ts:54-61` |

**Lo que NO se cachea:** la sesión nunca se guarda en caché persistente ni se comparte entre requests; los guards siempre resuelven contra la base de datos (deduplicados por `cache()` solo dentro del request actual). Los datos mutados (cliente, paquete, sesión) se revalidan por ruta, no se sirven de cachés de larga duración.

---

## 11. Modelo single-tenant y roles

### 11.1 El modelo es single-tenant por diseño

Fuente: `prisma/schema.prisma:10-24,162-166`.

- `User` tiene `role` (`Role`, por defecto `Viewer`) y `position` (`Position`, por defecto `Otro`).
- Ninguna entidad de dominio (`Client`, `ClientPackage`, `SessionRecord`, `Payment`) referencia a `User`: **todos los usuarios autenticados operan sobre los mismos datos de la clínica**. La auditoría histórica lo registró como decisión aceptable para una clínica única (`SECURITY_AUDIT.md:72-90`).

### 11.2 Roles

| Rol | Alcance |
|---|---|
| `Admin` | Todo, incluida gestión de usuarios (`validateAdmin`, layout `administracion`) y definiciones de paquete |
| `Editor` | Escritura operativa: clientes, paquetes, sesiones, pagos (`validateEditorOrAdmin`) |
| `Viewer` | Lectura: dashboard y consultas (`validateSession` / `requireSession`); cualquier escritura retorna `FORBIDDEN` |

### 11.3 Qué NO decir en portfolio

- No presentar el modelo como multi-tenant, SaaS o con aislamiento por usuario: no existe `userId` en las entidades de dominio y cualquier usuario autenticado ve todos los pacientes.
- No atribuir al middleware una protección que no existe: el perímetro son layouts y guards de servidor.
- No describir `useSession` del cliente como control de acceso: es solo UI.
- No prometer auditoría persistente: los forzados de agenda se registran con `console.info("[AUDIT] ...")`, no en tabla de auditoría.

---

## 12. Alcance de PR #22 (`2c8207c`)

Merge: `2c8207c` — *"Merge PR #22 Bug fixes en update session, lanzando version final a produccion"* (23 feb 2026). Commit de contenido: `5770d6a` — *"Bug fixes en update session"*. `git show 2c8207c --stat` reporta **6 archivos, 10 inserciones, 7 eliminaciones**:

| Archivo | Cambio |
|---|---|
| `src/core/errors/error-codes.ts` | Alta de `NO_MORE_SESSIONS_AVAILABLE` |
| `src/core/errors/error-messages.ts` | Mensaje ES: `"No quedan cupos libres en este paquete"` |
| `src/modules/sessions/actions/update-session.ts` | La rama de "resurrección" (reactivar sesión `Cancelada`) retorna `NO_MORE_SESSIONS_AVAILABLE` en lugar del genérico `MAX_SESSIONS_REACHED`; la verificación de cita pendiente se amplía de solo-resurrección a **cualquier** cambio a `Pendiente` |
| `src/modules/sessions/components/confirm-pending-session-dialog.tsx` | Título: `"Ya hay una cita para este paciente"` |
| `src/modules/sessions/components/confirm-schedule-conflict-dialog.tsx` | Descripción precisa el bloque como "esta hora" |
| `src/modules/agenda/components/create-session-express-dialog.tsx` | Microcopy: `"Confirmar cita"` |

Detalle del diff en `update-session.ts`: el retorno de cupo agotado pasa de `MAX_SESSIONS_REACHED` a `NO_MORE_SESSIONS_AVAILABLE`, y la condición `isResurrecting && status === "Pendiente"` se simplifica a `status === "Pendiente"` (con su rama `else if` de auditoría ajustada en consecuencia). Efecto de producto: el mensaje de "sin cupo" distingue el caso de reactivación del límite general, y la advertencia de cita pendiente ahora cubre también la reagenda directa a `Pendiente`, cerrando el hueco por el que se creaban dobles pendientes sin confirmación.

---

## 13. Referencias

### Archivos (con línea)

- `src/core/auth/auth.ts:6-32` — configuración Better Auth (prismaAdapter, emailAndPassword, additionalFields, nextCookies).
- `src/core/auth/guards.ts:38-42` — `getSession` con `cache()` + `headers()`.
- `src/core/auth/guards.ts:52-90` — `requireSession`, `requireAdmin`, `requireEditorOrAdmin`.
- `src/core/auth/guards.ts:100-139` — `validateSession`, `validateAdmin`, `validateEditorOrAdmin`.
- `src/core/auth/auth-client.ts:5-10` — cliente React + `inferAdditionalFields`.
- `src/app/(dashboard)/layout.tsx:12` — `requireSession()` como perímetro del dashboard.
- `src/app/(dashboard)/dashboard/(administracion)/layout.tsx:8` — `requireAdmin()` como perímetro Admin.
- `src/app/(auth)/login/page.tsx:6-14` — redirect a `/dashboard` si ya hay sesión.
- `src/app/(auth)/login/login-form.tsx:27-31,56-80` — schema Zod, `signIn.email`, redirect seguro, traducción de errores.
- `src/core/errors/error-codes.ts:59-68` — códigos de sesión (incluido `NO_MORE_SESSIONS_AVAILABLE`).
- `src/core/errors/error-messages.ts:30-41` — mensajes ES de sesión.
- `src/core/errors/custom-errors.ts:1-17` — `UnauthorizedError`, `ForbiddenError` con `digest`.
- `src/core/errors/error-mapping.ts:24-104` — `mapToAppError`.
- `src/core/errors/handle-action-error.ts:11-28` — manejador central de actions.
- `src/types/index.ts:1-10` — `ActionResult`, `ActionWarning`.
- `src/modules/clients/actions/create-client.ts:13-46` — patrón estándar mínimo.
- `src/modules/packages/actions/create-package.ts:15-91` — patrón con reglas de dominio.
- `src/modules/sessions/actions/update-session.ts:18-167` — patrón complejo con warnings confirmables.
- `src/modules/clients/queries/analytics/get-analytics-data.ts:56-59,80-83,164-175,213-221` — guards en queries y `$queryRawUnsafe` parametrizado.
- `src/modules/clients/queries/analytics/get-chart-data.ts:14-61` — `getChartDataAction`, `revalidateTag` de analytics.
- `src/modules/clients/components/dialogs/create-client-dialog.tsx:40-68,98,235-240` — RHF + transición pendiente + `LoadingButton`.
- `src/modules/clients/schemas.ts:38-63` — schemas de cliente (form vs action).
- `src/modules/sessions/components/confirm-pending-session-dialog.tsx:25-90` — confirmación de cita pendiente.
- `src/shared/lib/searchparams.ts:100-130,148-191,205-227` — validación Zod + parsers nuqs.
- `src/core/providers/index.tsx:7` — `NuqsAdapter`.
- `src/app/error.tsx:24-60` — detección de error de auth por `digest`.
- `src/app/not-found.tsx:1-39` — 404 raíz.
- `src/app/(dashboard)/not-found.tsx:9-15,35-54` — 404 de segmento con retorno contextual.
- `prisma/schema.prisma:10-24,162-179` — modelo `User`, enums `Role` y `Position` (single-tenant).

### Commits

- `2c8207c` — Merge PR #22, versión final a producción (alcance: 6 archivos).
- `5770d6a` — Contenido del fix (códigos `NO_MORE_SESSIONS_AVAILABLE` + ampliación de `PENDING_SESSION_EXISTS`).

### Contexto histórico (no parte del producto)

- `.agent/implementation_plans/SECURITY_AUDIT.md` — auditoría que originó el perímetro (enero 2026).
- `.agent/implementation_plans/RBAC_Implementation_Summary.md` — resumen de implementación RBAC.

### Nota sobre test-first

Este artefacto es documentación pasiva: describe código existente verificado por lectura directa del repositorio en `2c8207c`. No introduce ni modifica comportamiento ejecutable, por lo que no aplica el ciclo RED/GREEN; la verificación correspondiente es el readback estructural del propio archivo.
