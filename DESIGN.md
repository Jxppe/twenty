# DESIGN.md

Design system for the platform. Written in the [DESIGN.md](https://github.com/google-labs-code/design.md)
shape: machine-readable tokens first, rationale after.

**The tokens are not ours. They are Twenty's**, read out of `packages/twenty-ui/src/theme/constants/`
and reachable at runtime through `useTheme()` from `twenty-ui/theme-constants`. That is deliberate:
our screens sit inside Twenty's chrome, and a second scale would be visible as a seam on every
screen.

---

## Tokens

```yaml
identity:
  name: Takdai
  character: [precise, quiet, dense, fast]
  not: [playful, marketing, spacious, decorative]

typography:
  family: 'Inter, "Noto Sans Thai", sans-serif'   # Inter has no Thai glyphs
  line_height_thai: 1.6                            # Thai needs more vertical room than Latin
  size:
    xxs: 0.625rem   # 10px  metadata, timestamps
    xs:  0.85rem    # 13.6px secondary text, table cells
    sm:  0.92rem    # 14.7px body, the default
    md:  1rem       # 16px  emphasis
    lg:  1.23rem    # 19.7px section heading
    xl:  1.54rem    # 24.6px page title
    xxl: 1.85rem    # 29.6px rare
  weight:
    regular: 400
    medium: 500     # the heaviest weight in normal use
    semiBold: 600   # page titles only
  rule: >
    Size carries hierarchy, not weight. Two sizes and two weights per screen.
    Never bold a whole row to make it stand out; change its background.

spacing:
  base: 4
  scale: [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24]
  access: "theme.spacing[n]"
  rule: >
    Multiples of 4 only. Dense screens live at 1 to 3. Reserve 8 and above for
    page-level separation.

radius:
  xs: 2px
  sm: 4px    # controls, inputs, buttons
  md: 8px    # cards, panels, message bubbles
  lg: 16px   # rare
  pill: 999px  # tags, status pills only
  rule: "Nothing above md in application chrome."

color:
  approach: semantic-only
  background: [primary, secondary, tertiary, quaternary, transparent.*, danger]
  font: [primary, secondary, tertiary, light, extraLight, inverted, danger]
  border: [strong, medium, light]
  accent: [primary, secondary, tertiary, quaternary]
  palette: "Radix P3 scale via twenty-ui: blue, green, red, orange, purple, pink, turquoise, gray"
  rule: >
    Never a hex literal in product code. Colour carries meaning: channel identity,
    record status, destructive intent. Decoration gets grayscale.
  themes: [light, dark]

motion:
  duration: { instant: 0, fast: 150, normal: 300, slow: 600 }
  rule: >
    Under 150ms or none at all. Animate opacity and background on state change.
    Never animate layout, never animate on load, never stagger a list.

density:
  table_row_height: 32px
  list_row_height: 40px
  rule: "Show more rows. A screen that needs scrolling to see ten records is too loose."
```

---

## Principles

### 1. This is a tool, not a page

Staff live in this software for eight hours. Optimize for the thousandth use, not the first. That
means information density, keyboard reachability, and never making someone wait for an animation
they have seen a thousand times.

References: Linear, Attio, Stripe, Intercom, Front, Notion.

### 2. Twenty's shell is the design system

Our screens open inside Twenty's sidebar, header and record pages. Every spacing, colour and font
decision either matches that or reads as a bolted-on module.

Consequences, in order:

1. Use `twenty-ui` components: `Button`, `Tag`, `Status`, `Chip`, `Avatar`, the `Icon*` set, the
   typography set. They already follow the workspace theme in light and dark.
2. Use `useTheme()` tokens for everything else. **No hex literals in product code.**
3. Hand-build only what the sandbox forces (see §4), styled from the same tokens.

### 3. Do not redesign Twenty

Product identity comes from the screens we add: the Inbox, quotations, invoices, payments. It does
not come from restyling Companies and People.

Restyling core would mean editing `twenty-front`, which triggers AGPL §13 and permanent upgrade
pain. If a design requires changing Twenty's chrome, change the design.

The path to a distinct identity is accretion: more of the product becomes ours over time, each new
surface using the shared vocabulary, until the whole reads as one thing. Not a big-bang reskin.

### 4. The sandbox constrains the design

**Verified in the prototype**, not theoretical. Front components run in a Web Worker behind Remote
DOM. Consequences that must be designed around:

| Constraint | Design consequence |
| --- | --- |
| `createPortal` silently renders nothing | No Radix, base-ui, Headless UI or MUI overlays. Every dropdown, dialog, tooltip and combobox is hand-built, positioned `absolute` inside its own tree |
| `ResizeObserver` throws | No virtualized lists, no responsive chart containers. Prefer native Twenty views for long lists |
| No realtime transport | Polled data. No typing indicators, no live presence |
| `<canvas>` renders nothing | SVG for QR codes, charts, everything visual |
| CSS injected unscoped | Prefix every class name. Never write a bare element selector |
| `@media` matches the window, not the widget | Use `@container` with your own `container-type` |
| `document.activeElement` is always undefined | Track focus with `onFocus`/`onBlur`. Keyboard UX needs deliberate work |

Practical rule: **anything that floats above the page is expensive.** Design flows that avoid
overlays where a panel or an inline control will do.

### 5. Empty, loading and error states are the product

Most of an inbox's life is spent not full. Every list, panel and page needs all three, and they are
part of the design, not a fallback.

- **Empty:** say what would fill it and offer the action that does. Never a shrug.
- **Loading:** show the shape of what is coming. No spinner on a full page.
- **Error:** say what failed and what to do. Never a stack trace, never "Something went wrong".

### 6. Keyboard first

Every primary action reachable without the mouse. `j`/`k` through a conversation list, `Enter` to
open, `Cmd+K` for everything else. Twenty already has a command menu; app commands register into it
rather than growing a parallel one.

---

## Anti-patterns

Rejected explicitly, because these are the defaults an AI or a rushed developer reaches for:

| Do not | Instead |
| --- | --- |
| Cards around everything | Rows, tables, dividers |
| A giant page heading | Small title in the header bar |
| Gradients | Flat, semantic colour |
| Rounded everything | `sm` for controls, `md` for panels, stop |
| Emoji as iconography | `twenty-ui/icon` |
| Colour as decoration | Colour means something or is grayscale |
| Multiple accents on one screen | One accent, everything else neutral |
| Marketing layout inside the app | Dense, functional layout |
| Animation as polish | Under 150ms, or nothing |
| A second design system | `twenty-ui` plus our own overlay primitives |
| Hex literals | `useTheme()` tokens |

---

## Shared primitives

Live in each app's `src/ui/`. Built once, reused everywhere, styled from `useTheme()`.

| Primitive | Status | Why it exists |
| --- | --- | --- |
| `Dropdown` | built, **has an open bug** | Portal-free select. Options currently inert: `onBlur` fires on mousedown and unmounts before the click lands. Fix with mousedown-based selection |
| `Modal` | not built | Same portal problem |
| `Combobox` | not built | Contact search, product picker |
| `Tooltip` | not built | Same portal problem |
| `VirtualList` | not built | No `ResizeObserver`; needs fixed row heights |
| `EmptyState` | not built | Consistency across every list |

When a primitive proves itself in two apps, promote it to a shared internal package. Not before.

---

## Open questions

1. **Thai typography — resolved in the tokens, unverified in practice.** Inter has no Thai coverage,
   so the stack carries a Thai companion face. Verify the metrics actually pair well at 13-15px, and
   that mixed Thai/Latin lines in a message thread do not jitter. The UI itself stays English; Thai
   appears as customer content, which is exactly where it must look right.
2. **Do we need a brand accent** distinct from Twenty's blue, and does introducing one create the
   seam we are trying to avoid?
3. **Density on mobile.** The payment page is mobile-first and its rules are the opposite of the
   inbox's.
