import { type WorkLogDraft } from 'src/api/work-logs';

// Split out of the component so what gets written can be tested without a
// renderer. Minutes are held as the raw input text, not a number: an empty box
// and a zero are different answers, and parsing on every keystroke fights the
// person typing.
export const WORK_LOG_STATUSES = [
  { value: 'NOT_STARTED', label: 'Not started' },
  { value: 'IN_PROGRESS', label: 'In progress' },
  { value: 'DONE', label: 'Done' },
  { value: 'POSTPONED', label: 'Postponed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export type Line = WorkLogDraft & {
  key: string;
  status: string;
  minutesText: string;
};

export const SOURCE_LABELS: Record<WorkLogDraft['source'], string> = {
  BOOKING: 'Appointment',
  DEADLINE: 'Deadline',
  CONVERSATION: 'Messages',
  OWN: '',
};

export const isDerived = (line: Line): boolean => line.source !== 'OWN';

export const today = (): string => new Date().toISOString().slice(0, 10);

export const blankLine = (): Line => ({
  key: `own-${Date.now()}-${Math.random()}`,
  description: '',
  notes: '',
  minutes: null,
  minutesText: '',
  status: 'IN_PROGRESS',
  matterId: null,
  bookingId: null,
  personId: null,
  billingEntityId: null,
  practiceAreaId: null,
  source: 'OWN',
});

export const toLine = (draft: WorkLogDraft, index: number): Line => ({
  ...draft,
  key: `draft-${index}`,
  minutesText: draft.minutes === null ? '' : String(draft.minutes),
  // A deadline the system saw completed is finished by definition; the rest
  // of a day is usually another push at something still running.
  status: draft.source === 'DEADLINE' ? 'DONE' : 'IN_PROGRESS',
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
