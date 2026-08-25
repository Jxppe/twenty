import { defineObject, FieldType } from 'twenty-sdk/define';

import {
  MESSAGE_BODY_FIELD_UNIVERSAL_IDENTIFIER,
  MESSAGE_DIRECTION_FIELD_UNIVERSAL_IDENTIFIER,
  MESSAGE_DIRECTION_INBOUND_OPTION_ID,
  MESSAGE_DIRECTION_INTERNAL_OPTION_ID,
  MESSAGE_DIRECTION_OUTBOUND_OPTION_ID,
  MESSAGE_EXTERNAL_ID_FIELD_UNIVERSAL_IDENTIFIER,
  MESSAGE_OBJECT_UNIVERSAL_IDENTIFIER,
  MESSAGE_SENDER_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  MESSAGE_SENT_AT_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineObject({
  universalIdentifier: MESSAGE_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'inboxMessage',
  namePlural: 'inboxMessages',
  labelSingular: 'Inbox message',
  labelPlural: 'Inbox messages',
  description: 'A single message inside a conversation',
  icon: 'IconMessage',
  isSearchable: true,
  labelIdentifierFieldMetadataUniversalIdentifier:
    MESSAGE_BODY_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: MESSAGE_BODY_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'body',
      label: 'Body',
      description: 'Text content of the message',
      icon: 'IconAbc',
    },
    {
      universalIdentifier: MESSAGE_DIRECTION_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'direction',
      label: 'Direction',
      description:
        'Whether the customer sent it, an agent sent it, or it is an internal note',
      icon: 'IconArrowsExchange',
      defaultValue: "'INBOUND'",
      options: [
        {
          id: MESSAGE_DIRECTION_INBOUND_OPTION_ID,
          value: 'INBOUND',
          label: 'Inbound',
          position: 0,
          color: 'blue',
        },
        {
          id: MESSAGE_DIRECTION_OUTBOUND_OPTION_ID,
          value: 'OUTBOUND',
          label: 'Outbound',
          position: 1,
          color: 'green',
        },
        {
          id: MESSAGE_DIRECTION_INTERNAL_OPTION_ID,
          value: 'INTERNAL',
          label: 'Internal note',
          position: 2,
          color: 'yellow',
        },
      ],
    },
    {
      universalIdentifier: MESSAGE_SENT_AT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.DATE_TIME,
      name: 'sentAt',
      label: 'Sent at',
      description: 'When the provider reports the message was sent',
      icon: 'IconClock',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: MESSAGE_SENDER_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'senderName',
      label: 'Sender',
      description: 'Display name of whoever sent the message',
      icon: 'IconUser',
    },
    {
      universalIdentifier: MESSAGE_EXTERNAL_ID_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'externalId',
      label: 'Provider message ID',
      description:
        'Provider-side message identifier, used to deduplicate redelivered webhooks',
      icon: 'IconKey',
    },
  ],
});
