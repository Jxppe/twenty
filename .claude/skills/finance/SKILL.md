---
name: finance
description: Boundary between our operational finance features and external accounting software. Use when working on products, quotations, invoices, payment status, revenue reporting or accounting provider integration.
---

# Finance boundary

Full detail in `docs/FINANCE.md`.

## 1. The test

**Would an accountant be legally accountable for this number?**

Yes → the accounting provider owns it. We hold an operational view and push facts to them.

We build: products, quotations, invoices, payment requests, payment status, outstanding balances,
revenue visibility, operational dashboards.

We never build: general ledger, double-entry bookkeeping, statutory accounting, tax accounting,
payroll accounting, bank reconciliation, regulatory financial statements.

If a feature needs double-entry to be correct, it belongs in the accounting provider. **We are not
building an ERP.**

## 2. Documents are historical, not live

A quotation copies product description and price at creation. It does not reference them.

- Editing a product must never change a sent quotation.
- Converting a quotation to an invoice **copies**; editing the quotation afterwards must not change
  the invoice.
- Store `subtotal`, `discount`, `tax`, `total`. Do not compute on read.
- Never delete an issued invoice. Void it.

## 3. Ownership

Sales owns products, quotations, invoices and payment requests. It does **not** own the work:
`Quotation.matter` points at the Matter (currently a relabelled `Opportunity`, see the `matters`
skill).

## 4. `billingEntity` is required, and it flows

Required on `Quotation` and `Invoice`, because it names **the legal party to the contract**, not a
category. Thailiving Law, Unique X Services and Pattaya Notary bill separately for tax reasons.

Defaults flow `ChannelAccount -> Matter -> Quotation -> Invoice`, overridable at any step. It is
**not** on `Person` or `Company`: clients are shared across all three, which is why there is one
workspace.

## 5. Accounting provider

One interface: `createCustomer`, `createInvoice`, `updateInvoice`, `recordPayment`, `syncInvoice`,
`getInvoiceStatus`.

Rules:

1. **`None` is fully supported.** Quoting, invoicing and taking payment must work with no accounting
   connection, so a broken integration is never an outage.
2. **The provider is the system of record for accounting.** We store an external reference and a
   cached status. We never reconstruct their ledger.
3. **One-way by default**, ours to theirs, with status read back.

FlowAccount is the only implementation. CONFIRMED with the vendor: **the API works on any package**,
so no plan upgrade is needed. Open with support: whether the three entities need three subscriptions
and three sets of credentials.

Keep the interface anyway - it is the reversal path written into D3, and it is what makes `None`
work.

## 6. Numbering

Per billing entity, gap-free. Three legal entities means three sequences, and mixing them is a tax
problem. Allocate in a logic function under a lock, never client-side.

## 7. Currency

`CURRENCY` fields carry amount plus currency code, so THB is native. Quotations and invoices are
mostly in English; Thai appears in customer content, not in the documents.

## 8. References and licences

- **Midday** is AGPL-3.0. **Read for patterns, never copy code.** Copying makes our product AGPL and
  forces source disclosure to every network user.
- **Invio** is Unlicense, so reuse is unencumbered. Verify the declaration in the repository first.
- **Twenty's own `document-generator` example app** is MIT and does templated documents, a public
  printable page and PDFs saved to the record with no external service. Read it before designing
  quotation or invoice output.
- **`erpnext_thailand`** (MIT) implements Thai service VAT with the tax point on payment, withholding
  tax certificates, PND reports and deposit invoicing. Frappe-coupled Python, so the reuse is
  conceptual, but read it for what the rules actually are before touching anything tax-adjacent.
