# TLL CRM

The practice management app for Thailiving Law, Unique X Services and Pattaya Notary: matters,
deadlines, required documents and the firm's billing entities. Also carries the omnichannel inbox
prototype, which predates D4 and is kept as evidence rather than as product.

This is a **Twenty app**. It adds objects, screens and server functions to a Twenty workspace through
the published application interfaces, and changes nothing in Twenty's own source. That boundary is
deliberate: see [`/docs/DECISIONS.md`](../../docs/DECISIONS.md) D1.

Read [`/docs/MATTERS.md`](../../docs/MATTERS.md) before changing the domain.

## Daily loop

```
twenty remote:use nas     once, picks which instance you are working against
dev                       leave it running: save a file, it syncs
```

`dev` is a **watcher**, not a one-shot. Start it and leave it. Editing a file
and saving re-syncs the app on its own; there is nothing to re-run.

`dev.cmd` and `twenty.cmd` call the CLI's node bundle directly, so they work
whether or not yarn is healthy on the machine. `./twenty.sh` is the same thing
for a shell.

### Authenticate with an API key, not OAuth

OAuth tokens expire and force a browser round-trip mid-session. An API key does
not. Create one in the workspace under Settings, APIs, then:

```
twenty remote:add --url http://<host>:2020 --as nas --api-key <key>
```

### What is still not instant

Objects and fields are database migrations, so a change to them is a real
metadata sync, not a hot reload. Front component and logic function code is
faster: the watcher rebuilds and pushes just that.


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
instance to sync against, but not a built monorepo: the CLI runs one in Docker for you.

### Windows: check out only this app

Twenty's longest tracked path is 241 characters, so a full checkout blows past Windows' 260-character
limit and aborts halfway. Nothing here needs `twenty-server` on disk, so clone sparsely into a short
base path instead:

```sh
git config --global core.longpaths true

cd C:\ && mkdir dev && cd dev
git clone --no-checkout --filter=blob:none https://github.com/Jxppe/twenty.git
cd twenty
git sparse-checkout init --cone
git sparse-checkout set apps/tll-crm docs
git checkout claude/twenty-crm-audit-h5qrnv
```

The app's own longest path is 92 characters, so it fits comfortably. To take the full tree later,
`git sparse-checkout disable` and enable `LongPathsEnabled` in the Windows registry first.

### Running

```sh
yarn install
yarn twenty docker:start   # prebuilt Twenty on http://localhost:2020, CLI auto-authenticated
yarn twenty dev            # watch and sync on every change
yarn twenty plan           # show what a sync would change, without applying it
```

Demo login is `tim@apple.dev` / `tim@apple.dev`; `yarn twenty docker:status` reprints it.
`yarn twenty docker:reset` wipes the local data and starts clean.

To target an existing instance instead, `yarn twenty remote:add --url <url>` and skip `docker:start`.

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

## Patched dependency: twenty-sdk

`scripts/fix-twenty-sdk-windows-paths.mjs` fixes a Windows-only bug in the SDK. The manifest builder
derives `sourceHandlerPath` / `sourceComponentPath` with `path.relative`, which returns
`src\logic-functions\seed-demo-data.ts` on Windows, and the server rejects any resource path
containing backslashes:

```
INVALID_LOGIC_FUNCTION_INPUT: Resource path must not contain backslashes
INVALID_FRONT_COMPONENT_INPUT: Resource path must not contain backslashes
```

The script normalizes those call sites in the installed bundle to forward slashes. It is idempotent,
and a no-op on macOS and Linux where `path.relative` already returns `/`. Windows accepts forward
slashes in filesystem calls, so normalizing is safe everywhere.

Run it once after every install, on Windows:

```sh
node scripts/fix-twenty-sdk-windows-paths.mjs
```

It is deliberately **not** a `postinstall`. The server builds the dependency layer for logic
functions by running `yarn install` against this `package.json` inside its own container, where
`scripts/` does not exist — a `postinstall` referencing it makes that install exit 1, and every
logic function then fails at runtime with `ROUTE_TRIGGER_PLATFORM_ERROR`. Nothing in this
`package.json` may reference a file the server does not copy.

On an SDK upgrade the script will warn that it could not find the call sites, and will need updating
or dropping if upstream has fixed it. Worth reporting upstream.

## When yarn will not run

Corepack can fail silently on Windows, leaving `yarn --version` printing nothing and every `yarn`
command a no-op. The CLI does not need yarn: it is a plain node bundle in `node_modules`, so invoke
it directly.

```sh
node node_modules/twenty-sdk/dist/cli.cjs plan
node node_modules/twenty-sdk/dist/cli.cjs apply
node node_modules/twenty-sdk/dist/cli.cjs dev
```

`yarn twenty <command>` and `node node_modules/twenty-sdk/dist/cli.cjs <command>` are the same thing.
