# Twenty Architecture Audit

Assessment of the Twenty codebase against `/docs/PRODUCT.md`.

Audited revision: `1d83c2e5` (upstream `main`), Twenty version 2.35.x, Nx/Yarn 4 monorepo.

## How to read this

| Label | Meaning |
| --- | --- |
| **VERIFIED** | Read in the source at the cited path, or observed running in the prototype |
| **MEASURED** | Observed in `apps/tll-crm` against a live local Twenty |
| **PROPOSED** | Our design. Not built, not validated |

Sections 2 to 4 and 6.1 to 6.3 are VERIFIED. Section 5 is PROPOSED. Section 6.4 onward mixes both
and says which is which. Section 9 lists what a running prototype established.

---

## 1. Verdict

**Twenty is a good chassis, and the extension mechanism is stronger than the brief assumed.**

Twenty has an application platform ("Twenty Apps") that can declare custom objects and fields,
fields *on Twenty's own standard objects*, sidebar navigation entries, full-page custom screens,
tabs on standard record pages, server-side functions with HTTP/cron/database-event triggers,
public unauthenticated HTTP routes, roles and permissions, AI agents and tools, and views — all as
version-controlled TypeScript, installed with a CLI, with zero edits to Twenty's source.

Everything the MVP in `/docs/PRODUCT.md` §26 needs (Inbox, quotations, invoices, Thai payment
requests) can be built inside that boundary. Three things cannot, and are the real decisions to
make: **Thai language support**, **the front-component UI sandbox's limits**, and **authentication**.

There is also a licensing dimension the brief does not mention, and it is the single most
consequential finding.

---

## 2. Licensing — VERIFIED (read first, it changes the architecture)

`/LICENSE` is not plain AGPLv3. It has three tiers:

| Tier | What it covers | What it means for us |
| --- | --- | --- |
| **MIT** | `twenty-sdk`, `twenty-client-sdk`, `twenty-shared`, `twenty-ui`, `create-twenty-app`, everything under `packages/twenty-apps` | Free to use and modify, proprietary derivatives fine |
| **AGPLv3 + Twenty Application Exception** | `twenty-server`, `twenty-front`, most of the repo | See below |
| **Commercial ("Enterprise")** | 314 files marked `/* @license Enterprise */` | Production use requires a Twenty Enterprise subscription |

### The Application Exception

`/LICENSE` lines 20–53 grant an additional permission under AGPLv3 §7. Paraphrasing the operative
text:

> "Application Interfaces" means the published HTTP APIs (REST and GraphQL) and webhooks; the
> application manifest and configuration formats; logic functions executed by the platform's
> function runtime; front components rendered by the platform's component renderer; and the
> published Twenty SDKs.
>
> An "Application" is a work that interacts with Twenty through the Application Interfaces **and
> that does not otherwise incorporate or modify the source code of Twenty**.
>
> Developing an Application, conveying it, or making it available for interaction over a network
> does not, by itself, cause the Application to be governed by the AGPLv3. You may license your
> Application under terms of your choice, including proprietary terms.
>
> **Limits.** This additional permission does not apply to Twenty itself: if you modify Twenty, the
> AGPLv3, including section 13, applies to your modified version in full.

AGPLv3 §13 is the network clause: anyone interacting with a modified Twenty over a network must be
offered its complete source. For a hosted multi-tenant SaaS, that means **every modification we make
to `twenty-server` or `twenty-front` must be published to our customers**, and any competitor who
signs up can obtain it.

So the brief's guidance "prefer extensions, avoid modifying core" is not just a maintainability
preference here. It is the difference between a proprietary product and a published one. This
should be treated as a hard architectural constraint, not a style preference.

### Enterprise-licensed files

314 files carry `/* @license Enterprise */`. The concentrations matter, because several are things
the brief explicitly asks for:

| Area | Files | Brief requirement it serves |
| --- | --- | --- |
| `core-modules/billing` + `billing-webhook` | 141 | §14 subscription plans |
| `settings/roles` + `settings/security` (front) | 42 | §14 RBAC, MFA, session management |
| `row-level-permission-predicate` (+ flat variant) | 25 | Per-team/per-agent record visibility in the Inbox |
| `core-modules/sso` | 14 | §14 SSO |
| `core-modules/usage`, `event-logs` | 27 | Usage metering, audit trail (§17 "AI actions must be auditable") |

The commercial terms (`/LICENSE` ~line 726) permit copying and modifying these **for development and
testing without a subscription**, but production use requires a valid Enterprise subscription for
the correct host and seat count, and forbids redistribution.

**RESOLVED by D4.** As an internal single-firm system we need none of it: no subscription billing, no
SSO requirement, no usage metering. The community edition suffices.

**One flag remains (O7):** row-level permission predicates are Enterprise, and matter
confidentiality is a genuine use for them. Revisit if it bites.

The AGPL §13 exposure is also now small: our network users are our own staff, so offering them the
source costs nothing. Core modification remains discouraged for **upgrade** reasons (D1), not
commercial ones.

---

## 3. Requirement → existing Twenty functionality — VERIFIED

Mapping `/docs/PRODUCT.md` §3 and §4 against what exists today.

### Covered by Twenty as-is

