import {
  getSystemViewFieldUniversalIdentifier,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

const recordPageView =
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.views.opportunityRecordPageFields;

export const JOB_RECORD_PAGE_VIEW_UNIVERSAL_IDENTIFIER = recordPageView.universalIdentifier;

export const JOB_RECORD_PAGE_GROUPS = recordPageView.viewFieldGroups;

export const JOB_RECORD_PAGE_STANDARD_VIEW_FIELDS = recordPageView.viewFields;

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
