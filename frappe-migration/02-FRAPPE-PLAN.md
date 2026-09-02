# Rebuild plan for Frappe

Companion to `00-BRIEF.md` and `01-DATA-MODEL.md`. `schema.json` is the machine-readable version of the data model.

One custom app on the bare Frappe framework. Nothing else installed. `00-BRIEF.md` records why ERPNext was rejected and what would reverse that.

## Bootstrap

**Nothing is forked.** A Frappe custom app is not a fork. `bench new-app` generates an empty scaffold that is your repo from commit one, with no upstream history to carry and no merges to take.

Do not clone Frappe CRM to build on. Clone it separately, in a folder you never build in, if you want to read its frappe-ui code as a reference.

Dev environment via [`frappe/frappe_docker`](https://github.com/frappe/frappe_docker):

```bash
git clone https://github.com/frappe/frappe_docker
cd frappe_docker
cp -R devcontainer-example .devcontainer
# open in VSCode, "Reopen in Container"
```

Inside the container:

```bash
bench init --frappe-branch version-16 frappe-bench
cd frappe-bench
bench new-site tll.localhost
bench new-app tll_crm
bench --site tll.localhost install-app tll_crm
bench start
```

`version-16` is current stable and `version-15` is still maintained. Nothing here constrains the choice, since ERPNext is not installed.

**The app is `tll_crm`, with an underscore.** Frappe app names must be valid Python module names, and the directory under `apps/` has to match. Name the GitHub repo `tll_crm` too so the two never drift.

`frappe/frappe` and `frappe/bench` are dependencies that bench manages. The entire codebase lives in `apps/tll_crm/`. Everything else in the bench folder is machinery that can be thrown away and recreated.

## App shape

```
apps/tll_crm/tll_crm/
  crm/doctype/         client, matter, practice_area, billing_entity, booking,
                       matter_deadline, required_document
  work/doctype/        work_log, timeline_entry
  billing/doctype/     service, quotation, quotation_line, invoice, invoice_line, payment
  inbox/doctype/       channel_account, contact_identity, conversation, inbox_message
  inbox/webhooks/      line.py, meta.py
  print_format/        quotation, invoice
  public/frontend/     frappe-ui SPA
```

See the client model below before writing any of it. It is the one place this deliberately diverges from the Twenty model.

## The client model

Get this right first. Everything links to it.

**Twenty's shape is an artifact, do not copy it.** Twenty has `person` and `company` as separate built-in objects, which is why `quotation` and `invoice` in `01-DATA-MODEL.md` each carry *both* a `person` link and a `company` link. Every query and every report then has to coalesce two nullable fields, and nothing prevents a record having both set or neither. Frappe does not force that, so collapse it.

**`Client`, one doctype, the party.** A `client_type` Select of `INDIVIDUAL` or `ORGANIZATION` drives which fields show.

| field | applies to | note |
|---|---|---|
| `client_type` | both | INDIVIDUAL or ORGANIZATION |
| `client_name_en`, `client_name_th` | both | both print on documents, neither is derivable from the other |
| `legal_name_en`, `legal_name_th` | organization | registered name exactly as it must appear on an invoice |
| `tax_id` | organization | Thai taxpayer identification number |
| `id_number`, `nationality` | individual | passport or Thai ID. A visa practice cannot work without these |
| `default_billing_entity` | both | overridable per matter |
| address | both | Frappe's stock Address doctype, linked |

Matter, Work Log, Booking, Quotation and Invoice each get **one** `client` Link field, not two.

**On Work Log, Booking and Conversation the `client` link is required and the `matter` link is optional.** Work arrives before a matter exists, and an entry with no client is invisible on the client page, which is the whole point of the system.

**Frappe's stock `Contact` for the humans**, with a plain Link field to Client and `contact_name_th` added as a Custom Field.

- An organization client has several contacts. An individual client has exactly one, created alongside them in the same form.
- You inherit Contact's email and phone child tables, and Frappe's communication features already expect Contact.
- **`contact_identity` links to Contact, not to Client.** A LINE handle belongs to a person, not to a company. Routing it through Contact is what lets the inbox resolve a handle to a human and the human to a client without a Dynamic Link. Do not use Dynamic Links here.

The cost is one extra record per individual client. Accept it. It is the same shape ERPNext uses for Customer plus Contact, so it is well-trodden in Frappe, and it is what makes the inbox tractable later.

Do not use Frappe's `Customer` doctype. It belongs to ERPNext and drags a party ledger with it.

## The client timeline

The feature the system is judged on, and the one place where a naive implementation will not hold up.

Entries come from doctypes with different date fields: work log uses the day worked, booking uses its start time, inbox message uses sent time, invoice uses issue date. Querying six doctypes per client page and merging in Python is fine at 6 clients and miserable at 600.

**`Timeline Entry`, append-only, written by controller hooks and never by hand.**

| field | note |
|---|---|
| `client` | Link, required, indexed |
| `matter` | Link, optional, indexed |
| `occurred_at` | Datetime, the business time rather than creation time, indexed |
| `entry_type` | Select: WORK_LOG, BOOKING, MESSAGE, NOTE, DOCUMENT_RECEIVED, QUOTATION_SENT, INVOICE_ISSUED, PAYMENT_RECEIVED, DEADLINE_SET, DEADLINE_MET |
| `summary` | Data, one prerendered line |
| `source_doctype`, `source_name` | the real record, for click-through |
| `staff` | Link, who did it |

Index on `(client, occurred_at desc)`. The client page is one query. The matter page is the same query with a matter filter. "What happened this week" is the same query again.

**It is a projection, not truth.** Every entry is derivable from its source record, so a rebuild patch can regenerate the table wholesale if it drifts. Never put anything in it that does not exist somewhere else. Write entries from one shared helper called by each source doctype's `after_insert` and `on_update`, so the summary formatting lives in one place.

Frappe's built-in per-document timeline of comments, emails and field changes still works and is not replaced. Timeline Entry is specifically the cross-doctype roll-up onto the client.

## Type mapping

| Twenty type | Frappe fieldtype | note |
|---|---|---|
| TEXT | Data, or Small Text / Text for long values | |
| RICH_TEXT | Text Editor | |
| NUMBER | Int or Float | `workLog.minutes` is Int, `taxRate` is Float (percent) |
| BOOLEAN | Check | |
| DATE_TIME | Datetime | |
| DATE | Date | `workLog.workedOn` is a Date deliberately, it is the day the work happened |
| SELECT | Select | one option per line, store the uppercase value, label in the translation file |
| CURRENCY | Currency | decimal, not micros. There is no data to convert |
| FILES | Attach, or a child table of File links where more than one is needed | `quotation.pdf` allows 5, `requiredDocument.file` allows 10 |
| RELATION MANY_TO_ONE | Link | |
| RELATION ONE_TO_MANY | reverse Link shown as a dashboard connection, or a Table where the child has no life of its own | |
| FULL_NAME | two Data fields plus a `full_name` set in `before_save` | |
| EMAILS / PHONES / LINKS | Data with the matching Frappe options (Email, Phone, URL) | all capped at 1 in the current model |
| ADDRESS | Frappe's stock Address doctype, linked | |
| ACTOR | Frappe's `owner` / `modified_by` | drop the field |

Line items are the one deliberate divergence. `quotationLineItem` and `invoiceLineItem` become **child tables** (`istable: 1`) on their parents rather than standalone doctypes. They have no independent existence, they already cascade on delete in Twenty, and child tables give you the grid editor for free.

Notes and tasks are Frappe's stock `Comment` and `ToDo`. Do not rebuild them.

## Server-side logic

All of it in doctype controllers, which is the thing Twenty had nowhere to put.

Work log:
- `minutes` is the stored unit. Any hours figure anywhere is a display conversion, never a column.
- A work log with a `booking` inherits that booking's matter and client unless explicitly set.
- Default `billingEntity` comes from the matter, and the matter's comes from its practice area.

Billing:
- `QuotationLine.lineTotal` = quantity x unitPrice - discount. Recompute in the parent's `validate`.
- Quotation and Invoice `subtotal`, `tax`, `total` from the lines. `tax` sums per line at that line's own `taxRate`, not one rate on the header.
- `Invoice.amountPaid` = sum of confirmed payments. Recompute in Payment's `on_update` and `on_trash`.
- `Invoice.status` derives from `amountPaid` against `total` and `dueDate`. Only DRAFT, VOID and manual transitions are set by hand.
- Accepting a quotation stamps `decidedAt` and creates the invoice by **copying** the lines, not linking them.

Inbox:
- `Conversation.lastMessageAt`, `lastMessagePreview` and `unreadCount` update when an InboxMessage is inserted.
- Unique index on `externalId` for both conversation and message, so redelivered webhooks are idempotent.

## Numbering

Quotation and Invoice need a sequence per billing entity, with no holes. Frappe's `naming_series` is per doctype, not per link field, so this needs an `autoname` controller method that reads the billing entity's own prefix and counter, taking a row lock on the Billing Entity document so concurrent submits cannot collide.

Never delete a numbered document. Cancel it, keep the number, mark it VOID. That is what gap-free means.

Do not use `hash` or `format:` naming with a plan to renumber later.

## The frontend

Desk covers everything and nothing here needs a frontend to be usable. Three screens are worth building anyway, in this order, all after the data model is settled.

**The client page, the flagship.** This is what the system is for. One screen showing identity and contact details, the contact people, every matter for this client with its status, and the merged timeline from `Timeline Entry`, filterable by type and by matter. Open items surfaced without hunting: outstanding deadlines, documents still owed, unpaid invoices. Everything on it is one indexed query plus the matters list.

**Fast work log entry, second.** Everyone touches it every day and the system succeeds or fails on whether logging 20 minutes takes ten seconds. A Desk form with eight fields and four Link lookups is not that. It does not need to be its own screen: a panel on the client and matter pages is better, because it puts logging where the context already is. Pick a matter, type one line, set minutes, billable on or off, save, repeat. Recent matters cached client side, keyboard driven, no reload between entries. Plus a week view of your own logs for correcting yesterday.

**The inbox, third.** Decide first whether to extend **Frappe Helpdesk** or build the four doctypes in `01-DATA-MODEL.md`. Helpdesk gives an agent inbox with threading, assignment and statuses, already on frappe-ui. It is email-first, so LINE is a custom webhook and a custom channel either way. The real question is whether Helpdesk's ticket model fits a LINE conversation, which is a running thread with no resolution state, closer to a chat than a ticket. If it does not fit without fighting it, build the four doctypes, which are small and already specified. Either way, inbound messages must write `Timeline Entry` rows so they appear on the client page.

LINE specifics that hold either way:
- One `channel_account` per LINE Official Account, keyed by the LINE destination id.
- Inbound events resolve `contact_identity` by LINE user id, then to a Contact, then to a Client. Unknown handles create a `contact_identity` with no contact attached, for someone to merge later.
- Deduplicate on the provider message id. LINE redelivers.

Everything else stays in Desk until someone complains about a specific screen.

## Build order

The spine is **Client, then Matter, then the things that happen to them**. Build enough of that to fill a timeline, then build the client page, which is the point of the system. Billing and the inbox come last.

1. **Client and Contact.** The centre of the system. Thai name fields, both client types, one contact created alongside each individual client.
2. **Billing Entity and Practice Area.** Small reference data, but Matter needs both.
3. **Matter**, linked to Client, with the practice area driving the default billing entity.
4. **Work Log and Timeline Entry together.** Work log is the first timeline feed, so build the shared write helper here and get its shape right before five more doctypes call it.
5. **Booking, Matter Deadline, Required Document**, each writing timeline entries through the same helper.
6. **The client page** in frappe-ui. By now there is a real timeline to render and a real matter list to show.
7. **Fast work log entry**, as a panel on the client and matter pages.
8. **Billing.** Service, Quotation with its line table, per-entity numbering, print format with a Thai font proven first. Then Invoice, Payment, and the status derivation. All three write timeline entries. FlowAccount reference fields are plain Data plus a URL, no integration.
9. **The inbox.**

Steps 1 to 5 and 8 are usable in Desk with no frontend work at all.

## Naming

The doctype is `Matter` in this plan. It was labelled "Job" in Twenty and you have called it a project. Matter is the standard term in a law firm and reads correctly to anyone the firm hires later, so it is the default here. Decide before step 3, because renaming a doctype after it has links pointing at it is tedious.
