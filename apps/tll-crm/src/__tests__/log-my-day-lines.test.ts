import {
  blankLine,
  isSaveable,
  minutesOf,
  toLine,
} from 'src/front-components/log-my-day-lines';
import { describe, expect, it } from 'vitest';

const draft = {
  description: 'Consultation with Khun Somchai',
  minutes: 45,
  isBillable: true,
  matterId: null,
  bookingId: null,
  personId: null,
  billingEntityId: null,
  source: 'BOOKING' as const,
};

describe('what a day of work logs saves', () => {
  it('should carry a derived line through ready to save', () => {
    const line = toLine(draft, 0);

    expect(line.minutesText).toBe('45');
    expect(isSaveable(line)).toBe(true);
  });

  it('should leave out a line nobody put minutes on', () => {
    const line = toLine({ ...draft, minutes: null }, 0);

    expect(line.minutesText).toBe('');
    expect(isSaveable(line)).toBe(false);
  });

  it('should leave out the blank line at the bottom of the form', () => {
    expect(isSaveable(blankLine())).toBe(false);
  });

  it('should leave out a line with minutes but nothing said', () => {
    expect(isSaveable({ ...toLine(draft, 0), description: '   ' })).toBe(false);
  });

  it('should read zero and nonsense as no answer rather than as a number', () => {
    expect(minutesOf({ ...toLine(draft, 0), minutesText: '0' })).toBe(0);
    expect(minutesOf({ ...toLine(draft, 0), minutesText: '-5' })).toBe(0);
    expect(minutesOf({ ...toLine(draft, 0), minutesText: 'soon' })).toBe(0);
    expect(minutesOf({ ...toLine(draft, 0), minutesText: '90' })).toBe(90);
  });
});
