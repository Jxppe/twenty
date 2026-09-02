# Twenty workspace data model (source of truth for the Frappe rebuild)

Dumped from the live Twenty workspace metadata API. Every object below is a table the new system has to reproduce in some form. System audit fields (`id`, `createdAt`, `updatedAt`, `deletedAt`, `createdBy`) exist on every object and are omitted. Timeline/attachment/note/task back-relations are omitted for the same reason.

**Naming note.** This is a factual dump of the Twenty workspace, so it uses Twenty's names. The job object is Twenty's `opportunity`, labelled "Job", and link fields pointing at it are called `matter`. In the new system it is the `Job` doctype and the link field is `job`, and `matterDeadline` becomes `Job Deadline`. See the Naming section of `02-FRAPPE-PLAN.md`.

Currency is THB throughout. Money is stored as `amountMicros` (integer, value x 1_000_000) plus a currency code.


## Custom objects (the actual application)

16 custom objects, all under one Twenty application.

### Type of work — `practiceArea` / `practiceAreas`

A kind of work the firm does: visa, property, notarization


| field | type | label | note | detail |
|---|---|---|---|---|
| `name` | TEXT | Name |  |  |
| `isActive` | BOOLEAN | Active |  | default true |
| `matters` | RELATION ONE_TO_MANY -> opportunity | Jobs | Jobs in this practice area |  |
| `defaultBillingEntity` | RELATION MANY_TO_ONE -> billingEntity | Default billing entity | Which entity a job in this practice area bills to unless overridden | fk `defaultBillingEntityId`; onDelete SET_NULL |
| `workLogs` | RELATION ONE_TO_MANY -> workLog | Work logs | Work logged against this category |  |

### Service — `product` / `products`

Something the firm charges for, and what it normally costs


| field | type | label | note | detail |
|---|---|---|---|---|
| `name` | TEXT | Service |  |  |
| `code` | TEXT | Code | Optional short reference used on documents |  |
| `description` | TEXT | Description | Copied onto a quotation line as its starting text |  |
| `taxRate` | NUMBER | Tax rate | Percent. Twenty has no tax concept, so this is ours |  |
| `category` | TEXT | Category |  |  |
| `isActive` | BOOLEAN | Offered | Turn off to retire it. Old documents must keep resolving | default true |
| `unit` | SELECT | Charged per |  | options: ITEM, HOUR, CASE, MONTH; default "ITEM" |
| `quotationLineItems` | RELATION ONE_TO_MANY -> quotationLineItem | Quoted on | Quotation lines drawn from this service |  |
| `invoiceLineItems` | RELATION ONE_TO_MANY -> invoiceLineItem | Invoiced on | Invoice lines drawn from this service |  |
| `unitPrice` | CURRENCY | Price |  | default {"amountMicros": null, "currencyCode": "THB"} |

### Billing entity — `billingEntity` / `billingEntities`

One of the firm’s legal entities, as it appears on a contract


| field | type | label | note | detail |
|---|---|---|---|---|
| `name` | TEXT | Name | Short name used across the CRM |  |
| `legalName` | TEXT | Legal name | Registered name as it must appear on invoices |  |
| `taxId` | TEXT | Tax ID | Thai taxpayer identification number |  |
| `isActive` | BOOLEAN | Active | Whether new work can be billed to this entity | default true |
| `practiceAreas` | RELATION ONE_TO_MANY -> practiceArea | Types of work | Types of work that default to this entity |  |
| `bookings` | RELATION ONE_TO_MANY -> booking | Bookings | Appointments taken by this entity |  |
| `matters` | RELATION ONE_TO_MANY -> opportunity | Jobs | Jobs billed to this entity |  |
| `workLogs` | RELATION ONE_TO_MANY -> workLog | Work logs | Time recorded under this entity |  |
| `invoices` | RELATION ONE_TO_MANY -> invoice | Invoices | Issued by this entity |  |
| `payments` | RELATION ONE_TO_MANY -> payment | Payments | Received by this entity |  |
| `quotations` | RELATION ONE_TO_MANY -> quotation | Quotations | Quoted under this entity |  |

