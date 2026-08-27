---
name: omnichannel
description: Normalized messaging and channel architecture, and the contract between a messaging layer and this CRM. Use when working on conversations, messages, channel accounts, contact identities, the inbox, AI lead qualification, contact re-identification, or any LINE / Meta / WhatsApp / email / web chat integration.
---

# Omnichannel rules

Full model in `docs/OMNICHANNEL.md`.

## 0. Scope: this is Takdai's, not this repository's

Under D4, Takdai is a separate product built elsewhere and owns the omnichannel layer. The prototype
in `apps/tll-crm` proved the Twenty extension path and is not the product.

These rules are kept for two reasons: the domain model transfers unchanged to whatever builds it, and
TLL will be its first user, so the **contract** between the messaging layer and this CRM has to be
right. Sections 1-4 are that contract. The rest is Twenty-specific and applies only if a messaging
feature is ever built here after all.

## 1. Takdai owns the conversation, the CRM owns the client

One ID, pointing one direction. Takdai stores `crmPersonId` and `crmJobId` and reads the rest from
the CRM when it needs it. **The CRM never learns what LINE is.**

Never mirror contact fields onto a conversation. Never create a parallel contact store.

## 2. Only create a CRM record when the enquiry qualifies

An AI agent greets, establishes what they want, asks **whether they have used the firm before**,
collects a name and a contact method, and judges whether this is a real enquiry. Only on pass does it
create a `Person` and a `Job`.

Otherwise every wrong number and spam message becomes a contact, and the CRM rots within a month.

The agent must not promise anything, quote a price, or give legal advice. Qualification only.

**Everything the AI creates or changes must be attributable**: which model, which prompt version,
what it based the decision on. "The AI made a contact and nobody knows why" is not acceptable in a
law firm.

## 3. Auto-link only on certainty

Twenty has **no record merge and no duplicate detection**, so a wrong link is expensive to undo. In a
law firm it also puts one client's job in front of another client's record, which is a
confidentiality problem, not a data quality problem.

| Signal | Action |
| --- | --- |
| `ContactIdentity(channel, externalId)` hit | Link, certain |
| Exact phone normalized to E.164, exact email, passport or tax ID | Auto-link |
| "Yes I'm an existing client" plus one weak signal | Suggest |
| Fuzzy name match | Suggest only |
| Name alone | **Never link** |

Three things make this work: **just ask** (the agent asks if they are a returning client);
**normalize phone numbers on write** (`0812345678`, `+66812345678`, `081-234-5678` are one person);
and remember that **Thai names defeat naive matching** - romanization varies, everyone uses a
nickname, and Twenty indexes with `to_tsvector('simple', ...)` which cannot tokenize Thai at all. Name
matching happens in Takdai against its own index, never by calling the CRM's search endpoint.

Every auto-link writes a timeline event saying how it matched.

**Suggestions are records**, not ephemeral UI: `MatchSuggestion` with conversation, candidate, score,
reasons and status. Dismissals must stick, or the same wrong suggestion reappears on every message
and staff learn to ignore the prompt.

## 4. `billingEntity` on `ChannelAccount`

A message arriving on the Pattaya Notary LINE account opens a job defaulting to Pattaya Notary.
That default is how the right legal person ends up on the contract without anyone thinking about it.

## 5. No provider logic outside an adapter

```
Provider -> Channel Adapter -> Normalized Event -> Conversation Engine -> Inbox -> CRM
```

If `grep -ri "line\|meta\|whatsapp"` finds matches in the conversation engine, the inbox UI or the
automation layer, the boundary has leaked. Adding the second channel is the test.

**Inbound** must: verify the provider signature before parsing; resolve the tenant from the provider
account id; emit normalized events; be idempotent on `externalId`; never write CRM records itself.

**Outbound** must: look up credentials server-side; translate to the provider format; report delivery
result; distinguish rate limits from permanent failures.

## 6. Avoid premature abstraction

- Assignment is `Conversation.assignee`, a relation. Not an object until assignment history or
  multiple assignees is real.
- Internal notes are `Message.direction = INTERNAL`. Not a separate object.
- Channel is a `SELECT`, not a table. Shipping an adapter is a code change anyway.
- Tags start as `MULTI_SELECT`. Promote when they need their own metadata.

## 7. WhatsApp: official API only

Use the WhatsApp Business Cloud API. Unofficial reverse-engineered clients violate Meta's terms and
get numbers banned. Losing the firm's number is a business outage; doing it to a paying customer's
number is a liability.

## 8. Do not reuse Twenty's Message objects

`Message`, `MessageThread`, `MessageParticipant` and `MessageChannel` exist for email sync. They are
email-specific (`headerMessageId`, `subject`, `isDraft`, folder associations) and upstream-owned.
Read them as a reference for participant matching; model your own.

## 9. If it is ever built inside Twenty after all

- **Multi-tenant webhooks:** one public URL per provider. `serverRouteTriggerSettings` runs a
  resolver in the publisher workspace that maps the provider account id (LINE `destination`, Meta
  page id) to a workspace, then enqueues the handler there with retry and backoff. The routing key
  lives on `ChannelAccount.externalId`.
- **Credentials:** app `serverVariables` or a connection provider. Never in a record, never in code,
  never in a fixture.
- **Realtime:** the front-component sandbox has no realtime transport, so custom panes poll (measured:
  25ms per fetch at 3 conversations, 5s interval, not measured at 500). Native record views update
  over SSE for free, which argues for a native conversation list and a custom thread.
