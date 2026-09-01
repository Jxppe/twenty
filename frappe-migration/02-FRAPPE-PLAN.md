# Rebuild plan for Frappe

Companion to `00-BRIEF.md` and `01-DATA-MODEL.md`. `schema.json` is the machine-readable version of the data model.

## App shape

One custom app. Nothing installed alongside it except the Frappe framework.

```
apps/<firm_app>/
  <firm_app>/
    crm/doctype/         matter, practice_area, billing_entity, booking, matter_deadline, required_document, work_log
    billing/doctype/     quotation, quotation_line_item, invoice, invoice_line_item, payment, service
    inbox/doctype/       channel_account, contact_identity, conversation, inbox_message
    inbox/webhooks/      line.py, meta.py
    print_format/
    public/frontend/     frappe-ui SPA, inbox first
```

Contacts stay on Frappe's stock `Contact` doctype, organizations on `Customer` if a party concept is needed, or a plain custom `Organization` doctype if not. Do not pull ERPNext in for `Customer`.

## Type mapping

| Twenty type | Frappe fieldtype | note |
|---|---|---|
| TEXT | Data, or Small Text / Text for long values | |
| RICH_TEXT | Text Editor | |
| NUMBER | Int or Float | `workLog.minutes` is Int, `taxRate` is Float (percent) |
| BOOLEAN | Check | |
| DATE_TIME | Datetime | |
| DATE | Date | |
| SELECT | Select | one option per line, store the uppercase value, label in the translation file |
| CURRENCY | Currency | set `options` to a fixed THB, or a currency field. Frappe stores decimal, not micros. Convert on import if any data ever moves |
| FILES | Attach, or a child table of File links where more than one is needed | `quotation.pdf` allows 5, `requiredDocument.file` allows 10 |
| RELATION MANY_TO_ONE | Link | |
| RELATION ONE_TO_MANY | reverse Link, shown as a dashboard connection, or a Table where the child has no life of its own | |
| FULL_NAME | two Data fields, plus a `full_name` set in `before_save` | |
| EMAILS / PHONES / LINKS | Data with the matching Frappe options (Email, Phone, URL) | Twenty's multi-value composites are unused here, all are capped at 1 |
| ADDRESS | Frappe's stock Address doctype, linked | |
| ACTOR | Frappe's `owner` / `modified_by` | drop the field |

Line items are the one place to diverge deliberately. `quotationLineItem` and `invoiceLineItem` should become **child tables** (`istable: 1`) on their parents rather than standalone doctypes. They have no independent existence, they cascade on delete in Twenty already, and child tables give you the grid editor for free.

## Numbering

Quotation and Invoice need a naming series per billing entity, gap-free. Frappe's `naming_series` is per doctype, not per link field, so this needs an `autoname` controller method that reads the billing entity's own prefix and counter. Take the counter inside a row lock on the Billing Entity document so concurrent submits cannot collide. Do not use `hash` or `format:` naming and then renumber later.

## Server-side logic that Twenty had nowhere to put

All of it belongs in doctype controllers:

- `QuotationLineItem.lineTotal` = quantity x unitPrice - discount. Recompute in the parent's `validate`.
- Quotation and Invoice `subtotal`, `tax`, `total` from the lines. `tax` sums per line at that line's `taxRate`, not one rate on the header.
- `Invoice.amountPaid` = sum of confirmed payments. Recompute in Payment's `on_update` and `on_trash`.
- `Invoice.status` derives from `amountPaid` against `total` and `dueDate`. Only DRAFT, VOID and the manual transitions are set by hand.
- Accepting a quotation stamps `decidedAt` and creates the invoice by **copying** the lines, not linking them.
- `Conversation.lastMessageAt`, `lastMessagePreview` and `unreadCount` update when an InboxMessage is inserted.
- Provider ids (`externalId` on conversation and message) get a unique index so redelivered webhooks are idempotent.

## Build order

1. Billing Entity, Practice Area, Service. Static reference data, gets numbering and tax rates in place first.
2. Contact and Organization, with the Thai name fields.
3. Matter, with Deadline and Required Document as children of it in the UI sense.
4. Quotation with its line child table, print format, and the per-entity numbering.
5. Invoice, Payment, and the status derivation. FlowAccount reference fields are plain Data plus a URL, no integration.
6. Booking and Work Log.
7. The inbox: doctypes, then the LINE webhook, then the frappe-ui screen. This is the only part that needs a custom frontend, and it is the part that justified leaving Twenty.

Steps 1 to 6 are usable in Desk with no frontend work at all. Do not start on frappe-ui until 1 to 6 are in.

## Print formats

Quotation and Invoice both print, in Thai and English, under the correct billing entity's registered name and tax ID. Set the Thai font up in step 4 and check a real Thai string renders in a generated PDF before building anything else on top. See the font note at the end of `00-BRIEF.md`.
