import { defineView, ViewType } from 'twenty-sdk/define';

import {
  BILLING_ENTITIES_VIEW_UNIVERSAL_IDENTIFIER,
  BILLING_ENTITY_IS_ACTIVE_FIELD_UNIVERSAL_IDENTIFIER,
  BILLING_ENTITY_LEGAL_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  BILLING_ENTITY_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  BILLING_ENTITY_OBJECT_UNIVERSAL_IDENTIFIER,
  BILLING_ENTITY_TAX_ID_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineView({
  universalIdentifier: BILLING_ENTITIES_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Billing entities',
  objectUniversalIdentifier: BILLING_ENTITY_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconBuildingBank',
  position: 0,
  fields: [
    { universalIdentifier: 'fba66b40-637d-41d0-955e-de39bc0d4725', fieldMetadataUniversalIdentifier: BILLING_ENTITY_NAME_FIELD_UNIVERSAL_IDENTIFIER, position: 0, isVisible: true, size: 180 },
    { universalIdentifier: '23ad765c-05fd-46ba-8bc0-2b8ccc6bb014', fieldMetadataUniversalIdentifier: BILLING_ENTITY_LEGAL_NAME_FIELD_UNIVERSAL_IDENTIFIER, position: 1, isVisible: true, size: 280 },
    { universalIdentifier: '43521bb7-ec4b-41c6-bb9b-c91f8fa759e5', fieldMetadataUniversalIdentifier: BILLING_ENTITY_TAX_ID_FIELD_UNIVERSAL_IDENTIFIER, position: 2, isVisible: true, size: 160 },
    { universalIdentifier: '885b5dc2-4a46-4b06-9e34-05e9608b576b', fieldMetadataUniversalIdentifier: BILLING_ENTITY_IS_ACTIVE_FIELD_UNIVERSAL_IDENTIFIER, position: 3, isVisible: true, size: 100 },
  ],
});
