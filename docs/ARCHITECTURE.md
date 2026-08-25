# Architecture

Domain boundaries, ownership and integration patterns for the platform. Read
[`TWENTY_ARCHITECTURE.md`](./TWENTY_ARCHITECTURE.md) for what the Twenty foundation actually
provides, and [`REFERENCES.md`](./REFERENCES.md) before building anything substantial.

Status: **PROPOSED**, except where it restates a verified Twenty capability. Nothing here is built
apart from the omnichannel prototype in `apps/takdai-inbox`.

---

## 1. Two products, one platform

| Product | What it is | Who runs it |
| --- | --- | --- |
| **Takdai** | The commercial SaaS: CRM + omnichannel + sales + Thai payments | Any small business |
| **TLL CRM** | Thailiving Law, Unique X, Pattaya Notary internal tooling | One organization |

Thailiving's workspace installs the Takdai apps **and** the TLL app. A Takdai customer installs only
the Takdai apps and never sees anything legal. This is enforced by the app boundary, not by
convention: an app that is not installed contributes no objects, no screens and no navigation.

The corollary is a hard rule: **nothing in a Takdai app may reference a legal concept, a Thailiving
entity, or a specific bank account.** If a feature only makes sense for a law firm, it belongs in
`tll-crm`.

---

## 2. Domain ownership

Each concept has exactly one owner. The owner holds the record; everyone else holds a reference.

### CRM (Twenty, unmodified)

Owns people, companies, leads, opportunities/deals, pipelines, tasks, notes, activities, and the
relationships between them. Also owns workspaces, users, roles, permissions and views.

We do not fork these. We extend them with app-defined fields where a relation is genuinely needed
(`person.conversations`, `person.contactIdentities`).

### Omnichannel (our app)

Owns channel accounts, contact channel identities, conversations, messages, attachments, inbox
state, assignment, delivery and read state.

It does **not** own the customer. A `Conversation` points at a `Person`; the `Person` is Twenty's.

### Sales (our app)

Owns products/services, quotations, quotation line items, invoices, invoice line items, and payment
requests.

It does **not** own the deal. A `Quotation` points at an `Opportunity`; the `Opportunity` is
Twenty's.

### Payments (our app)

Owns PromptPay/Thai QR generation, bank transfer instructions, payment records, payment status and
verification state. Per-organization bank accounts and payment settings live in app configuration,
never in code.

### External accounting (not ours)

Owns statutory accounting, bookkeeping, the ledger, tax accounting and official reports. We push
customers, invoices and payments to it through a provider interface and read status back. We never
mirror the ledger.

**We are not building an ERP.** If a feature requires double-entry bookkeeping to be correct, it
belongs in the accounting provider.

---

## 3. Where code lives

```
twenty/                       upstream, tracked, not modified
  packages/twenty-server      AGPL. Do not edit for product features.
  packages/twenty-front       AGPL. Do not edit for product features.
  packages/twenty-sdk         MIT. The app development toolkit.

apps/
  takdai-inbox                omnichannel: objects, inbox UI, channel adapters
  takdai-sales                products, quotations, invoices, payments (not yet created)
                              adds a Sales section to the sidebar with its own views
  tll-crm                     Thailiving-only modules (not yet created)
```

Apps are standalone projects with their own `package.json` and lockfile. They are not Yarn workspace
members of the Twenty monorepo, and they can be extracted to separate repositories without changing
a line of code.

**Why the boundary is not negotiable:** Twenty is AGPL-3.0 with an Application Exception. Code that
talks to Twenty only through the published interfaces may stay proprietary; modifying Twenty's own
source puts our version under AGPLv3 in full, including §13, which obliges us to give every network
user the source. See §2 of [`TWENTY_ARCHITECTURE.md`](./TWENTY_ARCHITECTURE.md).

---

## 4. Runtime shape

Deliberately boring. No microservices at this stage.

```
                    ┌─────────────────────────────────────┐
   LINE / Meta ────► │ public webhook route (one URL)      │
                    │ /webhooks/server/:resolverId        │
                    └──────────────┬──────────────────────┘
                                   │ resolver decides tenant
                                   ▼
                    ┌─────────────────────────────────────┐
                    │ message queue (Twenty's own)        │
                    └──────────────┬──────────────────────┘
                                   ▼
                    ┌─────────────────────────────────────┐
                    │ logic function, in tenant workspace │
                    │ normalize → upsert → match contact  │
                    └──────────────┬──────────────────────┘
                                   ▼
                    ┌─────────────────────────────────────┐
                    │ Postgres, schema per workspace      │
                    └──────────────┬──────────────────────┘
                        ┌──────────┴───────────┐
                        ▼                      ▼
              Inbox front component      Twenty record views
              (polls REST)               (live over SSE)
```

