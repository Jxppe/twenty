import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { AppPath, navigate } from 'twenty-sdk/front-component';
import { IconRefresh, IconSend, IconUser } from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme-constants';

import {
  type ConversationRecord,
  fetchConversations,
  fetchMessages,
  type InboxMessageRecord,
  seedDemoData,
  sendReply,
} from 'src/api/conversations';
import {
  type Channel,
  CHANNEL_COLORS,
  CHANNEL_LABELS,
  CHANNELS,
} from 'src/constants/channels';
import { INBOX_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { brandAccent, brandAccentText } from 'src/constants/brand';
import { Badge } from 'src/ui/Badge';
import { Button } from 'src/ui/Button';
import { FilterChips, type FilterChipOption } from 'src/ui/FilterChips';
import { Initial } from 'src/ui/Initial';

const POLL_INTERVAL_MS = 5000;

const CHANNEL_FILTER_OPTIONS: ReadonlyArray<FilterChipOption<Channel | 'ALL'>> = [
  { value: 'ALL', label: 'All' },
  ...CHANNELS.map((channel) => ({
    value: channel,
    label: CHANNEL_LABELS[channel],
  })),
];

const formatTime = (value: string | null) => {
  if (value === null) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleString(undefined, {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
  });
};

const contactName = (conversation: ConversationRecord) => {
  const person = conversation.person;

  if (person?.name !== undefined && person.name !== null) {
    return [person.name.firstName, person.name.lastName]
      .filter((part) => part !== null && part !== undefined && part !== '')
      .join(' ');
  }

  return conversation.contactIdentity?.displayName ?? conversation.title ?? '';
};

const Inbox = () => {
  const theme = useTheme();

  const [conversations, setConversations] = useState<ConversationRecord[]>([]);
  const [messages, setMessages] = useState<InboxMessageRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [channelFilter, setChannelFilter] = useState<Channel | 'ALL'>('ALL');
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [lastFetchMs, setLastFetchMs] = useState<number | null>(null);
  const [lastFetchAt, setLastFetchAt] = useState<string>('');

  const selectedIdRef = useRef<string | null>(null);

  selectedIdRef.current = selectedId;

  const loadConversations = useCallback(async () => {
    const startedAt = performance.now();

    try {
      const records = await fetchConversations({
        channel: channelFilter === 'ALL' ? undefined : channelFilter,
      });

      setConversations(records);
      setError(null);
      setLastFetchMs(Math.round(performance.now() - startedAt));
      setLastFetchAt(new Date().toLocaleTimeString());

      if (selectedIdRef.current === null && records.length > 0) {
        setSelectedId(records[0].id);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setIsLoading(false);
    }
  }, [channelFilter]);

  useEffect(() => {
    void loadConversations();

    // The sandbox exposes no realtime transport, so the list is polled. Twenty's
    // own record views get SSE updates instead; that difference is the point of
    // keeping both surfaces side by side during the prototype.
    const interval = setInterval(() => void loadConversations(), POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [loadConversations]);

  useEffect(() => {
    if (selectedId === null) {
      setMessages([]);

      return;
    }

    let isStale = false;

    void fetchMessages(selectedId).then((records) => {
      if (!isStale) {
        setMessages(records);
      }
    });

    return () => {
      isStale = true;
    };
  }, [selectedId, conversations]);

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedId),
    [conversations, selectedId],
  );

  const handleSend = async () => {
    if (selectedId === null || draft.trim() === '') {
      return;
    }

    const body = draft.trim();

    setDraft('');

    try {
      await sendReply({ conversationId: selectedId, body, senderName: 'Agent' });
      await loadConversations();
      setMessages(await fetchMessages(selectedId));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    }
  };

  const handleSeed = async () => {
    setIsSeeding(true);

    try {
      await seedDemoData();
      await loadConversations();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setIsSeeding(false);
    }
  };

  const paneBorder = `1px solid ${theme.border.color.light}`;

  return (
    <div
      style={{
        background: theme.background.primary,
        color: theme.font.color.primary,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: theme.font.family,
        fontSize: theme.font.size.sm,
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          alignItems: 'center',
          borderBottom: paneBorder,
          display: 'flex',
          gap: theme.spacing[2],
          flexShrink: 0,
          padding: theme.spacing[2],
        }}
      >
        <FilterChips
          testId="inbox-channel-filter"
          value={channelFilter}
          options={CHANNEL_FILTER_OPTIONS}
          onChange={(value) => {
            setChannelFilter(value);
            setSelectedId(null);
          }}
        />
        <div style={{ flex: 1 }} />
        <span
          data-testid="inbox-diagnostics"
          style={{
            color: theme.font.color.tertiary,
            fontSize: theme.font.size.xs,
          }}
        >
          {conversations.length} conversations
          {lastFetchMs !== null ? ` · ${lastFetchMs}ms` : ''}
          {lastFetchAt !== '' ? ` · synced ${lastFetchAt}` : ''}
        </span>
        <Button
          Icon={IconRefresh}
          title="Refresh"
          onClick={() => void loadConversations()}
        />
      </div>

      {error !== null && (
        <div
          style={{
            background: theme.background.danger,
            color: theme.font.color.danger,
            flexShrink: 0,
            padding: theme.spacing[2],
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <div
          style={{
            borderRight: paneBorder,
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
            overflowY: 'auto',
            width: '280px',
          }}
        >
          {isLoading && (
            <div
              style={{
                color: theme.font.color.tertiary,
                padding: theme.spacing[4],
              }}
            >
              Loading…
            </div>
          )}
          {!isLoading && conversations.length === 0 && (
            <div style={{ padding: theme.spacing[4] }}>
              <p
                style={{
                  color: theme.font.color.secondary,
                  marginBottom: theme.spacing[3],
                }}
              >
                No conversations yet.
              </p>
              <Button
                title={isSeeding ? 'Creating…' : 'Create demo data'}
                isDisabled={isSeeding}
                onClick={() => void handleSeed()}
              />
            </div>
          )}
          {conversations.map((conversation) => {
            const isSelected = conversation.id === selectedId;
            const name = contactName(conversation);

            return (
              <button
                key={conversation.id}
                type="button"
                data-testid={`inbox-conversation-${conversation.id}`}
                onClick={() => setSelectedId(conversation.id)}
                style={{
                  background: isSelected
                    ? theme.background.transparent.light
                    : 'transparent',
                  border: 'none',
                  borderBottom: paneBorder,
                  cursor: 'pointer',
                  display: 'flex',
                  gap: theme.spacing[2],
                  padding: theme.spacing[2],
                  textAlign: 'left',
                  width: '100%',
                }}
              >
                <Initial name={name} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      alignItems: 'center',
                      display: 'flex',
                      gap: theme.spacing[1],
                      justifyContent: 'space-between',
                    }}
                  >
                    <span
                      style={{
                        fontWeight: theme.font.weight.medium,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {name}
                    </span>
                    <span
                      style={{
                        color: theme.font.color.tertiary,
                        flexShrink: 0,
                        fontSize: theme.font.size.xxs,
                      }}
                    >
                      {formatTime(conversation.lastMessageAt)}
                    </span>
                  </div>
                  <div
                    style={{
                      color: theme.font.color.tertiary,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {conversation.lastMessagePreview ?? ''}
                  </div>
                  <div style={{ marginTop: theme.spacing[1] }}>
                    {conversation.channel !== null && (
                      <Badge
                        text={CHANNEL_LABELS[conversation.channel]}
                        color={CHANNEL_COLORS[conversation.channel]}
                      />
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div
          style={{
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            minWidth: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              flex: 1,
              flexDirection: 'column',
              gap: theme.spacing[2],
              overflowY: 'auto',
              padding: theme.spacing[3],
            }}
          >
            {messages.map((message) => {
              const isOutbound = message.direction === 'OUTBOUND';

              return (
                <div
                  key={message.id}
                  style={{
                    alignSelf: isOutbound ? 'flex-end' : 'flex-start',
                    background: isOutbound
                      ? brandAccent(theme)
                      : theme.background.secondary,
                    borderRadius: theme.border.radius.md,
                    color: isOutbound
                      ? brandAccentText(theme)
                      : theme.font.color.primary,
                    maxWidth: '70%',
                    padding: theme.spacing[2],
                  }}
                >
                  <div>{message.body}</div>
                  <div
                    style={{
                      fontSize: theme.font.size.xxs,
                      marginTop: theme.spacing[1],
                      opacity: 0.7,
                    }}
                  >
                    {message.senderName ?? ''} {formatTime(message.sentAt)}
                  </div>
                </div>
              );
            })}
          </div>

          {selectedConversation !== undefined && (
            <div
              style={{
                borderTop: paneBorder,
                display: 'flex',
                flexShrink: 0,
                gap: theme.spacing[2],
                padding: theme.spacing[2],
              }}
            >
              <input
                data-testid="inbox-reply-input"
                value={draft}
                placeholder="Reply…"
                onChange={(event) => setDraft(event.target.value)}
                style={{
                  background: theme.background.primary,
                  border: `1px solid ${theme.border.color.medium}`,
                  borderRadius: theme.border.radius.sm,
                  color: theme.font.color.primary,
                  flex: 1,
                  fontFamily: theme.font.family,
                  fontSize: theme.font.size.sm,
                  padding: theme.spacing[2],
                }}
              />
              <Button
                Icon={IconSend}
                title="Send"
                variant="primary"
                isDisabled={draft.trim() === ''}
                onClick={() => void handleSend()}
              />
            </div>
          )}
        </div>

        <div
          style={{
            borderLeft: paneBorder,
            flexShrink: 0,
            overflowY: 'auto',
            padding: theme.spacing[3],
            width: '260px',
          }}
        >
          {selectedConversation === undefined ? (
            <span style={{ color: theme.font.color.tertiary }}>
              Select a conversation
            </span>
          ) : (
            <div
              style={{
                alignItems: 'flex-start',
                display: 'flex',
                flexDirection: 'column',
                gap: theme.spacing[3],
              }}
            >
              <div
                style={{
                  fontSize: theme.font.size.md,
                  fontWeight: theme.font.weight.medium,
                }}
              >
                {contactName(selectedConversation)}
              </div>
              {selectedConversation.status !== null && (
                <Badge
                  text={selectedConversation.status}
                  color={
                    selectedConversation.status === 'OPEN' ? 'green' : 'gray'
                  }
                />
              )}
              {selectedConversation.person?.company?.name !== undefined && (
                <span style={{ color: theme.font.color.secondary }}>
                  {selectedConversation.person.company.name}
                </span>
              )}
              {selectedConversation.person !== null &&
                selectedConversation.person !== undefined && (
                  <Button
                    Icon={IconUser}
                    title="Open contact"
                    onClick={() =>
                      void navigate(AppPath.RecordShowPage, {
                        objectNameSingular: 'person',
                        objectRecordId: selectedConversation.person?.id ?? null,
                      })
                    }
                  />
                )}
              {selectedConversation.contactIdentity != null && (
                <div style={{ color: theme.font.color.tertiary }}>
                  {selectedConversation.contactIdentity.channel}:{' '}
                  {selectedConversation.contactIdentity.displayName}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: INBOX_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'inbox',
  description: 'Three-pane omnichannel inbox',
  component: Inbox,
});
