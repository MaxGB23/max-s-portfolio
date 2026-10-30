# MaxGB23 - Portfolio 👻

[![verify](https://github.com/MaxGB23/max-s-portfolio/actions/workflows/verify.yml/badge.svg)](https://github.com/MaxGB23/max-s-portfolio/actions/workflows/verify.yml)

The portfolio of Maximiliano González Ballesteros: a dark-first, type-led
personal portfolio built by a full-stack developer who treats layout, motion
and typography as the product, not the decoration.

**Live: <https://max-gonzalez-ballesteros.vercel.app/>**

## What this is

A one-page portfolio (plus project detail pages), in Spanish and English, built
to feel engineered rather than templated:

- A scroll-reactive featured stack that choreographs projects as you scroll
- A WebGL aurora (ogl + GLSL) behind the hero, dark-only by design
- Smooth scroll that is authored, not left to the browser: the wheel is tuned on
  a 165 Hz panel, so high-refresh displays get a ride no template gives you
- A typographic system of three families and thirteen fluid type tokens
- Bilingual by the server: ES or EN is decided from the `lang` cookie and then
  `Accept-Language` before the first paint, so there is no flash and no swap
- Keyboard-first detail views: the gallery lightbox is a real dialog with a focus
  trap, and reduced-motion visitors keep only opacity and short rises

Sections, in the site's own language: Hero, "Sobre mí", featured projects,
all projects, "Precios", "Contacto" - plus `/proyectos/[id]` detail pages
with lightbox galleries and per-project metrics.

## Stack

- **Next.js 16 + React 19 + TypeScript** - App Router, strict mode, typed end to end
- **Tailwind CSS v4** - CSS-first theme via `@theme inline`; design tokens live in `app/globals.css`
- **GSAP + ScrollTrigger** - scroll choreography: section timelines and the scroll-reactive featured stack
- **framer-motion** - interaction only, no entrances: navbar hide-on-scroll, mobile menu, hovers
- **Lenis** - smooth scroll on desktop (native scroll elsewhere)
- **ogl** - WebGL/GLSL aurora in the hero (dark only, hero only)
- **shadcn/ui** - accessible primitives on Radix, styled by the local theme

## How I work

- **Issue first.** Every change starts as an issue and lands in a pull request
  that closes it, so the reasoning survives after the branch is deleted.
- **Docs as a contract.** The design canon is enforced by a gate
  (`pnpm lint:docs`): a doc over its line budget, or one that drifted from the
  code, fails the check. A retired symbol gets its row in `docs/design/DEAD.md`
  in the same commit that removes it.
- **QA by script, not by eye.** `rhythm-contract.mjs`, `section-spacing.mjs`,
  `type-scale.mjs`, `hero-about-audit.mjs`, `navbar-active.mjs` and the
  `audit-*.mjs` instruments verify spacing, type scale and frame timelines.
  Layout is audited, not squinted at.
- **Typed end to end.** Type errors fail the build; `ignoreBuildErrors` is
  deliberately off so a broken type cannot reach production.
- **Reviewable slices.** One work unit per commit, with tests and docs alongside
  the behavior, and pull requests of roughly 400 authored lines.
- **Supply chain.** Every GitHub Action is pinned by a full commit SHA, never a
  movable tag, and every bump is a deliberate commit instead of an automatic one.

## Getting started

Uses pnpm.

```bash
pnpm install
pnpm dev        # start the dev server
pnpm build      # production build
pnpm start      # serve the production build
pnpm typecheck  # tsc --noEmit
pnpm lint:docs  # documentation gate
pnpm shots      # playwright screenshot QA
pnpm audit:i18n # translation coverage audit
pnpm docs:toc   # regenerate the documentation indexes
```

## Project structure

- `app/` - pages: one-page home (`page.tsx`) and project detail (`proyectos/[id]`)
- `components/` - sections and UI primitives
- `data/` - project content for the grids and detail pages, plus the ES/EN dictionary
- `lib/` - design contracts: rhythm, breakpoints, token registry
- `hooks/` - scroll, GSAP and layout hooks
- `scripts/` - QA audits and screenshot tooling
- `docs/design/` - the design system canon
- `docs/issues/` - dated post-mortems of real bugs
- `docs/rfcs/` - decision records, frozen once approved
- `odd/tasks/` - work in flight
- `public/images/projects/` - project media

## Docs

- [Documentation map](docs/README.md) - the entry point: question, answer, doc
- [Design system canon](docs/design/README.md) - identity, tokens, typography, components
- [Work conventions](AGENTS.md) - commits, design-doc sync, worktrees
- [Post-mortems](docs/issues/) - what each performance bug actually was
- [Decision records](docs/rfcs/) - why A and not B

## License

No license is granted: this repository is **all rights reserved**, not open
source. The source may be read, reviewed and learned from, but it may not be
copied, modified, distributed or reused in another project. See
[LICENSE](LICENSE).

The notice covers the code, the design system, the documentation, the written
copy and the media in `public/images/`. Third-party dependencies keep their own
licenses.
