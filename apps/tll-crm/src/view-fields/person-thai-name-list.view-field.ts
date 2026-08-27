import { defineViewField } from 'twenty-sdk/define';

import {
  getDerivedViewFieldUniversalIdentifier,
  PERSON_VIEWS,
} from 'src/constants/thai-name-view-fields';
import { PERSON_THAI_NAME_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

const view = PERSON_VIEWS.allPeople;

export default defineViewField({
  universalIdentifier: getDerivedViewFieldUniversalIdentifier({
    viewUniversalIdentifier: view.universalIdentifier,
    fieldMetadataUniversalIdentifier: PERSON_THAI_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  }),
  viewUniversalIdentifier: view.universalIdentifier,
  fieldMetadataUniversalIdentifier: PERSON_THAI_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  position: 0.5,
  isVisible: true,
  size: 180,
});