| Brief requirement | Twenty provides | Location |
| --- | --- | --- |
| Contacts | `Person` — name, emails, phones, jobTitle, linkedinLink, avatar, company, timeline, tasks, notes, attachments, search vector | `packages/twenty-server/src/modules/person/standard-objects/person.workspace-entity.ts` |
| Companies | `Company` — name, domainName, address, annualRevenue, accountOwner, people, opportunities | `modules/company/standard-objects/company.workspace-entity.ts` |
| Deals / Opportunities | `Opportunity` — amount (CURRENCY), closeDate, stage, probability, owner, pointOfContact, company | `modules/opportunity/standard-objects/opportunity.workspace-entity.ts` |
| Pipelines | Opportunity `stage` + kanban views grouped by stage | view/view-group metadata |
| Tasks, Notes | `Task`, `Note` + `TaskTarget`/`NoteTarget` polymorphic join objects | `modules/task`, `modules/note` |
| Activities | `TimelineActivity`, and apps can register their own activity types | `modules/timeline`, `metadata-modules/timeline-activity-type` |
| Custom objects & fields | Full metadata engine, 25 field types incl. `CURRENCY`, `FILES`, `RICH_TEXT`, `MORPH_RELATION`, `RAW_JSON`, `PHONES`, `ADDRESS` | `engine/metadata-modules/object-metadata`, `field-metadata` |
| Views, filtering, sorting, grouping | `view`, `view-field`, `view-filter`, `view-group`, `view-sort` metadata | `engine/metadata-modules/view*` |
| Permissions | Roles, object permissions, field permissions, permission flags, row-level predicates (EE) | `engine/metadata-modules/role`, `object-permission`, `row-level-permission-predicate` |
| Workspaces / multi-tenancy | Postgres **schema per workspace** (`workspace_<base36 uuid>`), plus per-workspace `subdomain` and `customDomain` | `engine/workspace-datasource/utils/get-workspace-schema-name.util.ts`, `core-modules/workspace/workspace.entity.ts` |
| APIs | GraphQL (core + metadata), REST, and MCP | `engine/api/graphql`, `engine/api/rest`, `engine/api/mcp` |
| Webhooks (outbound) | `Webhook` entity with `targetUrl` + operation globs (`*.*`) | `engine/metadata-modules/webhook` |
| Automation | Workflow engine: triggers `DATABASE_EVENT`, `MANUAL`, `CRON`, `WEBHOOK`; actions incl. `record-crud`, `http-request`, `if-else`, `iterator`, `delay`, `filter`, `form`, `mail-sender`, `ai-agent`, `logic-function` | `modules/workflow/workflow-executor/workflow-actions` |
| Email / calendar sync | Gmail, Microsoft, IMAP/SMTP/CalDAV connectors; `Message`, `MessageThread`, `MessageParticipant`, `MessageChannel` | `modules/messaging`, `core-modules/imap-smtp-caldav-connection` |
| Realtime record updates | SSE event stream keeps native record lists live | `engine/subscriptions`, front `modules/sse-db-event` |
| Files / object storage | File storage abstraction with signed URLs, `FILES` field type | `core-modules/file`, `file-storage` |
| Search | Per-object `TS_VECTOR` search fields | `core-modules/search` |
| AI | Agents, skills, tool registry, model routing, AI-agent workflow action | `core-modules/tool`, `metadata-modules/ai` |
| Subscription billing | Stripe integration, `PRO`/`ENTERPRISE` plans, entitlements, metering (**Enterprise-licensed**) | `core-modules/billing` |
| SSO / auth | JWT, API keys, Google, Microsoft, OIDC, SAML, 2FA, approved access domains | `core-modules/auth` |

### Not provided — we build it

Conversations, messages, channel accounts, contact identities, assignment, saved replies, agent
presence, typing indicators; products/services, quotations, invoices, line items, payment requests,
PromptPay/Thai QR, bank transfer flows; accounting provider abstraction; web chat widget.

The existing `Message`/`MessageThread` model is **email-specific** (`headerMessageId`, `subject`,
`isDraft`, `deliveryStatus`, folder associations) and coupled to `ConnectedAccount` sync. Reusing it
for LINE and Meta would mean bending an upstream-owned schema we do not control and cannot extend
without an app anyway. **Do not reuse it — model our own `Conversation`/`Message` as app objects.**
Read it as a design reference for participant matching, nothing more.

---

## 4. The extension mechanism — VERIFIED (this is the important part)

Twenty Apps are declared as TypeScript, built by the SDK CLI, and synced into a workspace. The full
set of things an app can contribute is `Manifest` in
`packages/twenty-shared/src/application/manifestType.ts`:

```
application         objects            fields             indexes
logicFunctions      frontComponents    permissionFlags    roles
skills              agents             connectionProviders
publicAssets        views              viewFields
navigationMenuItems pageLayouts        pageLayoutTabs
commandMenuItems    timelineActivityTypes                 translations
```

The capabilities that matter for us:

**Custom objects and fields** — `defineObject()`, `defineField()`. All 25 field types, relations
(`ONE_TO_MANY`, `MANY_TO_ONE`, `MORPH_RELATION`), `onDelete` behaviour, indexes.

