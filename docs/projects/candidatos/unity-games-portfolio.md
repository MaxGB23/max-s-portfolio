# Grinchmas Kart & Cumyxel — Juegos Unity

> Fuente única de contenido para el portfolio. Editar aquí; luego se refleja en `data/projects.ts`.
> En el portfolio son DOS proyectos separados del grid (no una card consolidada).
> Última actualización: 2026-10-08
> Fuente técnica real: `docs/projects/drafts/unity/PORTFOLIO-DETALLADO.md` y `PORTFOLIO-RESUMEN.md` (revisión del código fuente + repos publicados en GitHub).

---

## 1. Grinchmas Kart

### Brief — card del grid

| Campo | Valor |
| --- | --- |
| `id` | `grinchmas-kart` |
| `title` | Grinchmas Kart |
| `category` | Game Dev / Unity |
| `hook` | Kart racing 3D end-to-end (ABMODEL Games) con IA rival entrenada con Reinforcement Learning (ML-Agents), físicas arcade y modelos 3D propios en Blender. |
| `metric` | IA rival entrenada con Reinforcement Learning |
| `tags` | Unity · C# · Blender · ML-Agents |
| `image` | `/images/projects/grinchmas-kart/inicio.webp` |
| `imageAlt` | Gameplay de Grinchmas Kart: kart 3D en pista navideña con IA rival |
| `links` | Repo: [Grinchmas-Kart](https://github.com/MaxGB23/Grinchmas-Kart) · Demo: [Google Drive](https://drive.google.com/drive/folders/1bSRON0fCKFBL4qX8gPyTn4LXYGR9Vv6O?usp=sharing) |

### Detail

**Headline:** Lideré un kart 3D en equipo de 4 y le enseñé al rival a conducir solo

**Summary:** Grinchmas Kart (3D, sep – dic 2023) es un kart racing end-to-end de ABMODEL Games, equipo universitario de 4 integrantes. Lideré ~80% del proyecto: código, gameplay, IA, flujo de niveles, dirección y modelos 3D propios en Blender. El objetivo fue superar el juego de muestra oficial (Karting Microgame 5.0.1) con físicas arcade creíbles y un rival que aprende a conducir con Reinforcement Learning.

**Metrics**

| Value | Label |
| --- | --- |
| RL | IA rival con reinforcement learning en un nivel de carrera |
| 5 | niveles encadenados en la misma partida hasta los créditos |
| ~80% | del proyecto liderado en equipo de 4: código, IA, flujo y 3D |
| 8 | modelos 3D propios en blender: kart, pista, personajes y escenarios |

**Problem:** Un kart racing creíble exige físicas arcade bien parametrizadas, una IA rival que compita de verdad y un loop de partida completo, no un demo técnico. Partimos de la base oficial de Unity y la convertimos en juego propio: integramos la IA rival con Reinforcement Learning y la hicimos funcionar en un nivel de carrera; en el resto, los rivales replican los movimientos del jugador principal, con 5 niveles encadenados hasta los créditos.

**Role**

- Lideré el proyecto (~80%): código, gameplay, integración de ML-Agents, flujo de niveles, dirección e integración.
- Integré la IA rival con Reinforcement Learning y la hice funcionar en un nivel de carrera: comparte la entrada del jugador, observa con sensores de distancia, velocidad y dirección al punto de control, con recompensas por progreso y penalizaciones por choque, en modos entrenamiento e inferencia. En el resto de niveles, los rivales replican los movimientos del jugador principal.
- Modelé en Blender los assets propios: personajes (Grinch, Santa, Mono de Nieve y Pingüino), sus vehículos, pista y escenarios; HUD navideño, trailer y créditos en video y audio propios.
- Diseñé el flujo de partida encadenando 5 niveles hasta los créditos (modifiqué `GameFlowManager`).

**Solution**

- **Arquitectura en capas** con `asmdefs` bien definidos (KartGame, KartGame.Editor, KartGame.AI, KartGame.AI.Editor).
- **IA rival que aprende a conducir:** integramos el módulo de Reinforcement Learning en nuestro proyecto y lo hicimos funcionar en un nivel de carrera. Usa la misma entrada que el jugador, así el kart no distingue quién lo maneja. Detecta la pista con sensores de distancia, mide su velocidad y apunta al siguiente punto de control; gana puntos por avanzar rápido y los pierde por chocar. En el resto de niveles, los rivales replican los movimientos del jugador principal.
- **Física arcade:** Rigidbody + 4 WheelColliders, suspensión parametrizada (tunable sin código), derrape con VFX, power-ups extensibles (`struct Stats`), `KartBounce` y reorientación aérea al caer.
- **Flujo de partida:** 5 niveles encadenados dentro de una misma partida, victoria/derrota y pantalla de créditos con video.
- **Modelos 3D y dirección:** assets originales en Blender, arte navideño y trailer/créditos en video y audio propios.

**Stack**

- Unity 2021.3.8f1 LTS (URP, Forward, lineal)
- C# · Cinemachine · ProBuilder · Timeline · TextMeshPro
- ML-Agents · Barracuda · Burst
- Blender (modelos y animaciones)

**Gallery**

1. Pantalla de inicio de Grinchmas Kart
2. Gameplay del nivel 1 de Grinchmas Kart
3. Cuenta atrás de la carrera en Grinchmas Kart
4. Pantalla de victoria de Grinchmas Kart

**CTA:** ¿Quieres ver cómo se entrena una IA para jugar con Reinforcement Learning dentro de un juego Unity? Hablemos.

**Arquitectura (árbol)**

- Arquitectura en capas (Presentación → Sistemas de juego → Física/Gameplay → Controladores → Input), con `asmdefs` bien definidos.
- IA con Reinforcement Learning (ML-Agents): el rival comparte la misma interfaz `IInput` que el jugador.
- Física arcade: Rigidbody + 4 WheelColliders, suspensión parametrizada, derrape con VFX y power-ups extensibles.
- Flujo de partida: 5 niveles encadenados, victoria/derrota y créditos con video.
- Modelos 3D y dirección: assets originales en Blender (Grinch, Santa, Mono de Nieve y Pingüino, con sus vehículos, pista y escenarios), HUD y trailer propios.

---

## 2. Cumyxel 2D

### Brief — card del grid

| Campo | Valor |
| --- | --- |
| `id` | `cumyxel` |
| `title` | Cumyxel 2D |
| `category` | Game Dev / Unity |
| `hook` | Juego de plataformas 2D pixel-art con todo el gameplay escrito desde cero y escenarios y animaciones hechos a mano: salto variable, combate con disparo y enemigos con máquina de estados. |
| `metric` | Mejor Videojuego — Expo Proyectos, Universidad Tecnológica de León |
| `tags` | Unity · C# · Blender |
| `image` | `/images/projects/cumyxel/nivel1.webp` |
| `imageAlt` | Gameplay de Cumyxel: juego de plataformas 2D pixel-art con enemigos y salto variable |
| `links` | Repo MIT: [Cumyxel-code](https://github.com/MaxGB23/Cumyxel-code) · Demo: [Google Drive](https://drive.google.com/drive/folders/1bSRON0fCKFBL4qX8gPyTn4LXYGR9Vv6O?usp=sharing) |

### Detail

**Headline:** Un juego de plataformas 2D hecho de la física al pixel-art, reconocido como Mejor Videojuego

**Summary:** Cumyxel (2D, ene – abr 2024) es un juego de plataformas 2D pixel-art de ABMODEL Games, equipo universitario de 4 integrantes. Escribí todo el gameplay y armé a mano los escenarios (tilesets) y las animaciones, usando sprites de licencia permisiva. El foco fue el game-feel: salto variable, combate con disparo como mecánica principal y enemigos que persiguen y atacan de verdad. Recibió el reconocimiento a Mejor Videojuego en la Expo Proyectos de la Universidad Tecnológica de León (abr 2024).

**Metrics**

| Value | Label |
| --- | --- |
| Mejor Videojuego | Expo Proyectos · Universidad Tecnológica de León (abr 2024) |
| FSM | enemigos con máquina de estados: idle → persecución → ataque |
| A mano | escenarios y animaciones: sprites, sprite sheets, tilesets y tilemap |
| MIT | repo Cumyxel-code: el código de gameplay, separado y reusable |

**Problem:** Un juego de plataformas 2D no se sostiene con sprites decorativos: el juego exige game-feel real. El salto debía sentirse bien en dos fases, hacía falta un combate con disparo como mecánica principal, y los enemigos tenían que perseguir y atacar con lógica propia en vez de moverse en línea recta. La meta fue convertir un prototipo en un juego jugable de principio a fin.

**Role**

- Escribí todo el gameplay: salto variable en dos fases, plataformas one-way, enemigos con FSM, combate de disparo y pisotón, y un dash con onda de agua que impulsa al personaje por el mapa.
- Construí los escenarios a mano: armé tilesets y los compuse en tilemap con sprites de licencia permisiva, e integré en el motor sus colisiones, plataformas y zonas de golpe.
- Animé a mano a los personajes en Unity (Timeline), frame a frame, para ataque, movimiento y salto; prototipé animaciones en Blender.
- Publiqué y documenté: repo de contenido y un repo MIT con solo el código de gameplay (Cumyxel-code), separando código del contenido.

**Solution**

- **Salto variable** que se siente bien: corrección de gravedad en dos fases (subida sin tecla / caída) — física 2D cuidada, game-feel.
- **Combate con disparo** como mecánica principal: disparar elimina enemigos; además se les baja la vida saltando encima de ellos (pisotón).
- **Enemigos con FSM** que persiguen y atacan de verdad: por anillos de distancia idle → persecución → ataque (esqueleto arquero y murciélago).
- **Dash con onda de agua:** animación que impulsa al personaje como un boost y le permite moverse rápido por el escenario, con su efecto visual de onda de agua.
- **Escenarios a mano:** tilesets armados y compuestos en tilemap a partir de sprites de licencia permisiva, con colisiones, plataformas one-way y zonas de golpe integradas en el motor.
- **Animación a mano:** personajes animados frame a frame en Unity (Timeline) para ataque, movimiento y salto, con prototipos en Blender.
- **Cumyxel-code:** repo público MIT con solo el código de gameplay, separado del contenido — mentalidad open-source.

**Stack**

- Unity 2022.3.19f1 LTS (Built-in RP, lineal)
- C# · uGUI + TextMeshPro · Mecanim · Timeline · Tilemap · Physics2D
- ~1,055 LOC en 11 scripts de gameplay
- Escenarios (tilesets) a mano con sprites de licencia permisiva · Blender para prototipos de animación

**Gallery**

1. Nivel 1 de Cumyxel
2. Combate contra el jefe en Cumyxel
3. Interacción con un NPC en Cumyxel
4. Tutorial de Cumyxel

**CTA:** ¿Quieres ver un juego de plataformas 2D completo, de la física al pixel-art, con todo el gameplay escrito desde cero? Hablemos.

**Arquitectura (árbol)**

- Salto variable: corrección de gravedad en dos fases.
- Combate con disparo: mecánica principal; disparar elimina enemigos y el pisotón les baja la vida.
- Enemigos con FSM: por anillos de distancia idle → persecución → ataque.
- Plataformas one-way con `Physics2D.IgnoreCollision` y par trigger/collider.
- Dash con onda de agua: boost de movimiento rápido por el escenario.
- Escenarios y tilesets a mano: sprites de licencia permisiva, tilesets y tilemap con colisiones.
- Animación a mano: frame a frame en Unity (Timeline), prototipos en Blender.
- Cumyxel-code: repo público MIT con solo el código de gameplay.

---

## Análisis crítico — ⛔ NO_PUBLICO (no exponer en el portfolio; material de entrevista)

> Regla del usuario (2026-08-28): **siempre dar la mejor cara**. Los reclutadores no ven esta sección.
> Uso: si preguntan por riesgos/mejoras en entrevista, aquí está el material para responder con honestidad y solvencia.

- **Kart:** IA sin modelo entrenado en el repo (integración correcta a nivel de API, entrenamiento externo documentado como roadmap); tags vacíos en `TagManager` mientras scripts comparan por tag; escenas hardcodeadas en `GameFlowManager`; modelo del reno (`RenoFinal.blend`) de origen no verificado, excluido de la distribución pública y pendiente de reemplazo (uso no comercial).
- **2D:** dependencia no declarada (Cinemachine usado pero no instalado); GUID roto de `WayPoint.cs` (scripts missing); tags/layers sin definir; sistema de daño/vida pendiente.
- Mejoras priorizadas: resolver tags, alinear input, instalar/quitar Cinemachine, regenerar `.meta`, completar el loop de combate, exportar el modelo ML.

## Licencias

- **Grinchmas Kart:** código, modelos y assets originales © 2026 ABMODEL Games — All rights reserved. Terceros conservan sus licencias (Karting Microgame — Unity Companion License; Mixamo — uso comercial ilimitado).
- **Cumyxel-code:** código bajo MIT (assets/escenas no incluidos, CraftPix freebies). Los sprites y personajes usados en el juego provienen de assets con licencia permisiva, no son de autoría propia; sí lo son el diseño de escenarios (tilesets), las animaciones y todo el gameplay.

## Estado y fuentes

- ✅ Código recuperado, revisado contra el código fuente y publicado en GitHub: [Grinchmas-Kart](https://github.com/MaxGB23/Grinchmas-Kart), [Cumyxel](https://github.com/MaxGB23/Cumyxel), [Cumyxel-code](https://github.com/MaxGB23/Cumyxel-code) (MIT); demos jugables en [Google Drive](https://drive.google.com/drive/folders/1bSRON0fCKFBL4qX8gPyTn4LXYGR9Vv6O?usp=sharing) (uso de portfolio, no comerciales).
- ✅ Capturas reales servidas en webp desde `public/images/projects/`.
- Fuente detallada: `docs/projects/drafts/unity/PORTFOLIO-DETALLADO.md` y `PORTFOLIO-RESUMEN.md`.

## Contexto de carrera

Mis primeros proyectos formales de game dev — y el origen de dos habilidades que hoy definen mi especialidad: la **IA aprendida con RL** (el primer "comportamiento inteligente" que escribí, ahora aplicado en la ingeniería de agentes de IA) y la **dirección técnica** (~80% de un proyecto en equipo de 4). Cumyxel sumó además un reconocimiento externo (Mejor Videojuego, Expo Proyectos UTL 2024) y un repo open-source (MIT). Los repos y demos publicados completan la evidencia con código real.
