import {
  defineView,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  ViewFilterOperand,
  ViewSortDirection,
  ViewType,
} from 'twenty-sdk/define';

import {
  MATTER_BILLING_ENTITY_FIELD_UNIVERSAL_IDENTIFIER,
  MATTER_CLOSED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  MATTER_MATTER_DEADLINES_FIELD_UNIVERSAL_IDENTIFIER,
  MATTER_OPENED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  MATTER_PRACTICE_AREA_FIELD_UNIVERSAL_IDENTIFIER,
  OPEN_JOBS_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

const opportunity = STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity;

// Twenty owns every column on its own "All Jobs" view and an app cannot move them, so the list that
// reads as practice management has to be a view of ours. Amount is deliberately absent: what a job
// is worth is a question for the invoice, not for the list staff open every morning.
//
// Client sits immediately after the name: the firm files by client and then date, so a job list that
// leads with anything else reads against how people already think about the work.
export default defineView({
  universalIdentifier: OPEN_JOBS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Open jobs',
  objectUniversalIdentifier: opportunity.universalIdentifier,
  type: ViewType.TABLE,
  icon: 'IconBriefcase',
  position: 0,
  fields: [
    { universalIdentifier: '2832be5e-03b4-4ce8-838e-0b284502b8c5', fieldMetadataUniversalIdentifier: opportunity.fields.name.universalIdentifier, position: 0, isVisible: true, size: 240 },
    { universalIdentifier: '1ea3e207-26f4-4a7f-b3a5-024db9327ecf', fieldMetadataUniversalIdentifier: opportunity.fields.stage.universalIdentifier, position: 2, isVisible: true, size: 130 },
    { universalIdentifier: '980e5570-1192-4039-a7f9-e878e1b80ac7', fieldMetadataUniversalIdentifier: MATTER_PRACTICE_AREA_FIELD_UNIVERSAL_IDENTIFIER, position: 4, isVisible: true, size: 160 },
    { universalIdentifier: '0a8f30d6-1e0b-4172-b634-f4a03c0e9e64', fieldMetadataUniversalIdentifier: MATTER_MATTER_DEADLINES_FIELD_UNIVERSAL_IDENTIFIER, position: 3, isVisible: true, size: 200 },
    { universalIdentifier: 'daa6c18e-18f4-4013-bae2-dd1251f3aab1', fieldMetadataUniversalIdentifier: opportunity.fields.company.universalIdentifier, position: 6, isVisible: true, size: 160 },
    { universalIdentifier: '6bd8e043-b8e3-4761-b3ff-0e1d44bc3089', fieldMetadataUniversalIdentifier: opportunity.fields.pointOfContact.universalIdentifier, position: 1, isVisible: true, size: 160 },
    { universalIdentifier: 'f1094166-ae65-42b8-9b9e-a6799450f2c9', fieldMetadataUniversalIdentifier: MATTER_BILLING_ENTITY_FIELD_UNIVERSAL_IDENTIFIER, position: 7, isVisible: true, size: 150 },
    { universalIdentifier: 'e3b68cbc-b990-4eaa-9124-7809404cce7c', fieldMetadataUniversalIdentifier: MATTER_OPENED_AT_FIELD_UNIVERSAL_IDENTIFIER, position: 5, isVisible: true, size: 140 },
  ],
  sorts: [
    { universalIdentifier: 'b0b9872e-81f0-44d9-8f20-2a7fed97d0d3', fieldMetadataUniversalIdentifier: opportunity.fields.createdAt.universalIdentifier, direction: ViewSortDirection.DESC },
  ],
  filters: [
    { universalIdentifier: 'e4a174a6-e540-4c77-8560-3d8f18ec7a26', fieldMetadataUniversalIdentifier: MATTER_CLOSED_AT_FIELD_UNIVERSAL_IDENTIFIER, operand: ViewFilterOperand.IS_EMPTY, value: '' },
  ],
});
