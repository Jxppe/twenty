import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
} from 'twenty-sdk/define';

import {
  PRACTICE_AREA_OBJECT_UNIVERSAL_IDENTIFIER,
  PRACTICE_AREA_WORK_LOGS_FIELD_UNIVERSAL_IDENTIFIER,
  WORK_LOG_OBJECT_UNIVERSAL_IDENTIFIER,
  WORK_LOG_PRACTICE_AREA_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

// หมวดหมู่, the first thing anyone picks. It is not taken from the job: most
// of what staff log has no job and no client at all, and office, finance,
// marketing and meetings are still work that has to land somewhere.
export default defineField({
  universalIdentifier: WORK_LOG_PRACTICE_AREA_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: WORK_LOG_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'practiceArea',
  label: 'Category',
  description: 'The kind of work this was',
  icon: 'IconCategory',
  relationTargetObjectMetadataUniversalIdentifier:
    PRACTICE_AREA_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    PRACTICE_AREA_WORK_LOGS_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'practiceAreaId',
  },
});