### Quotation — `quotation` / `quotations`

What the firm offered to do, for how much


| field | type | label | note | detail |
|---|---|---|---|---|
| `number` | TEXT | Number | Allocated per billing entity, gap-free |  |
| `validUntil` | DATE_TIME | Valid until |  |  |
| `sentAt` | DATE_TIME | Sent |  |  |
| `decidedAt` | DATE_TIME | Answered | When the client accepted or declined |  |
| `notes` | TEXT | Notes |  |  |
| `pdf` | FILES | Document |  | max 5 files |
| `status` | SELECT | Status |  | options: DRAFT, SENT, ACCEPTED, DECLINED, EXPIRED; default "DRAFT" |
| `name` | TEXT | Name | Name |  |
| `person` | RELATION MANY_TO_ONE -> person | Client | Who it was quoted to | fk `personId`; onDelete SET_NULL |
| `billingEntity` | RELATION MANY_TO_ONE -> billingEntity | Billing entity | Which company is contracting. Required in practice | fk `billingEntityId`; onDelete SET_NULL |
| `matter` | RELATION MANY_TO_ONE -> opportunity | Job | The job this quotes for | fk `matterId`; onDelete SET_NULL |
| `company` | RELATION MANY_TO_ONE -> company | Organization | When the client is contracting through a company | fk `companyId`; onDelete SET_NULL |
| `invoices` | RELATION ONE_TO_MANY -> invoice | Invoices | Raised from this quotation |  |
| `lineItems` | RELATION ONE_TO_MANY -> quotationLineItem | Lines | What is being charged for |  |
| `subtotal` | CURRENCY | Subtotal |  | default {"amountMicros": null, "currencyCode": "THB"} |
| `discount` | CURRENCY | Discount |  | default {"amountMicros": null, "currencyCode": "THB"} |
| `tax` | CURRENCY | Tax |  | default {"amountMicros": null, "currencyCode": "THB"} |
| `total` | CURRENCY | Total |  | default {"amountMicros": null, "currencyCode": "THB"} |

### Quotation line — `quotationLineItem` / `quotationLineItems`

One charged item


| field | type | label | note | detail |
|---|---|---|---|---|
| `taxRate` | NUMBER | Tax rate |  |  |
| `name` | TEXT | Name | Name |  |
| `lineTotal` | CURRENCY | Line total |  | default {"amountMicros": null, "currencyCode": "THB"} |
| `quantity` | NUMBER | Quantity |  | default 1 |
| `description` | TEXT | Description |  |  |
| `product` | RELATION MANY_TO_ONE -> product | Service | Where the text and price came from | fk `productId`; onDelete SET_NULL |
| `quotation` | RELATION MANY_TO_ONE -> quotation | Quotation |  | fk `quotationId`; onDelete CASCADE |
| `unitPrice` | CURRENCY | Unit price |  | default {"amountMicros": null, "currencyCode": "THB"} |
| `discount` | CURRENCY | Discount |  | default {"amountMicros": null, "currencyCode": "THB"} |

### Invoice — `invoice` / `invoices`

What the client owes, and against which job


