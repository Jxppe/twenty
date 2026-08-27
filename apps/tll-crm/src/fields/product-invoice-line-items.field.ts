import {
  defineField,
  FieldType,
  RelationType,
} from 'twenty-sdk/define';

import {
  ILI_PRODUCT_FIELD_UNIVERSAL_IDENTIFIER,
  INVOICE_LINE_ITEM_OBJECT_UNIVERSAL_IDENTIFIER,
  PRODUCT_INVOICE_LINE_ITEMS_FIELD_UNIVERSAL_IDENTIFIER,
  PRODUCT_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: PRODUCT_INVOICE_LINE_ITEMS_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: PRODUCT_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'invoiceLineItems',
  label: 'Invoiced on',
  description: 'Invoice lines drawn from this service',
  icon: 'IconReceipt',
  relationTargetObjectMetadataUniversalIdentifier: INVOICE_LINE_ITEM_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: ILI_PRODUCT_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
