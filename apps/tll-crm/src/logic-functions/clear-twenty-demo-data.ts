import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { CLEAR_TWENTY_DEMO_DATA_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

type Payload = { confirm?: boolean };

// Every record Twenty's dev seeder writes carries an id in the 20202020- range
// (`person-data-seeds.constant.ts`). UUID filters have no prefix operator, but
// they do compare, and this range holds exactly that prefix. Anything we or the
// firm creates is a random v4 and cannot collide.
//
// Two clauses under `and` because a field takes exactly one operator per object,
// and the bounds are the lowest legal UUID for each prefix because `isValidUuid`
// rejects an all-zero version and variant.
const SEED_RANGE_FILTER = {
  and: [
    { id: { gte: '20202020-0000-1000-8000-000000000000' } },
    { id: { lt: '20202021-0000-1000-8000-000000000000' } },
  ],
};

// Jobs before people and people before organizations: a row cannot go while
// something still points at it.
const TARGETS = [
  { plural: 'opportunities', mutationPlural: 'Opportunities' },
  { plural: 'people', mutationPlural: 'People' },
  { plural: 'companies', mutationPlural: 'Companies' },
] as const;

const countInRange = async (
  client: CoreApiClient,
  plural: string,
): Promise<number> => {
  const result = (await client.query({
    [plural]: {
      __args: { filter: SEED_RANGE_FILTER, first: 1 },
      totalCount: true,
    },
  })) as Record<string, { totalCount?: number } | undefined>;

  return result[plural]?.totalCount ?? 0;
};

const handler = async (
  payload: Payload,
): Promise<{
  dryRun: boolean;
  matched: Record<string, number>;
  removed: Record<string, number>;
  errors: string[];
}> => {
  const client = new CoreApiClient();
  const confirm = payload.confirm === true;
  const matched: Record<string, number> = {};
  const removed: Record<string, number> = {};
  const errors: string[] = [];

  for (const target of TARGETS) {
    matched[target.plural] = await countInRange(client, target.plural);
  }

  if (!confirm) {
    return { dryRun: true, matched, removed, errors };
  }

  for (const target of TARGETS) {
    // One filtered mutation rather than a round trip per record: deleting these
    // one at a time is thousands of calls and outruns the function timeout.
    try {
      await client.mutation({
        [`delete${target.mutationPlural}`]: {
          __args: { filter: SEED_RANGE_FILTER },
          id: true,
        },
      });
    } catch (error) {
      errors.push(`delete ${target.plural}: ${String(error)}`);
      continue;
    }

    // Soft delete only hides them. Destroy is what actually frees the names and
    // stops them coming back in a deleted-records view.
    try {
      await client.mutation({
        [`destroy${target.mutationPlural}`]: {
          __args: { filter: SEED_RANGE_FILTER },
          id: true,
        },
      });
    } catch (error) {
      errors.push(
        `destroy ${target.plural} (soft delete succeeded): ${String(error)}`,
      );
    }

    removed[target.plural] = await (async () => {
      const left = await countInRange(client, target.plural);

      return matched[target.plural] - left;
    })();
  }

  return { dryRun: false, matched, removed, errors };
};

export default defineLogicFunction({
  universalIdentifier: CLEAR_TWENTY_DEMO_DATA_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'clear-twenty-demo-data',
  handler,
});
