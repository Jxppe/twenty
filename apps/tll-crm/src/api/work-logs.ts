import { RestApiClient } from 'twenty-client-sdk/rest';

// `import type` and not `import { type ... }`: the inline form leaves the import
// statement standing, which would drag the logic function and its CoreApiClient
// into the front-component bundle. This form is erased outright.
import type { WorkLogDraft } from 'src/logic-functions/draft-work-log';

export type { WorkLogDraft };

export type WorkLogInput = {
  description: string;
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
