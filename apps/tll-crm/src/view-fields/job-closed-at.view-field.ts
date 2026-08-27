import { defineViewField } from 'twenty-sdk/define';

import {
  getJobViewFieldUniversalIdentifier,
  JOB_RECORD_PAGE_GROUPS,
  JOB_RECORD_PAGE_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/job-record-page';
import { MATTER_CLOSED_AT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineViewField({
  universalIdentifier: getJobViewFieldUniversalIdentifier(MATTER_CLOSED_AT_FIELD_UNIVERSAL_IDENTIFIER),
  viewUniversalIdentifier: JOB_RECORD_PAGE_VIEW_UNIVERSAL_IDENTIFIER,
  fieldMetadataUniversalIdentifier: MATTER_CLOSED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  viewFieldGroupUniversalIdentifier: JOB_RECORD_PAGE_GROUPS.deal.universalIdentifier,
  position: 3,
  isVisible: true,
});
