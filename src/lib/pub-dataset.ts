import { MAX_PUBS_IN_MEMORY } from '@/constants/config';
import type { Pub } from '@/types/pub';
import { haversineMeters, walkingMinutes } from './geo';

/**
 * Replaces the old live Overpass call. Overpass enforces a per-IP slot quota
 * and Vercel serverless shares outbound IPs, so querying it on the user's
 * critical path failed roughly a third of the time. The whole country is only
 * ~5,200 rows, so it ships as a static asset instead and a spin resolves
 * locally. See scripts/build-pub-dataset.mjs for how the data is produced.
 */

/** [id, name (null when the pub is unnamed in OSM), lat, lng] */
type PubRow = [number, string | null, number, number];

const UNNAMED_FALLBACK = 'Unnamed (probably grand)';

let datasetPromise: Promise<readonly PubRow[]> | null = null;

/**
 * Dynamic import so the dataset becomes its own lazily-loaded, content-hashed
 * chunk: it stays out of the initial payload and is only fetched when the user
 * actually commits to a spin. The promise is memoised rather than the value so
 * concurrent callers share one load instead of racing two.
 */
function loadDataset(): Promise<readonly PubRow[]> {
  datasetPromise ??= import('@/data/pubs.json').then(
    (mod) => (mod.default as unknown as { pubs: PubRow[] }).pubs,
  );
  return datasetPromise;
}

/**
 * Starts the dataset download early, while the user is still choosing a radius,
 * so the spin itself never waits on it. Safe to call repeatedly: the promise is
 * memoised. Failures are swallowed deliberately - this is an optimisation, and
 * the real load in findPubsWithin is where an error belongs.
 */
export function prefetchPubDataset(): void {
  void loadDataset().catch(() => {});
}

/**
 * Uniform random sample of `size` items, via a partial Fisher-Yates shuffle.
 *
 * The cap exists to bound memory, but it used to be applied as `slice(0, 50)`
 * over Overpass's id-ordered output, which quietly biased every spin in a
 * dense area toward the oldest-mapped pubs. Sampling keeps the cap while
 * restoring the promise that any pub in range can come up.
 */
function randomSample<T>(items: readonly T[], size: number): T[] {
  if (items.length <= size) return [...items];
  const pool = [...items];
  for (let i = 0; i < size; i += 1) {
    const j = i + Math.floor(Math.random() * (pool.length - i));
    [pool[i], pool[j]] = [pool[j] as T, pool[i] as T];
  }
  return pool.slice(0, size);
}

/**
 * Every pub within `radiusM` of the caller, capped at MAX_PUBS_IN_MEMORY.
 * Distances are measured from the caller's exact position.
 */
export async function findPubsWithin(params: {
  lat: number;
  lng: number;
  radiusM: number;
}): Promise<Pub[]> {
  const { lat, lng, radiusM } = params;
  const rows = await loadDataset();

  // Degree-box reject before the trigonometry. One degree of latitude is
  // ~111km; longitude degrees shrink by cos(lat), and the guard keeps the
  // divisor away from zero so a pole-adjacent input cannot blow up the bound.
  const latDelta = radiusM / 111_320;
  const lngDelta = radiusM / Math.max(1, 111_320 * Math.cos((lat * Math.PI) / 180));

  const inRange: Pub[] = [];
  for (const [id, name, pubLat, pubLng] of rows) {
    if (Math.abs(pubLat - lat) > latDelta) continue;
    if (Math.abs(pubLng - lng) > lngDelta) continue;
    const distanceMeters = haversineMeters(lat, lng, pubLat, pubLng);
    if (distanceMeters > radiusM) continue;
    inRange.push({
      id,
      name: name ?? UNNAMED_FALLBACK,
      lat: pubLat,
      lng: pubLng,
      distanceMeters,
      // Haversine stays the estimate; the Mapbox Directions call in page.tsx
      // refines the walk for the one pub that actually gets picked.
      walkingMinutes: walkingMinutes(distanceMeters),
      walkingTimeIsEstimate: true,
    });
  }

  return randomSample(inRange, MAX_PUBS_IN_MEMORY);
}
