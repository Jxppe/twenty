import {
  defineField,
  FieldType,
  RelationType,
} from 'twenty-sdk/define';

import {
  BILLING_ENTITY_INVOICES_FIELD_UNIVERSAL_IDENTIFIER,
  BILLING_ENTITY_OBJECT_UNIVERSAL_IDENTIFIER,
  INVOICE_BILLING_ENTITY_FIELD_UNIVERSAL_IDENTIFIER,
  INVOICE_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: BILLING_ENTITY_INVOICES_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: BILLING_ENTITY_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'invoices',
  label: 'Invoices',
  description: 'Issued by this entity',
  icon: 'IconReceipt',
  relationTargetObjectMetadataUniversalIdentifier: INVOICE_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: INVOICE_BILLING_ENTITY_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
