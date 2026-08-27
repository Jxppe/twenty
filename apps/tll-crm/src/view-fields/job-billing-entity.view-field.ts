import {
  defineViewField,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  JOB_BILLING_ENTITY_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
  MATTER_BILLING_ENTITY_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineViewField({
  universalIdentifier: JOB_BILLING_ENTITY_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
  viewUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.views.opportunityRecordPageFields.universalIdentifier,
  fieldMetadataUniversalIdentifier: MATTER_BILLING_ENTITY_FIELD_UNIVERSAL_IDENTIFIER,
  viewFieldGroupUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.views.opportunityRecordPageFields.viewFieldGroups.deal
      .universalIdentifier,
  position: 2,
  isVisible: true,
});
