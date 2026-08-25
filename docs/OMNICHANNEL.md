# Omnichannel Architecture

The normalized messaging model and the adapter boundary. Status: the core objects are **BUILT** in
`apps/takdai-inbox`; everything about providers is **PROPOSED** and not implemented.

---

## 1. The one rule

**No provider-specific logic outside an adapter.**

Nothing downstream of the adapter boundary may know what LINE is. If `grep -ri "line\|meta\|whatsapp"`
turns up matches in the conversation engine, the inbox UI, the CRM linkage or the automation layer,
the boundary has leaked and the next channel will cost as much as the first.

```
Provider          Channel Adapter        Normalized Event      Conversation Engine     Inbox      CRM
────────          ───────────────        ────────────────      ───────────────────     ─────      ───
LINE      ──┐
Messenger ──┤
Instagram ──┼──►  verify signature  ──►  InboundMessage   ──►  upsert identity    ──►  render ──► Person
WhatsApp  ──┤     parse payload           (provider-free)      upsert conversation                Opportunity
Email     ──┤     map to normal form                           append message
Web chat  ──┘     resolve tenant                               update inbox state
```

The adapter is the only place that knows a provider exists. It translates in both directions and
nothing else does.

---

## 2. The model

### Channel

Not an object. A `SELECT` value on the objects that need it:
`LINE | FACEBOOK | INSTAGRAM | WHATSAPP | EMAIL | WEBCHAT`.

Deliberately not a table. Channels are a closed set that changes when we ship an adapter, which is a
code change anyway. A table would imply tenants can add channels, which they cannot.

### ChannelAccount

One connected provider account: a single LINE Official Account, one Facebook Page, one Instagram
professional account, one WhatsApp Business phone number, one mailbox, one web-chat site.

| Field | Purpose |
| --- | --- |
| `name` | Human label |
| `channel` | Which provider |
| `externalId` | Provider-side account id. LINE `destination`, Meta page id. **This is the tenant routing key.** |
| `isActive` | Whether it sends and receives |

Credentials do **not** live here. They live in app `serverVariables` or a connection provider.
Never in a record, never in code.

### ContactIdentity

One customer handle on one channel. A person legitimately has several.

| Field | Purpose |
| --- | --- |
| `displayName` | As reported by the provider |
| `channel` | Which provider |
| `externalId` | LINE user id, Meta PSID, phone number, email address |
| `avatarUrl` | Provider profile picture |
| `person` | Relation to the Twenty `Person`, nullable |

`person` is nullable on purpose: a message can arrive before anyone knows who sent it. Resolution is
a later step, sometimes a human one.

```
John Smith (Person)
├── LINE      U4af4980629
├── Instagram @johnsmith
├── WhatsApp  +66812345678
└── Email     john@example.com
```

### Conversation

A thread with one customer on one channel.

| Field | Purpose |
| --- | --- |
| `title` | Display name |
| `channel` | Which provider |
| `status` | `OPEN` / `PENDING` / `CLOSED` |
| `externalId` | Provider thread id, for deduplicating redelivered webhooks |
| `lastMessageAt`, `lastMessagePreview`, `unreadCount` | Denormalized, so the list renders in one query |
| `person` | The CRM contact |
| `contactIdentity` | The handle that opened it |
| `channelAccount` | Which of our accounts received it |
| `assignee` | The `WorkspaceMember` responsible |

One conversation per customer per channel, not one per channel per topic. Cross-channel history is
assembled by joining through `Person`, not by merging threads.

### Message

| Field | Purpose |
| --- | --- |
| `body` | Text content |
| `direction` | `INBOUND` / `OUTBOUND` / `INTERNAL` |
| `sentAt` | Provider timestamp, not receipt time |
| `senderName` | Display name of the sender |
| `externalId` | Provider message id, for deduplication |
| `conversation` | Parent thread |

`INTERNAL` covers internal notes, which are messages that are never delivered. Modelling them as a
direction rather than a separate object keeps the thread a single ordered list.

### Attachment — **not yet designed**

Likely a `FILES` field on `Message` rather than a separate object, since Twenty's `FILES` type
already handles storage and signed URLs. Confirm against provider media limits before committing.

### Assignment

Deliberately **not** an object. It is `Conversation.assignee`, a relation to `WorkspaceMember`.

Avoid premature abstraction: a separate `Assignment` object only earns its place when we need
assignment history or multiple simultaneous assignees. Neither is an MVP requirement. Revisit if
SLA reporting arrives.

### Team — **not designed yet**

Twenty has no team primitive today; roles are the closest thing. Options are a custom object, or
Twenty's roles plus row-level permission predicates (an Enterprise-licensed feature). Decide
alongside the Enterprise question in [`ARCHITECTURE.md`](./ARCHITECTURE.md) §8.

