# QA guards: navbar reload + About reveal

Dos regresiones que fallan en silencio y que ya mordieron una vez al dueno:
el fondo del navbar tras una recarga profunda y el retrato de About animando
fuera de pantalla. Se cubren con guards en `scripts/`, manuales, sin CI.

## Specs

- **S1.** Los guards viven en `scripts/` y se ejecutan con un solo comando:
  `pnpm qa` (o `pnpm qa -- --url <url>`). No se agregan a `.github/workflows/`.
  Pedido del usuario: *"me gusta mas tenerlos en local, en ci no me convence"*.
- **S2.** Guard del navbar: al abrir un **enlace profundo** (`/#precios`) en
  carga fria, `.nav-surface` no lleva `bg-transparent` (caso roto medido en el
  deployment previo a #15: `scrollY=4706` con `bg-transparent`). Controles
  obligatorios: en el hero sigue transparente y un scroll manual por encima de
  20 px pone el fondo solido. Sin los controles, quitar el efecto entero tambien
  pasaria. Calibracion obligatoria: tiene que ser un enlace en una **pagina
  nueva** (carga fria); recargar una pagina ya scrolleada, o navegar al hash
  desde una pagina ya cargada, dispara un evento `scroll` y esconde el bug.
- **S6.** Cada guard tiene que fallar contra el build previo a su fix. Se
  verifica contra los deployments publicos previos (Vercel conserva la URL de
  cada uno) y esa corrida es la evidencia del PR; un guard que pasa en los dos
  lados no es un guard.
- **S3.** Guard de About: en 390x844, cuando `.about-portrait` arranca su tween
  (`opacity > 0.02`), al menos 30% de su alto esta dentro del viewport. Control
  de orden: el label arranca antes que el retrato.
- **S4.** El veredicto de cada guard es una funcion pura
  (`scripts/lib/reveal-guards.mjs`) con su `scripts/reveal-guards.test.mjs`:
  las muestras del bug deben dar FAIL y las del fix PASS. Esa parte corre en
  `pnpm test`, hermética y sin navegador; solo el recorrido del navegador queda
  manual.
- **S5.** `docs/design/iteration-guide.md` 12 CheckList gana la casilla
  "correr `pnpm qa`" para que el habito tenga un dueno escrito, y
  `docs/README.md` (mapa de preguntas) gana la fila que lo hace descubrible.

## Tasks

| ID | Specs | Ruta | Commit |
| --- | --- | --- | --- |
| T1 | S1, S2, S4 | logica pura + driver del navbar + umbrella `qa.mjs` + alias | `test(navbar): guard the reload background` |
| T2 | S1, S3, S4 | caso de About en la logica pura + driver + alias | `test(about): guard the mobile portrait reveal` |
| T3 | S5 | checklist de iteration-guide + puntero en el gotcha de platform.md | `docs: route the QA guards through the iteration checklist` |

## Log

- **L1 (pedido original, verbatim):** *"escribelos, en un worktree dedicado, se
  ejecutaran con pnpm tests o como se sabra que algo no se rompe antes de llegar
  a produccion? dame el plan antes de implementar, primero aprobamos"*
- **L2 (decision de alcance, verbatim):** *"me gusta mas tenerlos en local, en
  ci no me convence, qué opinas"* -> ambos guards manuales, sin gate de CI. La
  condicion aceptada es un solo comando (`pnpm qa`) y una linea en el checklist.
- **L3 (contexto de origen, verbatim):** *"me dijo que lo verifico el antes y
  despues"* - el PR #15 verifico con una sonda desechable y dejo el caso sin
  asercion commiteada; el commit `3a94348` lo dice: *"No automated test covers
  this"*. Este track convierte esa sonda en guard.
- **L4 (contexto de origen, verbatim):** el retrato de About en mobile quedo en
  el PR #11 con `Risk: item 6` (*"no committed assertion pins the reveal
  timing"*); este track cierra esa deuda.
- **L5 (hallazgo de calibracion, 2026-10-30):** la primera version de los dos
  guards pasaba tambien contra los deployments previos, o sea no servia. Causas
  medidas: el navbar necesitaba un **enlace en pagina nueva** (la recarga y el
  ancla same-document disparan `scroll` y el navbar se corrige solo), y About
  necesitaba **scroll lento** (1 px por frame; a 6 px el retrato ya estaba en
  pantalla con 70% cuando arrancaba su tween). Con esas dos condiciones: navbar
  FAIL en el previo / PASS en produccion, About 0% visible FAIL / 46% PASS.
- **L6 (dueno del habito, verbatim):** *"estos tests deberian ser como el de
  pnpm docs o i8n? o se podria perder al estar dentro de docs/design, hay un
  readme para docs"* -> el codigo vive en `scripts/` (no en `docs/`), la regla
  en `platform.md`, el habito en el checklist y la fila nueva del mapa de
  `docs/README.md` cierra el descubrimiento. Lo que si corre en CI es la logica
  del veredicto, via `pnpm test`.