**Fields on Twenty's own standard objects** — `defineField()` with
`STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier`. 28 standard objects are
addressable this way (person, company, opportunity, note, task, message*, calendar*, workflow*,
workspaceMember, …). Example: `packages/twenty-apps/fixtures/rich-app/src/fields/company-can-receive-postcards.field.ts`.
This is how a `Conversation` relates to a `Person` without touching core.

**Sidebar navigation** — `defineNavigationMenuItem()` with type `VIEW`, `OBJECT`, `LINK`, `FOLDER`
or `PAGE_LAYOUT`. `FOLDER` nests children, so the brief's `Inbox → LINE / Facebook / Unassigned /
Teams` tree in §3 is expressible directly.

**Full-page custom screens** — a `PageLayout` of type `STANDALONE_PAGE` containing a
`FRONT_COMPONENT` widget in a `CANVAS` tab, reached by a `PAGE_LAYOUT` navigation menu item. This is
the Inbox screen. Verified: `PageLayoutType.STANDALONE_PAGE` at
`twenty-shared/src/types/page-layout/PageLayoutType.ts`, rendered by
`twenty-front/src/pages/page-layout/StandalonePageLayoutPage.tsx`, `FrontComponentConfiguration` in
`page-layout-widget-configuration.type.ts`, nav item routing in
`modules/navigation-menu-item/display/utils/getNavigationMenuItemComputedLink.ts`.

**Tabs on standard record pages** — `definePageLayoutTab()` targeting
`STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.personRecordPage`. This is the brief's §8 "Conversations"
tab on a contact, in one file.

**Server-side logic functions** — `defineLogicFunction()` with a TypeScript handler and any of:
`httpRouteTriggerSettings` (authenticated HTTP route), `cronTriggerSettings`,
`databaseEventTriggerSettings` (e.g. `people.created`, with optional `updatedFields`),
`serverRouteTriggerSettings` (public webhook, see below), `toolTriggerSettings` (exposes the function
as an AI agent tool), `workflowActionTriggerSettings` (exposes it as a workflow step). Executed by a
driver (`local` child process in dev, `lambda` in production) with the app's environment variables
injected.

**Public unauthenticated routes** — two flavours, both important:

1. `httpRouteTriggerSettings` with `isAuthRequired: false` — a public endpoint that can return
   arbitrary HTML. `packages/twenty-apps/examples/document-generator/src/logic-functions/view-document.ts`
   serves a printable document page this way. This is the mechanism for a customer-facing quotation
   acceptance page and a PromptPay payment page.
2. `serverRouteTriggerSettings` — a public route at `/webhooks/server/:logicFunctionUniversalIdentifier`
   that runs a **resolver** function in the app publisher's workspace, which returns
   `{ targetLogicFunctionUniversalIdentifier, workspaceId, payload }`; the platform then enqueues the
   target function in **that tenant's** workspace with retry and backoff
   (`engine/core-modules/server-route-trigger/server-route-trigger.service.ts`).

   That second one is precisely the multi-tenant channel-webhook problem: **one LINE webhook URL,
   many tenants**, resolved by the LINE `destination` field. It is worth reading the service before
   designing anything else in the omnichannel layer.

**Configuration and secrets** — `applicationVariables` (per-workspace, user-editable) and
`serverVariables` (with `isSecret`, `isRequired`, typed, option lists) on `defineApplication()`.
Provider credentials and per-organization bank details go here, never in code.

**OAuth connections** — `defineConnectionProvider({ type: 'oauth', ... })` with authorization/token
endpoints, scopes, PKCE, revocation, and a post-connect hook. Creates a `ConnectedAccount` in the
tenant's workspace. This is the Meta (Messenger/Instagram/WhatsApp) onboarding path.

**Roles and permissions** — `defineRole()` with object permissions, field permissions, permission
flags and row-level predicates. Apps ship their own default role.

**AI** — `defineAgent()` (prompt, model, response format, bound role) and `defineSkill()` (named
instruction content). Combined with `toolTriggerSettings` on logic functions, the brief's §17 list
(suggested replies, summaries, tagging, routing) is buildable without new infrastructure.

**Distribution** — `yarn twenty dev` for the live-sync dev loop; `yarn twenty plan` prints a
Terraform-style diff; `yarn twenty app:publish --private` deploys a tarball to our own server;
`app:install` installs it. Private deployment does not require npm or the public marketplace.

---

## 5. Minimum architecture — PROPOSED

### 5.1 Shape

There are **two products** on one platform, and the app boundary is what keeps them apart:

- **Takdai** — the SaaS sold to small businesses: unified chat, easy for admins, AI assistance.
- **TLL CRM** — internal to Thailiving Law, Unique X and Pattaya Notary. Not sold.

Thailiving's workspace installs the Takdai apps *and* the TLL app; a Takdai customer installs only
the first two and never sees anything legal. That is brief §28.6 ("the commercial product must remain
industry-neutral") made structural rather than aspirational. It also has to be decided before the
first `app:publish`, because an object cannot be moved between apps afterwards.

```
Twenty (unmodified, upstream-tracking)
│
├── app: tll-crm                 ← our app
│     objects    Conversation, Message, ChannelAccount, ContactIdentity, ConversationAssignment
│     fields     conversations on Person, conversations on Company
│     nav        Inbox (FOLDER) → All / Mine / Unassigned / per-channel views
│     pages      STANDALONE_PAGE "Inbox"  → front component (3-pane UI)
│                personRecordPage tab "Conversations" → front component
│     functions  line-webhook-resolver (serverRoute, public)
│                line-webhook-handler (per-tenant, queued)
│                send-message (httpRoute, authenticated)
│                match-or-create-contact (databaseEvent + tool)
│
├── app: takdai-sales            ← quotations, invoices, payments
│     objects    Product, Quotation, QuotationLineItem, Invoice, InvoiceLineItem,
│                PaymentRequest, Payment
│     fields     quotations/invoices on Opportunity, Person, Company
│     nav        Sales (FOLDER) → Products / Quotations / Invoices / Payments
│     functions  render-quotation-pdf, quotation-accept (public HTML),
│                payment-page (public HTML, PromptPay QR + bank transfer),
│                verify-payment (cron or provider webhook)
│
└── app: tll-crm                 ← installed only in the Thailiving workspace
      objects    Matter, PracticeArea, DocumentChecklist, …
      scope      Thailiving Law, Unique X, Pattaya Notary
