# Portfolio — Resumen

Versiones concisas de los proyectos para CV, LinkedIn y vista previa del portfolio.
Las versiones ampliadas (para "Ver más detalles") están en [`PORTFOLIO-DETALLADO.md`](./PORTFOLIO-DETALLADO.md).

---

## Grinchmas Kart — 3D Arcade Kart Racing (Unity)

> **Etiqueta:** Unity · C# · URP · ML-Agents (Reinforcement Learning)
> **Rol:** ~80% del proyecto — código, gameplay, integración de IA, flujo de niveles, dirección y modelos 3D propios.
> **Equipo:** ABMODEL Games (universidad, 4 integrantes).

Kart racing arcade navideño ("Grinchmas"): el Grinch, Santa, un Pingüino y un Muñeco de nieve como karts compitiendo en 5 niveles encadenados, con derrota, victoria y créditos.

- **Motor/stack:** Unity 2021.3.8f1 LTS · URP · Cinemachine · ProBuilder · Timeline · Builds Windows/WebGL.
- **IA rival con Reinforcement Learning (ML-Agents):** el rival comparte la **misma interfaz `IInput` que el jugador** (karts intercambiables), con observaciones por raycasts + checkpoints y flujo de recompensas.
- **Arquitectura en capas:** Presentación → Sistemas de juego → Física/Gameplay → Controladores → Input, con `asmdefs` bien definidos.
- **Física de kart:** Rigidbody + 4 WheelColliders, suspensión parametrizada, derrape, power-ups extensibles (struct Stats).
- **Coherencia end-to-end:** modelos propios en Blender, HUD navideño, trailer y créditos en video, audio propio.
- Demo jugable publicada (Google Drive, uso de portfolio).

---

## Cumyxel — 2D Platformer Pixel Art (Unity)

> **Etiqueta:** Unity · C# · 2D · Built-in RP · uGUI
> **Rol:** diseño de un nivel (pixel art) + **toda la programación de gameplay**.
> **Equipo:** ABMODEL Games (universidad, 4 integrantes).

Plataformas 2D side-scrolling en pixel art (cuevas y bosque). Prototipo con el **núcleo de gameplay** totalmente funcional.

- **Motor/stack:** Unity 2022.3.19f1 LTS · C# · Built-in Render Pipeline (Linear) · uGUI + TextMeshPro · Mecanim.
- **Física 2D bien pensada:** salto variable con corrección de gravedad en dos fases, ground-check con `OverlapCircle`.
- **Enemigos con FSM** (idle → chase → ataque), proyectiles por corrutinas, plataformas one-way con `Physics2D.IgnoreCollision`.
- **Cámara** ortográfica con efecto **ripple de agua** (post-proceso con shader).
- Sistemas de combate, cofres/palancas y diálogo NPC implementados y documentados como roadmap.
- Documentación técnica con **análisis crítico honesto** de la deuda técnica.

---

## Cumyxel-code — Código fuente reusable (MIT)

> **Etiqueta:** Unity · C# · Open Source (MIT)

Repo público con **solo el código de gameplay** de Cumyxel (sin assets ni escenas), **licencia MIT**: scripts pensados para soltarlos en cualquier proyecto Unity 2022.3 LTS. Muestra limpieza para separar código del contenido y mentalidad open-source.

---

## El perfil en 3 puntos

1. **IA con Reinforcement Learning** — ML-Agents con interfaz de input compartida jugador/IA (patrón de diseño real, no script ad-hoc).
2. **Dos juegos Unity end-to-end** con arquitectura en capas, `asmdefs` y documentación técnica.
3. **Autocrítica técnica y auditoría** — análisis que documentan riesgos y deuda honestamente, y ~80% de liderazgo técnico en un equipo universitario.
