# Questions for the owner

A sitting, not a form. Print it, take it into a room, and write the answers in the margin.

The point is not to collect requirements. It is to find the handful of things that, if we get them
wrong, mean the system gets opened for two weeks and then abandoned. Most of this document is there
to surface those. The rest is useful but survivable.

---

## Before the sitting

**Watch a day first.** Sit next to whoever handles enquiries for two hours, and next to whoever runs
a job to completion for two more. Half these questions answer themselves and the other half get
sharper. An answer given in the abstract and an answer given while the person is actually doing the
thing are rarely the same answer.

**Two answers that mean "ask again".**

- "Everything." Nobody wants everything. They want three things and cannot name them, so they say
  everything. Push: what did you look for last Tuesday and fail to find?
- "Whatever you think." Fine on colours and icons. Not fine on who sees what, or on who owns the
  invoice. If a question in Part 7 or Part 8 gets this answer, it has not been understood, and the
  cost of getting it wrong lands months later.

**Ask about the past, not the future.** "What would you like to see?" produces a wish list. "What
went wrong last month, and what would have caught it?" produces a specification.

---

## Part 1. What actually happens now

Before anything about the system.

1. Walk me through one job from the first message to the money arriving. Who touches it, in what
   order, and where does it currently live: paper, LINE, a spreadsheet, someone's head?
2. Which of the three entities does that job belong to, and who decides? Is it obvious from the work
   type, or is it a judgement call someone makes?
3. What are the five most common kinds of work? Rough share of volume for each.
4. Which of them are basically a checklist that repeats every time, and which are genuinely
   different every time? The repeatable ones are where a template earns the most.
5. What is the longest a job stays open? What is the typical one?
6. What goes wrong most often? Not the dramatic failures. The recurring irritation.
7. When something is late or stuck, how does anyone find out? Who notices, and how long does it
   take?

---

## Part 2. What staff must be able to do

8. Name the three things a member of staff does most times a day. Not the important things, the
   frequent ones. Those are the ones that must be fast.
9. What does someone need on screen before they can answer a client's "what is happening with my
   case?" call? List it in the order they need it.
10. Who is allowed to create a new job? Anyone, or does it go through one person?
11. Who assigns work? Does the person doing it choose, or is it given to them?
12. What does a member of staff need to do on a phone, away from a desk? Almost certainly a shorter
    list than on a laptop, and the short list is what matters.
13. What do they currently have to ask a colleague for because they cannot look it up themselves?
14. Which staff read English comfortably and which do not? Be specific by person or role, not
    "mostly fine". This decides how much of Part 5 in `DECISIONS.md` (D8, Thai UI) is urgent rather
    than nice.
15. What would make someone quietly stop using the system after week two?

---

## Part 3. What the CEO must be able to see

16. What do you check first thing in the morning today, and where do you go to check it?
17. What do you currently ask someone else for because you cannot see it yourself? Every one of
    these is a screen worth building.
18. If you could see one number for the firm at any moment, what is it?
19. Now three more. Then stop. A dashboard with twelve numbers on it is a dashboard nobody reads.
20. Per entity, per person, per practice area, or per client: which of those cuts do you actually
    make decisions from?
21. What does "a good month" mean, in a number you could put on a wall?
22. What would you want to be told without asking? A job stuck for a fortnight, a deadline missed, a
    client who has gone quiet, an invoice unpaid past thirty days. Which of those is worth an
    interruption, and which is worth a weekly summary?
23. Do you want to see individual staff output, and do you want them to know you can see it? These
    are two questions and the second one matters more than it sounds.

---

## Part 4. How much detail is worth the typing

Every field is a tax on the person entering it. This part is about where the tax is worth paying.

24. For each thing we ask staff to record: what decision does it change? If nobody can name one, it
    should not be a field.
25. Take the work log specifically. Is knowing that a job took four hours worth four people typing
    for two minutes a day, every day? An honest no here is more useful than an optimistic yes.
26. Which fields are worth making mandatory? Every mandatory field is a place people invent a value
    to get past the form.
27. Where is "roughly" good enough and where does it have to be exact? Time, money, dates.
28. Is there anything that must be recorded for a legal or regulatory reason, where the requirement
    is the reason and not usefulness?
29. What do you keep today that nobody has looked at in a year?

---

## Part 5. Three entities, one firm

30. Do clients know which entity they are dealing with, or do they just deal with you?
31. Can one job involve more than one entity? If a notarisation happens inside a visa case, is that
    one job or two?
32. Does a client belong to an entity, or to the firm?
33. Do the three keep separate books, separate bank accounts, separate invoice numbering? Which of
    those are genuinely separate and which just look separate?
34. Should staff see across all three by default, or only their own?
35. When a report says "revenue", does that mean the firm or one entity? What is the default anyone
    would assume?

---

## Part 6. Clients and how they reach you

36. Which channels do clients actually use, in order of volume? LINE, Facebook, WhatsApp, phone,
    email, walk-in.
37. What share of enquiries arrive in Thai?
38. When a client writes in, how long before someone replies today? What would be embarrassing?
39. How often does the same person turn up as a new stranger because they wrote from a different
    account?
40. Who chases a client who has gone quiet? Does anyone?
41. What do you send clients unprompted: reminders, status updates, document requests? Which of
    those could be automatic without feeling automatic?
42. Should clients ever see anything directly, a booking page or a status page, or does everything
    go through a person?

---

## Part 7. The money boundary

