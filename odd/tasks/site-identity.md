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
| T2-T4 | `7706a0a` |
| Search Console | `b1cf44f` |
| Rol "Full Stack Developer" (L6) | `7c8f652` |
| T5 | `8441100` |
| Ajuste de la tarjeta (foto y stack) | `d58ce22` |
| Alineación centrada | `b11d7b3` |
| Tarjeta final del owner | `7c15076` |

## Specs

- **S1** — El favicon no aparece en el resultado de Google. Cita: «ya aparece mi
  portfolio cuando busco mi nombre... Pero hay algo que veo, el favicon no
  aparece».
- **S2** — El paquete cubre todos los puntos del plan: iconos, metadata, Open
  Graph, JSON-LD, `robots.txt` y `sitemap.xml`, y distingue lo manual de lo
  automatizable. Cita: «Quiero que me armes el plan con todos los puntos, para
  ejecutarlo, y me digas qué pasos son manuales, cuáles tú no podrías hacer».
- **S3** — El título de la home lleva el nombre corto y el rol, y el rol
  coincide con el hero: `Max González Ballesteros — Full Stack Developer`.
- **S4** — La tarjeta Open Graph es un asset diseñado por el owner, a 1200×630,
  adoptado como definitivo. No hay generador: se rehace a mano si cambia el
  nombre, el rol o la foto.
- **S5** — El dominio canónico se queda como está. Cita: «Se queda por ahora
  max-gonzalez-ballesteros.vercel.app, no pienso pagar dominio».
- **S6** — No se persigue SEO genérico: sin contenido, sin keywords, sin
  `hreflang`, sin idioma en URL. Cita: «Ya habiamos decidido que no
  anteriormente, mete trabajo manual».

## Tasks

| # | Tarea | Specs | Ruta | Commit |
|---|---|---|---|---|
| T1 | Iconos reales (192 PNG, 180 apple, ICO 16/32/48) y manifest | S1 | inline | `8f51116` |
| T2 | Metadata, `metadataBase` y título de la home | S3, S5 | inline | `7706a0a` |
| T3 | `robots.txt` y `sitemap.xml` desde `data/projects.ts` | S2 | inline | `7706a0a` |
| T4 | JSON-LD `Person` + `WebSite` con `sameAs` | S2 | inline | `7706a0a` |
| T5 | Tarjeta Open Graph y sus etiquetas | S4 | inline | `7c15076` |
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
- **L4 — decisión de título.** El owner pidió recomendación en lugar de elegir.
  Se implementó la forma corta, `Max González Ballesteros — Software Engineer`:
  coincide con la cadena que ya posiciona, cabe sin truncarse, y el nombre legal
  vive en el JSON-LD y abre la descripción. Vetarla es una línea en
  `lib/site.ts`.
- **L5 — verificación (2026-11-10).** `pnpm build` en verde; en el servidor de
  producción: título, descripción y canonical absolutos; JSON-LD parseable con
  `Person` + `WebSite` y ambos perfiles en `sameAs`; `/robots.txt` correcto;
  `/sitemap.xml` con 10 URLs; una ficha responde en inglés o español según
  `Accept-Language`.
- **L6 — el rol se alinea con el hero.** «no quiero cambiar el texto del hero
  por ahora. El title se puede cambiar a full stack developer?» Decisión: sí.
  El título pasa a `Max González Ballesteros — Full Stack Developer`; hero,
  título, CV y LinkedIn dicen lo mismo. El `jobTitle` del JSON-LD y las dos
  descripciones siguen el mismo cambio.
- **L7 — la tarjeta OG se construye en el repo.** El owner presentó un mockup
  generado con Gemini (1537×751, eyebrow "SOFTWARE ENGINEER", foto de
  marcador). Se adopta su composición y se corrige: 1200×630 exactos, eyebrow
  alineado al rol, foto real del hero, fuentes del sitio. Se generó con
  `scripts/og-image.mjs`.
- **L8 — la tarjeta final es del owner.** «mi imagen es la mejor. Yo tengo OLED y
  el escalonado no es notorio. copia la imagen a /app y el resto de pasos».
  Decisión: se adopta `og-definitiva.png` (1200×630) como
  `app/opengraph-image.png`; se retira el generador para que ningún comando
  sobrescriba su diseño. La cuantización de paleta queda aceptada por el owner
  tras verificarla en su pantalla.

## Estado de entrega

El código está completo y verificado en local: `typecheck`, `test`,
`lint:docs`, `audit:i18n` y `build` en verde. Lo que falta depende del owner:

1. Push de la rama y PR. El push crea la preview de Vercel.
2. Merge a `main`: publica en producción.
3. Search Console: verificar la propiedad (el token ya viaja en el head),
   inspeccionar la URL y pedir indexación. Todo después del deploy.
4. Rich Results Test contra la URL de producción.
5. Comprobar la tarjeta compartiendo el link y el icono en pestaña y teléfono.
6. Esperar la adopción del favicon: días o semanas, sin API para forzarla.
