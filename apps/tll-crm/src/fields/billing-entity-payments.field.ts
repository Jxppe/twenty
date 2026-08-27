import {
  defineField,
  FieldType,
  RelationType,
} from 'twenty-sdk/define';

import {
  BILLING_ENTITY_OBJECT_UNIVERSAL_IDENTIFIER,
  BILLING_ENTITY_PAYMENTS_FIELD_UNIVERSAL_IDENTIFIER,
  PAYMENT_BILLING_ENTITY_FIELD_UNIVERSAL_IDENTIFIER,
  PAYMENT_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: BILLING_ENTITY_PAYMENTS_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: BILLING_ENTITY_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'payments',
  label: 'Payments',
  description: 'Received by this entity',
  icon: 'IconCashBanknote',
  relationTargetObjectMetadataUniversalIdentifier: PAYMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: PAYMENT_BILLING_ENTITY_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
