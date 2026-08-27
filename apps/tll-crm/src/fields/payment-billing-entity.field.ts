import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
} from 'twenty-sdk/define';

import {
  BILLING_ENTITY_OBJECT_UNIVERSAL_IDENTIFIER,
  BILLING_ENTITY_PAYMENTS_FIELD_UNIVERSAL_IDENTIFIER,
  PAYMENT_BILLING_ENTITY_FIELD_UNIVERSAL_IDENTIFIER,
  PAYMENT_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: PAYMENT_BILLING_ENTITY_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: PAYMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'billingEntity',
  label: 'Billing entity',
  description: 'Which company received it',
  icon: 'IconBuildingBank',
  relationTargetObjectMetadataUniversalIdentifier: BILLING_ENTITY_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: BILLING_ENTITY_PAYMENTS_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'billingEntityId',
  },
});
