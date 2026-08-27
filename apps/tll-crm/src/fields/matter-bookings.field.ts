import {
  defineField,
  FieldType,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  BOOKING_MATTER_FIELD_UNIVERSAL_IDENTIFIER,
  BOOKING_OBJECT_UNIVERSAL_IDENTIFIER,
  MATTER_BOOKINGS_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: MATTER_BOOKINGS_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: FieldType.RELATION,
  name: 'bookings',
  label: 'Bookings',
  description: 'Appointments about this matter',
  icon: 'IconCalendarEvent',
  relationTargetObjectMetadataUniversalIdentifier: BOOKING_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: BOOKING_MATTER_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
