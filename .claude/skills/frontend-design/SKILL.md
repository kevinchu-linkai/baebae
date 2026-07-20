---
name: frontend-design
description: Design system rules for this project — typography scale, 8px spacing grid, color tokens, and component patterns. Load before writing or styling any React component, page, or UI element so output follows the system instead of one-off values.
---

# Frontend Design System

Apply these rules to every component, page, and style change in this project. Don't invent one-off font sizes, spacing values, or colors — pull from the tokens below. If a design need isn't covered here, extend the system (add a token), don't bypass it.

## Typography scale

Use a modular scale, not arbitrary sizes. Define once as CSS custom properties (e.g. in `src/index.css`) and reference everywhere:

```css
--text-xs: 0.75rem;    /* 12px — captions, labels, metadata */
--text-sm: 0.875rem;   /* 14px — secondary text, form hints */
--text-base: 1rem;     /* 16px — body copy */
--text-lg: 1.25rem;    /* 20px — lead paragraphs, card titles */
--text-xl: 1.5rem;     /* 24px — section headings */
--text-2xl: 2rem;      /* 32px — page headings */
--text-3xl: 3rem;      /* 48px — hero headings */

--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

--leading-tight: 1.2;   /* headings */
--leading-normal: 1.5;  /* body text */
--leading-relaxed: 1.7; /* long-form copy */
```

Rules:
- Headings use `--leading-tight`; body copy uses `--leading-normal` or `--leading-relaxed`.
- Never mix more than 2 font families (one for display/headings, one for body — or a single family at different weights).
- Don't drop below `--text-xs` or use font sizes not on this scale.

## Spacing system (8px base grid)

Every margin, padding, and gap comes from this scale — no arbitrary pixel values:

```css
--space-1: 4px;   /* tight inline gaps (icon + label) */
--space-2: 8px;   /* base unit */
--space-3: 12px;
--space-4: 16px;  /* default component padding */
--space-6: 24px;
--space-8: 32px;  /* section-internal spacing */
--space-12: 48px;
--space-16: 64px; /* section-to-section spacing */
--space-24: 96px; /* hero/major section breathing room */
```

Rules:
- Component internal padding: `--space-4` (compact) to `--space-8` (spacious).
- Gaps between related elements (list items, form fields): `--space-2` to `--space-4`.
- Gaps between unrelated sections: `--space-16` or `--space-24`.
- If a value isn't on this scale, don't use it — round to the nearest step instead.

## Color tokens

No raw hex codes in components. Define semantic tokens that map to a small palette, and support both themes:

```css
:root {
  --color-primary: #2563eb;
  --color-primary-hover: #1d4ed8;
  --color-primary-active: #1e40af;

  --color-accent: #f59e0b;

  --color-neutral-50: #fafafa;
  --color-neutral-100: #f4f4f5;
  --color-neutral-300: #d4d4d8;
  --color-neutral-500: #71717a;
  --color-neutral-700: #3f3f46;
  --color-neutral-900: #18181b;

  --color-bg: var(--color-neutral-50);
  --color-surface: #ffffff;
  --color-text: var(--color-neutral-900);
  --color-text-muted: var(--color-neutral-500);
  --color-border: var(--color-neutral-300);
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: var(--color-neutral-900);
    --color-surface: #1f1f23;
    --color-text: var(--color-neutral-50);
    --color-text-muted: var(--color-neutral-300);
    --color-border: var(--color-neutral-700);
  }
}
```

Rules:
- `--color-primary` is the placeholder brand color — swap it for the real brand color once one is chosen, but keep the token names stable so components don't need to change.
- Use `--color-accent` sparingly (one CTA, one highlight) — never as a dominant background.
- Every component must read `--color-bg`/`--color-surface`/`--color-text` so it adapts automatically to light/dark; don't hardcode white/black.

## Component patterns

**Buttons** — define all interactive states, not just default:
```css
.btn-primary {
  background: var(--color-primary);
  color: white;
  padding: var(--space-3) var(--space-6);
  border-radius: 8px;
  font-weight: var(--font-medium);
  transition: background 150ms ease, transform 150ms ease;
}
.btn-primary:hover   { background: var(--color-primary-hover); }
.btn-primary:active  { background: var(--color-primary-active); transform: scale(0.98); }
.btn-primary:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
```

**Cards** — consistent internal structure, not just a bordered div:
- Container: `--color-surface` background, `1px solid var(--color-border)`, `border-radius: 12px`, `padding: var(--space-6)`.
- Internal layout: title (`--text-lg`, `--font-semibold`) → `--space-2` gap → body (`--text-base`, `--color-text-muted`) → `--space-4` gap → actions row.
- Hover state (if clickable): subtle `box-shadow` lift, not a color change on the whole card.

**Forms**:
- Label above input, `--space-2` gap, `--text-sm` `--font-medium` for labels.
- Inputs: `padding: var(--space-3) var(--space-4)`, `border: 1px solid var(--color-border)`, `border-radius: 8px`, clear `:focus` ring using `--color-primary`.
- Error state: border becomes a semantic error color + `--text-sm` message below in that same color — never rely on color alone (pair with an icon or text).
- Field groups spaced `--space-6` apart.

## Avoid generic AI aesthetic

Specifically avoid these tells:
- **No purple/blue gradient backgrounds** as a default — this is the single most recognizable "AI-generated" signature. Only use a gradient if it's deliberate and tied to brand.
- **No glassmorphism-by-default** (frosted blur cards on gradient backgrounds) unless explicitly requested.
- **No excessive rounded corners on everything** — mix sharper and softer radii deliberately; don't make every element `border-radius: 16px+`.
- **No emoji as icons** — use a real icon set (Lucide, Heroicons, or inline SVG) sized to `--text-base`/`--text-lg`.
- **No centered-everything layouts** — use asymmetry, left-aligned text blocks, and real grid structure instead of stacking centered elements down the page.
- **No drop-shadow-on-every-element** — reserve shadows for genuinely elevated surfaces (modals, dropdowns, hover-lifted cards), not flat content blocks.
- **Vary section rhythm** — don't repeat the same "icon + heading + paragraph" card pattern more than 2-3 times in a row; break it up with different layouts (image+text, full-width stat, quote).
- Motion (Framer Motion) should feel purposeful and restrained: fades/slides of 200-400ms with `ease-out`, staggers of 50-100ms between siblings — not bouncy spring effects on every element.
