import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { PRICE_QUOTATION_LINE_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

type Money = { amountMicros?: number | null; currencyCode?: string | null };

type LineRow = {
  id?: string;
  description?: string | null;
  quantity?: number | null;
  unitPrice?: Money | null;
  discount?: Money | null;
  taxRate?: number | null;
  lineTotal?: Money | null;
  productId?: string | null;
  quotationId?: string | null;
  invoiceId?: string | null;
};

type Payload = { record?: { id?: string } };

const micros = (money: Money | null | undefined): number =>
  money?.amountMicros ?? 0;

const currencyOf = (...candidates: (Money | null | undefined)[]): string => {
  for (const candidate of candidates) {
    if (candidate?.currencyCode) {
      return candidate.currencyCode;
    }
  }

  return 'THB';
};

const money = (amountMicros: number, currencyCode: string): Money => ({
  amountMicros: Math.round(amountMicros),
  currencyCode,
});

// A line is worth quantity times price, less its discount, and the document is
// worth the sum of its lines plus their tax. Both are arithmetic nobody should
// be doing by hand into a form, and doing it here rather than in the UI means it
// holds however the row arrived: typed, imported or through the API.
const buildHandler = (kind: 'quotation' | 'invoice') => {
  const lineObject = kind === 'quotation' ? 'quotationLineItem' : 'invoiceLineItem';
  const linesQuery = kind === 'quotation' ? 'quotationLineItems' : 'invoiceLineItems';
  const parentField = kind === 'quotation' ? 'quotationId' : 'invoiceId';
  const updateLine = kind === 'quotation' ? 'updateQuotationLineItem' : 'updateInvoiceLineItem';
  const updateParent = kind === 'quotation' ? 'updateQuotation' : 'updateInvoice';

  return async (payload: Payload): Promise<{ priced: boolean; parentUpdated: boolean }> => {
    const lineId = payload.record?.id;

    if (lineId === undefined) {
      return { priced: false, parentUpdated: false };
    }

    const client = new CoreApiClient();

    const found = (await client.query({
      [lineObject]: {
        __args: { filter: { id: { eq: lineId } } },
        id: true,
        description: true,
        quantity: true,
        unitPrice: { amountMicros: true, currencyCode: true },
        discount: { amountMicros: true, currencyCode: true },
        taxRate: true,
        lineTotal: { amountMicros: true, currencyCode: true },
        productId: true,
        [parentField]: true,
      },
    })) as Record<string, LineRow | undefined>;

    const line = found[lineObject];

    if (line === undefined) {
      return { priced: false, parentUpdated: false };
    }

    // A blank line that names a service takes the service's text, price and tax
    // rate. Filled values are never overwritten: someone who typed a number
    // meant it.
    let unitPrice = line.unitPrice ?? null;
    let taxRate = line.taxRate ?? null;
    let description = line.description ?? null;

    if (line.productId) {
      const productResult = (await client.query({
        product: {
          __args: { filter: { id: { eq: line.productId } } },
          name: true,
          description: true,
          taxRate: true,
          unitPrice: { amountMicros: true, currencyCode: true },
        },
      })) as {
        product?: {
          name?: string | null;
          description?: string | null;
          taxRate?: number | null;
          unitPrice?: Money | null;
        };
      };
      const product = productResult.product;

      if (micros(unitPrice) === 0 && product?.unitPrice) {
        unitPrice = product.unitPrice;
      }

      if ((taxRate ?? 0) === 0 && typeof product?.taxRate === 'number') {
        taxRate = product.taxRate;
      }

      if (!description) {
        description = product?.description || product?.name || null;
      }
    }

    const currencyCode = currencyOf(unitPrice, line.lineTotal, line.discount);
    const quantity = line.quantity ?? 1;
    const gross = micros(unitPrice) * quantity;
    const lineTotalMicros = Math.max(gross - micros(line.discount), 0);

    await client.mutation({
      [updateLine]: {
        __args: {
          id: lineId,
          data: {
            lineTotal: money(lineTotalMicros, currencyCode),
            ...(unitPrice !== line.unitPrice ? { unitPrice } : {}),
            ...(taxRate !== line.taxRate ? { taxRate } : {}),
            ...(description !== line.description ? { description } : {}),
          },
        },
        id: true,
      },
    });

    const parentId = line[parentField as 'quotationId' | 'invoiceId'];

    if (!parentId) {
      return { priced: true, parentUpdated: false };
    }

    const siblings = (await client.query({
      [linesQuery]: {
        __args: { filter: { [parentField]: { eq: parentId } }, first: 200 },
        edges: {
          node: {
            id: true,
            taxRate: true,
            lineTotal: { amountMicros: true, currencyCode: true },
          },
        },
      },
    })) as Record<string, { edges?: { node?: LineRow }[] } | undefined>;

    let subtotal = 0;
    let tax = 0;

    for (const edge of siblings[linesQuery]?.edges ?? []) {
      const node = edge.node;

      if (node === undefined) {
        continue;
      }

      // The line we just wrote may still read stale here, so use what we
      // computed rather than what came back for it.
      const total = node.id === lineId ? lineTotalMicros : micros(node.lineTotal);
      const rate = node.id === lineId ? (taxRate ?? 0) : (node.taxRate ?? 0);

      subtotal += total;
      tax += (total * rate) / 100;
    }

    await client.mutation({
      [updateParent]: {
        __args: {
          id: parentId,
          data: {
            subtotal: money(subtotal, currencyCode),
            tax: money(tax, currencyCode),
            total: money(subtotal + tax, currencyCode),
          },
        },
        id: true,
      },
    });

    return { priced: true, parentUpdated: true };
  };
};

export const buildInvoiceLinePricer = () => buildHandler('invoice');

export const priceQuotationLine = defineLogicFunction({
  universalIdentifier: PRICE_QUOTATION_LINE_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'price-quotation-line',
  databaseEventTriggerSettings: {
    eventName: 'quotationLineItem.*',
    updatedFields: ['quantity', 'unitPrice', 'discount', 'taxRate', 'productId'],
  },
  handler: buildHandler('quotation'),
});

export default priceQuotationLine;
