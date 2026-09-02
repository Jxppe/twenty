# Rebuild plan for Frappe

Companion to `00-BRIEF.md` and `01-DATA-MODEL.md`. `schema.json` is the machine-readable version of the data model.

One custom app on the bare Frappe framework. Nothing else installed. `00-BRIEF.md` records why ERPNext was rejected and what would reverse that.

## Bootstrap

**Nothing is forked, and nothing is cloned into an empty repo.** A Frappe custom app is not a fork. `bench new-app` generates the app *and* git-inits it, so `apps/tll_crm` is the repo. Create an empty GitHub repo with no README or licence, and push the scaffold up to it afterwards.

`frappe_docker` is throwaway infrastructure that lives somewhere else entirely and is never pushed to.

```
~/dev/frappe_docker/          Frappe's repo, throwaway
  .devcontainer/
  development/                git-ignored, mounted into the container
    frappe-bench/             created by bench init
      apps/
        frappe/               the framework, cloned by bench
        tll_crm/              the only repo we own
      sites/
        tll.localhost/
```

Do not clone Frappe CRM to build on. Clone it separately, in a folder you never build in, if you want to read its frappe-ui code as a reference.

On the host:

```bash
git clone https://github.com/frappe/frappe_docker.git
cd frappe_docker
cp -R devcontainer-example .devcontainer
cp -R development/vscode-example development/.vscode
# open in VSCode, "Reopen in Container"
```

Inside the container, as the `frappe` user. The `set-config` lines are not optional: without them bench looks for MariaDB and Redis on localhost and fails.

```bash
cd /workspace/development
bench init --skip-redis-config-generation --frappe-branch version-16 frappe-bench
cd frappe-bench

bench set-config -g db_host mariadb
bench set-config -g redis_cache redis://redis-cache:6379
bench set-config -g redis_queue redis://redis-queue:6379
bench set-config -g redis_socketio redis://redis-queue:6379

bench new-site --mariadb-user-host-login-scope=% tll.localhost
bench new-app tll_crm
bench --site tll.localhost install-app tll_crm
bench start
```

Then push the app:

```bash
cd apps/tll_crm
mkdir docs                    # the four md files plus schema.json; CLAUDE.md at the root
git add -A
git commit -m "Scaffold tll_crm with migration brief and data model"
git remote add origin https://github.com/<owner>/tll_crm.git
git push -u origin main
```

`version-16` is current stable and `version-15` is still maintained. Nothing here constrains the choice, since ERPNext is not installed.

**The app is `tll_crm`, with an underscore.** Frappe app names must be valid Python module names, and the directory under `apps/` has to match. Name the GitHub repo `tll_crm` too so the two never drift.

`frappe/frappe` and `frappe/bench` are dependencies that bench manages. The entire codebase lives in `apps/tll_crm/`. Everything else in the bench folder is machinery that can be thrown away and recreated.

## App shape

```
apps/tll_crm/tll_crm/
  crm/doctype/         client, job, practice_area, billing_entity, booking,
                       job_deadline, required_document
  work/doctype/        work_log, timeline_entry
  billing/doctype/     service, quotation, quotation_line, invoice, invoice_line, payment
  intake/doctype/      contact_identity
  intake/api.py        the chat-platform intake endpoint
  print_format/        quotation, invoice
  public/frontend/     frappe-ui SPA
```

See the client model below before writing any of it. It is the one place this deliberately diverges from the Twenty model.

## The client model

Get this right first. Everything links to it.

**Twenty's shape is an artifact, do not copy it.** Twenty has `person` and `company` as separate built-in objects, which is why `quotation` and `invoice` in `01-DATA-MODEL.md` each carry *both* a `person` link and a `company` link. Every query and every report then has to coalesce two nullable fields, and nothing prevents a record having both set or neither. Frappe does not force that, so collapse it.

**`Client`, one doctype, the party.** A `client_type` Select of `INDIVIDUAL` or `ORGANIZATION` drives which fields show.

