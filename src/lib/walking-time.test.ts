import { describe, expect, it } from 'vitest';
import { approxWalkingMinutes, formatSliderWalkLabel } from './walking-time';

describe('approxWalkingMinutes', () => {
  it('1 km → 16 min', () => expect(approxWalkingMinutes(1)).toBe(16));
  it('2 km → 31 min', () => expect(approxWalkingMinutes(2)).toBe(31));
  it('3 km → 47 min', () => expect(approxWalkingMinutes(3)).toBe(47));
  it('0.5 km → 8 min', () => expect(approxWalkingMinutes(0.5)).toBe(8));
});

describe('formatSliderWalkLabel', () => {
  it('1 km → "16 min"', () => expect(formatSliderWalkLabel(1)).toBe('16 min'));
  it('2 km → "31 min"', () => expect(formatSliderWalkLabel(2)).toBe('31 min'));
  it('3 km → "45 min" (47 min rounds to nearest 5)', () =>
    expect(formatSliderWalkLabel(3)).toBe('45 min'));
  it('4 km → "over 1 hour" (62 min exceeds cap)', () =>
    expect(formatSliderWalkLabel(4)).toBe('over 1 hour'));
  it('5 km → "over 1 hour"', () => expect(formatSliderWalkLabel(5)).toBe('over 1 hour'));
  it('10 km → "over 1 hour"', () => expect(formatSliderWalkLabel(10)).toBe('over 1 hour'));
});
