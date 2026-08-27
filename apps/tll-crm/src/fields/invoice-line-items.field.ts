import {
  defineField,
  FieldType,
  RelationType,
} from 'twenty-sdk/define';

import {
  ILI_INVOICE_FIELD_UNIVERSAL_IDENTIFIER,
  INVOICE_LINE_ITEMS_FIELD_UNIVERSAL_IDENTIFIER,
  INVOICE_LINE_ITEM_OBJECT_UNIVERSAL_IDENTIFIER,
  INVOICE_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: INVOICE_LINE_ITEMS_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: INVOICE_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'lineItems',
  label: 'Lines',
  description: 'What is being charged for',
  icon: 'IconListDetails',
  relationTargetObjectMetadataUniversalIdentifier: INVOICE_LINE_ITEM_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: ILI_INVOICE_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
