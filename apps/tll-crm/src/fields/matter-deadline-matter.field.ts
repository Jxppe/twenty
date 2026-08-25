import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  MATTER_DEADLINE_MATTER_FIELD_UNIVERSAL_IDENTIFIER,
  MATTER_DEADLINE_OBJECT_UNIVERSAL_IDENTIFIER,
  MATTER_MATTER_DEADLINES_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: MATTER_DEADLINE_MATTER_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: MATTER_DEADLINE_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'matter',
  label: 'Matter',
  description: 'The matter this deadline belongs to',
  icon: 'IconBriefcase',
  relationTargetObjectMetadataUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier: MATTER_MATTER_DEADLINES_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.CASCADE,
    joinColumnName: 'matterId',
  },
});
