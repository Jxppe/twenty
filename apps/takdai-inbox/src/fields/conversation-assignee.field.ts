import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  CONVERSATION_ASSIGNEE_FIELD_UNIVERSAL_IDENTIFIER,
  CONVERSATION_OBJECT_UNIVERSAL_IDENTIFIER,
  WORKSPACE_MEMBER_CONVERSATIONS_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: CONVERSATION_ASSIGNEE_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: CONVERSATION_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'assignee',
  label: 'Assignee',
  description: 'Agent currently responsible for this conversation',
  icon: 'IconUserCheck',
  relationTargetObjectMetadataUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier: WORKSPACE_MEMBER_CONVERSATIONS_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'assigneeId',
  },
});
