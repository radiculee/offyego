import {
  MAX_PUBS_IN_MEMORY,
  OVERPASS_CACHE_COORD_DP,
  OVERPASS_CLIENT_TIMEOUT_MS,
  OVERPASS_QUERY_TIMEOUT_S,
} from '@/constants/config';
import type { Pub } from '@/types/pub';
import { haversineMeters, walkingMinutes } from './geo';

type OverpassNode = {
  type: 'node';
  id: number;
  lat: number;
  lon: number;
  tags?: {
    name?: string;
    amenity?: 'pub' | 'bar';
    'addr:street'?: string;
    'addr:city'?: string;
  };
};

const UNNAMED_FALLBACK = 'Unnamed (probably grand)';

/**
 * The query string doubles as the server's cache key, so raw GPS coordinates
 * would defeat caching entirely: every reading jitters in the last decimals and
 * would miss. Snapping the search centre to a ~110m grid means repeat spins and
 * nearby users collapse onto one upstream call, which is what keeps us inside
 * the per-IP Overpass quota. Distances are still measured from the caller's
 * true position in parseOverpassResponse, so the displayed walk is unaffected.
 */
function snapCoord(value: number): number {
  return Number(value.toFixed(OVERPASS_CACHE_COORD_DP));
}

export function buildQuery(lat: number, lng: number, radiusM: number): string {
  const originLat = snapCoord(lat);
  const originLng = snapCoord(lng);
  // One anchored-regex statement rather than a union of two exact matches: it
  // resolves the expensive `around` lookup once instead of twice, which halves
  // the work we ask of a quota we are already straining. Verified byte-identical
  // against the two-statement form on live data (96 elements, matching id sum).
  return `[out:json][timeout:${OVERPASS_QUERY_TIMEOUT_S}];
node["amenity"~"^(pub|bar)$"](around:${radiusM},${originLat},${originLng});
out body;`;
}

export function parseOverpassResponse(
  raw: unknown,
  origin: { lat: number; lng: number },
): Pub[] {
  if (!raw || typeof raw !== 'object' || !('elements' in raw)) return [];
  const elements = (raw as { elements: unknown }).elements;
  if (!Array.isArray(elements)) return [];

  const pubs: Pub[] = [];
  for (const el of elements as OverpassNode[]) {
    if (el?.type !== 'node') continue;
    if (typeof el.lat !== 'number' || typeof el.lon !== 'number') continue;
    if (typeof el.id !== 'number') continue;
    const distanceMeters = haversineMeters(origin.lat, origin.lng, el.lat, el.lon);
    pubs.push({
      id: el.id,
      name: el.tags?.name ?? UNNAMED_FALLBACK,
      lat: el.lat,
      lng: el.lon,
      distanceMeters,
      walkingMinutes: walkingMinutes(distanceMeters),
      walkingTimeIsEstimate: true,
    });
  }
  return pubs.slice(0, MAX_PUBS_IN_MEMORY);
}

export async function fetchPubs(params: {
  lat: number;
  lng: number;
  radiusM: number;
}): Promise<Pub[]> {
  const { lat, lng, radiusM } = params;
  const query = buildQuery(lat, lng, radiusM);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), OVERPASS_CLIENT_TIMEOUT_MS);
  try {
    const response = await fetch('/api/overpass', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Overpass proxy HTTP ${response.status}`);
    const raw: unknown = await response.json();
    // Defence in depth: the route rejects `remark` payloads already, but if one
    // ever reaches here it must throw rather than parse. A remark response
    // carries `elements: []`, which would otherwise render as "no pubs round
    // here" - telling the user their area is dry when the server just failed.
    const remark = (raw as { remark?: unknown } | null)?.remark;
    if (typeof remark === 'string' && remark.length > 0) {
      throw new Error(`Overpass remark: ${remark.slice(0, 120)}`);
    }
    return parseOverpassResponse(raw, { lat, lng });
  } finally {
    clearTimeout(timer);
    controller.abort();
  }
}
