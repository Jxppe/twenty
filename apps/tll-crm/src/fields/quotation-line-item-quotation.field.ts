import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
} from 'twenty-sdk/define';

import {
  QLI_QUOTATION_FIELD_UNIVERSAL_IDENTIFIER,
  QUOTATION_LINE_ITEMS_FIELD_UNIVERSAL_IDENTIFIER,
  QUOTATION_LINE_ITEM_OBJECT_UNIVERSAL_IDENTIFIER,
  QUOTATION_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: QLI_QUOTATION_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: QUOTATION_LINE_ITEM_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'quotation',
  label: 'Quotation',
  description: '',
  icon: 'IconFileDollar',
  relationTargetObjectMetadataUniversalIdentifier: QUOTATION_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: QUOTATION_LINE_ITEMS_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.CASCADE,
    joinColumnName: 'quotationId',
  },
});
