import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
} from 'twenty-sdk/define';

import {
  BILLING_ENTITY_INVOICES_FIELD_UNIVERSAL_IDENTIFIER,
  BILLING_ENTITY_OBJECT_UNIVERSAL_IDENTIFIER,
  INVOICE_BILLING_ENTITY_FIELD_UNIVERSAL_IDENTIFIER,
  INVOICE_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: INVOICE_BILLING_ENTITY_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: INVOICE_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'billingEntity',
  label: 'Billing entity',
  description: 'Which company is invoicing',
  icon: 'IconBuildingBank',
  relationTargetObjectMetadataUniversalIdentifier: BILLING_ENTITY_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: BILLING_ENTITY_INVOICES_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'billingEntityId',
  },
});
