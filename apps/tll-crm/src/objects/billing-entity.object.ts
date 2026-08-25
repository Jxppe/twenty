import { defineObject, FieldType } from 'twenty-sdk/define';

import {
  BILLING_ENTITY_IS_ACTIVE_FIELD_UNIVERSAL_IDENTIFIER,
  BILLING_ENTITY_LEGAL_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  BILLING_ENTITY_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  BILLING_ENTITY_OBJECT_UNIVERSAL_IDENTIFIER,
  BILLING_ENTITY_TAX_ID_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

// Thailiving Law, Unique X Services and Pattaya Notary share clients and bill
// separately. This names the legal party to a contract, so it belongs on the
// matter, the quotation and the invoice, and never on the client.
export default defineObject({
  universalIdentifier: BILLING_ENTITY_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'billingEntity',
  namePlural: 'billingEntities',
  labelSingular: 'Billing entity',
  labelPlural: 'Billing entities',
  description: 'One of the firm’s legal entities, as it appears on a contract',
  icon: 'IconBuildingBank',
  labelIdentifierFieldMetadataUniversalIdentifier:
    BILLING_ENTITY_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: BILLING_ENTITY_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'name',
      label: 'Name',
      description: 'Short name used across the CRM',
      icon: 'IconAbc',
    },
    {
      universalIdentifier: BILLING_ENTITY_LEGAL_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'legalName',
      label: 'Legal name',
      description: 'Registered name as it must appear on invoices',
      icon: 'IconFileCertificate',
    },
    {
      universalIdentifier: BILLING_ENTITY_TAX_ID_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'taxId',
      label: 'Tax ID',
      description: 'Thai taxpayer identification number',
      icon: 'IconReceiptTax',
    },
    {
      universalIdentifier: BILLING_ENTITY_IS_ACTIVE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.BOOLEAN,
      name: 'isActive',
      label: 'Active',
      description: 'Whether new work can be billed to this entity',
      icon: 'IconToggleLeft',
      defaultValue: true,
    },
  ],
});
