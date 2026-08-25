import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
} from 'twenty-sdk/define';

import {
  CONTACT_IDENTITY_CONVERSATIONS_FIELD_UNIVERSAL_IDENTIFIER,
  CONTACT_IDENTITY_OBJECT_UNIVERSAL_IDENTIFIER,
  CONVERSATION_CONTACT_IDENTITY_FIELD_UNIVERSAL_IDENTIFIER,
  CONVERSATION_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: CONVERSATION_CONTACT_IDENTITY_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: CONVERSATION_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'contactIdentity',
  label: 'Channel identity',
  description: 'The channel handle that opened this conversation',
  icon: 'IconAddressBook',
  relationTargetObjectMetadataUniversalIdentifier: CONTACT_IDENTITY_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: CONTACT_IDENTITY_CONVERSATIONS_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'contactIdentityId',
  },
});
