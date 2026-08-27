# Jobs, Work and Scheduling

How the firm's actual work is modelled. Status: **PROPOSED**. Nothing built.

Read [`DECISIONS.md`](./DECISIONS.md) D5, D6 and D7 first.

---

## 1. The reframe

Twenty ships `Opportunity`: amount, stage, close date, probability, owner. That is a **forecast
record**. It answers "how much might we make, and when".

A law firm needs a **work record**. It answers "what are we doing for this client, what is blocking
it, and what happens next".

Same table underneath. Completely different page.

Everything in this document follows from that. If a field only exists to support a sales forecast,
it does not belong on the page. If a field tells someone what to do next, it belongs at the top.

---

## 2. The Job page

The target. Ordered by what someone opening it actually needs.

```
Somchai Prasert · Retirement visa · Unique X Services
Status: Waiting on client        Opened 12 Mar     Owner: Nok

Outstanding from client
  Bank statement (3 months)      requested 4 days ago
  Passport copy                  received

Next deadline
  Visa expiry: 18 Apr (24 days)

Open work
  Draft application form         Nok       due Fri
  Book immigration appointment   Preecha   due Mon

Recent activity
  Nok logged 1.5h, client call re: financials     yesterday
  Preecha uploaded TM.7 form                       Tue
  Quotation accepted                               12 Mar

฿35,000 quoted · ฿35,000 invoiced · ฿17,500 paid
```

Blocking items first. Money last. Nothing about probability.

Buildable with `definePageLayout` on the Job object: a `VERTICAL_LIST` tab with `FIELD`,
`RECORD_TABLE` and `TIMELINE` widgets. Some panels may need a front component; most will not.

---

## 3. Objects

**Labels say Job. Identifiers say matter.** The object we relabelled is Twenty's `opportunity`, and
our own objects were named `matterDeadline` and so on before the vocabulary settled. Renaming a
synced object or field is a destructive metadata change, and the identifiers are internal: no user
ever sees `matterDeadlineId`. So the names stay and the labels are what moved.

If that ever becomes confusing enough to be worth a migration, it is a rename plus a data move, not
a label edit.

It is also no longer only a preference: `job` and `jobs` are both in Twenty's
`RESERVED_METADATA_NAME_KEYWORDS`, so a field pointing at a job cannot be called `job` at all. The
work log's relation is `matter`, labelled Job.



### Job

Start by **relabelling `Opportunity`** (D6), not by building a new object. That inherits pipelines,
kanban, forecasting and every existing view for free. Split it out only when the shared shape
genuinely chafes. See O3.

| Twenty field | Relabelled | Notes |
| --- | --- | --- |
| `name` | Job | e.g. "Retirement visa — Somchai Prasert" |
| `stage` | Status | Intake / Conflict check / Engaged / In progress / Waiting on client / Closed |
| `amount` | Fee | Keep. Quoted value. |
| `closeDate` | Target completion | Not a forecast date, a delivery date |
| `probability` | — | Hide it |
| `owner` | Responsible | The lawyer accountable |
| `pointOfContact` | Client contact | |
| `company` | Organization | Often empty; individuals are the norm |

Added by us: `billingEntity` (required), `practiceArea`, `openedAt`, `closedAt`.

### MatterDeadline

**The most important object here, and the one nobody designs first.**

`matter`, `title`, `dueAt`, `type` (statutory / court / internal / client-committed), `isCritical`,
`completedAt`, `responsible`.

A missed statutory date is the thing that actually damages a law firm. This is why the CRM cannot
just be a relabelled sales pipeline: a deal has no concept of a date you are legally obliged to hit.

Needs its own calendar view, its own "due in the next 14 days" view, and a workflow that escalates
as `isCritical` deadlines approach.

### RequiredDocument

`matter`, `name`, `status` (requested / received / verified / rejected), `requestedAt`, `receivedAt`,
`file`, `notes`.

Drives the "outstanding from client" panel, which is usually the honest answer to "why is this
matter stuck". Also the natural place for an automation: nothing received in 7 days, send a reminder
through the channel the client actually uses.

### PracticeArea

`name`, `defaultBillingEntity`, `isActive`. Visa, property, corporate, litigation, notarization,
estate.

`defaultBillingEntity` is how a job lands on the right legal person without anyone thinking about
it: notarization defaults to Pattaya Notary, company registration to Unique X Services.

### Booking

Consultations and appointments. See §4.

### WorkLog

What was done. See §5.

---

## 4. Bookings and calendars

### The good news

**VERIFIED: group and per-staff calendars are view configuration, not custom UI.** `ViewType.CALENDAR`
exists with DAY/WEEK/MONTH layouts, plus `CALENDAR_WIDGET` for dashboards.

- Group calendar: a calendar view over Bookings, unfiltered
- A lawyer's own calendar: the same view filtered to `responsible = me`
- On a staff record page: a calendar widget

No front component. No sandbox. No hand-built calendar.

