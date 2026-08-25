import { defineObject, FieldType } from 'twenty-sdk/define';

import {
  CONTACT_IDENTITY_AVATAR_URL_FIELD_UNIVERSAL_IDENTIFIER,
  CONTACT_IDENTITY_CHANNEL_EMAIL_OPTION_ID,
  CONTACT_IDENTITY_CHANNEL_FACEBOOK_OPTION_ID,
  CONTACT_IDENTITY_CHANNEL_FIELD_UNIVERSAL_IDENTIFIER,
  CONTACT_IDENTITY_CHANNEL_INSTAGRAM_OPTION_ID,
  CONTACT_IDENTITY_CHANNEL_LINE_OPTION_ID,
  CONTACT_IDENTITY_CHANNEL_WEBCHAT_OPTION_ID,
  CONTACT_IDENTITY_CHANNEL_WHATSAPP_OPTION_ID,
  CONTACT_IDENTITY_DISPLAY_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  CONTACT_IDENTITY_EXTERNAL_ID_FIELD_UNIVERSAL_IDENTIFIER,
  CONTACT_IDENTITY_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineObject({
  universalIdentifier: CONTACT_IDENTITY_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'contactIdentity',
  namePlural: 'contactIdentities',
  labelSingular: 'Contact identity',
  labelPlural: 'Contact identities',
  description:
    'One customer handle on one channel. A person can hold several: a LINE user id, an Instagram handle, a phone number',
  icon: 'IconAddressBook',
  labelIdentifierFieldMetadataUniversalIdentifier:
    CONTACT_IDENTITY_DISPLAY_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier:
        CONTACT_IDENTITY_DISPLAY_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'displayName',
      label: 'Display name',
      description: 'The name the provider reports for this handle',
      icon: 'IconAbc',
    },
    {
      universalIdentifier: CONTACT_IDENTITY_CHANNEL_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'channel',
      label: 'Channel',
      description: 'Which messaging provider this handle belongs to',
      icon: 'IconAntenna',
      defaultValue: "'LINE'",
      options: [
        {
          id: CONTACT_IDENTITY_CHANNEL_LINE_OPTION_ID,
          value: 'LINE',
          label: 'LINE',
          position: 0,
          color: 'green',
        },
        {
          id: CONTACT_IDENTITY_CHANNEL_FACEBOOK_OPTION_ID,
          value: 'FACEBOOK',
          label: 'Facebook',
          position: 1,
          color: 'blue',
        },
        {
          id: CONTACT_IDENTITY_CHANNEL_INSTAGRAM_OPTION_ID,
          value: 'INSTAGRAM',
          label: 'Instagram',
          position: 2,
          color: 'pink',
        },
        {
          id: CONTACT_IDENTITY_CHANNEL_WHATSAPP_OPTION_ID,
          value: 'WHATSAPP',
          label: 'WhatsApp',
          position: 3,
          color: 'turquoise',
        },
        {
          id: CONTACT_IDENTITY_CHANNEL_EMAIL_OPTION_ID,
          value: 'EMAIL',
          label: 'Email',
          position: 4,
          color: 'gray',
        },
        {
          id: CONTACT_IDENTITY_CHANNEL_WEBCHAT_OPTION_ID,
          value: 'WEBCHAT',
          label: 'Web chat',
          position: 5,
          color: 'purple',
        },
      ],
    },
    {
      universalIdentifier:
        CONTACT_IDENTITY_EXTERNAL_ID_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'externalId',
      label: 'Provider handle',
      description:
        'The provider-side identifier of the customer, such as a LINE user id',
      icon: 'IconKey',
    },
    {
      universalIdentifier:
        CONTACT_IDENTITY_AVATAR_URL_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'avatarUrl',
      label: 'Avatar URL',
      description: 'Profile picture reported by the provider',
      icon: 'IconPhoto',
    },
  ],
});
