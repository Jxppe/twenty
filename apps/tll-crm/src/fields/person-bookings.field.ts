import {
  defineField,
  FieldType,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  BOOKING_OBJECT_UNIVERSAL_IDENTIFIER,
  BOOKING_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
  PERSON_BOOKINGS_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: PERSON_BOOKINGS_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.RELATION,
  name: 'bookings',
  label: 'Bookings',
  description: 'Appointments with this client',
  icon: 'IconCalendarEvent',
  relationTargetObjectMetadataUniversalIdentifier: BOOKING_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: BOOKING_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
