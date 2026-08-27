import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
} from 'twenty-sdk/define';

import {
  PRODUCT_OBJECT_UNIVERSAL_IDENTIFIER,
  PRODUCT_QUOTATION_LINE_ITEMS_FIELD_UNIVERSAL_IDENTIFIER,
  QLI_PRODUCT_FIELD_UNIVERSAL_IDENTIFIER,
  QUOTATION_LINE_ITEM_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: QLI_PRODUCT_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: QUOTATION_LINE_ITEM_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'product',
  label: 'Service',
  description: 'Where the text and price came from',
  icon: 'IconTag',
  relationTargetObjectMetadataUniversalIdentifier: PRODUCT_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: PRODUCT_QUOTATION_LINE_ITEMS_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'productId',
  },
});
