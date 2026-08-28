import { defineObject, FieldType } from 'twenty-sdk/define';

import {
  WORK_LOG_DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER,
  WORK_LOG_IS_BILLABLE_FIELD_UNIVERSAL_IDENTIFIER,
  WORK_LOG_MINUTES_FIELD_UNIVERSAL_IDENTIFIER,
  WORK_LOG_NOTES_FIELD_UNIVERSAL_IDENTIFIER,
  WORK_LOG_STATUS_CANCELLED_OPTION_ID,
  WORK_LOG_STATUS_DONE_OPTION_ID,
  WORK_LOG_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  WORK_LOG_STATUS_IN_PROGRESS_OPTION_ID,
  WORK_LOG_STATUS_NOT_STARTED_OPTION_ID,
  WORK_LOG_STATUS_POSTPONED_OPTION_ID,
  WORK_LOG_OBJECT_UNIVERSAL_IDENTIFIER,
  WORK_LOG_WORKED_ON_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

// Scoped to client-facing work against a job, which is the narrow half of O1 in
// docs/JOBS.md. Leave and attendance stay in TLLACC until that is decided.
export default defineObject({
  universalIdentifier: WORK_LOG_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'workLog',
  namePlural: 'workLogs',
  labelSingular: 'Work log',
  labelPlural: 'Work logs',
  description: 'What a member of staff did, for whom, and how long it took',
  icon: 'IconClockEdit',
  labelIdentifierFieldMetadataUniversalIdentifier:
    WORK_LOG_DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: WORK_LOG_DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'description',
      label: 'Work',
      description: 'One line, as it should read in a week to someone who was not there',
      icon: 'IconAbc',
    },
    {
      universalIdentifier: WORK_LOG_WORKED_ON_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.DATE,
      name: 'workedOn',
      label: 'Date',
      description: 'The day the work happened, not the day it was logged',
      icon: 'IconCalendar',
    },
    {
      universalIdentifier: WORK_LOG_MINUTES_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.NUMBER,
      name: 'minutes',
      label: 'Minutes',
      description: 'Minutes rather than hours: nobody rounds 20 minutes up to 0.5',
      icon: 'IconHourglass',
    },
    {
      universalIdentifier: WORK_LOG_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'status',
      label: 'Status',
      description: 'Where this piece of work got to',
      icon: 'IconProgressCheck',
      // สถานะ. Their sheet is mostly กำลังดำเนินการ, because a line usually
      // describes a push at something still running rather than a finish.
      defaultValue: "'IN_PROGRESS'",
      options: [
        {
          id: WORK_LOG_STATUS_NOT_STARTED_OPTION_ID,
          value: 'NOT_STARTED',
          label: 'Not started',
          position: 0,
          color: 'blue',
        },
        {
          id: WORK_LOG_STATUS_IN_PROGRESS_OPTION_ID,
          value: 'IN_PROGRESS',
          label: 'In progress',
          position: 1,
          color: 'yellow',
        },
        {
          id: WORK_LOG_STATUS_DONE_OPTION_ID,
          value: 'DONE',
          label: 'Done',
          position: 2,
          color: 'green',
        },
        {
          id: WORK_LOG_STATUS_POSTPONED_OPTION_ID,
          value: 'POSTPONED',
          label: 'Postponed',
          position: 3,
          color: 'orange',
        },
        {
          id: WORK_LOG_STATUS_CANCELLED_OPTION_ID,
          value: 'CANCELLED',
          label: 'Cancelled',
          position: 4,
          color: 'red',
        },
      ],
    },
    {
      universalIdentifier: WORK_LOG_NOTES_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'notes',
      label: 'Notes',
      // Not a longer description. It is what someone else needs to know:
      // waiting on the lawyer, the client has not replied, sent for checking.
      description: 'Where it stands, for whoever reads this next',
      icon: 'IconNotes',
    },
    {
      universalIdentifier: WORK_LOG_IS_BILLABLE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.BOOLEAN,
      name: 'isBillable',
      label: 'Billable',
      icon: 'IconCoin',
      defaultValue: true,
    },
  ],
});
