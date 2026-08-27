import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { CLEAR_TWENTY_DEMO_DATA_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

type Payload = { confirm?: boolean };

// Every record Twenty's dev seeder writes carries an id in the 20202020- range
// (`person-data-seeds.constant.ts`). UUID filters have no prefix operator, but
// they do compare, and this range holds exactly that prefix. Anything we or the
// firm creates is a random v4 and cannot collide.
const SEED_RANGE = {
  gte: '20202020-0000-0000-0000-000000000000',
  lt: '20202021-0000-0000-0000-000000000000',
};

const TARGETS = [
  { plural: 'opportunities', singular: 'Opportunity' },
  { plural: 'people', singular: 'Person' },
  { plural: 'companies', singular: 'Company' },
] as const;

const PAGE_SIZE = 60;

const idsInSeedRange = async (
  client: CoreApiClient,
  plural: string,
): Promise<string[]> => {
  const result = (await client.query({
    [plural]: {
      __args: { filter: { id: SEED_RANGE }, first: PAGE_SIZE },
      edges: { node: { id: true } },
    },
  })) as Record<string, { edges?: { node?: { id?: string } }[] }>;

  return (result[plural]?.edges ?? [])
    .map((edge) => edge.node?.id)
    .filter((id): id is string => id !== undefined);
};

const handler = async (
  payload: Payload,
): Promise<{
  deleted: Record<string, number>;
  remaining: Record<string, number>;
  dryRun: boolean;
}> => {
  const client = new CoreApiClient();
  const confirm = payload.confirm === true;
  const deleted: Record<string, number> = {};
  const remaining: Record<string, number> = {};

  for (const target of TARGETS) {
    if (!confirm) {
      // A dry run reports one page, which is enough to show the range matches
      // the right records without counting all 1,200 of them.
      remaining[target.plural] = (await idsInSeedRange(client, target.plural))
        .length;
      deleted[target.plural] = 0;
      continue;
    }

    let removed = 0;

    // Jobs go before people and people before companies: a row cannot be
    // deleted while something still points at it.
    for (;;) {
      const ids = await idsInSeedRange(client, target.plural);

      if (ids.length === 0) {
        break;
      }

      for (const id of ids) {
        await client.mutation({
          [`delete${target.singular}`]: { __args: { id }, id: true },
        });
        removed += 1;
      }
    }

    deleted[target.plural] = removed;
    remaining[target.plural] = 0;
  }

  return { deleted, remaining, dryRun: !confirm };
};

export default defineLogicFunction({
  universalIdentifier: CLEAR_TWENTY_DEMO_DATA_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'clear-twenty-demo-data',
  handler,
});