### The model

```
Booking
  person          the client
  job          what it is about, if anything yet
  billingEntity   which company is taking it
  responsible     WorkspaceMember
  service         consultation type, duration, fee
  startsAt, endsAt
  location        office / online / client site
  status          REQUESTED / CONFIRMED / RESCHEDULED
                  CANCELLED / NO_SHOW / COMPLETED
  notes
```

`NO_SHOW` earns its place. Nobody adds it until the third time it costs an hour.

**Do not use Twenty's `CalendarEvent`** (D5). It is a mirror of Google/Microsoft, not a booking.
Push confirmed bookings out to staff Google Calendars with the `create-calendar-event` workflow
action instead, so staff see them where they already look.

### The client-facing booking page

A public logic-function route (`isAuthRequired: false`), same mechanism as the payment page: shows
available slots, takes a booking, writes the record.

Availability is the fiddly part: working hours, existing bookings, buffers, Thai public holidays.
Build it rather than adopting Cal.com: the rules here are simple (a handful of staff, fixed
consultation lengths) and Cal.com's value is mostly in complexity this firm does not have. See O6.

---

## 5. Work logs

```
WorkLog
  workspaceMember, date, minutes
  description
  job / booking / person     what it was for
  billingEntity
  isBillable
```

Table view for the week, calendar view by date, aggregate by staff, by client, by entity.
`createdBy` gives accountability for free.

### The part that decides whether this works

**Daily work reports are the thing staff quietly stop doing.** A blank form at 6pm gets skipped, then
skipped again, and within a month the data is worthless and the reports are a fiction.

So: **derive most of it, ask for the rest.** The system already knows they took three bookings,
handled eleven conversations and moved two jobs. Pre-fill that, and ask only "anything else, and
how long did it take". A report that arrives 80% complete gets finished. A blank one does not.

Design the pre-fill before designing the form.

### Unresolved: TLLACC (O1)

TLLACC already does HR. Work logs sit on that line. If TLLACC keeps timesheets and Twenty keeps work
logs, there are two sources of truth for how staff spent their day.

Decide: does TLLACC own "what staff did with their time" with Twenty logging only client-facing work
against jobs? Or does this move here and TLLACC keeps leave and attendance?

Also unresolved and more urgent (O2): **does TLLACC currently issue invoices?** Two systems issuing
invoices is a worse failure than either doing it badly alone.

---

## 6. Manager and lawyer

Not separate builds. Same records, different default views and roles.

**Lawyer:** my jobs by status · my bookings this week · my deadlines, soonest first · jobs
waiting on a client · my unlogged time

**Manager:** all jobs by status · deadlines across the firm · staff utilisation from work logs ·
revenue by billing entity · overdue invoices · unassigned enquiries · jobs with no activity in 14
days

That last one is the most useful management view in the system and costs nothing: a filter on
`lastActivityAt`. Jobs do not usually fail loudly, they go quiet.

Twenty roles control visibility. Row-level rules for job confidentiality are Enterprise (O7);
plain view filters are not.

---

## 7. What Twenty gives free

VERIFIED, so we do not rebuild it:

| Need | Twenty provides |
| --- | --- |
| Work items with owner and due date | `Task`: `title`, `dueAt`, `status`, `assignee`, attachments |
| Attaching work to a job | `TaskTarget` is polymorphic and has a `custom` slot |
| Who did what, when | `TimelineActivity` plus `createdBy` / `updatedBy` ACTOR fields |
| Fanning an event onto the client's timeline | `defineTimelineActivityType` with `emit.through` |
| Files on any record | `FILES` field type with signed URLs |
| Calendar views | `ViewType.CALENDAR`, DAY/WEEK/MONTH |
| Deadline escalation | Workflow `DATABASE_EVENT` and `CRON` triggers |
| Notes | `Note` and `NoteTarget` |

We build: Job shaping, `MatterDeadline`, `RequiredDocument`, `PracticeArea`, `Booking`,
`WorkLog`, the page layouts, and the client-facing booking page.

---

## 8. Build order

Shortest path to daily use.

1. **The Job page.** Relabel Opportunity, add `MatterDeadline`, `RequiredDocument`,
   `PracticeArea` and `billingEntity`, build the page layout. Small, and it changes daily life
   immediately: staff can finally see what is happening with a client.
2. **Bookings and calendars.** Mostly view configuration once the object exists.
3. **Work logs**, with derived pre-fill.
4. **Inbox and AI qualification**, the highest value and the most work. See [`OMNICHANNEL.md`](./OMNICHANNEL.md).
5. **Quotations, invoices, payments.** See [`FINANCE.md`](./FINANCE.md).

Step 1 is deliberately first and deliberately small. Ship it, watch people use it, then keep going.

**Alongside, not in the sequence:** add `th-TH` to `AppLocales.ts` early (D8). It is one line, and
until it lands no Thai string can ship from an app at all, so every screen built before it will need
revisiting.
