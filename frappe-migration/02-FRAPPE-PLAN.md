# Rebuild plan for Frappe

Companion to `00-BRIEF.md` and `01-DATA-MODEL.md`. `schema.json` is the machine-readable version of the data model.

One custom app on the bare Frappe framework. Nothing else installed. `00-BRIEF.md` records why ERPNext was rejected and what would reverse that.

## App shape

```
apps/<firm_app>/<firm_app>/
  crm/doctype/         organization, matter, practice_area, billing_entity, booking,
                       matter_deadline, required_document
  work/doctype/        work_log
  billing/doctype/     service, quotation, quotation_line, invoice, invoice_line, payment
  inbox/doctype/       channel_account, contact_identity, conversation, inbox_message
  inbox/webhooks/      line.py, meta.py
  print_format/        quotation, invoice
  public/frontend/     frappe-ui SPA
```

Contacts sit on Frappe's stock `Contact` doctype with the Thai name fields added. Organizations are a plain custom doctype, not `Customer`, since nothing here needs a party ledger.

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

Desk covers everything. Two screens do not deserve it.

**Work log entry, build this first.** Everyone in the firm touches it every day, and the system succeeds or fails on whether logging 20 minutes takes ten seconds. A generated Desk form with eight fields and four Link lookups is not that. Build a single frappe-ui screen: pick a matter, type one line, set minutes, billable on or off, save, repeat. Recent matters cached client side, keyboard driven, no page reload between entries. A week view of your own logs for correcting yesterday.

**The inbox, build this second.** Decide first whether to extend **Frappe Helpdesk** or build the four doctypes in `01-DATA-MODEL.md`. Helpdesk gives an agent inbox with threading, assignment and statuses, already on frappe-ui. It is email-first, so LINE is a custom webhook and a custom channel either way. The real question is whether Helpdesk's ticket model fits a LINE conversation, which is a running thread with no resolution state, closer to a chat than a ticket. If it does not fit without fighting it, build the four doctypes, which are small and already specified.

LINE specifics that hold either way:
- One `channelAccount` per LINE Official Account, keyed by the LINE destination id.
- Inbound events resolve `contactIdentity` by LINE user id, then to a Contact. Unknown handles create a `contactIdentity` with no contact attached, for someone to merge later.
- Deduplicate on the provider message id. LINE redelivers.

Everything else stays in Desk until someone complains about a specific screen.

## Build order

The focus is the work log and the client record, so build in that order, not in dependency-elegance order.

1. **Reference data.** Billing Entity, Practice Area. Small, and everything hangs off them.
2. **Contact and Organization**, with the Thai name fields.
3. **Matter**, with Matter Deadline and Required Document.
4. **Work Log** in Desk, wired to matter, client, booking, staff and practice area. Get the model right here before making it pretty.
5. **Booking**, and the work-log-from-booking path.
6. **The frappe-ui work log screen.** By this point you know the model holds.
7. **Billing.** Service, Quotation with its line table, per-entity numbering, print format with a Thai font proven first. Then Invoice, Payment, and the status derivation. FlowAccount reference fields are plain Data plus a URL, no integration.
8. **The inbox.**

Steps 1 to 5 and 7 are usable in Desk with no frontend work at all.
