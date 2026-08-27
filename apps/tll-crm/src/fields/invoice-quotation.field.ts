import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
} from 'twenty-sdk/define';

import {
  INVOICE_OBJECT_UNIVERSAL_IDENTIFIER,
  INVOICE_QUOTATION_FIELD_UNIVERSAL_IDENTIFIER,
  QUOTATION_INVOICES_FIELD_UNIVERSAL_IDENTIFIER,
  QUOTATION_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: INVOICE_QUOTATION_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: INVOICE_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'quotation',
  label: 'From quotation',
  description: 'Copied from, not linked to: editing the quotation afterwards must not move the invoice',
  icon: 'IconFileDollar',
  relationTargetObjectMetadataUniversalIdentifier: QUOTATION_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: QUOTATION_INVOICES_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'quotationId',
  },
});