| field | type | label | note | detail |
|---|---|---|---|---|
| `number` | TEXT | Number |  |  |
| `issuedAt` | DATE_TIME | Issued |  |  |
| `dueDate` | DATE_TIME | Due |  |  |
| `externalReference` | TEXT | FlowAccount ref | Their document id. We point at it, we never copy their ledger |  |
| `externalUrl` | TEXT | Open in FlowAccount |  |  |
| `notes` | TEXT | Notes |  |  |
| `pdf` | FILES | Document |  | max 5 files |
| `status` | SELECT | Status |  | options: DRAFT, ISSUED, PARTIALLY_PAID, PAID, OVERDUE, VOID; default "DRAFT" |
| `name` | TEXT | Name | Name |  |
| `payments` | RELATION ONE_TO_MANY -> payment | Payments | Money received against this invoice |  |
| `billingEntity` | RELATION MANY_TO_ONE -> billingEntity | Billing entity | Which company is invoicing | fk `billingEntityId`; onDelete SET_NULL |
| `matter` | RELATION MANY_TO_ONE -> opportunity | Job | The job being billed | fk `matterId`; onDelete SET_NULL |
| `lineItems` | RELATION ONE_TO_MANY -> invoiceLineItem | Lines | What is being charged for |  |
| `person` | RELATION MANY_TO_ONE -> person | Client | Who is being billed | fk `personId`; onDelete SET_NULL |
| `quotation` | RELATION MANY_TO_ONE -> quotation | From quotation | Copied from, not linked to: editing the quotation afterwards must not move the invoice | fk `quotationId`; onDelete SET_NULL |
| `company` | RELATION MANY_TO_ONE -> company | Organization | When the bill goes to a company | fk `companyId`; onDelete SET_NULL |
| `total` | CURRENCY | Total |  | default {"amountMicros": null, "currencyCode": "THB"} |
| `subtotal` | CURRENCY | Subtotal |  | default {"amountMicros": null, "currencyCode": "THB"} |
| `discount` | CURRENCY | Discount |  | default {"amountMicros": null, "currencyCode": "THB"} |
| `tax` | CURRENCY | Tax |  | default {"amountMicros": null, "currencyCode": "THB"} |
| `amountPaid` | CURRENCY | Paid |  | default {"amountMicros": null, "currencyCode": "THB"} |

### Invoice line — `invoiceLineItem` / `invoiceLineItems`

One charged item


| field | type | label | note | detail |
|---|---|---|---|---|
| `description` | TEXT | Description |  |  |
| `quantity` | NUMBER | Quantity |  | default 1 |
| `taxRate` | NUMBER | Tax rate |  |  |
| `name` | TEXT | Name | Name |  |
| `invoice` | RELATION MANY_TO_ONE -> invoice | Invoice |  | fk `invoiceId`; onDelete CASCADE |
| `product` | RELATION MANY_TO_ONE -> product | Service | Where the text and price came from | fk `productId`; onDelete SET_NULL |
| `unitPrice` | CURRENCY | Unit price |  | default {"amountMicros": null, "currencyCode": "THB"} |
| `discount` | CURRENCY | Discount |  | default {"amountMicros": null, "currencyCode": "THB"} |
| `lineTotal` | CURRENCY | Line total |  | default {"amountMicros": null, "currencyCode": "THB"} |

### Payment — `payment` / `payments`

Money received against an invoice


| field | type | label | note | detail |
|---|---|---|---|---|
| `reference` | TEXT | Reference | Slip reference or transaction id, as the client sent it |  |
| `paidAt` | DATE_TIME | Paid |  |  |
| `externalReference` | TEXT | FlowAccount ref |  |  |
| `notes` | TEXT | Notes |  |  |
| `method` | SELECT | How |  | options: PROMPTPAY, BANK_TRANSFER, CASH, CARD, OTHER; default "PROMPTPAY" |
| `status` | SELECT | Status |  | options: PENDING, CONFIRMED, FAILED; default "PENDING" |
| `name` | TEXT | Name | Name |  |
| `invoice` | RELATION MANY_TO_ONE -> invoice | Invoice | What this pays for | fk `invoiceId`; onDelete SET_NULL |
| `billingEntity` | RELATION MANY_TO_ONE -> billingEntity | Billing entity | Which company received it | fk `billingEntityId`; onDelete SET_NULL |
| `amount` | CURRENCY | Amount |  | default {"amountMicros": null, "currencyCode": "THB"} |

### Booking — `booking` / `bookings`

A consultation or appointment with a client


