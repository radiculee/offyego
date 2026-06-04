import { describe, expect, it } from 'vitest';
import { computeSettleDelayMs, MIN_SPIN_MS } from './spin-timing';

describe('computeSettleDelayMs', () => {
  it('returns the full floor when Overpass returns instantly', () => {
    expect(computeSettleDelayMs({ elapsedMs: 0, reducedMotion: false })).toBe(
      MIN_SPIN_MS,
    );
  });

  it('returns the remaining time toward the floor for a mid-spin return', () => {
    expect(computeSettleDelayMs({ elapsedMs: 300, reducedMotion: false })).toBe(
      MIN_SPIN_MS - 300,
    );
  });

  it('returns 0 when the floor has already elapsed (slow Overpass)', () => {
    expect(
      computeSettleDelayMs({ elapsedMs: MIN_SPIN_MS, reducedMotion: false }),
    ).toBe(0);
  });

  it('clamps to 0 and never goes negative past the floor', () => {
    expect(computeSettleDelayMs({ elapsedMs: 5000, reducedMotion: false })).toBe(
      0,
    );
  });

  it('suspends the floor entirely under reduced motion', () => {
    expect(computeSettleDelayMs({ elapsedMs: 0, reducedMotion: true })).toBe(0);
    expect(computeSettleDelayMs({ elapsedMs: 800, reducedMotion: true })).toBe(
      0,
    );
  });
});
