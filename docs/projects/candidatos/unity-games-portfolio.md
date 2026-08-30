# Grinchmas Kart & Cumyxel — Juegos Unity (Consolidado)

> Fuente única de contenido para el portfolio. Editar aquí; luego se refleja en `data/projects.ts`.
> Última actualización: 2026-08-28
> Fuente técnica real: `docs/projects/drafts/unity/PORTFOLIO-DETALLADO.md` y `PORTFOLIO-RESUMEN.md` (revisión del código fuente + repos publicados en GitHub).

---

## 1. Brief — Vista normal (card del grid)

| Campo | Valor |
| --- | --- |
| `id` | `unity-games` |
| `title` | Grinchmas Kart & Cumyxel |
| `category` | Game Dev / Unity |
| `hook` | Dos juegos Unity end-to-end de un equipo universitario (ABMODEL Games): kart 3D con IA rival entrenada con Reinforcement Learning y plataformero 2D pixel-art. |
| `metric` | IA rival con Reinforcement Learning (ML-Agents) |
| `tags` | Unity · C# · Blender · ML-Agents · URP |
| `image` | TBD — ⚠️ capturas reales de gameplay |
| `imageAlt` | Gameplay de Grinchmas Kart (3D) y Cumyxel (2D) |
| `links` | Repos: [Grinchmas-Kart](https://github.com/MaxGB23/Grinchmas-Kart) · [Cumyxel](https://github.com/MaxGB23/Cumyxel) · [Cumyxel-code](https://github.com/MaxGB23/Cumyxel-code) · Demos: [Google Drive](https://drive.google.com/drive/folders/1bSRON0fCKFBL4qX8gPyTn4LXYGR9Vv6O?usp=sharing) · Clip Blender 15s: TBD |

---

## 2. Detail — Vista detallada

### Headline

**Dos juegos end-to-end, liderazgo real y una IA entrenada con Reinforcement Learning**

### Summary

Grinchmas Kart (3D, sep – dic 2023) y Cumyxel (2D, ene – abr 2024), desarrollados por ABMODEL Games — equipo universitario de 4 integrantes — con el autor al **~80% del kart** (código, gameplay, IA, dirección y modelos 3D) y **toda la programación de gameplay del 2D**. Todo revisado contra el código fuente real y publicado en GitHub.

### Metrics

| Value | Label |
| --- | --- |
| RL | IA rival entrenada con Reinforcement Learning (ML-Agents) |
| 5 | niveles encadenados en el kart, hasta créditos |
| ~80% | del kart: código, gameplay, IA, flujo, dirección + modelos 3D |
| 1,055 | LOC de gameplay en el 2D (11 scripts) + pixel-art a mano |
| MIT | repo Cumyxel-code: solo código de gameplay, reusable |

### Problem

Proyectos universitarios donde el objetivo fue superar el "juego de muestra": en el 3D, físicas arcade creíbles y **un rival que aprendiera a conducir con RL** — el template oficial (Karting Microgame 5.0.1) no traía IA y hubo que diseñarla desde cero. En el 2D, un plataformero con *game-feel* (salto variable) y enemigos con comportamiento real (FSM), no sprites decorativos.

### Role

- **Grinchmas Kart — lideré el proyecto (~80%):** código, gameplay, integración de ML-Agents, flujo de niveles, dirección e integración, más modelos 3D propios.
- **Programé la IA rival con Reinforcement Learning:** misma interfaz `IInput` que el jugador, observaciones por raycasts + velocidad local + dirección al checkpoint, recompensas por progreso y penalizaciones por choque, modos Training/Inferencing.
- **Cumyxel — 100% de la programación de gameplay:** salto variable en dos fases, plataformas one-way, enemigos con FSM, cámara con efecto ripple de agua (shader + `Graphics.Blit`).
- **Modelé en Blender:** `grinchcar`, `Trineo2`, `motonieve`, `Patineta`, `Mono`, `Pista`, `SantaFinal`, `Montaña Grinch`; HUD navideño, trailer y créditos en video y audio propios.
- **Publiqué y documenté:** repos en GitHub, demo jugable en Google Drive, arquitectura y deuda técnica con análisis crítico honesto.

### Solution — Grinchmas Kart

- **Arquitectura en capas** con `asmdefs` bien definidos (KartGame, KartGame.Editor, KartGame.AI, KartGame.AI.Editor).
- **IA con RL (lo más destacado):** el rival comparte la misma interfaz de input que el jugador — el `ArcadeKart` recibe un `InputData` sin distinguir quién lo conduce. Observaciones por raycasts (detección de colisiones), velocidad local y dirección al siguiente checkpoint en capa exclusiva; recompensa por acercarse/pasar el checkpoint y por velocidad, penalización por choque. Checkpoints + raycasts en vez de NavMesh: es una carrera (seguir la línea evitando choques), no una búsqueda de camino — la elección estándar para racing con RL.
- **Física arcade:** Rigidbody + 4 WheelColliders, suspensión parametrizada (tunable sin código), derrape con VFX, power-ups extensibles (`struct Stats`), `KartBounce` y reorientación aérea al caer.
- **Flujo de partida:** 5 niveles encadenados dentro de una misma partida, victoria/derrota y pantalla de créditos con video (modifiqué `GameFlowManager` para encadenar por nombre).

### Solution — Cumyxel (2D)

- **Salto variable** con corrección de gravedad en dos fases (subida sin tecla / caída) — física 2D cuidada, *game-feel*.
- **Enemigos con FSM** por anillos de distancia: idle → chase → ataque (esqueleto arquero y murciélago), proyectiles por corrutinas.
- **Plataformas one-way** con `Physics2D.IgnoreCollision` y par trigger/collider.
- **Cámara ortográfica** con efecto ripple de agua (post-proceso: shader + `Graphics.Blit`).
- **Ground-check** con `OverlapCircle` + gizmos de depuración; Tilemap, Mecanim; escenarios pixel-art dibujados a mano.
- **Cumyxel-code:** repo público MIT con solo el código de gameplay — separa código del contenido y muestra mentalidad open-source.

### Stack

| Grinchmas Kart | Cumyxel |
| --- | --- |
| Unity 2021.3.8f1 LTS (URP, Forward, lineal) | Unity 2022.3.19f1 LTS (Built-in RP, lineal) |
| C# · Cinemachine · ProBuilder · Timeline · TextMeshPro | C# · uGUI + TextMeshPro · Mecanim · Tilemap · Physics2D |
| ML-Agents · Barracuda · Burst | ~1,055 LOC en 11 scripts de gameplay |
| Blender (modelos y animaciones) | Pixel-art a mano + assets libres |

### Análisis crítico — honestidad técnica (parte del valor)

- **Kart:** IA sin modelo entrenado en el repo (integración correcta a nivel de API, entrenamiento externo documentado como roadmap); tags vacíos en `TagManager` mientras scripts comparan por tag; escenas hardcodeadas en `GameFlowManager`; modelo del reno (`RenoFinal.blend`) de origen no verificado, excluido de la distribución pública y pendiente de reemplazo (uso no comercial).
- **2D:** dependencia no declarada (Cinemachine usado pero no instalado); GUID roto de `WayPoint.cs` (scripts missing); tags/layers sin definir; sistema de daño/vida pendiente.
- La auditoría documenta exactamente qué deuda existe y cómo resolverla — capacidad de autocrítica técnica, no solo de construir.

### Licencias

- **Grinchmas Kart:** código, modelos y assets originales © 2026 ABMODEL Games — All rights reserved. Terceros conservan sus licencias (Karting Microgame — Unity Companion License; Mixamo — uso comercial ilimitado).
- **Cumyxel-code:** código bajo MIT (assets/escenas no incluidos, CraftPix freebies).

### Estado y fuentes

- ✅ Código recuperado, revisado contra el código fuente y publicado en GitHub: [Grinchmas-Kart](https://github.com/MaxGB23/Grinchmas-Kart), [Cumyxel](https://github.com/MaxGB23/Cumyxel), [Cumyxel-code](https://github.com/MaxGB23/Cumyxel-code) (MIT); demos jugables en [Google Drive](https://drive.google.com/drive/folders/1bSRON0fCKFBL4qX8gPyTn4LXYGR9Vv6O?usp=sharing) (uso de portfolio, no comerciales).
- ⚠️ Pendientes: screenshots reales, clip Blender 15s (lluvia + reflejos).
- Fuente detallada: `docs/projects/drafts/unity/PORTFOLIO-DETALLADO.md` y `PORTFOLIO-RESUMEN.md`.

### Contexto de carrera

Mis primeros proyectos formales de game dev — y el origen de dos habilidades que hoy definen mi especialidad: la **IA aprendida con RL** (el primer "comportamiento inteligente" que escribí, ahora aplicado en la ingeniería de agentes de IA) y la **dirección técnica** (~80% de un proyecto en equipo de 4). Los repos y demos publicados completan la evidencia con código real.

### Gallery

1. Gameplay de Grinchmas Kart (3D)
2. Debug de la IA: raycasts y checkpoints
3. Gameplay de Cumyxel (2D)
4. Clip Blender 15s — lluvia y charcos con reflejos

> ⚠️ Capturas reales pendientes.

### CTA

_"¿Quieres ver mis inicios en game dev con Unity, C# y Blender — y el primer entrenamiento de IA que escribí? Hablemos."_