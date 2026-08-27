import {
  defineField,
  FieldType,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  MATTER_QUOTATIONS_FIELD_UNIVERSAL_IDENTIFIER,
  QUOTATION_MATTER_FIELD_UNIVERSAL_IDENTIFIER,
  QUOTATION_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: MATTER_QUOTATIONS_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: FieldType.RELATION,
  name: 'quotations',
  label: 'Quotations',
  description: 'What was offered for this job',
  icon: 'IconFileDollar',
  relationTargetObjectMetadataUniversalIdentifier: QUOTATION_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: QUOTATION_MATTER_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
