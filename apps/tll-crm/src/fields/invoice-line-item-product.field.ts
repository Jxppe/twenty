import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
} from 'twenty-sdk/define';

import {
  ILI_PRODUCT_FIELD_UNIVERSAL_IDENTIFIER,
  INVOICE_LINE_ITEM_OBJECT_UNIVERSAL_IDENTIFIER,
  PRODUCT_INVOICE_LINE_ITEMS_FIELD_UNIVERSAL_IDENTIFIER,
  PRODUCT_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: ILI_PRODUCT_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: INVOICE_LINE_ITEM_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'product',
  label: 'Service',
  description: 'Where the text and price came from',
  icon: 'IconTag',
  relationTargetObjectMetadataUniversalIdentifier: PRODUCT_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: PRODUCT_INVOICE_LINE_ITEMS_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'productId',
  },
});