The area where getting it wrong is most expensive, because it means two systems disagreeing about
the same number. See `docs/FINANCE.md`.

43. ~~Does TLLACC issue invoices today?~~ **Answered:** its financial side does not work, so nothing
    does. Invoicing moves here. The live version of this question is now **who issues quotations**,
    since FlowAccount produces those too and two numbered documents for one client is the same trap.
44. Who produces a quotation now, and what does the client receive: PDF, a message, a spoken number?
45. Between quotation and invoice, what changes? Are there deposits, staged payments, disbursements
    paid on the client's behalf?
46. How do clients pay, in order of volume? PromptPay, transfer, cash, card.
47. Who confirms a payment arrived, and how long does that take?
48. What has to reach FlowAccount, and does it get there by hand today?
49. **Does TLLACC keep timesheets?** (O1.) If it does, what are they for: payroll, billing, or
    management? The answer decides whether work logs here are a duplicate or a different thing.
50. Is anything billed by time, or is everything fixed fee?

---

## Part 8. Trust, access and confidentiality

51. Is there work that only certain people should see? Not "sensitive in general". Name a case.

**The owner's provisional answer (2026-08-29): everyone can see everything, but a person should
only be able to change their own work.** That needs confirming, because the two halves have very
different prices. Read is free. Write-your-own-only is an Enterprise licence: VERIFIED in
`row-level-permission-predicate.entity.ts`, which carries an `@license Enterprise` header and a
`workspaceMemberFieldMetadataId` column — the predicate that means "records where this field is
you". Object-level roles cannot express it; they are all-records-or-none per object.

So the question to put to the owner is sharper than it looks:

- **Has anyone actually edited someone else's record and caused a problem?** If not, this is a fear
  rather than a requirement, and fears are cheaper to answer with a name than with a subscription.
- **Would it be enough to see who changed something, rather than stop them?** `createdBy` and the
  timeline already record every change against a person, for nothing. Prevention costs a licence;
  attribution is already there.
- **If prevention is genuinely wanted, which objects?** Work logs only is a much smaller claim than
  every record in the firm, and it is the one that came up first.
52. If yes: is it the whole job, or one document inside it? (O7. Job-level confidentiality needs
    row-level permissions, which are an Enterprise feature and therefore a cost. Document-level is
    cheaper. The answer decides whether we pay.)
53. Should staff see each other's work logs? Should they see each other's clients?
54. Who is allowed to delete something, and does deleted need to mean gone or hidden?
55. If someone leaves the firm tomorrow, what has to happen to their access and their records?
56. Does anyone outside the firm ever need to see anything: an accountant, an auditor, a partner
    firm?

---

## Part 9. Beyond the CRM

Not everything worth building is a client record. These are business questions the same data can
answer, and they are worth asking before the shape is fixed.

57. How do you decide whether a kind of work is worth doing? Do you know what any of it costs to
    deliver?
58. Where does new business come from, and do you know which sources are worth anything?
59. How do you decide whether to hire? What number would tell you?
60. What do you renew: visas, licences, registrations, annual filings. Does anyone track when they
    come round again? (Recurring work you already know about is the cheapest revenue there is, and
    it is usually the first thing a firm loses track of.)
61. What does the firm have to file or renew for itself, and who remembers?
62. Which suppliers or agents do you depend on, and does anyone track what they cost or how they
    perform?
63. If the office burned down tomorrow, what would be gone?
64. What are you asked for by clients that you cannot currently do?

---

## Part 10. The honest ones

65. What has been tried before and abandoned? Why?
66. What are you afraid this will turn into?
67. If this only ever did one thing well, what should it be?
68. Who, by name, has to like this for it to survive?

---

## The decisions already waiting

Seven of these are already blocking real design choices. They are numbered in `DECISIONS.md` and
restated here in plain language, so they can be answered in the same sitting.

| # | In plain terms | What it changes |
| --- | --- | --- |
| O1 | Does TLLACC keep the record of how staff spend their time, or does that move here? | Whether work logs are the firm's timesheet or only client-facing work |
| ~~O2~~ | Answered: TLLACC's financial side does not work, so nothing issues invoices today. Invoicing moves here, against FlowAccount. |
| O3 | Is a "Job" the same thing as a sales opportunity, or genuinely different? | Whether we keep relabelling Twenty's object or build our own |
| O4 | Do staff need to search for clients by Thai name? | Whether we need a Thai tokenizer in the database |
| O5 | How are bank transfer slips checked today, and by whom? | Whether verification is automated and at what cost |
| O6 | Do clients book appointments themselves, or does staff do it for them? | Whether we build a booking page at all |
| O7 | Is there work only some staff may see, and may a person change work that is not theirs? | Whether we need row-level permissions, which cost money. Half-answered: everything is visible to everyone, so the read side is free. "Only your own to edit" is the Enterprise half, and is not yet confirmed as a real requirement |

---

## Writing the answers down

Answers go into the document that owns the decision, not into this file:

- Work, jobs, deadlines, work logs: `docs/JOBS.md`
- Quotations, invoices, the FlowAccount boundary: `docs/FINANCE.md`
- Payments: `docs/PAYMENTS.md`
- Channels and the inbox: `docs/OMNICHANNEL.md`
- Anything that closes an O-number or reverses a decision: `docs/DECISIONS.md`

An answer that only lives in this file will be forgotten. An answer that closes an O-number should
close it there, with the date and who said it.
