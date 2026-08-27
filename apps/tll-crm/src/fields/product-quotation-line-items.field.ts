import {
  defineField,
  FieldType,
  RelationType,
} from 'twenty-sdk/define';

import {
  PRODUCT_OBJECT_UNIVERSAL_IDENTIFIER,
  PRODUCT_QUOTATION_LINE_ITEMS_FIELD_UNIVERSAL_IDENTIFIER,
  QLI_PRODUCT_FIELD_UNIVERSAL_IDENTIFIER,
  QUOTATION_LINE_ITEM_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: PRODUCT_QUOTATION_LINE_ITEMS_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: PRODUCT_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'quotationLineItems',
  label: 'Quoted on',
  description: 'Quotation lines drawn from this service',
  icon: 'IconFileDollar',
  relationTargetObjectMetadataUniversalIdentifier: QUOTATION_LINE_ITEM_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: QLI_PRODUCT_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