| field | type | label | note | detail |
|---|---|---|---|---|
| `title` | TEXT | Booking | What it is, as it should read in a calendar cell |  |
| `startsAt` | DATE_TIME | Starts |  |  |
| `endsAt` | DATE_TIME | Ends |  |  |
| `status` | SELECT | Status |  | options: REQUESTED, CONFIRMED, RESCHEDULED, COMPLETED, CANCELLED, NO_SHOW; default "REQUESTED" |
| `service` | SELECT | Service |  | options: CONSULTATION, FOLLOW_UP, NOTARIZATION, SIGNING; default "CONSULTATION" |
| `location` | SELECT | Location |  | options: OFFICE, ONLINE, CLIENT_SITE; default "OFFICE" |
| `notes` | TEXT | Notes |  |  |
| `name` | TEXT | Name | Name |  |
| `responsible` | RELATION MANY_TO_ONE -> workspaceMember | Staff | Who is taking this appointment | fk `responsibleId`; onDelete SET_NULL |
| `person` | RELATION MANY_TO_ONE -> person | Client | Who the appointment is with | fk `personId`; onDelete SET_NULL |
| `billingEntity` | RELATION MANY_TO_ONE -> billingEntity | Billing entity | Which company is taking the appointment | fk `billingEntityId`; onDelete SET_NULL |
| `fee` | CURRENCY | Fee | Charged for the appointment itself, if anything | default {"amountMicros": null, "currencyCode": "THB"} |
| `matter` | RELATION MANY_TO_ONE -> opportunity | Job | What it is about, if there is a job yet | fk `matterId`; onDelete SET_NULL |
| `workLogs` | RELATION ONE_TO_MANY -> workLog | Work logs | Time recorded against this appointment |  |

### Deadline — `matterDeadline` / `matterDeadlines`

A date a job has to hit, and who is answerable for it


| field | type | label | note | detail |
|---|---|---|---|---|
| `title` | TEXT | Deadline | What is due, in the words someone would use out loud |  |
| `dueAt` | DATE_TIME | Due |  |  |
| `deadlineType` | SELECT | Type | Where the obligation comes from | options: STATUTORY, COURT, CLIENT_COMMITTED, INTERNAL; default "INTERNAL" |
| `isCritical` | BOOLEAN | Critical | Missing this one has consequences that cannot be undone | default false |
| `completedAt` | DATE_TIME | Completed | Empty means still outstanding |  |
| `notes` | TEXT | Notes |  |  |
| `name` | TEXT | Name | Name |  |
| `responsible` | RELATION MANY_TO_ONE -> workspaceMember | Responsible | Who is answerable for hitting this date | fk `responsibleId`; onDelete SET_NULL |
| `matter` | RELATION MANY_TO_ONE -> opportunity | Job | The job this deadline belongs to | fk `matterId`; onDelete CASCADE |

### Required document — `requiredDocument` / `requiredDocuments`

Something the client has to give us before the work can move


| field | type | label | note | detail |
|---|---|---|---|---|
| `requestedAt` | DATE_TIME | Requested |  |  |
| `receivedAt` | DATE_TIME | Received |  |  |
| `file` | FILES | File |  | max 10 files |
| `notes` | TEXT | Notes |  |  |
| `name` | TEXT | Document |  |  |
| `status` | SELECT | Status |  | options: REQUESTED, RECEIVED, VERIFIED, REJECTED; default "REQUESTED" |
| `matter` | RELATION MANY_TO_ONE -> opportunity | Job | The job this document is needed for | fk `matterId`; onDelete CASCADE |

### Work log — `workLog` / `workLogs`

What a member of staff did, for whom, and how long it took


