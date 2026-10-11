# funky-ai — Framework CLI para desarrollo asistido por IA (Consolidado)

> Fuente única de contenido para el portfolio. Editar aquí; luego se refleja en `data/projects.ts`.
> Última actualización: 2026-10-05

---

## 1. Brief — Vista normal (card destacada del grid)

| Campo | Valor |
| --- | --- |
| `id` | `funky-ai` |
| `title` | Funky AI |
| `category` | Dev Tools / AI Engineering |
| `hook` | CLI modular `funky` con 10 comandos para planificar, construir y endurecer proyectos con proceso repetible. |
| `metric` | 10 comandos · 443 tests · 27 reglas |
| `tags` | Node.js · TypeScript · CLI · pnpm · Vitest · GitHub Actions |
| `image` | `/images/projects/funky-ai/funky-ai-main.webp` |
| `imageAlt` | Terminal del CLI de funky-ai mostrando el pipeline SDD |
| `links` | Repo: [funky-ai](https://github.com/MaxGB23/funky-ai) (público) · npm: no publicado · install: clonar + symlink con pnpm (pnpm-first) |

---

## 2. Detail — Vista detallada

### Headline

**De idea a release con proceso, en un solo CLI**

### Summary

funky-ai es un solo CLI con 10 comandos independientes para planificar, construir y endurecer proyectos sin imponer memoria ni interfaz gráfica; se instala por clonar + symlink con pnpm (npm no publicado, pnpm-first). Deja una base mínima para arrancar, solo inyecta OpenSpec cuando se pide con `funky sdd install`, y Forge ayuda a aprender a planificar y a saber cómo cobrar con asesoría de IA. Secure es asistido y honesto: diagnostica y recomienda sin bloquear por defecto. SDD se conserva como metodología vigente; ODD no está implementado, se plantea como línea futura: cada fase SDD equivaldría a una tarea ODD con su work-unit commit.

### Metrics

| Value | Label |
| --- | --- |
| 10 | comandos en un solo CLI para planificar, construir y asegurar |
| 47+7 | plantillas base para arrancar cualquier proyecto en minutos |
| 27 | reglas de IA que ordenan el trabajo entre agente y humano |
| 443 | pruebas automatizadas con Vitest en verde que cuidan cada cambio en 36 archivos |
| 3 | acciones de CI fijadas por SHA |
| Asistido | revisión de dependencias que avisa antes de instalar algo riesgoso |

> Sin porcentajes como hechos: los 4 valores estimados previos (tokens, recall, velocidad idea-arquitectura, riesgo) pasan a solution como **objetivos de diseño**, no mediciones.

### Problem

Las tareas grandes de IA asistida que arrancan de un único prompt masivo fallan de forma predecible: la ventana de contexto se desborda, el modelo alucina sobre partes que ya no recuerda y no hay punto natural de intervención humana. Los agentes no tienen memoria confiable entre sesiones, cada sesión re-aprende desde cero recargando contexto caro, y la planificación de proyectos ocurre ad-hoc, después de elegir el stack.

### Role

- Diseñé el ecosistema CLI completo: pipeline SDD con contexto just-in-time y separación orquestador/sub-agentes.
- Construí funkygram (memoria persistente), funky-forge (planificación) y funky secure (hardening de dependencias).
- Apliqué TDD con Vitest y workflow issue-first desde el inicio: cada cambio rastreado a un issue triado.
- Mantuve CI/CD con GitHub Actions (SHA fijados por seguridad) y documentación viva verificada contra el CLI real.

### Solution

- **Scaffold base mínima para arrancar** — deja lo justo para empezar un proyecto en minutos, con estructura interoperable. No impone metodología; funciona con la memoria que ya tengas.
- **funkygram, memoria persistente opcional** — guarda el conocimiento del proyecto en archivos Markdown dentro del repo, organizado por temas con índice central. Es opcional: si ya tienes otra memoria, la respeta; las sesiones dejan de reaprender desde cero.
- **Framework SDD propio con prompt based harnesses** — pipeline por fases (proposal, specs, design, tasks, apply, verify, archive) con 27 reglas que ordenan la delegación entre orquestador y sub-agentes, cargando contexto solo cuando se necesita. Es la base de mi experiencia creando harnesses a medida y adaptándome a cada modelo y plataforma. SDD sigue vigente; ODD no está implementado, se plantea como línea futura.
- **OpenSpec solo cuando se pide** — solo un comando instala OpenSpec; el resto del CLI no lo impone ni lo mezcla con la base inicial.
- **Forge para aprender a planificar y saber cómo cobrar** — prepara material de planificación, revisión de arquitectura y estimación de costos con asesoría de IA. La herramienta ordena las ideas, no decide por ti.
- **Secure asistido honesto** — diagnostica dependencias y recomienda buenas prácticas. La cuarentena y la revisión de secretos funcionan como guía asistida, no como bloqueo automático.
- **Prácticas** — sin código sin issue previo, pruebas con Vitest, integración continua con SHA fijados, versiones ordenadas con notas de cambio y documentación verificada contra el CLI real. El mismo flujo sirve a personas y a agentes: en terminal pregunta antes de sobrescribir, en CI falla de forma documentada; si no puede comprobar el estado, no sobrescribe. Objetivos de diseño, no medidos: menos tokens con contexto justo a tiempo, menos costo de recordar, más rápido de idea difusa a arquitectura costeada y menos riesgo en dependencias.

> Objetivos de diseño (no medidos): menos tokens con just-in-time, menos costo de recall de memoria, más rápido de idea difusa a arquitectura costeada y menos riesgo de supply chain.

### Stack

- **Lenguaje / Runtime:** Node.js, TypeScript
- **Package manager:** pnpm
- **CLI:** sin interfaz gráfica
- **Testing:** Vitest (TDD, Red → Green → Refactor)
- **CI/CD:** GitHub Actions (SHA fijados por seguridad)
- **Memoria:** archivos Markdown por temas + índice central
- **Pipeline:** plantillas SDD en Markdown, contexto justo a tiempo
- **Capa agéntica:** 27 reglas de trabajo entre agente y humano + formato fijo de lecciones

### Escalabilidad

El proceso se adapta al tamaño del cambio: lo simple avanza sin papeleo y lo complejo pasa por diseño y revisión con ayuda de IA. El contexto, las reglas y la memoria solo se cargan cuando se necesitan.

### Gallery

1. Pipeline Funky Forge (init-assess-estimate-pipeline)
2. Vista general de Funky Secure (diagnóstico asistido en consola)
3. Interfaz de terminal de Funkygram (memoria persistente opcional)
4. Ejecución del pipeline SDD de funky-ai (`funky sdd install` solo cuando se pide)

> ⚠️ Capturas reales pendientes — son herramientas de terminal, cualquier screenshot debe mostrar el CLI en acción, no mockups.

### CTA

_"¿Buscas incorporar IA en tu flujo de desarrollo con proceso y sin caos? Este framework es mi laboratorio público."_