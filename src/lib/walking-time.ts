/**
 * Approximate walking minutes for a straight-line radius distance.
 * Uses 5 km/h pace and a 1.3 urban detour multiplier.
 * For accurate point-to-point time, use the Mapbox Directions API
 * (see src/lib/directions.ts).
 */
export function approxWalkingMinutes(km: number): number {
  return Math.round(km * 15.6);
}

/**
 * Format walking minutes for display on the radius slider label.
 * Rounds aggressively at high values to avoid false precision.
 * Caps very long walks at "over 1 hour" for readability.
 */
export function formatSliderWalkLabel(km: number): string {
  const minutes = approxWalkingMinutes(km);
  if (minutes >= 60) return 'over 1 hour';
  if (minutes >= 40) return `${Math.round(minutes / 5) * 5} min`;
  return `${minutes} min`;
}
