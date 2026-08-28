# Takdai

Starting brief for the omnichannel product, to be built in its own repository.

This is written from the CRM side, by someone who has just built the other half. It says what Takdai
has to be so the two fit together, and what is already decided so it is not re-litigated. It is not a
product plan: the market, the pricing and the roadmap are yours.

---

## 1. What it is

**Takdai is the messaging product. The CRM is not.**

That split is [`docs/DECISIONS.md`](./docs/DECISIONS.md) D4 in the TLL CRM repository, and the
reasoning holds: a CRM that grows a chat client becomes a worse CRM and a bad chat client. Takdai
owns conversations, channels, message history, AI qualification and the agent inbox. The CRM owns
clients, jobs, deadlines, documents and money.

**It is a suite, not an application.** The model to copy is Freshworks: an omnichannel product and a
CRM product, sold separately, at several tiers, sharing an identity and a look. Thailiving Law is the
first tenant of one of them, not the reason for it.

---

## 2. The one hard constraint: it must embed

Twenty renders app screens as **front components** in a sandbox: a Web Worker plus Remote DOM. That
sandbox cannot host a foreign application. What it can do, VERIFIED against Twenty's renderer, is
render an `<iframe>` with a host-enforced sandbox attribute.

So the chat inside the CRM is Takdai in a frame. Four requirements follow, and all four are cheap now
and expensive later:

**Frameable.** No `X-Frame-Options: DENY`. Serve
`Content-Security-Policy: frame-ancestors https://crm.tllcrm.fyi` and whatever other hosts embed it.

**Authenticated by a short-lived token in the URL, never a cookie.** The host strips
`allow-same-origin` from every framed page, whatever the embedding component asks for. The frame
therefore runs in an opaque origin with no cookies at all.

**No browser storage.** `localStorage`, `sessionStorage` and IndexedDB are unavailable in an opaque
origin. Session state lives in memory for the life of the frame; a reload takes a new token.

**`postMessage` from the frame arrives with origin `"null"`.** It cannot be used as identity, and
there is no path from the frame back into the CRM page anyway: Twenty bridges only three non-React
events to a front component and `message` is not among them. **Anything the frame needs to do to the
CRM goes server to server**, from Takdai's backend to the CRM's API.

Realtime is fine. The no-realtime rule in Twenty's app sandbox constrains component code, not a
frame. Inside the iframe, Takdai is an ordinary web app: WebSockets and SSE work.

---

## 3. What the CRM already provides

Built and deployed, so build to these rather than inventing parallel ones. Definitions live in
`apps/tll-crm/src/objects/` in the CRM repository.

| Object | Holds |
| --- | --- |
| `contactIdentity` | `channel`, `externalId`, `displayName`, and a link to a person. The handle-to-client mapping |
| `conversation` | Channel, status, assignee, last message time and preview, external id |
| `inboxMessage` | Body, direction, sender, sent time |
| `channelAccount` | A connected channel |
| `person` | The client. Carries `name` and `nameTh`, both spellings |
| `opportunity` | Relabelled **Job**. The work |

The prototype inbox in the CRM stores messages itself. **That is scaffolding.** Once Takdai exists,
the CRM should hold a reference and a summary, not a copy of the message history. Two systems holding
the same messages is the failure the whole architecture is arranged to avoid.

---

## 4. The integration, concretely

**One route, not four API calls.** The CRM will expose a server route so that "this lead is real,
make them a client" is a single call that creates the person, the contact identity, the job and a
timeline entry together. Takdai calling four REST endpoints in sequence produces half-created clients
the first time one fails.

Takdai sends, roughly: channel, external id, display name, name in both scripts if known, phone,
what the lead wants, the qualification summary, and the token of the staff member who clicked.

**Attribution needs care.** Twenty authenticates integrations with an API key, and a key is one
identity, so `createdBy` on everything Takdai creates will read as the integration rather than the
person. The token minted for the frame identifies the workspace member, so send it back and the CRM
stores it in a field of its own. The built-in field stays honest about the mechanism; ours is honest
about the person.

**Direction of travel.** Takdai pushes to the CRM. The CRM does not poll Takdai. When the CRM needs
conversation detail it links out to the frame.

---

## 5. Decisions already taken, and why

Reversing these is allowed; doing so accidentally is not.

**Thai and English names are two fields, not one.** A Thai passport carries both, romanisation
recovers neither from the other, and the land office wants one while the visa file wants the other.
Whatever Takdai captures from a chat should follow the same shape.

**Plain English in the interface.** The people using this read English as a second language. Prefer
the plain word to the term of art, and watch for common words carrying uncommon meanings: "Practice"
reads as rehearsing, "Outstanding" reads as excellent. Those are worse than obvious jargon because
nobody thinks to ask.

**Thai must be a real option, not an afterthought.** Twenty could not do this cheaply because its
locale list is compiled in and upstream declined new locales. Takdai should carry `th-TH` from the
first commit, when it costs nothing.

**Twenty cannot index Thai text.** Its search builds on `to_tsvector('simple', ...)`, which has no
Thai word boundaries. If Takdai searches message bodies, that is Takdai's problem to solve properly,
and it is a real differentiator for a Thai market.

**One source of truth per fact.** The CRM holds an external reference to FlowAccount and never
mirrors its ledger. Apply the same discipline between Takdai and the CRM: messages are Takdai's,
clients are the CRM's, and neither copies the other's.

---

## 6. What to look at before writing code

**Chatwoot** is the closest working reference for the agent inbox: conversation assignment, canned
replies, the shape of a multi-channel inbox. It is **MIT for the core**, but check the licence of any
file before copying, and prefer reading it for structure over lifting from it.

The CRM's [`docs/OMNICHANNEL.md`](./docs/OMNICHANNEL.md) is the normalized channel model already
worked through: how LINE, Meta, WhatsApp, email and web chat reduce to one conversation shape, and
where contact re-identification goes. It was written for this.

---

## 7. Sequencing, opinionated

1. **One channel end to end.** LINE, since it is most of the volume. Receive, display, reply, assign.
   A second channel added later proves the abstraction; adding three at once proves nothing.
2. **The agent inbox.** Assignment, unread state, who is handling what.
3. **Embedding.** The four requirements in §2, plus the token endpoint. Do it early, because
   retrofitting cookie-free auth is painful.
4. **The CRM handoff.** The one route, and the create-client button.
5. **AI qualification.** Highest value and most work, and it needs real conversations to be worth
   anything.

The thing to resist is building all channels before one of them is genuinely good.

---

## 8. Open questions

- Does a firm map to a tenant, or does a tenant hold several firms? Thailiving Law is one company
  with three legal entities, and the answer shapes the data model on day one.
- Who owns the message retention policy? A law firm may have obligations a general SaaS does not.
- Is the AI qualification per tenant or per channel, and who pays for the tokens?
