import {
  defineField,
  FieldType,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  CONVERSATION_OBJECT_UNIVERSAL_IDENTIFIER,
  CONVERSATION_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
  PERSON_CONVERSATIONS_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: PERSON_CONVERSATIONS_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.RELATION,
  name: 'conversations',
  label: 'Conversations',
  description: 'Omnichannel conversations with this contact',
  icon: 'IconMessages',
  relationTargetObjectMetadataUniversalIdentifier: CONVERSATION_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: CONVERSATION_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
