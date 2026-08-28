import { type PickerOption, type WorkLogDraft } from 'src/api/work-logs';

// Split out of the component so what gets written can be tested without a
// renderer. Minutes are held as the raw input text, not a number: an empty box
// and a zero are different answers, and parsing on every keystroke fights the
// person typing.
export type Line = WorkLogDraft & {
  key: string;
  minutesText: string;
  clientText: string;
  jobText: string;
};

export const SOURCE_LABELS: Record<WorkLogDraft['source'], string> = {
  BOOKING: 'Appointment',
  DEADLINE: 'Deadline',
  CONVERSATION: 'Messages',
};

export const today = (): string => new Date().toISOString().slice(0, 10);

export const blankLine = (): Line => ({
  key: `own-${Date.now()}-${Math.random()}`,
  description: '',
  minutes: null,
  minutesText: '',
  clientText: '',
  jobText: '',
  matterId: null,
  bookingId: null,
  personId: null,
  billingEntityId: null,
  source: 'DEADLINE',
});

export const labelOf = (
  options: PickerOption[],
  id: string | null,
): string => options.find((option) => option.id === id)?.label ?? '';

// Names are matched back to ids case-insensitively on the exact label. Two
// clients with identical names resolve to whichever the API returned first,
// which is the price of a native `<input list>` over a hand-rolled combobox.
export const idOf = (options: PickerOption[], label: string): string | null => {
  const wanted = label.trim().toLowerCase();

  if (wanted === '') {
    return null;
  }

  return (
    options.find((option) => option.label.toLowerCase() === wanted)?.id ?? null
  );
};

export const toLine = (
  draft: WorkLogDraft,
  index: number,
  clients: PickerOption[] = [],
  jobs: PickerOption[] = [],
): Line => ({
  ...draft,
  key: `draft-${index}`,
  minutesText: draft.minutes === null ? '' : String(draft.minutes),
  clientText: labelOf(clients, draft.personId),
  jobText: labelOf(jobs, draft.matterId),
});

export const minutesOf = (line: Line): number => {
  const parsed = Number.parseInt(line.minutesText, 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

// What was done is the record. Minutes are optional because the sheet this
// replaces never had a duration column at all, and a form that refuses to save
// without one would be asking for something nobody has ever written down.
export const isSaveable = (line: Line): boolean =>
  line.description.trim() !== '';
