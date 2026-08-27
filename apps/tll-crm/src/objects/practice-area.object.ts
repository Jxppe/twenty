import { defineObject, FieldType } from 'twenty-sdk/define';

import {
  PRACTICE_AREA_IS_ACTIVE_FIELD_UNIVERSAL_IDENTIFIER,
  PRACTICE_AREA_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  PRACTICE_AREA_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineObject({
  universalIdentifier: PRACTICE_AREA_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'practiceArea',
  namePlural: 'practiceAreas',
  labelSingular: 'Type of work',
  labelPlural: 'Types of work',
  description: 'A kind of work the firm does: visa, property, notarization',
  icon: 'IconScale',
  labelIdentifierFieldMetadataUniversalIdentifier:
    PRACTICE_AREA_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: PRACTICE_AREA_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'name',
      label: 'Name',
      icon: 'IconAbc',
    },
    {
      universalIdentifier: PRACTICE_AREA_IS_ACTIVE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.BOOLEAN,
      name: 'isActive',
      label: 'Active',
      icon: 'IconToggleLeft',
      defaultValue: true,
    },
  ],
});