| field | applies to | note |
|---|---|---|
| `client_type` | both | INDIVIDUAL or ORGANIZATION |
| `status` | both | LEAD, ACTIVE, INACTIVE. A lead is a client we have not confirmed, not a separate table |
| `client_name_en`, `client_name_th` | both | both print on documents, neither is derivable from the other |
| `legal_name_en`, `legal_name_th` | organization | registered name exactly as it must appear on an invoice |
| `tax_id` | organization | Thai taxpayer identification number |
| `id_number`, `nationality` | individual | passport or Thai ID. A visa practice cannot work without these |
| `default_billing_entity` | both | overridable per job |
| address | both | Frappe's stock Address doctype, linked |

Job, Work Log, Booking, Quotation and Invoice each get **one** `client` Link field, not two.

**On Work Log and Booking the `client` link is required and the `job` link is optional.** Work arrives before a job exists, and an entry with no client is invisible on the client page, which is the whole point of the system.

**Frappe's stock `Contact` for the humans**, with a plain Link field to Client and `contact_name_th` added as a Custom Field.

- An organization client has several contacts. An individual client has exactly one, created alongside them in the same form.
- You inherit Contact's email and phone child tables, and Frappe's communication features already expect Contact.
- **`contact_identity` links to Contact, not to Client.** A LINE handle belongs to a person, not to a company. Routing it through Contact is what lets intake resolve a handle to a human and the human to a client without a Dynamic Link. Do not use Dynamic Links here.
- `contact_identity` carries `channel`, `external_id`, `display_name` and **`chat_url`**, the deep link that opens the conversation in the chat platform.

The cost is one extra record per individual client. Accept it. It is the same shape ERPNext uses for Customer plus Contact, so it is well-trodden in Frappe, and it is what lets intake resolve a chat handle to a client without a Dynamic Link.

Do not use Frappe's `Customer` doctype. It belongs to ERPNext and drags a party ledger with it.

## The client timeline

The feature the system is judged on, and the one place where a naive implementation will not hold up.

Entries come from doctypes with different date fields: work log uses the day worked, booking uses its start time, an intake event uses when it arrived, invoice uses issue date. Querying six doctypes per client page and merging in Python is fine at 6 clients and miserable at 600.

**`Timeline Entry`, append-only, written by controller hooks and never by hand.**

| field | note |
|---|---|
| `client` | Link, required, indexed |
| `job` | Link, optional, indexed |
| `occurred_at` | Datetime, the business time rather than creation time, indexed |
| `entry_type` | Select: WORK_LOG, BOOKING, MESSAGE, NOTE, DOCUMENT_RECEIVED, QUOTATION_SENT, INVOICE_ISSUED, PAYMENT_RECEIVED, DEADLINE_SET, DEADLINE_MET |
| `summary` | Data, one prerendered line |
| `source_doctype`, `source_name` | the real record, for click-through |
| `staff` | Link, who did it |

Index on `(client, occurred_at desc)`. The client page is one query. The job page is the same query with a job filter. "What happened this week" is the same query again.

**It is a projection, not truth.** Every entry is derivable from its source record, so a rebuild patch can regenerate the table wholesale if it drifts. Never put anything in it that does not exist somewhere else. Write entries from one shared helper called by each source doctype's `after_insert` and `on_update`, so the summary formatting lives in one place.

Frappe's built-in per-document timeline of comments, emails and field changes still works and is not replaced. Timeline Entry is specifically the cross-doctype roll-up onto the client.

## Type mapping

