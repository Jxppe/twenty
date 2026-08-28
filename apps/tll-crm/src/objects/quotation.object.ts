import { defineObject, FieldType } from 'twenty-sdk/define';

import {
  QUOTATION_DECIDED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  QUOTATION_DISCOUNT_FIELD_UNIVERSAL_IDENTIFIER,
  QUOTATION_NOTES_FIELD_UNIVERSAL_IDENTIFIER,
  QUOTATION_NUMBER_FIELD_UNIVERSAL_IDENTIFIER,
  QUOTATION_OBJECT_UNIVERSAL_IDENTIFIER,
  QUOTATION_PDF_FIELD_UNIVERSAL_IDENTIFIER,
  QUOTATION_SENT_AT_FIELD_UNIVERSAL_IDENTIFIER,
  QUOTATION_STATUS_ACCEPTED_OPTION_ID,
  QUOTATION_STATUS_DECLINED_OPTION_ID,
  QUOTATION_STATUS_DRAFT_OPTION_ID,
  QUOTATION_STATUS_EXPIRED_OPTION_ID,
  QUOTATION_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  QUOTATION_STATUS_SENT_OPTION_ID,
  QUOTATION_SUBTOTAL_FIELD_UNIVERSAL_IDENTIFIER,
  QUOTATION_TAX_FIELD_UNIVERSAL_IDENTIFIER,
  QUOTATION_TOTAL_FIELD_UNIVERSAL_IDENTIFIER,
  QUOTATION_VALID_UNTIL_FIELD_UNIVERSAL_IDENTIFIER
} from 'src/constants/universal-identifiers';

// Totals are stored, never recomputed on read. A quotation the client has seen
// must not change because someone edited the price list afterwards.
export default defineObject({
  universalIdentifier: QUOTATION_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'quotation',
  namePlural: 'quotations',
  labelSingular: 'Quotation',
  labelPlural: 'Quotations',
  description: 'What the firm offered to do, for how much',
  icon: 'IconFileDollar',
  labelIdentifierFieldMetadataUniversalIdentifier: QUOTATION_NUMBER_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    { universalIdentifier: QUOTATION_NUMBER_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.TEXT, name: 'number', label: 'Number', description: 'Allocated per billing entity, gap-free', icon: 'IconHash' },
    { universalIdentifier: QUOTATION_VALID_UNTIL_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.DATE_TIME, name: 'validUntil', label: 'Valid until', icon: 'IconCalendarX' },
    { universalIdentifier: QUOTATION_SENT_AT_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.DATE_TIME, name: 'sentAt', label: 'Sent', icon: 'IconSend' },
    { universalIdentifier: QUOTATION_DECIDED_AT_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.DATE_TIME, name: 'decidedAt', label: 'Answered', description: 'When the client accepted or declined', icon: 'IconGavel' },
    { universalIdentifier: QUOTATION_SUBTOTAL_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.CURRENCY, name: 'subtotal', label: 'Subtotal', icon: 'IconSum', defaultValue: { amountMicros: null, currencyCode: "'THB'" } },
    { universalIdentifier: QUOTATION_DISCOUNT_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.CURRENCY, name: 'discount', label: 'Discount', icon: 'IconDiscount', defaultValue: { amountMicros: null, currencyCode: "'THB'" } },
    { universalIdentifier: QUOTATION_TAX_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.CURRENCY, name: 'tax', label: 'Tax', icon: 'IconPercentage', defaultValue: { amountMicros: null, currencyCode: "'THB'" } },
    { universalIdentifier: QUOTATION_TOTAL_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.CURRENCY, name: 'total', label: 'Total', icon: 'IconCoin', defaultValue: { amountMicros: null, currencyCode: "'THB'" } },
    { universalIdentifier: QUOTATION_NOTES_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.TEXT, name: 'notes', label: 'Notes', icon: 'IconNote' },
    { universalIdentifier: QUOTATION_PDF_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.FILES, name: 'pdf', label: 'Document', icon: 'IconFileTypePdf', universalSettings: { maxNumberOfValues: 5 } },
    { universalIdentifier: QUOTATION_STATUS_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.SELECT, name: 'status', label: 'Status', icon: 'IconProgressCheck', defaultValue: "'DRAFT'", options: [
      { id: QUOTATION_STATUS_DRAFT_OPTION_ID, value: 'DRAFT', label: 'Draft', position: 0, color: 'gray' },
      { id: QUOTATION_STATUS_SENT_OPTION_ID, value: 'SENT', label: 'Sent', position: 1, color: 'blue' },
      { id: QUOTATION_STATUS_ACCEPTED_OPTION_ID, value: 'ACCEPTED', label: 'Accepted', position: 2, color: 'green' },
      { id: QUOTATION_STATUS_DECLINED_OPTION_ID, value: 'DECLINED', label: 'Declined', position: 3, color: 'red' },
      { id: QUOTATION_STATUS_EXPIRED_OPTION_ID, value: 'EXPIRED', label: 'Expired', position: 4, color: 'orange' },
    ] },
  ],
});
