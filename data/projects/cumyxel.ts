// Ficha `cumyxel` en el shape bilingue `ProjectL`.
//
// Copy ES VERBATIM: es el copy editorial ya auditado contra el repo real
// (docs/projects/candidatos/unity-games-portfolio.md). No se reescribe ni se
// "mejora": la migracion solo agrega la hoja `en` al lado, nunca al texto de
// origen.
//
// Repos: github.com/MaxGB23/Cumyxel-code (MIT, solo codigo de gameplay)
//
// CONTRATO DE ORDEN (ver ProjectL.detail.metrics): `metrics[0]` es la metrica
// raiz del detail, y el orden de `metrics`, `role`, `solution` y `gallery` es
// contrato de layout (KpiGrid de 2 columnas, nodo raiz de la topologia). No
// reordenar al anadir el `en`.
//
// NOMBRE DE LA INSTITUCION: el ES dice "Universidad Tecnologica de Leon". El EN
// usa "Leon Technological University" (la ciudad como nombre propio delante,
// orden natural en ingles) y "Expo Proyectos" -> "Projects Expo". Es una
// traduccion de nombre, no una identificacion nueva: no se agregan ni se quitan
// fechas. Mismo tratamiento en `metric` y en `metrics[0]`.

import type { ProjectL } from "./types";

