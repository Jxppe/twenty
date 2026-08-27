// Deliberately free of SDK imports. The compiled STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS
// constants do not survive into a bundled logic function: MEASURED, every view
// identifier read as a non-string that serialised to null. Everything here is a
// name the server also knows, resolved against it at run time.
export type FieldPlacement = {
  objectNameSingular: string;
  viewKey: 'INDEX' | 'FIELDS_WIDGET';
  fieldName: string;
  groupName?: string;
  position: number;
};

// Twenty's own columns sit at 0, 1, 2 in each group of the record page and
// belong to another application, so they cannot be moved. Position is a double
// and that view is exempt from the label-identifier position rules, so a
// negative position puts ours above them instead.
//
// On an index view the name is at 0 and the next column at 1, so 0.5 lands
// between them without disturbing anything.
export const FIELD_PLACEMENTS: FieldPlacement[] = [
  { objectNameSingular: 'opportunity', viewKey: 'FIELDS_WIDGET', fieldName: 'practiceArea', groupName: 'Deal', position: -3 },
  { objectNameSingular: 'opportunity', viewKey: 'FIELDS_WIDGET', fieldName: 'billingEntity', groupName: 'Deal', position: -2 },
  { objectNameSingular: 'opportunity', viewKey: 'FIELDS_WIDGET', fieldName: 'openedAt', groupName: 'Deal', position: -1 },
  { objectNameSingular: 'opportunity', viewKey: 'FIELDS_WIDGET', fieldName: 'closedAt', groupName: 'Deal', position: 3 },
  { objectNameSingular: 'opportunity', viewKey: 'FIELDS_WIDGET', fieldName: 'matterDeadlines', groupName: 'Relations', position: -3 },
  { objectNameSingular: 'opportunity', viewKey: 'FIELDS_WIDGET', fieldName: 'requiredDocuments', groupName: 'Relations', position: -2 },
  { objectNameSingular: 'opportunity', viewKey: 'FIELDS_WIDGET', fieldName: 'bookings', groupName: 'Relations', position: -1 },

  // The record page shows the label identifier in its title rather than as a
  // field, so the first slot of the first group sits directly under the name.
  { objectNameSingular: 'person', viewKey: 'FIELDS_WIDGET', fieldName: 'nameTh', groupName: 'General', position: -1 },
  { objectNameSingular: 'person', viewKey: 'INDEX', fieldName: 'nameTh', position: 0.5 },
  { objectNameSingular: 'company', viewKey: 'FIELDS_WIDGET', fieldName: 'nameTh', groupName: 'General', position: -1 },
  { objectNameSingular: 'company', viewKey: 'INDEX', fieldName: 'nameTh', position: 0.5 },
];
