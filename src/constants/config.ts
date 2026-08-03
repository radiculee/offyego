export const RADIUS_MIN_KM = 0.5;
export const RADIUS_MAX_KM = 10;
export const RADIUS_STEP_KM = 0.5;
export const RADIUS_DEFAULT_KM = 1;

export const GUILT_TRIP_THRESHOLD = 5;
export const MAX_PUBS_IN_MEMORY = 50;
export const MAP_ZOOM = 16;

// Overpass timeout budget. These three MUST stay ordered:
//   query timeout < per-mirror timeout < total server budget < client timeout.
// The old single 10s value was the launch bug: overpass-api.de queues requests
// when its per-IP slot quota is exhausted (see OVERPASS_MIRRORS below), so a
// perfectly healthy response routinely lands at 9-10s and the abort fired
// first, surfacing "the map server's down" on a server that was merely busy.

/** Value interpolated into `[timeout:N]` inside the query. Overpass-side budget. */
export const OVERPASS_QUERY_TIMEOUT_S = 20;
/** Per-mirror abort. A dead mirror costs this much and no more. */
export const OVERPASS_MIRROR_TIMEOUT_MS = 12_000;
/** Whole-route budget across all mirrors and the retry round. */
export const OVERPASS_TOTAL_TIMEOUT_MS = 25_000;
/** Client abort. Buffer over the total for the client→Vercel round-trip. */
export const OVERPASS_CLIENT_TIMEOUT_MS = OVERPASS_TOTAL_TIMEOUT_MS + 3_000;

// Overpass enforces a per-IP slot quota (overpass-api.de/api/status reports
// "Rate limit: 2"). Vercel serverless functions share outbound IPs across many
// customers, so we burn through that quota far faster than request volume alone
// suggests, and get HTTP 429 "Dispatcher_Client...rate_limited" back. Caching
// and mirror failover are both load-shedding measures against that quota, not
// nice-to-haves.
//
// Do NOT add a regional mirror here without checking it actually carries
// Ireland. overpass.osm.ch was trialled and rejected: it answers a Dublin
// query in 0.16s with `elements: []` because it only holds Swiss extracts.
// Being both fast and empty, it would win every race and report "no pubs"
// everywhere. A mirror is only valid here if it serves the full planet.
export const OVERPASS_MIRRORS: string[] = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
];

/** Rounds cache-key coordinates to ~110m so nearby spins share one upstream call. */
export const OVERPASS_CACHE_COORD_DP = 3;
export const OVERPASS_CACHE_TTL_MS = 15 * 60_000;
export const OVERPASS_CACHE_MAX_ENTRIES = 200;

export const REVOLUT_URL = 'https://revolut.me/vedant9ipt';
export const DRINKAWARE_URL = 'https://www.drinkaware.ie';

export const GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10_000,
  maximumAge: 60_000,
};
