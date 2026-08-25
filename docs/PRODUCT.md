# Master Product & Development Brief — CRM + Omnichannel Business Platform

> **Reading guide.** This is the master product brief, the canonical statement of what we are
> building. It is kept as written rather than summarized elsewhere, so there is one source of truth.
>
> - **Customer lifecycle** — §26 (MVP) and §9 (sales workflow):
>   `Enquiry → Conversation → CRM Contact → Lead/Deal → Quotation → Invoice → Payment → Completed`
> - **Commercial positioning and Thailand-first strategy** — §2 and §29
> - **Development order** — §27
> - **Rules for coding agents** — §28, restated operationally in `/CLAUDE.md`
>
> How this is being built is in [`ARCHITECTURE.md`](./ARCHITECTURE.md); what the Twenty foundation
> actually provides is in [`TWENTY_ARCHITECTURE.md`](./TWENTY_ARCHITECTURE.md).

---

## 1. Project Vision

Build a modern, multi-tenant CRM and customer operations SaaS for businesses, initially developed and tested using Thailiving Law as the first real organization.

The product should combine the most important day-to-day business functions into one clean workspace:

**CRM + Omnichannel Communication + Sales + Quotations + Invoices + Payments + Automation + Basic Financial Visibility.**

The intention is **not** to build every underlying system from scratch.

The project should aggressively use and extend proven open-source software, libraries and existing infrastructure wherever appropriate. Development effort should primarily be spent on integration, product experience, Thailand-specific functionality, automation and features that differentiate the platform.

The final product should feel like **one purpose-built SaaS application**, regardless of how many open-source components or external services are used underneath.

Thailiving Law is customer #1 and the primary real-world testing environment, but the architecture must never assume that every organization is a law firm.

---

# 2. Core Product Philosophy

The product should follow five principles.

### Reuse before rebuilding

Before implementing substantial functionality, check whether one of the approved open-source projects already solves the problem.

Do not rebuild generic CRM functionality, authentication, invoice rendering, inbox components, analytics, deployment infrastructure or similar commodity functionality merely to have our own implementation.

### One product experience

Users should not feel as though they are moving between Twenty, Takdai, finance software and other systems.

The final interface should present:

**one navigation system, one account, one organization, one design language and connected data.**

### Modular architecture

CRM, messaging, finance and integrations should remain logically separated.

A failure or replacement of one module should not require rewriting the entire platform.

### SaaS first

Every major feature must account for:

- organizations/workspaces;
- users;
- teams;
- permissions;
- subscription plans;
- tenant isolation;
- configuration;
- feature availability.

Never hard-code Thailiving Law into generic product functionality.

### Thailand first, not Thailand only

The first market is Thailand.

This means strong support for:

- LINE Official Account;
- Thai QR/PromptPay;
- Thai bank transfer workflows;
- Thai/English interfaces;
- Thai business practices;
- local accounting integrations.

However, the architecture should allow additional countries, payment providers, channels and accounting systems later.

---

# 3. Product Structure

The application should eventually appear approximately as:

```text
Platform
│
├── Home
│
├── CRM
│   ├── Contacts
│   ├── Companies
│   ├── Leads
│   ├── Deals
│   ├── Pipelines
│   ├── Activities
│   ├── Tasks
│   └── Notes
│
├── Inbox
│   ├── All conversations
│   ├── My conversations
│   ├── Unassigned
│   ├── Teams
│   ├── LINE
│   ├── Facebook
│   ├── Instagram
│   ├── WhatsApp
│   ├── Email
│   └── Website Chat
│
├── Sales
│   ├── Products / Services
│   ├── Quotations
│   ├── Invoices
│   ├── Payments
│   └── Customers
│
├── Finance
│   ├── Overview
│   ├── Revenue
│   ├── Outstanding
│   ├── Transactions
│   └── Accounting Integrations
│
├── Automations
│
├── Reports
│
└── Settings
    ├── Organization
    ├── Users
    ├── Teams
    ├── Channels
    ├── Payments
    ├── Integrations
    ├── Custom Fields
    └── Billing
```

