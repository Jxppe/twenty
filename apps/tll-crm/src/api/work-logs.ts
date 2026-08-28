import { RestApiClient } from 'twenty-client-sdk/rest';

// `import type` and not `import { type ... }`: the inline form leaves the import
// statement standing, which would drag the logic function and its CoreApiClient
// into the front-component bundle. This form is erased outright.
import type { WorkLogDraft } from 'src/logic-functions/draft-work-log';

export type { WorkLogDraft };

export type PickerOption = { id: string; label: string };

export type WorkLogInput = {
  description: string;
  notes: string;
  workedOn: string;
  minutes: number;
  staffId: string;
  matterId: string | null;
  bookingId: string | null;
  personId: string | null;
  billingEntityId: string | null;
};

const client = new RestApiClient();

export const fetchWorkLogDrafts = async (
  workedOn: string,
): Promise<{ drafts: WorkLogDraft[]; workspaceMemberId: string | null }> =>
  client.post<{ drafts: WorkLogDraft[]; workspaceMemberId: string | null }>(
    '/s/practice/draft-work-log',
    { workedOn },
  );

type ListResponse<TKey extends string, TRecord> = {
  data: Record<TKey, TRecord[]>;
};

type PersonRecord = {
  id: string;
  name?: { firstName?: string | null; lastName?: string | null } | null;
};

type MatterRecord = { id: string; name?: string | null };

// Every client and open job in one pair of requests, because a native
// `<input list>` needs the whole option set up front. A firm this size has
// hundreds of each, not thousands.
// ponytail: unpaginated at 500; switch to a search-as-you-type endpoint if the
// client list ever outgrows it.
const PAGE = 500;

export const fetchPickerOptions = async (): Promise<{
  clients: PickerOption[];
  jobs: PickerOption[];
}> => {
  const [people, matters] = await Promise.all([
    client.get<ListResponse<'people', PersonRecord>>('/rest/people', {
      query: { limit: PAGE, order_by: 'createdAt[DescNullsLast]' },
    }),
    client.get<ListResponse<'opportunities', MatterRecord>>(
      '/rest/opportunities',
      { query: { limit: PAGE, order_by: 'createdAt[DescNullsLast]' } },
    ),
  ]);

  return {
    clients: (people.data?.people ?? [])
      .map((person) => ({
        id: person.id,
        label: [person.name?.firstName, person.name?.lastName]
          .filter((part) => part !== null && part !== undefined && part !== '')
          .join(' ')
          .trim(),
      }))
      .filter((option) => option.label !== ''),
    jobs: (matters.data?.opportunities ?? [])
      .map((matter) => ({ id: matter.id, label: matter.name ?? '' }))
      .filter((option) => option.label !== ''),
  };
};

// A day holds a handful of lines, so one request each is cheaper than reaching
// for a batch endpoint. Sequential rather than parallel: a half-written day is
// harder to explain than a failure with everything before it saved.
export const createWorkLogs = async (
  workLogs: WorkLogInput[],
): Promise<number> => {
  let created = 0;

  for (const workLog of workLogs) {
    await client.post('/rest/workLogs', workLog);
    created += 1;
  }

  return created;
};
