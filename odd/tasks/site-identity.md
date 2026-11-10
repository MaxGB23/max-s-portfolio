# Site identity: icons, metadata and machine-readable markup

Rama `feat/site-identity`, worktree `M:\worktrees\maxgb23-portfolio\site-identity`.
Base: `origin/main` @ c6cbded. El `main` local estaba 25 commits atrás, así que las
métricas de slice se miden contra `origin/main`: contra `main` cuentan commits ajenos.
El sitio ya aparece al buscar el nombre; falta lo que Google muestra alrededor del
resultado y lo que se ve al compartir el link. No hay trabajo de posicionamiento.

## Commits

| # | Commit |
|---|---|
| T1 | `8f51116` |

## Specs

- **S1** — El favicon no aparece en el resultado de Google. Cita: «ya aparece mi
  portfolio cuando busco mi nombre... Pero hay algo que veo, el favicon no
  aparece».
- **S2** — El paquete cubre todos los puntos del plan: iconos, metadata, Open
  Graph, JSON-LD, `robots.txt` y `sitemap.xml`, y distingue lo manual de lo
  automatizable. Cita: «Quiero que me armes el plan con todos los puntos, para
  ejecutarlo, y me digas qué pasos son manuales, cuáles tú no podrías hacer».
- **S3** — El título de la home es una decisión del owner, pendiente de
  recomendación. Cita: «"Max González Ballesteros — Software Engineer" o
  "Maximiliano..." o no sé si mantener "portfolio". necesito tus
  recomendaciones».
- **S4** — La imagen Open Graph la aporta el owner y quiere previsualizarla
  antes. Cita: «Yo te paso un png o incluso hay paginas para configurar OG, aasí
  puedo ver la vista previa antes».
- **S5** — El dominio canónico se queda como está. Cita: «Se queda por ahora
  max-gonzalez-ballesteros.vercel.app, no pienso pagar dominio».
- **S6** — No se persigue SEO genérico: sin contenido, sin keywords, sin
  `hreflang`, sin idioma en URL. Cita: «Ya habiamos decidido que no
  anteriormente, mete trabajo manual».

## Tasks

| # | Tarea | Specs | Ruta | Commit |
|---|---|---|---|---|
| T1 | Iconos reales (192 PNG, 180 apple, ICO 16/32/48) y manifest | S1 | inline | `8f51116` |
| T2 | Metadata, `metadataBase` y título de la home | S3, S5 | inline | commit 2 |
| T3 | `robots.txt` y `sitemap.xml` desde `data/projects.ts` | S2 | inline | commit 2 |
| T4 | JSON-LD `Person` + `WebSite` con `sameAs` | S2 | inline | commit 2 |
| T5 | Imagen Open Graph y sus etiquetas | S4 | inline | bloqueada por el PNG del owner |
| T6 | `docs/site-identity.md`, corrección del cierre de SEO y verificación de CI | S2, S6 | inline | commit 2 (docs) + cierre |

T2, T3 y T4 comparten un commit: son una sola unidad de comportamiento (lo que
lee un crawler o una previsualización) y las tres invalidan la misma frase de
`docs/issues/a11y-and-performance.md`, que se corrige en ese mismo commit. T5
llega aparte porque depende del PNG del owner. T6 no añade código: cierra la
verificación de CI y anota los commits en este documento.

## Log

- **L1** — «C:\Users\cb147\AppData\Local\Temp\orca-paste-1794342685234-83b8460a-d8de-4c56-9eb1-768e4d5d6dcc.png
  ya aparece mi portfolio cuando busco mi nombre. Pensé que era imposible sin
  tener un dominio propio y sin seo dedicado. Pero hay algo que veo, el favicon
  no aparece. Dime qué opinas, deberíamos hacer algunas mejoras para seo o no.
  Ya habiamos decidido que no anteriormente, mete trabajo manual»
- **L2** — «crea un worktree. Como es una feature de seo no creo que cause
  conflictos con mis worktrees de implementacion de features, será facil el
  mergeo. Quiero que me armes el plan con todos los puntos, para ejecutarlo, y
  me digas qué pasos son manuales, cuáles tú no podrías hacer»
- **L3** — «1. "Max González Ballesteros — Software Engineer" o "Maximiliano..."
  o no sé si mantener "portfolio". necesito tus recomendaciones. 2- Yo te paso
  un png o incluso hay paginas para configurar OG, aasí puedo ver la vista previa
  antes. 3- Se queda por ahora max-gonzalez-ballesteros.vercel.app, no pienso
  pagar dominio»
