import { defineView, ViewFilterOperand, ViewSortDirection, ViewType } from 'twenty-sdk/define';

import {
  DEADLINES_DUE_VIEW_UNIVERSAL_IDENTIFIER,
  MATTER_DEADLINE_COMPLETED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  MATTER_DEADLINE_DUE_AT_FIELD_UNIVERSAL_IDENTIFIER,
  MATTER_DEADLINE_IS_CRITICAL_FIELD_UNIVERSAL_IDENTIFIER,
  MATTER_DEADLINE_MATTER_FIELD_UNIVERSAL_IDENTIFIER,
  MATTER_DEADLINE_OBJECT_UNIVERSAL_IDENTIFIER,
  MATTER_DEADLINE_RESPONSIBLE_FIELD_UNIVERSAL_IDENTIFIER,
  MATTER_DEADLINE_TITLE_FIELD_UNIVERSAL_IDENTIFIER,
  MATTER_DEADLINE_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

// Soonest first, and only what is still outstanding. A deadline list that
// includes everything already done is a list nobody opens twice.
export default defineView({
  universalIdentifier: DEADLINES_DUE_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Deadlines due',
  objectUniversalIdentifier: MATTER_DEADLINE_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconAlarm',
  position: 0,
  fields: [
    { universalIdentifier: '946b4008-b002-4b54-a16b-59dfb1a9ebdb', fieldMetadataUniversalIdentifier: MATTER_DEADLINE_TITLE_FIELD_UNIVERSAL_IDENTIFIER, position: 0, isVisible: true, size: 220 },
    { universalIdentifier: '65070ad4-1830-4e47-8621-df3b2e42f4d5', fieldMetadataUniversalIdentifier: MATTER_DEADLINE_DUE_AT_FIELD_UNIVERSAL_IDENTIFIER, position: 1, isVisible: true, size: 150 },
    { universalIdentifier: '87cfbb05-309d-4480-b07d-dd8867c07057', fieldMetadataUniversalIdentifier: MATTER_DEADLINE_TYPE_FIELD_UNIVERSAL_IDENTIFIER, position: 2, isVisible: true, size: 140 },
    { universalIdentifier: '101277cc-de1e-4368-a97e-edd4bd506102', fieldMetadataUniversalIdentifier: MATTER_DEADLINE_IS_CRITICAL_FIELD_UNIVERSAL_IDENTIFIER, position: 3, isVisible: true, size: 100 },
    { universalIdentifier: '35de76bc-95c3-4a39-93e9-ff0580cdc342', fieldMetadataUniversalIdentifier: MATTER_DEADLINE_MATTER_FIELD_UNIVERSAL_IDENTIFIER, position: 4, isVisible: true, size: 200 },
    { universalIdentifier: 'eb4abd7b-b208-4231-8e3e-cc722cd6e4e5', fieldMetadataUniversalIdentifier: MATTER_DEADLINE_RESPONSIBLE_FIELD_UNIVERSAL_IDENTIFIER, position: 5, isVisible: true, size: 160 },
  ],
  sorts: [
    { universalIdentifier: 'cdf9c51e-aa65-46bd-9f15-297f7cb3c3b8', fieldMetadataUniversalIdentifier: MATTER_DEADLINE_DUE_AT_FIELD_UNIVERSAL_IDENTIFIER, direction: ViewSortDirection.ASC },
  ],
  filters: [
    { universalIdentifier: '4c8d8937-27f5-4297-8e72-d02e236d9e1f', fieldMetadataUniversalIdentifier: MATTER_DEADLINE_COMPLETED_AT_FIELD_UNIVERSAL_IDENTIFIER, operand: ViewFilterOperand.IS_EMPTY, value: '' },
  ],
});
