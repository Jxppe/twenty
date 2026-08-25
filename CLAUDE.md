# Project

We are building a multi-tenant CRM + omnichannel + sales SaaS using Twenty as the CRM foundation.

Read `/docs/PRODUCT.md` before making architectural decisions, and `/docs/TWENTY_ARCHITECTURE.md` before deciding *where* code goes.

## Important rules

- Do not rebuild functionality already provided by Twenty.
- Do not heavily modify Twenty core unless necessary.
- Prefer extensions, custom objects and isolated modules.
- Preserve compatibility with upstream Twenty where practical.
- Generic SaaS functionality must never depend on Thailiving Law.
- Thailiving-specific functionality must remain modular.
- Omnichannel is a separate domain/service integrated into the CRM.
- Check licenses before copying code from reference repositories.
- Do not introduce a new framework/library without justification.

## Licensing constraint (read this before writing code outside an app)

Twenty is AGPL-3.0 with a "Twenty Application Exception" (see `/LICENSE`). Code that talks to
Twenty only through the **Application Interfaces** (REST/GraphQL APIs, webhooks, the app manifest,
logic functions, front components, the published SDKs) may be licensed on our own terms.
Modifying Twenty's own source puts our modified version under AGPLv3 in full, including section 13
(network users get the source). Files marked `/* @license Enterprise */` are not AGPL at all and
require a Twenty commercial subscription to run in production.

Practical consequence: **build product code as a Twenty app under `packages/twenty-apps/` or a
separate repo, not as edits to `packages/twenty-server` / `packages/twenty-front`.** If a change
genuinely requires touching core, say so explicitly and explain why no extension point works.

## Where things go

| Concern | Home |
| --- | --- |
| Contacts, companies, deals, tasks, notes, activities | Twenty standard objects, unmodified |
| Conversations, messages, channel accounts, contact identities | our app's custom objects |
| Inbox UI, quotation/invoice UI | front components in our app |
| LINE/Meta webhook receipt, provider API calls, PDF rendering | logic functions in our app |
| Provider credentials | app `serverVariables` / connection providers, never hard-coded |
| Thailiving-only modules (matters, legal workflows) | a separate app, installed only in that workspace |

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
