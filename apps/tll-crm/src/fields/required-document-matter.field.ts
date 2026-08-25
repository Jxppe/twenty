import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  MATTER_REQUIRED_DOCUMENTS_FIELD_UNIVERSAL_IDENTIFIER,
  REQUIRED_DOCUMENT_MATTER_FIELD_UNIVERSAL_IDENTIFIER,
  REQUIRED_DOCUMENT_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: REQUIRED_DOCUMENT_MATTER_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: REQUIRED_DOCUMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'matter',
  label: 'Matter',
  description: 'The matter this document is needed for',
  icon: 'IconBriefcase',
  relationTargetObjectMetadataUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier: MATTER_REQUIRED_DOCUMENTS_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.CASCADE,
    joinColumnName: 'matterId',
  },
});
