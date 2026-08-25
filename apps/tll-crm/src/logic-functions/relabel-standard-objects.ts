import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import {
  definePostInstallLogicFunction,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { RELABEL_STANDARD_OBJECTS_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

// Relabel, never rename: nameSingular is the API contract, so renaming
// `opportunity` would break /rest/opportunities and every integration. An app
// manifest cannot express this, so it goes through the metadata API on install.
const RELABELS = [
  {
    universalIdentifier:
      STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
    labelSingular: 'Matter',
    labelPlural: 'Matters',
    icon: 'IconBriefcase',
  },
  {
    universalIdentifier:
      STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
    labelSingular: 'Organization',
    labelPlural: 'Organizations',
    icon: 'IconBuilding',
  },
];

const handler = async (): Promise<{ relabelled: string[] }> => {
  const client = new MetadataApiClient();
  const relabelled: string[] = [];

  for (const relabel of RELABELS) {
    // A failure here must not fail the install: a wrong label is cosmetic,
    // a blocked install is not.
    try {
      const found = (await client.query({
        objects: {
          __args: {
            paging: { first: 1 },
            filter: {
              universalIdentifier: { eq: relabel.universalIdentifier },
            },
          },
          edges: { node: { id: true } },
        },
      })) as { objects?: { edges?: { node?: { id?: string } }[] } };

      const id = found.objects?.edges?.[0]?.node?.id;

      if (id === undefined) {
        continue;
      }

      await client.mutation({
        updateOneObject: {
          __args: {
            input: {
              id,
              update: {
                labelSingular: relabel.labelSingular,
                labelPlural: relabel.labelPlural,
                icon: relabel.icon,
                // Without this the label snaps back to match nameSingular.
                isLabelSyncedWithName: false,
              },
            },
          },
          id: true,
        },
      });

      relabelled.push(relabel.labelPlural);
    } catch {
      continue;
    }
  }

  return { relabelled };
};

export default definePostInstallLogicFunction({
  universalIdentifier: RELABEL_STANDARD_OBJECTS_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'relabel-standard-objects',
  handler,
  shouldRunOnVersionUpgrade: true,
});
