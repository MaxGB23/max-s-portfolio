---
name: layout-debug
description: "Trigger: layout debug, borders de maquetación, outline debug, toggle debug overlay, mostrar contenedores. Apply the data-flag + debug-lN class system for showing container outlines during manual QA."
license: Apache-2.0
metadata:
  author: "MaxGB23"
  version: "1.0"
---

# Skill: Layout Debug Overlay

## Activation Contract

Apply when adding, wiring, or reusing a debug overlay that outlines layout containers (sections, rows, columns) for manual/Q&A inspection in a Tailwind project. Use when the user asks to "activate/deactivate layout borders", "debug maquetación", or inspect container hierararchy.

## Hard Rules

- **Zero-cost in production**: outlines MUST only render when a root flag is present (`<html data-debug>`). Default is off; never ship with debug visible.
- **Single point of control**: one flag on the root element toggles everything. Never sprinkle per-component conditionals.
- **No layout change**: use `outline` (not `border`) and `outline-offset: -1px` so bounds never shift layout or get clipped.
- **Semantic levels, not ad-hoc colors**: assign `debug-l1..l4` by container depth; keep the color↔level mapping constant across sections.
- **Leave markers in the markup permanently**: the `debug-lN` classes stay in components and the CSS decides visibility. Removing a class later requires re-adding it to debug again.

## Decision Gates

| Goal | Action |
|------|--------|
| Show a new container in debug | add `debug-lN` by its depth |
| Toggle all on | set the root `data-debug` flag |
| Toggle all off / ship | remove the root flag |
| Best level for an element | section=l1, main wrapper=l2, block/column=l3, leaf=l4 |

## Execution Steps

1. Add an `@layer utilities` block that draws outlines only under a root flag, e.g. `[data-debug] .debug-l1 { outline:1px solid <red> }` … `l4` (blue). Keep colors grouped by depth.
2. Put the flag on the root element (`<html data-debug>`), ideally driven by a constant/env that defaults to off.
3. Replace existing inline debug borders in components with `debug-lN` by depth.
4. Verify: with flag off nothing changes; with flag on the hierarchy reads as layered outlines.

## Output Contract

Return: the `@layer` CSS snippet, the root-flag mechanism, the level mapping used, and confirmation that production output has no visible outlines.
