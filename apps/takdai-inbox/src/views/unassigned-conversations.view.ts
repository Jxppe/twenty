import {
  defineView,
  ViewFilterOperand,
  ViewSortDirection,
  ViewType,
} from 'twenty-sdk/define';

import {
  CONVERSATION_ASSIGNEE_FIELD_UNIVERSAL_IDENTIFIER,
  CONVERSATION_CHANNEL_FIELD_UNIVERSAL_IDENTIFIER,
  CONVERSATION_LAST_MESSAGE_AT_FIELD_UNIVERSAL_IDENTIFIER,
  CONVERSATION_LAST_MESSAGE_PREVIEW_FIELD_UNIVERSAL_IDENTIFIER,
  CONVERSATION_OBJECT_UNIVERSAL_IDENTIFIER,
  CONVERSATION_TITLE_FIELD_UNIVERSAL_IDENTIFIER,
  UNASSIGNED_CONVERSATIONS_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineView({
  universalIdentifier: UNASSIGNED_CONVERSATIONS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Unassigned',
  objectUniversalIdentifier: CONVERSATION_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconInbox',
  position: 1,
  fields: [
    {
      universalIdentifier: '1b7e6c2f-9a5c-4b2e-8b5d-3c8f6d7e0f01',
      fieldMetadataUniversalIdentifier:
        CONVERSATION_TITLE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '1b7e6c2f-9a5c-4b2e-8b5d-3c8f6d7e0f02',
      fieldMetadataUniversalIdentifier:
        CONVERSATION_CHANNEL_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 120,
    },
    {
      universalIdentifier: '1b7e6c2f-9a5c-4b2e-8b5d-3c8f6d7e0f03',
      fieldMetadataUniversalIdentifier:
        CONVERSATION_LAST_MESSAGE_PREVIEW_FIELD_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 320,
    },
    {
      universalIdentifier: '1b7e6c2f-9a5c-4b2e-8b5d-3c8f6d7e0f04',
      fieldMetadataUniversalIdentifier:
        CONVERSATION_LAST_MESSAGE_AT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 160,
    },
  ],
  filters: [
    {
      universalIdentifier: '1b7e6c2f-9a5c-4b2e-8b5d-3c8f6d7e0f05',
      fieldMetadataUniversalIdentifier:
        CONVERSATION_ASSIGNEE_FIELD_UNIVERSAL_IDENTIFIER,
      operand: ViewFilterOperand.IS_EMPTY,
      value: '',
    },
  ],
  sorts: [
    {
      universalIdentifier: '1b7e6c2f-9a5c-4b2e-8b5d-3c8f6d7e0f06',
      fieldMetadataUniversalIdentifier:
        CONVERSATION_LAST_MESSAGE_AT_FIELD_UNIVERSAL_IDENTIFIER,
      direction: ViewSortDirection.DESC,
    },
  ],
});
