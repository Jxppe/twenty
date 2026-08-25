import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { SEED_DEMO_DATA_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

type SeedConversation = {
  title: string;
  channel: string;
  handle: string;
  messages: { body: string; direction: 'INBOUND' | 'OUTBOUND' }[];
};

const SEED: SeedConversation[] = [
  {
    title: 'Somchai Prasert',
    channel: 'LINE',
    handle: 'U4af4980629',
    messages: [
      { body: 'Hello, I would like some information about a visa.', direction: 'INBOUND' },
      { body: 'Of course. Which visa type are you looking at?', direction: 'OUTBOUND' },
      { body: 'Retirement visa, for my father.', direction: 'INBOUND' },
    ],
  },
  {
    title: 'Jane Doe',
    channel: 'FACEBOOK',
    handle: 'fb-8812390',
    messages: [
      { body: 'Do you handle company registration?', direction: 'INBOUND' },
      { body: 'Yes we do. Are you registering a Thai limited company?', direction: 'OUTBOUND' },
    ],
  },
  {
    title: 'Niran Chaiyaporn',
    channel: 'WEBCHAT',
    handle: 'web-4471',
    messages: [
      { body: 'How much for a property title transfer?', direction: 'INBOUND' },
    ],
  },
];

// Called from the Inbox empty state so a fresh workspace has something to look
// at without hand-entering records.
const handler = async (): Promise<{ created: number }> => {
  const client = new CoreApiClient();
  const now = Date.now();
  let created = 0;

  for (const [conversationIndex, seed] of SEED.entries()) {
    const identityResult = (await client.mutation({
      createContactIdentity: {
        __args: {
          data: {
            displayName: seed.title,
            channel: seed.channel,
            externalId: seed.handle,
          },
        },
        id: true,
      },
    })) as { createContactIdentity?: { id?: string } };

    const contactIdentityId = identityResult.createContactIdentity?.id;

    const lastMessage = seed.messages[seed.messages.length - 1];
    const lastMessageAt = new Date(
      now - conversationIndex * 3_600_000,
    ).toISOString();

    const conversationResult = (await client.mutation({
      createConversation: {
        __args: {
          data: {
            title: seed.title,
            channel: seed.channel,
            status: 'OPEN',
            lastMessageAt,
            lastMessagePreview: lastMessage.body.slice(0, 120),
            unreadCount: lastMessage.direction === 'INBOUND' ? 1 : 0,
            externalId: `${seed.channel}-${seed.handle}`,
            ...(contactIdentityId !== undefined ? { contactIdentityId } : {}),
          },
        },
        id: true,
      },
    })) as { createConversation?: { id?: string } };

    const conversationId = conversationResult.createConversation?.id;

    if (conversationId === undefined) {
      continue;
    }

    created += 1;

    for (const [messageIndex, message] of seed.messages.entries()) {
      await client.mutation({
        createInboxMessage: {
          __args: {
            data: {
              conversationId,
              body: message.body,
              direction: message.direction,
              senderName:
                message.direction === 'INBOUND' ? seed.title : 'Agent',
              sentAt: new Date(
                now - conversationIndex * 3_600_000 - (seed.messages.length - messageIndex) * 60_000,
              ).toISOString(),
            },
          },
          id: true,
        },
      });
    }
  }

  return { created };
};

export default defineLogicFunction({
  universalIdentifier: SEED_DEMO_DATA_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'seed-demo-data',
  description: 'Creates a few demo conversations so the Inbox has content',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: {
    path: '/inbox/seed-demo-data',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
