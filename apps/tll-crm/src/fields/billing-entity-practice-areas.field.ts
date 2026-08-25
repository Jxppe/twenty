import {
  defineField,
  FieldType,
  RelationType,
} from 'twenty-sdk/define';

import {
  BILLING_ENTITY_OBJECT_UNIVERSAL_IDENTIFIER,
  BILLING_ENTITY_PRACTICE_AREAS_FIELD_UNIVERSAL_IDENTIFIER,
  PRACTICE_AREA_DEFAULT_BILLING_ENTITY_FIELD_UNIVERSAL_IDENTIFIER,
  PRACTICE_AREA_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: BILLING_ENTITY_PRACTICE_AREAS_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: BILLING_ENTITY_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'practiceAreas',
  label: 'Practice areas',
  description: 'Practice areas that default to this entity',
  icon: 'IconScale',
  relationTargetObjectMetadataUniversalIdentifier: PRACTICE_AREA_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: PRACTICE_AREA_DEFAULT_BILLING_ENTITY_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