```

Three apps, not one. The split is the brief's §15 modularity requirement made enforceable: a
workspace that does not install `tll-crm` cannot see it, and generic code cannot accidentally
depend on it.

### 5.2 Where things live

| Concern | Home | Why |
| --- | --- | --- |
| Contacts, companies, deals | Twenty standard objects | Already correct, and free UI, search, views, permissions |
| Conversations, messages | App custom objects in the tenant's schema | Single source of truth, native views, native permissions, native search |
| Channel provider adapters | Logic functions | Server-side, has secrets, no CORS |
| Provider credentials | `serverVariables` / connection providers | Per-tenant, encrypted, never in code |
| Inbox UI | Front component in a `STANDALONE_PAGE` | Only way to get a non-record-shaped screen |
| Customer-facing pages | Public logic-function routes returning HTML | No separate web app needed for MVP |
| Automation | Twenty workflows over app objects | The brief's §18 examples are all `DATABASE_EVENT` triggers on our objects |

### 5.3 Deliberately *not* a separate service (yet)

The brief's §24 sketches `services/omnichannel/` as its own deployable. For the MVP, keeping
conversations as Twenty objects in the tenant schema buys a large amount for free: record views,
filters, search, permissions, timeline, workflow triggers, the REST/GraphQL API, and SSE-backed
live lists. A separate service would mean reimplementing all of that plus a sync layer, and would
violate rule §28.5 (no two sources of truth).

Extract a service later if and when a concrete pressure appears — sustained high-volume message
ingest, or a channel needing long-lived socket connections. Until then the logic-function runtime
plus the message queue is the omnichannel worker.

### 5.4 The MVP lifecycle, end to end

```
LINE →  POST /webhooks/server/<resolver-uid>          (public, one URL, all tenants)
     →  resolver fn: destination → workspaceId        (runs in publisher workspace)
     →  queued handler fn in tenant workspace         (retry + backoff, built in)
     →  upsert ContactIdentity → match/create Person  (CoreApiClient)
     →  upsert Conversation + Message
     →  agent opens Inbox (STANDALONE_PAGE front component)
     →  reply → send-message fn → LINE Messaging API
     →  create Opportunity (standard object)
     →  create Quotation + line items (app objects)
     →  render-quotation-pdf fn → FILES field
     →  public accept page → Quotation.status = ACCEPTED
     →  workflow: quotation.updated → create Invoice
     →  payment-page fn → PromptPay QR / bank transfer details
     →  verify-payment → Payment record → workflow: mark Opportunity won
