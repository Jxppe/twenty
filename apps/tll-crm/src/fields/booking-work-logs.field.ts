import {
  defineField,
  FieldType,
  RelationType,
} from 'twenty-sdk/define';

import {
  BOOKING_OBJECT_UNIVERSAL_IDENTIFIER,
  BOOKING_WORK_LOGS_FIELD_UNIVERSAL_IDENTIFIER,
  WORK_LOG_BOOKING_FIELD_UNIVERSAL_IDENTIFIER,
  WORK_LOG_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: BOOKING_WORK_LOGS_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: BOOKING_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'workLogs',
  label: 'Work logs',
  description: 'Time recorded against this appointment',
  icon: 'IconClockEdit',
  relationTargetObjectMetadataUniversalIdentifier: WORK_LOG_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: WORK_LOG_BOOKING_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
