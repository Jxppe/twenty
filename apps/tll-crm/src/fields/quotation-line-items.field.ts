import {
  defineField,
  FieldType,
  RelationType,
} from 'twenty-sdk/define';

import {
  QLI_QUOTATION_FIELD_UNIVERSAL_IDENTIFIER,
  QUOTATION_LINE_ITEMS_FIELD_UNIVERSAL_IDENTIFIER,
  QUOTATION_LINE_ITEM_OBJECT_UNIVERSAL_IDENTIFIER,
  QUOTATION_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: QUOTATION_LINE_ITEMS_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: QUOTATION_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'lineItems',
  label: 'Lines',
  description: 'What is being charged for',
  icon: 'IconListDetails',
  relationTargetObjectMetadataUniversalIdentifier: QUOTATION_LINE_ITEM_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: QLI_QUOTATION_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
