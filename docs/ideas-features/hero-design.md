# Documentación de Diseño: Hero Section

Este documento detalla las estrategias de diseño y las alternativas que estamos probando para la sección principal del portafolio.

## Contexto y Problema Actual
- **Alternativa 2 (Versión Actual/Histórica):** Es la que se ha usado por defecto hasta ahora. El feedback recurrente indica que **el nombre no resalta lo suficiente**, quedando opacado o pasando desapercibido debido al gran impacto visual de la profesión ("Full Stack Developer").
- **Alternativa 1 (La Propuesta de Mejora):** Surge para solucionar esto igualando la agresividad del diseño (tipografía serif, peso black, textos enormes) para darle mayor protagonismo al nombre. Sin embargo, al nivelar tanto los estilos, nombre y rol ahora compiten por la atención primaria.

El **objetivo principal** es refinar la **Alternativa 1** para lograr un balance perfecto: que el nombre tenga suficiente "peso" para ser leído y recordado (evitando el fallo de la Alt. 2), pero sin competir destructivamente con el rol, estableciendo una jerarquía clara.

## Entorno de Pruebas
Ambas versiones coexisten en `hero-section.tsx` usando estilos de ocultamiento temporales (`hidden`, `sm:hidden`, `opacity: 0`). Esto permite tener pestañas simultáneas en el navegador (Desktop/Mobile) para ver los cambios en tiempo real y decidir cuál diseño funciona mejor en todas las resoluciones.

---

## Checklist de Propuestas para Refinar la Alternativa 1

A continuación, se presentan diferentes iteraciones de diseño para testear en la Alternativa 1. El objetivo es ir probando una por una y marcar las casillas correspondientes:

- [ ] **1. Contraste de Color y Opacidad (Restar agresividad, mantener tamaño)**
  - **Implementación técnica:** Mantener el tamaño `text-5xl` a `text-9xl` y el `font-black`, pero asignar al nombre un color atenuado como `text-muted-foreground` o `text-foreground/70`.
  - **Argumento:** Permite que el nombre sea físicamente masivo (solucionando el problema de la Alt 2) pero obliga al ojo a saltar primero al alto contraste del rol (blanco sólido).
  - **Impacto Esperado:** Retiene el aspecto monumental pero crea jerarquía mediante brillo y no por proporciones.

- [ ] **2. Efecto Brutalista Invertido (Texto Hueco)**
  - **Implementación técnica:** Aplicar `text-transparent [-webkit-text-stroke:1px_hsl(var(--foreground))]` al contenedor del nombre, conservando la tipografía y peso original.
  - **Argumento:** El contorno grueso genera una gran "huella" o presencia en pantalla sin sentirse pesado, dando la sensación de diseño premium.
  - **Impacto Esperado:** El nombre es gigantesco e imposible de ignorar, pero su interior transparente deja que el rol sea el ancla visual principal.

- [ ] **3. Escala Relativa y Proporción (Jerarquía tradicional)**
  - **Implementación técnica:** Reducir un par de posiciones de Tailwind en el nombre (ej. `text-3xl` o `text-4xl` en móvil) y asegurar que el rol sea claramente más grande (`text-6xl`). Conservar en ambos el `font-serif font-black`.
  - **Argumento:** Al usar tipografías gruesas, el nombre tiene muchísima más fuerza que en la Alternativa 2, pero una escala ligeramente reducida le indica instintivamente al cerebro que es secundario al rol.
  - **Impacto Esperado:** Una lectura súper natural sin sacrificar la modernidad brutalista de las letras densas.

- [ ] **4. Contraste Tipográfico (Sans vs. Serif)**
  - **Implementación técnica:** Dejar el rol en Serif (`font-serif font-black`) y cambiar el nombre a una fuente Sans-Serif gruesa y técnica (`font-sans font-extrabold tracking-tight uppercase`).
  - **Argumento:** Poner dos textos enormes en la misma familia tipográfica junta (`leading-[0.9]`) hace que se fusionen visualmente. Usar familias distintas rompe la monotonía.
  - **Impacto Esperado:** El nombre se procesará como un "sello de autor" corporativo, y el rol como el encabezado editorial del portafolio.

- [ ] **5. Redistribución Estratégica del Color de Acento**
  - **Implementación técnica:** Eliminar el color púrpura del nombre (dejándolo 100% `text-foreground` o un tono gris), limitando el `text-purple-accent` estrictamente a la palabra "Developer".
  - **Argumento:** El color es el elemento más potente para llamar la atención. Competir con acentos visuales confunde al espectador; la saturación debe ser exclusiva del mensaje más crítico.
  - **Impacto Esperado:** La mirada de los reclutadores se anclará de inmediato en "Developer", y luego subirán naturalmente a leer tu nombre blanco/grisáceo.

- [ ] **6. Respiración Espacial (Aislar Bloques)**
  - **Implementación técnica:** Aumentar agresivamente el margen inferior del nombre (de `mb-4` a `mb-8` o `mb-10`), o agregar una delgada línea semitransparente como divisor.
  - **Argumento:** Debido al interlineado y "tracking" cerrados, el diseño es muy apretado. El espacio en blanco es la mejor herramienta para definir agrupaciones.
  - **Impacto Esperado:** El usuario procesará la pantalla en dos piezas digeribles de información, equilibrando la escena completa.
