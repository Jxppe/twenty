# Working on this app

How to get a clean deploy, what to check when one is not clean, and what to paste into a new chat.

Written after a session that produced eleven red runs before a green one. Every rule below is here
because something went wrong, not because it sounded sensible.

---

## Start a new chat with this

```
Continue the TLL CRM work in this repo.

Branch: claude/twenty-crm-audit-h5qrnv
Deploys: .github/workflows/deploy-tll-crm.yaml, runs on every push, secrets already set.
Read apps/tll-crm/SESSION.md before writing anything.

Use the Twenty connector to check your own work against the live workspace rather than
asking me to paste screenshots. Say what you are about to write before you write it.

<what you want done>
```

If the Twenty connector's tools are not loaded, the chat cannot check its own work and every
verification becomes a round trip through you. Enable it at the start rather than mid-task: it binds
at session start, and a connector that drops mid-conversation does not come back in that
conversation.

---

## The order that keeps runs green

**One idea per commit, and never a field and its placement together.** Creating a field makes Twenty
create its view field at the same derived identifier, both creates collide, and because the plan is
atomic the field is never created either. No amount of re-syncing converges. Placement belongs in the
install hook, which runs afterwards. This cost a full afternoon.

**Typecheck and lint before pushing, not after.** The deploy now runs both before it touches the CRM,
so a type error is a red build rather than a half-applied deploy. Locally:

```
npx tsgo --noEmit -p tsconfig.spec.json
npx oxlint -c .oxlintrc.json src
```

**Neither catches the things that actually break.** Filters, field names and identifier derivation all
fail at run time against the server, and both checks pass happily. That is why the rules in
`.claude/skills/twenty-extension/SKILL.md` exist: read it before writing metadata, every time.

**Read the source, do not guess the API.** Every wrong assumption this session was cheap to check and
expensive to get wrong: whether `ViewKey` has more than `INDEX`, whether a filter takes two operators,
whether a UUID bound is validated. The answer was always one grep away.

---

## When a run is red, in the order to look

**1. Which step failed.** The Actions tab names it. Each step fails for entirely different
reasons and reading the wrong one wastes the round trip.

| Step | What a failure means |
| --- | --- |
| Check the secrets exist | `TLL_CRM_URL` or `TLL_CRM_API_KEY` missing from repository secrets |
| `yarn install --immutable` | The lockfile does not match `package.json`, or its entries are out of sort order |
| Typecheck / Lint | Ordinary code error. Nothing reached the CRM |
| Point the CLI at the CRM | Wrong URL, revoked key, or Cloudflare Access blocking the runner |
| What this would change | The plan could not be computed. Usually a bad identifier or a malformed define |
| Apply metadata | The sync itself was rejected. A real metadata problem. **This is the interesting one** |
| Run the install hook | Expected to fail from CI. An API key cannot execute a logic function |

**2. Both CRM steps print their phase, so read the last line, not the step name.** `plan` and
`apply` run the same pipeline; `plan` stops before writing. Only the last phase is metadata.

| Last line printed | What died |
| --- | --- |
| `Checking server...` | The CRM is unreachable. Tunnel or container, not your code |
| `Building manifest...` / `Building application files...` | Bundling. A bad import or a missing dependency |
| `Running typecheck...` | A type error the Typecheck step should have caught first. Check it ran |
| `Computing metadata plan...` | A bad identifier or a malformed define |
| `Syncing manifest...` | The server rejected the write. **This is the interesting one** |

**3. For a metadata failure, read the error code, not the message.** The CLI's wording misleads in
one specific way that cost this project several hours: it prints **"Authentication failed"** for a
`FORBIDDEN` response as well as a real auth error (`api-client.ts:68`). A permissions problem
therefore looks exactly like a bad key, and the natural response is to make another API key, which
does nothing. If a key worked a moment ago for something else, the problem is permissions.

**4. A partly-applied deploy is normal and safe to re-run.** The metadata plan is atomic, so a failed
apply changed nothing. The install hook is idempotent: it reads before writing, skips what is already
correct, and reports rather than throwing.

---

## The install hook is not automatic

`apply` syncs metadata only. Relabels, field placement and the firm seeding live in the post-install
hook, and **CI cannot run it**: `executeOneLogicFunction` requires a user, and an API key is not one.

Run it by hand after any change to a label, a placement or the seed:

```
cd C:\Users\jespe\Documents\GitHub\twenty\apps\tll-crm
twenty dev:function:exec --postInstall
```

It is safe to run at any time. `fieldsMoved: 0` with empty error arrays means everything is already
where it should be.

---

## What to check in the CRM after a deploy

Not everything, every time. These four catch most of what goes wrong:

- **The sidebar.** Wrong or missing labels mean the install hook has not run since the change.
- **A Job page.** Client next to the name; Deadlines and Required documents leading Relations.
- **A quotation with a line.** Picking a service should fill the description and price and compute
  the totals. This exercises the only logic function that runs on a database event.
- **Money in baht.** A new record showing a dollar sign means a currency field lost its default.

---

### Open: the quotation check above currently fails

Measured against the live workspace on `36c957a0`, deploy run 5 green. A service at 15,000 with a
description and tax rate 7, a quotation, and a line with quantity 2 and no price: `unitPrice`,
`description`, `taxRate` and `lineTotal` all stayed empty, and the quotation's `subtotal`, `tax` and
`total` stayed empty. Updating `quantity`, a field named in `updatedFields`, changed nothing either,
so `priceQuotationLine` is not running at all rather than running and computing wrong.

Ruled out, so do not spend the afternoon here again:

- **Not the deploy.** Run 5's plan reads `0 to add, 19 to change`, so the function was already
  registered by run 4.
- **Not the wrong workspace.** The three `setup-firm` billing entities are present.
- **Not the `updatedFields` filter.** `filterEventsByUpdatedFields` returns early unless
  `operation === 'updated'`, so an `upserted` trigger passes everything through.
- **Not a bogus event name.** `upserted` is a real `DatabaseEventAction`, and
  `workspace-insert-query-builder.ts:264,275` emits both `created` and `upserted` on a plain insert.

Those exclusions are read against upstream `main` in this monorepo, which is the gap: the deployed
CRM may not be that build. What is left needs server-side visibility the connector does not give:

1. Version skew, where the deployed Twenty does not emit `.upserted` on a plain insert.
2. `CallDatabaseEventTriggerJobsJob` does a bare `continue` when the application has no
   `applicationRegistrationId`, which would silently disable every database-event trigger in the app.
3. The handler runs and throws, which is invisible from the record side.

Cheapest next step: the worker log on crm.tllcrm.fyi while a line is written. No
`LogicFunctionTriggerJob` entry points at 1 or 2; an entry that throws points at 3. Check the
deployed Twenty version at the same time.

---

## Where the rules live

| File | What it holds |
| --- | --- |
| `.claude/skills/twenty-extension/SKILL.md` | Every Twenty constraint learned the hard way. Read before writing metadata |
| `CLAUDE.md` | The short form, plus the repository's own rules |
| `docs/DECISIONS.md` | Why things are the way they are, and what would reverse them |
| `docs/JOBS.md`, `docs/FINANCE.md` | The domains |
| `apps/tll-crm/README.md` | Deploy setup, the local fallback, and the known failure modes |

A session that skips the skill file will rediscover the same constraints one red run at a time.
