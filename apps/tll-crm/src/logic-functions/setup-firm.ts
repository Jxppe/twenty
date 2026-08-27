import { CoreApiClient } from 'twenty-client-sdk/core';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import {
  definePostInstallLogicFunction,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { RELABEL_STANDARD_OBJECTS_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

// Relabel, never rename: nameSingular is the API contract, so renaming
// `opportunity` would break /rest/opportunities and every integration. An app
// manifest cannot express this, so it goes through the metadata API on install.
//
// Only the properties in FLAT_OBJECT_METADATA_EDITABLE_PROPERTIES.standard may
// be sent for a standard object. isLabelSyncedWithName is not one of them, and
// including it fails the whole update: it is a custom-object property, and
// standard labels are stored as overrides instead.
const RELABELS = [
  {
    universalIdentifier:
      STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
    labelSingular: 'Job',
    labelPlural: 'Jobs',
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

const BILLING_ENTITIES = [
  { name: 'Thailiving Law', legalName: 'Thailiving Law Co., Ltd.' },
  { name: 'Unique X Services', legalName: 'Unique X Services Co., Ltd.' },
  { name: 'Pattaya Notary', legalName: 'Pattaya Notary' },
];

// The default that stops anyone having to think about which company bills a
// matter: notarization is Pattaya Notary, registrations are Unique X.
const PRACTICE_AREAS = [
  { name: 'Visa and immigration', billingEntity: 'Thailiving Law' },
  { name: 'Property', billingEntity: 'Thailiving Law' },
  { name: 'Litigation', billingEntity: 'Thailiving Law' },
  { name: 'Estate and wills', billingEntity: 'Thailiving Law' },
  { name: 'Company registration', billingEntity: 'Unique X Services' },
  { name: 'Notarization', billingEntity: 'Pattaya Notary' },
];

const relabelStandardObjects = async (): Promise<{
  relabelled: string[];
  errors: string[];
}> => {
  const client = new MetadataApiClient();
  const relabelled: string[] = [];
  const errors: string[] = [];

  for (const relabel of RELABELS) {
    // A failure here must not fail the install, but it must be reported: a
    // silently swallowed one looks exactly like a relabel that did not apply.
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
        errors.push(`${relabel.labelPlural}: object not found`);
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
              },
            },
          },
          id: true,
        },
      });

      relabelled.push(relabel.labelPlural);
    } catch (caught) {
      errors.push(
        `${relabel.labelPlural}: ${caught instanceof Error ? caught.message : String(caught)}`,
      );
    }
  }

  return { relabelled, errors };
};

const seedFirmStructure = async (): Promise<{
  billingEntities: number;
  practiceAreas: number;
}> => {
  const client = new CoreApiClient();

  // Runs again on every version upgrade, so read before writing or the firm
  // ends up with three Pattaya Notaries.
  const existingEntities = (await client.query({
    billingEntities: { edges: { node: { id: true, name: true } } },
  })) as {
    billingEntities?: { edges?: { node?: { id?: string; name?: string } }[] };
  };

  const entityIdByName = new Map<string, string>();

  for (const edge of existingEntities.billingEntities?.edges ?? []) {
    if (edge.node?.name !== undefined && edge.node.id !== undefined) {
      entityIdByName.set(edge.node.name, edge.node.id);
    }
  }

  let createdEntities = 0;

  for (const entity of BILLING_ENTITIES) {
    if (entityIdByName.has(entity.name)) {
      continue;
    }

    const created = (await client.mutation({
      createBillingEntity: {
        __args: { data: { name: entity.name, legalName: entity.legalName } },
        id: true,
      },
    })) as { createBillingEntity?: { id?: string } };

    if (created.createBillingEntity?.id !== undefined) {
      entityIdByName.set(entity.name, created.createBillingEntity.id);
      createdEntities += 1;
    }
  }

  const existingAreas = (await client.query({
    practiceAreas: { edges: { node: { name: true } } },
  })) as { practiceAreas?: { edges?: { node?: { name?: string } }[] } };

  const areaNames = new Set(
    (existingAreas.practiceAreas?.edges ?? [])
      .map((edge) => edge.node?.name)
      .filter((name): name is string => name !== undefined),
  );

  let createdAreas = 0;

  for (const area of PRACTICE_AREAS) {
    if (areaNames.has(area.name)) {
      continue;
    }

    const defaultBillingEntityId = entityIdByName.get(area.billingEntity);

    await client.mutation({
      createPracticeArea: {
        __args: {
          data: {
            name: area.name,
            ...(defaultBillingEntityId !== undefined
              ? { defaultBillingEntityId }
              : {}),
          },
        },
        id: true,
      },
    });

    createdAreas += 1;
  }

  return { billingEntities: createdEntities, practiceAreas: createdAreas };
};

const handler = async () => {
  const { relabelled, errors } = await relabelStandardObjects();

  try {
    const seeded = await seedFirmStructure();

    return { relabelled, relabelErrors: errors, ...seeded };
  } catch (caught) {
    return {
      relabelled,
      relabelErrors: errors,
      seedError: caught instanceof Error ? caught.message : String(caught),
    };
  }
};

export default definePostInstallLogicFunction({
  universalIdentifier: RELABEL_STANDARD_OBJECTS_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'setup-firm',
  handler,
  shouldRunOnVersionUpgrade: true,
});
