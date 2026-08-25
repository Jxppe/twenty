---
name: saas-ui
description: Rules for professional high-density B2B application UI inside Twenty. Use when building any screen, front component, table, form, dropdown or empty state in this product.
---

# SaaS UI rules

Tokens and rationale in `/DESIGN.md`.

## 1. Use Twenty's tokens, always

Our screens sit inside Twenty's chrome. A second scale is visible as a seam on every screen.

- `useTheme()` from `twenty-ui/theme-constants` for spacing, colour, radius, typography.
- **No hex literals in product code.**
- `theme.spacing[2]`, not `theme.spacing(2)`: it is a token record, not a callable.
- `twenty-ui` components where they exist: `Button`, `Tag`, `Status`, `Chip`, `Avatar`, `Icon*`,
  the typography set. They follow light and dark automatically.
- Import from subpaths (`twenty-ui/input`), and never `IconsProvider`/`useIcons`, which pull in
  several MB of icons.

## 2. Density

This is a tool someone uses for eight hours. Optimize for the thousandth use.

- Table rows 32px, list rows 40px.
- Spacing multiples of 4; dense screens live at `spacing[1]` to `spacing[3]`.
- Size carries hierarchy, not weight. Two sizes and two weights per screen.
- Never bold a whole row to make it stand out. Change its background.

## 3. Do not redesign Twenty. Relabel it.

The complaint that Twenty "feels too salesy" is a **vocabulary** problem, not a visual one. Fix it by
changing `labelSingular`, `labelPlural` and `icon` on standard objects, and by shaping the record
pages, not by restyling anything.

**Never change `nameSingular`** - it is the API contract. And turn off `isLabelSyncedWithName` on
anything relabelled.

Restyling core means editing `twenty-front`, which is a merge conflict forever. If a design requires
changing Twenty's chrome, change the design.

## 3b. Lead with what is blocked, not with what it is worth

Product identity comes from the screens we add and the order things appear in. On a record page, put
outstanding items from the client first, deadlines second, open work third, money last. Anything that
only supports a sales forecast (probability, weighted value) comes off the page.

## 4. The sandbox constrains the design

Verified, not theoretical. Front components run in a Web Worker behind Remote DOM:

- `createPortal` renders nothing, silently. **No Radix, base-ui, Headless UI or MUI overlays.** Every
  dropdown, dialog, tooltip and combobox is hand-built with `position: absolute` inside its own tree.
- `ResizeObserver` throws. No virtualized lists, no responsive chart containers. Long lists belong in
  native Twenty views.
- `<canvas>` renders nothing. Use SVG.
- CSS is injected unscoped into the host page. Prefix class names; no bare element selectors.
- `@media` matches the browser window, not the widget. Use `@container`.
- `document.activeElement` is undefined; `ref.focus()` throws. Track focus with `onFocus`/`onBlur`.

**Anything that floats above the page is expensive.** Prefer a panel or inline control.

Overlay primitives live in each app's `src/ui/`, built once and reused.

## 5. Empty, loading and error states

Not fallbacks. Part of the design, required on every list, panel and page.

- **Empty:** say what would fill it and offer the action that does.
- **Loading:** show the shape of what is coming. No full-page spinner.
- **Error:** say what failed and what to do. Never a stack trace, never "Something went wrong".

## 6. Keyboard

Every primary action reachable without the mouse. Register app commands into Twenty's existing
command menu rather than building a parallel one.

## 7. Anti-patterns

Cards around everything · giant page headings · gradients · rounded everything · emoji as icons ·
colour as decoration · multiple accents per screen · marketing layouts inside the app · animation
over 150ms · a second design system · hex literals.

Colour means something (channel, status, destructive intent) or it is grayscale.
