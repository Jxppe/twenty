import { defineView, ViewFilterOperand, ViewSortDirection, ViewType } from 'twenty-sdk/define';

import {
  OUTSTANDING_DOCUMENTS_VIEW_UNIVERSAL_IDENTIFIER,
  REQUIRED_DOCUMENT_MATTER_FIELD_UNIVERSAL_IDENTIFIER,
  REQUIRED_DOCUMENT_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  REQUIRED_DOCUMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  REQUIRED_DOCUMENT_REQUESTED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  REQUIRED_DOCUMENT_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

// Oldest request first: the ones that have been waiting longest are the ones
// worth chasing.
export default defineView({
  universalIdentifier: OUTSTANDING_DOCUMENTS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Waiting on clients',
  objectUniversalIdentifier: REQUIRED_DOCUMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconFileDescription',
  position: 1,
  fields: [
    { universalIdentifier: '5fb5f5bf-1916-4fa9-8ca3-18e1f2b8be6c', fieldMetadataUniversalIdentifier: REQUIRED_DOCUMENT_NAME_FIELD_UNIVERSAL_IDENTIFIER, position: 0, isVisible: true, size: 220 },
    { universalIdentifier: 'd3f90a00-0a3a-4c61-afac-bb055ebccfe0', fieldMetadataUniversalIdentifier: REQUIRED_DOCUMENT_STATUS_FIELD_UNIVERSAL_IDENTIFIER, position: 1, isVisible: true, size: 130 },
    { universalIdentifier: '78506bfd-a135-4354-bfa9-97f18d627a72', fieldMetadataUniversalIdentifier: REQUIRED_DOCUMENT_MATTER_FIELD_UNIVERSAL_IDENTIFIER, position: 2, isVisible: true, size: 220 },
    { universalIdentifier: 'fb4784b1-b835-4c9f-9648-06135e894d1e', fieldMetadataUniversalIdentifier: REQUIRED_DOCUMENT_REQUESTED_AT_FIELD_UNIVERSAL_IDENTIFIER, position: 3, isVisible: true, size: 150 },
  ],
  sorts: [
    { universalIdentifier: '2a9f38c5-4b4b-4cd1-9f66-e0ba35305269', fieldMetadataUniversalIdentifier: REQUIRED_DOCUMENT_REQUESTED_AT_FIELD_UNIVERSAL_IDENTIFIER, direction: ViewSortDirection.ASC },
  ],
  filters: [
    { universalIdentifier: '444c56f8-0df0-4c5e-abc5-e34ee0769012', fieldMetadataUniversalIdentifier: REQUIRED_DOCUMENT_STATUS_FIELD_UNIVERSAL_IDENTIFIER, operand: ViewFilterOperand.IS, value: ['REQUESTED'] },
  ],
});