| field | type | label | note | detail |
|---|---|---|---|---|
| `description` | TEXT | Work | One line, as it should read in a week to someone who was not there |  |
| `workedOn` | DATE | Date | The day the work happened, not the day it was logged |  |
| `minutes` | NUMBER | Minutes | Minutes rather than hours: nobody rounds 20 minutes up to 0.5 |  |
| `isBillable` | BOOLEAN | Billable |  | default true |
| `name` | TEXT | Name | Name |  |
| `billingEntity` | RELATION MANY_TO_ONE -> billingEntity | Billing entity | Which of the three the work was done under | fk `billingEntityId`; onDelete SET_NULL |
| `matter` | RELATION MANY_TO_ONE -> opportunity | Job | The job the work was against | fk `matterId`; onDelete SET_NULL |
| `person` | RELATION MANY_TO_ONE -> person | Client | For work that is not against a job yet | fk `personId`; onDelete SET_NULL |
| `booking` | RELATION MANY_TO_ONE -> booking | Booking | The appointment this came out of, when it came out of one | fk `bookingId`; onDelete SET_NULL |
| `staff` | RELATION MANY_TO_ONE -> workspaceMember | Staff | Who did the work | fk `staffId`; onDelete SET_NULL |
| `notes` | TEXT | Notes | Where it stands, for whoever reads this next |  |
| `practiceArea` | RELATION MANY_TO_ONE -> practiceArea | Category | The kind of work this was | fk `practiceAreaId`; onDelete SET_NULL |
| `status` | SELECT | Status | Where this piece of work got to | options: NOT_STARTED, IN_PROGRESS, DONE, POSTPONED, CANCELLED; default "IN_PROGRESS" |

### Channel account — `channelAccount` / `channelAccounts`

A connected messaging account, such as one LINE Official Account or one Facebook Page


| field | type | label | note | detail |
|---|---|---|---|---|
| `name` | TEXT | Name | Human-readable name of the connected account |  |
| `channel` | SELECT | Channel | Which messaging provider this account belongs to | options: LINE, FACEBOOK, INSTAGRAM, WHATSAPP, EMAIL, WEBCHAT; default "LINE" |
| `externalId` | TEXT | Provider account ID | The provider-side identifier of this account (LINE destination, Meta page id) |  |
| `isActive` | BOOLEAN | Active | Whether this account currently receives and sends messages | default true |
| `conversations` | RELATION ONE_TO_MANY -> conversation | Conversations | Conversations received on this account |  |

### Contact identity — `contactIdentity` / `contactIdentities`

One customer handle on one channel. A person can hold several: a LINE user id, an Instagram handle, a phone number


| field | type | label | note | detail |
|---|---|---|---|---|
| `displayName` | TEXT | Display name | The name the provider reports for this handle |  |
| `channel` | SELECT | Channel | Which messaging provider this handle belongs to | options: LINE, FACEBOOK, INSTAGRAM, WHATSAPP, EMAIL, WEBCHAT; default "LINE" |
| `externalId` | TEXT | Provider handle | The provider-side identifier of the customer, such as a LINE user id |  |
| `avatarUrl` | TEXT | Avatar URL | Profile picture reported by the provider |  |
| `name` | TEXT | Name | Name |  |
| `person` | RELATION MANY_TO_ONE -> person | Contact | The CRM contact this handle resolves to | fk `personId`; onDelete SET_NULL |
| `conversations` | RELATION ONE_TO_MANY -> conversation | Conversations | Conversations opened by this handle |  |

### Conversation — `conversation` / `conversations`

A thread of messages with one customer on one channel


| field | type | label | note | detail |
|---|---|---|---|---|
| `title` | TEXT | Title | Display name of the conversation, usually the customer name reported by the channel |  |
| `channel` | SELECT | Channel | Which messaging provider this conversation arrived on | options: LINE, FACEBOOK, INSTAGRAM, WHATSAPP, EMAIL, WEBCHAT; default "LINE" |
| `status` | SELECT | Status | Where the conversation sits in the handling workflow | options: OPEN, PENDING, CLOSED; default "OPEN" |
| `lastMessageAt` | DATE_TIME | Last message at | Timestamp of the most recent message in the thread |  |
| `lastMessagePreview` | TEXT | Last message | Cached first line of the most recent message |  |
| `unreadCount` | NUMBER | Unread | Number of inbound messages not yet read by an agent | default 0 |
| `externalId` | TEXT | Provider thread ID | Provider-side thread identifier, used to deduplicate incoming events |  |
| `name` | TEXT | Name | Name |  |
| `person` | RELATION MANY_TO_ONE -> person | Contact | The CRM contact this conversation belongs to | fk `personId`; onDelete SET_NULL |
| `assignee` | RELATION MANY_TO_ONE -> workspaceMember | Assignee | Agent currently responsible for this conversation | fk `assigneeId`; onDelete SET_NULL |
| `messages` | RELATION ONE_TO_MANY -> inboxMessage | Messages | Messages in this conversation |  |
| `channelAccount` | RELATION MANY_TO_ONE -> channelAccount | Channel account | The connected account this conversation arrived on | fk `channelAccountId`; onDelete SET_NULL |
| `contactIdentity` | RELATION MANY_TO_ONE -> contactIdentity | Channel identity | The channel handle that opened this conversation | fk `contactIdentityId`; onDelete SET_NULL |

