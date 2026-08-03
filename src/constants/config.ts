export const RADIUS_MIN_KM = 0.5;
export const RADIUS_MAX_KM = 10;
export const RADIUS_STEP_KM = 0.5;
export const RADIUS_DEFAULT_KM = 1;

export const GUILT_TRIP_THRESHOLD = 5;
export const MAP_ZOOM = 16;

/**
 * Upper bound on pubs held for one spin. Applied as a uniform random sample in
 * lib/pub-dataset.ts, never as a truncation: taking the "first" N of an
 * id-ordered list would bias dense areas toward the oldest-mapped pubs.
 *
 * There is no Overpass config here any more. The per-IP slot quota made live
 * querying fail about a third of the time, so the data is now generated at
 * build time by scripts/build-pub-dataset.mjs; mirrors and retry policy live
 * in that script.
 */
export const MAX_PUBS_IN_MEMORY = 50;

export const REVOLUT_URL = 'https://revolut.me/vedant9ipt';
export const DRINKAWARE_URL = 'https://www.drinkaware.ie';

export const GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10_000,
  maximumAge: 60_000,
};
