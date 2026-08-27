import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
} from 'twenty-sdk/define';

import {
  BILLING_ENTITY_OBJECT_UNIVERSAL_IDENTIFIER,
  BILLING_ENTITY_QUOTATIONS_FIELD_UNIVERSAL_IDENTIFIER,
  QUOTATION_BILLING_ENTITY_FIELD_UNIVERSAL_IDENTIFIER,
  QUOTATION_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: QUOTATION_BILLING_ENTITY_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: QUOTATION_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'billingEntity',
  label: 'Billing entity',
  description: 'Which company is contracting. Required in practice',
  icon: 'IconBuildingBank',
  relationTargetObjectMetadataUniversalIdentifier: BILLING_ENTITY_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: BILLING_ENTITY_QUOTATIONS_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'billingEntityId',
  },
});
