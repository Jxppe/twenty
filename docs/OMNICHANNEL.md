# Omnichannel

Status: **PROPOSED**, and **not this repository's near-term work**.

Under D4, Takdai is a separate product built elsewhere and owns the omnichannel layer. This document
is kept here for two reasons: the domain model is hard-won and transfers unchanged to whatever builds
it, and TLL will be its first user, so the **contract** between the messaging layer and the CRM has
to be right.

Built so far: `apps/tll-crm`, a prototype that proved the Twenty extension path. See
[`TWENTY_ARCHITECTURE.md`](./TWENTY_ARCHITECTURE.md) §9b for what it established.

---

## 1. The split

**Takdai owns the conversation. The CRM owns the client. The link is one ID pointing one direction.**

```
LINE / WhatsApp / Messenger / Instagram / webchat / email
        │
        ▼
  Takdai adapter          normalizes to a provider-free event
        │
        ▼
  Takdai database         Conversation, Message, ContactIdentity
        │
        ▼
  AI qualification        is this a real enquiry?
        │
   ┌────┴────┐
  no        yes
   │          │
stays in    CRM REST API:
Takdai        create Person
(no CRM       create Job
 record)      store crmPersonId + crmJobId on the Takdai conversation
                │
                ▼
         staff notified, then:
           book consultation · issue quotation · issue invoice
```

Two rules that keep this clean:

**Only create a CRM record when the enquiry qualifies.** Otherwise every wrong number and spam
message becomes a contact, and the CRM rots within a month.

**Never mirror.** Takdai stores `crmPersonId` and reads the rest from the CRM when it needs it. The
CRM never learns what LINE is.

---

## 2. The one rule inside Takdai

**No provider-specific logic outside an adapter.**

```
Provider → Channel Adapter → Normalized Event → Conversation Engine → Inbox → CRM
```

If `grep -ri "line\|meta\|whatsapp"` finds matches in the conversation engine, the inbox UI or the
automation layer, the boundary has leaked.

Adding the second channel is the test. If it requires touching the engine, the abstraction is wrong,
and it is cheaper to fix then than after four channels.

---

## 3. The model

### Channel

Not an object. A `SELECT`: `LINE | FACEBOOK | INSTAGRAM | WHATSAPP | EMAIL | WEBCHAT`. A closed set
that changes when an adapter ships, which is a code change anyway.

### ChannelAccount

One connected provider account: one LINE OA, one Facebook Page, one mailbox.

`name`, `channel`, `externalId`, `isActive`, `billingEntity`.

`externalId` is the provider-side account id (LINE `destination`, Meta page id) and is **the tenant
routing key**. `billingEntity` is how a Pattaya Notary enquiry lands on the right legal person.

Credentials do not live here. They live in app `serverVariables` or a connection provider.

### ContactIdentity

One customer handle on one channel. A person legitimately has several.

`displayName`, `channel`, `externalId`, `avatarUrl`, `person` (nullable).

**`person` is nullable on purpose.** A message can arrive before anyone knows who sent it.
Resolution is a later step, sometimes a human one. See §5.

### Conversation

`title`, `channel`, `status` (OPEN/PENDING/CLOSED), `externalId`, `lastMessageAt`,
`lastMessagePreview`, `unreadCount`, `person`, `contactIdentity`, `channelAccount`, `assignee`.

One conversation per customer per channel. Cross-channel history is assembled by joining through the
CRM person, not by merging threads.

### Message

`body`, `direction` (INBOUND/OUTBOUND/INTERNAL), `sentAt`, `senderName`, `externalId`, `conversation`.

`INTERNAL` covers internal notes: messages that are never delivered. Modelling them as a direction
keeps the thread one ordered list.

### Assignment, Team, Tag

Deliberately not objects yet.

- Assignment is `Conversation.assignee`, a relation. Promote to an object only when assignment
  history or multiple assignees is a real requirement.
- Tags start as `MULTI_SELECT`. Promote when they need their own metadata.
- Teams have no Twenty primitive; roles are the nearest thing. Row-level rules are Enterprise (O7).

### Attachment

Not designed. Likely a `FILES` field on Message rather than an object, since that type already
handles storage and signed URLs. Confirm against provider media limits first.

---

## 4. AI qualification

The gate between "someone messaged us" and "this is a client".

The agent's job, in order:

1. Greet and establish what they want
2. **Ask whether they have used the firm before.** Highest-signal, lowest-tech re-identification
3. Collect name and a contact method
4. Judge whether this is a real enquiry
5. On pass, create the CRM records and hand to staff with a summary

What it must not do: promise anything, quote a price, or give legal advice. Qualification only.

Thai inbound is a good first use of AI beyond qualification: a translate action on a message, exposed
as a tool. More useful to staff than translating menus.

