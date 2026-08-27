import { CoreApiClient } from 'twenty-client-sdk/core';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { definePostInstallLogicFunction } from 'twenty-sdk/define';

import { FIELD_PLACEMENTS } from 'src/constants/field-placements';
import { RELABEL_STANDARD_OBJECTS_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

// Relabel, never rename: nameSingular is the API contract, so renaming
// `opportunity` would break /rest/opportunities and every integration. An app
// manifest cannot express this, so it goes through the metadata API on install.
//
// Matched on nameSingular, never on universalIdentifier. Those constants are
// compiled into the CLI, so on a version skew they name different objects than
// the server has, and the filter silently returns the wrong record rather than
// none: that is how Dashboard came to be called Organization.
//
// Only FLAT_OBJECT_METADATA_EDITABLE_PROPERTIES.standard may be sent for a
// standard object. isLabelSyncedWithName is not in it and fails the whole
// update; standard labels are stored as overrides instead.
const RELABELS = [
  {
    nameSingular: 'opportunity',
    labelSingular: 'Job',
    labelPlural: 'Jobs',
    icon: 'IconBriefcase',
  },
  {
    nameSingular: 'company',
    labelSingular: 'Organization',
    labelPlural: 'Organizations',
    icon: 'IconBuilding',
  },
  // Repairing an earlier mistake of ours, and harmless once it has run.
  {
    nameSingular: 'dashboard',
    labelSingular: 'Dashboard',
    labelPlural: 'Dashboards',
    icon: 'IconLayoutDashboard',
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

  const found = (await client.query({
    objects: {
      __args: { paging: { first: 200 }, filter: {} },
      edges: { node: { id: true, nameSingular: true, labelSingular: true } },
    },
  })) as {
    objects?: {
      edges?: {
        node?: { id?: string; nameSingular?: string; labelSingular?: string };
      }[];
    };
  };

  const objectsByName = new Map<string, { id: string; label: string }>();

  for (const edge of found.objects?.edges ?? []) {
    if (edge.node?.nameSingular !== undefined && edge.node.id !== undefined) {
      objectsByName.set(edge.node.nameSingular, {
        id: edge.node.id,
        label: edge.node.labelSingular ?? '',
      });
    }
  }

  for (const relabel of RELABELS) {
    const target = objectsByName.get(relabel.nameSingular);

    if (target === undefined) {
      errors.push(`${relabel.nameSingular}: not found on this server`);
      continue;
    }

    if (target.label === relabel.labelSingular) {
      continue;
    }

    // A failure here must not fail the install, but it must be reported: a
    // silently swallowed one looks exactly like a relabel that did not apply.
    try {
      await client.mutation({
        updateOneObject: {
          __args: {
            input: {
              id: target.id,
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

      relabelled.push(`${relabel.nameSingular} -> ${relabel.labelPlural}`);
    } catch (caught) {
      errors.push(
        `${relabel.nameSingular}: ${caught instanceof Error ? caught.message : String(caught)}`,
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

type ViewRow = { id?: string; universalIdentifier?: string };
type ViewFieldRow = {
  id?: string;
  universalIdentifier?: string;
  position?: number;
  isVisible?: boolean;
  viewFieldGroupId?: string | null;
};
type ViewFieldGroupRow = { id?: string; name?: string };

// Placement cannot be declared in the manifest. Creating a field makes the
// engine create its view field too, at the identifier a declaration would have
// to reuse, and the two creates collide (RESERVED_SYSTEM_UNIVERSAL_IDENTIFIER)
// in an atomic plan that then never converges. Applying it here instead runs
// after the sync, when the rows exist and this is an update.
const applyFieldPlacements = async (): Promise<{
  moved: number;
  placementErrors: string[];
}> => {
  const client = new MetadataApiClient();
  const placementErrors: string[] = [];
  let moved = 0;

  const viewsResult = (await client.query({
    getViews: { id: true, universalIdentifier: true },
  })) as { getViews?: ViewRow[] };

  const viewIdByUniversalIdentifier = new Map<string, string>();

  for (const view of viewsResult.getViews ?? []) {
    if (view.universalIdentifier !== undefined && view.id !== undefined) {
      viewIdByUniversalIdentifier.set(view.universalIdentifier, view.id);
    }
  }

  const viewUniversalIdentifiers = [
    ...new Set(FIELD_PLACEMENTS.map((placement) => placement.viewUniversalIdentifier)),
  ];

  for (const viewUniversalIdentifier of viewUniversalIdentifiers) {
    const viewId = viewIdByUniversalIdentifier.get(viewUniversalIdentifier);

    if (viewId === undefined) {
      placementErrors.push(`View not found: ${viewUniversalIdentifier}`);
      continue;
    }

    const fieldsResult = (await client.query({
      getViewFields: {
        __args: { viewId },
        id: true,
        universalIdentifier: true,
        position: true,
        isVisible: true,
        viewFieldGroupId: true,
      },
    })) as { getViewFields?: ViewFieldRow[] };

    const viewFieldByUniversalIdentifier = new Map<string, ViewFieldRow>();

    for (const viewField of fieldsResult.getViewFields ?? []) {
      if (viewField.universalIdentifier !== undefined) {
        viewFieldByUniversalIdentifier.set(viewField.universalIdentifier, viewField);
      }
    }

    // Groups carry no universal identifier, so they are matched by name.
    const groupsResult = (await client.query({
      getViewFieldGroups: { __args: { viewId }, id: true, name: true },
    })) as { getViewFieldGroups?: ViewFieldGroupRow[] };

    const groupIdByName = new Map<string, string>();

    for (const group of groupsResult.getViewFieldGroups ?? []) {
      if (group.name !== undefined && group.id !== undefined) {
        groupIdByName.set(group.name, group.id);
      }
    }

    for (const placement of FIELD_PLACEMENTS.filter(
      (candidate) => candidate.viewUniversalIdentifier === viewUniversalIdentifier,
    )) {
      const viewField = viewFieldByUniversalIdentifier.get(
        placement.viewFieldUniversalIdentifier,
      );

      if (viewField?.id === undefined) {
        // The field may simply not exist yet on this workspace, which is not an
        // error worth failing an install over.
        continue;
      }

      const viewFieldGroupId =
        placement.groupName !== undefined
          ? (groupIdByName.get(placement.groupName) ?? null)
          : null;

      const isAlreadyPlaced =
        viewField.position === placement.position &&
        viewField.isVisible === true &&
        (viewField.viewFieldGroupId ?? null) === viewFieldGroupId;

      if (isAlreadyPlaced) {
        continue;
      }

      try {
        await client.mutation({
          updateViewField: {
            __args: {
              input: {
                id: viewField.id,
                update: {
                  position: placement.position,
                  isVisible: true,
                  viewFieldGroupId,
                },
              },
            },
            id: true,
          },
        });
        moved += 1;
      } catch (caught) {
        placementErrors.push(
          `${placement.viewFieldUniversalIdentifier}: ${caught instanceof Error ? caught.message : String(caught)}`,
        );
      }
    }
  }

  return { moved, placementErrors };
};

const handler = async () => {
  const { relabelled, errors } = await relabelStandardObjects();

  let seeded;
  let seedError;

  try {
    seeded = await seedFirmStructure();
  } catch (caught) {
    seedError = caught instanceof Error ? caught.message : String(caught);
  }

  const { moved, placementErrors } = await applyFieldPlacements();

  return {
    relabelled,
    relabelErrors: errors,
    ...(seeded ?? {}),
    ...(seedError !== undefined ? { seedError } : {}),
    fieldsMoved: moved,
    placementErrors,
  };
};

export default definePostInstallLogicFunction({
  universalIdentifier: RELABEL_STANDARD_OBJECTS_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'setup-firm',
  handler,
  shouldRunOnVersionUpgrade: true,
});
