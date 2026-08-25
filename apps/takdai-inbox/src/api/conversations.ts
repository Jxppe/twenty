import { RestApiClient } from 'twenty-client-sdk/rest';

import { type Channel } from 'src/constants/channels';

export type ConversationRecord = {
  id: string;
  title: string | null;
  channel: Channel | null;
  status: 'OPEN' | 'PENDING' | 'CLOSED' | null;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  unreadCount: number | null;
  person?: {
    id: string;
    name?: { firstName?: string | null; lastName?: string | null } | null;
    company?: { id: string; name?: string | null } | null;
  } | null;
  assignee?: { id: string; name?: { firstName?: string | null } | null } | null;
  contactIdentity?: {
    id: string;
    displayName?: string | null;
    channel?: Channel | null;
  } | null;
};

export type InboxMessageRecord = {
  id: string;
  body: string | null;
  direction: 'INBOUND' | 'OUTBOUND' | 'INTERNAL' | null;
  sentAt: string | null;
  senderName: string | null;
};

type ListResponse<TKey extends string, TRecord> = {
  data: Record<TKey, TRecord[]>;
  totalCount?: number;
};

const client = new RestApiClient();

export const fetchConversations = async ({
  channel,
  limit = 200,
}: {
  channel?: Channel;
  limit?: number;
}): Promise<ConversationRecord[]> => {
  const response = await client.get<
    ListResponse<'conversations', ConversationRecord>
  >('/rest/conversations', {
    query: {
      limit,
      depth: 1,
      order_by: 'lastMessageAt[DescNullsLast]',
      ...(channel !== undefined ? { filter: `channel[eq]:${channel}` } : {}),
    },
  });

  return response.data?.conversations ?? [];
};

export const fetchMessages = async (
  conversationId: string,
): Promise<InboxMessageRecord[]> => {
  const response = await client.get<
    ListResponse<'inboxMessages', InboxMessageRecord>
  >('/rest/inboxMessages', {
    query: {
      limit: 200,
      order_by: 'sentAt[AscNullsFirst]',
      filter: `conversationId[eq]:${conversationId}`,
    },
  });

  return response.data?.inboxMessages ?? [];
};

export const sendReply = async ({
  conversationId,
  body,
  senderName,
}: {
  conversationId: string;
  body: string;
  senderName: string;
}): Promise<void> => {
  const sentAt = new Date().toISOString();

  await client.post('/rest/inboxMessages', {
    conversationId,
    body,
    senderName,
    direction: 'OUTBOUND',
    sentAt,
  });

  // The conversation carries a denormalized preview so the list renders from a
  // single query; nothing recomputes it server-side yet.
  await client.patch(`/rest/conversations/${conversationId}`, {
    lastMessageAt: sentAt,
    lastMessagePreview: body.slice(0, 120),
    unreadCount: 0,
  });
};

export const seedDemoData = async (): Promise<{ created: number }> =>
  client.post<{ created: number }>('/s/inbox/seed-demo-data', {});
