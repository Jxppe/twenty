import { defineLogicFunction } from 'twenty-sdk/define';

import { PRICE_QUOTATION_LINE_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { buildQuotationLinePricer } from 'src/pricing/price-lines';

export default defineLogicFunction({
  universalIdentifier: PRICE_QUOTATION_LINE_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'price-quotation-line',
  databaseEventTriggerSettings: {
    eventName: 'quotationLineItem.*',
    updatedFields: ['quantity', 'unitPrice', 'discount', 'taxRate', 'productId'],
  },
  handler: buildQuotationLinePricer(),
});
