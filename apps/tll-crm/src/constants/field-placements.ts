import {
  getSystemViewFieldUniversalIdentifier,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  APPLICATION_UNIVERSAL_IDENTIFIER,
  COMPANY_THAI_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  MATTER_BILLING_ENTITY_FIELD_UNIVERSAL_IDENTIFIER,
  MATTER_BOOKINGS_FIELD_UNIVERSAL_IDENTIFIER,
  MATTER_CLOSED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  MATTER_MATTER_DEADLINES_FIELD_UNIVERSAL_IDENTIFIER,
  MATTER_OPENED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  MATTER_PRACTICE_AREA_FIELD_UNIVERSAL_IDENTIFIER,
  MATTER_REQUIRED_DOCUMENTS_FIELD_UNIVERSAL_IDENTIFIER,
  PERSON_THAI_NAME_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export type FieldPlacement = {
  viewUniversalIdentifier: string;
  viewFieldUniversalIdentifier: string;
  groupName?: string;
  position: number;
};

const opportunity = STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.views;
const person = STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.views;
const company = STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.views;

const place = (
  viewUniversalIdentifier: string,
  fieldMetadataUniversalIdentifier: string,
  position: number,
  groupName?: string,
): FieldPlacement => ({
  viewUniversalIdentifier,
  viewFieldUniversalIdentifier: getSystemViewFieldUniversalIdentifier({
    fieldMetadataApplicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    viewUniversalIdentifier,
    fieldMetadataUniversalIdentifier,
  }),
  position,
  ...(groupName !== undefined ? { groupName } : {}),
});

const jobRecordPage = opportunity.opportunityRecordPageFields.universalIdentifier;

// Twenty's own columns sit at 0, 1, 2 in each group and belong to another
// application, so they cannot be moved. Position is a double and this view is a
// FIELDS_WIDGET, exempt from the label-identifier position rules, so a negative
// position puts ours above them instead.
export const FIELD_PLACEMENTS: FieldPlacement[] = [
  place(jobRecordPage, MATTER_PRACTICE_AREA_FIELD_UNIVERSAL_IDENTIFIER, -3, 'Deal'),
  place(jobRecordPage, MATTER_BILLING_ENTITY_FIELD_UNIVERSAL_IDENTIFIER, -2, 'Deal'),
  place(jobRecordPage, MATTER_OPENED_AT_FIELD_UNIVERSAL_IDENTIFIER, -1, 'Deal'),
  place(jobRecordPage, MATTER_CLOSED_AT_FIELD_UNIVERSAL_IDENTIFIER, 3, 'Deal'),
  place(jobRecordPage, MATTER_MATTER_DEADLINES_FIELD_UNIVERSAL_IDENTIFIER, -3, 'Relations'),
  place(jobRecordPage, MATTER_REQUIRED_DOCUMENTS_FIELD_UNIVERSAL_IDENTIFIER, -2, 'Relations'),
  place(jobRecordPage, MATTER_BOOKINGS_FIELD_UNIVERSAL_IDENTIFIER, -1, 'Relations'),

  // The record page shows the label identifier in its title rather than as a
  // field, so the first slot of the first group sits directly under the English
  // name. On the lists the name is at 0 and the next column at 1, and 0.5 lands
  // between them without moving anything Twenty owns.
  place(person.personRecordPageFields.universalIdentifier, PERSON_THAI_NAME_FIELD_UNIVERSAL_IDENTIFIER, -1, 'General'),
  place(person.allPeople.universalIdentifier, PERSON_THAI_NAME_FIELD_UNIVERSAL_IDENTIFIER, 0.5),
  place(company.companyRecordPageFields.universalIdentifier, COMPANY_THAI_NAME_FIELD_UNIVERSAL_IDENTIFIER, -1, 'General'),
  place(company.allCompanies.universalIdentifier, COMPANY_THAI_NAME_FIELD_UNIVERSAL_IDENTIFIER, 0.5),
];