**Audit requirement:** anything the AI creates or changes must be attributable. Record which model,
which prompt version, and what it based the decision on. "The AI made a contact and nobody knows why"
is not acceptable in a law firm.

---

## 5. Contact re-identification

Matching an incoming chatter to an existing client. The hardest correctness problem in the system.

**VERIFIED: Twenty has no record merge and no duplicate detection.** So a wrong link is expensive to
undo. And in a law firm a wrong link puts one client's job in front of another client's record,
which is a confidentiality problem, not a data quality problem.

**Therefore: auto-link only on certainty. Everything else is a suggestion a human confirms.**

### Tier 1 — known handle

`ContactIdentity(channel, externalId)` lookup. Instant, certain, free. Covers most returning
customers. Nothing clever needed.

### Tier 2 — new handle, possibly known person

| Signal | Strength | Action |
| --- | --- | --- |
| Exact phone, normalized to E.164 | Strong | Auto-link |
| Exact email, lowercased | Strong | Auto-link |
| Passport or tax ID given in chat | Very strong | Auto-link |
| "Yes I'm an existing client" plus one weak signal | Good | Suggest |
| Fuzzy name match | Weak | Suggest only |
| Name alone | Very weak | Never link |

Every auto-link writes a timeline event saying how it matched, so a wrong one is traceable.

### Three things that make this work

**Just ask.** The qualification agent asks whether they have used the firm before. Highest signal
available, near-zero cost, and people answer honestly.

**Normalize phone numbers on write.** Thai numbers arrive as `0812345678`, `+66812345678`,
`66812345678`, `081-234-5678`. All the same person. Normalizing to E.164 turns the strongest signal
from unreliable into reliable.

**Thai names defeat naive matching.** Romanization varies (Somchai/Somchay, Suwanee/Suvanee), everyone
uses a nickname rather than their legal name, and the same person appears in Thai script in one place
and Latin in another. Combined with the verified finding that Twenty indexes with
`to_tsvector('simple', ...)` and cannot tokenize Thai at all, **name matching must happen in Takdai
against its own index**, not by calling the CRM's search endpoint.

### Suggestions are records

`MatchSuggestion`: conversation, candidate person, score, reasons, status (pending / accepted /
dismissed).

Not ephemeral UI. Dismissals must stick, or the same wrong suggestion reappears on every message and
staff learn to ignore the prompt. And when an auto-link turns out wrong, the reasoning needs to be
there.

---

## 6. Per-provider notes

Written down so the model does not have to change later. **None implemented.**

**LINE OA.** One webhook URL for all accounts, routed on `destination`. Verify `X-Line-Signature`
(HMAC-SHA256 of the raw body). Reply tokens are short-lived and single-use; anything later needs the
quota-metered push API, so the engine must not assume replies are free. Profile fetch is a separate
call, so do not expect a display name on the event.

**Meta (Messenger, Instagram, WhatsApp Cloud API).** Shared webhook infrastructure, per-product
payloads. `hub.challenge` handshake on subscribe, `X-Hub-Signature-256` verification. OAuth
onboarding, so a connection provider rather than static credentials. WhatsApp adds a 24-hour customer
service window and template rules, which must surface in the UI rather than failing at send time.

**Use the official WhatsApp Business Cloud API.** Unofficial reverse-engineered clients violate
Meta's terms and get numbers banned.

**Email.** Twenty already syncs Gmail, Microsoft and IMAP into its own `Message`/`MessageThread`
objects. **Do not reuse those**: that schema is email-specific and upstream-owned. Read it as a
reference for participant matching.

**Webchat.** Our own widget plus a public route. The only channel where we control both ends, so a
good place to prototype typing indicators. Also the one carrying its own abuse-prevention burden.

---

## 7. Multi-tenant webhook routing

VERIFIED and worth reading before designing anything: Twenty's `serverRouteTriggerSettings` provides
a public route at `/webhooks/server/:id` that runs a **resolver** function in the publisher
workspace, which returns `{ targetLogicFunctionUniversalIdentifier, workspaceId, payload }`. The
platform then enqueues the target in that workspace with retry and backoff.

`packages/twenty-server/src/engine/core-modules/server-route-trigger/server-route-trigger.service.ts`

One webhook URL, many tenants. Exactly the shape a channel adapter needs. Relevant to Takdai as a
multi-tenant product; less so to TLL alone.

---

## 8. Realtime

The front-component sandbox provides no realtime transport, so a custom pane must poll. MEASURED in
the prototype: 25ms per fetch at 3 conversations, 5s poll interval. Not measured at 500.

Twenty's native record views update over SSE for free, which is a standing argument for keeping a
conversation list native and reserving custom UI for the message thread.

Typing indicators and presence are out of scope until the transport question is resolved. Not an
issue for a Takdai built outside Twenty, where the DOM is unrestricted.
