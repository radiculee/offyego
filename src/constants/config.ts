export const RADIUS_MIN_KM = 0.5;
export const RADIUS_MAX_KM = 10;
export const RADIUS_STEP_KM = 0.5;
export const RADIUS_DEFAULT_KM = 1;

export const GUILT_TRIP_THRESHOLD = 5;
export const MAX_PUBS_IN_MEMORY = 50;
export const MAP_ZOOM = 16;

export const OVERPASS_TIMEOUT_MS = 10_000;
export const OVERPASS_PRIMARY = 'https://overpass-api.de/api/interpreter';
export const OVERPASS_FALLBACK = 'https://overpass.kumi.systems/api/interpreter';

export const GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10_000,
  maximumAge: 60_000,
};
