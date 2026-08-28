# What a practice management system for this firm has to do

Tool-independent. No Twenty, no ERPNext, no assumption that any particular product is the answer.
This is what the firm does, what the system must therefore do, and what it must not do.

Everything marked **VERIFIED** was read from the firm's own working file or established by
measurement. **PROPOSED** is judgement that has not been tested against the firm yet.

---

## 1. The firm

**VERIFIED.** One firm, three legal entities, shared clients:

| Entity | Legal name | Typically bills |
| --- | --- | --- |
| Thailiving Law | Thailiving Law Co., Ltd. | Litigation, property, wills, visas, contracts |
| Unique X Services | Unique X Services Co., Ltd. | Company registration |
| Pattaya Notary | Pattaya Notary | Notarisation |

Twelve staff keep the daily work report. Clients are mostly individuals, many of them foreign
nationals living in Thailand; the firm also registers and administers companies. Enquiries arrive in
Thai and in English.

A separate system, **TLLACC**, does HR and attendance. **FlowAccount** is the accounting system.

The system is opened by staff to see *what is happening with a client, what is blocking, and what is
next*. It is a system of work, not a sales pipeline.

---

## 2. How the work is recorded today

**VERIFIED** — read from the firm's own file, `รายงานทำงานTLL 2026.xlsx`. This is the most useful
evidence about the firm that exists, and it took reading rather than asking.

Twelve monthly sheets. Each sheet carries seven columns **repeated once per staff member, side by
side** — twelve people, eighty-four columns. Each person fills their own block.

| Thai | English | Type |
| --- | --- | --- |
| วันทำงาน | Work date | Date, written once per day, blank on the rows below it |
| หมวดหมู่ | Category | Dropdown |
| ชื่อลูกค้า | Client name | Free text |
| คำอธิบาย | Description | Free text, several lines |
| โน้ต | Note | Free text, several lines |
| สถานะ | Status | Dropdown |
| สถานะการจบงาน | Case stage | Dropdown |

Three findings from it drive most of this document.

### 2.1 There is no time column

**VERIFIED, and the single most consequential finding.** No hours, no minutes, no start and end time,
in any month, for any of the twelve people. A full year of daily work reporting with no duration
recorded anywhere.

Any design that *requires* a duration is asking for something this firm has never once written down,
and a mandatory field is where people invent a value to get past the form. Capture time only if
someone decides deliberately that it is now wanted — and answer first whether knowing a job took four
hours is worth twelve people typing every day, every day, forever.

### 2.2 The report is the case file, not a timesheet

**PROPOSED, but strongly.** Look at what a row is: a client, what happened, a note on where it now
stands, and the state of the case. That is a case history in daily order, split across twelve columns
so that no single case can ever be seen whole.

The giveaway is the case-stage column being retyped on every row that touches a matter. It is there
because the log is the only place the case's state is recorded at all.

**This reframes the whole requirement.** The prize is not "replace the typing". It is *make the case
visible*: one matter, its entire history, whoever did the work, on one screen. That is what makes
daily logging worth anyone's time — the log stops being a report someone else reads and becomes the
thing that answers "what is happening with my case?" when the client rings.

### 2.3 The category list is kinds of work, not areas of law

**VERIFIED**, from the file's own dropdown validation:

| Thai | English | Client work? |
| --- | --- | --- |
| งานจดทะเบียนกรมที่ดิน | Land Department registration | Yes |
| งานคดี/ศาล | Litigation / court | Yes |
| งาน DBD | Company registration | Yes |
| งานพินัยกรรม | Wills | Yes |
| งานสัญญา | Contracts | Yes |
| งาน Due diligence | Due diligence | Yes |
| งาน LED | Legal Execution Department (enforcing a judgment) | Yes |
| Notary | Notarisation | Yes |
| งาน Office | Office | **No** |
| การเงิน/บัญชี | Finance and accounting | **No** |
| ฝ่ายการตลาด | Marketing | **No** |
| ประชุม | Meetings | **No** |

**Roughly a third of what staff log has no client and no matter.** Any model that assumes a work
entry hangs off a case will fail on all of it. Internal work is first-class: it is where the day goes
when it does not go on a client, and it is the only way to know what the firm's capacity actually
costs.

Note also that the firm's categories are more specific than a generic legal taxonomy would suggest.
"Land Department registration" and "LED work" are narrower than "Property" and "Litigation". Their
granularity is the one to use, because it is the one they think in.

### 2.4 The two status columns are different things

**VERIFIED.**

**สถานะ** — the state of *this piece of work*. Five options, the same in every block: ยังไม่เริ่ม (Not
started), เรียบร้อย (Done), กำลังดำเนินการ (In progress), เลื่อนแล้ว (Postponed), ยกเลิกแล้ว
(Cancelled).

**สถานะการจบงาน** — the state of *the case*: ปิดงาน (Closed), สืบพยาน (Witness examination), บังคับคดี
(Enforcement), จำหน่ายคดีชั่วคราว (Temporarily struck out), ฟังคำสั่ง/คำพิพากษา (Hearing the judgment),
and others. These are litigation stages and they belong to the matter, written once — not retyped on
every row, where twelve people can disagree about where the same case stands.

