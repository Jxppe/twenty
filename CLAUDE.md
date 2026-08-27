# CLAUDE.md

Permanent instructions for coding agents on this repository.

## What this is

**TLL CRM**: the internal practice management system for Thailiving Law, Unique X Services and
Pattaya Notary. One firm, three legal entities, shared clients, one Twenty workspace.

It is a **system of work**, not a sales pipeline. Staff open it to see what is happening with a
client, what is blocking, and what is next.

**Takdai is a different product, built in a different repository.** Nothing here needs to be
industry-neutral. Law-firm concepts are first-class.

## Read before changing architecture

| Document | When |
| --- | --- |
| `docs/DECISIONS.md` | **First.** Why things are the way they are, and what would reverse them |
| `docs/ARCHITECTURE.md` | Domain boundaries and ownership. Before any structural decision |
| `docs/JOBS.md` | Jobs, deadlines, documents, bookings, work logs. The core of the product |
| `docs/TWENTY_ARCHITECTURE.md` | What Twenty actually provides, VERIFIED / MEASURED / PROPOSED |
| `docs/FINANCE.md` | Quotations, invoices, FlowAccount |
| `docs/PAYMENTS.md` | PromptPay, Thai bank transfer |
| `docs/OMNICHANNEL.md` | The messaging model. Owned by Takdai, kept here for the CRM contract |
| `docs/REFERENCES.md` | Before implementing any major feature |
| `docs/DISCOVERY.md` | What we still have to ask the owner, and where the answers go |
| `DESIGN.md` | Any UI work |
| `docs/PRODUCT.md` | The original brief. Describes Takdai, so read it as history |

Skills in `.claude/skills/` carry the same rules in short form.

## Rules

**1. Do not modify Twenty's source.** Product code is a Twenty app under `apps/`, never
`packages/twenty-server` or `packages/twenty-front`. The reason is now upgrade cost rather than
licensing: Twenty moves fast and every core edit is a permanent merge conflict. Before proposing a
change under `packages/`, say which extension point you checked and why it does not work.

The one accepted exception is adding `th-TH` (D8): three files, MIT package, and upstream has
declined new locales, so it is ours to carry.

**2. Inspect Twenty before building a replacement.** It provides contacts, companies, tasks with
assignees and due dates, polymorphic task targets, notes, timeline activity, custom objects and
fields, calendar views, permissions, workflows, REST/GraphQL/MCP APIs, webhooks, file storage and AI
agents. Check the source; do not assume.

**3. Relabel, do not rename.** Change `labelSingular` / `labelPlural` / `icon` to make the UI read as
a law firm. Never change `nameSingular`: it is the API contract, and the server rejects it on
standard objects anyway. Do not send `isLabelSyncedWithName` on a standard object either: it is a
custom-object property, and including it fails the whole update. Writing object metadata needs the
`DATA_MODEL` permission flag on the app's role.

**4. Model work, not pipeline.** A record page leads with what is blocking and what is due. Amount
and probability are not the point. If a field only supports a sales forecast, it does not belong on
the page.

**5. The UI must be able to switch to Thai.** Staff read the whole application, so English chrome
with Thai panels is not an answer. Lingui falls back to the English source, so a partial catalogue
ships fine and grows from use. Quotations, invoices and email stay mostly English; Thai is what
clients write to us in. Adding the locale touches `AppLocales.ts`, `useLocaleOptions.ts` and
`getDateFnsLocale.ts`, and upstream has closed the door on new locales. See D8.

**6. Preserve upstream compatibility.** Track `upstream/main`. Prefer contributing a change upstream
over carrying a patch. Record unavoidable divergence in `docs/TWENTY_ARCHITECTURE.md` under upgrade
risks.

**7. Check the licence before reusing code.** MIT, Apache-2.0, BSD and Unlicense are safe. AGPL-3.0
code must not be copied into our app: read it for patterns and write our own. Ideas are not
copyrightable; source is.

**8. Avoid unnecessary dependencies.** Twenty ships a design system (`twenty-ui`), an icon set, a
queue, file storage and a workflow engine. A new library needs a written justification.

**9. Maintain domain ownership.** CRM owns people and companies. Practice owns jobs, deadlines,
documents, bookings, work logs. Sales owns quotations and invoices. Payments owns PromptPay and bank
transfer. **FlowAccount owns the ledger, statutory accounting and tax.** We are not building an ERP.

**10. One source of truth.** An invoice holds an external reference to FlowAccount; it never mirrors
their ledger. If two places can disagree, the design is wrong. Watch this especially where TLLACC
overlaps.

**11. Do not over-abstract.** Interfaces where multiple implementations are genuinely expected:
channels, payment methods, accounting providers. Not for CRUD.

## Gotchas that have already cost time

- **`package.json` is a shared contract with the server.** It builds the logic-function dependency
  layer by running `yarn install` against it in a bare container. Nothing in that file may reference
  a local path the server does not copy, or every logic function fails with
  `ROUTE_TRIGGER_PLATFORM_ERROR`.
- Twenty derives record-page view field identifiers from `(view, field, owning application)`. Never
  invent one: reposition by declaring the derived identifier, or the sync rejects every field with
  `View field with same fieldMetadataUniversalIdentifier and viewUniversalIdentifier already exists`.
  But never declare one in the same sync that creates its field: the engine is creating that same
  view field itself, both creates collide with `RESERVED_SYSTEM_UNIVERSAL_IDENTIFIER`, and the atomic
  plan then fails forever. Field first, placement in a later sync.
