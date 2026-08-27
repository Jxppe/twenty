# TLL CRM

The practice management app for Thailiving Law, Unique X Services and Pattaya Notary: jobs,
deadlines, required documents and the firm's billing entities. Also carries the omnichannel inbox
prototype, which predates D4 and is kept as evidence rather than as product.

This is a **Twenty app**. It adds objects, screens and server functions to a Twenty workspace through
the published application interfaces, and changes nothing in Twenty's own source. That boundary is
deliberate: see [`/docs/DECISIONS.md`](../../docs/DECISIONS.md) D1.

Read [`/docs/JOBS.md`](../../docs/JOBS.md) before changing the domain.

## Starting a session

**One terminal:**

```
cd C:\Users\jespe\Documents\GitHub\twenty\apps\tll-crm
sync
```

That is the whole loop. It watches the branch, and when a commit lands it pulls, applies the metadata
to the CRM, and runs the install hook. Errors print and it retries on the next commit. Nothing to
type between changes.

`dev` and `pull` still exist and are what you want if you are editing files on this machine, since
`dev` watches the filesystem. Changes arrive here by git, so `sync` is the loop that fits.

One thing it does not do: apply destructive metadata changes without asking. If a sync would delete a
field or an object it stops and says so, rather than silently dropping the data with it.

## Starting a session (the old two-terminal way)

Everything below runs **on the development PC**, in Command Prompt. Nothing runs on the NAS.

**Two terminals.** One holds the watcher and stays open all day. The other is for everything else.

### Terminal 1: the watcher

```
cd C:\Users\jespe\Documents\GitHub\twenty\apps\tll-crm
dev
```

Leave it. It rebuilds and re-syncs every time a file is saved, including files that arrive from a
`git pull` in the other window. There is nothing to re-run after an edit.

### Terminal 2: everything else

```
cd C:\Users\jespe\Documents\GitHub\twenty\apps\tll-crm
pull
```

`pull` watches the branch and pulls when something lands, so you never type `git pull`. Terminal 1
picks up whatever arrives. Ctrl-C when you want the terminal back for a one-off command.

Prefer doing it by hand? `git pull` from the repository root does the same thing.

### First run on a machine, or after the config is lost

```
twenty remote:add --url https://crm.tllcrm.fyi --as crm --api-key <key>
twenty remote:use crm
```

Get the key from the CRM: Settings, APIs, create one. Use a key rather than the browser sign-in and
the CLI stops asking you to re-authenticate mid-session.

Once done it is remembered. `twenty remote:list` shows what is configured.

## After a reboot

The NAS brings the CRM up by itself, so usually there is nothing to do: open
`https://crm.tllcrm.fyi` and start the two terminals above.

If it does not load:

| Check | Command or place |
| --- | --- |
| Is the container running | UGOS Docker, Project `tll-crm` |
| Is the tunnel healthy | Cloudflare Zero Trust, Networks, Tunnels |
| What the server says | UGOS Docker, Container `twenty-app-dev`, Log |

Both containers restart with the NAS, so a failure here is usually the NAS itself having been off.

## Commands worth knowing

| Command | When |
| --- | --- |
| `dev` | The watcher. Terminal 1, all day. |
| `twenty plan` | See what a sync would change, without changing it |
| `twenty apply` | Sync once and exit, instead of watching |
| `pull` | Watch GitHub and pull automatically. Terminal 2 |
| `twenty dev:function:exec --postInstall` | Only when the install hook itself changed: the relabel or the seed data. Not part of the normal loop |
| `twenty dev:function:exec -n <name>` | Run one logic function and see its output |
| `twenty dev:function:logs -n <name>` | Stream a function's logs |
| `twenty remote:list` | Which instances are configured, and which is active |

`twenty` and `dev` are scripts in this folder that call the CLI's node bundle directly, so they work
whether or not yarn is healthy on the machine.

## Twenty's "create company when adding a new person" workflow

A workspace seeded from Twenty's dev data carries an active workflow of this name. It reads the new
person's email, and for a **business** domain it finds or creates an organization and links them to
it. It has an explicit "Is this a personal email?" step feeding an "If business email" filter, so
gmail, hotmail and the rest are skipped by design.

