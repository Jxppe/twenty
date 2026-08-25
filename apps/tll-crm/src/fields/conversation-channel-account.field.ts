import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
} from 'twenty-sdk/define';

import {
  CHANNEL_ACCOUNT_CONVERSATIONS_FIELD_UNIVERSAL_IDENTIFIER,
  CHANNEL_ACCOUNT_OBJECT_UNIVERSAL_IDENTIFIER,
  CONVERSATION_CHANNEL_ACCOUNT_FIELD_UNIVERSAL_IDENTIFIER,
  CONVERSATION_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: CONVERSATION_CHANNEL_ACCOUNT_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: CONVERSATION_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'channelAccount',
  label: 'Channel account',
  description: 'The connected account this conversation arrived on',
  icon: 'IconPlug',
  relationTargetObjectMetadataUniversalIdentifier: CHANNEL_ACCOUNT_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: CHANNEL_ACCOUNT_CONVERSATIONS_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'channelAccountId',
  },
});
