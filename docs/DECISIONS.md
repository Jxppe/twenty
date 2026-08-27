# Decision Record

Decisions taken, with the reasoning, so they are not re-litigated from scratch. Newest first.

Each entry says what was decided, why, what would reverse it, and what was verified versus assumed.

---

## D15 — Quotations and invoices move here; FlowAccount keeps the ledger

**Decided.** Closes O2. TLLACC has CRM, quotation and invoicing modules and **they do not work**:
nothing financial runs in it today. So there is no second system issuing invoices and nothing to
migrate away from. Quotation, then invoice, then payment, runs here against FlowAccount.

**The order is the firm's order.** Quote first, invoice on acceptance. That is how they already work
and there is no reason to invert it.

**FlowAccount still owns the ledger** (D3, and rule 10 in `CLAUDE.md`). Our invoice carries an
external reference to theirs; it never mirrors their numbers. Payments and their confirmation look
like they come from FlowAccount's API, which keeps the money side in one place.

**What is not decided.** Whether **quotations** are ours or FlowAccount's. FlowAccount issues
quotations too, and this is the same shape of question O2 was: two systems producing a numbered
document for the same client is the failure worth avoiding. The argument for ours is that a quotation
is part of the conversation about a job and staff should not leave the CRM to produce one. Settle it
before building either.

**Gated on the account existing.** How much the FlowAccount API covers, its rate limit, and whether
credentials are per billing entity or one per workspace are all unanswered and all shape the
integration. See `FINANCE.md` §8.

---

## D14 — Field placement is applied on install, not declared in the manifest

**Decided.** No `defineViewField` files. `setup-firm.ts` reads `FIELD_PLACEMENTS` and applies each
one through `updateViewField` after the sync.

**Why the declarative version cannot work.** Creating a field makes Twenty create its view fields
too, deriving their identifiers from `(view, field, owning application)`. A declaration has to reuse
that derivation to be an update rather than a duplicate. So on a fresh install both creates land in
one plan, collide with `RESERVED_SYSTEM_UNIVERSAL_IDENTIFIER`, and because the plan is atomic the
field is never created either and re-syncing never converges.

This was not theoretical: the seven Job placement files worked only because those fields already
existed here from an earlier sync. **The app could not have been installed on a new workspace**, and
that would have surfaced when setting up the real one.

**What the hook does.** Resolves everything by name against the server: the object by
`nameSingular`, the field by `name`, the view by `objectMetadataId` plus `key`, the view field by
`fieldMetadataId`, and the group by `name` because groups carry no universal identifier. It skips
anything already in position and reports what it could not find rather than failing the install.

**Not by compiled identifier.** The first version derived the view identifier from
`STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS`, which works in Node and does not survive into a bundled
logic function: MEASURED, all five arrived as non-strings that serialised to `null` while the server
held exactly the values computed locally. Resolving by name is also what D6 already required for the
same underlying reason.

**Cost.** Placement no longer travels with a `dev` sync: it needs
`twenty dev:function:exec --postInstall`, the same nudge relabels already need.

**What would reverse it.** Twenty deferring to a caller-provided view field instead of emitting its
own. The side-effect handler documents the opposite as deliberate.

---

## D13 — The app soft-deletes, it never destroys

**Decided.** `src/default-role.ts` keeps `canDestroyAllObjectRecords: false`. Nothing this app runs
can permanently erase a record.

**Why it came up.** Clearing Twenty's demo data hit
`Entity performing the request does not have permission` on `destroyMany`, and the obvious fix was to
grant the permission. That trade is wrong: a permanent, irreversible power over every client record,
granted so a one-off cleanup could tidy itself.

**Soft delete is enough for what we actually need.** A soft-deleted row is hidden from every view and
every default query. The demo records went from 1,950 to invisible with the permission we already
had.

**A law firm is the wrong place to be casual about this.** Records may have to be produced years
later, and "the app deleted it" is not a defence. If a record genuinely must be erased, that is a
deliberate act by a person in the interface, with their name on it, not something a logic function
can do in a loop.

**What would reverse it.** A real requirement to erase on request, in which case it wants its own
narrowly scoped role rather than a flag on the default one.

---

## D12 — Plain English in the interface, not terms of art

**Decided.** Interface words are chosen for someone reading English as a second language. Where a
term of art and a plain word both fit, the plain word wins.