Not every section needs to exist in the initial release.

---

# 4. CRM Foundation

The current preferred CRM foundation is **Twenty**.

Twenty should provide as much generic CRM functionality as reasonably possible rather than recreating it.

Use existing Twenty capabilities for concepts such as:

- people;
- companies;
- opportunities/deals;
- pipelines;
- tasks;
- notes;
- activities;
- relationships;
- custom fields;
- custom objects;
- views;
- filtering;
- workflows;
- permissions;
- APIs;
- webhooks;
- email/calendar functionality where appropriate.

Before building custom CRM infrastructure, determine whether Twenty already provides the required functionality or whether it can be implemented cleanly through Twenty's extension/customization mechanisms.

Avoid unnecessary modifications to upstream Twenty code where an extension or separate module can achieve the same result.

The product may eventually diverge significantly from Twenty visually and functionally, but Twenty should initially be treated as the **CRM engine/chassis**.

---

# 5. Omnichannel Communication

Omnichannel communication is one of the primary differentiators of the product.

The communication platform may be developed as a logically separate service, but it should integrate deeply enough that CRM users experience it as part of the same application.

Initial target channels include:

- LINE Official Account;
- Facebook Messenger;
- Instagram;
- WhatsApp Business;
- website live chat;
- email.

Future channels may include:

- TikTok;
- Shopee;
- Lazada;
- Telegram;
- additional social platforms;
- additional marketplace messaging systems.

The communication engine should normalize messages from different providers into common concepts:

```text
Channel
Contact Identity
Conversation
Message
Attachment
Agent
Team
Assignment
Status
Tag
Internal Note
```

The CRM should not need to understand the implementation details of Meta, LINE or other providers.

Conceptually:

```text
LINE ─────────┐
Messenger ────┤
Instagram ────┤
WhatsApp ─────┼──> Channel Layer
Email ────────┤          ↓
Web Chat ─────┘    Conversation Engine
                         ↓
                    Unified Inbox
                         ↓
                         CRM
```

A customer should be able to have multiple identities:

```text
John Smith
├── LINE identity
├── Facebook identity
├── Instagram identity
├── WhatsApp number
├── Email
└── Website visitor
```

These identities should be linkable to one CRM contact.

---

# 6. Unified Inbox

The shared inbox should eventually support:

- conversation list;
- conversation search;
- channel filtering;
- unread state;
- assignments;
- teams;
- statuses;
- priorities;
- tags;
- internal notes;
- attachments;
- images;
- documents;
- quoted replies;
- reactions where supported;
- delivery/read state;
- saved replies;
- templates;
- agent presence;
- typing indicators where possible;
- AI assistance;
- automation.

Do **not** build every UI primitive from scratch.

Use existing open-source implementations as references or reusable components where licensing allows.

Chatwoot should be treated as a major architectural reference for omnichannel functionality rather than necessarily being deployed as part of the product.

Other approved inbox/channel projects should be inspected before implementing functionality already solved elsewhere.

---

# 7. Website Live Chat

The platform should eventually provide its own embeddable website chat widget.

Example integration:

```html
<script src="https://cdn.example.com/widget.js"></script>
```

Businesses should be able to configure:

- branding;
- logo;
- welcome message;
- colours;
- position;
- operating hours;
- language;
- pre-chat fields;
- automated greeting;
- AI availability;
- human handoff.

Website conversations should enter exactly the same inbox as LINE, Facebook, Instagram and WhatsApp conversations.

---

# 8. CRM + Conversation Integration

Communication must be deeply connected to CRM records.

Opening a contact should eventually provide something similar to:

```text
John Smith

Overview
Conversations
Deals
Tasks
Quotations
Invoices
Files
Activity
```

The Conversations section should show every relevant communication regardless of channel.

From a conversation, staff should be able to:

