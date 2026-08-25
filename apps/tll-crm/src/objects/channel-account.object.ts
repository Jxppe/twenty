import { defineObject, FieldType } from 'twenty-sdk/define';

import {
  CHANNEL_ACCOUNT_CHANNEL_EMAIL_OPTION_ID,
  CHANNEL_ACCOUNT_CHANNEL_FACEBOOK_OPTION_ID,
  CHANNEL_ACCOUNT_CHANNEL_FIELD_UNIVERSAL_IDENTIFIER,
  CHANNEL_ACCOUNT_CHANNEL_INSTAGRAM_OPTION_ID,
  CHANNEL_ACCOUNT_CHANNEL_LINE_OPTION_ID,
  CHANNEL_ACCOUNT_CHANNEL_WEBCHAT_OPTION_ID,
  CHANNEL_ACCOUNT_CHANNEL_WHATSAPP_OPTION_ID,
  CHANNEL_ACCOUNT_EXTERNAL_ID_FIELD_UNIVERSAL_IDENTIFIER,
  CHANNEL_ACCOUNT_IS_ACTIVE_FIELD_UNIVERSAL_IDENTIFIER,
  CHANNEL_ACCOUNT_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  CHANNEL_ACCOUNT_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineObject({
  universalIdentifier: CHANNEL_ACCOUNT_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'channelAccount',
  namePlural: 'channelAccounts',
  labelSingular: 'Channel account',
  labelPlural: 'Channel accounts',
  description:
    'A connected messaging account, such as one LINE Official Account or one Facebook Page',
  icon: 'IconPlug',
  labelIdentifierFieldMetadataUniversalIdentifier:
    CHANNEL_ACCOUNT_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: CHANNEL_ACCOUNT_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'name',
      label: 'Name',
      description: 'Human-readable name of the connected account',
      icon: 'IconAbc',
    },
    {
      universalIdentifier: CHANNEL_ACCOUNT_CHANNEL_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'channel',
      label: 'Channel',
      description: 'Which messaging provider this account belongs to',
      icon: 'IconAntenna',
      defaultValue: "'LINE'",
      options: [
        {
          id: CHANNEL_ACCOUNT_CHANNEL_LINE_OPTION_ID,
          value: 'LINE',
          label: 'LINE',
          position: 0,
          color: 'green',
        },
        {
          id: CHANNEL_ACCOUNT_CHANNEL_FACEBOOK_OPTION_ID,
          value: 'FACEBOOK',
          label: 'Facebook',
          position: 1,
          color: 'blue',
        },
        {
          id: CHANNEL_ACCOUNT_CHANNEL_INSTAGRAM_OPTION_ID,
          value: 'INSTAGRAM',
          label: 'Instagram',
          position: 2,
          color: 'pink',
        },
        {
          id: CHANNEL_ACCOUNT_CHANNEL_WHATSAPP_OPTION_ID,
          value: 'WHATSAPP',
          label: 'WhatsApp',
          position: 3,
          color: 'turquoise',
        },
        {
          id: CHANNEL_ACCOUNT_CHANNEL_EMAIL_OPTION_ID,
          value: 'EMAIL',
          label: 'Email',
          position: 4,
          color: 'gray',
        },
        {
          id: CHANNEL_ACCOUNT_CHANNEL_WEBCHAT_OPTION_ID,
          value: 'WEBCHAT',
          label: 'Web chat',
          position: 5,
          color: 'purple',
        },
      ],
    },
    {
      universalIdentifier:
        CHANNEL_ACCOUNT_EXTERNAL_ID_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'externalId',
      label: 'Provider account ID',
      // LINE sends this as `destination` on every webhook event; it is how a
      // shared webhook URL is routed to the right workspace.
      description:
        'The provider-side identifier of this account (LINE destination, Meta page id)',
      icon: 'IconKey',
    },
    {
      universalIdentifier: CHANNEL_ACCOUNT_IS_ACTIVE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.BOOLEAN,
      name: 'isActive',
      label: 'Active',
      description: 'Whether this account currently receives and sends messages',
      icon: 'IconToggleLeft',
      defaultValue: true,
    },
  ],
});
