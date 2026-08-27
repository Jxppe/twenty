import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { COMPANY_THAI_NAME_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

// A Thai limited company has one registered name in Thai and usually one in
// English, and the Thai one is what appears on the DBD record.
export default defineField({
  universalIdentifier: COMPANY_THAI_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  type: FieldType.TEXT,
  name: 'nameTh',
  label: 'Name (TH)',
  description: 'The registered Thai name, as it appears on the DBD record',
  icon: 'IconLanguage',
});
