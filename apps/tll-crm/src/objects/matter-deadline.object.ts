import { defineObject, FieldType } from 'twenty-sdk/define';

import {
  DEADLINE_TYPE_CLIENT_OPTION_ID,
  DEADLINE_TYPE_COURT_OPTION_ID,
  DEADLINE_TYPE_INTERNAL_OPTION_ID,
  DEADLINE_TYPE_STATUTORY_OPTION_ID,
  MATTER_DEADLINE_COMPLETED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  MATTER_DEADLINE_DUE_AT_FIELD_UNIVERSAL_IDENTIFIER,
  MATTER_DEADLINE_IS_CRITICAL_FIELD_UNIVERSAL_IDENTIFIER,
  MATTER_DEADLINE_NOTES_FIELD_UNIVERSAL_IDENTIFIER,
  MATTER_DEADLINE_OBJECT_UNIVERSAL_IDENTIFIER,
  MATTER_DEADLINE_TITLE_FIELD_UNIVERSAL_IDENTIFIER,
  MATTER_DEADLINE_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

// A missed statutory date is the thing that actually damages a law firm, and it
// is exactly what a sales pipeline has no concept of.
export default defineObject({
  universalIdentifier: MATTER_DEADLINE_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'matterDeadline',
  namePlural: 'matterDeadlines',
  labelSingular: 'Deadline',
  labelPlural: 'Deadlines',
  description: 'A date a matter has to hit, and who is answerable for it',
  icon: 'IconAlarm',
  labelIdentifierFieldMetadataUniversalIdentifier:
    MATTER_DEADLINE_TITLE_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: MATTER_DEADLINE_TITLE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'title',
      label: 'Deadline',
      description: 'What is due, in the words someone would use out loud',
      icon: 'IconAbc',
    },
    {
      universalIdentifier: MATTER_DEADLINE_DUE_AT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.DATE_TIME,
      name: 'dueAt',
      label: 'Due',
      icon: 'IconCalendarDue',
    },
    {
      universalIdentifier: MATTER_DEADLINE_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'type',
      label: 'Type',
      description: 'Where the obligation comes from',
      icon: 'IconCategory',
      defaultValue: "'INTERNAL'",
      options: [
        {
          id: DEADLINE_TYPE_STATUTORY_OPTION_ID,
          value: 'STATUTORY',
          label: 'Statutory',
          position: 0,
          color: 'red',
        },
        {
          id: DEADLINE_TYPE_COURT_OPTION_ID,
          value: 'COURT',
          label: 'Court',
          position: 1,
          color: 'orange',
        },
        {
          id: DEADLINE_TYPE_CLIENT_OPTION_ID,
          value: 'CLIENT_COMMITTED',
          label: 'Committed to client',
          position: 2,
          color: 'blue',
        },
        {
          id: DEADLINE_TYPE_INTERNAL_OPTION_ID,
          value: 'INTERNAL',
          label: 'Internal',
          position: 3,
          color: 'gray',
        },
      ],
    },
    {
      universalIdentifier:
        MATTER_DEADLINE_IS_CRITICAL_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.BOOLEAN,
      name: 'isCritical',
      label: 'Critical',
      description: 'Missing this one has consequences that cannot be undone',
      icon: 'IconAlertTriangle',
      defaultValue: false,
    },
    {
      universalIdentifier:
        MATTER_DEADLINE_COMPLETED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.DATE_TIME,
      name: 'completedAt',
      label: 'Completed',
      description: 'Empty means still outstanding',
      icon: 'IconCheck',
    },
    {
      universalIdentifier: MATTER_DEADLINE_NOTES_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'notes',
      label: 'Notes',
      icon: 'IconNote',
    },
  ],
});
