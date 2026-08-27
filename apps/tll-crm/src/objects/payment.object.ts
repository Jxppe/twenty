import { defineObject, FieldType } from 'twenty-sdk/define';

import {
  PAYMENT_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
  PAYMENT_EXTERNAL_REFERENCE_FIELD_UNIVERSAL_IDENTIFIER,
  PAYMENT_METHOD_BANK_TRANSFER_OPTION_ID,
  PAYMENT_METHOD_CARD_OPTION_ID,
  PAYMENT_METHOD_CASH_OPTION_ID,
  PAYMENT_METHOD_FIELD_UNIVERSAL_IDENTIFIER,
  PAYMENT_METHOD_OTHER_OPTION_ID,
  PAYMENT_METHOD_PROMPTPAY_OPTION_ID,
  PAYMENT_NOTES_FIELD_UNIVERSAL_IDENTIFIER,
  PAYMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  PAYMENT_PAID_AT_FIELD_UNIVERSAL_IDENTIFIER,
  PAYMENT_REFERENCE_FIELD_UNIVERSAL_IDENTIFIER,
  PAYMENT_STATUS_CONFIRMED_OPTION_ID,
  PAYMENT_STATUS_FAILED_OPTION_ID,
  PAYMENT_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  PAYMENT_STATUS_PENDING_OPTION_ID
} from 'src/constants/universal-identifiers';

// Money actually received. Confirmation is expected to arrive from FlowAccount
// rather than being asserted here, which is why status is separate from paidAt.
export default defineObject({
  universalIdentifier: PAYMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'payment',
  namePlural: 'payments',
  labelSingular: 'Payment',
  labelPlural: 'Payments',
  description: 'Money received against an invoice',
  icon: 'IconCashBanknote',
  labelIdentifierFieldMetadataUniversalIdentifier: PAYMENT_REFERENCE_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    { universalIdentifier: PAYMENT_REFERENCE_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.TEXT, name: 'reference', label: 'Reference', description: 'Slip reference or transaction id, as the client sent it', icon: 'IconHash' },
    { universalIdentifier: PAYMENT_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.CURRENCY, name: 'amount', label: 'Amount', icon: 'IconCoin' },
    { universalIdentifier: PAYMENT_PAID_AT_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.DATE_TIME, name: 'paidAt', label: 'Paid', icon: 'IconCalendarCheck' },
    { universalIdentifier: PAYMENT_EXTERNAL_REFERENCE_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.TEXT, name: 'externalReference', label: 'FlowAccount ref', icon: 'IconExternalLink' },
    { universalIdentifier: PAYMENT_NOTES_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.TEXT, name: 'notes', label: 'Notes', icon: 'IconNote' },
    { universalIdentifier: PAYMENT_METHOD_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.SELECT, name: 'method', label: 'How', icon: 'IconCreditCard', defaultValue: "'PROMPTPAY'", options: [
      { id: PAYMENT_METHOD_PROMPTPAY_OPTION_ID, value: 'PROMPTPAY', label: 'PromptPay', position: 0, color: 'blue' },
      { id: PAYMENT_METHOD_BANK_TRANSFER_OPTION_ID, value: 'BANK_TRANSFER', label: 'Bank transfer', position: 1, color: 'turquoise' },
      { id: PAYMENT_METHOD_CASH_OPTION_ID, value: 'CASH', label: 'Cash', position: 2, color: 'green' },
      { id: PAYMENT_METHOD_CARD_OPTION_ID, value: 'CARD', label: 'Card', position: 3, color: 'purple' },
      { id: PAYMENT_METHOD_OTHER_OPTION_ID, value: 'OTHER', label: 'Other', position: 4, color: 'gray' },
    ] },
    { universalIdentifier: PAYMENT_STATUS_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.SELECT, name: 'status', label: 'Status', icon: 'IconProgressCheck', defaultValue: "'PENDING'", options: [
      { id: PAYMENT_STATUS_PENDING_OPTION_ID, value: 'PENDING', label: 'Not confirmed', position: 0, color: 'orange' },
      { id: PAYMENT_STATUS_CONFIRMED_OPTION_ID, value: 'CONFIRMED', label: 'Confirmed', position: 1, color: 'green' },
      { id: PAYMENT_STATUS_FAILED_OPTION_ID, value: 'FAILED', label: 'Failed', position: 2, color: 'red' },
    ] },
  ],
});
