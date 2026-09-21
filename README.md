# MaxGB23 - Portfolio

The portfolio of Maximiliano González Ballesteros: a dark-first, type-led
personal portfolio built by a full-stack developer who treats layout, motion
and typography as the product, not the decoration.

## What this is

A one-page portfolio (plus project detail pages) built to feel engineered
rather than templated:

- A GSAP-pinned featured stack that choreographs projects as you scroll
- A WebGL aurora (ogl + GLSL) behind the hero, dark-only by design
- Lenis smooth scroll, with a tested scroll handoff between home and detail
- A typographic system of three families and thirteen fluid type tokens

Sections, in the site's own language: Hero, "Sobre mí", featured projects,
all projects, "Precios", "Contacto" - plus `/proyectos/[id]` detail pages
with lightbox galleries and per-project metrics.

## Stack

- **Next.js 16 + React 19 + TypeScript** - App Router, strict mode, typed end to end
- **Tailwind CSS v4** - CSS-first theme via `@theme inline`; design tokens live in `app/globals.css`
- **GSAP + ScrollTrigger** - scroll choreography: pinned featured stack, section timelines
- **framer-motion** - entrance and stagger primitives
- **Lenis** - smooth scroll on desktop (native scroll elsewhere)
- **ogl** - WebGL/GLSL aurora in the hero (dark only, hero only)
- **shadcn/ui** - accessible primitives on Radix, styled by the local theme

## Highlights

- **Motion you own** - animation is authored, not pasted from a template:
  the GSAP pin sits behind an explicit media gate, framer-motion handles
  entrances, and the home <-> detail scroll handoff is a contract.
- **Design system as code and docs** - one purple accent, oklch tokens,
  type-led hierarchy (size and tracking, never opacity), thirteen fluid type
  tokens. The canon lives in `docs/design/` and is the source of truth.
- **Rhythm by contract** - vertical spacing is a single file
  (`lib/rhythm.ts`) with QA scripts that verify every section against it.
  Layout is audited by script, not by eye.
- **Dark-first identity** - the brand IS dark. Light mode exists only as
  derived tokens, never offered in the UI.

## Getting started

Uses pnpm.

```bash
pnpm install
pnpm dev      # start the dev server
pnpm build    # production build
pnpm start    # serve the production build
pnpm lint     # run eslint
pnpm shots    # playwright screenshot QA
```

## Project structure

- `app/` - pages: one-page home (`page.tsx`) and project detail (`proyectos/[id]`)
- `components/` - sections and UI primitives
- `data/` - project content for the grids and detail pages
- `lib/` - design contracts: rhythm, breakpoints, token registry
- `hooks/` - scroll, GSAP and layout hooks
- `scripts/` - QA audits and screenshot tooling
- `docs/design/` - the design system canon
- `public/images/projects/` - project media

## Docs

- `docs/design/README.md` - the design system canon: identity, tokens, typography, components
- `AGENTS.md` - work conventions for this repo (commits, design-doc sync, worktrees)