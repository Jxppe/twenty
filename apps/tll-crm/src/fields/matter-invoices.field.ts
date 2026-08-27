import {
  defineField,
  FieldType,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  INVOICE_MATTER_FIELD_UNIVERSAL_IDENTIFIER,
  INVOICE_OBJECT_UNIVERSAL_IDENTIFIER,
  MATTER_INVOICES_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: MATTER_INVOICES_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: FieldType.RELATION,
  name: 'invoices',
  label: 'Invoices',
  description: 'Billed against this job',
  icon: 'IconReceipt',
  relationTargetObjectMetadataUniversalIdentifier: INVOICE_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: INVOICE_MATTER_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
