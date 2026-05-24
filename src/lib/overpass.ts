import {
  MAX_PUBS_IN_MEMORY,
  OVERPASS_FALLBACK,
  OVERPASS_PRIMARY,
  OVERPASS_TIMEOUT_MS,
} from '@/constants/config';
import type { Pub } from '@/types/pub';
import { haversineMeters, walkingMinutes } from './geo';
import { logger } from './logger';

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
    });
  }
  return pubs.slice(0, MAX_PUBS_IN_MEMORY);
}

async function fetchFromEndpoint(endpoint: string, query: string): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), OVERPASS_TIMEOUT_MS);
  try {
    const url = `${endpoint}?data=${encodeURIComponent(query)}`;
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Overpass HTTP ${response.status}`);
    }
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchPubs(params: {
  lat: number;
  lng: number;
  radiusM: number;
}): Promise<Pub[]> {
  const { lat, lng, radiusM } = params;
  const query = buildQuery(lat, lng, radiusM);
  try {
    const raw = await fetchFromEndpoint(OVERPASS_PRIMARY, query);
    return parseOverpassResponse(raw, { lat, lng });
  } catch (primaryErr) {
    logger.warn('Overpass primary failed, retrying fallback:', primaryErr);
    const raw = await fetchFromEndpoint(OVERPASS_FALLBACK, query);
    return parseOverpassResponse(raw, { lat, lng });
  }
}
