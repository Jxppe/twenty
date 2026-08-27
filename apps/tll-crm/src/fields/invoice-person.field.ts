import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  INVOICE_OBJECT_UNIVERSAL_IDENTIFIER,
  INVOICE_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
  PERSON_INVOICES_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: INVOICE_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: INVOICE_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'person',
  label: 'Client',
  description: 'Who is being billed',
  icon: 'IconUser',
  relationTargetObjectMetadataUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier: PERSON_INVOICES_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'personId',
  },
});
