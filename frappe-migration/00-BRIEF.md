# Brief for the Frappe rebuild

Hand this file, `01-DATA-MODEL.md`, `02-FRAPPE-PLAN.md` and `schema.json` to the chat working in the Frappe repo. It is everything decided while the system was being built on Twenty.

## What this is, and what it is not

**A CRM for a small Thai law / visa services firm, with a work log built into it and some finance attached.** The client record is the centre of the system. Everything else exists to hang off it.

The test the system has to pass: **open a client and see everything.** Who they are and how to reach them, every matter the firm has run for them, and a running timeline of everything that has happened, without hunting through separate lists.

The work log is an extension of that, not a product of its own. It is how the timeline gets populated with what staff actually did, alongside bookings, messages, documents received and documents sent. Quotations, invoices and payments exist because the firm has to send documents to clients, not because anyone wants to run accounting here.

Read that as a ranking. When a design choice trades away the completeness of the client record for convenience somewhere else, do not take it.

## Scope

- Clients, as individuals and as organizations, with names in both English and Thai, and the contact people inside an organization
- A single client timeline merging work logs, bookings, messages, notes, documents received, quotations, invoices and payments into one chronological view
- Jobs (called "matters" in the code, mapped onto Twenty's `opportunity` object), each with a type of work, an owner, deadlines and a list of documents the client still owes us
- **Staff work logs**, in minutes, against a matter or a client, marked billable or not, with a status
- Appointments and consultations, which work logs can come out of
- Three separate legal entities of the firm, each billing under its own name and tax ID
- Quotations, then invoices raised from them, then payments against those invoices
- An inbound message inbox across LINE, Facebook, Instagram, WhatsApp, email and web chat, with each customer handle resolving back to one CRM contact

Currency is THB everywhere. Money is stored in Twenty as integer micros (value x 1,000,000) plus a currency code, which is a Twenty storage detail and should not carry over. Use decimal.

## Out of scope

**Accounting.** FlowAccount is the ledger and stays the ledger. Invoices and payments carry `externalReference` and `externalUrl` pointing at the FlowAccount document, and that is the whole integration. Nothing in this system posts a journal entry, keeps a chart of accounts, or files tax.

This was evaluated properly, not assumed. See the rejected options below.

## Rules that came out of building it, and still hold

- **Document numbering is per billing entity and gap-free.** Each of the three entities has its own quotation and invoice sequence. Gap-free means no missing numbers in the run: a cancelled document keeps its number and is marked cancelled rather than deleted, because a hole in the sequence is what an auditor reads as a hidden sale.
- **An invoice copies from a quotation, it does not stay linked to it.** Editing a quotation after the fact must not move an invoice. The `quotation` link on an invoice is provenance only.
- **Retired services must keep resolving.** `product.isActive` is a flag, never a delete, because old quotations and invoices reference the line.
- **Tax is per line.** `taxRate` sits on the service and is copied to each quotation and invoice line. Twenty has no tax concept at all, which is one of the reasons for moving.
- **Work logs are in minutes, not hours.** Nobody rounds 20 minutes up to half an hour honestly, so do not make them.
- **Everything that happens is attached to a client, even when there is no matter yet.** A work log, a booking or a conversation must carry a client link whether or not a matter exists. This is what guarantees the client timeline is never missing something. In Twenty this is why `workLog.person` exists alongside `workLog.matter`.
- **Messaging handles are separate from contacts.** One person can hold a LINE user id, an Instagram handle and a phone number. `contactIdentity` models the handle, `person` models the human, and inbound webhooks resolve one to the other. Provider message and thread ids are stored so redelivered webhooks deduplicate.

## Data to migrate

None. The Twenty workspace holds 6 demo contacts and matching seed records. This is a rebuild from a spec, not a data migration. Do not spend effort on an export path.

## Why we are leaving Twenty

- No tax, no line-level pricing, no document numbering. Quotations and invoices were modelled by hand as custom objects, and every total has to be computed by application code that Twenty gives you no natural place to put.
- No print or PDF generation. Quotation and invoice PDFs are uploaded as attachments, produced elsewhere.
- The messaging inbox has no UI. The objects exist, but rendering a usable inbox means writing React inside a fork of Twenty and maintaining that fork forever.
- Its extension model is metadata plus workflows. There is no server-side hook where "recalculate the invoice total when a line changes" naturally lives.

Frappe gives all four out of the box: controller hooks, naming series, print formats, and a Desk UI generated from the schema.

## Platform decision: a custom app on the Frappe framework

Nothing installed alongside it except the framework itself.

You get the DocType engine, a working Desk UI generated from the schema, permissions and roles, server-side controller hooks, background jobs, a REST API, print formats and PDF generation, file storage and users. Define the 16 objects in `01-DATA-MODEL.md` and the back office works in Desk before any frontend exists.

frappe-ui comes out for the two screens that people touch every day and that a generated form serves badly. See `02-FRAPPE-PLAN.md`.

### Rejected: ERPNext

Evaluated seriously, because on paper it covers the finance half: multi-company is exactly the three billing entities, Sales Invoice and Payment Entry handle per-line tax and outstanding amounts, Item with `is_stock_item = 0` is a service catalogue, and [`ecosoft-frappe/erpnext_thailand`](https://github.com/ecosoft-frappe/erpnext_thailand) adds Thai tax invoices, withholding tax certificates and PND reports.

Rejected because the finance half is not what this system is for. ERPNext contributes nothing to work logs, practice areas, matter deadlines, required documents, bookings or the inbox, which is the majority of the build. Its Timesheet is close to our work log but not free, being built around activity types and billing rates that feed a Sales Invoice, and bending it to minutes, a billable flag, a status, a practice area and a link to a booking costs more than writing the doctype. The price is permanent: a chart of accounts and fiscal years to maintain, `erpnext_thailand` as a dependency, and custom doctypes that have to survive ERPNext upgrades. That is a lot to carry for five doctypes and a print format.

**Reversal condition.** If the firm ever decides to run the ledger in-house and drop FlowAccount, this flips and ERPNext becomes the right base. Before that decision, two things need checking with the firm's accountant, who currently handles all of it:

1. Whether the firm is on the Revenue Department's **e-Tax Invoice & e-Receipt** system, where each individual invoice is transmitted to the RD, or only files **monthly PP30 and PND returns** on the e-filing portal. `erpnext_thailand` generates the monthly reports. It does not appear to do automated e-tax invoice transmission, which is one of the things FlowAccount does as a certified provider. e-Tax Invoice is voluntary, not mandatory.
2. What "gap-free" means to them in practice. ERPNext keeps cancelled documents in the sequence, so there is never a hole, but a reissued document is named `INV-003-1`. Some accountants accept the suffix, some do not want it on anything the RD sees.

### Terminology, because these get conflated

- **frappe-ui** is the Vue 3 component library and design system. **We are using it**, for the work log screen and the inbox.
- **Frappe framework** is the backend, DocTypes and Desk. We are using it for everything.
- **Frappe CRM** is a finished sales CRM product built with the other two. This is the one that was rejected, and only as a base to build on.

### Rejected: building on Frappe CRM

Frappe CRM defines 39 of its own doctypes, including `CRM Lead`, `CRM Deal`, `CRM Organization`, `CRM Contacts`, `CRM Task` and `FCRM Note`. It uses the stock `Contact` doctype, but organizations, tasks and notes are all its own.

The decisive point is its supported extension surface: Custom Fields on its own doctypes through a side panel layout builder, plus **CRM Form Script**, which its documentation describes as the only supported way to customize CRM UI behavior. That is field-level customization of pages that already exist. There is no supported way to add a Matter page, a Work Log entry screen, or a Matter list view. Getting those means editing its Vue frontend, which is a fork to merge upstream into forever.

The two screens this firm uses daily are a matter record and a work log entry form. Frappe CRM has no concept of either.

**Do read it.** It is the best reference implementation of frappe-ui available. Clone it somewhere read-only and copy its list view, filtering, side panel and data fetching patterns. Copying patterns costs nothing. Inheriting its release cycle costs forever.

### Considered: installing Frappe CRM alongside, unmodified

Apps compose on one site, so this is real. Frappe CRM uses the stock `Contact` doctype, so `tll_crm` matters and work logs could link to the same contact records. The firm gets a polished contacts and intake UI, `tll_crm` keeps matters, work logs and billing, and Frappe CRM upgrades cleanly because nothing was touched.

Not taken, for two reasons. Staff would work contacts at `/crm` and everything else in Desk or the custom screens, which is daily friction for a six-person firm. And `CRM Organization` and the `Client` doctype would both claim to be the client, resolvable only by dropping `Client` and pushing Thai legal name, tax ID, passport number and client type onto `CRM Organization` and `Contact` as custom fields, at which point the client model is shaped by their doctype rather than by the firm.

Revisit if the firm turns out to want a real enquiry pipeline, which `CRM Lead` and `CRM Deal` would give for free.

### Rejected: BottleCRM

[`MicroPyramid/Django-CRM`](https://github.com/MicroPyramid/Django-CRM), marketed as BottleCRM. Django REST backend, SvelteKit frontend, Flutter mobile app, PostgreSQL, MIT, actively maintained. Note that `MicroPyramid/opensource-startup-crm`, which search results still surface, is a SvelteKit rewrite that was archived in November 2025. Do not clone that one.

Rejected for the same reason as Frappe CRM, but the cost is higher. It is a sales CRM with no matter, work log, deadline, required document, billing entity or Thai tax concept, so all sixteen doctypes in `01-DATA-MODEL.md` would be new. In Frappe, defining a doctype generates a working list view, form, filters, permissions and REST endpoint. In BottleCRM each one is a Django model, a migration, a serializer, a viewset, and then SvelteKit list, detail and form pages, all hand-written. For a system that is almost entirely custom objects, that is the expensive direction.

It would be the right call only if the person maintaining this is a strong Django developer who would rather not learn Frappe's conventions. That is a legitimate reason and it should beat any architecture argument. In that case the honest question is whether BottleCRM's sales scaffolding is worth more than starting from plain Django, given most of it would be deleted.

### How to evaluate the next CRM someone suggests

This question has come up repeatedly. The test is two questions, in order:

1. **Does it model a matter, a work log and a client timeline?** No existing CRM does, because they are all built around a sales pipeline. So the answer is always no, and the real question is the second one.
2. **What does adding a custom object cost?** If the platform generates a usable list view, form, permissions and API from a schema definition, adding sixteen objects is cheap and the platform is a candidate. If every object needs hand-written backend and frontend code, the product's existing screens are worth very little to us, because we will not use them.

Frappe passes the second test. Frappe CRM, BottleCRM and every polished sales CRM fail it, because their value is the screens they already have, and we need different screens.

### Open: Frappe Helpdesk for the inbox

Not rejected, not decided. See the inbox section of `02-FRAPPE-PLAN.md`.

## Thai and English

The pattern in use, which carries over unchanged:

- **UI in English, content in Thai.** This works and is what the firm already does. Twenty ships no Thai locale, so the interface was always going to be English. Frappe ships a `th` translation if the interface is ever wanted in Thai.
- **Names get parallel fields, not translation.** `person.nameTh` and `company.nameTh` hold the Thai spelling next to the Latin one, because both appear on real documents and neither is derivable from the other. `billingEntity.legalName` is the registered name exactly as it must print on an invoice.
- **Free text is just Thai.** Notes, message bodies, work log descriptions and line descriptions are plain UTF-8 and take Thai with no special handling.

Two real gotchas:

1. **Full-text search does not segment Thai.** Thai is written without spaces, so a whole phrase becomes one token, and Frappe's search has the same weakness Twenty does. In practice this barely matters here: the Thai search that people actually do is finding a client by their Thai name, and a name is a short whole field value that substring matching finds fine. Nobody searches the middle of a work log description. Do not build a segmenter.
2. **PDF output needs a Thai font.** Print formats must ship a font with Thai glyphs, Sarabun or Noto Sans Thai, and the PDF renderer has to be configured to use it. Thai text silently renders as boxes otherwise. Prove this with a real Thai string in a generated PDF before building any print format on top of it.
