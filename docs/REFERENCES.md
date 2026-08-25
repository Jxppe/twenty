# Reference Repository Registry

A toolbox of solved problems, not a dependency list. Consult this before implementing any
substantial feature.

**Licences below were verified against each repository's own page in August 2026.** Re-check before
copying any code: projects relicense, and a `LICENSE` file at the repo root does not always cover
every directory.

## Classification

| Verdict | Meaning |
| --- | --- |
| **DIRECT** | Run it as-is; it is part of the product |
| **SERVICE** | Deploy alongside and integrate over the network |
| **LIBRARY** | Import as a dependency |
| **REFERENCE** | Read it, learn from it, write our own |
| **IGNORE** | Not relevant to this product |

## The licence rule that governs everything

| Licence | Can we copy code into our proprietary app? |
| --- | --- |
| MIT, Apache-2.0, BSD, Unlicense | Yes, with attribution as required |
| MPL-2.0 | Yes, but modifications to MPL files stay MPL (file-level copyleft) |
| **AGPL-3.0** | **No.** Copying makes our product AGPL, and §13 forces us to publish source to every network user |
| BSL-1.1 | Source-available, not open source. Read the grant carefully |
| Custom | Read it in full |

**AGPL projects are architecture references only.** Reading Midday to learn how invoice UX should
work is fine. Pasting its components into our app is not. Ideas are not copyrightable; source is.

---

## CRM

### Twenty — the foundation
`twentyhq/twenty` · TypeScript, NestJS, React, PostgreSQL · **AGPL-3.0 + Application Exception; parts MIT; 314 files commercial**

**DIRECT.** The CRM chassis. See [`TWENTY_ARCHITECTURE.md`](./TWENTY_ARCHITECTURE.md).

The licence is the single most important fact in this document. Apps built against the published
interfaces may stay proprietary; modifying Twenty's source triggers AGPL §13 in full. `twenty-sdk`,
`twenty-client-sdk`, `twenty-shared`, `twenty-ui` and `packages/twenty-apps` are MIT.

**Risk:** 314 files marked `/* @license Enterprise */` need a paid subscription in production, and
they cover billing, SSO, row-level permissions and audit logs.

### Relaticle
`relaticle/relaticle` · Laravel, Filament, Livewire, PostgreSQL · **AGPL-3.0**

**REFERENCE**, low priority. A self-hosted CRM with an MCP server exposing 32 CRM tools. Interesting
only for how it shapes CRM operations as agent tools. Wrong stack for us, and AGPL, so no code reuse.

### Frappe CRM
`frappe/crm` · Frappe Framework (Python), Vue 3 · **AGPL-3.0**

**REFERENCE**, low priority. Notable for having WhatsApp and telephony built in, so worth a look at
how they model channel conversations against deals. Wrong stack, AGPL, no code reuse.

### Comp AI CRM
`trycompai/crm` · Next.js, NestJS, tRPC, Prisma, Bun · **MIT**

**REFERENCE.** Agent-first CRM where the agent works a queue on its own schedule rather than
responding to prompts. Genuinely relevant to our AI assistance goals, and MIT so reuse is possible.

**Risk:** single-tenant, no organizations. Its agent model does not transfer to multi-tenant as-is.

---

## Omnichannel and communication

### Chatwoot — the primary reference
`chatwoot/chatwoot` · Ruby on Rails, Vue.js, PostgreSQL · **MIT**

**REFERENCE**, and the most valuable one in this section. The closest mature implementation of what
we are building: inbox, channel adapters, contact identity merging, assignment, teams, canned
responses, agent presence.

MIT means we *may* copy code, but the stack is Rails/Vue against our TypeScript/React, so the reuse
is conceptual. Study the data model, the adapter boundary and the inbox interactions before
finalizing [`OMNICHANNEL.md`](./OMNICHANNEL.md).

**Not SERVICE.** Deploying Chatwoot alongside Twenty means two CRMs, two contact stores, and a sync
problem. That violates the single-source-of-truth rule.

