import {
  getSystemViewFieldUniversalIdentifier,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

const recordPageView =
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.views.opportunityRecordPageFields;

export const JOB_RECORD_PAGE_VIEW_UNIVERSAL_IDENTIFIER = recordPageView.universalIdentifier;

export const JOB_RECORD_PAGE_GROUPS = recordPageView.viewFieldGroups;

// Twenty's own view fields on this page sit at positions 0, 1, 2 in each group and belong to the
// twenty-standard application, so we cannot move them. Negative positions put ours above them
// instead. This view is a FIELDS_WIDGET, which is exempt from both label-identifier position rules.

// The engine provisions a view field for every field on this page and derives its identifier from
// the view, the field and the application owning the field. Reusing that derivation is what makes
// these declarations updates rather than creates, which pair-uniqueness rejects.
export const getJobViewFieldUniversalIdentifier = (
  fieldMetadataUniversalIdentifier: string,
): string =>
  getSystemViewFieldUniversalIdentifier({
    fieldMetadataApplicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    viewUniversalIdentifier: JOB_RECORD_PAGE_VIEW_UNIVERSAL_IDENTIFIER,
    fieldMetadataUniversalIdentifier,
  });
