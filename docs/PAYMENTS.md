# Payments

Thailand-first payment behaviour. Status: **PROPOSED**. Nothing implemented.

Read [`FINANCE.md`](./FINANCE.md) first for where payments sit in the invoice lifecycle.

---

## 1. Principles

**Per-entity configuration, always.** Bank accounts, PromptPay identifiers, account names and payment
instructions belong to a `BillingEntity` — Thailiving Law, Unique X Services or Pattaya Notary. Each
has its own receiving accounts, and a payment request must present the one matching the invoice's
entity. No bank detail may ever appear in code, a seed, a fixture or a test.

**Thailand only, in practice.** The clients are in Thailand and pay by PromptPay or bank transfer.
Keep the payment method behind an interface so a card processor can be added, but do not build for
markets this firm does not serve.

**The customer's bank is not our bank.** The Thai transfer flow asks which banking app the *payer*
uses, purely to give them the right instructions and deep link. The receiving account is ours and
usually at a different bank. Getting this backwards is the most common mistake in Thai payment UIs.

---

## 2. Model

### PaymentSettings

**Per `BillingEntity`**, configured in app settings, never in code. Three sets of these.

| Field | Notes |
| --- | --- |
| `legalName` | Account holder name as printed on the transfer instruction |
| `promptPayId` | Phone number, national ID, or tax ID |
| `promptPayType` | Which of the three the identifier is |
| `bankAccounts` | One or more receiving accounts |
| `paymentInstructions` | Free text shown to the customer |
| `requiresPaymentProof` | Whether a slip upload is mandatory |

### BankAccount

`bankCode`, `accountName`, `accountNumber`, `isDefault`, `isActive`.

`bankCode` is the standard Thai bank code so the UI can render the right logo and deep link.

### PaymentRequest

Generated from an invoice. This is the thing the customer opens.

| Field | Notes |
| --- | --- |
| `invoice` | Source |
| `amount` | `CURRENCY`. May be partial. |
| `reference` | What the payer must quote. Must be unique and matchable. |
| `method` | `PROMPTPAY` / `BANK_TRANSFER` / others later |
| `status` | `PENDING` / `AWAITING_VERIFICATION` / `PAID` / `EXPIRED` / `CANCELLED` |
| `expiresAt` | PromptPay QR payloads should not live forever |
| `publicToken` | Unguessable token for the public page URL |

### Payment

| Field | Notes |
| --- | --- |
| `paymentRequest`, `invoice` | |
| `amount`, `paidAt` | |
| `method` | |
| `proof` | `FILES`, the uploaded slip |
| `verifiedBy`, `verifiedAt` | Null when automatic |
| `externalRef` | Provider or bank transaction id |

An invoice may have several payments. Partial payment is normal in Thai B2B and must be modelled
from the start, not retrofitted.

---

## 3. PromptPay / Thai QR

```
Invoice ──► PaymentRequest ──► QR payload ──► customer scans in any Thai banking app
                                                        │
                                                        ▼
                                            verification (auto or manual)
                                                        │
                                                        ▼
                                            Payment recorded ──► Invoice PAID
```

### Generating the QR

The payload is **EMVCo Merchant Presented QR**, the same standard used across Thai banking apps.
Structure: nested tag-length-value fields, PromptPay under the AID for domestic transfer, amount in
tag 54, CRC-16/CCITT-FALSE checksum in tag 63.

Generate server-side in a logic function. Render as SVG, not canvas: `<canvas>` renders nothing in
the front-component sandbox, silently.

Choose a well-maintained library rather than hand-rolling the payload, and verify its licence. The
checksum and field ordering are exactly the kind of thing that is subtly wrong and only fails on
some banks' scanners.

Test against more than one bank's app before declaring it working.

### Verification

Three tiers, in increasing order of desirability:

1. **Manual.** Customer uploads a slip; staff confirms. Always available, always the fallback.
2. **Slip verification API.** **Confirmed available to us.** Several Thai providers verify a slip
   image or its embedded reference against the banking network. Cheap, near-instant, no bank
   relationship needed. This is in scope, not speculative.
3. **Bank or PSP webhook.** Real-time settlement notification. Requires a merchant account and per-
   bank integration.

Build tier 1 first: it works for every organization on day one and needs no third-party agreement,
and it is the fallback when tier 2 cannot read a slip. Then add tier 2, which we have access to and
which removes most of the manual work. Tier 3 is a later optimization.

Tier 2 is also the mechanism for **proof of completion**, not just proof of payment: a verified slip
is evidence the transaction actually settled, which is what a client history needs to record.

Whatever the tier, the invoice must never be marked paid on the customer's say-so alone.

---

## 4. Bank transfer

The flow that Thai customers actually expect:

```
Customer opens payment page
        │
        ▼
"Which banking app will you use?"   ← the PAYER's bank
   KBank · SCB · Bangkok Bank · Krungthai · Krungsri · other
        │
        ▼
Transfer instructions for OUR receiving account
   Bangkok Bank
   Example Company Co., Ltd.
   XXX-X-XXXXX-X
   ฿35,000
   Reference: INV-000123
        │
        ├── copy account number
        ├── copy amount
        ├── copy reference
        ├── open banking app (deep link, where supported)
        └── upload payment slip (if required)
        │
        ▼
AWAITING_VERIFICATION ──► verified ──► PAID
```

The payer's bank selection changes the instructions and the deep link, never the destination.

### Interface requirements

- **One-tap copy** for account number, amount and reference. Thai account numbers are long and
  mistyping one is common. `copyToClipboard` is available in the front-component SDK.
- **Deep links where supported.** Not every Thai bank publishes a documented scheme; degrade to
  plain instructions rather than a broken link.
- **Slip upload** when `requiresPaymentProof`. `uploadFile` is available in the SDK.
- **The reference must be prominent.** Reconciliation depends on the customer actually typing it.
- **Mobile first.** This page is opened on a phone, next to a banking app, essentially always.

---

## 5. The customer-facing page

A public, unauthenticated route served by a logic function
(`httpRouteTriggerSettings` with `isAuthRequired: false`), returning HTML.

Verified precedent: `packages/twenty-apps/examples/document-generator/src/logic-functions/view-document.ts`
serves a public printable page exactly this way. No separate web application is needed for the MVP.

Requirements:

- Reached by unguessable `publicToken`, never by sequential invoice id
- Expires
- Shows only what the payer needs: amount, reference, destination, instructions
- Never exposes other customers, other invoices, or internal notes
- Works with no login, on a phone, on a poor connection

---

## 6. Open questions

1. **Which slip verification provider**, what does it cost per check, and what is its failure rate
   on poor-quality slip photos? Tier 1 must absorb whatever tier 2 cannot read.
2. **QR library choice and licence.** Must be verified before use.
3. **PromptPay QR expiry.** How long is reasonable, and what happens to a scan after it?
4. **Partial payments against PromptPay.** The QR encodes a fixed amount; a partial payment needs a
   new request.
5. **Deep link coverage.** Which Thai banks actually publish usable schemes today?
6. **Refunds.** Out of scope for the MVP, but the model should not make them impossible.
