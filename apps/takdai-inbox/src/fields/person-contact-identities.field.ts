import {
  defineField,
  FieldType,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  CONTACT_IDENTITY_OBJECT_UNIVERSAL_IDENTIFIER,
  CONTACT_IDENTITY_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
  PERSON_CONTACT_IDENTITIES_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: PERSON_CONTACT_IDENTITIES_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.RELATION,
  name: 'contactIdentities',
  label: 'Channel identities',
  description: 'Channel handles known to belong to this contact',
  icon: 'IconAddressBook',
  relationTargetObjectMetadataUniversalIdentifier: CONTACT_IDENTITY_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: CONTACT_IDENTITY_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