### Inbox message — `inboxMessage` / `inboxMessages`

A single message inside a conversation


| field | type | label | note | detail |
|---|---|---|---|---|
| `body` | TEXT | Body | Text content of the message |  |
| `direction` | SELECT | Direction | Whether the customer sent it, an agent sent it, or it is an internal note | options: INBOUND, OUTBOUND, INTERNAL; default "INBOUND" |
| `sentAt` | DATE_TIME | Sent at | When the provider reports the message was sent |  |
| `senderName` | TEXT | Sender | Display name of whoever sent the message |  |
| `externalId` | TEXT | Provider message ID | Provider-side message identifier, used to deduplicate redelivered webhooks |  |
| `name` | TEXT | Name | Name |  |
| `conversation` | RELATION MANY_TO_ONE -> conversation | Conversation | The thread this message belongs to | fk `conversationId`; onDelete CASCADE |


## Standard Twenty objects in use (with customisations)

### Note — `note` / `notes`

A note


| field | type | label | note | detail |
|---|---|---|---|---|
| `title` | TEXT | Title | Note title |  |
| `bodyV2` | RICH_TEXT | Body | Note body |  |
| `noteTargets` | RELATION ONE_TO_MANY -> noteTarget | Relations | Note targets |  |

### Task — `task` / `tasks`

A task


| field | type | label | note | detail |
|---|---|---|---|---|
| `title` | TEXT | Title | Task title |  |
| `bodyV2` | RICH_TEXT | Body | Task body |  |
| `dueAt` | DATE_TIME | Due Date | Task due date |  |
| `status` | SELECT | Status | Task status | options: TODO, IN_PROGRESS, DONE; default "TODO" |
| `taskTargets` | RELATION ONE_TO_MANY -> taskTarget | Relations | Task targets |  |
| `assignee` | RELATION MANY_TO_ONE -> workspaceMember | Assignee | Task assignee | fk `assigneeId`; onDelete SET_NULL |

### Opportunity — `opportunity` / `opportunities`

An opportunity


| field | type | label | note | detail |
|---|---|---|---|---|
| `name` | TEXT | Name | The opportunity name |  |
| `closeDate` | DATE_TIME | Close date | Opportunity close date |  |
| `stage` | SELECT | Stage | Opportunity stage | options: NEW, SCREENING, MEETING, PROPOSAL, CUSTOMER; default "NEW" |
| `owner` | RELATION MANY_TO_ONE -> workspaceMember | Owner | Opportunity owner | fk `ownerId`; onDelete SET_NULL |
| `closedAt` | DATE_TIME | Closed | Empty means still open |  |
| `openedAt` | DATE_TIME | Opened | When the firm took this on, which is not when the record was created |  |
| `billingEntity` | RELATION MANY_TO_ONE -> billingEntity | Billing entity | The legal party to this engagement | fk `billingEntityId`; onDelete SET_NULL |
| `requiredDocuments` | RELATION ONE_TO_MANY -> requiredDocument | Required documents | What we are waiting on from the client |  |
| `matterDeadlines` | RELATION ONE_TO_MANY -> matterDeadline | Deadlines | Dates this job has to hit |  |
| `bookings` | RELATION ONE_TO_MANY -> booking | Bookings | Appointments about this job |  |
| `workLogs` | RELATION ONE_TO_MANY -> workLog | Work logs | Time recorded against this job |  |
| `practiceArea` | RELATION MANY_TO_ONE -> practiceArea | Type of work | The kind of work this job is | fk `practiceAreaId`; onDelete SET_NULL |
| `invoices` | RELATION ONE_TO_MANY -> invoice | Invoices | Billed against this job |  |
| `quotations` | RELATION ONE_TO_MANY -> quotation | Quotations | What was offered for this job |  |
| `pointOfContact` | RELATION MANY_TO_ONE -> person | Point of Contact | Opportunity point of contact | fk `pointOfContactId`; onDelete SET_NULL |
| `company` | RELATION MANY_TO_ONE -> company | Company | Opportunity company | fk `companyId`; onDelete SET_NULL |
| `amount` | CURRENCY | Amount | Opportunity amount | default {"amountMicros": null, "currencyCode": "THB"} |

