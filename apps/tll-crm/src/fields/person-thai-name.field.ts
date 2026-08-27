import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { PERSON_THAI_NAME_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

// Beside Twenty's name rather than instead of it. A Thai passport carries both
// spellings, the visa file wants the Latin one and the land office wants the
// Thai one, and romanisation is lossy in both directions.
export default defineField({
  universalIdentifier: PERSON_THAI_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.FULL_NAME,
  name: 'nameTh',
  label: 'Name (TH)',
  description: 'As written in Thai, when the client has a Thai name',
  icon: 'IconLanguage',
});
