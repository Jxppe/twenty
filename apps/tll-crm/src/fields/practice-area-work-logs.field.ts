import { defineField, FieldType, RelationType } from 'twenty-sdk/define';

import {
  PRACTICE_AREA_OBJECT_UNIVERSAL_IDENTIFIER,
  PRACTICE_AREA_WORK_LOGS_FIELD_UNIVERSAL_IDENTIFIER,
  WORK_LOG_OBJECT_UNIVERSAL_IDENTIFIER,
  WORK_LOG_PRACTICE_AREA_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: PRACTICE_AREA_WORK_LOGS_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: PRACTICE_AREA_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'workLogs',
  label: 'Work logs',
  description: 'Work logged against this category',
  icon: 'IconClockEdit',
  relationTargetObjectMetadataUniversalIdentifier:
    WORK_LOG_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    WORK_LOG_PRACTICE_AREA_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
