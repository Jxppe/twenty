import { defineViewField } from 'twenty-sdk/define';

import {
  getDerivedViewFieldUniversalIdentifier,
  COMPANY_VIEWS,
} from 'src/constants/thai-name-view-fields';
import { COMPANY_THAI_NAME_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

const view = COMPANY_VIEWS.allCompanies;

export default defineViewField({
  universalIdentifier: getDerivedViewFieldUniversalIdentifier({
    viewUniversalIdentifier: view.universalIdentifier,
    fieldMetadataUniversalIdentifier: COMPANY_THAI_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  }),
  viewUniversalIdentifier: view.universalIdentifier,
  fieldMetadataUniversalIdentifier: COMPANY_THAI_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  position: 0.5,
  isVisible: true,
  size: 180,
});
