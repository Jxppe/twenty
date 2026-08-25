import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  MATTER_DEADLINE_OBJECT_UNIVERSAL_IDENTIFIER,
  MATTER_DEADLINE_RESPONSIBLE_FIELD_UNIVERSAL_IDENTIFIER,
  WORKSPACE_MEMBER_MATTER_DEADLINES_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: MATTER_DEADLINE_RESPONSIBLE_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: MATTER_DEADLINE_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'responsible',
  label: 'Responsible',
  description: 'Who is answerable for hitting this date',
  icon: 'IconUser',
  relationTargetObjectMetadataUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier: WORKSPACE_MEMBER_MATTER_DEADLINES_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'responsibleId',
  },
});
