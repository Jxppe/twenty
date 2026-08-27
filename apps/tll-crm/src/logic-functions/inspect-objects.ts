import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { defineLogicFunction } from 'twenty-sdk/define';

import { INSPECT_OBJECTS_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

type ObjectRow = {
  nameSingular?: string;
  labelSingular?: string;
  labelPlural?: string;
  isCustom?: boolean;
};

// Read-only. The SDK's STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS are compiled into
// the CLI version, not read from the server, so on a version skew they point at
// the wrong objects. nameSingular is the API contract and does not move.
const handler = async (): Promise<{ objects: string[] }> => {
  const client = new MetadataApiClient();

  const found = (await client.query({
    objects: {
      __args: { paging: { first: 200 }, filter: {} },
      edges: {
        node: {
          nameSingular: true,
          labelSingular: true,
          labelPlural: true,
          isCustom: true,
        },
      },
    },
  })) as { objects?: { edges?: { node?: ObjectRow }[] } };

  const objects = (found.objects?.edges ?? [])
    .map((edge) => edge.node)
    .filter((node): node is ObjectRow => node !== undefined)
    .map(
      (node) =>
        `${node.nameSingular} => ${node.labelSingular} / ${node.labelPlural}${node.isCustom === true ? ' (custom)' : ''}`,
    )
    .sort();

  return { objects };
};

export default defineLogicFunction({
  universalIdentifier: INSPECT_OBJECTS_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'inspect-objects',
  handler,
});
