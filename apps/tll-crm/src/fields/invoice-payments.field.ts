import {
  defineField,
  FieldType,
  RelationType,
} from 'twenty-sdk/define';

import {
  INVOICE_OBJECT_UNIVERSAL_IDENTIFIER,
  INVOICE_PAYMENTS_FIELD_UNIVERSAL_IDENTIFIER,
  PAYMENT_INVOICE_FIELD_UNIVERSAL_IDENTIFIER,
  PAYMENT_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: INVOICE_PAYMENTS_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: INVOICE_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'payments',
  label: 'Payments',
  description: 'Money received against this invoice',
  icon: 'IconCashBanknote',
  relationTargetObjectMetadataUniversalIdentifier: PAYMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: PAYMENT_INVOICE_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
