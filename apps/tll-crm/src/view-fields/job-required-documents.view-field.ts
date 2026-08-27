import {
  defineViewField,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  JOB_REQUIRED_DOCUMENTS_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
  MATTER_REQUIRED_DOCUMENTS_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineViewField({
  universalIdentifier: JOB_REQUIRED_DOCUMENTS_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
  viewUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.views.opportunityRecordPageFields.universalIdentifier,
  fieldMetadataUniversalIdentifier: MATTER_REQUIRED_DOCUMENTS_FIELD_UNIVERSAL_IDENTIFIER,
  viewFieldGroupUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.views.opportunityRecordPageFields.viewFieldGroups.relations
      .universalIdentifier,
  position: 1,
  isVisible: true,
});