- identify the customer;
- link an existing CRM contact;
- create a new contact;
- create a lead/deal;
- assign an owner;
- create a task;
- create a quotation;
- view previous conversations;
- view relevant CRM information.

From a CRM contact, staff should be able to immediately open or continue conversations.

---

# 9. Sales Workflow

The intended generic sales lifecycle is:

```text
Enquiry
   ↓
Lead / Contact
   ↓
Deal
   ↓
Quotation
   ↓
Accepted
   ↓
Invoice
   ↓
Payment Request
   ↓
Payment
   ↓
Completed
```

Twenty should provide the CRM portion wherever practical.

Custom functionality should fill the gaps around quotations, invoices and payments.

Products/services should support:

- name;
- description;
- SKU/code if needed;
- price;
- tax;
- unit;
- category;
- active/inactive state.

Quotations should support line items, discounts, taxes, validity dates, status, PDF generation and conversion into invoices.

---

# 10. Finance Philosophy

The product is **not intended to become a complete accounting ERP**.

Do not build:

- general ledger;
- double-entry bookkeeping;
- statutory accounting;
- full payroll accounting;
- complex tax accounting;
- full bank reconciliation;
- country-specific financial statements.

Dedicated accounting platforms already solve these problems.

The SaaS should instead provide the operational financial experience surrounding customers.

This includes:

- quotations;
- invoices;
- payments;
- outstanding balances;
- basic expenses where useful;
- transactions;
- revenue visibility;
- basic financial dashboards.

Accounting should be handled through integrations.

For Thailiving Law, the intended accounting platform is currently **FlowAccount**.

Future integrations may include other Thai or international accounting systems.

---

# 11. Midday

Midday should be treated as a major reference implementation for the financial experience.

Before building substantial finance UI or financial workflow functionality, inspect how Midday approaches:

- invoices;
- customers;
- transactions;
- expenses;
- financial dashboards;
- documents/receipts;
- financial summaries;
- bank data;
- financial UX.

The objective is **not to recreate Midday entirely**.

Use it to avoid solving already-understood financial UX problems from zero.

Important: Midday's licensing must be respected. Do not blindly copy AGPL code into proprietary components without confirming the licensing implications.

Architectural concepts and product patterns may still be extremely valuable.

---

# 12. Thailand Payment Experience

Thailand-specific payments are an important part of the product.

The initial payment methods should include:

### Thai QR / PromptPay

A customer receives a payment request containing a QR code for the required amount.

Conceptually:

```text
Invoice
↓
Generate payment request
↓
Thai QR / PromptPay
↓
Customer scans
↓
Payment verification
↓
Invoice marked paid
```

Where possible, payment confirmation should be automated through supported banking/payment APIs or providers.

### Bank Transfer

Bank transfer should provide a Thailand-friendly flow.

The customer chooses **their preferred banking application**, for example:

- Bangkok Bank;
- KBank;
- SCB;
- Krungthai;
- Krungsri;
- other supported banks.

The selected bank represents the **payer's bank/application**, not necessarily the receiving bank.

The destination may therefore be:

```text
Customer selects:
KBank

Transfer destination:
Bangkok Bank
Example Company Co., Ltd.
XXX-X-XXXXX-X
฿35,000
Reference: INV-000123
```

The interface should provide convenient actions such as:

- copy account number;
- copy amount;
- copy reference;
- open supported banking application where possible;
- upload proof of payment where required.

Each SaaS organization configures its own receiving bank accounts and payment settings.

Never hard-code Thailiving Law banking information into generic functionality.

---

# 13. Accounting Integration Layer

Accounting should use a provider abstraction.

Conceptually:

```text
AccountingProvider

createCustomer()
createInvoice()
updateInvoice()
recordPayment()
syncInvoice()
getInvoiceStatus()
```

Providers may eventually include:

```text
None
FlowAccount
PEAK
Xero
QuickBooks
Other
```

Thailiving Law initially uses FlowAccount.

