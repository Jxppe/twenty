import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
} from 'twenty-sdk/define';

import {
  INVOICE_OBJECT_UNIVERSAL_IDENTIFIER,
  INVOICE_PAYMENTS_FIELD_UNIVERSAL_IDENTIFIER,
  PAYMENT_INVOICE_FIELD_UNIVERSAL_IDENTIFIER,
  PAYMENT_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: PAYMENT_INVOICE_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: PAYMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'invoice',
  label: 'Invoice',
  description: 'What this pays for',
  icon: 'IconReceipt',
  relationTargetObjectMetadataUniversalIdentifier: INVOICE_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: INVOICE_PAYMENTS_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'invoiceId',
  },
});
