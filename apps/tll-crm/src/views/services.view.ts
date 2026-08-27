import { defineView, ViewFilterOperand, ViewSortDirection, ViewType } from 'twenty-sdk/define';

import {
  PRODUCTS_VIEW_UNIVERSAL_IDENTIFIER,
  PRODUCT_CATEGORY_FIELD_UNIVERSAL_IDENTIFIER,
  PRODUCT_CODE_FIELD_UNIVERSAL_IDENTIFIER,
  PRODUCT_IS_ACTIVE_FIELD_UNIVERSAL_IDENTIFIER,
  PRODUCT_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  PRODUCT_OBJECT_UNIVERSAL_IDENTIFIER,
  PRODUCT_UNIT_FIELD_UNIVERSAL_IDENTIFIER,
  PRODUCT_UNIT_PRICE_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

// Retired services stay in the list only when asked for: a price list with
// things you no longer sell is how the wrong price reaches a client.
export default defineView({
  universalIdentifier: PRODUCTS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Price list',
  objectUniversalIdentifier: PRODUCT_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconTag',
  position: 0,
  fields: [
    { universalIdentifier: '2e32958c-2417-434c-9c52-acfa83407419', fieldMetadataUniversalIdentifier: PRODUCT_NAME_FIELD_UNIVERSAL_IDENTIFIER, position: 0, isVisible: true, size: 240 },
    { universalIdentifier: 'a25cca14-bfc8-41e3-a71d-462ef074f380', fieldMetadataUniversalIdentifier: PRODUCT_UNIT_PRICE_FIELD_UNIVERSAL_IDENTIFIER, position: 1, isVisible: true, size: 140 },
    { universalIdentifier: 'd21da5c2-1719-45e0-a8c5-7ac023623a02', fieldMetadataUniversalIdentifier: PRODUCT_UNIT_FIELD_UNIVERSAL_IDENTIFIER, position: 2, isVisible: true, size: 120 },
    { universalIdentifier: 'ec39920e-ef9d-45aa-b810-38d2b68657a1', fieldMetadataUniversalIdentifier: PRODUCT_CATEGORY_FIELD_UNIVERSAL_IDENTIFIER, position: 3, isVisible: true, size: 160 },
    { universalIdentifier: 'c3f7cf26-fcc4-49f5-8c2b-f2ed6ca2dc5b', fieldMetadataUniversalIdentifier: PRODUCT_CODE_FIELD_UNIVERSAL_IDENTIFIER, position: 4, isVisible: true, size: 120 },
    { universalIdentifier: '5bf8a965-5dc0-4a3f-a1e4-70235168a107', fieldMetadataUniversalIdentifier: PRODUCT_IS_ACTIVE_FIELD_UNIVERSAL_IDENTIFIER, position: 5, isVisible: true, size: 100 },
  ],
  sorts: [
    { universalIdentifier: 'd0c41bab-d56c-413c-9e1e-c2f032e83533', fieldMetadataUniversalIdentifier: PRODUCT_NAME_FIELD_UNIVERSAL_IDENTIFIER, direction: ViewSortDirection.ASC },
  ],
  filters: [
    { universalIdentifier: '32015c43-1b28-4d58-8b3f-8754849bbe98', fieldMetadataUniversalIdentifier: PRODUCT_IS_ACTIVE_FIELD_UNIVERSAL_IDENTIFIER, operand: ViewFilterOperand.IS, value: true },
  ],
});
