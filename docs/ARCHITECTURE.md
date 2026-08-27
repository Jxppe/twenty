# Architecture

Domain boundaries, ownership and integration patterns.

Read [`DECISIONS.md`](./DECISIONS.md) for why things are the way they are,
[`TWENTY_ARCHITECTURE.md`](./TWENTY_ARCHITECTURE.md) for what the foundation actually provides, and
[`REFERENCES.md`](./REFERENCES.md) before building anything substantial.

Status: **PROPOSED**, except where it restates a verified Twenty capability. Built so far: the
omnichannel prototype now living in `apps/tll-crm`, which predates D4.

---

## 1. What this is

**This repository is TLL CRM**: the internal system for Thailiving Law, Unique X Services and
Pattaya Notary. One firm, three legal entities, shared clients.

It is a **practice management system**, not a sales CRM. Twenty is the chassis: contacts, records,
views, permissions, workflows, APIs. The product is what we build on top.

**Takdai is a separate product, built elsewhere** (D4). It is a commercial SaaS with its own stack
and repository. Nothing here needs to stay industry-neutral. Law-firm concepts are first-class.

If Takdai later needs an omnichannel inbox, it builds its own and talks to whatever CRM sits behind
it. The domain thinking in [`OMNICHANNEL.md`](./OMNICHANNEL.md) transfers; the code does not have to.

---

## 2. The three companies

One workspace. `BillingEntity` as a record, not as a tenant boundary (D2).

| Entity | What it is |
| --- | --- |
| Thailiving Law | The firm. Legal work. |
| Unique X Services | Service work: company setup, registrations. Separate for tax. |
| Pattaya Notary | Client-facing notarization brand. Has its own website and social channels. |

`billingEntity` is a **required** relation on `Job`, `Quotation` and `Invoice`, and present on
`ChannelAccount`. It names the legal party to a contract, so it is not optional and not a tag.

It is **not** on `Person` or `Company`. Clients are shared across all three, which is the entire
reason for one workspace.

It flows by default and can always be overridden:

```
ChannelAccount (Pattaya Notary LINE)
        └─► Job defaults to Pattaya Notary
                └─► Quotation inherits from Job
                        └─► Invoice inherits from Quotation
```

`PracticeArea.defaultBillingEntity` does the same job for jobs that do not arrive through a
channel: notarization defaults to Pattaya Notary, company registration to Unique X Services.

---

## 3. Domain ownership

One owner per concept. The owner holds the record; everyone else holds a reference.

### CRM — Twenty, unmodified

People, companies, tasks, notes, timeline activity, users, roles, permissions, views, workflows.

We relabel the vocabulary (D6) and extend with app-defined fields. We do not fork it.

### Practice — our app

Jobs, deadlines, required documents, practice areas, bookings, work logs.

The core of the system. See [`JOBS.md`](./JOBS.md).

### Sales — our app

Products and services, quotations, invoices, payment requests.

Does not own the job: `Quotation.matter` points at it.

### Payments — our app

PromptPay QR, bank transfer instructions, payments, verification state. Per-entity bank accounts in
configuration, never in code. See [`PAYMENTS.md`](./PAYMENTS.md).

### Accounting — FlowAccount, not ours

Statutory accounting, the ledger, tax, official reports. We push customers, invoices and payments
over its API and read status back. We never mirror the ledger.

CONFIRMED: the FlowAccount API is available on any package, so no plan upgrade is needed to
integrate.

**We are not building an ERP** (D3).

### Omnichannel — Takdai, external

If and when it exists. Takdai owns conversations, messages and channel identities; the CRM owns the
client. See [`OMNICHANNEL.md`](./OMNICHANNEL.md) for the contract.

### HR and attendance — TLLACC, for now

Unresolved: whether work logs live here or there (O1), and whether TLLACC currently issues invoices
(O2). Two systems issuing invoices is the failure mode worth avoiding.

---

## 4. Where code lives

```
twenty/                     upstream, tracked, unmodified
  packages/twenty-server    AGPL. Not edited.
  packages/twenty-front     AGPL. Not edited.
  packages/twenty-sdk       MIT. The app toolkit.

apps/
  tll-crm                   jobs, bookings, work logs, sales, payments
                            (also holds the omnichannel prototype, kept as evidence)
```

