# CLAUDE.md

Permanent instructions for coding agents on this repository.

## What this is

A commercial multi-tenant SaaS built on Twenty CRM. Two products share the platform:

- **Takdai** — the SaaS sold to small businesses: CRM, omnichannel inbox, sales, Thai payments.
- **TLL CRM** — internal to Thailiving Law, Unique X and Pattaya Notary. Not sold.

Thailiving is customer #1 and the first real testing environment. **The commercial product must
never assume its customer is a law firm.**

## Read before changing architecture

| Document | When |
| --- | --- |
| `docs/PRODUCT.md` | The master brief. Product vision and lifecycle |
| `docs/ARCHITECTURE.md` | Domain boundaries and ownership. Before any structural decision |
| `docs/TWENTY_ARCHITECTURE.md` | What Twenty actually provides, VERIFIED vs PROPOSED |
| `docs/REFERENCES.md` | Before implementing any major feature |
| `docs/OMNICHANNEL.md` | Conversations, messages, channels |
| `docs/FINANCE.md` | Products, quotations, invoices |
| `docs/PAYMENTS.md` | PromptPay, Thai bank transfer |
| `DESIGN.md` | Any UI work |

Skills in `.claude/skills/` carry the same rules in short form: `twenty-extension`, `omnichannel`,
`thai-payments`, `finance`, `saas-ui`.

## Rules

**1. Do not modify Twenty's source.** Product code lives in an app under `apps/`, never in
`packages/twenty-server` or `packages/twenty-front`. This is a licensing constraint, not a
preference: Twenty is AGPL-3.0 with an Application Exception, and modifying it triggers §13, which
obliges us to publish source to every network user of the hosted product. Before proposing a change
under `packages/`, say which extension point you checked and why it does not work.

**2. Inspect Twenty before building a replacement.** It already provides contacts, companies,
opportunities, pipelines, tasks, notes, timelines, custom objects and fields, views, permissions,
workspaces, REST/GraphQL/MCP APIs, webhooks, a workflow engine, file storage, search, AI agents and
Stripe billing. Check the source; do not assume.

**3. Preserve upstream compatibility.** Track `upstream/main` continuously. Prefer contributing a
change upstream over carrying a patch. Record any unavoidable divergence in
`docs/TWENTY_ARCHITECTURE.md` under upgrade risks.

**4. Keep generic and Thailiving-specific code apart.** Nothing in a Takdai app may reference a legal
concept, a Thailiving entity, or a specific bank account. Law-firm functionality goes in `tll-crm`,
installed only in that workspace.

**5. Consult `docs/REFERENCES.md` before implementing anything substantial.** Reference projects are
not dependencies. For each one decide: DIRECT, SERVICE, LIBRARY, REFERENCE, or IGNORE.

**6. Check the licence before reusing code.** MIT, Apache-2.0, BSD and Unlicense are safe.
**AGPL-3.0 code must never be copied into our product** — it makes the product AGPL and forces
source disclosure. Read AGPL projects for patterns and write our own. Ideas are not copyrightable;
source is.

**7. Avoid unnecessary dependencies.** Twenty already ships a design system (`twenty-ui`), an icon
set, a queue, file storage and a workflow engine. A new framework or library needs a written
justification.

**8. Maintain domain ownership.** CRM owns people, companies, deals, pipelines, tasks, activities.
Omnichannel owns channel accounts, contact identities, conversations, messages, inbox state,
assignment. Sales owns products, quotations, invoices, payment requests. Payments owns PromptPay,
bank transfer, payment status and verification. External accounting owns the ledger, statutory
accounting and tax. **We are not building an ERP.**

**9. One source of truth.** A conversation points at a `Person`; it never copies contact fields. An
invoice holds an external reference to the accounting provider; it never mirrors their ledger. If
two places can disagree, the design is wrong.

**10. Do not over-abstract.** Build interfaces where multiple implementations are genuinely expected
— channels, payment methods, accounting providers. Not for CRUD.

## Working style

- Verify claims against the source and say which file you read. Distinguish what you verified from
  what you are proposing.
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
