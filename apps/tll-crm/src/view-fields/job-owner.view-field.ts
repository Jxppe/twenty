import {
  defineViewField,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  JOB_RECORD_PAGE_GROUPS,
  JOB_RECORD_PAGE_STANDARD_VIEW_FIELDS,
  JOB_RECORD_PAGE_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/job-record-page';

export default defineViewField({
  universalIdentifier: JOB_RECORD_PAGE_STANDARD_VIEW_FIELDS.owner.universalIdentifier,
  viewUniversalIdentifier: JOB_RECORD_PAGE_VIEW_UNIVERSAL_IDENTIFIER,
  fieldMetadataUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.fields.owner.universalIdentifier,
  viewFieldGroupUniversalIdentifier: JOB_RECORD_PAGE_GROUPS.relations.universalIdentifier,
  position: 5,
  isVisible: true,
});
