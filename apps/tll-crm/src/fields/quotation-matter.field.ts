import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  MATTER_QUOTATIONS_FIELD_UNIVERSAL_IDENTIFIER,
  QUOTATION_MATTER_FIELD_UNIVERSAL_IDENTIFIER,
  QUOTATION_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: QUOTATION_MATTER_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: QUOTATION_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'matter',
  label: 'Job',
  description: 'The job this quotes for',
  icon: 'IconBriefcase',
  relationTargetObjectMetadataUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier: MATTER_QUOTATIONS_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'matterId',
  },
});