A SaaS customer who does not connect an accounting provider should still be able to use CRM quotations, invoices and payment requests.

---

# 14. Authentication and Organizations

The product must support proper SaaS multi-tenancy.

Concepts include:

```text
Organization
Workspace
User
Membership
Team
Role
Permission
Subscription
Feature
```

Authentication should not be reinvented unnecessarily.

Logto is currently an approved candidate and should be evaluated before creating custom authentication infrastructure.

Requirements eventually include:

- email/password;
- social login where useful;
- SSO;
- organization membership;
- invitations;
- roles;
- RBAC;
- MFA;
- session management;
- API authentication.

Thailiving Law should simply be one organization within the same architecture.

---

# 15. Thailiving Law

Thailiving Law serves as the first production organization and testing environment.

It may receive additional modules unavailable to normal customers.

Examples:

```text
Legal Matters
Document Checklists
Practice Areas
Matter Deadlines
Legal Services
Client Documents
Property Transactions
Visa Cases
Corporate Matters
Litigation
Estate Matters
```

These must be implemented as optional extensions rather than assumptions built into the core CRM.

Conceptually:

```text
CORE SAAS
├── CRM
├── Omnichannel
├── Sales
├── Payments
└── Automation

THAILIVING EXTENSIONS
├── Matters
├── Legal workflows
├── Documents
└── TLLACC integration
```

---

# 16. TLLACC

The existing TLLACC system should not be rebuilt unnecessarily during the initial SaaS development.

It currently handles useful internal employee functions such as HR and attendance.

Keep functioning systems operational unless replacing them produces clear value.

The CRM may provide navigation or SSO into TLLACC.

Future integration may allow:

- shared employee identity;
- attendance context;
- leave status;
- staff availability;
- notifications;
- shared permissions.

HR should not become part of the commercial CRM MVP unless there is a clear product reason.

---

# 17. AI

AI should be integrated where it meaningfully reduces work rather than being added simply for marketing.

Potential functionality includes:

- suggested replies;
- conversation summaries;
- translation;
- intent detection;
- lead qualification;
- contact data extraction;
- automatic tagging;
- conversation routing;
- follow-up suggestions;
- quotation drafting;
- document extraction;
- CRM data entry assistance;
- workflow automation;
- knowledge search.

AI actions that modify business data should be auditable.

Users should understand what the AI changed or suggested.

---

# 18. Automation

Businesses should eventually be able to create workflows such as:

```text
WHEN
New LINE conversation arrives

IF
Message contains "visa"

THEN
Tag: Visa
Assign: Visa Team
Create lead
Send acknowledgement
```

Or:

```text
WHEN
Quotation accepted

THEN
Create invoice
Notify owner
Generate payment request
```

Or:

```text
WHEN
Invoice paid

THEN
Mark deal won
Notify assigned staff
Sync payment to accounting
```

Automation should connect CRM, communication, sales and payments.

---

# 19. CMS / Website Module

CMS is **not MVP**.

However, the architecture may eventually support a Website module allowing businesses to manage:

- pages;
- content;
- forms;
- SEO;
- landing pages;
- website analytics;
- live chat;
- lead capture.

Instatic and related CMS projects may be studied when this module is developed.

The long-term opportunity is:

```text
Website
↓
Lead Form / Live Chat
↓
CRM
↓
Conversation
↓
Deal
↓
Quotation
↓
Invoice
↓
Payment
```

This creates a complete customer lifecycle within one platform.

---

# 20. Documents

Document functionality may eventually include:

- attachments;
- client files;
- quotation PDFs;
- invoice PDFs;
- document previews;
- structured extraction;
- OCR;
- AI document analysis.

Projects such as ParseHawk, MinerU and relevant PDF repositories should be evaluated when document intelligence is implemented.

Do not introduce complex document infrastructure before there is a concrete requirement.

---

# 21. Analytics

Do not build generic website analytics from scratch.

