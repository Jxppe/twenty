import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
} from 'twenty-sdk/define';

import {
  ILI_INVOICE_FIELD_UNIVERSAL_IDENTIFIER,
  INVOICE_LINE_ITEMS_FIELD_UNIVERSAL_IDENTIFIER,
  INVOICE_LINE_ITEM_OBJECT_UNIVERSAL_IDENTIFIER,
  INVOICE_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: ILI_INVOICE_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: INVOICE_LINE_ITEM_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'invoice',
  label: 'Invoice',
  description: '',
  icon: 'IconReceipt',
  relationTargetObjectMetadataUniversalIdentifier: INVOICE_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: INVOICE_LINE_ITEMS_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.CASCADE,
    joinColumnName: 'invoiceId',
  },
});
