import { defineView, ViewType } from 'twenty-sdk/define';

import {
  PRACTICE_AREAS_VIEW_UNIVERSAL_IDENTIFIER,
  PRACTICE_AREA_DEFAULT_BILLING_ENTITY_FIELD_UNIVERSAL_IDENTIFIER,
  PRACTICE_AREA_IS_ACTIVE_FIELD_UNIVERSAL_IDENTIFIER,
  PRACTICE_AREA_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  PRACTICE_AREA_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineView({
  universalIdentifier: PRACTICE_AREAS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Types of work',
  objectUniversalIdentifier: PRACTICE_AREA_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconScale',
  position: 1,
  fields: [
    { universalIdentifier: '11a7138e-7dd7-41d0-a05a-b403ba006648', fieldMetadataUniversalIdentifier: PRACTICE_AREA_NAME_FIELD_UNIVERSAL_IDENTIFIER, position: 0, isVisible: true, size: 220 },
    { universalIdentifier: '07a27758-f18d-4955-9568-a546025f341d', fieldMetadataUniversalIdentifier: PRACTICE_AREA_DEFAULT_BILLING_ENTITY_FIELD_UNIVERSAL_IDENTIFIER, position: 1, isVisible: true, size: 200 },
    { universalIdentifier: '5140fa37-325b-4b5c-896f-5c2c796b008f', fieldMetadataUniversalIdentifier: PRACTICE_AREA_IS_ACTIVE_FIELD_UNIVERSAL_IDENTIFIER, position: 2, isVisible: true, size: 100 },
  ],
});
