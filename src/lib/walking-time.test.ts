import { describe, expect, it } from 'vitest';
import { approxWalkingMinutes, formatSliderWalkLabel } from './walking-time';

describe('approxWalkingMinutes', () => {
  it('1 km → 16 min', () => expect(approxWalkingMinutes(1)).toBe(16));
  it('2 km → 31 min', () => expect(approxWalkingMinutes(2)).toBe(31));
  it('3 km → 47 min', () => expect(approxWalkingMinutes(3)).toBe(47));
  it('0.5 km → 8 min', () => expect(approxWalkingMinutes(0.5)).toBe(8));
});

describe('formatSliderWalkLabel', () => {
  it('1 km → "Within 16 min walk"', () =>
    expect(formatSliderWalkLabel(1)).toBe('Within 16 min walk'));
  it('2 km → "Within 31 min walk"', () =>
    expect(formatSliderWalkLabel(2)).toBe('Within 31 min walk'));
  it('3 km → "Within 45 min walk" (47 min rounds to nearest 5)', () =>
    expect(formatSliderWalkLabel(3)).toBe('Within 45 min walk'));
  it('4 km → "Over an hour walk" (62 min exceeds cap)', () =>
    expect(formatSliderWalkLabel(4)).toBe('Over an hour walk'));
  it('5 km → "Over an hour walk"', () =>
    expect(formatSliderWalkLabel(5)).toBe('Over an hour walk'));
  it('10 km → "Over an hour walk"', () =>
    expect(formatSliderWalkLabel(10)).toBe('Over an hour walk'));
});
