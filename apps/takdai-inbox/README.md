# Takdai Inbox

Omnichannel inbox for Twenty: LINE, Meta, email and web chat conversations in one place, linked to
Twenty contacts.

This is a **Twenty app**. It adds objects, screens and server functions to a Twenty workspace through
the published application interfaces, and changes nothing in Twenty's own source. That boundary is
deliberate: see the licensing section of [`/docs/TWENTY_ARCHITECTURE.md`](../../docs/TWENTY_ARCHITECTURE.md).

Current state: **milestone 2 spike**. Real objects, real reads and writes, no live channel yet.
[`SPIKE.md`](./SPIKE.md) is the checklist for what running it is meant to answer.

## What it adds to a workspace

**Objects**

| Object | Purpose |
| --- | --- |
| `channelAccount` | One connected provider account (a LINE OA, a Facebook Page) |
| `contactIdentity` | One customer handle on one channel; a person can hold several |
| `conversation` | A thread with one customer on one channel |
| `inboxMessage` | One message in a thread |

**Fields on Twenty's standard objects**

- `person.conversations`, `person.contactIdentities`
- `workspaceMember.assignedConversations`

**Screens**

- Sidebar folder **Inbox**, containing the custom Inbox page plus two native record views
- Standalone page **Inbox** — a three-pane front component (list, thread, contact context)
- **Conversations** tab on the standard Person record page

**Server**

- `seed-demo-data` logic function at `POST /s/inbox/seed-demo-data`, for populating a fresh workspace

## Layout

```
src/
  api/                  REST calls, one module so the front components stay about UI
  constants/            universal identifiers and the channel enum
  fields/               relation fields, one file per side (the SDK requires one export per file)
  front-components/     inbox (standalone page) and person-conversations (record tab)
  logic-functions/      server-side functions
  navigation-menu-items/
  objects/
  page-layout-tabs/     tabs added to Twenty's own record pages
  page-layouts/         our own standalone pages
  ui/                   shared primitives the sandbox forces us to hand-roll
  views/                native record views over our objects
```

`src/ui/` exists because the sandbox drops `createPortal` silently, which breaks every popover in
Radix, base-ui, Headless UI and MUI. Anything that floats above the page gets written here once and
reused, styled from `useTheme()` so it matches the workspace theme.

## Developing

The app is a standalone Yarn project, not part of Twenty's workspace. It needs a running Twenty
instance to sync against.

```sh
yarn install
yarn twenty remote:add --url http://localhost:3000
yarn twenty dev          # watch and sync on every change
yarn twenty plan         # show what a sync would change, without applying it
```

Checks:

```sh
yarn typecheck
yarn lint
yarn test:unit
yarn twenty dev:build    # build the manifest without syncing
```

`yarn twenty dev` never needs a version bump. `app:publish` / `app:install` do, and are the release
path, not the dev loop.

## Gotchas worth knowing before editing

- `theme.spacing` is a token record: `theme.spacing[2]`, not `theme.spacing(2)`.
- Import `ViewType`, `ViewFilterOperand`, `NavigationMenuItemType` and friends from
  `twenty-sdk/define`, not `twenty-shared/types` (not an app dependency).
- `navigate()` takes an `AppPath` enum member plus named params, not a URL string.
- `RestApiClient` typechecks without codegen. `CoreApiClient` needs `yarn twenty dev:generate-client`
  against a live instance before it knows about custom objects.
- Front-component CSS is injected into the host page unscoped. Prefix class names; never write bare
  element selectors.
- Pin `twenty-ui` to the version the target Twenty instance ships. It is alpha.
