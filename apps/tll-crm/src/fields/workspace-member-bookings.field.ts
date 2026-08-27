import {
  defineField,
  FieldType,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  BOOKING_OBJECT_UNIVERSAL_IDENTIFIER,
  BOOKING_RESPONSIBLE_FIELD_UNIVERSAL_IDENTIFIER,
  WORKSPACE_MEMBER_BOOKINGS_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: WORKSPACE_MEMBER_BOOKINGS_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier,
  type: FieldType.RELATION,
  name: 'bookings',
  label: 'Bookings',
  description: 'Appointments this person is taking',
  icon: 'IconCalendarEvent',
  relationTargetObjectMetadataUniversalIdentifier: BOOKING_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: BOOKING_RESPONSIBLE_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
