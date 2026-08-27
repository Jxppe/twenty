import { defineView, ViewFilterOperand, ViewSortDirection, ViewType } from 'twenty-sdk/define';

import {
  INVOICES_UNPAID_VIEW_UNIVERSAL_IDENTIFIER,
  INVOICE_AMOUNT_PAID_FIELD_UNIVERSAL_IDENTIFIER,
  INVOICE_DUE_DATE_FIELD_UNIVERSAL_IDENTIFIER,
  INVOICE_MATTER_FIELD_UNIVERSAL_IDENTIFIER,
  INVOICE_NUMBER_FIELD_UNIVERSAL_IDENTIFIER,
  INVOICE_OBJECT_UNIVERSAL_IDENTIFIER,
  INVOICE_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
  INVOICE_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  INVOICE_TOTAL_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

// Oldest due date first, because the one that has been outstanding longest is
// the one worth a phone call.
export default defineView({
  universalIdentifier: INVOICES_UNPAID_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Unpaid',
  objectUniversalIdentifier: INVOICE_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconReceipt',
  position: 0,
  fields: [
    { universalIdentifier: 'afa8d213-3a67-4288-911c-fff1e0d5296e', fieldMetadataUniversalIdentifier: INVOICE_NUMBER_FIELD_UNIVERSAL_IDENTIFIER, position: 0, isVisible: true, size: 130 },
    { universalIdentifier: '687bd35f-8e36-481a-ac01-d3a094a99e2d', fieldMetadataUniversalIdentifier: INVOICE_PERSON_FIELD_UNIVERSAL_IDENTIFIER, position: 1, isVisible: true, size: 170 },
    { universalIdentifier: '1653db80-a303-4ebf-a753-82c04f81697d', fieldMetadataUniversalIdentifier: INVOICE_MATTER_FIELD_UNIVERSAL_IDENTIFIER, position: 2, isVisible: true, size: 220 },
    { universalIdentifier: 'd3e11adf-6ba6-4840-b0dc-009b43c62353', fieldMetadataUniversalIdentifier: INVOICE_TOTAL_FIELD_UNIVERSAL_IDENTIFIER, position: 3, isVisible: true, size: 130 },
    { universalIdentifier: 'b0b56558-75e3-44dc-86b5-6d9f8b6f9657', fieldMetadataUniversalIdentifier: INVOICE_AMOUNT_PAID_FIELD_UNIVERSAL_IDENTIFIER, position: 4, isVisible: true, size: 120 },
    { universalIdentifier: 'b65d72fb-44b5-4f59-b601-a98298e12c72', fieldMetadataUniversalIdentifier: INVOICE_DUE_DATE_FIELD_UNIVERSAL_IDENTIFIER, position: 5, isVisible: true, size: 140 },
    { universalIdentifier: 'ec92b1f3-6593-4448-a633-1d09db126558', fieldMetadataUniversalIdentifier: INVOICE_STATUS_FIELD_UNIVERSAL_IDENTIFIER, position: 6, isVisible: true, size: 120 },
  ],
  sorts: [
    { universalIdentifier: '783e90fa-647d-43f8-a268-52d5a44a9e27', fieldMetadataUniversalIdentifier: INVOICE_DUE_DATE_FIELD_UNIVERSAL_IDENTIFIER, direction: ViewSortDirection.ASC },
  ],
  filters: [
    { universalIdentifier: '5909527c-e9fe-46da-9f48-6419d86aa423', fieldMetadataUniversalIdentifier: INVOICE_STATUS_FIELD_UNIVERSAL_IDENTIFIER, operand: ViewFilterOperand.IS, value: ['ISSUED', 'PARTIALLY_PAID', 'OVERDUE'] },
  ],
});
