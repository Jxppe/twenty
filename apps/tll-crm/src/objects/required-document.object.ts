import { defineObject, FieldType } from 'twenty-sdk/define';

import {
  DOCUMENT_STATUS_RECEIVED_OPTION_ID,
  DOCUMENT_STATUS_REJECTED_OPTION_ID,
  DOCUMENT_STATUS_REQUESTED_OPTION_ID,
  DOCUMENT_STATUS_VERIFIED_OPTION_ID,
  REQUIRED_DOCUMENT_FILE_FIELD_UNIVERSAL_IDENTIFIER,
  REQUIRED_DOCUMENT_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  REQUIRED_DOCUMENT_NOTES_FIELD_UNIVERSAL_IDENTIFIER,
  REQUIRED_DOCUMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  REQUIRED_DOCUMENT_RECEIVED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  REQUIRED_DOCUMENT_REQUESTED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  REQUIRED_DOCUMENT_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

// Usually the honest answer to "why is this matter stuck".
export default defineObject({
  universalIdentifier: REQUIRED_DOCUMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'requiredDocument',
  namePlural: 'requiredDocuments',
  labelSingular: 'Required document',
  labelPlural: 'Required documents',
  description: 'Something the client has to give us before the work can move',
  icon: 'IconFileDescription',
  labelIdentifierFieldMetadataUniversalIdentifier:
    REQUIRED_DOCUMENT_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: REQUIRED_DOCUMENT_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'name',
      label: 'Document',
      icon: 'IconAbc',
    },
    {
      universalIdentifier: REQUIRED_DOCUMENT_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'status',
      label: 'Status',
      icon: 'IconProgressCheck',
      defaultValue: "'REQUESTED'",
      options: [
        {
          id: DOCUMENT_STATUS_REQUESTED_OPTION_ID,
          value: 'REQUESTED',
          label: 'Requested',
          position: 0,
          color: 'orange',
        },
        {
          id: DOCUMENT_STATUS_RECEIVED_OPTION_ID,
          value: 'RECEIVED',
          label: 'Received',
          position: 1,
          color: 'blue',
        },
        {
          id: DOCUMENT_STATUS_VERIFIED_OPTION_ID,
          value: 'VERIFIED',
          label: 'Verified',
          position: 2,
          color: 'green',
        },
        {
          id: DOCUMENT_STATUS_REJECTED_OPTION_ID,
          value: 'REJECTED',
          label: 'Rejected',
          position: 3,
          color: 'red',
        },
      ],
    },
    {
      universalIdentifier:
        REQUIRED_DOCUMENT_REQUESTED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.DATE_TIME,
      name: 'requestedAt',
      label: 'Requested',
      icon: 'IconSend',
    },
    {
      universalIdentifier:
        REQUIRED_DOCUMENT_RECEIVED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.DATE_TIME,
      name: 'receivedAt',
      label: 'Received',
      icon: 'IconInbox',
    },
    {
      universalIdentifier: REQUIRED_DOCUMENT_FILE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.FILES,
      name: 'file',
      label: 'File',
      icon: 'IconPaperclip',
    },
    {
      universalIdentifier: REQUIRED_DOCUMENT_NOTES_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'notes',
      label: 'Notes',
      icon: 'IconNote',
    },
  ],
});