### OpenWA
`rmyndharis/OpenWA` · NestJS, TypeScript, whatsapp-web.js / baileys · **MIT**

**IGNORE for production, REFERENCE at most.** A self-hosted WhatsApp gateway using reverse-engineered
clients rather than the official Cloud API.

**Risk, and it is disqualifying:** unofficial WhatsApp clients violate Meta's terms and get numbers
banned. For a commercial SaaS handling customers' business accounts, that liability is unacceptable.
Use the official WhatsApp Business Cloud API. The NestJS webhook and queue structure is worth
skimming.

### 9router
`decolua/9router` · Next.js, Node.js · **MIT**

**IGNORE.** Miscategorized in the brief: it is an AI routing proxy that connects coding tools to LLM
providers and compresses tool output. Nothing to do with omnichannel messaging. Possibly interesting
as a developer cost-control tool, unrelated to the product.

### Hermes WebUI
`nesquena/hermes-webui` · Python stdlib HTTP, vanilla JS · **MIT**

**IGNORE.** Also miscategorized: a web UI for a self-hosted autonomous agent, not a messaging
platform. No overlap with the shared inbox.

---

## Finance and billing

### Midday
`midday-ai/midday` · Next.js, React, TypeScript, Tailwind, Supabase · **AGPL-3.0** (commercial licence on request)

**REFERENCE ONLY, and strictly.** The best available reference for invoice UX, transaction lists,
financial dashboards and document handling in a modern TypeScript stack.

**Risk:** AGPL-3.0. Copying any component into our proprietary product makes the product AGPL and
obliges source disclosure to every network user. Read for patterns, write our own code. If we ever
genuinely want their code, buy the commercial licence.

### Invio
`kittendevv/invio` · Python backend, React frontend, Docker · **Unlicense**

**REFERENCE**, with reuse permitted. Public-domain-equivalent, so no licence obligations at all. A
minimal "create an invoice, share a link, get paid" tool, which is close to our payment-request
page. Small enough to read end to end.

**Risk:** verify the Unlicense declaration in the repository directly before copying, and confirm
its dependencies are compatible. Unlicense on the wrapper does not clear the dependency tree.

### Paymenter
`Paymenter/Paymenter` · PHP 8.3, Laravel, MariaDB · **MIT**

**REFERENCE**, low priority. Billing and subscription management for hosting companies. Useful for
recurring-billing concepts if we ever bill our own SaaS customers outside Twenty's Stripe
integration. Wrong stack for code reuse.

---

## Auth and identity

### Logto
`logto-io/logto` · TypeScript, Node.js, PostgreSQL · **MPL-2.0**

**IGNORE for now.** Recommendation: do not adopt.

Twenty already owns identity: users, workspaces, memberships, roles, permissions, API keys, 2FA,
and SSO via OIDC and SAML. Every permission check and the schema-per-workspace resolution key off
Twenty's user model. Replacing it means deep `twenty-server` modification, which is the worst place
to be for both AGPL §13 and upgrade friction.

Twenty supports OIDC, so Logto *could* federate in front without a fork. Revisit only if a concrete
requirement forces it, such as shared identity across Takdai and TLLACC, or an enterprise SSO deal.
Note Twenty's SSO module is Enterprise-licensed.

### Authentik
`goauthentik/authentik` · Python/Django, Go, TypeScript · **MIT for code; EE licence for enterprise features; docs CC BY-SA 4.0**

**IGNORE.** Same reasoning as Logto, and heavier. Only relevant if we ever need to be an identity
provider ourselves, which is not on the roadmap.

### FingerprintJS
`fingerprintjs/fingerprintjs` · TypeScript · **MIT**

**IGNORE for now.** Browser fingerprinting. Conceivably useful for web-chat visitor identification
before a customer identifies themselves.

**Risk:** fingerprinting has real privacy and consent implications under PDPA and GDPR. Do not adopt
without a legal read. There is usually a less invasive option (a first-party cookie) for the same
job. Also verify the current licence: this project's commercial offering has used different terms
from the open-source library.

