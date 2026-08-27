---
name: jobs
description: How the firm's work is modelled - jobs, deadlines, required documents, bookings, calendars and work logs. Use when working on the Job object or page, practice areas, scheduling, staff work reports, or any question about what the CRM is for.
---

# Jobs and work

Full model in `docs/JOBS.md`. Decisions D5, D6 and D7 in `docs/DECISIONS.md`.

## 1. This is a system of work, not a pipeline

Twenty's `Opportunity` is a forecast record: amount, stage, close date, probability. It answers "how
much might we make". A law firm needs a work record: "what are we doing for this client, what is
blocking it, what happens next".

Apply it as a test on every field and panel:

- Does it tell someone what to do next? Top of the page.
- Does it only support a sales forecast? Off the page.

Blocking items first, deadlines second, open work third, money last. Probability is hidden.

## 2. Relabel, do not rename

Change `labelSingular`, `labelPlural` and `icon` on standard objects. **Never change
`nameSingular`** - it is the API contract, so renaming `opportunity` breaks `/rest/opportunities`
and every integration. The server enforces this: only the properties in
`FLAT_OBJECT_METADATA_EDITABLE_PROPERTIES.standard` are accepted.

**Do not send `isLabelSyncedWithName` on a standard object.** It is a custom-object property, and
including it fails the entire update with `Cannot edit standard object metadata properties`.
Standard-object labels are stored as overrides, so there is nothing to desync. On our own objects it
applies as normal.

Writing object metadata at all needs the **`DATA_MODEL` permission flag** on the app's role: record
permissions do not cover it.

Job starts as a relabelled `Opportunity`, which inherits pipelines, kanban and every existing
view for free. Split it into its own object only when the shared shape genuinely chafes (O3).

## 3. Deadlines are the object nobody designs first

`MatterDeadline` with `type` (statutory / court / internal / client-committed) and `isCritical`.

A missed statutory date is the thing that actually damages a law firm, and it is precisely what a
sales pipeline has no concept of. It needs its own calendar view, its own "due in 14 days" view, and
a workflow that escalates as critical deadlines approach.

## 4. Bookings are ours, not Twenty's `CalendarEvent`

`CalendarEvent` carries `iCalUid` and `externalCreatedAt`: it is a **mirror** of Google or Microsoft,
the same trap as `Message` being a mirror of email. Bookings need their own lifecycle (`REQUESTED`,
`CONFIRMED`, `NO_SHOW`) and their own relations (job, billing entity, fee).

Push confirmed bookings out to staff Google Calendars with the `create-calendar-event` workflow
action, so staff see them where they already look.

**Group and per-staff calendars are view configuration, not custom UI.** `ViewType.CALENDAR` exists
with DAY/WEEK/MONTH layouts, plus `CALENDAR_WIDGET` for record pages. Do not hand-build a calendar.

## 5. Derive work logs before asking for them

Daily work reports are the thing staff quietly stop doing. A blank form at 6pm gets skipped, and
within a month the data is a fiction.

The system already knows they took three bookings, handled eleven conversations and moved two
matters. **Pre-fill that and ask only what is missing.** Design the pre-fill before designing the
form.

## 6. `billingEntity` is required, and it flows

Required on `Job`, `Quotation` and `Invoice`; present on `ChannelAccount`. **Not** on `Person` or
`Company` - clients are shared across Thailiving Law, Unique X Services and Pattaya Notary, which is
the entire reason for one workspace.

Defaults flow `ChannelAccount -> Job -> Quotation -> Invoice`, with
`PracticeArea.defaultBillingEntity` covering jobs that do not arrive through a channel. Staff can
override at any step.

## 7. Declare a timeline activity type for anything worth asking about later

`defineTimelineActivityType` with `emit.through` fans an event along a relation, so an event on a
quotation lands on the client's timeline with no fan-out code. They are cheap and **cannot be
backfilled**, so declare them when you add the state change, not when someone asks for the report.

## 8. Manager and lawyer are views, not builds

Same records, different default views and roles. The most useful management view in the system is a
filter on `lastActivityAt`: jobs with no activity in 14 days. Jobs do not fail loudly, they go
quiet.

## 9. What Twenty already provides

`Task` and `TaskTarget` (polymorphic, with a `custom` slot) for work items · `TimelineActivity` plus
`createdBy`/`updatedBy` ACTOR fields · `FILES` fields with signed URLs · calendar views · workflow
`DATABASE_EVENT` and `CRON` triggers · `Note` and `NoteTarget`.

We build: Job shaping, `MatterDeadline`, `RequiredDocument`, `PracticeArea`, `Booking`, `WorkLog`,
the page layouts, and the public booking page.
