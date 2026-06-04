/**
 * Spin timing coordination for the stout-pour animation.
 *
 * The spin ends when BOTH are true:
 *   (a) Overpass has returned the pub list, AND
 *   (b) at least MIN_SPIN_MS have elapsed since spin-start.
 *
 * MIN_SPIN_MS is the "brand moment" floor: without it, a fast Overpass
 * response would flash the glass and jump straight to the result. The floor
 * guarantees the user sees the stout settling at least once.
 *
 * For users with prefers-reduced-motion, the floor is suspended: the chosen
 * pub appears as soon as Overpass returns.
 */
export const MIN_SPIN_MS = 1500;

/**
 * Given how long the spin has already been running when Overpass returns,
 * how much longer should it keep spinning before settling on the chosen pub?
 *
 * - reduced motion: 0 (settle immediately, no brand floor)
 * - elapsed past the floor already: 0 (Overpass was the slow part; settle now)
 * - otherwise: the remaining time up to the floor
 */
export function computeSettleDelayMs({
  elapsedMs,
  reducedMotion,
}: {
  elapsedMs: number;
  reducedMotion: boolean;
}): number {
  if (reducedMotion) return 0;
  return Math.max(0, MIN_SPIN_MS - elapsedMs);
}
