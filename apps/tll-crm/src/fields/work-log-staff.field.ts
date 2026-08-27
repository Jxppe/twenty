import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  WORKSPACE_MEMBER_WORK_LOGS_FIELD_UNIVERSAL_IDENTIFIER,
  WORK_LOG_OBJECT_UNIVERSAL_IDENTIFIER,
  WORK_LOG_STAFF_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: WORK_LOG_STAFF_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: WORK_LOG_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'staff',
  label: 'Staff',
  description: 'Who did the work',
  icon: 'IconUserCheck',
  relationTargetObjectMetadataUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier: WORKSPACE_MEMBER_WORK_LOGS_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'staffId',
  },
});