One app unless there is a reason for two. The three-app split was there to keep a commercial product
clean of law-firm concepts, and D4 removed that need. Objects cannot move between apps after the
first publish, so fewer boundaries is the safer default now.

Apps are standalone projects with their own lockfile, not Yarn workspace members. They can be lifted
into a separate repository unchanged.

**Why the boundary still holds** (D1): the licensing consequence is now small, since our network
users are our own staff. The **upgrade** argument is what keeps the rule. Twenty moves fast and every
core edit is a merge conflict forever.

---

## 5. Runtime shape

Deliberately boring. No microservices.

```
  ┌──────────────────────────────────────────────┐
  │  Twenty                                       │
  │    NestJS + PostgreSQL + Redis + worker        │
  │    schema per workspace                        │
  │    our app: objects, screens, logic functions  │
  └───────┬──────────────────────────┬────────────┘
          │                          │
          │ REST/GraphQL             │ public routes
          ▼                          ▼
   FlowAccount API           client-facing pages
   (invoices, payments)      (quotation accept, payment, booking)
```

Everything is a Twenty platform capability we use, not infrastructure we run. Cloudflare sits in
front for DNS, CDN, WAF and TLS; the application itself is containers on a VM.

---

## 6. Integration patterns

**Client-facing pages.** Public logic-function routes returning HTML (`isAuthRequired: false`),
reached by an unguessable token. Quotation acceptance, payment, booking. VERIFIED precedent:
`packages/twenty-apps/examples/document-generator/src/logic-functions/view-document.ts`. No separate
web application needed.

**Outbound API calls.** Always from a logic function, never the browser. Front components are
sandboxed at an opaque origin, so cross-origin `fetch` sends `Origin: null`. Secrets belong
server-side anyway.

**Automation.** Twenty workflows over our objects. `DATABASE_EVENT` on `quotation.updated`,
`CRON` for deadline escalation. Logic functions can also be exposed as workflow actions and AI tools.

**Accounting.** A provider interface with FlowAccount as the only implementation for now. `None`
stays valid so the system works if the connection breaks.

**Critical constraint, learned the hard way:** the server builds the logic-function dependency layer
by running `yarn install` against the app's `package.json` **inside its own container**, where only
`package.json` and `yarn.lock` exist. Nothing in that file may reference a local path the server does
not copy. A `postinstall` pointing at `scripts/` made every logic function fail with
`ROUTE_TRIGGER_PLATFORM_ERROR`.

---

## 7. Activity history and accountability

Cross-cutting: **for any client, see what happened, when, and who did it.**

Not a module we build. VERIFIED mechanisms:

- `createdBy` / `updatedBy` are `ACTOR` fields on standard objects, populated automatically
- `TimelineActivity` is a standard object; Person, Company and Opportunity already have a Timeline tab
- `defineTimelineActivityType` declares our own events on `created`, `updated`, `deleted`, `restored`,
  `linked`, `unlinked`
- **`emit.through` fans an event along a relation**, so an event on a quotation lands on the client's
  timeline with no fan-out code of ours

**Rule for every domain:** when you add a state change worth answering a question about later,
declare a timeline activity type. They are cheap and cannot be backfilled.

Assignment fields answer "who owns this now". The timeline answers "who did what, when". Both are
needed.

Twenty's dedicated audit module (`core-modules/event-logs`) is Enterprise-licensed. Timeline
activities are not, and are sufficient for operational history.

---

## 8. Multi-tenancy

VERIFIED: schema per workspace (`workspace_<base36 uuid>`), plus `subdomain` and `customDomain`.

Under D4 this is mostly irrelevant: one firm, one workspace. Worth knowing only because it means
migrations are metadata syncs applied per workspace, not global DDL.

---

## 9. What we deliberately do not build

Statutory accounting, ledger, tax filing. Website analytics. An identity provider. A CMS. Our own
CRM primitives. Payroll.

---

## 10. Open questions

Tracked in [`DECISIONS.md`](./DECISIONS.md) under "Open". Summarised:

O1 work logs versus TLLACC · O2 who issues invoices · O3 relabel or split Job · O4 Thai contact
name search · O5 slip verification provider · O6 build or adopt booking availability · O7 Enterprise
for job confidentiality