| Twenty type | Frappe fieldtype | note |
|---|---|---|
| TEXT | Data, or Small Text / Text for long values | |
| RICH_TEXT | Text Editor | |
| NUMBER | Int or Float | `workLog.minutes` is Int, `taxRate` is Float (percent) |
| BOOLEAN | Check | |
| DATE_TIME | Datetime | |
| DATE | Date | `workLog.workedOn` is a Date deliberately, it is the day the work happened |
| SELECT | Select | one option per line, store the uppercase value, label in the translation file |
| CURRENCY | Currency | decimal, not micros. There is no data to convert |
| FILES | Attach, or a child table of File links where more than one is needed | `quotation.pdf` allows 5, `requiredDocument.file` allows 10 |
| RELATION MANY_TO_ONE | Link | |
| RELATION ONE_TO_MANY | reverse Link shown as a dashboard connection, or a Table where the child has no life of its own | |
| FULL_NAME | two Data fields plus a `full_name` set in `before_save` | |
| EMAILS / PHONES / LINKS | Data with the matching Frappe options (Email, Phone, URL) | all capped at 1 in the current model |
| ADDRESS | Frappe's stock Address doctype, linked | |
| ACTOR | Frappe's `owner` / `modified_by` | drop the field |

Line items are the one deliberate divergence. `quotationLineItem` and `invoiceLineItem` become **child tables** (`istable: 1`) on their parents rather than standalone doctypes. They have no independent existence, they already cascade on delete in Twenty, and child tables give you the grid editor for free.

Notes and tasks are Frappe's stock `Comment` and `ToDo`. Do not rebuild them.

## Server-side logic

All of it in doctype controllers, which is the thing Twenty had nowhere to put.

Work log:
- `minutes` is the stored unit. Any hours figure anywhere is a display conversion, never a column.
- A work log with a `booking` inherits that booking's job and client unless explicitly set.
- Default `billing_entity` comes from the job, and the job's comes from its practice area.

Billing:
- `QuotationLine.lineTotal` = quantity x unitPrice - discount. Recompute in the parent's `validate`.
- Quotation and Invoice `subtotal`, `tax`, `total` from the lines. `tax` sums per line at that line's own `taxRate`, not one rate on the header.
- `Invoice.amountPaid` = sum of confirmed payments. Recompute in Payment's `on_update` and `on_trash`.
- `Invoice.status` derives from `amountPaid` against `total` and `dueDate`. Only DRAFT, VOID and manual transitions are set by hand.
- Accepting a quotation stamps `decidedAt` and creates the invoice by **copying** the lines, not linking them.

Intake:
- Intake deduplicates on `event_id`. See the intake section.

## Intake from the chat platform

