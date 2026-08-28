import { defineObject, FieldType } from 'twenty-sdk/define';

import {
  ILI_DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER,
  ILI_DISCOUNT_FIELD_UNIVERSAL_IDENTIFIER,
  ILI_LINE_TOTAL_FIELD_UNIVERSAL_IDENTIFIER,
  ILI_QUANTITY_FIELD_UNIVERSAL_IDENTIFIER,
  ILI_TAX_RATE_FIELD_UNIVERSAL_IDENTIFIER,
  ILI_UNIT_PRICE_FIELD_UNIVERSAL_IDENTIFIER,
  INVOICE_LINE_ITEM_OBJECT_UNIVERSAL_IDENTIFIER
} from 'src/constants/universal-identifiers';

// Text and price are copied from the service, not referenced. The document is a
// historical record and must read the same in a year.
export default defineObject({
  universalIdentifier: INVOICE_LINE_ITEM_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'invoiceLineItem',
  namePlural: 'invoiceLineItems',
  labelSingular: 'Invoice line',
  labelPlural: 'Invoice lines',
  description: 'One charged item',
  icon: 'IconListDetails',
  labelIdentifierFieldMetadataUniversalIdentifier: ILI_DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    { universalIdentifier: ILI_DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.TEXT, name: 'description', label: 'Description', icon: 'IconAbc' },
    { universalIdentifier: ILI_QUANTITY_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.NUMBER, name: 'quantity', label: 'Quantity', icon: 'IconStack', defaultValue: 1 },
    { universalIdentifier: ILI_UNIT_PRICE_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.CURRENCY, name: 'unitPrice', label: 'Unit price', icon: 'IconCoin', defaultValue: { amountMicros: null, currencyCode: "'THB'" } },
    { universalIdentifier: ILI_DISCOUNT_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.CURRENCY, name: 'discount', label: 'Discount', icon: 'IconDiscount', defaultValue: { amountMicros: null, currencyCode: "'THB'" } },
    { universalIdentifier: ILI_TAX_RATE_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.NUMBER, name: 'taxRate', label: 'Tax rate', icon: 'IconPercentage' },
    { universalIdentifier: ILI_LINE_TOTAL_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.CURRENCY, name: 'lineTotal', label: 'Line total', icon: 'IconSum', defaultValue: { amountMicros: null, currencyCode: "'THB'" } },
  ],
});
