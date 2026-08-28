import { defineLogicFunction } from 'twenty-sdk/define';

import { PRICE_INVOICE_LINE_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { buildInvoiceLinePricer } from 'src/logic-functions/price-lines';

export default defineLogicFunction({
  universalIdentifier: PRICE_INVOICE_LINE_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'price-invoice-line',
  databaseEventTriggerSettings: {
    eventName: 'invoiceLineItem.*',
    updatedFields: ['quantity', 'unitPrice', 'discount', 'taxRate', 'productId'],
  },
  handler: buildInvoiceLinePricer(),
});
