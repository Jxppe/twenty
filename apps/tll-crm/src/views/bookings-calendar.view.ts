import {
  defineView,
  ViewCalendarLayout,
  ViewFilterOperand,
  ViewType,
} from 'twenty-sdk/define';

import {
  BOOKINGS_CALENDAR_VIEW_UNIVERSAL_IDENTIFIER,
  BOOKING_OBJECT_UNIVERSAL_IDENTIFIER,
  BOOKING_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
  BOOKING_RESPONSIBLE_FIELD_UNIVERSAL_IDENTIFIER,
  BOOKING_SERVICE_FIELD_UNIVERSAL_IDENTIFIER,
  BOOKING_STARTS_AT_FIELD_UNIVERSAL_IDENTIFIER,
  BOOKING_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  BOOKING_TITLE_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

// The firm's calendar. A per-person one is this same view with a filter, which
// is why bookings did not need a hand-built calendar of any kind.
export default defineView({
  universalIdentifier: BOOKINGS_CALENDAR_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Calendar',
  objectUniversalIdentifier: BOOKING_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.CALENDAR,
  calendarLayout: ViewCalendarLayout.WEEK,
  calendarFieldMetadataUniversalIdentifier:
    BOOKING_STARTS_AT_FIELD_UNIVERSAL_IDENTIFIER,
  icon: 'IconCalendar',
  position: 0,
  fields: [
    { universalIdentifier: '165da93b-7e82-45bb-aa3d-b993fee5c1ef', fieldMetadataUniversalIdentifier: BOOKING_TITLE_FIELD_UNIVERSAL_IDENTIFIER, position: 0, isVisible: true, size: 220 },
    { universalIdentifier: '47672075-f44a-4894-99c4-cc792951bc24', fieldMetadataUniversalIdentifier: BOOKING_PERSON_FIELD_UNIVERSAL_IDENTIFIER, position: 1, isVisible: true, size: 180 },
    { universalIdentifier: '99674648-7d31-4cec-82ef-8e22e46eee33', fieldMetadataUniversalIdentifier: BOOKING_RESPONSIBLE_FIELD_UNIVERSAL_IDENTIFIER, position: 2, isVisible: true, size: 160 },
    { universalIdentifier: 'ec19d932-af74-4d9e-ae77-3767b4864b55', fieldMetadataUniversalIdentifier: BOOKING_SERVICE_FIELD_UNIVERSAL_IDENTIFIER, position: 3, isVisible: true, size: 160 },
    { universalIdentifier: '26286a31-386e-47a2-b9f6-6fc12a0572e1', fieldMetadataUniversalIdentifier: BOOKING_STATUS_FIELD_UNIVERSAL_IDENTIFIER, position: 4, isVisible: true, size: 130 },
  ],
  filters: [
    // Cancellations still clutter a calendar, so keep them out of the default.
    { universalIdentifier: 'b3cd2dc1-ff61-4db6-ad2b-b0abe080f8a3', fieldMetadataUniversalIdentifier: BOOKING_STATUS_FIELD_UNIVERSAL_IDENTIFIER, operand: ViewFilterOperand.IS_NOT, value: ['CANCELLED'] },
  ],
});
