import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { DRAFT_WORK_LOG_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

// twenty-sdk declares LogicFunctionExecutionContext but does not export it.
type ExecutionContext = { workspaceMemberId: string | null };

type Payload = {
  workspaceMemberId?: string;
  workedOn?: string;
};

export type WorkLogDraft = {
  description: string;
  minutes: number | null;
  isBillable: boolean;
  matterId: string | null;
  bookingId: string | null;
  personId: string | null;
  billingEntityId: string | null;
  source: 'BOOKING' | 'DEADLINE' | 'CONVERSATION';
};

const MINUTE = 60_000;

const dayBounds = (workedOn: string): { from: string; to: string } => {
  const from = new Date(`${workedOn}T00:00:00.000Z`);
  const to = new Date(from.getTime() + 24 * 60 * MINUTE);

  return { from: from.toISOString(), to: to.toISOString() };
};

const minutesBetween = (
  startsAt: string | undefined,
  endsAt: string | undefined,
): number | null => {
  if (startsAt === undefined || endsAt === undefined) {
    return null;
  }

  const elapsed = new Date(endsAt).getTime() - new Date(startsAt).getTime();

  return elapsed > 0 ? Math.round(elapsed / MINUTE) : null;
};

type BookingRow = {
  id?: string;
  title?: string;
  startsAt?: string;
  endsAt?: string;
  matterId?: string;
  personId?: string;
  billingEntityId?: string;
};

type DeadlineRow = { id?: string; title?: string; matterId?: string };

type ConversationRow = { id?: string; title?: string };

const nodesOf = <TRow,>(
  result: Record<string, { edges?: { node?: TRow }[] } | undefined>,
  key: string,
): TRow[] =>
  (result[key]?.edges ?? [])
    .map((edge) => edge.node)
    .filter((node): node is TRow => node !== undefined);

// The whole point of work logs, per docs/JOBS.md section 5: a blank form at 6pm
// gets skipped. Everything here is something the system already knows, so the
// form opens mostly answered and the only real question left is how long it took.
const handler = async (
  payload: Payload,
  context: ExecutionContext,
): Promise<{ drafts: WorkLogDraft[] }> => {
  // Drafting your own day is the normal case, so neither argument should have to
  // be typed. Passing them is for a manager filling in for someone who is out.
  const workspaceMemberId =
    payload.workspaceMemberId ?? context.workspaceMemberId ?? undefined;
  const workedOn = payload.workedOn ?? new Date().toISOString().slice(0, 10);

  if (workspaceMemberId === undefined) {
    return { drafts: [] };
  }

  const client = new CoreApiClient();
  const { from, to } = dayBounds(workedOn);
  const drafts: WorkLogDraft[] = [];

  const bookings = (await client.query({
    bookings: {
      __args: {
        filter: {
          responsibleId: { eq: workspaceMemberId },
          startsAt: { gte: from, lt: to },
          status: { neq: 'CANCELLED' },
        },
      },
      edges: {
        node: {
          id: true,
          title: true,
          startsAt: true,
          endsAt: true,
          matterId: true,
          personId: true,
          billingEntityId: true,
        },
      },
    },
  })) as Record<string, { edges?: { node?: BookingRow }[] }>;

  for (const booking of nodesOf<BookingRow>(bookings, 'bookings')) {
    drafts.push({
      description: booking.title ?? 'Appointment',
      minutes: minutesBetween(booking.startsAt, booking.endsAt),
      isBillable: true,
      matterId: booking.matterId ?? null,
      bookingId: booking.id ?? null,
      personId: booking.personId ?? null,
      billingEntityId: booking.billingEntityId ?? null,
      source: 'BOOKING',
    });
  }

  const deadlines = (await client.query({
    matterDeadlines: {
      __args: {
        filter: {
          responsibleId: { eq: workspaceMemberId },
          completedAt: { gte: from, lt: to },
        },
      },
      edges: { node: { id: true, title: true, matterId: true } },
    },
  })) as Record<string, { edges?: { node?: DeadlineRow }[] }>;

  for (const deadline of nodesOf<DeadlineRow>(deadlines, 'matterDeadlines')) {
    drafts.push({
      description: `Completed: ${deadline.title ?? 'deadline'}`,
      // Nothing in the record says how long it took, and a guess here would be
      // worse than a blank the person has to fill in.
      minutes: null,
      isBillable: true,
      matterId: deadline.matterId ?? null,
      bookingId: null,
      personId: null,
      billingEntityId: null,
      source: 'DEADLINE',
    });
  }

  const conversations = (await client.query({
    conversations: {
      __args: {
        filter: {
          assigneeId: { eq: workspaceMemberId },
          lastMessageAt: { gte: from, lt: to },
        },
      },
      edges: { node: { id: true, title: true } },
    },
  })) as Record<string, { edges?: { node?: ConversationRow }[] }>;

  const handled = nodesOf<ConversationRow>(conversations, 'conversations');

  // One line for the lot. Eleven separate rows for eleven chats is the kind of
  // detail that makes people stop filling the form in.
  if (handled.length > 0) {
    drafts.push({
      description: `Client messages: ${handled.length} conversation${handled.length === 1 ? '' : 's'}`,
      minutes: null,
      isBillable: false,
      matterId: null,
      bookingId: null,
      personId: null,
      billingEntityId: null,
      source: 'CONVERSATION',
    });
  }

  return { drafts };
};

export default defineLogicFunction({
  universalIdentifier: DRAFT_WORK_LOG_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'draft-work-log',
  handler,
});
