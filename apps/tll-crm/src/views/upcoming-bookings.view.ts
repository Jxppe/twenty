import { defineView, ViewFilterOperand, ViewSortDirection, ViewType } from 'twenty-sdk/define';

import {
  BOOKING_LOCATION_FIELD_UNIVERSAL_IDENTIFIER,
  BOOKING_OBJECT_UNIVERSAL_IDENTIFIER,
  BOOKING_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
  BOOKING_RESPONSIBLE_FIELD_UNIVERSAL_IDENTIFIER,
  BOOKING_STARTS_AT_FIELD_UNIVERSAL_IDENTIFIER,
  BOOKING_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  BOOKING_TITLE_FIELD_UNIVERSAL_IDENTIFIER,
  UPCOMING_BOOKINGS_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

// The label identifier field must sit at position 0 in every view, so the
// booking title leads even though the time is what you scan for.
export default defineView({
  universalIdentifier: UPCOMING_BOOKINGS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Upcoming',
  objectUniversalIdentifier: BOOKING_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconCalendarEvent',
  position: 1,
  fields: [
    { universalIdentifier: '5c532251-a941-49ff-8ad2-cef622078c2b', fieldMetadataUniversalIdentifier: BOOKING_STARTS_AT_FIELD_UNIVERSAL_IDENTIFIER, position: 1, isVisible: true, size: 170 },
    { universalIdentifier: 'ba46a8dd-16ff-4fc0-9574-c1868b7aa360', fieldMetadataUniversalIdentifier: BOOKING_TITLE_FIELD_UNIVERSAL_IDENTIFIER, position: 0, isVisible: true, size: 200 },
    { universalIdentifier: 'e19f291f-6ce4-4cb7-af5b-b946e191ecdb', fieldMetadataUniversalIdentifier: BOOKING_PERSON_FIELD_UNIVERSAL_IDENTIFIER, position: 2, isVisible: true, size: 180 },
    { universalIdentifier: '19a92d08-f26a-4ff0-9eaf-f8c08e249963', fieldMetadataUniversalIdentifier: BOOKING_RESPONSIBLE_FIELD_UNIVERSAL_IDENTIFIER, position: 3, isVisible: true, size: 160 },
    { universalIdentifier: '99503326-b71e-4aea-8050-68786dad0fd4', fieldMetadataUniversalIdentifier: BOOKING_LOCATION_FIELD_UNIVERSAL_IDENTIFIER, position: 4, isVisible: true, size: 130 },
    { universalIdentifier: '5cb06297-ddc1-4e7c-a8d7-f1b8bc5ad480', fieldMetadataUniversalIdentifier: BOOKING_STATUS_FIELD_UNIVERSAL_IDENTIFIER, position: 5, isVisible: true, size: 130 },
  ],
  sorts: [
    { universalIdentifier: 'cdfb9f19-872c-48df-b402-60d02f43b2b1', fieldMetadataUniversalIdentifier: BOOKING_STARTS_AT_FIELD_UNIVERSAL_IDENTIFIER, direction: ViewSortDirection.ASC },
  ],
  filters: [
    { universalIdentifier: '0a41b16e-72be-4d70-9c97-ac48d333d4c8', fieldMetadataUniversalIdentifier: BOOKING_STARTS_AT_FIELD_UNIVERSAL_IDENTIFIER, operand: ViewFilterOperand.IS_IN_FUTURE, value: '' },
  ],
});
