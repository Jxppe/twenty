import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
} from 'twenty-sdk/define';

import {
  BILLING_ENTITY_BOOKINGS_FIELD_UNIVERSAL_IDENTIFIER,
  BILLING_ENTITY_OBJECT_UNIVERSAL_IDENTIFIER,
  BOOKING_BILLING_ENTITY_FIELD_UNIVERSAL_IDENTIFIER,
  BOOKING_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: BOOKING_BILLING_ENTITY_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: BOOKING_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'billingEntity',
  label: 'Billing entity',
  description: 'Which company is taking the appointment',
  icon: 'IconBuildingBank',
  relationTargetObjectMetadataUniversalIdentifier: BILLING_ENTITY_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: BILLING_ENTITY_BOOKINGS_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'billingEntityId',
  },
});
