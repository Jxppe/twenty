import { type BadgeColor } from 'src/ui/Badge';

export const CHANNELS = [
  'LINE',
  'FACEBOOK',
  'INSTAGRAM',
  'WHATSAPP',
  'EMAIL',
  'WEBCHAT',
] as const;

export type Channel = (typeof CHANNELS)[number];

export const CHANNEL_LABELS: Record<Channel, string> = {
  LINE: 'LINE',
  FACEBOOK: 'Facebook',
  INSTAGRAM: 'Instagram',
  WHATSAPP: 'WhatsApp',
  EMAIL: 'Email',
  WEBCHAT: 'Web chat',
};

export const CHANNEL_COLORS: Record<Channel, BadgeColor> = {
  LINE: 'green',
  FACEBOOK: 'blue',
  INSTAGRAM: 'pink',
  WHATSAPP: 'turquoise',
  EMAIL: 'gray',
  WEBCHAT: 'purple',
};