Plausible or another suitable analytics platform may be integrated where appropriate.

The SaaS itself should eventually provide business-specific analytics such as:

```text
New enquiries
Response time
Conversation volume
Lead conversion
Deal value
Quotation conversion
Revenue
Outstanding invoices
Payment conversion
Agent performance
Channel performance
```

These metrics are more valuable to CRM customers than generic page views.

---

# 22. Open-Source Repository Strategy

The existing repository collection should be treated as a **toolbox of solved problems**, not a list of required dependencies.

Before implementing a major feature, inspect relevant projects.

Examples:

```text
CRM
→ Twenty
→ Comp AI CRM

Omnichannel
→ Chatwoot
→ OpenBSP
→ Zernio-style unified inbox projects
→ WhatsApp CRM projects

Finance
→ Midday
→ Invio

Auth
→ Logto
→ Authentik if required

Deployment
→ Coolify

CMS
→ Instatic

Documents
→ ParseHawk
→ MinerU

AI UI
→ agentcn

Design
→ shadcn
→ Fluent UI
→ design.md
→ approved design repositories

Analytics
→ Plausible
```

Do not automatically install a repository because it contains a useful feature.

Determine whether it should be:

1. used directly;
2. integrated as a separate service;
3. used as a library;
4. used as a reference implementation;
5. ignored.

Licensing must be checked before code reuse.

---

# 23. Design Direction

The product should feel like a premium modern business SaaS rather than traditional ERP software.

Design references include products such as:

- Linear;
- Attio;
- Stripe;
- Notion;
- Intercom;
- Front.

Priorities:

- high information density without clutter;
- excellent typography;
- restrained colour usage;
- fast interactions;
- consistent spacing;
- predictable navigation;
- keyboard-friendly interactions;
- responsive layouts;
- excellent empty/loading/error states;
- professional rather than playful visual language.

Use an existing component system rather than rebuilding basic UI primitives.

Tailwind + shadcn-style components are preferred where appropriate.

Do not mix several complete design systems without a reason.

---

# 24. Technical Direction

Prefer a modern TypeScript ecosystem wherever practical.

Ideal direction:

```text
TypeScript
React
Next.js where appropriate
PostgreSQL
Tailwind
shadcn/ui
APIs
Webhooks
Background queues
Object storage
Realtime infrastructure
```

Twenty may retain its own architecture internally.

Independent services do not need to be forced into Next.js merely for consistency.

Choose technology based on the workload.

For example:

```text
Marketing / portal
→ Next.js

CRM
→ Twenty / React ecosystem

Messaging APIs
→ TypeScript service

Realtime
→ appropriate realtime infrastructure

Background message processing
→ queue/workers

Files
→ object storage

Database
→ PostgreSQL
```

Avoid unnecessary microservices during MVP.

A modular monolith plus dedicated omnichannel workers/services is preferable to dozens of tiny services.

---

# 25. Hosting

Development may run locally or on available internal infrastructure.

Production SaaS infrastructure must eventually support:

- automatic deployments;
- backups;
- monitoring;
- logs;
- SSL;
- custom domains;
- database backups;
- secrets;
- scaling;
- rollback;
- staging environments.

Coolify should be evaluated as a way to reduce deployment/DevOps work.

Cloudflare may provide:

- DNS;
- CDN;
- WAF;
- rate limiting;
- edge functionality;
- object storage where appropriate;
- queues/realtime components where appropriate.

Vercel may host suitable Next.js applications.

Do not force stateful backend applications onto serverless infrastructure when conventional containers are a better fit.

---

# 26. MVP

The MVP is **not**:

> CRM + ERP + HR + CMS + accounting + AI + every messaging platform.

The MVP is:

```text
CRM
+
Unified Inbox
+
One or two real communication channels
+
Quotation
+
Invoice
+
Thai Payment Request
```

Specifically, a successful MVP should demonstrate:

