import {
  defineField,
  FieldType,
  RelationType,
} from 'twenty-sdk/define';

import {
  BILLING_ENTITY_BOOKINGS_FIELD_UNIVERSAL_IDENTIFIER,
  BILLING_ENTITY_OBJECT_UNIVERSAL_IDENTIFIER,
  BOOKING_BILLING_ENTITY_FIELD_UNIVERSAL_IDENTIFIER,
  BOOKING_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: BILLING_ENTITY_BOOKINGS_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: BILLING_ENTITY_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'bookings',
  label: 'Bookings',
  description: 'Appointments taken by this entity',
  icon: 'IconCalendarEvent',
  relationTargetObjectMetadataUniversalIdentifier: BOOKING_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: BOOKING_BILLING_ENTITY_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
