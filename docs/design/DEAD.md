# Nombres muertos

> [!NOTE] Estado: VIVO
> Un símbolo retirado no desaparece: deja de ser cierto y sigue citado. Esta tabla
> es la respuesta a "quién menciona esto?" sin depender de la memoria.
> Regla: la fila se añade en el mismo work unit que retira la técnica.

Solo entran símbolos que ya no existen o cuya técnica se retiró. Un símbolo cuyo
archivo sigue en el repo y ya está documentado como deuda (desmontado, huérfano,
pendiente de redecisión) **no entra aquí**: se documenta en su doc dueño y en la
deuda de ese tema. Ejemplo: `ProductsSection` desmontada vive en
[components-detail.md](components-detail.md) 4.11 y 13.1, no en esta tabla; meterla
aquí obligaría a eximir el propio canon que la explica.
> Solo los tokens entre backticks de la primera celda se verifican (C3); una fila
> en prosa queda como documentación humana.

| Símbolo retirado | Retirado el | Sustituto | Doc que lo gobierna |
|---|---|---|---|
| `FadeIn`, `FadeInStagger`, `FadeInItem`, `motion-primitives.tsx` | 2026-10-19 | `Reveal` | [motion.md](motion.md) 5 |
| `FEATURED_STACK_GATE`, pin de GSAP del featured | 2026-10 | one-slide rule | [sections.md](sections.md) 4.4 |
| `next-themes`, `ThemeProvider` | 2026-10-19 | `class="dark"` en el layout | [platform.md](platform.md) 7 |

## Por qué C3 no se marca a sí mismo

`DEAD.md` contiene sus propios tokens por definición y `archive/` es un snapshot
congelado: un check que los escanea se marca a sí mismo en cada pasada. Ambos
quedan fuera del escaneo.

## Menciones de historial

El canon vivo **explica** los retiros ("`FadeIn` se sustituyó por `Reveal`"), y
eso es información útil. Por eso C3 admite una exención por archivo:

```
<!-- docs-lint: allow-tokens FadeIn FadeInStagger -->
```

La exención es por archivo y nombra solo los tokens que ese doc menciona para
contar su historia. El resumen de `pnpm lint:docs` informa cuántas hay: si el
número crece, es que el canon está acumulando pasado en vez de mudarlo aquí.