```text
Customer sends message
        ↓
Message appears in shared inbox
        ↓
Customer matched/created in CRM
        ↓
Staff communicates with customer
        ↓
Lead/deal created
        ↓
Quotation generated
        ↓
Customer accepts
        ↓
Invoice generated
        ↓
PromptPay / bank transfer offered
        ↓
Payment recorded
        ↓
CRM updated
```

If this complete lifecycle works cleanly, the foundation is successful.

---

# 27. Initial Development Order

### Phase 1 — CRM Scaffold

Deploy/fork Twenty.

Confirm:

- customization;
- custom objects;
- UI extensions;
- API access;
- permissions;
- organization model;
- rebranding;
- upgrade strategy.

Create a Thailiving Law test organization.

---

### Phase 2 — Omnichannel Scaffold

Create the normalized models for:

```text
Channel
Channel Account
Conversation
Message
Contact Identity
Assignment
```

Initially use fake messages.

Display conversations associated with CRM contacts.

Do not connect every channel yet.

---

### Phase 3 — First Real Channel

Connect one production communication channel.

LINE OA is a strong candidate because Thailand is the initial market.

Prove:

```text
Customer → LINE → Inbox → Agent → Reply → Customer
```

Then add Meta channels.

---

### Phase 4 — Sales

Implement:

```text
Services
Quotation
Invoice
```

Reuse Twenty's object infrastructure wherever practical.

Inspect Midday/Invio before designing financial interfaces.

---

### Phase 5 — Payments

Implement:

```text
Thai QR / PromptPay
Bank Transfer
Payment status
Payment confirmation
```

Create organization-level payment settings.

---

### Phase 6 — Accounting

Integrate FlowAccount for Thailiving Law.

Do not make FlowAccount mandatory for all SaaS organizations.

---

### Phase 7 — Expansion

After the core lifecycle works, prioritize based on actual usage:

- more channels;
- automation;
- AI;
- reporting;
- documents;
- CMS;
- additional accounting integrations;
- industry modules.

---

# 28. Rules for AI Coding Agents and Developers

Before implementing a substantial feature:

**1. Search the existing codebase.**

Do not create duplicate systems.

**2. Check Twenty functionality.**

Use existing CRM primitives where suitable.

**3. Check approved reference repositories.**

Determine whether the problem has already been solved.

**4. Check licensing.**

Never copy code without understanding its license.

**5. Prefer integration over duplication.**

Do not maintain two sources of truth for the same data.

**6. Keep generic and Thailiving-specific functionality separate.**

The commercial product must remain industry-neutral.

**7. Avoid premature abstraction.**

Build interfaces where multiple implementations are genuinely expected—channels, payments, accounting—not for every CRUD operation.

**8. Maintain clear ownership.**

For example:

```text
CRM owns:
Contacts
Companies
Deals

Omnichannel owns:
Conversations
Messages
Channel identities

Sales owns:
Quotes
Invoices
Payment requests

Accounting provider owns:
Official accounting records
```

**9. Do not rewrite functioning open-source infrastructure solely for aesthetic reasons.**

Build a product layer over it where possible.

**10. Every new major feature must answer:**

> Does this help the core customer lifecycle from enquiry → conversation → sale → payment?

If not, it is probably not MVP.

---

# 29. Long-Term Product Position

The long-term product should become a business customer platform particularly well suited to Thailand and Southeast Asia.

It should combine the traditionally disconnected areas of:

**CRM, social messaging, customer service, sales and payments.**

A business should be able to receive a LINE message, understand who the customer is, see their complete history, collaborate internally, create a quotation, receive payment and continue the relationship without jumping between five applications.

The product should not attempt to replace every specialist business application. Instead, it should own the customer lifecycle and integrate cleanly with specialist systems such as accounting software.

The competitive advantage should come from the combination of:

**modern CRM + genuinely strong omnichannel communication + local payment workflows + automation + excellent UX.**

The underlying open-source projects accelerate development, but the integration, workflow, localization and overall experience are what make the final platform its own product.