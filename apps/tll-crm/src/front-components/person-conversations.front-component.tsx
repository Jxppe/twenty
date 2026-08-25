import { useEffect, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { AppPath, navigate, useRecordId } from 'twenty-sdk/front-component';
import { useTheme } from 'twenty-ui/theme-constants';
import { RestApiClient } from 'twenty-client-sdk/rest';

import {
  CHANNEL_COLORS,
  CHANNEL_LABELS,
  type Channel,
} from 'src/constants/channels';
import { PERSON_CONVERSATIONS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { Badge } from 'src/ui/Badge';
import { Button } from 'src/ui/Button';

type PersonConversation = {
  id: string;
  title: string | null;
  channel: Channel | null;
  status: string | null;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
};

const client = new RestApiClient();

const PersonConversations = () => {
  const theme = useTheme();
  const personId = useRecordId();
  const [conversations, setConversations] = useState<PersonConversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (personId === undefined || personId === null) {
      return;
    }

    let isStale = false;

    void client
      .get<{ data: { conversations: PersonConversation[] } }>(
        '/rest/conversations',
        {
          query: {
            limit: 50,
            filter: `personId[eq]:${personId}`,
            order_by: 'lastMessageAt[DescNullsLast]',
          },
        },
      )
      .then((response) => {
        if (!isStale) {
          setConversations(response.data?.conversations ?? []);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!isStale) {
          setIsLoading(false);
        }
      });

    return () => {
      isStale = true;
    };
  }, [personId]);

  if (isLoading) {
    return (
      <div
        style={{
          color: theme.font.color.tertiary,
          fontFamily: theme.font.family,
          padding: theme.spacing[3],
        }}
      >
        Loading…
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div
        style={{
          color: theme.font.color.tertiary,
          fontFamily: theme.font.family,
          padding: theme.spacing[3],
        }}
      >
        No conversations with this contact yet.
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        fontFamily: theme.font.family,
        fontSize: theme.font.size.sm,
      }}
    >
      {conversations.map((conversation) => (
        <div
          key={conversation.id}
          style={{
            alignItems: 'center',
            borderBottom: `1px solid ${theme.border.color.light}`,
            display: 'flex',
            gap: theme.spacing[2],
            padding: theme.spacing[2],
          }}
        >
          {conversation.channel !== null && (
            <Badge
              text={CHANNEL_LABELS[conversation.channel]}
              color={CHANNEL_COLORS[conversation.channel]}
            />
          )}
          <span
            style={{
              color: theme.font.color.secondary,
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {conversation.lastMessagePreview ?? conversation.title ?? ''}
          </span>
          <Button
            title="Open"
            onClick={() =>
              void navigate(AppPath.RecordShowPage, {
                objectNameSingular: 'conversation',
                objectRecordId: conversation.id,
              })
            }
          />
        </div>
      ))}
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier:
    PERSON_CONVERSATIONS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'person-conversations',
  description: 'Conversations tab on the contact record page',
  component: PersonConversations,
});
