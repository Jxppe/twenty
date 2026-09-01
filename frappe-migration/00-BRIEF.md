# Brief for the Frappe rebuild

Hand this file, `01-DATA-MODEL.md`, `02-FRAPPE-PLAN.md` and `schema.json` to the chat working in the Frappe repo. It is everything that was decided while the system was being built on Twenty.

## What the system is

Back office for a small Thai law / visa services firm. It handles:

- Clients, as individuals and as companies, with names in both English and Thai
- Jobs (called "matters" in the code, mapped onto Twenty's `opportunity` object), each with a type of work, an owner, deadlines and a list of documents the client still owes us
- Quotations, then invoices raised from them, then payments against those invoices
- Three separate legal entities of the firm, each billing under its own name and tax ID
- Appointments and consultations
- Staff work logs, in minutes, marked billable or not
- An inbound message inbox across LINE, Facebook, Instagram, WhatsApp, email and web chat, with each customer handle resolving back to one CRM contact

Currency is THB everywhere. Money is stored as integer micros (value x 1,000,000) plus a currency code, which is a Twenty storage detail and should not carry over.

## Rules that came out of building it, and still hold

- **Document numbering is per billing entity and gap-free.** Each of the three entities has its own quotation and invoice sequence.
- **An invoice copies from a quotation, it does not stay linked to it.** Editing a quotation after the fact must not move an invoice. The `quotation` link on an invoice is provenance only.
- **Retired services must keep resolving.** `product.isActive` is a flag, never a delete, because old quotations and invoices reference the line.
- **Tax is per line.** `taxRate` sits on the service and is copied to each quotation and invoice line. Twenty has no tax concept at all, which is one of the reasons for moving.
- **Messaging handles are separate from contacts.** One person can hold a LINE user id, an Instagram handle and a phone number. `contactIdentity` models the handle, `person` models the human, and inbound webhooks resolve one to the other. Provider message and thread ids are stored so redelivered webhooks deduplicate.

## The open decision: FlowAccount

On Twenty, FlowAccount was the accounting system of record. The CRM kept no ledger, and invoices and payments carry `externalReference` and `externalUrl` pointing at the FlowAccount document. That was a workaround for Twenty having no accounting model at all, not a preference.

**That is now open.** The firm is willing to drop FlowAccount if ERPNext plus the Thai localization app can do the job. Settle it before writing any billing doctype, because it decides whether Invoice is a custom doctype or an ERPNext Sales Invoice.

The test to run first, in this order:

1. Install ERPNext and [`ecosoft-frappe/erpnext_thailand`](https://github.com/ecosoft-frappe/erpnext_thailand) on a scratch site. It is free, actively developed, and covers Thai tax invoices, VAT on services recognised at payment, withholding tax with certificate generation, PND reports for Revenue Department submission, Thai amount-to-words and Thai date formatting.
2. **Find out whether the firm files e-Tax Invoice / e-Receipt electronically with the Revenue Department.** This is the one thing FlowAccount does that `erpnext_thailand` does not appear to do. It generates printable PND reports for RD submission, but there is no evidence of automated e-tax transmission. If the firm files electronically today, that gap is the whole decision.
3. Show the accountant a generated Thai tax invoice and a withholding tax certificate from the scratch site. If they accept both, FlowAccount goes.

If FlowAccount stays after all, fall back to the plan in the last section of `02-FRAPPE-PLAN.md`.

## Data to migrate

None. The Twenty workspace holds 6 demo contacts and matching seed records. This is a rebuild from a spec, not a data migration. Do not spend effort on an export path.

## Why we are leaving Twenty

- No tax, no line-level pricing model, no document numbering. Quotations and invoices were modelled by hand as custom objects, and every total has to be computed by application code that Twenty gives you no natural place to put.
- No print or PDF generation. Quotation and invoice PDFs are uploaded as file attachments, produced elsewhere.
- The custom messaging inbox has no UI. The objects exist, but rendering a usable inbox means writing React inside a fork of Twenty and maintaining that fork forever.
- Its extension model is metadata plus workflows. There is no server-side hook where "recalculate the invoice total when a line changes" naturally lives.

Frappe gives all four out of the box: controller hooks, naming series, print formats, and a Desk UI generated from the schema.

## Platform decision

**ERPNext as the base, plus one custom app for what ERPNext does not model.** Frappe apps install side by side on one site, so this is not a choice between "use existing apps" and "build our own". It is a question of which half is which.

ERPNext already covers, properly and with Thai localization available:

- Multi-company, which is exactly the three billing entities, with per-company accounts, addresses and tax IDs. This is unpleasant to write yourself and easy to get subtly wrong.
- Quotation, Sales Invoice, Payment Entry, with tax templates applied per line.
- Service items (`is_stock_item = 0`), so nothing drags in stock or delivery.
- Timesheet with billable hours flowing into an invoice, which is the professional services flow it was designed around.
- Project and Task, which are a defensible model for a matter.

The custom app carries what ERPNext has no answer for: practice areas, matter deadlines, required documents, bookings, and the omnichannel inbox.

**Read Frappe Helpdesk before building the inbox.** It is an agent inbox with threading, assignment and statuses, already built on frappe-ui, and the inbox is the single screen that justified leaving Twenty. It is email-first, so LINE remains a custom webhook and a custom channel either way, but inheriting the inbox UI is worth more than the `conversation` and `inbox_message` doctypes are worth writing.

**Do not fork Frappe CRM.** Its frontend is hand-written lead and deal pages rather than anything schema-driven, so a Matter or an Invoice costs the same work there as anywhere. Read it as the reference implementation of frappe-ui, do not build on it.

## Thai and English

The pattern in use, which carries over unchanged:

- **UI in English, content in Thai.** This works and is what the firm already does. Twenty ships no Thai locale, so the interface was always going to be English. Frappe ships a `th` translation if the interface is ever wanted in Thai, and `erpnext_thailand` adds Thai date formatting and Thai amount-to-words for documents.
- **Names get parallel fields, not translation.** `person.nameTh` and `company.nameTh` hold the Thai spelling next to the Latin one, because both appear on real documents and neither is derivable from the other. `billingEntity.legalName` is the registered name exactly as it must print on an invoice.
- **Free text is just Thai.** Notes, message bodies, work log descriptions and line descriptions are plain UTF-8 and take Thai with no special handling.

Two real gotchas:

1. **Full-text search does not segment Thai.** Thai is written without spaces, so a whole phrase becomes one token. Twenty works around this with an ILIKE fallback when the tsvector query returns nothing. Frappe's search has the same weakness. Plan on substring matching for Thai content, or a proper segmenter, and do not assume the built-in search will find a Thai word in the middle of a sentence.
2. **PDF output needs a Thai font.** Print formats must ship a font with Thai glyphs, Sarabun or Noto Sans Thai, and the PDF renderer has to be configured to use it. Thai text silently renders as boxes otherwise. This is the single most likely thing to be discovered late, so prove it in step 3 of the FlowAccount test above, before anything else is built.