### Company — `company` / `companies`

A company


| field | type | label | note | detail |
|---|---|---|---|---|
| `name` | TEXT | Name | The company name |  |
| `domainName` | LINKS | Domain Name | The company website URL. We use this url to fetch the company icon | max 1 files |
| `address` | ADDRESS | Address | Address of the company |  |
| `linkedinLink` | LINKS | Linkedin | The company Linkedin account |  |
| `annualRevenue` | CURRENCY | Annual Revenue | The company's total annual revenue |  |
| `people` | RELATION ONE_TO_MANY -> person | People | People linked to the company. |  |
| `accountOwner` | RELATION MANY_TO_ONE -> workspaceMember | Account Owner | Your team member responsible for managing the company account | fk `accountOwnerId`; onDelete SET_NULL |
| `opportunities` | RELATION ONE_TO_MANY -> opportunity | Opportunities | Opportunities linked to the company. |  |
| `nameTh` | TEXT | Name (TH) | The registered Thai name, as it appears on the DBD record |  |
| `quotations` | RELATION ONE_TO_MANY -> quotation | Quotations | Quoted to this organization |  |
| `invoices` | RELATION ONE_TO_MANY -> invoice | Invoices | Billed to this organization |  |

### Person — `person` / `people`

A person


| field | type | label | note | detail |
|---|---|---|---|---|
| `name` | FULL_NAME | Name | Contact's name |  |
| `emails` | EMAILS | Emails | Contact's Emails | max 1 files |
| `linkedinLink` | LINKS | Linkedin | Contact's Linkedin account |  |
| `jobTitle` | TEXT | Job Title | Contact's job title |  |
| `phones` | PHONES | Phones | Contact's phone numbers | max 1 files |
| `calendarEventParticipants` | RELATION ONE_TO_MANY -> calendarEventParticipant | Calendar Event Participants | Calendar Event Participants |  |
| `company` | RELATION MANY_TO_ONE -> company | Company | Contact's company | fk `companyId`; onDelete SET_NULL |
| `listMemberships` | RELATION ONE_TO_MANY -> messageListMember | Lists | Lists the contact belongs to |  |
| `messageParticipants` | RELATION ONE_TO_MANY -> messageParticipant | Message Participants | Message Participants |  |
| `pointOfContactForOpportunities` | RELATION ONE_TO_MANY -> opportunity | Opportunities | List of opportunities for which that person is the point of contact |  |
| `conversations` | RELATION ONE_TO_MANY -> conversation | Conversations | Omnichannel conversations with this contact |  |
| `contactIdentities` | RELATION ONE_TO_MANY -> contactIdentity | Channel identities | Channel handles known to belong to this contact |  |
| `bookings` | RELATION ONE_TO_MANY -> booking | Bookings | Appointments with this client |  |
| `workLogs` | RELATION ONE_TO_MANY -> workLog | Work logs | Time recorded against this client |  |
| `nameTh` | FULL_NAME | Name (TH) | As written in Thai, when the client has a Thai name |  |
| `quotations` | RELATION ONE_TO_MANY -> quotation | Quotations | Quoted to this client |  |
| `invoices` | RELATION ONE_TO_MANY -> invoice | Invoices | Billed to this client |  |
