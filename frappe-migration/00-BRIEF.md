# Brief for the Frappe rebuild

Hand this file, `01-DATA-MODEL.md`, `02-FRAPPE-PLAN.md` and `schema.json` to the chat working in the Frappe repo. It is everything decided while the system was being built on Twenty.

## What this is, and what it is not

**A work log and CRM system for a small Thai law / visa services firm, with some finance attached.** The client record is the foundation and the work log is what the firm uses it for. Quotations, invoices and payments exist because the firm has to send documents to clients, not because anyone wants to run accounting here.

Read that as a ranking, because it decides everything below. The client and the matter get built first because everything hangs off them. The work log gets the care, because it is what staff touch every day and it is what the system lives or dies on. Billing and the inbox come after both. If a design choice makes work logging faster at the cost of the billing model, take it.

## Scope

- Clients, as individuals and as organizations, with names in both English and Thai, and the contact people inside an organization
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