```

Every arrow above uses a mechanism that exists today. Nothing in it requires a core change.

---

## 6. Conflicts between the brief and Twenty's architecture — VERIFIED unless noted

Ordered by how much they should change the plan.

### 6.1 There is no Thai locale — blocking for a Thailand-first product

`packages/twenty-shared/src/translations/constants/AppLocales.ts` lists 31 locales. `th-TH` is not
among them, and there is no `th-TH.po` in `twenty-front/src/locales` or the server catalogs.

This is not only a UI-language gap. App translations are typed as
`Partial<Record<AppLocale, ...>>` (`manifestType.ts`), so **our app cannot ship Thai strings until
the platform supports the locale.** The Thai market is the brief's §2 first principle.

Options:

1. **Contribute `th-TH` upstream.** `twenty-shared` is MIT, so no AGPL exposure; the front/server
   catalogs are AGPL but a locale addition is exactly the kind of change upstream accepts. Best
   outcome: no fork, and the constraint disappears. Do this first.
2. **Carry a small patch** adding `th-TH` to the locale list. Touches ~3 files. Cheap to rebase, but
   it is a core modification and therefore an AGPL §13 trigger for a locale list — a trivially
   publishable diff, so the licence cost is near zero, but the merge cost recurs every upgrade.
3. **Ship Thai only in our own UI surfaces** and leave Twenty's chrome in English. Front components
   can carry their own strings independent of Lingui. Ugly for a Thai law firm's staff.

**DECIDED (D8): a Thai UI is a requirement, and it is one line plus a partial catalogue.**

Option 3 is rejected: staff read the whole application, not just our screens, so English chrome with
Thai panels is worse than either extreme.

Adding `th-TH` is **one line** in `AppLocales.ts` (MIT package, no licence consequence). Everything
else derives: the locale picker, validation and `dynamicActivate` all read from that constant.

The cost is translation, not code: 3,931 strings in the front, 2,158 in the server, 67 in emails.
**Lingui falls back to the English source for missing entries, so a partial catalogue works.**
Translate the few hundred strings staff read daily, ship it, and grow the catalogue from use. Nothing
breaks while it is incomplete.

Do option 1 first: contribute the locale upstream, because it removes the divergence entirely. Carry
option 2 meanwhile.

Two consequences worth knowing before this lands:

- App translations are typed `Partial<Record<AppLocale, ...>>`, so **our app can ship Thai strings
  only once the platform knows the locale**. This is the gating item for any Thai string we write.
- The client-facing quotation, payment and booking pages are our own HTML and were never affected by
  `AppLocales`. They can be bilingual today.

### 6.2 The front-component sandbox will not run shadcn/ui — conflicts with §23

Front components execute in a Web Worker at an opaque origin and render through Remote DOM
(`packages/twenty-front-component-renderer`). 120 HTML and SVG elements are bridged, with inline
styles and CSS. But per `docs/developers/extend/apps/layout/front-components.mdx`, and confirmed in
the renderer source:

- `createPortal(node, document.body)` renders nothing while reporting success. **Radix, Headless UI,
  MUI and react-select popovers render nothing by default.** shadcn/ui is Radix. Every dropdown,
  select, dialog, tooltip and combobox in the Inbox is affected.
- `ResizeObserver` and `IntersectionObserver` throw `ReferenceError`. Rules out recharts
  `ResponsiveContainer`, Floating UI `autoUpdate`, and most virtualized-list libraries — and the
  Inbox conversation list wants virtualization.
- `ref.current.focus()`, `.click()`, `.scrollIntoView()`, `video.play()` all throw.
  `document.activeElement` is always `undefined`. Keyboard-first UX (§23) needs care.
- `<canvas>` renders nothing, silently. Use SVG.
- Component CSS is injected into the host page's `<head>` **unscoped** — class names collide with
  Twenty's, and bare element selectors leak into the whole app. Prefix everything.
- `@media` matches the browser window, not the widget. Use `@container`.
- `document.addEventListener` / `window.addEventListener` register without error and never fire — so
  a drag stops the moment the pointer leaves its element.
- Most failures are **silent**, and TypeScript does not catch them because the scaffold is typed
  against the full DOM.

The docs carry an explicit "under active development" warning.

Consequences for the plan:

- `twenty-ui` covers the non-overlay half of the component problem (see §6.8), so this is narrower
  than it first appears. But budget for hand-built **overlay** primitives — dropdown, combobox,
  modal, tooltip — plus a virtualized list, all portal-free and observer-free. The brief's §23
  "use an existing component system rather than rebuilding basic UI primitives" holds for buttons,
  tags and typography, and does not hold for anything that floats above the page.
- Prefer native Twenty surfaces wherever the data is record-shaped. A conversation *list* can be a
  Twenty view with filters, search, permissions and live SSE updates for free; only the message
  thread pane genuinely needs a front component. A hybrid Inbox (native list + front-component
  thread) is less custom UI and more native feel than a fully custom three-pane screen.
- **Milestone 2 must be a real spike, not a mockup.** Build the fake Inbox with the actual
  interactions (select a conversation, type a reply, open a dropdown, scroll a long list) and find
  out where the sandbox bites. That is the point of the prototype.

### 6.3 Realtime inside a front component is unsolved

Twenty's own record lists stay live over SSE (`engine/subscriptions` + front `modules/sse-db-event`).
That is host-side. Inside the sandbox, the documented network primitive is `fetch`; the renderer
provides no `WebSocket` or `EventSource` bridge, `BroadcastChannel` is unavailable, and the worker's
opaque origin makes a credentialed `EventSource` unlikely to authenticate.

So a fully custom Inbox pane must **poll**. For an inbox, a few seconds is probably acceptable, but
it undermines "typing indicators" and "agent presence" from §6. This is a second, independent
argument for the hybrid approach in 6.2: native record views get realtime for free.

Confirm the exact behaviour during the prototype rather than trusting this paragraph.

### 6.4 Logto conflicts with Twenty's identity model — recommend dropping it for now

§14 proposes evaluating Logto. Twenty already owns identity: `User`, `UserWorkspace`, `Workspace`,
`WorkspaceMember`, roles, invitations, API keys, 2FA, and SSO via OIDC and SAML
(`core-modules/auth`). The entire permission system, the workspace schema resolution, and the
row-level predicates all key off Twenty's user model.

Replacing it with Logto means modifying `twenty-server` deeply — the worst possible place from both
the AGPL §13 and the upgrade-friction perspectives.

Twenty's OIDC support means Logto *could* sit in front as an identity provider without a fork. But
for the MVP that adds a moving part and a second user directory for no benefit the brief actually
needs. Recommendation: **use Twenty's auth; revisit only if a specific requirement (a shared identity
across Takdai + TLLACC, or an enterprise SSO deal) forces it.** Note that Twenty's SSO module is
Enterprise-licensed.

### 6.5 Quotation and invoice modelling has no native line-item primitive

There is no repeating-group or line-item field type. Line items must be a child object with a
`MANY_TO_ONE` relation back to the quotation (`QuotationLineItem`), which Twenty renders as a
related-records table on the record page. That works, but composing a quotation means creating N+1
records, and the native record UI is not a great line-item editor.

The realistic answer is a front component for quotation editing that writes line items through
`CoreApiClient` — with §6.2's caveats about how much UI we have to hand-build.

`CURRENCY` fields store an amount plus a currency code, so Thai baht is fine. Tax is our own field;
Twenty has no tax concept.

### 6.6 PDF generation is unsolved but has a precedent

No PDF library in the server. `packages/twenty-apps/examples/document-generator` solves the same
problem inside an app: rich-text templates with `{{placeholders}}`, a public logic-function route
rendering a printable HTML page, and PDFs saved back to the record — with no external API and no
per-document cost. **Read this app before designing quotation/invoice output.** It is close to a
direct answer to brief §9 and §20.

### 6.7 Row-level permissions are Enterprise-licensed

"Unassigned" / "My conversations" / "Teams" (§6) as *filters* need nothing special. As *security
boundaries* — an agent must not read another team's conversations — they need row-level permission
predicates, which are Enterprise. Decide whether inbox scoping is a view convenience or an access
control guarantee, and price accordingly.

### 6.8 Design language: better than expected, but only for the simple half

`twenty-ui` **is** usable inside front components. It is MIT, bundled at build time, and the
scaffolder wires it in by default. It gives us `Button`, `Tag`, `Status`, `Chip`, `Avatar`,
`Callout`, `Banner`, the `H*Title`/`Label` typography set, and the full tree-shakeable `Icon*` set —
all of which resolve their colours against the workspace's active light/dark theme automatically.
`useTheme()` from `twenty-ui/theme-constants` returns Twenty's real design tokens (spacing, colours,
radii, fonts) for our own inline styles, with no provider setup.

That substantially reduces the "doesn't feel native" risk against brief §2. Use `useTheme()` tokens
everywhere instead of hard-coded hex values, and never hand-roll a component `twenty-ui` already
ships.

What it does **not** solve is the overlay half. `twenty-ui` depends on `@base-ui/react`, which
portals its popovers, and portals render nothing in the sandbox (§6.2). So dropdowns, selects,
comboboxes, dialogs and tooltips still need bespoke, portal-free implementations. Build those once
in a shared internal module, styled from `useTheme()`, and reuse them across every front component.

Import from subpaths (`twenty-ui/input`, not `twenty-ui`), and avoid `IconsProvider` / `useIcons` /
`iconsState`, which pull in several MB of Tabler icons.

Pin `twenty-ui` to the version the target Twenty instance ships (`1.0.0-alpha.1` today). It is
alpha, so treat its API as unstable across Twenty upgrades.

### 6.9 Smaller frictions

- **Cross-origin `fetch` from a front component** sends `Origin: null` — third-party APIs only answer
  with `Access-Control-Allow-Origin: *`. Call third parties from logic functions. Provider secrets
  belong there anyway.
- **Sandbox storage caps**: 512-char keys, 262,144-char values, 1,048,576 chars per app per user.
  Fine for UI state, not a message cache.
- **Publishing requires a strictly increasing `package.json` version** (`VERSION_ALREADY_EXISTS`,
  `CANNOT_DOWNGRADE_APPLICATION`). The local `yarn twenty dev` loop does not. Do not mix them.
- **Logic function timeouts** are per-function (`timeoutSeconds`). Provider calls need explicit
  budgets.
- **No `th` number/date formatting helpers**; Buddhist-era dates, if needed, are ours.
- **Web chat widget** (§7) has no host in Twenty. It is a separate static asset + a public logic
  function route. Fine, but it is the first genuinely external piece.

---

## 7. Changes that would make upstream upgrades painful — PROPOSED guidance

Ranked worst to least.

1. **Editing `twenty-server` or `twenty-front` module code.** Triggers AGPL §13 for the whole
   modified version and produces recurring merge conflicts in the fastest-moving parts of the repo.
   Never do this for product features.
2. **Adding columns to Twenty's standard workspace entities in code** (as opposed to via app
   `defineField`). Standard objects are generated from `*.workspace-entity.ts` and reconciled by the
   workspace migration engine; a hand-edited entity fights that engine on every upgrade.
   `defineField` against `STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS` does the same job, supported.
3. **Forking the `Message`/`MessageThread` model for omnichannel.** Couples us to an upstream schema
   that changes with Gmail/IMAP work, for no gain over our own objects.
4. **Patching `twenty-front` navigation, routing or the record page shell.** All three have
   supported app-level equivalents (`defineNavigationMenuItem`, `STANDALONE_PAGE`,
   `definePageLayoutTab`). If a designer asks for something these cannot do, change the design before
   changing the shell.
5. **Editing `.po` catalogs or `AppLocales`.** Small and mechanical, but `lingui extract` regenerates
   catalogs with thousands of lines of churn (see the upstream section of `CLAUDE.md`), so locale
   patches conflict noisily. Upstreaming `th-TH` avoids this entirely.
6. **Editing `CLAUDE.md` at the repo root** (which this change does). Trivial, but it will conflict
   on every upgrade. Kept deliberately: the project rules must be the first thing an agent reads.

Rules of thumb:

- Product code lives in apps. Core changes are only for things with no extension point, and each one
  needs a written justification and, where possible, an upstream PR.
- Track `upstream/main` continuously, not in six-month jumps.
- `yarn twenty plan` before every sync so metadata drift is visible rather than discovered.

---

## 8. Recommended next steps

**Milestone 1 — prove the chassis (this document, plus a running instance).**
Run `bash packages/twenty-utils/setup-dev-env.sh` and `yarn start` against an unmodified checkout.
Create a Thailiving Law workspace. Confirm custom objects, custom fields on `Person`, a saved view,
role assignment, and the REST/GraphQL APIs by hand.

**Milestone 2 — the Inbox spike.** Built: `apps/tll-crm`. It ships the four omnichannel
objects, a `conversations` relation on the standard `Person`, a `STANDALONE_PAGE` Inbox reached from
a sidebar folder, a `Conversations` tab on `personRecordPage`, native record views over the same
data, and a seed function so a fresh workspace has content.

It is a spike, not a mockup: it reads and writes real records through `RestApiClient` and carries a
hand-rolled dropdown and an on-screen fetch-timing readout specifically to answer the sandbox
questions. `apps/tll-crm/SPIKE.md` is the checklist to fill in while running it. Those answers
decide how much of the Inbox stays a front component and how much becomes native views.

**Milestone 3 — LINE-shaped data.** Replace the seed function with an ingest path, still no live
channel: prove contact matching and the `ContactIdentity` → `Person` resolution.

**Milestone 4 — LINE OA.** `serverRouteTriggerSettings` resolver + per-tenant handler, prove
`LINE → Inbox → Person → reply → LINE`.

**Milestone 5 — quotations → invoices → PromptPay**, starting from the `document-generator` example.

Explicitly out of scope until milestone 5 lands: Midday, FlowAccount, CMS, AI agents, Plausible,
document extraction, HR, TLLACC integration.

---

## 9. Decisions needed from the business

1. **Twenty Enterprise subscription — yes or no?** Determines whether we get billing, SSO, row-level
   permissions and audit logs, or build around them. Get a quote for a multi-tenant deployment.
2. **Is inbox team-scoping an access-control guarantee or a view filter?** Drives (1).
3. **Thai locale:** upstream PR, local patch, or English chrome for launch?
4. **Logto — drop for MVP?** Recommendation is yes.
5. **One app or three?** Recommendation is three; it is much cheaper to decide now than after the
   first publish.

---

## 9b. Prototype results — MEASURED

`apps/tll-crm` was built and run against a local Twenty 2.35 to test the claims above. What a
running instance established:

### Confirmed working

| Claim | Result |
| --- | --- |
| App objects, fields on standard `Person` / `WorkspaceMember` | 228 metadata entities created in one sync |
| `STANDALONE_PAGE` + `FRONT_COMPONENT` widget + `PAGE_LAYOUT` nav item | Full-page custom Inbox renders in the sidebar |
| `definePageLayoutTab` on `personRecordPage` | Conversations tab appears on the Person record and loads |
| `twenty-ui` inside a front component | `Button`, `Tag`, `Status`, `Avatar`, icons and `useTheme()` all render correctly in dark mode |
| Reads and writes via `RestApiClient` | Reply box creates a record and it appears in the thread |
| Logic function with `httpRouteTriggerSettings` | Seed function creates records across three objects |
| Portal-free overlay | The dropdown **menu renders**, so hand-built overlays are viable |

### Measured

- **REST fetch latency: 25ms** for 3 conversations with `depth=1`. Not yet measured at 500.
- Poll interval 5s. Native Twenty views update over SSE and are visibly fresher.

### Open defect (ours, not the platform's)

The channel filter dropdown opens but its options are inert: no hover feedback, clicks do nothing.

Diagnosis: `src/ui/Dropdown.tsx` closes on `onBlur`, which fires on mousedown, unmounting the menu
before the option's `onClick` lands. The same code would misbehave in a plain browser. Hover
feedback was simply never written.

**This is not evidence that overlays are impossible in the sandbox.** The menu rendered, which was
the real question. Fix by selecting on mousedown instead of click.

### Thai content handling — VERIFIED

Distinct from UI localization, and the part that actually matters: customers write to us in Thai.

| Concern | Status |
| --- | --- |
| Storage and display of Thai text | Works. Postgres and the browser need nothing from us |
| Font | **Gap.** Twenty's stack is `Inter, sans-serif`; Inter has no Thai glyphs. Our components need `Inter, "Noto Sans Thai", sans-serif` and extra line height where Thai appears |
| Search | **Broken for Thai.** See below |

**Search does not work on Thai.** Twenty builds its index with `to_tsvector('simple', ...)`
(`engine/metadata-modules/flat-search-field-metadata/utils/compute-search-vector-as-expression-from-search-field-metadatas.util.ts`)
and queries it with `to_tsquery('simple', ...)`
(`engine/core-modules/search/services/search.service.ts`).

The `simple` configuration tokenizes on whitespace. Thai does not put spaces between words, so a
Thai sentence indexes as a single token and no word inside it is findable.

Consequences:

- **In our own app screens:** avoidable. Use REST `contains` / `ilike` filters for search boxes
  instead of the search vector. Substring matching has no word-boundary concept, so it works on Thai.
- **In Twenty's native search** (People, Companies, command menu): not avoidable from an app. Fixing
  it means installing a Thai-capable tokenizer extension on the Postgres server (`pg_bigm` or an
  ICU-based tokenizer) and changing the text search configuration. That is server configuration, not
  a code change, but it is a deployment divergence to record.

Decide which is needed: Thai **message text** search (solvable in our app) or Thai **contact name**
search in the CRM (needs the Postgres extension).

### Additional verified findings

Established after the first audit pass, and load-bearing for [`MATTERS.md`](./MATTERS.md).

**Calendar views are native.** `ViewType` includes `CALENDAR` and `CALENDAR_WIDGET`, with
`ViewCalendarLayout` of `DAY` / `WEEK` / `MONTH`. Any object with a date field renders on a calendar,
as a full view or a dashboard widget. **Group and per-staff calendars are view configuration, not
custom UI.** This removes what looked like the most expensive part of the booking feature.

**Twenty can create calendar events**, not only sync them: a `create-calendar-event` workflow action
exists at `modules/workflow/workflow-executor/workflow-actions/create-calendar-event/`. So confirmed
bookings can be pushed to staff Google Calendars.

**But `CalendarEvent` is a sync mirror, not a booking record.** It carries `iCalUid`,
`externalCreatedAt`, `externalUpdatedAt` and `calendarChannelEventAssociations`. Same trap as
`Message` for omnichannel. Own a `Booking` object instead (D5).

**Standard object labels are editable.** `updateObject` accepts `labelSingular`, `labelPlural`,
`nameSingular`, `icon` and `isActive`, with no guard restricting standard objects. So Twenty's sales
vocabulary can be reshaped into a law firm's through configuration alone.

**But `nameSingular` is the API contract.** Renaming `opportunity` breaks `/rest/opportunities`.
There is an `isLabelSyncedWithName` flag that keeps label and name in step by default; **turn it off
on anything relabelled** (D6).

**Tasks are real work items.** `Task` has `title`, `dueAt`, `status`, `assignee`, attachments and
timeline activities. `TaskTarget` is polymorphic with `targetPerson`, `targetCompany`,
`targetOpportunity` **and a `custom` slot**, so tasks attach to our own objects. No need to build a
work-item type.

### Windows toolchain findings

Three real obstacles, all now documented in `apps/tll-crm/README.md`:

1. Twenty's longest tracked path is **241 characters**; a full checkout exceeds Windows' 260 limit
   and aborts. Sparse-checkout of the app alone (92 characters) avoids it.
2. **The SDK emits backslash paths on Windows** (`path.relative`), and the server rejects any
   resource path containing one. Every sync from Windows fails until patched. Upstream bug; worth
   reporting.
3. The server builds the logic-function dependency layer by running `yarn install` against the app's
   `package.json` **inside its container**, where only `package.json` and `yarn.lock` exist. A
   `postinstall` referencing a local script makes every logic function fail at runtime with
   `ROUTE_TRIGGER_PLATFORM_ERROR`. **Nothing in an app's `package.json` may reference a file the
   server does not copy.**

Finding 3 is an architectural constraint, not a footnote.

---

## 10. Key files

| Topic | Path |
| --- | --- |
| Licence, incl. Application Exception | `LICENSE` (lines 1–55 and ~726) |
| App manifest, the definitive capability list | `packages/twenty-shared/src/application/manifestType.ts` |
| SDK `define*` helpers | `packages/twenty-sdk/src/sdk/define/` |
| App docs | `packages/twenty-docs/developers/extend/apps/` |
| Front-component sandbox limits | `packages/twenty-docs/developers/extend/apps/layout/front-components.mdx` |
| Multi-tenant public webhook dispatch | `packages/twenty-server/src/engine/core-modules/server-route-trigger/server-route-trigger.service.ts` |
| Widget configuration types | `packages/twenty-shared/src/types/page-layout/page-layout-widget-configuration.type.ts` |
| Standard object identifiers for apps | `packages/twenty-shared/src/metadata/constants/standard-object-universal-identifiers.constant.ts` |
| Standard page layout identifiers | `packages/twenty-shared/src/metadata/constants/standard-page-layout-universal-identifiers.constant.ts` |
| Reference app using most of the SDK | `packages/twenty-apps/examples/document-generator/` |
| Reference app exercising every manifest entity | `packages/twenty-apps/fixtures/rich-app/` |
| Locale list (no `th-TH`) | `packages/twenty-shared/src/translations/constants/AppLocales.ts` |
| Front component renderer | `packages/twenty-front-component-renderer/` |
| Timeline activity types (client history) | `packages/twenty-shared/src/application/timelineActivityTypeManifestType.ts` |
| Our prototype and its spike checklist | `apps/tll-crm/`, `apps/tll-crm/SPIKE.md` |
