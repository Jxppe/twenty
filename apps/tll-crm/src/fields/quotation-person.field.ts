import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  PERSON_QUOTATIONS_FIELD_UNIVERSAL_IDENTIFIER,
  QUOTATION_OBJECT_UNIVERSAL_IDENTIFIER,
  QUOTATION_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: QUOTATION_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: QUOTATION_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'person',
  label: 'Client',
  description: 'Who it was quoted to',
  icon: 'IconUser',
  relationTargetObjectMetadataUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier: PERSON_QUOTATIONS_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'personId',
  },
});
