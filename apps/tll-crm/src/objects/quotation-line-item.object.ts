import { defineObject, FieldType } from 'twenty-sdk/define';

import {
  QLI_DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER,
  QLI_DISCOUNT_FIELD_UNIVERSAL_IDENTIFIER,
  QLI_LINE_TOTAL_FIELD_UNIVERSAL_IDENTIFIER,
  QLI_QUANTITY_FIELD_UNIVERSAL_IDENTIFIER,
  QLI_TAX_RATE_FIELD_UNIVERSAL_IDENTIFIER,
  QLI_UNIT_PRICE_FIELD_UNIVERSAL_IDENTIFIER,
  QUOTATION_LINE_ITEM_OBJECT_UNIVERSAL_IDENTIFIER
} from 'src/constants/universal-identifiers';

// Text and price are copied from the service, not referenced. The document is a
// historical record and must read the same in a year.
export default defineObject({
  universalIdentifier: QUOTATION_LINE_ITEM_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'quotationLineItem',
  namePlural: 'quotationLineItems',
  labelSingular: 'Quotation line',
  labelPlural: 'Quotation lines',
  description: 'One charged item',
  icon: 'IconListDetails',
  labelIdentifierFieldMetadataUniversalIdentifier: QLI_DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    { universalIdentifier: QLI_DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.TEXT, name: 'description', label: 'Description', icon: 'IconAbc' },
    { universalIdentifier: QLI_QUANTITY_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.NUMBER, name: 'quantity', label: 'Quantity', icon: 'IconStack', defaultValue: 1 },
    { universalIdentifier: QLI_UNIT_PRICE_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.CURRENCY, name: 'unitPrice', label: 'Unit price', icon: 'IconCoin', defaultValue: { amountMicros: null, currencyCode: "'THB'" } },
    { universalIdentifier: QLI_DISCOUNT_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.CURRENCY, name: 'discount', label: 'Discount', icon: 'IconDiscount', defaultValue: { amountMicros: null, currencyCode: "'THB'" } },
    { universalIdentifier: QLI_TAX_RATE_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.NUMBER, name: 'taxRate', label: 'Tax rate', icon: 'IconPercentage' },
    { universalIdentifier: QLI_LINE_TOTAL_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.CURRENCY, name: 'lineTotal', label: 'Line total', icon: 'IconSum', defaultValue: { amountMicros: null, currencyCode: "'THB'" } },
  ],
});
