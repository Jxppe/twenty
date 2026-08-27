import {
  defineView,
  ViewFilterOperand,
  ViewSortDirection,
  ViewType,
} from 'twenty-sdk/define';

import {
  WORK_LOG_BILLING_ENTITY_FIELD_UNIVERSAL_IDENTIFIER,
  WORK_LOG_DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER,
  WORK_LOG_IS_BILLABLE_FIELD_UNIVERSAL_IDENTIFIER,
  WORK_LOG_MATTER_FIELD_UNIVERSAL_IDENTIFIER,
  WORK_LOG_MINUTES_FIELD_UNIVERSAL_IDENTIFIER,
  WORK_LOG_OBJECT_UNIVERSAL_IDENTIFIER,
  WORK_LOG_STAFF_FIELD_UNIVERSAL_IDENTIFIER,
  WORK_LOG_WORKED_ON_FIELD_UNIVERSAL_IDENTIFIER,
  WORK_THIS_WEEK_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

// The label identifier has to sit at position 0, so the line of work leads even
// though the day is what you scan down.
export default defineView({
  universalIdentifier: WORK_THIS_WEEK_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'This week',
  objectUniversalIdentifier: WORK_LOG_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconClockEdit',
  position: 0,
  fields: [
    { universalIdentifier: 'f7ba965e-4387-4bf4-9b11-950e51b7b3b9', fieldMetadataUniversalIdentifier: WORK_LOG_DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER, position: 0, isVisible: true, size: 280 },
    { universalIdentifier: '90492604-c07e-4640-9384-bb209f9b1a3c', fieldMetadataUniversalIdentifier: WORK_LOG_WORKED_ON_FIELD_UNIVERSAL_IDENTIFIER, position: 1, isVisible: true, size: 120 },
    { universalIdentifier: '928831b6-1ab5-4de9-aefd-c0974ce749a4', fieldMetadataUniversalIdentifier: WORK_LOG_STAFF_FIELD_UNIVERSAL_IDENTIFIER, position: 2, isVisible: true, size: 150 },
    { universalIdentifier: 'c683026c-76a7-4169-9257-859e8cac2447', fieldMetadataUniversalIdentifier: WORK_LOG_MATTER_FIELD_UNIVERSAL_IDENTIFIER, position: 3, isVisible: true, size: 200 },
    { universalIdentifier: '2028514c-8c1e-4330-a345-1ce7653fa28a', fieldMetadataUniversalIdentifier: WORK_LOG_MINUTES_FIELD_UNIVERSAL_IDENTIFIER, position: 4, isVisible: true, size: 100 },
    { universalIdentifier: '0d4e37cd-4bf4-497e-93ae-5ed50c45690f', fieldMetadataUniversalIdentifier: WORK_LOG_IS_BILLABLE_FIELD_UNIVERSAL_IDENTIFIER, position: 5, isVisible: true, size: 100 },
    { universalIdentifier: '6d2273a7-d139-4b1b-bd65-3502c8d816a3', fieldMetadataUniversalIdentifier: WORK_LOG_BILLING_ENTITY_FIELD_UNIVERSAL_IDENTIFIER, position: 6, isVisible: true, size: 150 },
  ],
  sorts: [
    { universalIdentifier: '31275ea7-2a4b-4d3c-8ce6-0c4644bc6f79', fieldMetadataUniversalIdentifier: WORK_LOG_WORKED_ON_FIELD_UNIVERSAL_IDENTIFIER, direction: ViewSortDirection.DESC },
  ],
  filters: [
    { universalIdentifier: '14305f0c-bea9-461f-880e-dec22cb19efa', fieldMetadataUniversalIdentifier: WORK_LOG_WORKED_ON_FIELD_UNIVERSAL_IDENTIFIER, operand: ViewFilterOperand.IS_IN_PAST, value: '' },
  ],
});