Applied so far: the **Practice** folder is **Work**. **Practice area** is **Type of work**.
**Outstanding deadlines** is **Deadlines due**. This is the same reasoning that produced D9, now
stated as a rule rather than a one-off.

**Why.** Two failure modes, and the second is the dangerous one.

- **Jargon that means nothing.** "Practice area" is a legal-industry term. Nobody outside the
  industry has met it, and it has to be learned before the screen can be read.
- **A common word carrying an uncommon meaning.** Worse, because it does not look like jargon and so
  nobody asks. "Practice" reads first as rehearsing a skill. "Outstanding" reads first as excellent,
  which inverts the meaning of the list it labels. A reader who guesses wrong here has no signal that
  they guessed.

The test: would someone with school English read this correctly on the first try, with no context?

**Cost of being wrong:** labels are the cheapest thing in the system to change. `nameSingular` and
every identifier stay put, per D6.

**What this does not license.** Renaming things that are already plain, or inventing coy names to
avoid a word that is simply correct. Deadline, invoice, booking and client are all fine.

---

## D11 — Historic clients arrive by spreadsheet import, not a migration

**Decided.** The clients the firm already tracks come in through Twenty's own spreadsheet import.
No importer is built.

**Why.** The firm keeps records only for its larger clients, so the volume is small and one-off.
Twenty ships the whole wizard already: upload, pick the sheet, pick the header row, match columns to
fields, validate, import
(`packages/twenty-front/src/modules/spreadsheet-import/steps/components/`). Writing anything to
replace that would be rule 2 in `CLAUDE.md` violated for no gain.

**What it costs.** Someone has to produce the spreadsheet, which is the real work and is not a
software problem. Relations have to be imported in dependency order: organizations before people,
people before jobs, because a row can only point at something that already exists.

**What would reverse it.** Finding that the history is large, or lives in a system with an API worth
reading directly. Neither looks true.

---

## D10 — Both spellings of a name, in two fields

**Decided.** Twenty's `name` holds the Latin-script name. A second field, `nameTh`, holds the Thai
one. Person gets a `FULL_NAME` so first and surname stay separable; Company gets a `TEXT`, because a
registered company name is one string.

**Why not one field with whatever the client uses.** Because both spellings are real and needed in
different places. A Thai passport carries both. The visa file, the bank and anything in English want
the Latin one; the land office, the DBD record and any Thai court filing want the Thai one.
Romanisation is lossy in both directions and there is no rule that recovers one from the other, so
storing one and deriving the other is not available. Keeping the pair is the only version that does
not lose information.

**It also mostly answers O4.** Twenty cannot index Thai: search runs through
`to_tsvector('simple', ...)`, which has no Thai word boundaries. With a Latin name on essentially
every record, Twenty's own search works for essentially every record. The Thai field is not
searchable that way and does not need to be, because `contains` filters are substring matches and
work on Thai fine. The Postgres tokenizer extension drops from likely requirement to last resort.

**Cost of being wrong:** two fields nobody fills in. Nothing depends on them being populated.

**What would reverse it.** Discovering staff want to type a Thai name into the global search box
rather than a filter. That is a real possibility and it is question 14 and 37 in
[`DISCOVERY.md`](./DISCOVERY.md).

---

## D9 — The word is Job, not Matter

**Decided.** A piece of client work is a **Job** in the interface.

**Why not Matter.** It is the correct term of art, and it is the wrong word here. Two reasons, both
about the people using this:

- **The work is not all legal.** Visa applications, company registration and notarization are as much
  of the business as disputes are, and "matter" carries a litigation flavour that fits Thailiving Law
  better than it fits Unique X Services or Pattaya Notary.
- **Staff read English chrome as a second language** until `th-TH` lands (D8), and "Matter" is among
  the least transparent words available. "Job" needs no explanation to anyone.

**Cost of being wrong:** one line. Labels on standard objects are stored as overrides and changed by
the install hook, so the vocabulary can move again without touching data.

**Identifiers did not move.** `matterDeadline`, `matterId` and the rest keep their names: renaming a
synced object or field is a destructive metadata change, and nobody sees an identifier. See
[`JOBS.md`](./JOBS.md) §3.

---

