import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  BOOKING_OBJECT_UNIVERSAL_IDENTIFIER,
  BOOKING_RESPONSIBLE_FIELD_UNIVERSAL_IDENTIFIER,
  WORKSPACE_MEMBER_BOOKINGS_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: BOOKING_RESPONSIBLE_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: BOOKING_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'responsible',
  label: 'Staff',
  description: 'Who is taking this appointment',
  icon: 'IconUserCheck',
  relationTargetObjectMetadataUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier: WORKSPACE_MEMBER_BOOKINGS_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'responsibleId',
  },
});
