import { defineObject, FieldType } from 'twenty-sdk/define';

import {
  INVOICE_AMOUNT_PAID_FIELD_UNIVERSAL_IDENTIFIER,
  INVOICE_DISCOUNT_FIELD_UNIVERSAL_IDENTIFIER,
  INVOICE_DUE_DATE_FIELD_UNIVERSAL_IDENTIFIER,
  INVOICE_EXTERNAL_REFERENCE_FIELD_UNIVERSAL_IDENTIFIER,
  INVOICE_EXTERNAL_URL_FIELD_UNIVERSAL_IDENTIFIER,
  INVOICE_ISSUED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  INVOICE_NOTES_FIELD_UNIVERSAL_IDENTIFIER,
  INVOICE_NUMBER_FIELD_UNIVERSAL_IDENTIFIER,
  INVOICE_OBJECT_UNIVERSAL_IDENTIFIER,
  INVOICE_PDF_FIELD_UNIVERSAL_IDENTIFIER,
  INVOICE_STATUS_DRAFT_OPTION_ID,
  INVOICE_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  INVOICE_STATUS_ISSUED_OPTION_ID,
  INVOICE_STATUS_OVERDUE_OPTION_ID,
  INVOICE_STATUS_PAID_OPTION_ID,
  INVOICE_STATUS_PARTIALLY_PAID_OPTION_ID,
  INVOICE_STATUS_VOID_OPTION_ID,
  INVOICE_SUBTOTAL_FIELD_UNIVERSAL_IDENTIFIER,
  INVOICE_TAX_FIELD_UNIVERSAL_IDENTIFIER,
  INVOICE_TOTAL_FIELD_UNIVERSAL_IDENTIFIER
} from 'src/constants/universal-identifiers';

// FlowAccount owns the ledger (D3, D15). externalReference points at their
// document; nothing here mirrors their numbers, because two places that can
// disagree about money is the failure this design exists to avoid.
//
// An issued invoice is never deleted. It is voided.
export default defineObject({
  universalIdentifier: INVOICE_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'invoice',
  namePlural: 'invoices',
  labelSingular: 'Invoice',
  labelPlural: 'Invoices',
  description: 'What the client owes, and against which job',
  icon: 'IconReceipt',
  labelIdentifierFieldMetadataUniversalIdentifier: INVOICE_NUMBER_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    { universalIdentifier: INVOICE_NUMBER_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.TEXT, name: 'number', label: 'Number', icon: 'IconHash' },
    { universalIdentifier: INVOICE_ISSUED_AT_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.DATE_TIME, name: 'issuedAt', label: 'Issued', icon: 'IconSend' },
    { universalIdentifier: INVOICE_DUE_DATE_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.DATE_TIME, name: 'dueDate', label: 'Due', icon: 'IconCalendarDue' },
    { universalIdentifier: INVOICE_SUBTOTAL_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.CURRENCY, name: 'subtotal', label: 'Subtotal', icon: 'IconSum' },
    { universalIdentifier: INVOICE_DISCOUNT_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.CURRENCY, name: 'discount', label: 'Discount', icon: 'IconDiscount' },
    { universalIdentifier: INVOICE_TAX_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.CURRENCY, name: 'tax', label: 'Tax', icon: 'IconPercentage' },
    { universalIdentifier: INVOICE_TOTAL_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.CURRENCY, name: 'total', label: 'Total', icon: 'IconCoin' },
    { universalIdentifier: INVOICE_AMOUNT_PAID_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.CURRENCY, name: 'amountPaid', label: 'Paid', icon: 'IconCashBanknote' },
    { universalIdentifier: INVOICE_EXTERNAL_REFERENCE_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.TEXT, name: 'externalReference', label: 'FlowAccount ref', description: 'Their document id. We point at it, we never copy their ledger', icon: 'IconExternalLink' },
    { universalIdentifier: INVOICE_EXTERNAL_URL_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.TEXT, name: 'externalUrl', label: 'Open in FlowAccount', icon: 'IconLink' },
    { universalIdentifier: INVOICE_NOTES_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.TEXT, name: 'notes', label: 'Notes', icon: 'IconNote' },
    { universalIdentifier: INVOICE_PDF_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.FILES, name: 'pdf', label: 'Document', icon: 'IconFileTypePdf', universalSettings: { maxNumberOfValues: 5 } },
    { universalIdentifier: INVOICE_STATUS_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.SELECT, name: 'status', label: 'Status', icon: 'IconProgressCheck', defaultValue: "'DRAFT'", options: [
      { id: INVOICE_STATUS_DRAFT_OPTION_ID, value: 'DRAFT', label: 'Draft', position: 0, color: 'gray' },
      { id: INVOICE_STATUS_ISSUED_OPTION_ID, value: 'ISSUED', label: 'Issued', position: 1, color: 'blue' },
      { id: INVOICE_STATUS_PARTIALLY_PAID_OPTION_ID, value: 'PARTIALLY_PAID', label: 'Part paid', position: 2, color: 'turquoise' },
      { id: INVOICE_STATUS_PAID_OPTION_ID, value: 'PAID', label: 'Paid', position: 3, color: 'green' },
      { id: INVOICE_STATUS_OVERDUE_OPTION_ID, value: 'OVERDUE', label: 'Overdue', position: 4, color: 'red' },
      { id: INVOICE_STATUS_VOID_OPTION_ID, value: 'VOID', label: 'Void', position: 5, color: 'gray' },
    ] },
  ],
});
