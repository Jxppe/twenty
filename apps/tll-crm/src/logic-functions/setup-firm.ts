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

// The firm files by client, so "Point of Contact" is both jargon (D12) and the
// wrong emphasis: the client is the record, not a contact attached to a deal.
// Field labels are editable on standard fields; names are not.
const FIELD_RELABELS = [
  { objectNameSingular: 'opportunity', fieldName: 'pointOfContact', label: 'Client', icon: 'IconUser' },
  { objectNameSingular: 'opportunity', fieldName: 'company', label: 'Organization', icon: 'IconBuilding' },
  { objectNameSingular: 'person', fieldName: 'pointOfContactForOpportunities', label: 'Jobs', icon: 'IconBriefcase' },
  { objectNameSingular: 'company', fieldName: 'opportunities', label: 'Jobs', icon: 'IconBriefcase' },
];

const relabelStandardFields = async (): Promise<{
  fieldsRelabelled: string[];
  fieldRelabelErrors: string[];
}> => {
  const client = new MetadataApiClient();
  const fieldsRelabelled: string[] = [];
  const fieldRelabelErrors: string[] = [];

  const found = (await client.query({
    objects: {
      __args: { paging: { first: 200 }, filter: {} },
      edges: {
        node: {
          nameSingular: true,
          fields: {
            __args: { paging: { first: 200 }, filter: {} },
            edges: { node: { id: true, name: true, label: true } },
          },
        },
      },
    },
  })) as {
    objects?: {
      edges?: {
        node?: {
          nameSingular?: string;
          fields?: { edges?: { node?: { id?: string; name?: string; label?: string } }[] };
        };
      }[];
    };
  };

  const fieldsByObject = new Map<string, Map<string, { id: string; label: string }>>();

  for (const edge of found.objects?.edges ?? []) {
    if (edge.node?.nameSingular === undefined) {
      continue;
    }

    const byName = new Map<string, { id: string; label: string }>();

    for (const fieldEdge of edge.node.fields?.edges ?? []) {
      if (fieldEdge.node?.name !== undefined && fieldEdge.node.id !== undefined) {
        byName.set(fieldEdge.node.name, {
          id: fieldEdge.node.id,
          label: fieldEdge.node.label ?? '',
        });
      }
    }

    fieldsByObject.set(edge.node.nameSingular, byName);
  }

  for (const relabel of FIELD_RELABELS) {
    const target = fieldsByObject
      .get(relabel.objectNameSingular)
      ?.get(relabel.fieldName);

    if (target === undefined) {
      fieldRelabelErrors.push(
        `${relabel.objectNameSingular}.${relabel.fieldName}: not found`,
      );
      continue;
    }

    if (target.label === relabel.label) {
      continue;
    }

    try {
      await client.mutation({
        updateOneField: {
          __args: {
            input: { id: target.id, update: { label: relabel.label, icon: relabel.icon } },
          },
          id: true,
        },
      });
      fieldsRelabelled.push(
        `${relabel.objectNameSingular}.${relabel.fieldName} -> ${relabel.label}`,
      );
    } catch (caught) {
      fieldRelabelErrors.push(
        `${relabel.objectNameSingular}.${relabel.fieldName}: ${caught instanceof Error ? caught.message : String(caught)}`,
      );
    }
  }

  return { fieldsRelabelled, fieldRelabelErrors };
};

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

type ViewRow = {
  id?: string;
  objectMetadataId?: string;
  key?: string | null;
  type?: string | null;
};
type ViewFieldRow = {
  id?: string;
  fieldMetadataId?: string;
  position?: number;
  isVisible?: boolean;
  viewFieldGroupId?: string | null;
};
type ViewFieldGroupRow = { id?: string; name?: string };
type ObjectRow = {
  id?: string;
  nameSingular?: string;
  fields?: { edges?: { node?: { id?: string; name?: string } }[] };
};