Everything in that diagram is a Twenty platform capability we use, not infrastructure we run.

### Why no separate omnichannel service yet

Keeping conversations as app objects in the tenant's schema buys record views, filters, search,
permissions, timeline, workflow triggers, the REST/GraphQL API and live-updating lists for free. A
separate service means reimplementing all of that plus a sync layer, and creates a second source of
truth for the same data.

Extract one only when a concrete pressure appears: sustained high-volume ingest that the function
runtime cannot absorb, or a channel needing long-lived socket connections. Write down the pressure
before extracting.

---

## 5. Integration patterns

### Inbound provider events

`Provider → public webhook → resolver → queue → per-tenant handler → normalized records`

The resolver runs in the publisher workspace and maps a provider-side account identifier (LINE
`destination`, Meta page id) to a tenant workspace. One webhook URL serves every tenant. Verified:
`packages/twenty-server/src/engine/core-modules/server-route-trigger/server-route-trigger.service.ts`.

### Outbound provider calls

Always from a logic function, never from the browser. Front components are sandboxed at an opaque
origin, so cross-origin `fetch` sends `Origin: null` and most provider APIs will refuse it. Secrets
belong server-side regardless.

### Customer-facing pages

Public logic-function routes returning HTML (`isAuthRequired: false`). Quotation acceptance and
payment pages need no separate web application for the MVP.

### Automation

Twenty workflows over our objects. `DATABASE_EVENT` triggers on `conversation.created`,
`quotation.updated` and so on. Our logic functions can also be exposed as workflow actions and as AI
agent tools.

### Accounting

A provider interface with one implementation at a time:

```
createCustomer  createInvoice  updateInvoice
recordPayment   syncInvoice    getInvoiceStatus
```

`None` is a valid provider. A customer with no accounting connection must still be able to quote,
invoice and take payment.

---

## 6. Multi-tenancy

Verified: Twenty gives every workspace its **own Postgres schema** (`workspace_<base36 uuid>`), plus
a `subdomain` and optional `customDomain`. Tenant isolation is at the schema level, not a `tenantId`
column.

Consequences worth internalizing:

- Our app objects are created per workspace. There is no cross-tenant query, by construction.
- A migration is a metadata sync, applied per workspace, not a global DDL script.
- Anything genuinely cross-tenant (the webhook resolver, marketplace metadata) lives in core tables,
  which we do not own. Design around needing very little of it.

---

## 7. Activity history and accountability (cross-cutting)

A standing requirement across every domain: **for any client, see what happened, when, and who did
it.** Conversations, quotations, invoices, payments and CRM changes all land in one chronological
view per client.

This is not a module we build. Twenty provides it, and every domain feeds it.

**VERIFIED:**

- Standard objects carry `createdBy` / `updatedBy` as `ACTOR` fields, populated automatically.
- `TimelineActivity` is a standard object; Person, Company and Opportunity record pages already have
  a Timeline tab.
- `defineTimelineActivityType` lets an app declare its own events, emitting on `created`, `updated`,
  `deleted`, `restored`, `linked`, `unlinked`.
- `emit.through` **fans an event out along a relation**, so an event on a quotation appears on the
  related Person's timeline with no fan-out code of ours.

**Rule for every domain:** when you add a state change worth answering a question about later,
declare a timeline activity type for it. They are cheap, and they cannot be backfilled.

Assignment fields (`Conversation.assignee`, `Opportunity.owner`) answer "who owns this now". The
timeline answers "who did what, when". Both are needed; neither substitutes for the other.

Note that Twenty's dedicated audit-log module (`core-modules/event-logs`) is Enterprise-licensed.
Timeline activities are not, and are sufficient for operational history. Only a compliance-grade
audit trail needs the Enterprise module.

---

## 8. What we deliberately do not build

- Statutory accounting, ledger, tax filing
- Generic website analytics
- An identity provider
- A CMS (until there is a concrete requirement)
- Our own CRM primitives (contacts, companies, deals, tasks, notes, views, permissions)
- HR or attendance (TLLACC keeps that)

---

## 9. Open architectural questions

Tracked here so they are decided deliberately rather than by accident.

1. **Twenty Enterprise subscription, yes or no.** Gates billing, SSO, row-level permissions and
   audit logs. Determines whether inbox team-scoping is a security boundary or a view filter.
2. **Thai locale.** Not present upstream. Upstream contribution, local patch, or English chrome.
3. **How much of the Inbox is a front component** versus native Twenty views. See the spike results
   in [`TWENTY_ARCHITECTURE.md`](./TWENTY_ARCHITECTURE.md) §6.2.
4. **Where quotation editing lives.** Line items are child records; the native record UI is a poor
   line-item editor, and the sandbox makes a custom one expensive.
5. **One sales app or separate sales and payments apps.** Objects cannot move between apps after
   the first publish.
