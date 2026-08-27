import { defineView, ViewCalendarLayout, ViewType } from 'twenty-sdk/define';

import {
  WORK_CALENDAR_VIEW_UNIVERSAL_IDENTIFIER,
  WORK_LOG_DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER,
  WORK_LOG_MATTER_FIELD_UNIVERSAL_IDENTIFIER,
  WORK_LOG_MINUTES_FIELD_UNIVERSAL_IDENTIFIER,
  WORK_LOG_OBJECT_UNIVERSAL_IDENTIFIER,
  WORK_LOG_STAFF_FIELD_UNIVERSAL_IDENTIFIER,
  WORK_LOG_WORKED_ON_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

// Where the gaps show. A week with three logged days and two blank ones is the
// signal the daily report has already started slipping.
export default defineView({
  universalIdentifier: WORK_CALENDAR_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'By day',
  objectUniversalIdentifier: WORK_LOG_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.CALENDAR,
  calendarLayout: ViewCalendarLayout.WEEK,
  calendarFieldMetadataUniversalIdentifier:
    WORK_LOG_WORKED_ON_FIELD_UNIVERSAL_IDENTIFIER,
  icon: 'IconCalendar',
  position: 1,
  fields: [
    { universalIdentifier: '628ab6fe-98ce-4e4d-8101-07fdab9f1aa2', fieldMetadataUniversalIdentifier: WORK_LOG_DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER, position: 0, isVisible: true, size: 260 },
    { universalIdentifier: 'e83ee08d-2021-4796-b03a-37643ef31ed6', fieldMetadataUniversalIdentifier: WORK_LOG_STAFF_FIELD_UNIVERSAL_IDENTIFIER, position: 1, isVisible: true, size: 150 },
    { universalIdentifier: '60c544a1-ae38-49c2-9fa1-36d9c5b640fb', fieldMetadataUniversalIdentifier: WORK_LOG_MATTER_FIELD_UNIVERSAL_IDENTIFIER, position: 2, isVisible: true, size: 200 },
    { universalIdentifier: '50ea478c-3d9d-4eca-905b-f43a42c29944', fieldMetadataUniversalIdentifier: WORK_LOG_MINUTES_FIELD_UNIVERSAL_IDENTIFIER, position: 3, isVisible: true, size: 100 },
  ],
});
