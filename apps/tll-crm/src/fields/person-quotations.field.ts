import {
  defineField,
  FieldType,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  PERSON_QUOTATIONS_FIELD_UNIVERSAL_IDENTIFIER,
  QUOTATION_OBJECT_UNIVERSAL_IDENTIFIER,
  QUOTATION_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: PERSON_QUOTATIONS_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.RELATION,
  name: 'quotations',
  label: 'Quotations',
  description: 'Quoted to this client',
  icon: 'IconFileDollar',
  relationTargetObjectMetadataUniversalIdentifier: QUOTATION_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: QUOTATION_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