// Placement cannot be declared in the manifest. Creating a field makes the
// engine create its view field too, at the identifier a declaration would have
// to reuse, and the two creates collide (RESERVED_SYSTEM_UNIVERSAL_IDENTIFIER)
// in an atomic plan that then never converges. Applying it here instead runs
// after the sync, when the rows exist and this is an update.
//
// Everything is resolved by name against the server. The compiled identifier
// constants are not usable here: MEASURED, they reach a bundled logic function
// as non-strings, and matching on nameSingular is the rule anyway.
const applyFieldPlacements = async (): Promise<{
  moved: number;
  placementErrors: string[];
}> => {
  const client = new MetadataApiClient();
  const placementErrors: string[] = [];
  let moved = 0;

  const objectsResult = (await client.query({
    objects: {
      __args: { paging: { first: 200 }, filter: {} },
      edges: {
        node: {
          id: true,
          nameSingular: true,
          fields: {
            __args: { paging: { first: 200 }, filter: {} },
            edges: { node: { id: true, name: true } },
          },
        },
      },
    },
  })) as { objects?: { edges?: { node?: ObjectRow }[] } };

  const objectByName = new Map<string, { id: string; fieldIdByName: Map<string, string> }>();

  for (const edge of objectsResult.objects?.edges ?? []) {
    const node = edge.node;

    if (node?.nameSingular === undefined || node.id === undefined) {
      continue;
    }

    const fieldIdByName = new Map<string, string>();

    for (const fieldEdge of node.fields?.edges ?? []) {
      if (fieldEdge.node?.name !== undefined && fieldEdge.node.id !== undefined) {
        fieldIdByName.set(fieldEdge.node.name, fieldEdge.node.id);
      }
    }

    objectByName.set(node.nameSingular, { id: node.id, fieldIdByName });
  }

  const viewsResult = (await client.query({
    getViews: { id: true, objectMetadataId: true, key: true, type: true },
  })) as { getViews?: ViewRow[] };

  // ViewKey only has INDEX, so the record page carries no key and is identified
  // by its type instead (`compute-system-view-to-create.util.ts:31`).
  const viewIdByObjectAndKey = new Map<string, string>();

  for (const view of viewsResult.getViews ?? []) {
    if (view.id === undefined || view.objectMetadataId === undefined) {
      continue;
    }

    if (view.key === 'INDEX') {
      viewIdByObjectAndKey.set(`${view.objectMetadataId}:INDEX`, view.id);
    }

    if (view.type === 'FIELDS_WIDGET') {
      viewIdByObjectAndKey.set(`${view.objectMetadataId}:FIELDS_WIDGET`, view.id);
    }
  }

  const viewIdsNeeded = new Set<string>();
  const resolved: {
    viewId: string;
    fieldMetadataId: string;
    groupName?: string;
    position: number;
    label: string;
  }[] = [];

  for (const placement of FIELD_PLACEMENTS) {
    const label = `${placement.objectNameSingular}.${placement.fieldName} (${placement.viewKey})`;
    const object = objectByName.get(placement.objectNameSingular);

    if (object === undefined) {
      placementErrors.push(`${label}: object not found`);
      continue;
    }

    const fieldMetadataId = object.fieldIdByName.get(placement.fieldName);

    if (fieldMetadataId === undefined) {
      placementErrors.push(`${label}: field not found`);
      continue;
    }

    const viewId = viewIdByObjectAndKey.get(`${object.id}:${placement.viewKey}`);

    if (viewId === undefined) {
      placementErrors.push(`${label}: view not found`);
      continue;
    }

    viewIdsNeeded.add(viewId);
    resolved.push({
      viewId,
      fieldMetadataId,
      position: placement.position,
      label,
      ...(placement.groupName !== undefined ? { groupName: placement.groupName } : {}),
    });
  }

  const viewFieldsByViewId = new Map<string, Map<string, ViewFieldRow>>();
  const groupIdsByViewId = new Map<string, Map<string, string>>();

  for (const viewId of viewIdsNeeded) {
    const fieldsResult = (await client.query({
      getViewFields: {
        __args: { viewId },
        id: true,
        fieldMetadataId: true,
        position: true,
        isVisible: true,
        viewFieldGroupId: true,
      },
    })) as { getViewFields?: ViewFieldRow[] };

    const byFieldMetadataId = new Map<string, ViewFieldRow>();

    for (const viewField of fieldsResult.getViewFields ?? []) {
      if (viewField.fieldMetadataId !== undefined) {
        byFieldMetadataId.set(viewField.fieldMetadataId, viewField);
      }
    }

    viewFieldsByViewId.set(viewId, byFieldMetadataId);

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

    groupIdsByViewId.set(viewId, groupIdByName);
  }

  for (const placement of resolved) {
    const viewField = viewFieldsByViewId
      .get(placement.viewId)
      ?.get(placement.fieldMetadataId);

    if (viewField?.id === undefined) {
      placementErrors.push(`${placement.label}: no view field on this view`);
      continue;
    }

    const viewFieldGroupId =
      placement.groupName !== undefined
        ? (groupIdsByViewId.get(placement.viewId)?.get(placement.groupName) ?? null)
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
        `${placement.label}: ${caught instanceof Error ? caught.message : String(caught)}`,
      );
    }
  }

  return { moved, placementErrors };
};

const handler = async () => {
  const { relabelled, errors } = await relabelStandardObjects();
  const { fieldsRelabelled, fieldRelabelErrors } = await relabelStandardFields();

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
    fieldsRelabelled,
    fieldRelabelErrors,
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