MEASURED: seeding six clients produced six runs and four organizations named `example.co.th`,
`example.de`, `example.se` and `example.co.uk`, and each client was linked to the domain-derived
organization rather than the one the seeder gave them. That is the workflow working correctly on
seed addresses that look like company domains, not a bug.

**Whether to keep it is a judgement call, not an obvious fix.** For corporate clients it saves
typing. Against it: it overrides an organization chosen deliberately, and it creates an organization
from a domain rather than from a real registration, which for a firm that files companies is a
different kind of record than the ones staff enter by hand. The Deactivate button is top right of the
workflow page.

Two details if you meet the damage rather than prevent it:

- The trigger reads "Record is created or updated", but correcting a person's organization afterwards
  held: six creates produced six runs, and three subsequent updates produced none.
- Deleting the domain-named organization clears the link. So the order is: point the ones that belong
  somewhere at the right organization, then delete the domain-named ones.

It is workspace data rather than code, so nothing in this repository changes it and it survives every
sync.

## The watcher dies after a few hours

MEASURED: `FATAL ERROR: Ineffective mark-compacts near heap limit` after about two and a quarter
hours of uptime, at Node's default ~4GB cap. The leak is somewhere in the SDK's long-running dev
process, not in this app. The two candidates worth checking are already handled upstream: the event
buffer is capped (`dev-mode-orchestrator-state.ts:236`) and esbuild contexts are disposed on restart
(`esbuild-watcher.ts:90`).

`dev` now does two things about it. It raises the heap cap to 8GB, which buys hours rather than
fixing anything, and it relaunches itself when it dies. That matters more than it sounds: a dead
watcher and a live one look identical in a terminal you are not watching, and the failure shows up as
"my changes stopped appearing" twenty minutes later.

Ctrl-C twice to stop it for real. Once only kills the current run and the loop restarts it.

Nothing is lost in a restart. The watcher empties its output directory and rebuilds from the working
tree every time it starts.

## Install hooks need a nudge

`dev` syncs metadata and nothing else, so the post-install hook that relabels the standard objects
and seeds the billing entities does not fire on a sync. Run it when either looks missing:

```
twenty dev:function:exec --postInstall
```

It reads before writing, so running it twice costs nothing.

## What is still not instant

Objects and fields are database migrations, so a change to them is a real metadata sync, not a hot
reload. Front component and logic function code is faster: the watcher rebuilds and pushes just that.


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
instance to sync against, but not a built monorepo.

The instance is normally the one on the NAS (`https://crm.tllcrm.fyi`). The CLI can also run one
locally in Docker, which is useful for trying something destructive without touching the shared
instance. See "Running" below.

### Windows: check out only this app

Twenty's longest tracked path is 241 characters, so a full checkout blows past Windows' 260-character
limit and aborts halfway. Nothing here needs `twenty-server` on disk, so clone sparsely into a short
base path instead:

```sh
git config --global core.longpaths true

cd C:\Users\<you>\Documents\GitHub
git clone --no-checkout --filter=blob:none https://github.com/Jxppe/twenty.git
cd twenty
git sparse-checkout init --cone
git sparse-checkout set apps/tll-crm docs
git checkout claude/twenty-crm-audit-h5qrnv
```

The app's own longest path is 92 characters, so it fits comfortably. To take the full tree later,
`git sparse-checkout disable` and enable `LongPathsEnabled` in the Windows registry first.

### Running against a local instance

The day-to-day loop is at the top of this file and targets the NAS. This is the alternative: a
throwaway Twenty on your own machine, for changes you would rather not try on the shared one.

```sh
yarn install
twenty docker:start   # prebuilt Twenty on http://localhost:2020, CLI auto-authenticated
twenty remote:use local
dev
```

Demo login is `tim@apple.dev` / `tim@apple.dev`; `twenty docker:status` reprints it.
`twenty docker:reset` wipes the local data and starts clean. `twenty remote:use crm` switches back.

It runs the all-in-one `twenty-app-dev` image, which keeps Postgres inside the container. Fine for
scratch work, wrong for anything you want to keep.

Checks:

```sh
yarn typecheck
yarn lint
yarn test:unit
yarn twenty dev:build    # build the manifest without syncing
```

`dev` never needs a version bump. `app:publish` / `app:install` do, and are the release path, not the
dev loop.

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
