import { defineViewField } from 'twenty-sdk/define';

import {
  getJobViewFieldUniversalIdentifier,
  JOB_RECORD_PAGE_GROUPS,
  JOB_RECORD_PAGE_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/job-record-page';
import { MATTER_REQUIRED_DOCUMENTS_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineViewField({
  universalIdentifier: getJobViewFieldUniversalIdentifier(MATTER_REQUIRED_DOCUMENTS_FIELD_UNIVERSAL_IDENTIFIER),
  viewUniversalIdentifier: JOB_RECORD_PAGE_VIEW_UNIVERSAL_IDENTIFIER,
  fieldMetadataUniversalIdentifier: MATTER_REQUIRED_DOCUMENTS_FIELD_UNIVERSAL_IDENTIFIER,
  viewFieldGroupUniversalIdentifier: JOB_RECORD_PAGE_GROUPS.relations.universalIdentifier,
  position: -2,
  isVisible: true,
});
