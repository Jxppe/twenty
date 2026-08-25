---
name: thai-payments
description: Thailand PromptPay, Thai QR and bank transfer payment behaviour. Use when working on payment requests, QR generation, bank transfer flows, payment verification, or any per-organization payment configuration.
---

# Thai payments

Full detail in `docs/PAYMENTS.md`.

## 1. Never hard-code a bank account

Bank accounts, PromptPay identifiers, account names and payment instructions are **configuration,
per `BillingEntity`**. Thailiving Law, Unique X Services and Pattaya Notary each have their own
receiving account, and the invoice's `billingEntity` decides which one the payer sees.

No bank detail may appear in code, a seed, a fixture or a test. Store them in app configuration.

## 2. The payer's bank is not the receiving bank

The bank transfer flow asks which banking app the **payer** will use, only to give them the right
instructions and deep link. The receiving account is ours and usually at a different bank.

```
Customer picks: KBank            <- the payer's app
Destination:    Bangkok Bank     <- our receiving account, from invoice.billingEntity
                Example Company Co., Ltd.
                XXX-X-XXXXX-X
                THB 35,000
                Reference: INV-000123
```

Getting this backwards is the most common mistake in Thai payment UIs.

## 3. PromptPay QR

- Payload is **EMVCo Merchant Presented QR**: nested tag-length-value, PromptPay AID, amount in tag
  54, CRC-16/CCITT-FALSE in tag 63.
- Generate **server-side** in a logic function.
- Render as **SVG**. `<canvas>` renders nothing in the front-component sandbox, silently.
- Use a maintained library and verify its licence. Hand-rolled payloads fail on some banks' scanners
  in ways that are hard to detect.
- Test against more than one bank's app.

## 4. Verification tiers

1. **Manual slip upload plus staff confirmation.** Build this first. Works on day one with no
   third-party agreement, and stays the fallback when a provider is down.
2. **Slip verification API.** Cheap, near-instant, no bank relationship.
3. **Bank or PSP webhook.** Real-time, needs a merchant account.

Never mark an invoice paid on the customer's assertion alone, at any tier.

## 5. Partial payments are normal

Thai B2B pays in instalments. An invoice has many payments. Model it from the start.

A PromptPay QR encodes a fixed amount, so a partial payment needs a new payment request.

## 6. The public payment page

A public logic-function route (`isAuthRequired: false`) returning HTML, reached by an unguessable
`publicToken`, never a sequential id. It expires. It shows only what the payer needs.

Requirements: one-tap copy for account number, amount and reference; bank deep links where
documented, degrading to plain instructions; slip upload when required; the reference must be
prominent, because reconciliation depends on the customer typing it.

**Mobile-first.** This page is opened on a phone next to a banking app, essentially always.

## 7. Thailand-first

PromptPay and Thai bank transfer are the only methods this firm needs. Keep them behind a
payment-method interface anyway, so a card or a foreign transfer for an expat client does not mean
reshaping the invoice model. Do not let Thai assumptions leak into the invoice or payment-request
records themselves.
