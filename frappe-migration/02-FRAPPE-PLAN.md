# Rebuild plan for Frappe

Companion to `00-BRIEF.md` and `01-DATA-MODEL.md`. `schema.json` is the machine-readable version of the data model.

This plan assumes ERPNext as the base. Read the FlowAccount section of `00-BRIEF.md` first and settle that question, because the billing half of this plan changes if the answer comes back the other way. The fallback is at the end.

## Site layout

One site, three apps.

```
frappe               framework
erpnext              parties, billing, projects, timesheets
erpnext_thailand     Thai tax invoice, withholding tax, PND reports
<firm_app>           everything below
```

Plus Frappe Helpdesk if the inbox evaluation goes that way.

```
apps/<firm_app>/<firm_app>/
  matters/doctype/     practice_area, matter_deadline, required_document, booking
  inbox/doctype/       channel_account, contact_identity, conversation, inbox_message
  inbox/webhooks/      line.py, meta.py
  overrides/           customisations to ERPNext doctypes, via fixtures not forks
  print_format/
  public/frontend/     frappe-ui SPA, inbox only
```

Customise ERPNext doctypes with Custom Fields and Property Setters shipped as fixtures. Never edit ERPNext's own doctype JSON, it will be overwritten on update.

## What maps onto ERPNext

| Twenty object | ERPNext | notes |
|---|---|---|
| `billingEntity` | **Company** | one per legal entity. `legalName` is the Company name, `taxId` is `tax_id`. Registered address goes on the Company address, `erpnext_thailand` requires it for tax invoices |
| `person` | **Contact**, plus **Customer** where they are a paying party | keep `nameTh` as a Custom Field on both |
| `company` (client orgs) | **Customer** | `nameTh` as a Custom Field |
| `opportunity` (the matter) | **Project** | add Custom Fields for `practiceArea`, `openedAt`, `closedAt`, `billingEntity`. Project already has customer, status and dates |
| `product` (service) | **Item** with `is_stock_item = 0` | `unitPrice` is Item Price, `taxRate` is an Item Tax Template, `isActive` is `disabled`. Do not delete retired items |
| `quotation` | **Quotation** | posts no accounting entries, safe regardless of the ledger decision |
| `quotationLineItem` | Quotation Item | child table, already exists |
| `invoice` | **Sales Invoice** | keep `externalReference` / `externalUrl` as Custom Fields until FlowAccount is actually switched off, then drop them |
| `invoiceLineItem` | Sales Invoice Item | child table, already exists |
| `payment` | **Payment Entry** | `method` maps to Mode of Payment. PROMPTPAY needs adding |
| `workLog` | **Timesheet** detail | `minutes` becomes hours, `isBillable` is `is_billable`, `staff` is the employee, `matter` is the project. Keep `status` and `practiceArea` as Custom Fields |
| `booking` | custom, see below | ERPNext has an Appointment doctype but it is tied to the lead and website booking flow. Not worth the fight |
| `practiceArea` | custom | small, and it drives the default billing entity |
| `matterDeadline` | custom | linked to Project |
| `requiredDocument` | custom | linked to Project |
| `conversation`, `inboxMessage`, `contactIdentity`, `channelAccount` | custom, or Helpdesk | see the inbox section |
| `note`, `task` | Frappe **ToDo** and **Comment**, or ERPNext Task under the Project | do not rebuild these |

The evaluation to run per row: does ERPNext's version carry behaviour worth inheriting, or only fields? Company, Item, Sales Invoice, Payment Entry and Timesheet carry a lot of behaviour. Booking and Appointment carry almost none, which is why booking stays custom.

## Type mapping for the custom doctypes

