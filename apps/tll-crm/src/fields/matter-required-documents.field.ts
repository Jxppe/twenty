import {
  defineField,
  FieldType,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  MATTER_REQUIRED_DOCUMENTS_FIELD_UNIVERSAL_IDENTIFIER,
  REQUIRED_DOCUMENT_MATTER_FIELD_UNIVERSAL_IDENTIFIER,
  REQUIRED_DOCUMENT_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: MATTER_REQUIRED_DOCUMENTS_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: FieldType.RELATION,
  name: 'requiredDocuments',
  label: 'Required documents',
  description: 'What we are waiting on from the client',
  icon: 'IconFileDescription',
  relationTargetObjectMetadataUniversalIdentifier: REQUIRED_DOCUMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: REQUIRED_DOCUMENT_MATTER_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
