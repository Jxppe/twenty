import { defineView, ViewSortDirection, ViewType } from 'twenty-sdk/define';

import {
  ALL_CONVERSATIONS_VIEW_UNIVERSAL_IDENTIFIER,
  CONVERSATION_ASSIGNEE_FIELD_UNIVERSAL_IDENTIFIER,
  CONVERSATION_CHANNEL_FIELD_UNIVERSAL_IDENTIFIER,
  CONVERSATION_LAST_MESSAGE_AT_FIELD_UNIVERSAL_IDENTIFIER,
  CONVERSATION_LAST_MESSAGE_PREVIEW_FIELD_UNIVERSAL_IDENTIFIER,
  CONVERSATION_OBJECT_UNIVERSAL_IDENTIFIER,
  CONVERSATION_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
  CONVERSATION_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  CONVERSATION_TITLE_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineView({
  universalIdentifier: ALL_CONVERSATIONS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'All conversations',
  objectUniversalIdentifier: CONVERSATION_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconMessages',
  position: 0,
  fields: [
    {
      universalIdentifier: '0a6d5b1e-8f4b-4a1d-9a4c-2b7f5c6d9e01',
      fieldMetadataUniversalIdentifier:
        CONVERSATION_TITLE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: '0a6d5b1e-8f4b-4a1d-9a4c-2b7f5c6d9e02',
      fieldMetadataUniversalIdentifier:
        CONVERSATION_CHANNEL_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 120,
    },
    {
      universalIdentifier: '0a6d5b1e-8f4b-4a1d-9a4c-2b7f5c6d9e03',
      fieldMetadataUniversalIdentifier:
        CONVERSATION_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 120,
    },
    {
      universalIdentifier: '0a6d5b1e-8f4b-4a1d-9a4c-2b7f5c6d9e04',
      fieldMetadataUniversalIdentifier:
        CONVERSATION_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: '0a6d5b1e-8f4b-4a1d-9a4c-2b7f5c6d9e05',
      fieldMetadataUniversalIdentifier:
        CONVERSATION_ASSIGNEE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '0a6d5b1e-8f4b-4a1d-9a4c-2b7f5c6d9e06',
      fieldMetadataUniversalIdentifier:
        CONVERSATION_LAST_MESSAGE_PREVIEW_FIELD_UNIVERSAL_IDENTIFIER,
      position: 5,
      isVisible: true,
      size: 280,
    },
    {
      universalIdentifier: '0a6d5b1e-8f4b-4a1d-9a4c-2b7f5c6d9e07',
      fieldMetadataUniversalIdentifier:
        CONVERSATION_LAST_MESSAGE_AT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 6,
      isVisible: true,
      size: 160,
    },
  ],
  sorts: [
    {
      universalIdentifier: '0a6d5b1e-8f4b-4a1d-9a4c-2b7f5c6d9e08',
      fieldMetadataUniversalIdentifier:
        CONVERSATION_LAST_MESSAGE_AT_FIELD_UNIVERSAL_IDENTIFIER,
      direction: ViewSortDirection.DESC,
    },
  ],
});