| Twenty type | Frappe fieldtype | note |
|---|---|---|
| TEXT | Data, or Small Text / Text for long values | |
| RICH_TEXT | Text Editor | |
| NUMBER | Int or Float | `workLog.minutes` is Int, `taxRate` is Float (percent) |
| BOOLEAN | Check | |
| DATE_TIME | Datetime | |
| DATE | Date | |
| SELECT | Select | one option per line, store the uppercase value, label in the translation file |
| CURRENCY | Currency | Frappe stores decimal, not micros. There is no data to convert, so just use decimal |
| FILES | Attach, or a child table of File links where more than one is needed | `requiredDocument.file` allows 10 |
| RELATION MANY_TO_ONE | Link | |
| RELATION ONE_TO_MANY | reverse Link shown as a dashboard connection, or a Table where the child has no life of its own | |
| FULL_NAME | two Data fields plus a `full_name` set in `before_save` | |
| EMAILS / PHONES / LINKS | Data with the matching Frappe options (Email, Phone, URL) | all are capped at 1 in the current model |
| ADDRESS | Frappe's stock Address doctype, linked | |
| ACTOR | Frappe's `owner` / `modified_by` | drop the field |

## Numbering

ERPNext handles per-company series with naming series prefixes selectable on the form, and `naming_series` is per doctype rather than per link field. For gap-free sequences per billing entity, set one series option per company on Quotation and Sales Invoice, and confirm the counter behaviour under a cancelled document before trusting it: cancelling in ERPNext does not renumber, but amending creates a `-1` suffix, which is a gap by some readings and not by others. Check what "gap-free" means to the accountant before building around it.

## Server-side logic

Most of what needed writing on Twenty is now ERPNext's job. Line totals, subtotals, per-line tax, invoice status against payments, and outstanding amounts all come free with Sales Invoice and Payment Entry. Do not reimplement them.

What still belongs in custom controllers:

- Accepting a quotation creates the Sales Invoice by **copying** the lines. ERPNext's own "create invoice from quotation" does this already, confirm it copies rather than links before writing anything.
- `Conversation.lastMessageAt`, `lastMessagePreview` and `unreadCount` update when an InboxMessage is inserted.
- Provider ids (`externalId` on conversation and message) get a unique index so redelivered webhooks are idempotent.
- A matter's default billing entity comes from its practice area unless overridden.

## The inbox

The one part that is genuinely new work, and the reason the frontend exists at all.

Decide first: extend **Frappe Helpdesk**, or build the four doctypes in `01-DATA-MODEL.md`. Helpdesk gives an agent inbox with threading, assignment and statuses, already on frappe-ui. It is email-first, so LINE is a custom webhook and a custom channel in either case. The question is whether Helpdesk's ticket model fits a LINE conversation, which is a running thread with no resolution state, closer to a chat than a ticket. If it does not fit without fighting it, build the four doctypes, which are small and already specified.

LINE webhook specifics that carry over regardless:

- One `channelAccount` per LINE Official Account, keyed by the LINE destination id.
- Inbound events resolve `contactIdentity` by LINE user id, then to a Contact. Unknown handles create a `contactIdentity` with no contact attached, for someone to merge later.
- Deduplicate on the provider message id. LINE redelivers.

## Build order

1. ERPNext plus `erpnext_thailand` on a scratch site. Three Companies, the Thai tax invoice print format, a Thai font in the PDF renderer. Generate a real Thai tax invoice and a withholding tax certificate and put them in front of the accountant. This is the FlowAccount decision, and everything else waits on it.
2. Items for the service catalogue, with Item Tax Templates and Item Prices.
3. Contacts and Customers, with the Thai name Custom Fields.
4. Project as matter, with Practice Area, Matter Deadline and Required Document in the custom app.
5. Quotation to Sales Invoice to Payment Entry, end to end, under two different companies, to prove the numbering.
6. Timesheet for work logs, Booking as a custom doctype.
7. The inbox.

Steps 1 to 6 are usable in Desk with no frontend work. Do not start on frappe-ui until 1 to 6 are in.

## Fallback, if FlowAccount stays

If the e-tax filing gap kills it, do not install ERPNext. The accounting doctypes are the only reason to carry it, and without them you are inheriting a chart of accounts and a fiscal year to use Project and Timesheet.

In that case build everything in one custom app on the bare framework, exactly as `01-DATA-MODEL.md` describes it: Quotation, Invoice, Payment and Service as custom doctypes, line items as child tables (`istable: 1`), and per-entity numbering via an `autoname` controller that takes a row lock on the Billing Entity to read its counter. The controller logic listed as "now ERPNext's job" above comes back, and belongs in `validate` on the parent documents.
