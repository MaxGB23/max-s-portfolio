# Bugatti — Style Reference
> An austere luxury-automotive interface that uses near-pure black canvas, white uppercase letterspaced display, and full-bleed automotive photography as the only voltage. The system runs three custom Bugatti typefaces — Bugatti Display, Bugatti Text Regular, and Bugatti Monospace — and combines them at modest weights with wide tracking to feel European-engineered, hyper-minimal, and quietly expensive. There is no accent color, no decorative element, no chrome — only photography, typography, and the brand wordmark.

**Theme:** dark

**Source website:** [https://www.bugatti.com/](https://www.bugatti.com/)  
Use the live official website to compare and validate this extracted snapshot. The current source website remains authoritative.

## Tokens — Colors

| Name | Value | Token | Role |
|---|---|---|---|
| primary | `#ffffff` | `--color-primary` | primary role extracted from the source design |
| ink | `#ffffff` | `--color-ink` | ink role extracted from the source design |
| body | `#cccccc` | `--color-body` | body role extracted from the source design |
| body strong | `#e6e6e6` | `--color-body-strong` | body strong role extracted from the source design |
| muted | `#999999` | `--color-muted` | muted role extracted from the source design |
| muted soft | `#666666` | `--color-muted-soft` | muted soft role extracted from the source design |
| hairline | `#262626` | `--color-hairline` | hairline role extracted from the source design |
| hairline strong | `#3a3a3a` | `--color-hairline-strong` | hairline strong role extracted from the source design |
| canvas | `#000000` | `--color-canvas` | canvas role extracted from the source design |
| surface soft | `#0d0d0d` | `--color-surface-soft` | surface soft role extracted from the source design |
| surface card | `#141414` | `--color-surface-card` | surface card role extracted from the source design |
| surface elevated | `#1f1f1f` | `--color-surface-elevated` | surface elevated role extracted from the source design |
| on primary | `#000000` | `--color-on-primary` | on primary role extracted from the source design |
| on dark | `#ffffff` | `--color-on-dark` | on dark role extracted from the source design |
| on photo | `#ffffff` | `--color-on-photo` | on photo role extracted from the source design |
| link | `#c3d9f3` | `--color-link` | link role extracted from the source design |
| warning | `#d4a017` | `--color-warning` | warning role extracted from the source design |
| success | `#5fa657` | `--color-success` | success role extracted from the source design |

## Tokens — Typography

### Bugatti Display, sans-serif · `--font-primary`
- **Substitute:** Inter, system-ui, sans-serif
- **Weights:** 400
- **Sizes:** 64px, 48px, 32px, 24px, 20px, 16px
- **Line height:** 1.1, 1.15, 1.2, 1.3
- **Letter spacing:** 4px, 3px, 2px, 1.5px, 1px
- **Role:** Brand typography family observed across the documented type scale.

### Bugatti Display, serif · `--font-family-2`
- **Substitute:** Inter, system-ui, sans-serif
- **Weights:** 400
- **Sizes:** 14px
- **Line height:** 1
- **Letter spacing:** 6px
- **Role:** Brand typography family observed across the documented type scale.

### Bugatti Monospace, ui-monospace, monospace · `--font-family-3`
- **Substitute:** Inter, system-ui, sans-serif
- **Weights:** 400
- **Sizes:** 11px, 14px, 12px
- **Line height:** 1.4, 1
- **Letter spacing:** 2px, 2.5px
- **Role:** Brand typography family observed across the documented type scale.

### Bugatti Text Regular, serif · `--font-family-4`
- **Substitute:** Inter, system-ui, sans-serif
- **Weights:** 400
- **Sizes:** 16px, 14px
- **Line height:** 1.5
- **Letter spacing:** 0
- **Role:** Brand typography family observed across the documented type scale.

### Type Scale

| Role | Size | Line Height | Letter Spacing | Token |
|---|---|---|---|---|
| display-xl | 64px | 1.1 | 4px | `--text-display-xl` |
| display-lg | 48px | 1.15 | 3px | `--text-display-lg` |
| display-md | 32px | 1.2 | 2px | `--text-display-md` |
| display-sm | 24px | 1.3 | 1.5px | `--text-display-sm` |
| wordmark | 14px | 1 | 6px | `--text-wordmark` |
| title-md | 20px | 1.3 | 1px | `--text-title-md` |
| title-sm | 16px | 1.3 | 1.5px | `--text-title-sm` |
| caption-uppercase | 11px | 1.4 | 2px | `--text-caption-uppercase` |
| body-md | 16px | 1.5 | 0 | `--text-body-md` |
| body-sm | 14px | 1.5 | 0 | `--text-body-sm` |
| button | 14px | 1 | 2.5px | `--text-button` |
| nav-link | 12px | 1.4 | 2px | `--text-nav-link` |

## Tokens — Spacing & Shapes

**Density:** comfortable

### Spacing Scale

| Name | Value | Token |
|---|---|---|
| xxs | 4px | `--spacing-xxs` |
| xs | 8px | `--spacing-xs` |
| sm | 12px | `--spacing-sm` |
| md | 16px | `--spacing-md` |
| lg | 24px | `--spacing-lg` |
| xl | 40px | `--spacing-xl` |
| xxl | 64px | `--spacing-xxl` |
| section | 120px | `--spacing-section` |

### Border Radius

| Name | Value | Token |
|---|---|---|
| none | 0px | `--radius-none` |
| pill | 9999px | `--radius-pill` |
| full | 9999px | `--radius-full` |

### Layout

- **Section gap:** 120px
- **Card padding:** 24px
- **Element gap:** 16px
- **Max content width:** 1200px

## Components

### button primary
**Role:** button primary component

- **backgroundColor:** `transparent`
- **textColor:** `{colors.on-dark}`
- **typography:** `{typography.button}`
- **rounded:** `{rounded.pill}`
- **padding:** `14px 32px`
- **height:** `44px`

### button icon
**Role:** button icon component

- **backgroundColor:** `transparent`
- **textColor:** `{colors.on-dark}`
- **rounded:** `{rounded.full}`
- **size:** `40px`

### text link
**Role:** text link component

- **backgroundColor:** `transparent`
- **textColor:** `{colors.link}`
- **typography:** `{typography.button}`

### top nav
**Role:** top nav component

- **backgroundColor:** `transparent`
- **textColor:** `{colors.on-dark}`
- **typography:** `{typography.nav-link}`
- **height:** `56px`

### wordmark display
**Role:** wordmark display component

- **backgroundColor:** `transparent`
- **textColor:** `{colors.on-dark}`
- **typography:** `{typography.wordmark}`

### hero photo band
**Role:** hero photo band component

- **backgroundColor:** `{colors.canvas}`
- **textColor:** `{colors.on-dark}`
- **typography:** `{typography.display-xl}`
- **padding:** `96px`

### caption overlay
**Role:** caption overlay component

- **backgroundColor:** `transparent`
- **textColor:** `{colors.on-dark}`
- **typography:** `{typography.caption-uppercase}`

### career callout card
**Role:** career callout card component

- **backgroundColor:** `{colors.surface-card}`
- **textColor:** `{colors.on-dark}`
- **typography:** `{typography.body-sm}`
- **rounded:** `{rounded.none}`
- **padding:** `16px`
- **width:** `320px`

### model photo card
**Role:** model photo card component

- **backgroundColor:** `{colors.canvas}`
- **textColor:** `{colors.on-dark}`
- **typography:** `{typography.display-md}`
- **rounded:** `{rounded.none}`

### newsroom article card
**Role:** newsroom article card component

- **backgroundColor:** `{colors.canvas}`
- **textColor:** `{colors.on-dark}`
- **typography:** `{typography.title-md}`
- **rounded:** `{rounded.none}`
- **padding:** `24px`

### career listing row
**Role:** career listing row component

- **backgroundColor:** `transparent`
- **textColor:** `{colors.on-dark}`
- **typography:** `{typography.title-md}`
- **padding:** `24px 0`

### text input
**Role:** text input component

- **backgroundColor:** `transparent`
- **textColor:** `{colors.on-dark}`
- **typography:** `{typography.body-md}`
- **rounded:** `{rounded.none}`
- **padding:** `12px 0`
- **height:** `44px`

### spec cell
**Role:** spec cell component

- **backgroundColor:** `transparent`
- **textColor:** `{colors.on-dark}`
- **typography:** `{typography.title-md}`
- **padding:** `24px 0`

### date pill
**Role:** date pill component

- **backgroundColor:** `transparent`
- **textColor:** `{colors.muted}`
- **typography:** `{typography.caption-uppercase}`

### category tag
**Role:** category tag component

- **backgroundColor:** `transparent`
- **textColor:** `{colors.muted}`
- **typography:** `{typography.caption-uppercase}`

### cta band photo
**Role:** cta band photo component

- **backgroundColor:** `{colors.canvas}`
- **textColor:** `{colors.on-dark}`
- **typography:** `{typography.display-md}`
- **padding:** `80px`

### footer
**Role:** footer component

- **backgroundColor:** `{colors.canvas}`
- **textColor:** `{colors.muted}`
- **typography:** `{typography.body-sm}`
- **padding:** `64px`

## Do's and Don'ts

### Do

- Use `--color-primary` for the brand's primary interaction treatment.
- Keep page surfaces anchored to `--color-canvas`.
- Preserve every typography style's documented size, line height, and letter spacing.
- Compare major implementation decisions against [the live Bugatti website](https://www.bugatti.com/).

### Don't

- Do not introduce colors outside the documented color token set.
- Do not replace `--color-ink` with an arbitrary neutral.
- Do not flatten documented component states or spacing relationships.
- Do not treat this extracted snapshot as newer than the live source website.

## Layout

Use the documented spacing scale and component geometry as the implementation baseline. Validate responsive composition and current page rhythm against [the live source](https://www.bugatti.com/).
