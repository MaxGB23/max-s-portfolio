// Ficha `grinchmas-kart` en el shape bilingue `ProjectL`.
//
// Copy ES VERBATIM: es el copy editorial ya auditado contra el repo real
// (docs/projects/candidatos/unity-games-portfolio.md). No se reescribe ni se
// "mejora": la hoja `en` va al lado, nunca dentro del texto de origen.
//
// Repos: github.com/MaxGB23/Grinchmas-Kart
//
// CONTRATO DE ORDEN (ver ProjectL.detail.metrics): `metrics[0]` es la metrica
// raiz del detail, y el orden de `metrics`, `role`, `solution` y `gallery` es
// contrato de layout (KpiGrid de 2 columnas, nodo raiz de la topologia). No
// reordenar al anadir el `en`.
//
// `tags` (Unity, C#, Blender, ML-Agents) esta APROBADO por el usuario: son los
// cuatro nombres de stack que el producto usa, no se tocan al anadir el `en`.
//
// `metrics[0]` ("RL") y `metrics[1]` ("5") son tokens/valores, no frases: el EN
// traduce por identidad. En `metrics[3].label` el ES escribe "blender" en
// minuscula; el EN usa "Blender" porque es nombre propio de la herramienta.

import { linkLabelCode, linkLabelDemo, type ProjectL } from "./types";

