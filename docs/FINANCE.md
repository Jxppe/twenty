# Operational Finance

Status: **PROPOSED**. Nothing here is implemented.

Read [`DECISIONS.md`](./DECISIONS.md) D2 and D3 first, and [`JOBS.md`](./JOBS.md) for what a
matter is.

---

## 1. What this is, and what it is not

We build the **operational** finance experience around a customer: what you quote, what you invoice,
what you are owed, what got paid.

We do **not** build statutory accounting. Explicitly out of scope, permanently:

- General ledger
- Double-entry bookkeeping
- Statutory accounting and financial statements
- Tax accounting and filing
- Payroll accounting
- Full bank reconciliation
- Country-specific regulatory reporting

Those are solved, regulated, and audited. A dedicated accounting platform owns them. If a feature
needs double-entry to be correct, it belongs there, not here.

The test: **would an accountant be legally accountable for this number?** If yes, the accounting
provider owns it. We hold an operational view and push facts to the provider.

---

## 2. The model

### Product / Service

| Field | Notes |
| --- | --- |
| `name`, `description` | |
| `code` | SKU or service code, optional |
| `unitPrice` | `CURRENCY` — amount plus currency code, so THB is native |
| `taxRate` | Ours. Twenty has no tax concept. |
| `unit` | hour, item, case, month |
| `category` | |
| `isActive` | Retire without deleting; historical line items must keep resolving |

All documents carry a **required** `billingEntity` (D2). It names the legal party to the contract,
so it is neither optional nor a category. It defaults down the chain
(channel → job → quotation → invoice) and can be overridden at any step.

### Quotation

| Field | Notes |
| --- | --- |
| `number` | Human reference, per-entity sequence |
| `status` | `DRAFT` / `SENT` / `ACCEPTED` / `DECLINED` / `EXPIRED` |
| `validUntil` | |
| `subtotal`, `discount`, `tax`, `total` | Stored, not computed on read: a sent quotation must never change because a product price did |
| `matter` | Relation to the job this quotes for |
| `billingEntity` | **Required.** Which of the three companies is contracting |
| `person`, `company` | Relations to Twenty records |
| `pdf` | `FILES` field |

### QuotationLineItem

Child object: `product`, `description`, `quantity`, `unitPrice`, `discount`, `taxRate`, `lineTotal`.

Description and price are **copied** from the product at creation, not referenced. A quotation is a
historical document.

### Invoice / InvoiceLineItem

Same shape. `status`: `DRAFT` / `ISSUED` / `PARTIALLY_PAID` / `PAID` / `OVERDUE` / `VOID`. Adds
`dueDate`, `issuedAt`, `quotation` (the source), and `amountPaid`.

Never delete an issued invoice. Void it.

### PaymentRequest and Payment

See [`PAYMENTS.md`](./PAYMENTS.md).

---

## 3. Lifecycle

```
Opportunity ──► Quotation(DRAFT) ──► SENT ──► ACCEPTED ──► Invoice(ISSUED)
                                       │                        │
                                       └─► DECLINED             ├─► PaymentRequest ──► Payment
                                       └─► EXPIRED              └─► PAID ──► Opportunity won
```

Each arrow is a workflow trigger on a database event, not hand-written glue. Twenty's workflow
engine already provides `DATABASE_EVENT` triggers and `record-crud` actions.

### How a quotation becomes accepted

Three paths, all converging on `status = ACCEPTED`. Downstream logic keys off the status, never off
how it got there.

1. **Manager marks it accepted.** Always available. The fallback that works when a customer agrees
   over the phone or in person.
2. **Customer clicks accept** on the emailed quotation. The link opens the public quotation page (a
   logic-function route, unguessable token) with an accept button.
3. **A workflow infers agreement** from an email reply. Weakest signal; requires a human to confirm
   before it converts.

Whichever path fires, invoice creation is a single workflow triggered on
`quotation.updated` where `status` became `ACCEPTED`. Only that transition converts, enforced
server-side.

Rules worth stating once:

- **Quotation → Invoice copies, never links live.** Editing the quotation afterwards must not change
  the invoice.
- **Only `ACCEPTED` quotations convert.** Enforced server-side, not in the UI.
- **Numbering is per organization and gap-free.** Sequence allocation happens in a logic function
  under a lock, not client-side.
- **Currency is per record**, defaulting to the organization's. `CURRENCY` fields carry the code.

---

## 4. Financial visibility

The dashboards worth having, all derivable from the objects above with Twenty's existing aggregate
and chart widgets:

- Revenue by period (paid invoices)
- Outstanding balance (issued minus paid)
- Overdue, bucketed by age
- Quotation conversion rate and average time to acceptance
- Revenue by product, by channel, by owner

These are page layouts with chart widgets over our objects. They need no separate reporting stack.

Explicitly not here: profit and loss, balance sheet, cash flow statement. Those are accounting
outputs.

### Two kinds of number, and never mixing them

The owner wants a monthly overview the accountant and the CEO can read without opening FlowAccount.
That is reasonable and it is also the easiest way to end up with two systems quietly disagreeing,
which rule 10 exists to prevent. The split that avoids it:

**Operational figures, computed from our own records.** What we quoted, what was accepted, what is
outstanding against a job, how long acceptance takes, which types of work convert. These describe our
own activity, we are the source, and nothing else holds them.