## D8 — The UI must switch to Thai, via `AppLocales` plus a partial catalogue

**Decided.** Add `th-TH` to Twenty's locale list and ship an incomplete Thai catalogue, growing it
from use. Contribute the locale upstream first; carry a patch meanwhile.

**Why.** Staff read the whole application, not just our screens. English chrome with Thai panels is
worse than either extreme, so shipping Thai only in our own surfaces is not an answer.

**Corrected: it is not one line, and upstream will not take it.**

[PR 17225](https://github.com/twentyhq/twenty/pull/17225) added exactly these four locales, `th-TH`
among them, and was closed by a maintainer: *"We're not open to adding more locales for now. We need
to improve quality for existing locales first."* So contributing upstream is not the escape hatch,
and the patch is ours to carry indefinitely.

**And there is nothing in it to reuse.** All four commits on the branch were fetched and checked, not
just the head: only one of them (`ba13abdfe`) touches a `th-TH.po` at all, two are merges from main,
and the last touches services rather than catalogues. At the branch head the front catalogue has
2,375 strings, the server 828, emails 44, and **every single `msgstr` is empty**. The PR added
plumbing and blank files, no Thai. `lingui extract` produces the same blanks in a minute.

**What that fourth commit did teach us is the file count.** It is titled *"fix: add missing locales
to i18n services — fixes runtime errors when these locales are used"*, and it patches two more
hardcoded registries. So it is **five hand-edited files**, not three:

Three files, not one, all verified in the source:

| File | What happens without it |
| --- | --- |
| `twenty-shared/.../AppLocales.ts` | The locale does not exist |
| `twenty-front/.../useLocaleOptions.ts` | **Thai never appears in the picker.** The list is a hand-written array of 30 entries, not derived from `APP_LOCALES` |
| `twenty-front/.../getDateFnsLocale.ts` | Thai dates format with English rules. The switch has an `en-US` default, so this degrades rather than crashes |
| `twenty-server/.../i18n/i18n.service.ts` | Runtime errors on the server when the locale is selected. One hardcoded import and map entry per locale |
| `twenty-emails/src/utils/i18n.utils.ts` | The same, for outbound email. Also a type error at build |

Plus the six generated catalogue files, which `lingui extract` and `compile` produce.

**Lingui still falls back to the English source string**, so a partial catalogue works and nothing
breaks while it is incomplete. Full coverage would be 3,931 front strings, 2,158 server, 67 email.

**This is the one accepted exception to D1.** `twenty-shared` is MIT, but `twenty-front`,
`twenty-server` and `twenty-emails` are AGPL, so patching them puts our deployment under AGPL in
full. Under D4 that costs nothing: the network users are our own staff, and offering them the source
is free. The real price is the merge-conflict surface, five files across four packages, on every
upgrade.

**Gates our own Thai strings:** app translations are typed `Partial<Record<AppLocale, ...>>`, so the
app cannot ship Thai until the platform knows the locale.

**Not affected either way:** the client-facing quotation, payment and booking pages are our own HTML
and can be bilingual today.

**Language split, decided separately and unchanged:** quotations, invoices and email stay mostly
English. Thai is what clients write to us in, and what the interface must be able to become.

**Reverses if:** upstream reopens to new locales. On the evidence of PR 17225, do not plan on it.

---

## D7 — The CRM is a system of work, not a pipeline

**Decided.** Records are shaped around *what we are doing for a client*, not *how likely we are to
close a deal*. A `Job` page leads with blocking items, deadlines and open work. Amount and
probability move to the bottom or disappear.

**Why.** Twenty's `Opportunity` is a forecast record: amount, stage, close date, probability. A law
firm needs to answer "what is happening with this client, what is blocking it, what is next". Same
table underneath, entirely different page.

**Reverses if:** never. This is what the firm actually does.

See [`JOBS.md`](./JOBS.md).

---

## D6 — Relabel Twenty's vocabulary, do not rename it

**Decided.** Change `labelSingular` / `labelPlural` / `icon` on standard objects so the UI reads as a
law firm. Never change `nameSingular`.

**Why.** `nameSingular` is the API contract, so renaming `opportunity` would break
`/rest/opportunities` and every integration. Labels are free.

**Corrected after it failed against a live instance.** There *is* a guard, and it is a whitelist:
`FLAT_OBJECT_METADATA_EDITABLE_PROPERTIES.standard` allows only `labelSingular`, `labelPlural`,
`icon`, `description`, `color`, `isActive` and `isSearchable` on a standard object. `nameSingular`
and `namePlural` are absent, which enforces this decision for us.

So is **`isLabelSyncedWithName`**, and sending it fails the entire update with `Cannot edit standard
object metadata properties`. It is a custom-object property. Standard-object labels are stored as
*overrides* instead, which is why they do not need desyncing. Set it on our own objects, never on
Twenty's.

**Writing any of this needs the `DATA_MODEL` permission flag** on the app's role. Record permissions
do not cover object metadata.

**And find the object by `nameSingular`, not by filtering on `universalIdentifier`.** MEASURED: that
filter is ignored and returns the first record, so a lookup for Opportunity relabelled Dashboard and
reported success.

**Reverses if:** an upgrade starts overwriting label overrides on standard objects. Watch for it.

---

## D5 — Bookings are our object, not Twenty's `CalendarEvent`

**Decided.** A `Booking` object we own. Optionally pushed to staff Google Calendars afterwards.

**Why.** VERIFIED: `CalendarEvent` carries `iCalUid`, `externalCreatedAt`, `externalUpdatedAt` and
`calendarChannelEventAssociations`. It is a mirror of an external calendar, the same trap as `Message`
being a mirror of email. Bookings need their own lifecycle (requested, confirmed, no-show) and their
own relations (job, billing entity, fee).

VERIFIED and load-bearing: `ViewType.CALENDAR` exists with DAY/WEEK/MONTH layouts, and
`CALENDAR_WIDGET` for dashboards. **Group and per-staff calendars are view configuration, not custom
UI.** VERIFIED: a `create-calendar-event` workflow action exists, so pushing out to Google is
supported.

---

## D4 — Takdai is a separate product, built outside this repository

**Decided.** This repository is **TLL CRM**: Thailiving Law, Unique X Services and Pattaya Notary.
Takdai is a separate commercial product with its own stack and its own repository.

**Why.** They have different customers, different lifecycles and different constraints. Trying to
keep one codebase industry-neutral while a law firm uses it daily was a constraint that cost
something and bought nothing.

**Consequences, all simplifying:**

- Law-firm concepts are first-class here. No optional-module gymnastics.
- The AGPL §13 exposure becomes near-toothless: network users of a modified Twenty are our own staff,
  so "offer them the source" costs nothing. Core modification is still bad for upgrades, so the
  discipline stays, but it is no longer a commercial risk.
- Twenty Enterprise is not needed: no billing, no SSO requirement. **Flagged:** row-level permissions
  are Enterprise, and job confidentiality is a real use for them. Revisit if it bites.
- No multi-tenancy work. One workspace.

**If Takdai later wants an inbox**, it builds its own and talks to whatever CRM sits behind it. The
domain thinking in [`OMNICHANNEL.md`](./OMNICHANNEL.md) transfers; the code does not have to.

**Takdai's shape, stated for the record.** The model is Freshworks: a *suite* of separately sold
products on one platform: an omnichannel support app, a CRM, and more later, each with its own
pricing tiers, rather than one application with a feature list.

Three consequences for whoever builds it, none of which apply to this repository:

- **Entitlements are architecture, not billing configuration.** Tiering that arrives after launch
  means retrofitting a permission dimension through every feature. Freshworks-style laddering (agent
  seats, channel count, automation limits, AI usage) has to be a first-class concept on day one.
- **Each product must stand alone and be better together.** Someone should be able to buy the inbox
  without the CRM. That forces the same clean split this repository already documents: the messaging
  layer owns conversations, the CRM owns the client, one ID points one direction.
- **Twenty is not the chassis for that.** Twenty is one CRM, which is the wrong starting shape for a
  multi-product suite, and this is a further reason D4 is right beyond the ones above.

TLL remains Takdai's first customer, which is the useful part: the inbox gets validated against a
real firm's traffic before it is sold to anyone.

---

## D3 — Twenty plus FlowAccount, not ERPNext

**Decided.** Stay on Twenty. Accounting goes to FlowAccount over its API.

**Why.** This was close, and it turned on the omnichannel layer moving out to Takdai.

*The case for ERPNext, which is real:* [`erpnext_thailand`](https://github.com/ecosoft-frappe/erpnext_thailand)
(MIT, by Ecosoft) already implements service VAT with the tax point on payment, withholding tax
certificates, PND reports, deposit invoicing, Thai amount-in-words and BOT exchange rates. Multi-
company with separate legal entities is a first-class ERPNext concept. HRMS could absorb TLLACC.
That is months of work already done.

*Why Twenty won anyway:*

- **FlowAccount is 300 baht a month and its job is being correct about Thai tax.** Cheapest
  correctness available. CONFIRMED: the API works on any package, so no plan upgrade needed.
- **ClefinCode Chat does not close the omnichannel gap.** VERIFIED: WhatsApp, Telegram, Instagram and
  Messenger, **no LINE**, and it reads as team chat with document linking rather than a shared agent
  inbox. So omnichannel is custom work in either stack.
- **Frappe's PostgreSQL support is experimental**; MariaDB is the production database. Against a
  stated PostgreSQL preference.
- **Neither runs on Cloudflare Workers.** Both are stateful containers behind a VM. That concern was
  symmetric and did not distinguish them.
- **Maintainability.** TypeScript and React, an app SDK we have verified end to end, and a stack the
  maintainer can move fast in. For a small team this is not a soft preference.

**Reverses if:** FlowAccount's API turns out to be unusable, or the firm decides it wants HR,
accounting and CRM in one system badly enough to accept the stack change. The accounting provider
sits behind an interface precisely so this stays cheap.

---

## D2 — One workspace, `BillingEntity` on the records

**Decided.** One Twenty workspace. A `BillingEntity` object with three rows, related to the records
that need to name a legal person.

**Why.** Thailiving Law, Unique X Services and Pattaya Notary share customers but bill separately for
tax reasons. Separate workspaces would split the client history, which is the thing worth having.

`billingEntity` goes on `Job`, `Quotation`, `Invoice` and `ChannelAccount`. **Not** on `Person` or
`Company`: the client is shared, and that is the point. It is **required** on Quotation and Invoice,
because it names the legal party to the contract, not a category.

It flows by default: a message on the Pattaya Notary channel opens a job defaulting to Pattaya
Notary; the quotation inherits from the job; the invoice from the quotation. Staff can override at
any step.

---

## D1 — Product code lives in apps, not in Twenty's source

**Decided.** Everything we build is a Twenty app under `apps/`. `packages/twenty-server` and
`packages/twenty-front` stay unmodified.

**Why.** VERIFIED: Twenty is AGPL-3.0 with an Application Exception (`/LICENSE` lines 20-53). Apps
using only the published interfaces may be licensed freely; modifying Twenty puts the modified
version under AGPLv3 in full.

Under D4 the licensing consequence is now small. **The upgrade argument is what keeps this rule.**
Twenty moves fast, and every core edit is a merge conflict forever.

VERIFIED to work, end to end, on a live instance: custom objects, fields on standard objects, a
`STANDALONE_PAGE` reached from the sidebar, a tab on `personRecordPage`, logic functions with public
and authenticated routes, native record views, and `twenty-ui` components inside front components.

**One accepted exception:** adding `th-TH` to `AppLocales.ts`. See D8. One line in an MIT package, so
the licence cost is nil and the merge cost is the only thing being paid.

---

## Open, not yet decided

`docs/DISCOVERY.md` restates these in plain language, alongside the wider set of questions worth
putting to the owner in one sitting.

| # | Question | Blocks |
| --- | --- | --- |
| O1 | Does TLLACC keep timesheets, or do work logs move here? | `WorkLog` design |
| ~~O2~~ | **Answered.** TLLACC's financial side does not work, so nothing issues invoices today. See D15. | Closed |
| O3 | Relabel `Opportunity` as Job, or build a separate `Job` object? | Start relabelled; split when it chafes |
| O4 | Mostly answered by D10: a Latin name on every record makes Twenty's search work. What remains is whether staff want to type a **Thai** name into global search rather than a filter. | Search config |
| O5 | Which slip verification provider, at what cost and failure rate? | Payment automation |
| O6 | Build the booking availability engine, or use Cal.com? | Leaning build; the rules are simple |
| O7 | Row-level permissions for job confidentiality — worth an Enterprise subscription? | Permission model |