---

## Design, UI and agent tooling

### Taste Skill
`leonxlnx/taste-skill` · Claude Code skills · **MIT**

**LIBRARY (a Claude skill).** Recommended for installation. An "anti-slop" frontend skill targeting
layout, typography, spacing and motion, which is precisely the failure mode we want to avoid.
Install: `npx skills add https://github.com/Leonxlnx/taste-skill`

**Risk:** it is opinionated. Our own `.claude/skills/saas-ui/SKILL.md` and `DESIGN.md` take
precedence where they conflict, since they encode Twenty integration constraints the skill cannot
know about.

### Google DESIGN.md
`google-labs-code/design.md` · TypeScript/Node CLI · **Apache-2.0**

**LIBRARY / REFERENCE.** Recommended. A format for describing a visual identity to coding agents:
YAML tokens plus prose rationale, with `lint`, `diff` and `export` commands, including export to
Tailwind and W3C design tokens.

Good fit: our `DESIGN.md` should become a valid DESIGN.md document so agents get machine-readable
tokens rather than prose they have to interpret.

**Risk:** alpha. Adopt the format now; treat the CLI as optional.

### Awesome DESIGN.md
`voltagent/awesome-design-md` · **MIT**

**REFERENCE.** A curated collection of DESIGN.md files extracted from public sites. Useful as worked
examples when writing ours.

### agentcn
`shadcn-labs/agentcn` · TypeScript, Next.js, Mastra, shadcn/ui · **MIT**

**REFERENCE.** AI agent recipes, shadcn-CLI compatible.

**Risk, and it matters:** it is built on shadcn/ui, and shadcn is Radix, and **Radix popovers render
nothing inside Twenty's front-component sandbox** because `createPortal` is silently dropped. Verified
in our prototype. Do not assume shadcn components work inside Twenty apps. They work in standalone
web surfaces (a marketing site, the web-chat widget) only.

### Microsoft Fluent UI
`microsoft/fluentui` · TypeScript, React · **MIT**

**IGNORE.** We already have a design system: `twenty-ui`, which is MIT and works inside front
components including theme tokens. Adding Fluent means two conflicting systems, which the design
direction explicitly forbids.

### mx-icons
`ig-imanish/mx-icons` · **MIT**

**IGNORE for now.** Twenty ships the Tabler icon set through `twenty-ui/icon`, already themed and
tree-shakeable. A second icon set is visual inconsistency for no gain.

### Hallmark
`nutlope/hallmark` · **MIT**

**IGNORE.** Not relevant to the application. Revisit only for marketing-site work.

### IP-as-logo Skill
`s1dashu/ip-as-logo-skill` · licence unverified

**IGNORE.** Explicitly out of scope per the brief.

---

## Documents

### pdfcn
`shadcn-labs/pdfcn` · React, Rust/WASM renderers · **MIT**

**LIBRARY, candidate.** Pre-built React PDF components including invoices and reports. MIT, right
stack, directly aimed at our quotation and invoice output.

**Risk:** shadcn-ecosystem, so verify it works inside the front-component sandbox or is used only
server-side in a logic function. Also check the WASM payload against the 250MB function dependency
layer cap.

### MinerU
`opendatalab/mineru` · Python, VLM/OCR · **MinerU Open Source Licence (custom, based on Apache-2.0)**

**SERVICE**, much later. Document parsing to structured JSON for LLM workflows. Only relevant when
document intelligence becomes a real requirement.

**Risk:** custom licence with additional conditions on top of Apache-2.0. Read it in full before
production use. Python and GPU-oriented, so a separate service, never in-process.

### ParseHawk
`parsehawk/parsehawk` · FastAPI, Python, React, vLLM · **Apache-2.0**

**SERVICE**, later. Local-first document-to-JSON with user-defined schemas. Cleaner licence than
MinerU and a schema-driven API that fits invoice and ID extraction well. Pre-1.0.

### PdfDing
`mrmn2/PdfDing` · Python, Django, Docker · **AGPL-3.0**

