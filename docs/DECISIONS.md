# Decision Record

Decisions taken, with the reasoning, so they are not re-litigated from scratch. Newest first.

Each entry says what was decided, why, what would reverse it, and what was verified versus assumed.

---

## D8 — The UI must switch to Thai, via `AppLocales` plus a partial catalogue

**Decided.** Add `th-TH` to Twenty's locale list and ship an incomplete Thai catalogue, growing it
from use. Contribute the locale upstream first; carry a patch meanwhile.

**Why.** Staff read the whole application, not just our screens. English chrome with Thai panels is
worse than either extreme, so shipping Thai only in our own surfaces is not an answer.

**Why it is cheap.** VERIFIED: `th-TH` is missing from
`packages/twenty-shared/src/translations/constants/AppLocales.ts`, which lists 31 locales. Adding it
is **one line** in an MIT package, and the locale picker, validation and `dynamicActivate` all derive
from that constant. **Lingui falls back to the English source string for missing entries**, so a
partial catalogue works: translate the few hundred strings staff read daily and ship. Nothing breaks
while it is incomplete. Full coverage would be 3,931 front strings, 2,158 server, 67 email.

**This is the one accepted exception to D1**, and a mild one: `twenty-shared` is MIT, so there is no
licence consequence, and the diff is a single array entry. The cost is a merge conflict on upgrade,
which is why upstream contribution comes first.

**Gates our own Thai strings:** app translations are typed `Partial<Record<AppLocale, ...>>`, so the
app cannot ship Thai until the platform knows the locale.

**Not affected either way:** the client-facing quotation, payment and booking pages are our own HTML
and can be bilingual today.

**Language split, decided separately and unchanged:** quotations, invoices and email stay mostly
English. Thai is what clients write to us in, and what the interface must be able to become.

**Reverses if:** upstream adds `th-TH` itself, which removes the divergence and nothing else.

---

## D7 — The CRM is a system of work, not a pipeline

**Decided.** Records are shaped around *what we are doing for a client*, not *how likely we are to
close a deal*. A `Matter` page leads with blocking items, deadlines and open work. Amount and
probability move to the bottom or disappear.

**Why.** Twenty's `Opportunity` is a forecast record: amount, stage, close date, probability. A law
firm needs to answer "what is happening with this client, what is blocking it, what is next". Same
table underneath, entirely different page.

**Reverses if:** never. This is what the firm actually does.

See [`MATTERS.md`](./MATTERS.md).

---

## D6 — Relabel Twenty's vocabulary, do not rename it

**Decided.** Change `labelSingular` / `labelPlural` / `icon` on standard objects so the UI reads as a
law firm. Never change `nameSingular`.

**Why.** VERIFIED: `updateObject` accepts `labelSingular`, `labelPlural`, `nameSingular`, `icon` and
`isActive`, with no guard blocking standard objects. But `nameSingular` is the API contract, so
renaming `opportunity` breaks `/rest/opportunities` and every integration.

`isLabelSyncedWithName` defaults to keeping them in step. **Turn it off on anything relabelled.**

**Reverses if:** an upgrade starts overwriting labels on standard objects. Watch for it.

---

## D5 — Bookings are our object, not Twenty's `CalendarEvent`

**Decided.** A `Booking` object we own. Optionally pushed to staff Google Calendars afterwards.

**Why.** VERIFIED: `CalendarEvent` carries `iCalUid`, `externalCreatedAt`, `externalUpdatedAt` and
`calendarChannelEventAssociations`. It is a mirror of an external calendar, the same trap as `Message`
being a mirror of email. Bookings need their own lifecycle (requested, confirmed, no-show) and their
own relations (matter, billing entity, fee).

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
  are Enterprise, and matter confidentiality is a real use for them. Revisit if it bites.
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

`billingEntity` goes on `Matter`, `Quotation`, `Invoice` and `ChannelAccount`. **Not** on `Person` or
`Company`: the client is shared, and that is the point. It is **required** on Quotation and Invoice,
because it names the legal party to the contract, not a category.

It flows by default: a message on the Pattaya Notary channel opens a matter defaulting to Pattaya
Notary; the quotation inherits from the matter; the invoice from the quotation. Staff can override at
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

| # | Question | Blocks |
| --- | --- | --- |
| O1 | Does TLLACC keep timesheets, or do work logs move here? | `WorkLog` design |
| O2 | Does TLLACC currently issue invoices? Two systems issuing them is the failure mode. | Invoice ownership |
| O3 | Relabel `Opportunity` as Matter, or build a separate `Matter` object? | Start relabelled; split when it chafes |
| O4 | Do staff need to search **Thai contact names** in the CRM? Needs a Postgres tokenizer extension. | Search config |
| O5 | Which slip verification provider, at what cost and failure rate? | Payment automation |
| O6 | Build the booking availability engine, or use Cal.com? | Leaning build; the rules are simple |
| O7 | Row-level permissions for matter confidentiality — worth an Enterprise subscription? | Permission model |
