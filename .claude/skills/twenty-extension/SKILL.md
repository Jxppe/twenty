---
name: twenty-extension
description: Rules for extending Twenty without modifying its source. Use when adding objects, fields, screens, navigation, server functions, roles or AI tools to the CRM, or when tempted to edit packages/twenty-server or packages/twenty-front.
---

# Extending Twenty

## The rule

**Product code goes in an app under `apps/`. It never edits `packages/twenty-server` or `packages/twenty-front`.**

**The reason is upgrade cost, not licensing.** Twenty moves fast, and every core edit is a permanent
merge conflict. The licensing story is real but now mild: Twenty is AGPL-3.0 with an Application
Exception (`/LICENSE`, lines 20-53), so an app talking only to published interfaces may be licensed
on our own terms, while modifying the source triggers AGPLv3 §13 - and since this is an internal
system whose network users are our own staff, offering them the source costs nothing (D4).

So the discipline stands, for a different reason than it started with.

Before proposing any change under `packages/`, state which extension point you checked and why it
does not work.

## Relabel instead of extending, where you can

`updateObject` accepts `labelSingular`, `labelPlural`, `nameSingular`, `icon` and `isActive`, with no
guard blocking standard objects. Making Twenty read as a law firm is mostly relabelling.

**Never change `nameSingular`**: it is the API contract, so renaming `opportunity` breaks
`/rest/opportunities` and every integration. And turn off `isLabelSyncedWithName` on anything
relabelled, or the label snaps back to the name.

Relabelling a standard object keeps its pipelines, kanban, views and page layouts. A new object
starts from nothing. Prefer the relabel; split it out only when the shared shape genuinely chafes.

## What an app can contribute

All of this, declared as TypeScript and synced with the CLI. Verified against
`packages/twenty-shared/src/application/manifestType.ts`.

| Need | Mechanism |
| --- | --- |
| New record type | `defineObject` |
| Field on our object, or on Twenty's `Person`/`Company`/`Opportunity` | `defineField` + `STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS` |
| Sidebar entry | `defineNavigationMenuItem` — types `VIEW`, `OBJECT`, `LINK`, `FOLDER`, `PAGE_LAYOUT` |
| Full custom screen | `definePageLayout` type `STANDALONE_PAGE` + `FRONT_COMPONENT` widget in a `CANVAS` tab, reached by a `PAGE_LAYOUT` nav item |
| Tab on a standard record page | `definePageLayoutTab` + `STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS` |
| Saved list | `defineView` with filters, sorts, fields |
| Server-side logic | `defineLogicFunction` with http / cron / databaseEvent / serverRoute / tool / workflowAction triggers |
| Public webhook, multi-tenant | `serverRouteTriggerSettings` resolver, dispatches to the right workspace |
| Public customer-facing page | `httpRouteTriggerSettings` with `isAuthRequired: false`, returning HTML |
| OAuth to a third party | `defineConnectionProvider` |
| Secrets and per-workspace config | `serverVariables` / `applicationVariables` on `defineApplication` |
| Permissions | `defineRole` with object, field and row-level permissions |
| AI | `defineAgent`, `defineSkill`, `toolTriggerSettings` on a function |

## Gotchas that cost hours

- **`package.json` must not reference files the server does not copy.** The server builds the logic
  function dependency layer by running `yarn install` against it in a bare directory. A `postinstall`
  pointing at `scripts/` makes every logic function fail with `ROUTE_TRIGGER_PLATFORM_ERROR`.
- **`theme.spacing` is a token record**, not a callable: `theme.spacing[2]`.
- **Import enums from `twenty-sdk/define`**, not `twenty-shared/types`, which is not an app dependency.
- **`navigate()` takes an `AppPath` enum member** with named params, not a URL string.
- **`RestApiClient` typechecks without codegen.** `CoreApiClient` needs `dev:generate-client` against
  a live instance before it knows about custom objects.
- **Objects cannot move between apps** after the first `app:publish`. Decide app boundaries early.
- **`yarn twenty dev` needs no version bump**; `app:publish`/`app:install` do.
- On a broken toolchain, the CLI is a plain node bundle: `node node_modules/twenty-sdk/dist/cli.cjs <cmd>`.

## Front component sandbox

Components run in a Web Worker behind Remote DOM. Verified failures, most of them silent:

- `createPortal` renders nothing while reporting success. Radix, base-ui, Headless UI and MUI
  overlays do not work. Build overlays inline with `position: absolute`.
- `ResizeObserver` and `IntersectionObserver` throw. No virtualization, no responsive chart containers.
- `ref.current.focus()`, `.click()`, `.scrollIntoView()` throw. `document.activeElement` is undefined.
- `<canvas>` renders nothing. Use SVG.
- `document`/`window` event listeners register and never fire.
- CSS is injected into the host page unscoped. Prefix class names; no bare element selectors.
- No realtime transport. Poll, or use a native Twenty view which updates over SSE.
- Cross-origin `fetch` sends `Origin: null`. Call third parties from a logic function.

`twenty-ui` **does** work: `Button`, `Tag`, `Status`, `Chip`, `Avatar`, icons, typography, and
`useTheme()` for real design tokens in both themes.

## When core really must change

Rare. If it happens:

1. Say so explicitly and explain which extension points you ruled out.
2. Keep the diff minimal and mechanical.
3. Prefer contributing it upstream over carrying a patch.
4. Record it in `docs/TWENTY_ARCHITECTURE.md` under upgrade risks.

**Adding `th-TH` is the one accepted case** (D8). It is a single entry in
`packages/twenty-shared/src/translations/constants/AppLocales.ts` - MIT, so no licence consequence -
plus PO files. Everything derives from that constant: the locale picker, validation, and
`dynamicActivate`. Lingui falls back to the English source, so a partial catalogue ships fine.

Note this gates our own Thai strings: app translations are typed `Partial<Record<AppLocale, ...>>`,
so an app cannot ship Thai until the platform knows the locale. Contribute it upstream first; carry
the patch meanwhile.
