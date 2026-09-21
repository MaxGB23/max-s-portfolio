# Snapshot pre-refactor — NO CANÓNICO

> **Congelado el 2026-09-21, antes de la reestructura a multi-archivo token canon.**
>
> Este directorio es un **backup histórico byte-igual** de `docs/design/` en su estado previo al refactor (`docs/design/README.md`, `typography-families.md`, `components.md`, `buttons.md`, `pointer-gestures.md`).
>
> ## REGLAS (innegociables)
>
> - **NO es fuente de autoridad.** Los docs canónicos vigentes viven en `docs/design/` (la raíz). Este snapshot es para consulta histórica y comparación únicamente.
> - **No se edita.** Si un valor aquí contradice a los docs vigentes o al código, los docs vigentes y el código ganan.
> - **Nunca repetir el refactor sin snapshot.** Esta copia existe para que cualquier migración futura sea auditable: nada de "lo copiamos y ya".
>
> ## Qué contenía cada archivo (glosario de migración)
>
> | Archivo | Contenido | Destino en el nuevo canon |
> |---|---|---|
> | `README.md` | Identidad, principios, índice | `docs/design/README.md` (índice nuevo) |
> | `typography-families.md` | Tablas por sección, historia, deuda, gotchas | `docs/design/typography-families.md` + `tokens.md` |
> | `components.md` | Contrato de ritmo, PageSpacing, inventario | `docs/design/components.md` |
> | `buttons.md` | Inventario botones, excepciones cerradas, deuda | `docs/design/buttons.md` |
> | `pointer-gestures.md` | Gestos, interacciones | `docs/design/pointer-gestures.md` |
>
> ## Piezas de razón/deuda/historia a migrar (checklist T2)
>
> Ver `odd/tasks/design-docs-restructure.md` (T2) para el inventario detallado de cada pieza de razón/deuda/gotcha que debe aterrizar en el canon vigente.