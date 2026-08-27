import { defineView, ViewSortDirection, ViewType } from 'twenty-sdk/define';

import {
  PAYMENTS_RECENT_VIEW_UNIVERSAL_IDENTIFIER,
  PAYMENT_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
  PAYMENT_INVOICE_FIELD_UNIVERSAL_IDENTIFIER,
  PAYMENT_METHOD_FIELD_UNIVERSAL_IDENTIFIER,
  PAYMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  PAYMENT_PAID_AT_FIELD_UNIVERSAL_IDENTIFIER,
  PAYMENT_REFERENCE_FIELD_UNIVERSAL_IDENTIFIER,
  PAYMENT_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

// Unconfirmed money sorts to the top by being newest: a payment nobody has
// checked is the one that needs attention.
export default defineView({
  universalIdentifier: PAYMENTS_RECENT_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Received',
  objectUniversalIdentifier: PAYMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconCashBanknote',
  position: 0,
  fields: [
    { universalIdentifier: 'b1056f9f-e80f-46ae-a3df-6ad27c79b2ba', fieldMetadataUniversalIdentifier: PAYMENT_REFERENCE_FIELD_UNIVERSAL_IDENTIFIER, position: 0, isVisible: true, size: 160 },
    { universalIdentifier: 'e8e45092-5b16-4c9c-83b3-562d549d67b6', fieldMetadataUniversalIdentifier: PAYMENT_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER, position: 1, isVisible: true, size: 130 },
    { universalIdentifier: '16881897-7927-4216-9771-2307a0e8e33d', fieldMetadataUniversalIdentifier: PAYMENT_STATUS_FIELD_UNIVERSAL_IDENTIFIER, position: 2, isVisible: true, size: 130 },
    { universalIdentifier: '9b1f4ce1-f991-40ef-8b9c-b1a66cd406ea', fieldMetadataUniversalIdentifier: PAYMENT_INVOICE_FIELD_UNIVERSAL_IDENTIFIER, position: 3, isVisible: true, size: 160 },
    { universalIdentifier: 'b4464cf6-9b57-4022-8a06-f6361397aaed', fieldMetadataUniversalIdentifier: PAYMENT_METHOD_FIELD_UNIVERSAL_IDENTIFIER, position: 4, isVisible: true, size: 140 },
    { universalIdentifier: 'c1547fc8-4531-4c95-aa0b-9a04a042820e', fieldMetadataUniversalIdentifier: PAYMENT_PAID_AT_FIELD_UNIVERSAL_IDENTIFIER, position: 5, isVisible: true, size: 150 },
  ],
  sorts: [
    { universalIdentifier: '03c1da2a-3d66-4e7f-af84-83282e6b3b8b', fieldMetadataUniversalIdentifier: PAYMENT_PAID_AT_FIELD_UNIVERSAL_IDENTIFIER, direction: ViewSortDirection.DESC },
  ],
});
