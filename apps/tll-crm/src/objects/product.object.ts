import { defineObject, FieldType } from 'twenty-sdk/define';

import {
  PRODUCT_CATEGORY_FIELD_UNIVERSAL_IDENTIFIER,
  PRODUCT_CODE_FIELD_UNIVERSAL_IDENTIFIER,
  PRODUCT_DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER,
  PRODUCT_IS_ACTIVE_FIELD_UNIVERSAL_IDENTIFIER,
  PRODUCT_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  PRODUCT_OBJECT_UNIVERSAL_IDENTIFIER,
  PRODUCT_TAX_RATE_FIELD_UNIVERSAL_IDENTIFIER,
  PRODUCT_UNIT_CASE_OPTION_ID,
  PRODUCT_UNIT_FIELD_UNIVERSAL_IDENTIFIER,
  PRODUCT_UNIT_HOUR_OPTION_ID,
  PRODUCT_UNIT_ITEM_OPTION_ID,
  PRODUCT_UNIT_MONTH_OPTION_ID,
  PRODUCT_UNIT_PRICE_FIELD_UNIVERSAL_IDENTIFIER
} from 'src/constants/universal-identifiers';

// The price list. A line item copies from here rather than pointing at it, so
// retiring a service never rewrites a document the client already has.
export default defineObject({
  universalIdentifier: PRODUCT_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'product',
  namePlural: 'products',
  labelSingular: 'Service',
  labelPlural: 'Services',
  description: 'Something the firm charges for, and what it normally costs',
  icon: 'IconTag',
  labelIdentifierFieldMetadataUniversalIdentifier: PRODUCT_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    { universalIdentifier: PRODUCT_NAME_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.TEXT, name: 'name', label: 'Service', icon: 'IconAbc' },
    { universalIdentifier: PRODUCT_CODE_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.TEXT, name: 'code', label: 'Code', description: 'Optional short reference used on documents', icon: 'IconHash' },
    { universalIdentifier: PRODUCT_DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.TEXT, name: 'description', label: 'Description', description: 'Copied onto a quotation line as its starting text', icon: 'IconFileText' },
    { universalIdentifier: PRODUCT_UNIT_PRICE_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.CURRENCY, name: 'unitPrice', label: 'Price', icon: 'IconCoin', defaultValue: { amountMicros: null, currencyCode: "'THB'" } },
    { universalIdentifier: PRODUCT_TAX_RATE_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.NUMBER, name: 'taxRate', label: 'Tax rate', description: 'Percent. Twenty has no tax concept, so this is ours', icon: 'IconPercentage' },
    { universalIdentifier: PRODUCT_CATEGORY_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.TEXT, name: 'category', label: 'Category', icon: 'IconCategory' },
    { universalIdentifier: PRODUCT_IS_ACTIVE_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.BOOLEAN, name: 'isActive', label: 'Offered', description: 'Turn off to retire it. Old documents must keep resolving', icon: 'IconCircleCheck', defaultValue: true },
    { universalIdentifier: PRODUCT_UNIT_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.SELECT, name: 'unit', label: 'Charged per', icon: 'IconRuler', defaultValue: "'ITEM'", options: [
      { id: PRODUCT_UNIT_ITEM_OPTION_ID, value: 'ITEM', label: 'Item', position: 0, color: 'blue' },
      { id: PRODUCT_UNIT_HOUR_OPTION_ID, value: 'HOUR', label: 'Hour', position: 1, color: 'turquoise' },
      { id: PRODUCT_UNIT_CASE_OPTION_ID, value: 'CASE', label: 'Job', position: 2, color: 'green' },
      { id: PRODUCT_UNIT_MONTH_OPTION_ID, value: 'MONTH', label: 'Month', position: 3, color: 'purple' },
    ] },
  ],
});