The stage list varies between staff blocks, and some cells hold two or three values comma-joined past
what the dropdown offers. That looks like a year of hand-copied columns drifting apart rather than a
designed per-role rule. Confirm with whoever maintains the file before encoding the differences.

---

## 3. What the system must do

Stated as jobs, not features. Each one should be answerable in a few seconds by someone at a desk.

1. **"What is happening with this client's case?"** — asked on the phone, while the client waits. One
   screen: the matter, what is blocking, what is due next, and everything done on it so far.
2. **"What is due, and what is late?"** — across the firm, and mine specifically. A missed statutory
   or court deadline is the failure that actually costs money.
3. **"What are we waiting on the client for?"** — the single most common reason a matter sits still.
4. **"What did I do today?"** — logged in under two minutes, or it will not be done at all.
5. **"What did we do for this client, and what do they owe?"**
6. **"Who is working on what?"** — for whoever allocates work.
7. **"How is the firm doing?"** — a small number of figures, per entity and for the firm.

---

## 4. The things the system holds

Tool-independent. Names are ours; every system will call them something else.

### 4.1 Client

A person or an organisation. **The spine of the whole system** — matters, work, money and messages
all hang off it.

Must have:

- A name in Latin script **and** a name in Thai script, side by side. Both matter; neither replaces
  the other. Ordinary search only works on the Latin one.
- Contact details, including the messaging handles they actually use.
- Which entity or entities they deal with.
- History: their matters, work done, documents, money.

**A client is a record, never a string.** The free-text client column in the spreadsheet is the defect
to fix, not the pattern to copy. Wherever a client is named, the field must search existing records
first, and creating a new one must be a deliberate act taken after seeing that no match exists. A
free-text box with a convenient "add new" beside it is a duplicate factory: one misspelling and a
client's history splits in two, which defeats the point of having the system.

### 4.2 Matter

One piece of work for one client. Not a sales opportunity: amount and probability are forecast fields
and do not belong on the page.

- Client, category, billing entity, person responsible.
- Opened, closed.
- **Stage** — where the case has got to, from §2.4. Written once, here.
- What is blocking it, and what is due next, at the top of the page.

### 4.3 Work log — the case history

Called out here because it is the heart of the system and the thing most likely to be built wrong.

One entry is **one thing one person did on one day**:

| Field | Notes |
| --- | --- |
| Date | The day the work happened, not the day it was typed |
| Person | Who did it |
| Category | From §2.3. Required — it is the one field filled on every row |
| Client | A record. Optional: internal work has none |
| Matter | A record. Optional: not all client work is against an open matter |
| What was done | Free text, several lines. This is the content |
| Note | Free text, several lines. Where it now stands, for whoever reads next |
| Status | From §2.4 |
| Duration | **Optional.** See §2.1 |

Requirements that decide whether it succeeds:

- **It must be readable from the matter.** An entry that cannot be seen from the case it belongs to is
  a report filed into a void. This is the requirement that makes all the others worth meeting.
- **It must be readable from the client**, across their matters.
- **Most of it should be filled in before the person arrives.** The system already knows their
  appointments, the deadlines they closed and the clients they messaged. A form that opens 80% complete
  gets finished; a blank one at six in the evening gets skipped, then skipped again, and within a month
  the data is fiction. **Design the pre-fill before designing the form.**
- **Entering a day must be fast** — one screen, keyboard-navigable, no dialog per row.
- **Nothing may be silently dropped.** If a typed client name matches no record, say so. Do not save
  the row with the client quietly missing.

### 4.4 Deadline

A dated obligation on a matter. Statutory, court, internal, or client-imposed. Has an owner, a due
date, and a completion.

Missing one is the failure that matters most, so: visible before it is late, to the person responsible
*and* to someone else.

### 4.5 Required document

Something the client must provide. Requested → received → verified → rejected, with the file attached.

This is what "waiting on the client" actually means, and it is the most common reason a matter is not
moving. It deserves to be a first-class thing rather than a note.

### 4.6 Booking

A consultation or appointment: client, staff, time, place, matter. Needs to sit in a calendar the
staff already look at.

### 4.7 Money

Quotation → invoice → payment, per billing entity. Thai payment methods first: PromptPay and bank
transfer, with a slip to be checked by a person.

**The ledger boundary is the most important rule here.** Statutory accounting and tax live in the
accounting system. The practice system holds a reference to the invoice, never a mirror of the
ledger's numbers. If two places can disagree about what a client owes, the design is already wrong.

A corollary that catches people out: **there are two kinds of number and they must never be mixed.**
Operational figures the practice system is the source of (matters open, work done, deadlines missed)
and accounting figures fetched from the ledger and stamped with when they were fetched. Recomputing
the second kind from your own rows goes wrong the moment the accountant adjusts anything — and goes
wrong confidently.