### Tag — **not designed yet**

Probably `MULTI_SELECT` on `Conversation` for the MVP, upgraded to a relation if tags need their own
metadata (colour, owner, automation rules). Start with the cheap version.

### InternalNote

Covered by `Message.direction = INTERNAL`. No separate object.

---

## 3. Adapter contract

Each adapter implements the same two directions. Provider knowledge stops here.

### Inbound

```
receive(rawRequest) → NormalizedEvent[]
```

An adapter must:

1. **Verify the signature.** LINE `X-Line-Signature`, Meta `X-Hub-Signature-256`. Reject unverified
   payloads before parsing.
2. **Resolve the tenant** from the provider account identifier, and nothing else.
3. **Parse into normalized events.** One provider payload may carry several.
4. **Be idempotent.** Providers redeliver. Deduplicate on `externalId`.
5. **Never write CRM records.** The engine does that.

```ts
type NormalizedInboundEvent = {
  channel: Channel;
  channelAccountExternalId: string;
  contact: { externalId: string; displayName?: string; avatarUrl?: string };
  conversationExternalId: string;
  message: { externalId: string; body: string; sentAt: string; attachments?: NormalizedAttachment[] };
};
```

### Outbound

```
send(NormalizedOutboundMessage) → { externalId, deliveredAt } | DeliveryFailure
```

The engine hands the adapter a conversation, a body and attachments. The adapter looks up
credentials, translates to the provider's format, calls the API and reports back. It must surface
rate limits and permanent failures distinctly, because retry policy differs.

---

## 4. Per-provider notes

Written down now so the model does not have to change later. **None of this is implemented.**

### LINE Official Account

- One webhook URL for all tenants; route on the `destination` field. This is exactly what Twenty's
  `serverRouteTriggerSettings` resolver is for.
- Verify `X-Line-Signature` (HMAC-SHA256 of the raw body with the channel secret).
- Reply tokens are short-lived and single-use. Anything later than the immediate reply needs the
  push API, which is quota-metered. The engine must not assume replies are free.
- Profile fetch is a separate call; do not expect a display name on the event.

### Meta (Messenger, Instagram, WhatsApp Business Cloud)

- Shared webhook infrastructure, per-product payload shapes. Three adapters or one adapter with
  three parsers, decided when we build it.
- `hub.challenge` verification handshake on subscribe.
- Verify `X-Hub-Signature-256`.
- Onboarding is OAuth, so this uses a connection provider rather than static credentials.
- WhatsApp adds a 24-hour customer service window and template-message rules. That constraint has to
  surface in the UI, not just fail at send time.

### Email

- Twenty already syncs Gmail, Microsoft and IMAP into its own `Message`/`MessageThread` objects.
  **Do not reuse those for omnichannel** — that schema is email-specific and upstream-owned. Read it
  as a reference for participant matching.
- Decide later whether inbox email is a separate adapter or a view over Twenty's existing sync.

### Website live chat

- Our own widget plus a public logic-function route. No provider to verify against, so this one
  carries its own auth and abuse-prevention burden.
- The only channel where we control both ends, so a good place to prototype typing indicators and
  read receipts.

---

## 5. Contact resolution

Matching an incoming handle to a CRM contact:

1. Look up `ContactIdentity` by `(channel, externalId)`. Hit → done.
2. Create the `ContactIdentity` with `person = null`.
3. Attempt a match on a strong signal: exact phone, exact email. Never on display name.
4. No match → leave unresolved. Show it in the UI as an action, do not guess.

Never auto-create a `Person` from a display name. "Somchai" is not an identity, and a CRM full of
duplicate ghosts is worse than an unlinked conversation.

---

## 6. Realtime

Twenty's own record views update live over SSE. The front-component sandbox provides no realtime
transport, so a fully custom pane must poll.

Measured in the prototype: **25ms per fetch at 3 conversations, 5s poll interval.** Re-measure at
500 before deciding. This is one of the arguments for keeping the conversation list a native view
and reserving the front component for the message thread.

Typing indicators and presence are not achievable in a polled front component at acceptable cost.
Treat them as out of scope until the transport question is resolved.

---

## 7. Build order

1. Objects and inbox shell — **done**, `apps/takdai-inbox`
2. Contact resolution and unresolved-identity UI
3. LINE adapter, inbound only
4. LINE adapter, outbound
5. Meta adapters
6. Attachments
7. Assignment, tags, internal notes
8. Web chat widget
9. Email

Each channel after the first is a test of the boundary. If adding Meta requires touching the
conversation engine, the abstraction is wrong and it is cheaper to fix it then than after four
channels.
