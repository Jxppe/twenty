import { type WorkLogDraft } from 'src/api/work-logs';

// Split out of the component so what gets written can be tested without a
// renderer. Minutes are held as the raw input text, not a number: an empty box
// and a zero are different answers, and parsing on every keystroke fights the
// person typing.
export type Line = WorkLogDraft & { key: string; minutesText: string };

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
  matterId: null,
  bookingId: null,
  personId: null,
  billingEntityId: null,
  source: 'DEADLINE',
});

export const toLine = (draft: WorkLogDraft, index: number): Line => ({
  ...draft,
  key: `draft-${index}`,
  minutesText: draft.minutes === null ? '' : String(draft.minutes),
});

export const minutesOf = (line: Line): number => {
  const parsed = Number.parseInt(line.minutesText, 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

// A derived line the person never answered is not a record of anything, so it
// is left out rather than written with a zero.
export const isSaveable = (line: Line): boolean =>
  line.description.trim() !== '' && minutesOf(line) > 0;