export const cumyxel: ProjectL = {
  id: "cumyxel",
  title: {
    // Nombre propio del juego: identidad a proposito.
    es: "Cumyxel 2D",
    en: "Cumyxel 2D",
  },
  category: {
    // "Game Dev" y "Unity" ya son los terminos del sector en ingles:
    // traducirlos seria inventar jerga. Idéntico al ES a proposito.
    es: "Game Dev / Unity",
    en: "Game Dev / Unity",
  },
  hook: {
    es: "Juego de plataformas 2D pixel-art con todo el gameplay escrito desde cero y escenarios y animaciones hechos a mano: salto variable, combate con disparo y enemigos con máquina de estados.",
    en: "2D pixel-art platformer with all the gameplay written from scratch and hand-made scenery and animation: variable jump height, shooting combat and enemies with a state machine.",
  },
  metric: {
    es: "Mejor Videojuego — Expo Proyectos, Universidad Tecnológica de León",
    en: "Best Video Game — Projects Expo, León Technological University",
  },
  tags: ["Unity", "C#", "Blender"],
  image: "/images/projects/cumyxel/nivel1.webp",
  imageAlt: {
    es: "Gameplay de Cumyxel: juego de plataformas 2D pixel-art con enemigos y salto variable",
    en: "Cumyxel gameplay: 2D pixel-art platformer with enemies and variable jump height",
  },
  links: [
    {
      label: {
        // Nombre del repo + sigla de licencia: identidad a proposito.
        es: "Cumyxel (MIT)",
        en: "Cumyxel (MIT)",
      },
      kind: "code",
      url: "https://github.com/MaxGB23/Cumyxel-code",
      external: true,
    },
    {
      label: {
        es: "Ver demo",
        en: "View demo",
      },
      kind: "demo",
      url: "https://drive.google.com/drive/folders/1bSRON0fCKFBL4qX8gPyTn4LXYGR9Vv6O?usp=sharing",
      external: true,
    },
  ],
  detail: {
    headline: {
      es: "Un juego de plataformas 2D hecho de la física al pixel-art, reconocido como Mejor Videojuego",
      en: "A 2D platformer built from physics to pixel-art, awarded Best Video Game",
    },
    summary: {
      es: "Cumyxel (2D, ene – abr 2024) es un juego de plataformas 2D pixel-art de ABMODEL Games, equipo universitario de 4 integrantes. Escribí todo el gameplay y armé a mano los escenarios (tilesets) y las animaciones, usando sprites de licencia permisiva. El foco fue el game-feel: salto variable, combate con disparo como mecánica principal y enemigos que persiguen y atacan de verdad. Recibió el reconocimiento a Mejor Videojuego en la Expo Proyectos de la Universidad Tecnológica de León (abr 2024).",
      // La copia ES no lleva pares `**`: el EN tampoco los inventa (docs/i18n.md:25).
      en: "Cumyxel (2D, Jan – Apr 2024) is a 2D pixel-art platformer from ABMODEL Games, a four-person university team. I wrote all the gameplay and hand-built the scenery (tilesets) and the animations, using permissively licensed sprites. The focus was game-feel: variable jump height, shooting combat as the core mechanic and enemies that genuinely chase and attack. It received the Best Video Game award at the Projects Expo of León Technological University (Apr 2024).",
    },
    metrics: [
      {
        // metrics[0] = metrica RAIZ del detail (nodo raiz de la topologia).
        value: {
          es: "Mejor Videojuego",
          en: "Best Video Game",
        },
        label: {
          es: "Expo Proyectos · Universidad Tecnológica de León (abr 2024)",
          en: "Projects Expo · León Technological University (Apr 2024)",
        },
      },
      {
        value: {
          // Sigla de patron de diseno: identidad a proposito.
          es: "FSM",
          en: "FSM",
        },
        label: {
          es: "enemigos con máquina de estados: idle → persecución → ataque",
          en: "enemies with a state machine: idle → chase → attack",
        },
      },
      {
        value: {
          // Valor cualitativo ("hecho a mano"), no una cifra: se traduce el
          // significado. El EN es mas corto porque "hand-made" es una sola palabra.
          es: "A mano",
          en: "Hand-made",
        },
        label: {
          es: "escenarios y animaciones: sprites, sprite sheets, tilesets y tilemap",
          en: "scenery and animation: sprites, sprite sheets, tilesets and tilemap",
        },
      },
      {
        value: {
          // Sigla de licencia: identidad a proposito.
          es: "MIT",
          en: "MIT",
        },
        label: {
          es: "repo Cumyxel-code: el código de gameplay, separado y reusable",
          en: "Cumyxel-code repo: the gameplay code, separated and reusable",
        },
      },
    ],
    visual: {
      src: "/images/projects/cumyxel/logo.webp",
      alt: {
        es: "Logotipo de Cumyxel",
        en: "Cumyxel logo",
      },
    },
    problem: {
      es: "Un juego de plataformas 2D no se sostiene con sprites decorativos: el juego exige game-feel real. El salto debía sentirse bien en dos fases, hacía falta un combate con disparo como mecánica principal, y los enemigos tenían que perseguir y atacar con lógica propia en vez de moverse en línea recta. La meta fue convertir un prototipo en un juego jugable de principio a fin.",
      en: "A 2D platformer does not hold up with decorative sprites: the game demands real game-feel. The jump had to feel right in two phases, shooting combat was needed as the core mechanic, and enemies had to chase and attack with their own logic instead of moving in a straight line. The goal was to turn a prototype into a playable game from start to finish.",
    },
    role: [
      {
        es: "Escribí todo el gameplay: salto variable en dos fases, plataformas one-way, enemigos con FSM, combate de disparo y pisotón, y un dash con onda de agua que impulsa al personaje por el mapa.",
        en: "I wrote all the gameplay: two-phase variable jump height, one-way platforms, enemies with an FSM, shooting combat and a stomp, plus a water-wave dash that propels the character across the map.",
      },
      {
        es: "Construí los escenarios a mano: armé tilesets y los compuse en tilemap con sprites de licencia permisiva, e integré en el motor sus colisiones, plataformas y zonas de golpe.",
        en: "I built the scenery by hand: I assembled tilesets and composed them into a tilemap with permissively licensed sprites, and wired their collisions, platforms and hit zones into the engine.",
      },
      {
        es: "Animé a mano a los personajes en Unity (Timeline), frame a frame, para ataque, movimiento y salto; prototipé animaciones en Blender.",
        en: "I hand-animated the characters in Unity (Timeline), frame by frame, for attack, movement and jump; I prototyped the animations in Blender.",
      },
      {
        es: "Publiqué y documenté: repo de contenido y un repo MIT con solo el código de gameplay (Cumyxel-code), separando código del contenido.",
        en: "I published and documented: a content repository and an MIT repository with the gameplay code only (Cumyxel-code), separating code from content.",
      },
    ],
    solution: [
      {
        // Cada `**Label:**` abre y cierra aqui, igual que en el ES.
        es: "**Salto variable** que se siente bien: corrección de gravedad en dos fases (subida sin tecla / caída) — física 2D cuidada, game-feel.",
        en: "**Variable jump height** that feels right: two-phase gravity correction (rising without input / falling) — carefully tuned 2D physics, game-feel.",
      },
      {
        es: "**Combate con disparo** como mecánica principal: disparar elimina enemigos; además se les baja la vida saltando encima de ellos (pisotón).",
        en: "**Shooting combat** as the core mechanic: shooting eliminates enemies; you can also reduce their health by jumping on top of them (stomp).",
      },
      {
        es: "**Enemigos con FSM** que persiguen y atacan de verdad: por anillos de distancia idle → persecución → ataque (esqueleto arquero y murciélago).",
        en: "**Enemies with an FSM** that genuinely chase and attack: distance rings idle → chase → attack (archer skeleton and bat).",
      },
      {
        es: "**Dash con onda de agua:** animación que impulsa al personaje como un boost y le permite moverse rápido por el escenario, con su efecto visual de onda de agua.",
        en: "**Water-wave dash:** an animation that propels the character like a boost and lets it move fast across the scenery, with its water-wave visual effect.",
      },
      {
        es: "**Escenarios a mano:** tilesets armados y compuestos en tilemap a partir de sprites de licencia permisiva, con colisiones, plataformas one-way y zonas de golpe integradas en el motor.",
        en: "**Hand-built scenery:** tilesets assembled and composed into a tilemap from permissively licensed sprites, with collisions, one-way platforms and hit zones wired into the engine.",
      },
      {
        es: "**Animación a mano:** personajes animados frame a frame en Unity (Timeline) para ataque, movimiento y salto, con prototipos en Blender.",
        en: "**Hand-made animation:** characters animated frame by frame in Unity (Timeline) for attack, movement and jump, with prototypes in Blender.",
      },
      {
        es: "**Cumyxel-code:** repo público MIT con solo el código de gameplay, separado del contenido — mentalidad open-source.",
        en: "**Cumyxel-code:** public MIT repository with the gameplay code only, separated from the content — an open-source mindset.",
      },
    ],
    // Etiqueta traducida, nombre de stack intacto.
    stack: [
      {
        es: "Unity 2022.3.19f1 LTS (Built-in RP, lineal)",
        en: "Unity 2022.3.19f1 LTS (Built-in RP, linear)",
      },
      {
        // Nombres de herramientas de Unity: identidad a proposito.
        es: "C# · uGUI + TextMeshPro · Mecanim · Timeline · Tilemap · Physics2D",
        en: "C# · uGUI + TextMeshPro · Mecanim · Timeline · Tilemap · Physics2D",
      },
      {
        es: "~1,055 LOC en 11 scripts de gameplay",
        en: "~1,055 LOC in 11 gameplay scripts",
      },
      {
        es: "Escenarios (tilesets) a mano con sprites de licencia permisiva · Blender para prototipos de animación",
        en: "Hand-built scenery (tilesets) with permissively licensed sprites · Blender for animation prototypes",
      },
    ],
    gallery: [
      {
        src: "/images/projects/cumyxel/nivel1.webp",
        alt: {
          es: "Nivel 1 de Cumyxel",
          en: "Cumyxel level 1",
        },
      },
      {
        src: "/images/projects/cumyxel/bossfight.webp",
        alt: {
          es: "Combate contra el jefe en Cumyxel",
          en: "Boss fight in Cumyxel",
        },
      },
      {
        src: "/images/projects/cumyxel/npc-interaction.webp",
        alt: {
          es: "Interacción con un NPC en Cumyxel",
          en: "NPC interaction in Cumyxel",
        },
      },
      {
        src: "/images/projects/cumyxel/tutorial.webp",
        alt: {
          es: "Tutorial de Cumyxel",
          en: "Cumyxel tutorial",
        },
      },
    ],
    cta: {
      es: "¿Quieres ver un juego de plataformas 2D completo, de la física al pixel-art, con todo el gameplay escrito desde cero? Hablemos.",
      en: "Want to see a complete 2D platformer, from physics to pixel-art, with all the gameplay written from scratch? Let's talk.",
    },
  },
  architecture: {
    name: {
      es: "Cumyxel 2D",
      en: "Cumyxel 2D",
    },
    description: {
      es: "Plataformero 2D pixel-art con game-feel real: salto variable, combate con disparo como mecánica principal y enemigos con FSM; escribí todo el gameplay y armé a mano escenarios y animaciones.",
      en: "2D pixel-art platformer with real game-feel: variable jump height, shooting combat as the core mechanic and enemies with an FSM; I wrote all the gameplay and hand-built the scenery and animation.",
    },
    children: [
      {
        name: {
          es: "Salto variable",
          en: "Variable jump height",
        },
        description: {
          es: "Corrección de gravedad en dos fases (subida sin tecla / caída) — física 2D cuidada.",
          en: "Two-phase gravity correction (rising without input / falling) — carefully tuned 2D physics.",
        },
      },
      {
        name: {
          es: "Combate con disparo",
          en: "Shooting combat",
        },
        description: {
          es: "Mecánica principal del juego: disparar elimina enemigos; además se les baja la vida con un pisotón saltando encima.",
          en: "The game's core mechanic: shooting eliminates enemies; their health can also be reduced with a stomp by jumping on top of them.",
        },
      },
      {
        name: {
          es: "Enemigos con FSM",
          en: "Enemies with an FSM",
        },
        description: {
          // "coroutines" es el nombre del tipo de Unity, no se traduce.
          es: "Por anillos de distancia: idle → persecución → ataque (esqueleto arquero y murciélago), proyectiles por corrutinas.",
          en: "By distance rings: idle → chase → attack (archer skeleton and bat), projectiles via coroutines.",
        },
      },
      {
        name: {
          // "one-way platforms" ya es el termino ingles del patron: identidad.
          es: "Plataformas one-way",
          en: "One-way platforms",
        },
        description: {
          es: "Implementadas con Physics2D.IgnoreCollision y par trigger/collider.",
          en: "Implemented with Physics2D.IgnoreCollision and a trigger/collider pair.",
        },
      },
      {
        name: {
          es: "Dash con onda de agua",
          en: "Water-wave dash",
        },
        description: {
          es: "Animación que impulsa al personaje como un boost para moverse rápido por el escenario, con su efecto visual de onda de agua.",
          en: "An animation that propels the character like a boost to move fast across the scenery, with its water-wave visual effect.",
        },
      },
      {
        name: {
          es: "Escenarios y tilesets a mano",
          en: "Hand-built scenery and tilesets",
        },
        description: {
          es: "Niveles armados a mano con tilesets y tilemap a partir de sprites de licencia permisiva; colisiones, plataformas y zonas de golpe integradas en el motor.",
          en: "Levels built by hand with tilesets and tilemap from permissively licensed sprites; collisions, platforms and hit zones wired into the engine.",
        },
      },
      {
        name: {
          es: "Animación a mano",
          en: "Hand-made animation",
        },
        description: {
          es: "Personajes animados frame a frame en Unity (Timeline) para ataque, movimiento y salto; prototipos en Blender.",
          en: "Characters animated frame by frame in Unity (Timeline) for attack, movement and jump; prototypes in Blender.",
        },
      },
      {
        name: {
          es: "Cumyxel-code",
          en: "Cumyxel-code",
        },
        description: {
          es: "Repo público MIT con solo el código de gameplay: separa código del contenido y muestra mentalidad open-source.",
          en: "Public MIT repository with the gameplay code only: it separates code from content and shows an open-source mindset.",
        },
      },
    ],
  },
};