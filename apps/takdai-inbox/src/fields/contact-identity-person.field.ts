import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  CONTACT_IDENTITY_OBJECT_UNIVERSAL_IDENTIFIER,
  CONTACT_IDENTITY_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
  PERSON_CONTACT_IDENTITIES_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: CONTACT_IDENTITY_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: CONTACT_IDENTITY_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'person',
  label: 'Contact',
  description: 'The CRM contact this handle resolves to',
  icon: 'IconUser',
  relationTargetObjectMetadataUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier: PERSON_CONTACT_IDENTITIES_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'personId',
  },
});
