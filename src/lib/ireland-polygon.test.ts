import { describe, expect, it } from 'vitest';
import { isInIreland } from './ireland-polygon';

describe('isInIreland — Republic of Ireland cities (should be true)', () => {
  it('Dublin is inside', () => {
    expect(isInIreland(53.3498, -6.2603)).toBe(true);
  });
  it('Cork is inside', () => {
    expect(isInIreland(51.8985, -8.4756)).toBe(true);
  });
  it('Galway is inside', () => {
    expect(isInIreland(53.2707, -9.0568)).toBe(true);
  });
  it('Limerick is inside', () => {
    expect(isInIreland(52.6638, -8.6267)).toBe(true);
  });
  it('Waterford is inside', () => {
    expect(isInIreland(52.2593, -7.1101)).toBe(true);
  });
  it('Sligo is inside', () => {
    expect(isInIreland(54.2766, -8.4761)).toBe(true);
  });
  it('Letterkenny (Donegal) is inside', () => {
    expect(isInIreland(54.9558, -7.7339)).toBe(true);
  });
});

describe('isInIreland — outside the Republic (should be false)', () => {
  it('Belfast (NI) is outside', () => {
    expect(isInIreland(54.5973, -5.9301)).toBe(false);
  });
  it('Derry/Londonderry (NI) is outside', () => {
    expect(isInIreland(54.9966, -7.3086)).toBe(false);
  });
  it('Newry (NI) is outside', () => {
    expect(isInIreland(54.1751, -6.3402)).toBe(false);
  });
  it('London is outside', () => {
    expect(isInIreland(51.5074, -0.1278)).toBe(false);
  });
  it('Paris is outside', () => {
    expect(isInIreland(48.8566, 2.3522)).toBe(false);
  });
  it('New York is outside', () => {
    expect(isInIreland(40.7128, -74.006)).toBe(false);
  });
  it('Edinburgh is outside', () => {
    expect(isInIreland(55.9533, -3.1883)).toBe(false);
  });
});
