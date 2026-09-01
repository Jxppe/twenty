# Brief for the Frappe rebuild

Hand this file, `01-DATA-MODEL.md` and `schema.json` to the chat working in the Frappe repo. It is everything that was decided while the system was being built on Twenty.

## What the system is

Back office for a small Thai law / visa services firm. It handles:

- Clients, as individuals and as companies, with names in both English and Thai
- Jobs (called "matters" in the code, mapped onto Twenty's `opportunity` object), each with a type of work, an owner, deadlines and a list of documents the client still owes us
- Quotations, then invoices raised from them, then payments against those invoices
- Three separate legal entities of the firm, each billing under its own name and tax ID
- Appointments and consultations
- Staff work logs, in minutes, marked billable or not
- An inbound message inbox across LINE, Facebook, Instagram, WhatsApp, email and web chat, with each customer handle resolving back to one CRM contact

Currency is THB everywhere. Money is stored as integer micros (value x 1,000,000) plus a currency code.

## Constraints that drove the design

- **FlowAccount is the accounting system of record.** The CRM does not keep a ledger. Invoices and payments carry `externalReference` and `externalUrl` pointing at the FlowAccount document. Anything that wants to post journal entries is out of scope and actively unwanted.
- **Document numbering is per billing entity and gap-free.** Each of the three entities has its own quotation and invoice sequence.
- **An invoice copies from a quotation, it does not stay linked to it.** Editing a quotation after the fact must not move an invoice. The `quotation` link on an invoice is provenance only.
- **Retired services must keep resolving.** `product.isActive` is a flag, never a delete, because old quotations and invoices reference the line.
- **Tax is per line.** `taxRate` sits on the product and is copied to each quotation and invoice line. Twenty has no tax concept at all, which is one of the reasons for moving.
- **Messaging handles are separate from contacts.** One person can hold a LINE user id, an Instagram handle and a phone number. `contactIdentity` models the handle, `person` models the human, and inbound webhooks resolve one to the other. Provider message and thread ids are stored so redelivered webhooks deduplicate.

## Data to migrate

None. The Twenty workspace holds 6 demo contacts and matching seed records. This is a rebuild from a spec, not a data migration. Do not spend effort on an export path.

## What Twenty could not do, and why we are leaving

- No tax, no line-level pricing model, no document numbering. Quotations and invoices were modelled by hand as custom objects, and every total has to be computed by application code that Twenty gives you no natural place to put.
- No print or PDF generation. Quotation and invoice PDFs are uploaded as file attachments, produced elsewhere.
- The custom messaging inbox has no UI. The objects exist, but rendering a usable inbox means writing React inside a fork of Twenty and maintaining that fork forever.
- Its extension model is metadata plus workflows. There is no server-side hook where "recalculate the invoice total when a line changes" naturally lives.

Frappe's DocType engine gives all four of those out of the box: server-side controller hooks, naming series, print formats, and a Desk UI generated from the schema.

## Platform decision: custom Frappe app, not ERPNext, not a Frappe CRM fork

**Build a custom app on the Frappe framework.** Use Desk for the back-office CRUD from day one, and frappe-ui for the few screens that have to be pleasant, starting with the message inbox.

Why not ERPNext: it is a full double-entry accounting system, and Sales Invoice posts GL entries on submit. Using it means either running a ledger that duplicates FlowAccount, or spending the whole project suppressing one. Its Quotation and Sales Invoice doctypes are also modelled around stock and delivery, which this firm does not have. What is worth lifting from ERPNext is its patterns, not its app: naming series per company, tax templates, and the Timesheet doctype are all worth reading before writing ours.

Why not fork Frappe CRM: it is a lead and deal pipeline, and its Vue frontend is hand-written pages for leads and deals rather than anything schema-driven. A Matter or an Invoice does not come for free there; you write those pages yourself either way. Read it as the reference implementation of frappe-ui and copy its patterns, do not build on top of it.

If in-house accounting is ever wanted, that decision reverses and ERPNext becomes the right base. It is not wanted today.

## Thai and English

The pattern in use, which should carry over unchanged:

- **UI in English, content in Thai.** This works and is what the firm already does. Twenty ships no Thai locale, so the interface was always going to be English. Frappe does ship a `th` translation if the interface is ever wanted in Thai.
- **Names get parallel fields, not translation.** `person.nameTh` and `company.nameTh` hold the Thai spelling next to the Latin one, because both appear on real documents and neither is derivable from the other. `billingEntity.legalName` is the registered name exactly as it must print on an invoice.
- **Free text is just Thai.** Notes, message bodies, work log descriptions and line descriptions are plain UTF-8 and take Thai with no special handling in either platform.

Two real gotchas to carry into the Frappe build:

1. **Full-text search does not segment Thai.** Thai is written without spaces, so a whole phrase becomes one token. Twenty works around this with an ILIKE fallback when the tsvector query returns nothing. Frappe's search has the same weakness. Plan on substring matching for Thai content, or a proper segmenter, and do not assume the built-in search will find a Thai word in the middle of a sentence.
2. **PDF output needs a Thai font.** Print formats must ship a font with Thai glyphs, Sarabun or Noto Sans Thai, and the PDF renderer has to be configured to use it. Thai text silently renders as boxes otherwise. This is the single most likely thing to be discovered late.
