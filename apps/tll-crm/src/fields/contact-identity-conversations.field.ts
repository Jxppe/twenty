import {
  defineField,
  FieldType,
  RelationType,
} from 'twenty-sdk/define';

import {
  CONTACT_IDENTITY_CONVERSATIONS_FIELD_UNIVERSAL_IDENTIFIER,
  CONTACT_IDENTITY_OBJECT_UNIVERSAL_IDENTIFIER,
  CONVERSATION_CONTACT_IDENTITY_FIELD_UNIVERSAL_IDENTIFIER,
  CONVERSATION_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: CONTACT_IDENTITY_CONVERSATIONS_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: CONTACT_IDENTITY_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'conversations',
  label: 'Conversations',
  description: 'Conversations opened by this handle',
  icon: 'IconMessages',
  relationTargetObjectMetadataUniversalIdentifier: CONVERSATION_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: CONVERSATION_CONTACT_IDENTITY_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
