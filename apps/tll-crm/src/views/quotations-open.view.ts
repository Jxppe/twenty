import { defineView, ViewFilterOperand, ViewSortDirection, ViewType } from 'twenty-sdk/define';

import {
  QUOTATIONS_OPEN_VIEW_UNIVERSAL_IDENTIFIER,
  QUOTATION_MATTER_FIELD_UNIVERSAL_IDENTIFIER,
  QUOTATION_NUMBER_FIELD_UNIVERSAL_IDENTIFIER,
  QUOTATION_OBJECT_UNIVERSAL_IDENTIFIER,
  QUOTATION_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
  QUOTATION_SENT_AT_FIELD_UNIVERSAL_IDENTIFIER,
  QUOTATION_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  QUOTATION_TOTAL_FIELD_UNIVERSAL_IDENTIFIER,
  QUOTATION_VALID_UNTIL_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

// Waiting on the client. Accepted and declined ones leave: this is a chase list,
// not an archive.
export default defineView({
  universalIdentifier: QUOTATIONS_OPEN_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Awaiting an answer',
  objectUniversalIdentifier: QUOTATION_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconFileDollar',
  position: 0,
  fields: [
    { universalIdentifier: '536097de-8c1a-496b-bde2-e8c8eba777d3', fieldMetadataUniversalIdentifier: QUOTATION_NUMBER_FIELD_UNIVERSAL_IDENTIFIER, position: 0, isVisible: true, size: 130 },
    { universalIdentifier: 'ef1a5965-ceb0-4304-a89b-3611bea17fe4', fieldMetadataUniversalIdentifier: QUOTATION_PERSON_FIELD_UNIVERSAL_IDENTIFIER, position: 1, isVisible: true, size: 170 },
    { universalIdentifier: '86dddbee-e314-40ec-b1e0-d690026f5f36', fieldMetadataUniversalIdentifier: QUOTATION_MATTER_FIELD_UNIVERSAL_IDENTIFIER, position: 2, isVisible: true, size: 220 },
    { universalIdentifier: 'b2b6fba8-51dd-4b5f-abb8-ccf7ce191ef6', fieldMetadataUniversalIdentifier: QUOTATION_TOTAL_FIELD_UNIVERSAL_IDENTIFIER, position: 3, isVisible: true, size: 130 },
    { universalIdentifier: 'a71eaa19-15bb-4416-bc32-995a61ae6579', fieldMetadataUniversalIdentifier: QUOTATION_STATUS_FIELD_UNIVERSAL_IDENTIFIER, position: 4, isVisible: true, size: 120 },
    { universalIdentifier: 'ded77fd3-b916-40e9-9915-7cf7148466f4', fieldMetadataUniversalIdentifier: QUOTATION_SENT_AT_FIELD_UNIVERSAL_IDENTIFIER, position: 5, isVisible: true, size: 140 },
    { universalIdentifier: '3676c038-e5f5-41ab-b2e7-2a97147f0de9', fieldMetadataUniversalIdentifier: QUOTATION_VALID_UNTIL_FIELD_UNIVERSAL_IDENTIFIER, position: 6, isVisible: true, size: 140 },
  ],
  sorts: [
    { universalIdentifier: '22c7c401-7d10-426c-8c67-cf1e9b3dafd8', fieldMetadataUniversalIdentifier: QUOTATION_SENT_AT_FIELD_UNIVERSAL_IDENTIFIER, direction: ViewSortDirection.ASC },
  ],
  filters: [
    { universalIdentifier: 'e16a8cd9-f3ec-4a59-8cfd-3c8e6b3f3ce0', fieldMetadataUniversalIdentifier: QUOTATION_STATUS_FIELD_UNIVERSAL_IDENTIFIER, operand: ViewFilterOperand.IS, value: ['DRAFT', 'SENT'] },
  ],
});
