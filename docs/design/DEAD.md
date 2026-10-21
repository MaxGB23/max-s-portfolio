# Nombres muertos

> [!NOTE] Estado: VIVO
> Un simbolo retirado no desaparece: deja de ser cierto y sigue citado. Esta tabla
> es la respuesta a "quien menciona esto?" sin depender de la memoria.
> Regla: la fila se anade en el mismo work unit que retira la tecnica.
> Solo los tokens entre backticks de la primera celda se verifican (C3); una fila
> en prosa queda como documentacion humana.

| Simbolo retirado | Retirado el | Sustituto | Doc que lo gobierna |
|---|---|---|---|
| `FadeIn`, `FadeInStagger`, `FadeInItem`, `motion-primitives.tsx` | 2026-10-19 | `Reveal` | [motion.md](motion.md) 5 |
| `FEATURED_STACK_GATE`, pin de GSAP del featured | 2026-10 | one-slide rule | [sections.md](sections.md) 4.4 |
| `next-themes`, `ThemeProvider` | 2026-10-19 | `class="dark"` en el layout | [platform.md](platform.md) 7 |

## Por que C3 no se marca a si mismo

`DEAD.md` contiene sus propios tokens por definicion y `archive/` es un snapshot
congelado: un check que los escanea se marca a si mismo en cada pasada. Ambos
quedan fuera del escaneo.

## Menciones de historial

El canon vivo **explica** los retiros ("`FadeIn` se sustituyo por `Reveal`"), y
eso es informacion util. Por eso C3 admite una exencion por archivo:

```
<!-- docs-lint: allow-tokens FadeIn FadeInStagger -->
```

La exencion es por archivo y nombra solo los tokens que ese doc menciona para
contar su historia. El resumen de `pnpm lint:docs` informa cuantas hay: si el
numero crece, es que el canon esta acumulando pasado en vez de mudarlo aqui.
