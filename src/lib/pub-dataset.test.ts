import { describe, expect, it } from 'vitest';
import dataset from '@/data/pubs.json';
import { MAX_PUBS_IN_MEMORY } from '@/constants/config';
import { ROI_BBOX, haversineMeters } from './geo';
import { isInIreland } from './ireland-polygon';
import { findPubsWithin } from './pub-dataset';

type PubRow = [number, string | null, number, number];
const rows = dataset.pubs as unknown as PubRow[];

const DUBLIN = { lat: 53.3498, lng: -6.2603 };
const MID_ATLANTIC = { lat: 53.35, lng: -20.0 };

/**
 * Guards the output of scripts/build-pub-dataset.mjs. The generator talks to a
 * rate-limited third party, so the realistic failure is not a crash but a
 * quietly partial file; these assertions are what stop that reaching users.
 */
describe('pubs.json integrity', () => {
  it('carries the whole country, not a partial fetch', () => {
    // Measured 5,232 on 2026-08-03. The floor matches the generator's own
    // refusal threshold, so a gutted dataset fails here too rather than
    // silently emptying whole regions of the map.
    expect(rows.length).toBeGreaterThan(4_500);
    expect(dataset.count).toBe(rows.length);
  });

  it('includes pubs mapped as ways and relations, not just nodes', () => {
    // The old live query asked for `node` only and so never saw the ~1,750
    // pubs mapped as building polygons. Type is encoded in the id offset.
    const ways = rows.filter((r) => r[0] >= 1e12 && r[0] < 2e12);
    const relations = rows.filter((r) => r[0] >= 2e12);
    expect(ways.length).toBeGreaterThan(1_000);
    expect(relations.length).toBeGreaterThan(0);
  });

  it('has unique ids across the three OSM types', () => {
    // OSM ids are only unique per type; node 123 and way 123 both exist.
    expect(new Set(rows.map((r) => r[0])).size).toBe(rows.length);
  });

  it('has finite coordinates inside the ROI bounding box', () => {
    for (const [, , lat, lng] of rows) {
      expect(Number.isFinite(lat)).toBe(true);
      expect(Number.isFinite(lng)).toBe(true);
      expect(lat).toBeGreaterThanOrEqual(ROI_BBOX.south);
      expect(lat).toBeLessThanOrEqual(ROI_BBOX.north);
      expect(lng).toBeGreaterThanOrEqual(ROI_BBOX.west);
      expect(lng).toBeLessThanOrEqual(ROI_BBOX.east);
    }
  });

  it('excludes Northern Ireland, which is the brand rule', () => {
    // Direct regression test on the generator's `area["ISO3166-1"="IE"]`
    // filter: if that were ever loosened to GB or dropped, the North's pubs
    // would flood in and these two city centres would light up first.
    // Verified against OSM on 2026-08-03: of 654 pub/bar entries inside the
    // UK boundary within our bounding box, zero appear in this dataset.
    const NI_CITIES = [
      { name: 'Belfast', lat: 54.5973, lng: -5.9301 },
      { name: 'Derry', lat: 54.9966, lng: -7.3086 },
      { name: 'Newry', lat: 54.1751, lng: -6.3402 },
    ];
    for (const city of NI_CITIES) {
      const near = rows.filter(
        ([, , lat, lng]) => haversineMeters(city.lat, city.lng, lat, lng) < 5_000,
      );
      expect(near, `${city.name} should have no pubs in an ROI-only dataset`).toEqual([]);
    }
  });

  it('is mostly inside the Natural Earth polygon the app gates users with', () => {
    // Deliberately not 100%. The dataset comes from OSM's precise ISO3166-1=IE
    // administrative boundary, while isInIreland() uses Natural Earth 1:10m,
    // whose coastline is far coarser and omits small islands entirely. 192 of
    // 5,232 real pubs (3.7%) fall outside it - Cobh, Dingle, Howth, Skerries,
    // Cape Clear, the Aran Islands. This threshold catches gross breakage (a
    // wrong country, shifted coordinates) while tolerating that known coarseness.
    // See the coastal-gating flag: those same locations are places the app
    // currently refuses to admit users from.
    const inside = rows.filter(([, , lat, lng]) => isInIreland(lat, lng));
    expect(inside.length / rows.length).toBeGreaterThan(0.95);
  });

  it('names every pub or marks it explicitly unnamed', () => {
    for (const [, name] of rows) {
      expect(name === null || (typeof name === 'string' && name.length > 0)).toBe(true);
    }
  });

  it('is sorted by id so refresh diffs stay reviewable', () => {
    const ids = rows.map((r) => r[0]);
    expect(ids).toEqual([...ids].sort((a, b) => a - b));
  });
});

