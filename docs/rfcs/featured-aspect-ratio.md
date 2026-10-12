# RFC: Featured projects — tamaño y relación de aspecto de imagen

> **STATUS: IMPLEMENTED 2026-10-12.**
> D implementada con variación final (ver Estado) y F2 como guard mínimo.
> Revalidado contra `origin/main` post PR #2.

## Contexto
Worktree de prueba: `featured-rfc` (base `origin/main` post PR #2). Se busca
mejorar el ajuste visual entre la columna de texto y la imagen en
`components/featured-project-panel.tsx`.
La decisión queda documentada antes de implementar porque hay más cambios
previstos para featured projects y deben evaluarse conflictos en conjunto.

## Estado base
- Grid: `grid-cols-1 lg:grid-cols-2`, `justify-center items-start`.
- Imagen: `aspect-4/3` fijo en móvil; verificar estado exacto en la base nueva
  (gap/rhythm recalibrados en PR #2).
- Efecto: ratio estable entre cards, pero en `lg` compacto (~1024-1280px) la
  columna de texto se vuelve alta y queda un hueco visible bajo la imagen.

## Opciones discutidas

### A. Solución bonita: stretch acoplado al texto
- `items-start` → `items-stretch`.
- Imagen sin ratio fija en desktop (`lg:aspect-auto lg:h-full`),
  con `lg:min-h-[28rem]` como piso. En móvil conserva `aspect-4/3`.
- Efecto: la imagen siempre llena la altura de la columna izquierda.
- Costo: la altura de la imagen depende de la cantidad de texto
  (título, hook, métricas, tags). El ratio varía entre proyectos y con el
  idioma (ES/EN). Con `object-cover` no hay deformación, solo recorte variable.

### B. Centrado vertical (descartada)
- `items-start` → `items-center` con ratio fija.
- Se testeó en una sesión anterior. Reparte el hueco arriba/abajo pero rompe
  la línea base editorial: texto e imagen dejan de compartir el punto de
  arranque superior y la lectura se siente flotante.
- La investigación coincide: para contenido editorial, `start` es mejor que
  `center`.

### C. Mover el split a `xl` (descartada)
- `lg:grid-cols-2` → `xl:grid-cols-2`. Entre 1024-1280 se mantiene apilado.
- Ataca la causa real del `lg` compacto (columnas demasiado estrechas), pero
  crea dos problemas mayores:
  1. En iPad grande / tablet (~1180px) cada panel se vuelve imagen full-width
     enorme + texto abajo, por 3. Scroll pesado.
  2. Rompe el lenguaje del resto de la app, que usa 2 cols desde `md`.
     Featured quedaría como excepción.

### D. ⭐ Tentativa final: stretch acotado (A + techo)
- Igual que A, más `lg:max-h-[36rem]` como techo (valor a calibrar en vivo).
- Piso (`min-h`) evita imagen enana con texto corto.
  Techo (`max-h`) evita imagen gigante con texto largo.
- La varianza queda contenida en una banda conocida en vez de libre.

## Justificación de la tentativa (D)
1. **Producto sobre pureza.** Es una sección de marketing con 3 proyectos donde
   cada panel llena el viewport en tablet. El scroll pesado de C duele más que
   una varianza de altura de 30-60px que nadie mide a ojo.
2. **Calidad por card intacta.** `object-cover` no deforma; cada card se ve
   llena y correcta. El defecto es solo consistencia inter-card, contenida por
   el techo.
3. **Coherencia con la app.** Conserva el split en `lg` y `items-start`,
   sin excepciones de breakpoint ni rupturas editoriales.
4. **Excepción deliberada, no patrón.** Se documenta como decisión propia de
   featured, no como regla del sistema. Si el número de proyectos o la
   longitud de textos cambia mucho, se reevalúa.

## Otras features previstas para featured

### F2. Fallback estático cuando toda la sección cabe en el viewport
- **Problema:** la one-slide rule (`featured-projects.tsx`, línea de reveal al
  60% del viewport) asume un solo panel visible a la vez. Con zoom-out extremo
  (~25% en desktop) el viewport CSS se vuelve tan alto que los 3 paneles quedan
  sobre la línea a la vez: el panel 1 nunca cumple "yo crucé y el siguiente
  no", así que la segunda card es imposible de ver (se salta de la 1 a la 3).
- **Fix propuesto:** modo estático — si la altura total de `#proyectos` cabe en
  el viewport, mostrar los 3 paneles sin animación (sin one-slide).
- **Archivos que toca:** `components/featured-projects.tsx` (rama en `evaluate()`).
- **Directriz:** detectar la condición geométrica (sección cabe), NO el nivel de
  zoom (`devicePixelRatio` es frágil). Cubre zoom-out, 4K y portrait gigante con
  la misma rama.

## Conflictos a revisar antes de implementar
- [ ] ¿Alguna feature toca el mismo grid o breakpoint (`lg` vs `xl`)?
- [ ] ¿Alguna feature cambia la longitud del texto (hooks, métricas, tags)?
      Afecta directo a la banda min/max de D.
- [ ] ¿Alguna feature cambia `object-cover`, el orden de columnas o el
      `gap`? Puede invalidar la calibración.
      (Nota: PR #2 ya recalibró gap/rhythm — revalidar la banda min/max.)
- [x] **D × F2 (acoplamiento por alturas) — resuelto (D primero, F2 después):** el stretch cambia la altura de los
      paneles y por tanto la geometría (`tops[]`) que dispara el avance, y la
      condición "cabe en viewport" de F2. Se calibró la banda min/max primero y
      después se verificó el umbral del fallback. Archivos distintos
      (`featured-project-panel.tsx` vs `featured-projects.tsx`), sin conflicto
      de merge, pero acoplamiento de comportamiento.
- [x] **F2 expone la varianza de D — resuelto (después de D):** en modo estático los 3 paneles se ven a
      la vez, así que el recorte variable entre cards SÍ es comparable ahí.
      El techo (`max-h`) de D acota el daño. Régimen rarísimo (zoom 25%),
      pero anotado para no descubrirlo después.
- [ ] Calibrar en vivo a 1024 / 1180 / 1440 los valores de `min-h` y `max-h`
      una vez congelado el contenido.

## Estado
IMPLEMENTED 2026-10-12. Variación final vs D: la banda única propuesta
(`lg:min-h-[28rem]` / `lg:max-h-[36rem]`) quedó en dos tramos tras prueba en
vivo en 10 dispositivos — `lg:min-h-[25rem] lg:max-h-[28rem]` +
`2xl:min-h-[28rem] 2xl:max-h-[36rem]`, empalme sin salto en 28rem. Guard F2
mínimo implementado: si `#proyectos` cabe en el viewport, paneles + heading
visibles sin one-slide (detección solo geométrica).
