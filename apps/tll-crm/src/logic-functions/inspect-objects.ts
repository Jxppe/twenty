import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { defineLogicFunction } from 'twenty-sdk/define';

import { INSPECT_OBJECTS_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

type ObjectRow = {
  nameSingular?: string;
  labelSingular?: string;
  labelPlural?: string;
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
        // Only fields that exist in both 2.34 and 2.35: the client SDK's schema
        // is generated from the CLI's version, not the server's.
        node: {
          nameSingular: true,
          labelSingular: true,
          labelPlural: true,
        },
      },
    },
  })) as { objects?: { edges?: { node?: ObjectRow }[] } };

  const objects = (found.objects?.edges ?? [])
    .map((edge) => edge.node)
    .filter((node): node is ObjectRow => node !== undefined)
    .map(
      (node) =>
        `${node.nameSingular} => ${node.labelSingular} / ${node.labelPlural}`,
    )
    .sort();

  return { objects };
};

export default defineLogicFunction({
  universalIdentifier: INSPECT_OBJECTS_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'inspect-objects',
  handler,
});
