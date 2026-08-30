# Portfolio — Detalles ampliados

Versión ampliada de cada proyecto para la sección "Ver más detalles" del portfolio.
Versiones concisas para CV/LinkedIn/vista previa en [`PORTFOLIO-RESUMEN.md`](./PORTFOLIO-RESUMEN.md).

---

# Grinchmas Kart — 3D Arcade Kart Racing

## Visión general

Kart racing de estilo arcade con temática navideña ("Grinchmas"): el **Grinch, Santa, un Pingüino y un Muñeco de nieve** se convierten en los karts y personajes que compiten en **cinco niveles encadenados dentro de una misma partida**, con un historial de victorias que avanza de nivel en nivel hasta los créditos.

Construido por **ABMODEL Games** (equipo universitario), partiendo del template oficial **Karting Microgame 5.0.1** de Unity y personalizándolo por completo para darle identidad propia. El autor (MaxGB23) aporta **~80% del proyecto**: todo el código, gameplay, integración de IA, flujo de niveles, dirección e integración, más modelos 3D originales.

## Ficha técnica

| Campo | Valor |
|---|---|
| Motor | Unity **2021.3.8f1 LTS** (URP 12.1.7, Forward, espacio lineal) |
| Plataformas | Windows standalone + WebGL (Burst AoT), Android configurado |
| Versión | 1.01 (jugable end-to-end) |
| Base | Karting Microgame 5.0.1 |
| Paquetes clave | Cinemachine, ProBuilder, Timeline, TextMeshPro, ML-Agents, Barracuda, Burst |

## Arquitectura en capas

El proyecto hereda del template una separación limpia, bien utilizada por el autor:

- **Presentación:** UI (uGUI + TextMeshPro), audio (mixer), cámaras (Cinemachine).
- **Sistemas de juego:** `GameFlowManager`, `ObjectiveManager`, `TimeManager`, power-ups, audio.
- **Física / Gameplay:** `ArcadeKart` (Rigidbody + 4 WheelColliders), `KartBounce`, `KartAnimation`.
- **Controladores intercambiables:** `KeyboardInput` (jugador) y `KartAgent` (IA) producen el **mismo `InputData`**.
- **Input:** teclado (Input legacy) y observaciones de ML-Agents.

Ensamblados (`asmdefs`) bien definidos: `KartGame`, `KartGame.Editor`, `KartGame.AI`, `KartGame.AI.Editor`.

## IA con Reinforcement Learning (ML-Agents) — lo más destacado

La **IA rival implementa la misma interfaz `IInput` que el jugador**: el `ArcadeKart` recibe un `InputData` y no distingue quién lo conduce. Es el mismo patrón que permite usar `KeyboardInput` en el kart del jugador y `KartAgent` en los rivales.

- **Observaciones:** raycasts (`Unity.MLAgents.Sensors`) + velocidad local + dirección hacia el siguiente checkpoint.
- **Checkpoints:** vector de `Collider` en capa exclusiva (`TrainingCheckpoints`); el agente avanza a lo largo del circuito, evita choques y se relocaliza si cae de la pista.
- **Recompensas:** penalización por choque, recompensa por pasar/acercarse al checkpoint, por velocidad y por aceleración.
- **Modos Training/Inferencing** con utilidades de depuración (`DebugCheckpointRay`).

**Por qué checkpoints + raycasts y no NavMesh:** es una carrera, no búsqueda de caminos. NavMesh resuelve *qué camino seguir*; aquí importa *seguir la línea de carrera evitando choques y volviendo a pista*. Checkpoints dan la referencia global, raycasts la percepción local; el entrenamiento es de tipo *policy* (parámetros de control). Es la elección estándar para racing con RL.

**Honestidad técnica:** el repositorio integra ML-Agents correctamente a nivel de API, pero **no incluye el modelo entrenado** (`.onnx`/`.nn`); la IA en inferencia depende de un entrenamiento externo, documentado como roadmap.

## Física del kart

- **Configuración correcta:** Rigidbody + 4 WheelColliders (eje delantero de giro).
- **Suspensión parametrizada:** Stats exponen muelle/amortiguación (tunear sin tocar código).
- **Derrape legible:** Brake + Accelerate → menos grip + `DriftAdditionalSteer`, con VFX.
- **Extensible:** `struct Stats` (TopSpeed 5700, Steer 50, Grip 100, AddedGravity 1) ampliables con power-ups (`ArcadeKartPowerup`).
- **Fallos cubiertos:** `KartBounce` (rebote con sonido) y reorientación aérea al caer de pista.

Tradeoff consciente del género: velocidades directas por frame (sensación arcade) en lugar de torque realista.

## Flujo de partida (5 niveles → créditos)

`PrePucio` → `Inicio` (menú principal) → niveles `1 → 2 → 3 → 4 → 5` → **Créditos** (con video); al perder, `LoseScene`. El autor modificó `GameFlowManager` para encadenar los niveles por nombre (`levelScenes = {"1","2","3","4","5"}`) y cargar créditos/derrota, donde el template solo cargaba `WinScene`/`LoseScene`.

## Contenido propio del autor

