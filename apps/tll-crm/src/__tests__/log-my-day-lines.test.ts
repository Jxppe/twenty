import {
  blankLine,
  idOf,
  isSaveable,
  isUnmatched,
  labelOf,
  minutesOf,
  toLine,
} from 'src/front-components/log-my-day-lines';
import { describe, expect, it } from 'vitest';

const draft = {
  description: 'Consultation with Khun Somchai',
  notes: '',
  minutes: 45,
  matterId: null,
  bookingId: null,
  personId: null,
  billingEntityId: null,
  practiceAreaId: null,
  source: 'BOOKING' as const,
};

const CLIENTS = [
  { id: 'person-1', label: 'Martin Manning' },
  { id: 'person-2', label: 'Wallop Srisai' },
];

const JOBS = [
  { id: 'job-1', label: 'Land transfer, Jomtien', clientId: 'person-2' },
];

describe('what a day of work logs saves', () => {
  it('should carry a derived line through ready to save', () => {
    const line = toLine(draft, 0);

    expect(line.minutesText).toBe('45');
    expect(isSaveable(line)).toBe(true);
  });

  it('should still save a line nobody put minutes on', () => {
    const line = toLine({ ...draft, minutes: null }, 0);

    expect(line.minutesText).toBe('');
    expect(isSaveable(line)).toBe(true);
  });

  it('should leave out the blank line at the bottom of the form', () => {
    expect(isSaveable(blankLine())).toBe(false);
  });

  it('should leave out a line with minutes but nothing said', () => {
    expect(isSaveable({ ...toLine(draft, 0), description: '   ' })).toBe(false);
  });

  it('should show the names a derived line already carries', () => {
    const line = toLine({ ...draft, personId: 'person-2' }, 0, CLIENTS, JOBS);

    expect(line.clientText).toBe('Wallop Srisai');
    expect(line.jobText).toBe('');
  });

  it('should match a typed name back to its record, ignoring case and space', () => {
    expect(idOf(CLIENTS, '  martin manning ')).toBe('person-1');
    expect(idOf(JOBS, 'Land transfer, Jomtien')).toBe('job-1');
  });

  it('should call out a typed name that matches no record', () => {
    expect(isUnmatched(CLIENTS, 'Somebody Else')).toBe(true);
    expect(isUnmatched(CLIENTS, 'Martin Manning')).toBe(false);
    // An empty box is not an error, it is just empty.
    expect(isUnmatched(CLIENTS, '   ')).toBe(false);
  });

  it('should send nothing rather than guess at a name it does not know', () => {
    expect(idOf(CLIENTS, 'Somebody Else')).toBe(null);
    expect(idOf(CLIENTS, '')).toBe(null);
    expect(labelOf(CLIENTS, null)).toBe('');
  });

  it('should read zero and nonsense as no answer rather than as a number', () => {
    expect(minutesOf({ ...toLine(draft, 0), minutesText: '0' })).toBe(0);
    expect(minutesOf({ ...toLine(draft, 0), minutesText: '-5' })).toBe(0);
    expect(minutesOf({ ...toLine(draft, 0), minutesText: 'soon' })).toBe(0);
    expect(minutesOf({ ...toLine(draft, 0), minutesText: '90' })).toBe(90);
  });
});