- `theme.spacing` is a token record: `theme.spacing[2]`, not `theme.spacing(2)`.
- Import enums from `twenty-sdk/define`, not `twenty-shared/types`.
- `navigate()` takes an `AppPath` enum member with named params, not a URL.
- Front components are sandboxed: no portals, no `ResizeObserver`, no canvas, no realtime.
- Twenty cannot index Thai text (`to_tsvector('simple', ...)`). Search Thai names in our own
  screens with `contains` filters, not through the search endpoint.
- `th-TH` is not in `AppLocales.ts`, and app translations are typed `Partial<Record<AppLocale, ...>>`,
  so no Thai string can ship from an app until the locale exists.

## Working style

- Verify claims against the source and say which file you read. Distinguish verified from proposed.
- Prefer the smallest change that answers the question. Prototypes exist to produce evidence.
- Record findings in the relevant document, not just in chat.

---

# Twenty (upstream repo guidance)

Everything below is upstream Twenty's own contributor guidance. It applies when working *inside*
the Twenty packages. Keep it in sync with upstream rather than editing it.

Twenty is an open-source CRM — an Nx / Yarn 4 monorepo. Main packages: `twenty-front` (React 18, Jotai, Linaria, Vite), `twenty-server` (NestJS, TypeORM, PostgreSQL, Redis, GraphQL), `twenty-shared` (isomorphic types/utils), `twenty-ui`, `twenty-sdk` (application SDK + CLI), `twenty-e2e-testing` (Playwright).

Match the surrounding code — the adjacent files in the directory you are editing beat any written rule, including for file naming, which varies by area.

## House rules

Where this repo differs from your defaults:

- Short-form `//` comments, never JSDoc blocks; comment only WHY (a constraint the code cannot express, still true for a reader who never saw your change), never WHAT.
- Types over interfaces (except when extending third-party interfaces); string literals over enums (except GraphQL enums); no `any`; descriptive generics (`TData`, not `T`).
- Named exports only. Functional components only.
- Prefer event handlers over `useEffect` for state updates.
- No abbreviations in names (`fieldMetadata`, not `fm`); constants in SCREAMING_SNAKE_CASE; component props types suffixed `Props`.
- Use `twenty-shared/utils` guards (`isDefined`, `isNonEmptyString`, …) and other existing helpers before writing your own — reimplementing an existing util is the most common AI-authored defect here.
- Lingui for user-facing strings; Linaria (zero-runtime, styled-components pattern) for twenty-front styling.
- Test behavior, not implementation: query by user-visible text/roles, `@testing-library/user-event` for interactions.

Longer-form guides remain in `.cursor/rules/` (from the Cursor era).

## Commands

```bash
bash packages/twenty-utils/setup-dev-env.sh   # Postgres/Redis + DB init; only for tasks needing a running app
yarn start                                    # front + server + worker

npx jest path/to/file.spec.ts --config=packages/<pkg>/jest.config.mjs   # single test file (preferred)
npx nx test twenty-server                     # package unit tests (same for twenty-front, ...)
npx nx run twenty-server:test:integration:with-db-reset
npx nx storybook:build twenty-front && npx nx storybook:test twenty-front

npx nx lint:diff-with-main twenty-server      # diff-based lint (fast; add --configuration=fix); run with typecheck after changes
npx nx fmt <pkg>                              # format
npx nx build twenty-shared                    # required before building/testing packages that depend on it
npx nx database:reset twenty-server
npx nx run twenty-front:graphql:generate      # after GraphQL schema changes (--configuration=metadata for metadata schema)
```

## Gotchas

- **`twenty-shared/dist` is per-branch state nothing tracks.** After switching branches or editing `twenty-shared`, run `npx nx build twenty-shared --skip-nx-cache` before trusting any typecheck or test failure in a dependent package.
- **Nx caching can serve a stale pass.** To verify a fix, run `npx tsgo -p tsconfig.json --noEmit` in the package directly rather than `nx typecheck`.
- **Do not commit translation catalogs unless translations are the task.** `lingui extract`/`compile` regenerate `packages/twenty-server/src/engine/core-modules/i18n/locales/*.po` and `locales/generated/*` with thousands of lines of churn as a side effect of touching any `msg` string. The i18n pipeline maintains them; leave them out of your commit.
- **Commit messages must not carry AI attribution.** CI rejects commits containing `@anthropic.com` co-author trailers or "Generated with Claude Code" lines.
- **Upgrade commands** (`packages/twenty-server/src/database/commands/upgrade-version-command/`): add or edit files only under the current `TWENTY_CURRENT_VERSION` directory, with a real epoch-ms timestamp strictly greater than every existing one in that directory — CI enforces both, and the upgrade cursor silently skips a command that sorts before an already-applied one. Include `up` and `down`; never rewrite committed command logic. See `packages/twenty-server/docs/UPGRADE_COMMANDS.md`.
- **Entity file changes need a generated instance command**: `npx nx run twenty-server:database:migrate:generate --name <name> --type <fast|slow>` (slow = adds a data-backfill step).
- A read-only Postgres MCP server is configured in `.mcp.json` for inspecting workspace data, metadata, and migration results. Writes go through the CLI commands above.
- E2E login: click "Continue with Email" and use the prefilled credentials.