- **Personajes/karts:** Santa, Pingu, Nieve, Grinch (variants) — tematizados navideños.
- **Rivales de IA temáticos:** `IA Santa.prefab`, `IA Nieve.prefab`.
- **Modelos 3D en Blender:** `grinchcar`, `Trineo2`, `motonieve`, `Patineta`, `Mono`, `Pista`, `SantaFinal`, `Montaña Grinch`.
- **Videos/audio propios:** trailer y créditos `.mp4`, pistas y sonidos.
- **HUD/UI navideño** y cadenas de texto traducidas al español.

## Análisis crítico / riesgos (honestidad técnica)

- **IA sin modelo entrenado** en el repo — integración correcta, entrenamiento externo pendiente.
- **Tags vacíos** en `TagManager` mientras scripts comparan por tag (riesgo silencioso potencial).
- **Escenas hardcodeadas** en `GameFlowManager` (frágil ante renombrados).
- **Modelo del reno (`RenoFinal.blend`):** origen **no verificado**, excluido de la distribución pública y pendiente de reemplazo por modelo propio; uso solo no comercial.
- Mejoras priorizadas: resolver tags, alinear el input (Input System), añadir tests, limpiar borradores, exportar el modelo ML.

---

# Cumyxel — 2D Platformer Pixel Art

## Visión general

Juego de plataformas 2D **side-scrolling** con estética **pixel art** (cuevas y bosque). Prototipo con el **núcleo de gameplay** totalmente funcional: control del personaje, salto variable, detección de suelo, reaparición por caídas y cámara con efecto de agua. El autor diseñó un nivel completo en pixel art y realizó **toda la programación de gameplay**.

## Ficha técnica

| Campo | Valor |
|---|---|
| Motor | Unity **2022.3.19f1 LTS**, C# |
| Render | Built-in Render Pipeline, espacio lineal |
| UI | uGUI + TextMeshPro 3.0.6 |
| Input | Input Manager clásico |
| 2D | `com.unity.feature.2d` 2.0.0, Tilemap, Physics2D |
| Animación | Mecanim |
| Código | ~1.055 LOC (11 scripts de gameplay) |

## Features técnicas destacables

- **Salto variable** con corrección de gravedad en **dos fases** (subida sin tecla / caída) — física 2D cuidada, ideal para hablar de *game-feel*.
- **Ground-check** con `OverlapCircle` + gizmos de depuración.
- **Plataformas one-way** implementadas con `Physics2D.IgnoreCollision` + par trigger/collider (enfoque creativo).
- **Enemigos con FSM** por anillos de distancia (idle → chase → ataque): esqueleto arquero y murciélago, con proyectos por corrutinas.
- **Cámara ortográfica** con efecto **ripple de agua** (post-proceso: shader + `Graphics.Blit`).
- **Sistemas prototipados** en código y documentados como roadmap: combate melee + proyectil, cofres/palancas, diálogos NPC.

## Estructura

`Animaciones/`, `CumAssets/` (arte de terceros con licencia libre), `Fondos/`, `RippleEffect/`, `Scenes/` (5 escenas), `Scripts/`, `Sprites/` organizados por tema.

## Análisis crítico (mejora el perfil)

El proyecto incluye un análisis técnico honesto que documenta la deuda real:

- Dependencia no declarada (**Cinemachine** usado pero no instalado) — bloquea la compilación hasta resolverlo.
- **GUID roto** de `WayPoint.cs` (otras escenas con scripts "missing").
- **Tags/layers** sin definir mientras el código compara por tag.
- Sistema de daño/vida del jugador pendiente y sistemas no cableados a niveles.
- Mejoras priorizadas: instalar/quitar Cinemachine, regenerar `.meta`, definir tags, completar el loop de combate.

**Narrativa de portfolio:** el prototipo demuestra el núcleo de gameplay funcionando y, sobre todo, **capacidad de autocrítica técnica y auditoría** — saber exactamente qué deuda hay y cómo resolverla.

---

## Sobre ABMODEL Games

Equipo de desarrollo universitario (4 integrantes).

| Integrante | Rol |
|---|---|
| **Maximiliano González Ballesteros (MaxGB23)** | ~80% Grinchmas Kart (código, gameplay, ML-Agents, nivel, dirección, modelos 3D); diseño de nivel + toda la programación en Cumyxel |
| Alejandro Mandujano Nuñez | Modelado 3D (escenario y personajes) / cinemáticas y un nivel (Cumyxel) |
| Esther Areli Rico Piedra | Modelado 3D (escenario y personajes) / un nivel (Cumyxel) |
| Luis Fernando Argueta Cruz | Modelado 3D (escenario y personajes) / un nivel (Cumyxel) |

## Licencias

- **Grinchmas Kart:** código, modelos y assets originales © 2026 ABMODEL Games — All rights reserved. Terceros conservan sus licencias (Karting Microgame — Unity Companion License, Mixamo — uso comercial ilimitado).
- **Cumyxel-code:** código bajo **MIT**. Assets/escenas no incluidos (terceros, CraftPix freebies).

## Demos jugables

Disponibles en Google Drive (builds de portfolio/demostración, no comerciales) tanto de Grinchmas Kart como de Cumyxel.
