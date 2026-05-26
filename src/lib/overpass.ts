import { MAX_PUBS_IN_MEMORY, OVERPASS_TIMEOUT_MS } from '@/constants/config';
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

function buildQuery(lat: number, lng: number, radiusM: number): string {
  return `[out:json][timeout:10];
(
  node["amenity"="pub"](around:${radiusM},${lat},${lng});
  node["amenity"="bar"](around:${radiusM},${lat},${lng});
);
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
  // 3s buffer over server-side timeout to account for client→Vercel round-trip
  const timer = setTimeout(() => controller.abort(), OVERPASS_TIMEOUT_MS + 3_000);
  try {
    const response = await fetch('/api/overpass', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Overpass proxy HTTP ${response.status}`);
    const raw: unknown = await response.json();
    return parseOverpassResponse(raw, { lat, lng });
  } finally {
    clearTimeout(timer);
    controller.abort();
  }
}
