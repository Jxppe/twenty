import {
  defineField,
  FieldType,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  MATTER_PRACTICE_AREA_FIELD_UNIVERSAL_IDENTIFIER,
  PRACTICE_AREA_MATTERS_FIELD_UNIVERSAL_IDENTIFIER,
  PRACTICE_AREA_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: PRACTICE_AREA_MATTERS_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: PRACTICE_AREA_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'matters',
  label: 'Matters',
  description: 'Matters in this practice area',
  icon: 'IconBriefcase',
  relationTargetObjectMetadataUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier: MATTER_PRACTICE_AREA_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