describe('findPubsWithin', () => {
  it('finds pubs in Dublin', async () => {
    const pubs = await findPubsWithin({ ...DUBLIN, radiusM: 1_000 });
    expect(pubs.length).toBeGreaterThan(0);
    // Asserted against the raw dataset, not the returned page: central Dublin
    // holds far more than the cap, so any individual pub may legitimately be
    // absent from a given random sample.
    expect(rows.some(([, name]) => name === 'The Temple')).toBe(true);
  });

  it('returns nothing in the middle of the Atlantic', async () => {
    expect(await findPubsWithin({ ...MID_ATLANTIC, radiusM: 10_000 })).toEqual([]);
  });

  it('never returns a pub beyond the requested radius', async () => {
    const radiusM = 800;
    const pubs = await findPubsWithin({ ...DUBLIN, radiusM });
    expect(pubs.length).toBeGreaterThan(0);
    for (const pub of pubs) {
      expect(pub.distanceMeters).toBeLessThanOrEqual(radiusM);
      // Distance must come from the caller's exact position, not a rounded or
      // snapped centre, since it drives the walk time shown on the card.
      expect(pub.distanceMeters).toBeCloseTo(
        haversineMeters(DUBLIN.lat, DUBLIN.lng, pub.lat, pub.lng),
        6,
      );
    }
  });

  it('widening the radius can only add pubs', async () => {
    const near = await findPubsWithin({ ...DUBLIN, radiusM: 500 });
    const far = await findPubsWithin({ ...DUBLIN, radiusM: 3_000 });
    expect(far.length).toBeGreaterThanOrEqual(near.length);
  });

  it('respects the memory cap', async () => {
    const pubs = await findPubsWithin({ ...DUBLIN, radiusM: 10_000 });
    expect(pubs.length).toBe(MAX_PUBS_IN_MEMORY);
  });

  it('samples the cap uniformly instead of truncating by id', async () => {
    // The old code sliced the first 50 of an id-ordered list, so a dense area
    // always produced the same low-numbered pubs. Over repeated draws we
    // should see far more distinct pubs than a single capped page holds.
    const seen = new Set<number>();
    for (let i = 0; i < 12; i += 1) {
      for (const pub of await findPubsWithin({ ...DUBLIN, radiusM: 10_000 })) {
        seen.add(pub.id);
      }
    }
    expect(seen.size).toBeGreaterThan(MAX_PUBS_IN_MEMORY * 2);
  });

  it('applies the unnamed fallback rather than leaking null into the UI', async () => {
    const pubs = await findPubsWithin({ ...DUBLIN, radiusM: 10_000 });
    for (const pub of pubs) expect(pub.name.length).toBeGreaterThan(0);
  });

  it('gives every pub a walking estimate flagged as an estimate', async () => {
    const pubs = await findPubsWithin({ ...DUBLIN, radiusM: 1_000 });
    for (const pub of pubs) {
      // Minimum 5 minutes, per walkingMinutes() in geo.ts.
      expect(pub.walkingMinutes).toBeGreaterThanOrEqual(5);
      expect(pub.walkingTimeIsEstimate).toBe(true);
    }
  });
});
