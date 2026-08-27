import {
  defineField,
  FieldType,
  RelationType,
} from 'twenty-sdk/define';

import {
  INVOICE_OBJECT_UNIVERSAL_IDENTIFIER,
  INVOICE_QUOTATION_FIELD_UNIVERSAL_IDENTIFIER,
  QUOTATION_INVOICES_FIELD_UNIVERSAL_IDENTIFIER,
  QUOTATION_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: QUOTATION_INVOICES_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: QUOTATION_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'invoices',
  label: 'Invoices',
  description: 'Raised from this quotation',
  icon: 'IconReceipt',
  relationTargetObjectMetadataUniversalIdentifier: INVOICE_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: INVOICE_QUOTATION_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
