import {
  defineField,
  FieldType,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  MATTER_DEADLINE_MATTER_FIELD_UNIVERSAL_IDENTIFIER,
  MATTER_DEADLINE_OBJECT_UNIVERSAL_IDENTIFIER,
  MATTER_MATTER_DEADLINES_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: MATTER_MATTER_DEADLINES_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: FieldType.RELATION,
  name: 'matterDeadlines',
  label: 'Deadlines',
  description: 'Dates this matter has to hit',
  icon: 'IconAlarm',
  relationTargetObjectMetadataUniversalIdentifier: MATTER_DEADLINE_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: MATTER_DEADLINE_MATTER_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