export const grinchmasKart: ProjectL = {
  id: "grinchmas-kart",
  title: {
    // Nombre propio del juego: identidad a proposito.
    es: "Grinchmas Kart",
    en: "Grinchmas Kart",
  },
  category: {
    // "Game Dev" y "Unity" ya son los terminos del sector en ingles:
    // traducirlos seria inventar jerga. Idéntico al ES a proposito.
    es: "Game Dev / Unity",
    en: "Game Dev / Unity",
  },
  hook: {
    es: "Kart racing 3D end-to-end (ABMODEL Games) con IA rival entrenada con Reinforcement Learning (ML-Agents), físicas arcade y modelos 3D propios en Blender.",
    en: "End-to-end 3D kart racing (ABMODEL Games) with a rival AI trained with Reinforcement Learning (ML-Agents), arcade physics and custom 3D models in Blender.",
  },
  metric: {
    es: "IA rival entrenada con Reinforcement Learning",
    en: "Rival AI trained with Reinforcement Learning",
  },
  tags: ["Unity", "C#", "Blender", "ML-Agents"],
  image: "/images/projects/grinchmas-kart/inicio.webp",
  imageAlt: {
    es: "Gameplay de Grinchmas Kart: kart 3D en pista navideña con IA rival",
    en: "Grinchmas Kart gameplay: 3D kart on a Christmas track with a rival AI",
  },
  links: [
    {
      label: linkLabelCode,
      kind: "code",
      url: "https://github.com/MaxGB23/Grinchmas-Kart",
      external: true,
    },
    {
      label: linkLabelDemo,
      kind: "demo",
      url: "https://drive.google.com/drive/folders/1bSRON0fCKFBL4qX8gPyTn4LXYGR9Vv6O?usp=sharing",
      external: true,
    },
  ],
  detail: {
    headline: {
      es: "Lideré un kart 3D en equipo de 4 y le enseñé al rival a conducir solo",
      en: "I led a 3D kart project with a team of 4 and taught the rival to drive on its own",
    },
    summary: {
      es: "Grinchmas Kart (3D, sep – dic 2023) es un kart racing end-to-end de ABMODEL Games, equipo universitario de 4 integrantes. Lideré ~80% del proyecto: código, gameplay, IA, flujo de niveles, dirección y modelos 3D propios en Blender. El objetivo fue superar el juego de muestra oficial (Karting Microgame 5.0.1) con físicas arcade creíbles y un rival que aprende a conducir con Reinforcement Learning.",
      // La copia ES no lleva pares `**`: el EN tampoco los inventa (docs/i18n.md:25).
      en: "Grinchmas Kart (3D, Sep – Dec 2023) is an end-to-end kart racing game from ABMODEL Games, a four-person university team. I led ~80% of the project: code, gameplay, AI, level flow, direction and custom 3D models in Blender. The goal was to surpass the official sample game (Karting Microgame 5.0.1) with believable arcade physics and a rival that learns to drive with Reinforcement Learning.",
    },
    metrics: [
      {
        // metrics[0] = metrica RAIZ del detail (nodo raiz de la topologia).
        value: {
          // Sigla tecnica de Reinforcement Learning: identidad a proposito.
          es: "RL",
          en: "RL",
        },
        label: {
          es: "IA rival con reinforcement learning en un nivel de carrera",
          en: "rival AI with reinforcement learning on one race level",
        },
      },
      {
        value: {
          // Cifra pura: identidad (no hay palabra que traducir).
          es: "5",
          en: "5",
        },
        label: {
          es: "niveles encadenados en la misma partida hasta los créditos",
          en: "levels chained in the same run through the credits",
        },
      },
      {
        value: {
          es: "~80%",
          en: "~80%",
        },
        label: {
          es: "del proyecto liderado en equipo de 4: código, IA, flujo y 3D",
          en: "of the project I led with a team of 4: code, AI, flow and 3D",
        },
      },
      {
        value: {
          es: "8",
          en: "8",
        },
        label: {
          es: "modelos 3D propios en blender: kart, pista, personajes y escenarios",
          en: "custom 3D models in Blender: kart, track, characters and scenery",
        },
      },
    ],
    problem: {
      es: "Un kart racing creíble exige físicas arcade bien parametrizadas, una IA rival que compita de verdad y un loop de partida completo, no un demo técnico. Partimos de la base oficial de Unity y la convertimos en juego propio: integramos la IA rival con Reinforcement Learning y la hicimos funcionar en un nivel de carrera; en el resto, los rivales replican los movimientos del jugador principal, con 5 niveles encadenados hasta los créditos.",
      en: "A believable kart racer requires well-tuned arcade physics, a rival AI that genuinely competes and a complete match loop, not a tech demo. We started from the official Unity base and turned it into our own game: we integrated the rival AI with Reinforcement Learning and made it work on one race level; elsewhere, the rivals replicate the main player's movements, with 5 levels chained through the credits.",
    },
    role: [
      {
        es: "Lideré el proyecto (~80%): código, gameplay, integración de ML-Agents, flujo de niveles, dirección e integración.",
        en: "I led the project (~80%): code, gameplay, ML-Agents integration, level flow, direction and integration.",
      },
      {
        es: "Integré la IA rival con Reinforcement Learning y la hice funcionar en un nivel de carrera: comparte la entrada del jugador, observa con sensores de distancia, velocidad y dirección al punto de control, con recompensas por progreso y penalizaciones por choque, en modos entrenamiento e inferencia. En el resto de niveles, los rivales replican los movimientos del jugador principal.",
        en: "I integrated the rival AI with Reinforcement Learning and made it work on one race level: it shares the player's input, observes through distance, speed and direction sensors toward the control point, with rewards for progress and penalties for crashing, in training and inference modes. In the remaining levels, the rivals replicate the main player's movements.",
      },
      {
        es: "Modelé en Blender los assets propios: personajes (Grinch, Santa, Mono de Nieve y Pingüino), sus vehículos, pista y escenarios; HUD navideño, trailer y créditos en video y audio propios.",
        // "Mono de Nieve" / "Pingüino" son los personajes del juego, pero el ES ya
        // deja "Grinch" y "Santa" en ingles: el EN usa los nombres en ingles.
        en: "I modeled our own assets in Blender: characters (Grinch, Santa, Snowman and Penguin), their vehicles, track and scenery; Christmas HUD, trailer and credits in custom video and audio.",
      },
      {
        es: "Diseñé el flujo de partida encadenando 5 niveles hasta los créditos (modifiqué `GameFlowManager`).",
        en: "I designed the match flow by chaining 5 levels through the credits (I modified `GameFlowManager`).",
      },
    ],
    solution: [
      {
        // Cada `**Label:**` abre y cierra aqui, igual que en el ES.
        es: "**Arquitectura en capas** con `asmdefs` bien definidos (KartGame, KartGame.Editor, KartGame.AI, KartGame.AI.Editor).",
        en: "**Layered architecture** with well-defined `asmdefs` (KartGame, KartGame.Editor, KartGame.AI, KartGame.AI.Editor).",
      },
      {
        es: "**IA rival que aprende a conducir:** integramos el módulo de Reinforcement Learning en nuestro proyecto y lo hicimos funcionar en un nivel de carrera. Usa la misma entrada que el jugador, así el kart no distingue quién lo maneja. Detecta la pista con sensores de distancia, mide su velocidad y apunta al siguiente punto de control; gana puntos por avanzar rápido y los pierde por chocar. En el resto de niveles, los rivales replican los movimientos del jugador principal.",
        en: "**A rival AI that learns to drive:** we integrated the Reinforcement Learning module into our project and made it work on one race level. It uses the same input as the player, so the kart cannot tell who is driving it. It detects the track with distance sensors, measures its speed and aims for the next checkpoint; it earns points for moving fast and loses them by crashing. In the remaining levels, the rivals replicate the main player's movements.",
      },
      {
        es: "**Física arcade:** Rigidbody + 4 WheelColliders, suspensión parametrizada (tunable sin código), derrape con VFX, power-ups extensibles (`struct Stats`), `KartBounce` y reorientación aérea al caer.",
        en: "**Arcade physics:** Rigidbody + 4 WheelColliders, parameterized suspension (tunable without code), drift with VFX, extensible power-ups (`struct Stats`), `KartBounce` and mid-air reorientation when falling.",
      },
      {
        es: "**Flujo de partida:** 5 niveles encadenados dentro de una misma partida, victoria/derrota y pantalla de créditos con video.",
        en: "**Match flow:** 5 levels chained within a single run, win/lose and a credits screen with video.",
      },
      {
        es: "**Modelos 3D y dirección:** assets originales en Blender, arte navideño y trailer/créditos en video y audio propios.",
        en: "**3D models and direction:** original assets in Blender, Christmas art and a custom video/audio trailer and credits.",
      },
    ],
    // Etiqueta traducida, nombre de stack intacto.
    stack: [
      {
        es: "Unity 2021.3.8f1 LTS (URP, Forward, lineal)",
        en: "Unity 2021.3.8f1 LTS (URP, Forward, linear)",
      },
      {
        // Nombres de herramientas: identidad a proposito.
        es: "C# · Cinemachine · ProBuilder · Timeline · TextMeshPro",
        en: "C# · Cinemachine · ProBuilder · Timeline · TextMeshPro",
      },
      {
        es: "ML-Agents · Barracuda · Burst",
        en: "ML-Agents · Barracuda · Burst",
      },
      {
        es: "Blender (modelos y animaciones)",
        en: "Blender (models and animation)",
      },
    ],
    gallery: [
      {
        src: "/images/projects/grinchmas-kart/inicio.webp",
        alt: {
          es: "Pantalla de inicio de Grinchmas Kart",
          en: "Grinchmas Kart title screen",
        },
      },
      {
        src: "/images/projects/grinchmas-kart/nivel1.webp",
        alt: {
          es: "Gameplay del nivel 1 de Grinchmas Kart",
          en: "Grinchmas Kart level 1 gameplay",
        },
      },
      {
        src: "/images/projects/grinchmas-kart/countdown.webp",
        alt: {
          es: "Cuenta atrás de la carrera en Grinchmas Kart",
          en: "Race countdown in Grinchmas Kart",
        },
      },
      {
        src: "/images/projects/grinchmas-kart/victoria.webp",
        alt: {
          es: "Pantalla de victoria de Grinchmas Kart",
          en: "Grinchmas Kart victory screen",
        },
      },
    ],
    cta: {
      es: "¿Quieres ver cómo se entrena una IA para jugar con Reinforcement Learning dentro de un juego Unity? Hablemos.",
      en: "Want to see how an AI is trained to play with Reinforcement Learning inside a Unity game? Let's talk.",
    },
  },
  architecture: {
    name: {
      es: "Grinchmas Kart",
      en: "Grinchmas Kart",
    },
    description: {
      es: "Kart racing 3D end-to-end sobre el template Karting Microgame 5.0.1: físicas arcade creíbles y un rival que aprende a conducir con Reinforcement Learning (ML-Agents).",
      en: "End-to-end 3D kart racing on the Karting Microgame 5.0.1 template: believable arcade physics and a rival that learns to drive with Reinforcement Learning (ML-Agents).",
    },
    children: [
      {
        name: {
          es: "Arquitectura en capas",
          en: "Layered architecture",
        },
        description: {
          es: "Presentación → Sistemas de juego → Física/Gameplay → Controladores → Input, con asmdefs bien definidos (KartGame, KartGame.Editor, KartGame.AI, KartGame.AI.Editor).",
          en: "Presentation → Game systems → Physics/Gameplay → Controllers → Input, with well-defined asmdefs (KartGame, KartGame.Editor, KartGame.AI, KartGame.AI.Editor).",
        },
        children: [
          {
            name: {
              es: "Presentación: UI + audio + cámaras (Cinemachine)",
              en: "Presentation: UI + audio + cameras (Cinemachine)",
            },
          },
          {
            name: {
              es: "Sistemas de juego: GameFlowManager, ObjectiveManager, TimeManager",
              en: "Game systems: GameFlowManager, ObjectiveManager, TimeManager",
            },
          },
          {
            name: {
              // Nombres de clases de Unity: identidad a proposito.
              es: "Física/Gameplay: ArcadeKart, KartBounce, KartAnimation",
              en: "Physics/Gameplay: ArcadeKart, KartBounce, KartAnimation",
            },
          },
          {
            name: {
              es: "Controladores intercambiables: KeyboardInput y KartAgent producen el mismo InputData",
              en: "Interchangeable controllers: KeyboardInput and KartAgent produce the same InputData",
            },
          },
        ],
      },
      {
        name: {
          es: "IA con Reinforcement Learning (ML-Agents)",
          en: "AI with Reinforcement Learning (ML-Agents)",
        },
        description: {
          es: "El rival comparte la misma interfaz IInput que el jugador: el ArcadeKart recibe un InputData sin distinguir quién lo conduce.",
          en: "The rival shares the same IInput interface as the player: the ArcadeKart receives an InputData with no distinction between who is driving it.",
        },
        children: [
          {
            name: {
              es: "Observaciones por raycasts + velocidad local + dirección al checkpoint",
              en: "Observations via raycasts + local speed + heading to the checkpoint",
            },
          },
          {
            name: {
              es: "Recompensas por progreso y velocidad, penalizaciones por choque",
              en: "Rewards for progress and speed, penalties for crashing",
            },
          },
          {
            name: {
              // Nombres literales de los modos de ML-Agents: el EN solo
              // reordena a orden de palabras ingles. No se traducen.
              es: "Modos Training/Inferencing",
              en: "Training/Inferencing modes",
            },
          },
        ],
      },
      {
        name: {
          es: "Física arcade",
          en: "Arcade physics",
        },
        description: {
          es: "Rigidbody + 4 WheelColliders, suspensión parametrizada (tunable sin código), derrape con VFX y power-ups extensibles.",
          en: "Rigidbody + 4 WheelColliders, parameterized suspension (tunable without code), drift with VFX and extensible power-ups.",
        },
        children: [
          {
            name: {
              es: "Suspensión parametrizada",
              en: "Parameterized suspension",
            },
          },
          {
            name: {
              es: "Derrape con VFX",
              en: "Drift with VFX",
            },
          },
          {
            name: {
              es: "Power-ups extensibles (struct Stats)",
              en: "Extensible power-ups (struct Stats)",
            },
          },
        ],
      },
      {
        name: {
          es: "Flujo de partida",
          en: "Match flow",
        },
        description: {
          es: "5 niveles encadenados dentro de una misma partida, victoria/derrota y pantalla de créditos con video (GameFlowManager modificado).",
          en: "5 levels chained within a single run, win/lose and a credits screen with video (modified GameFlowManager).",
        },
        children: [
          {
            name: {
              es: "5 niveles encadenados hasta los créditos",
              en: "5 levels chained through the credits",
            },
          },
          {
            name: {
              es: "Victoria / derrota (LoseScene)",
              en: "Win / lose (LoseScene)",
            },
          },
        ],
      },
      {
        name: {
          es: "Modelos 3D y dirección",
          en: "3D models and direction",
        },
        description: {
          es: "Assets originales en Blender (Grinch, Santa, Mono de Nieve y Pingüino, con sus vehículos, pista y escenarios), HUD navideño, trailer y créditos en video y audio propios.",
          en: "Original assets in Blender (Grinch, Santa, Snowman and Penguin, with their vehicles, track and scenery), Christmas HUD, trailer and credits in custom video and audio.",
        },
      },
    ],
  },
};