import {
  defineField,
  FieldType,
  RelationType,
} from 'twenty-sdk/define';

import {
  CHANNEL_ACCOUNT_CONVERSATIONS_FIELD_UNIVERSAL_IDENTIFIER,
  CHANNEL_ACCOUNT_OBJECT_UNIVERSAL_IDENTIFIER,
  CONVERSATION_CHANNEL_ACCOUNT_FIELD_UNIVERSAL_IDENTIFIER,
  CONVERSATION_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: CHANNEL_ACCOUNT_CONVERSATIONS_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: CHANNEL_ACCOUNT_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'conversations',
  label: 'Conversations',
  description: 'Conversations received on this account',
  icon: 'IconMessages',
  relationTargetObjectMetadataUniversalIdentifier: CONVERSATION_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: CONVERSATION_CHANNEL_ACCOUNT_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