**Accounting figures, fetched from FlowAccount and displayed with the time they were fetched.**
Revenue recognised, tax, anything that could be adjusted by a credit note, a write-off or a
correction the accountant makes in FlowAccount. We must never recompute these from our invoice rows:
the moment the accountant adjusts something there, our arithmetic is wrong and confidently so.

Label them differently on the page. A number we computed and a number FlowAccount gave us are
different kinds of claim, and a dashboard that blurs them is worse than no dashboard, because it will
be believed.

**Check FlowAccount's own dashboard before building ours.** If it already answers the monthly
question well, the useful thing here is a link and a few operational numbers it cannot know, not a
reimplementation.

---

## 5. Accounting provider integration

A provider interface with exactly one implementation active per organization.

```ts
type AccountingProvider = {
  createCustomer(input): Promise<ExternalRef>;
  createInvoice(input): Promise<ExternalRef>;
  updateInvoice(ref, input): Promise<void>;
  recordPayment(ref, payment): Promise<void>;
  syncInvoice(ref): Promise<InvoiceStatus>;
  getInvoiceStatus(ref): Promise<InvoiceStatus>;
};
```

Providers: `None` (default) and **`FlowAccount`**. Others only if the firm ever changes accountant.

**CONFIRMED: the FlowAccount API works on any package**, so no plan upgrade is needed to integrate.
At roughly 300 baht a month per company this is the cheapest correctness in the system: their job is
being right about Thai tax, and ours is not.

**Open (see `DECISIONS.md` O-list):** whether one subscription covers all three companies or each
needs its own, and whether one API credential spans them. That determines whether credentials are
stored per `BillingEntity` or once for the workspace. Ask FlowAccount support before building the
connector.

Three rules:

1. **`None` is fully supported.** Quoting, invoicing and taking payment must work with no accounting
   connection. Most small businesses will never connect one.
2. **The provider is the system of record for accounting.** We store an external reference and a
   cached status. We never reconstruct their ledger.
3. **Sync is one-way by default**, ours to theirs, with status read back. Two-way sync is a
   conflict-resolution problem nobody needs at MVP.

Build the interface when the second provider is real, not before. Until then, a FlowAccount module
behind a thin seam is enough. Rule §28.7 of the brief: abstractions for channels, payments and
accounting are justified; abstractions for CRUD are not.

---

## 6. References

Subject to licensing. See [`REFERENCES.md`](./REFERENCES.md).

**Midday** (AGPL-3.0, commercial licence on request) is the strongest reference for invoice UX,
transaction lists and financial dashboards. AGPL means **do not copy code into our proprietary
app.** Read it, learn the interaction patterns, write our own. Architectural ideas are not
copyrightable; source is.

**Invio** (Unlicense) is public-domain-equivalent, so code reuse carries no obligation. It is small
and simple: useful for the "create invoice, share link, get paid" flow, which is close to our
payment-request page. Verify the Unlicense declaration in the repository before copying anything.

**Paymenter** (MIT) is PHP/Laravel, so it is a reference for billing and subscription concepts, not
a source of code for us.

Twenty's own `document-generator` example app is the most directly reusable thing available: it does
templated documents with placeholders, a public printable HTML page and PDFs saved to the record,
with no external service. It is MIT (under `packages/twenty-apps`). **Read it before designing
quotation or invoice output.**

---

## 7. Client history and accountability

A first-class requirement, not a reporting afterthought: **for any client, see what happened, when,
and who did it.**

Twenty answers this natively, and we should use it rather than building an activity log.

**VERIFIED mechanisms:**

- Standard objects carry `createdBy` and `updatedBy` as `ACTOR` fields — who performed the action,
  recorded automatically.
- `TimelineActivity` is a standard object rendering a record's history, with a Timeline tab already
  present on Person, Company and Opportunity record pages.
- Apps declare their own events with `defineTimelineActivityType`, emitting on `created`, `updated`,
  `deleted`, `restored`, `linked` or `unlinked`.
- **`emit.through` fans an event out to a related record.** A quotation created against a Person
  appears on that Person's timeline, without us writing any fan-out code.

**PROPOSED application:**

| Event | Emits on | Fans out to |
| --- | --- | --- |
| Quotation sent | `quotation.updated` | Person, Company, Opportunity |
| Quotation accepted / declined | `quotation.updated` | Person, Company, Opportunity |
| Invoice issued | `invoice.created` | Person, Company |
| Payment received | `payment.created` | Person, Company, Invoice |
| Conversation opened | `conversation.created` | Person |

The result is one chronological view per client spanning conversations, quotations, invoices and
payments, each stamped with the staff member responsible. Assignment (`Conversation.assignee`,
`Opportunity.owner`) answers "who owns this now"; the timeline answers "who did what, when".

Declare a timeline activity type for every state change worth answering a question about later. They
are cheap and cannot be backfilled.

## 8. Open questions

1. **Where does quotation editing live?** Line items are child records, and Twenty's native record
   UI is a poor line-item editor. A custom front component is expensive given the sandbox
   constraints. This is the biggest unknown in the sales module.
2. **How much does FlowAccount's API actually cover**, and what is its rate limit? Decides how much
   we cache versus fetch live.
3. **PDF generation approach.** Follow `document-generator`, or bring a renderer into a logic
   function? Note the 250MB unpacked dependency cap on the function runtime layer.
4. **Numbering scheme.** Per-organization, per-year, per-document-type? Thai accounting practice
   should decide this, not us.
5. **Tax handling.** Thai VAT is 7%, withholding tax varies by service type. How much do we model
   before it becomes accounting?
