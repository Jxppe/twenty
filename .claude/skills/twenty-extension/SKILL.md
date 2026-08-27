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

- **Do not filter the metadata `objects` query by `universalIdentifier`.** MEASURED: the filter is
  ignored and the query returns the first record instead of none, so a lookup for Opportunity
  returned Dashboard and the relabel reported success. Fetch the list and match on **`nameSingular`**
  in your own code.

  The constants themselves are fine: `STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity` resolves
  correctly in `defineField`, which is how our fields reached the right object. It is the filter that
  lies, not the identifier.
- **The client SDK's GraphQL schema is generated from the CLI's version too.** A field that exists in
  one and not the other (`isCustom` in 2.35, `isSystem` in 2.34) typechecks at build and fails at
  runtime. Query only what both versions have, or keep the versions in step.

- **`dev` does not run install hooks.** It syncs metadata, nothing else, so a
  `definePostInstallLogicFunction` never fires during development however many times you sync.
  MEASURED: seeded records absent and standard-object relabels not applied, with no error anywhere.
  Run it by hand with `twenty dev:function:exec --postInstall`. Write install hooks to read before
  they write, so running them again is free.
- **Every view must carry its object's label identifier field at position 0**, or the sync fails with
  `INVALID_VIEW_DATA: Label identifier view field has to be in the lowest position`.
- **Never mint a universal identifier for a view field on a record page.** The engine already
  provisions one per field and derives its identifier from `(view, field, the field's owning
  application)`: `field-record-page-view-field-on-create-side-effect-handler.service.ts:135`. A fresh
  UUID makes the sync attempt a second view field for a pair that already has one, and every one of
  them fails with `INVALID_VIEW_DATA: View field with same fieldMetadataUniversalIdentifier and
  viewUniversalIdentifier already exists`. Repositioning is an update, so reuse the derivation:
  `getSystemViewFieldUniversalIdentifier` from `twenty-sdk/define` for your own fields, and
  `STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.<object>.views.<view>.viewFields.<name>` for Twenty's.
  `position`, `isVisible` and `viewFieldGroupId` are the editable properties
  (`flat-view-field-editable-properties.constant.ts`).
- **An app cannot reposition a view field another application owns.** MEASURED: declaring the derived
  identifier for Twenty's own `stage`, `amount`, `closeDate`, `company`, `pointOfContact` and `owner`
  on the Opportunity record page failed with `ENTITY_ALREADY_EXISTS: Cannot create viewField:
  universalIdentifier ... already exists in viewField maps from application
  "20202020-64aa-4b6f-b003-9c74b97cee20"`, while the seven fields our own app owns went through in
  the same sync. Sort around them instead: `position` is `double precision`, and a FIELDS_WIDGET view
  is exempt from both label-identifier position rules (`flat-view-field-validator.service.ts:260`),
  so a negative position puts your field above a standard one you cannot move. Twenty seeds each
  group at 0, 1, 2 (`compute-standard-opportunity-view-fields.util.ts:163`).
- **Label for someone reading English as a second language** (D12). Prefer the plain word to the term
  of art, and watch especially for common words carrying an uncommon meaning: "Practice" reads as
  rehearsing, "Outstanding" reads as excellent. Those are worse than obvious jargon, because nobody
  thinks to ask.
- **`type` is a reserved field name** (`RESERVED_METADATA_NAME_KEYWORDS` in `twenty-shared`), along
  with a long list of others. The server renames a reserved field to `<name>Custom` rather than
  refusing outright, so check the list before naming a field.
- **A `FILES` field must declare `maxNumberOfValues`**, and the SDK spells that key
  `universalSettings`, not `settings`.

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
  overlays do not work, and **neither does a hand-built one**: a `position: absolute` menu renders
  but receives no pointer events. Use an in-flow control instead of anything that floats.
- `ResizeObserver` and `IntersectionObserver` throw. No virtualization, no responsive chart containers.
- `ref.current.focus()`, `.click()`, `.scrollIntoView()` throw. `document.activeElement` is undefined.
- `<canvas>` renders nothing. Use SVG.
- `document`/`window` event listeners register and never fire.
- CSS is injected into the host page unscoped. Prefix class names; no bare element selectors.
- No realtime transport. Poll, or use a native Twenty view which updates over SSE.
- Cross-origin `fetch` sends `Origin: null`. Call third parties from a logic function.

From `twenty-ui`, **the tokens work and the components do not**: `useTheme()` returns real values and
`Icon*` renders, but `Button`, `Tag`, `Status`, `Avatar` and the typography set arrive unstyled,
since their Linaria classes never reach the sandbox. Build inline-styled primitives in the app's
`src/ui/` instead.

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