Conversations live in a dedicated chat platform, with [Chatwoot](https://github.com/chatwoot/chatwoot) the leading candidate. This system never renders an inbox, stores a message body, or talks to LINE or Meta. The chat platform pushes when a lead is confirmed or a booking is requested, and staff click back into the conversation from the client record.

Keep this endpoint channel-agnostic and free of any vendor's field names, so the chat platform can be swapped without touching the CRM.

One whitelisted method:

```
POST /api/method/tll_crm.intake.api.receive
Authorization: token <api_key>:<api_secret>
```

Authenticate with a Frappe API key and secret on a dedicated integration user holding a narrow role, not Administrator.

Payload:

| field | note |
|---|---|
| `event_id` | required, stable per event. The idempotency key |
| `channel` | LINE, FACEBOOK, INSTAGRAM, WHATSAPP, EMAIL, WEBCHAT |
| `external_contact_id` | the provider handle, e.g. the LINE user id |
| `display_name` | as the provider reports it |
| `phone`, `email` | when known |
| `chat_url` | deep link that opens this conversation in the chat platform |
| `note` | free text summary from whoever confirmed the lead |
| `wants_booking`, `preferred_time` | optional |

Behaviour, in order:

1. Reject a duplicate `event_id` and return the previous result. **Not optional.** Webhooks retry, and without this a network hiccup creates duplicate clients.
2. Find `contact_identity` by `(channel, external_id)`, or create it with the `chat_url`.
3. Find its Contact, or create one, and a Client with `status = LEAD`.
4. If `wants_booking`, create a Booking with `status = REQUESTED`.
5. Write a Timeline Entry carrying the note and the `chat_url`.
6. Return the client id so the chat platform can store it and stop re-sending.

Two capabilities required of whatever sits on the other side: it can call a webhook on those events, and its per-conversation URL is stable. If it cannot push, fall back to a scheduled pull or to staff pasting links, both worse but workable.

Provider onboarding, not software, is the long pole. Messenger and Instagram need a Meta app, business verification and app review; LINE needs an Official Account and a Messaging API channel. Weeks of paperwork, identical whatever inbox is chosen, and it should be started long before this endpoint is needed.

## Numbering

Quotation and Invoice need a sequence per billing entity, with no holes. Frappe's `naming_series` is per doctype, not per link field, so this needs an `autoname` controller method that reads the billing entity's own prefix and counter, taking a row lock on the Billing Entity document so concurrent submits cannot collide.

Never delete a numbered document. Cancel it, keep the number, mark it VOID. That is what gap-free means.

Do not use `hash` or `format:` naming with a plan to renumber later.

## The frontend

Desk covers everything and nothing here needs a frontend to be usable. Two screens are worth building anyway, in this order, both after the data model is settled.

**The client page, the flagship.** This is what the system is for. One screen showing identity and contact details, the contact people, every job for this client with its status, and the merged timeline from `Timeline Entry`, filterable by type and by job. Open items surfaced without hunting: outstanding deadlines, documents still owed, unpaid invoices. Everything on it is one indexed query plus the jobs list.

**Fast work log entry, second.** Everyone touches it every day and the system succeeds or fails on whether logging 20 minutes takes ten seconds. A Desk form with eight fields and four Link lookups is not that. It does not need to be its own screen: a panel on the client and job pages is better, because it puts logging where the context already is. Pick a job, type one line, set minutes, billable on or off, save, repeat. Recent jobs cached client side, keyboard driven, no reload between entries. Plus a week view of your own logs for correcting yesterday.

There is no third screen. The inbox was going to be one, and it now lives in the chat platform.

Everything else stays in Desk until someone complains about a specific screen.

## Build order

The spine is **Client, then Job, then the things that happen to them**. Build enough of that to fill a timeline, then build the client page, which is the point of the system.

1. **Client and Contact.** The centre of the system. Thai name fields, both client types, `status` for LEAD, one contact created alongside each individual client.
2. **Billing Entity and Practice Area.** Small reference data, but Job needs both.
3. **Job**, linked to Client, with the practice area driving the default billing entity.
4. **Work Log and Timeline Entry together.** Work log is the first timeline feed, so build the shared write helper here and get its shape right before the others call it.
5. **Booking, Job Deadline, Required Document**, each writing timeline entries through the same helper.
6. **The client page** in frappe-ui. By now there is a real timeline to render and a real job list to show.
7. **Fast work log entry**, as a panel on the client and job pages.
8. **Contact Identity and the intake endpoint.** Small, and it can move earlier if the chat platform is ready before the firm is.
9. **Billing.** Service, Quotation with its line table, per-entity numbering, print format with a Thai font proven first. Then Invoice, Payment, and the status derivation. All three write timeline entries. FlowAccount reference fields are plain Data plus a URL, no integration.

Everything except steps 6 and 7 is usable in Desk with no frontend work at all.

## Naming

The doctype is **`Job`**. Twenty labels it "Job" throughout and the firm's staff are Thai, so "Matter", the English legal term, is the wrong word on screen even though it is the industry standard elsewhere.

`Job` is also the technically safer of the two candidates. `CASE` is a reserved word in MariaDB, so a fieldname `case` needs backticking in every hand-written query. `Job` has no such collision. Its overlap with Frappe's background jobs is only in prose, never in a doctype name.

In Twenty this object is `opportunity` with a "Job" label. `01-DATA-MODEL.md` is a factual dump of the Twenty workspace and still says `matter` on the link fields and `matterDeadline` on the deadline object, because that is what is really there. Read those as `job` and `Job Deadline`.

Doctype names are expensive to change once links point at them. Display labels are not: in Frappe the label is separate from the name and goes through the translation file, so it can change any day, including into Thai if the UI is ever translated.