**IGNORE.** A self-hosted PDF manager, which is not our problem: Twenty already has file storage and
a `FILES` field type. AGPL, and the GitHub repository is archived with development moved to
Codeberg.

---

## CMS, marketing and SEO

Not MVP. All four are parked.

### Instatic
`corebunch/instatic` · Bun, React 19, TypeScript, SQLite/Postgres · **MIT**

**REFERENCE**, parked until a Website module exists. A self-hosted visual CMS with design tokens, a
plugin system and an AI page generator. MIT and a modern TypeScript stack, so genuinely reusable
later. Pre-1.0.

### OpenSEO
`every-app/open-seo` · **MIT** — **IGNORE**, parked.

### Qiaomu SEO
`joeseesun/qiaomu-seo` · **MIT** — **IGNORE**, parked.

### Claude Blog
`AgriciDaniel/claude-blog` · **MIT** — **IGNORE**, parked. Marketing-site tooling, not product.

---

## Analytics

### Plausible
`plausible/analytics` · Elixir/Phoenix, PostgreSQL, ClickHouse, React · **AGPL-3.0** (JS tracker separately MIT)

**SERVICE**, if and when we need website analytics. Deploy alongside; never link its code into ours.

The brief is right that generic page-view analytics is not what CRM customers want. Business
analytics (response time, conversation volume, lead conversion, quotation conversion, revenue,
agent and channel performance) is built from our own objects using Twenty's chart widgets.

**Risk:** AGPL-3.0 on the server. Running it as a separate service is fine; copying code is not.
Note the tracker script is MIT, deliberately, so embedding it is safe.

---

## Deployment

### Coolify
`coollabsio/coolify` · Laravel, Svelte, Docker · **Apache-2.0**

**SERVICE**, recommended for evaluation. Self-hosted PaaS: deployments, backups, SSL, monitoring,
rollback. Apache-2.0, so no licence friction. Directly reduces the DevOps work the brief wants to
avoid.

**Risk:** it becomes production infrastructure, so it needs its own reliability story. Evaluate
against managed alternatives before committing.

### OpenShip
`oblien/openship` · Node.js, Postgres, Redis, OpenResty · **Apache-2.0**

**REFERENCE**, alternative to Coolify. Same category, less mature. Evaluate both, pick one; running
two deployment platforms is worse than either.

---

## AI and development tooling

### Anthropic Claude Cookbooks
`anthropics/claude-cookbooks` · **MIT**

**REFERENCE**, recommended reading. Worked patterns for tool use, RAG, agents and evaluation.
Directly useful for the AI assistance features: suggested replies, summarization, tagging, routing.

### CodeMap AI
`Ayansh0209/CodeMap-Ai` · **MIT** — **IGNORE** for now. Codebase mapping, a developer aid, not product.

### Caveman
`juliusbrussee/caveman` · **Split: MIT for the skill and SDKs; BSL-1.1 for the engine, proxy and runtime**

**IGNORE** for now. Developer tooling.

**Risk:** BSL-1.1 is source-available, not open source. It converts to Apache-2.0 on the earlier of
21 June 2030 or four years after each version ships. Do not treat the MIT half as covering the whole
project.

### Toprank ClaudeCode
`ymys/toprank-claudecode` · licence unverified — **IGNORE** for now.

---

## Summary

**Adopt now (2):** Taste Skill, Google DESIGN.md format — both Claude Code tooling, both permissive.

**Evaluate soon (2):** Coolify for deployment, pdfcn for document output.

**Read before building (4):** Chatwoot before the inbox, Midday before finance UI, Twenty's own
`document-generator` example before quotations, Claude Cookbooks before AI features.

**Rejected with reasons (4):** OpenWA (terms-of-service risk), Logto and Authentik (duplicate
Twenty's identity model), Fluent UI (conflicting design system).

**Miscategorized in the brief (2):** 9router and Hermes WebUI are not omnichannel projects.

**Parked (rest):** CMS, SEO, marketing, document intelligence, developer tooling.
