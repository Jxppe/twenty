import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
} from 'twenty-sdk/define';

import {
  BILLING_ENTITY_OBJECT_UNIVERSAL_IDENTIFIER,
  BILLING_ENTITY_WORK_LOGS_FIELD_UNIVERSAL_IDENTIFIER,
  WORK_LOG_BILLING_ENTITY_FIELD_UNIVERSAL_IDENTIFIER,
  WORK_LOG_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: WORK_LOG_BILLING_ENTITY_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: WORK_LOG_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'billingEntity',
  label: 'Billing entity',
  description: 'Which of the three the work was done under',
  icon: 'IconBuildingBank',
  relationTargetObjectMetadataUniversalIdentifier: BILLING_ENTITY_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: BILLING_ENTITY_WORK_LOGS_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'billingEntityId',
  },
});
