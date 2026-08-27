import {
  defineField,
  FieldType,
  RelationType,
} from 'twenty-sdk/define';

import {
  BILLING_ENTITY_OBJECT_UNIVERSAL_IDENTIFIER,
  BILLING_ENTITY_QUOTATIONS_FIELD_UNIVERSAL_IDENTIFIER,
  QUOTATION_BILLING_ENTITY_FIELD_UNIVERSAL_IDENTIFIER,
  QUOTATION_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: BILLING_ENTITY_QUOTATIONS_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: BILLING_ENTITY_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'quotations',
  label: 'Quotations',
  description: 'Quoted under this entity',
  icon: 'IconFileDollar',
  relationTargetObjectMetadataUniversalIdentifier: QUOTATION_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: QUOTATION_BILLING_ENTITY_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
