import {
  defineField,
  FieldType,
  RelationType,
} from 'twenty-sdk/define';

import {
  BILLING_ENTITY_OBJECT_UNIVERSAL_IDENTIFIER,
  BILLING_ENTITY_WORK_LOGS_FIELD_UNIVERSAL_IDENTIFIER,
  WORK_LOG_BILLING_ENTITY_FIELD_UNIVERSAL_IDENTIFIER,
  WORK_LOG_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: BILLING_ENTITY_WORK_LOGS_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: BILLING_ENTITY_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'workLogs',
  label: 'Work logs',
  description: 'Time recorded under this entity',
  icon: 'IconClockEdit',
  relationTargetObjectMetadataUniversalIdentifier: WORK_LOG_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: WORK_LOG_BILLING_ENTITY_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