If the system being evaluated *is* an accounting system, this rule has to be re-decided deliberately:
either it replaces the existing accounting system, or its accounting is switched off. Running both is
the trap, and it is what happens by default when nobody chooses.

### 4.8 Messages

Clients arrive on LINE, Facebook, WhatsApp, email, phone and in person. The same person turns up
under different handles. Whatever the system, it must be possible to reach a client on the channel
they actually use, and to see that conversation from their record.

---

## 5. Cross-cutting requirements

### 5.1 Thai, throughout

Staff read the whole application, so English chrome with Thai panels is not an answer — it is worse
than either extreme. **The interface must switch to Thai entirely.**

This is worth checking *before* choosing a system, because retrofitting it is expensive: in the
system evaluated first it meant hand-patching five files across four packages, indefinitely, because
the project had closed the door on new locales.

Quotations, invoices and outbound email stay mostly English. Thai is what clients write to us in.

### 5.2 Thai text search

**VERIFIED as a real problem.** Thai does not put spaces between words, so a default full-text index
tokenises it into nothing usable. The first system evaluated could not index Thai at all, and Thai
names had to be searched with substring filters instead of the search endpoint.

**Test searching for a Thai client name on day one.** It is the kind of defect discovered late and
felt daily.

### 5.3 Who may see and change what

**The owner's provisional answer, 2026-08-29: everyone can see everything, but a person should only
be able to change their own work.**

The two halves have very different costs. Universal read is usually free. "Only your own to edit" is
row-level permission, which some systems charge for and others include in the framework — worth
checking early, because it is a purchase decision disguised as a configuration one.

Before paying for it, three questions worth putting to the owner:

- Has anyone actually edited someone else's record and caused a problem? If not, this is a fear, and
  a fear is cheaper to answer with a name than with a subscription.
- Would *seeing* who changed something be enough, instead of stopping them? Most systems record that
  for free. Attribution you get; prevention is what costs.
- If prevention is genuinely wanted, on which records? "Work logs only" is a far smaller claim than
  "everything in the firm".

### 5.4 Accountability

Who created a record, who changed it and when, on every object, without anyone having to build it.
This is also the cheap answer to §5.3.

### 5.5 Speed of the frequent things

The three things staff do most times a day must be fast. Everything else can take a click more. Ask
which three; do not guess.

---

## 6. What not to build

- **Accounting.** See §4.7.
- **HR and attendance**, while TLLACC does it.
- **A sales pipeline.** Stages, forecasts and probabilities describe a business that sells; this one
  delivers.
- **Anything requiring a duration**, until someone decides time is now tracked. §2.1.
- **Fields nobody can name a decision for.** Every field is a tax on the person entering it. If
  nobody can say what changes as a result of knowing it, it should not exist.
- **A second place for anything.** §4.7.

---

## 7. Build order

Shortest path to daily use, and each step should be usable before the next begins.

1. **Clients and matters.** The spine, with the matter page leading on what is blocking and what is
   due. Nothing else is worth anything without this.
2. **Deadlines and required documents.** These make the matter page answer the phone call in §3.1.
3. **Work log**, with pre-fill, readable from the matter. §4.3.
4. **Bookings.**
5. **Quotations, invoices and payments.** §4.7 first.
6. **Messages.** The highest value and the most work.

Ship step 1, watch people use it for a fortnight, then keep going. A system nobody opens in week three
is the actual risk, and it is not a technical one.

---

## 8. Questions still open

These decide how much system is needed. Worth answering before committing to a product, not after.

| # | Question | What it changes |
| --- | --- | --- |
| 1 | Does the HR system keep timesheets, or does that move here? | Whether work logs are the firm's timesheet or only client-facing work |
| 2 | Do staff need to search clients by Thai name, or is a filter enough? | Search design, and it is a real risk — §5.2 |
| 3 | How are bank transfer slips checked today, and by whom? | Whether payment verification is worth automating |
| 4 | Do clients book their own appointments, or does staff? | Whether a public booking page is needed at all |
| 5 | May a person change work that is not theirs? | §5.3, and possibly a subscription |
| 6 | Does one matter ever span two entities? | Whether the entity sits on the matter or on the client |
| 7 | Which staff read English comfortably, by name? | How urgent Thai is — §5.1 |

The fuller list, and how to run the conversation that answers it, is in `docs/DISCOVERY.md`. The most
expensive things to get wrong are the money boundary and who may see what.

---

## 9. Two lessons worth carrying

**Read what they already use before designing anything.** A month went into treating the daily report
as a timesheet. Reading the file showed it was the case file, with no duration in it anywhere. The
requirement changed completely, and the evidence had been sitting there the whole time. An artefact a
firm has maintained by hand for a year is a specification written in their own words.

**Beware automation nobody asked for.** A system shipped with an active rule that read a new client's
email domain and invented an organisation from it, overriding the one staff had chosen — six clients
produced four junk organisations. For a firm that registers real companies, an organisation conjured
from an email domain is a different kind of record from the ones staff enter by hand. Audit whatever
a new system does automatically on record creation, before letting real data near it.
