import { describe, expect, it } from 'vitest';
import { OVERPASS_QUERY_TIMEOUT_S } from '@/constants/config';
import { buildQuery, parseOverpassResponse } from './overpass';

const dublin = { lat: 53.3498, lng: -6.2603 };

describe('parseOverpassResponse', () => {
  it('returns [] for null', () => {
    expect(parseOverpassResponse(null, dublin)).toEqual([]);
  });

  it('returns [] for undefined', () => {
    expect(parseOverpassResponse(undefined, dublin)).toEqual([]);
  });

  it('returns [] when elements is not an array', () => {
    expect(parseOverpassResponse({ elements: 'bad' }, dublin)).toEqual([]);
  });

  it('returns [] when input is missing elements key', () => {
    expect(parseOverpassResponse({}, dublin)).toEqual([]);
  });

  it('parses a valid response into Pub[]', () => {
    const raw = {
      elements: [
        { type: 'node', id: 1, lat: 53.35, lon: -6.26, tags: { name: 'Bar A', amenity: 'pub' } },
        { type: 'node', id: 2, lat: 53.351, lon: -6.261, tags: { name: 'Bar B', amenity: 'bar' } },
      ],
    };
    const result = parseOverpassResponse(raw, dublin);
    expect(result).toHaveLength(2);
    expect(result[0]?.id).toBe(1);
    expect(result[0]?.name).toBe('Bar A');
    expect(result[0]?.lat).toBe(53.35);
    expect(result[0]?.lng).toBe(-6.26);
    expect(result[0]?.distanceMeters).toBeGreaterThan(0);
    expect(result[0]?.walkingMinutes).toBeGreaterThanOrEqual(5);
  });

  it('uses fallback name when name tag is missing', () => {
    const raw = {
      elements: [
        { type: 'node', id: 1, lat: 53.35, lon: -6.26, tags: { amenity: 'pub' } },
      ],
    };
    const result = parseOverpassResponse(raw, dublin);
    expect(result[0]?.name).toBe('Unnamed (probably grand)');
  });

  it('uses fallback name when tags object is missing', () => {
    const raw = {
      elements: [{ type: 'node', id: 1, lat: 53.35, lon: -6.26 }],
    };
    const result = parseOverpassResponse(raw, dublin);
    expect(result[0]?.name).toBe('Unnamed (probably grand)');
  });

  it('caps the result at 50 pubs (MAX_PUBS_IN_MEMORY)', () => {
    const elements = Array.from({ length: 75 }, (_, i) => ({
      type: 'node' as const,
      id: i,
      lat: 53.35,
      lon: -6.26,
      tags: { name: `Pub ${i}`, amenity: 'pub' as const },
    }));
    const result = parseOverpassResponse({ elements }, dublin);
    expect(result).toHaveLength(50);
  });

  it('skips non-node elements', () => {
    const raw = {
      elements: [
        { type: 'way', id: 99, lat: 53.35, lon: -6.26 },
        { type: 'node', id: 1, lat: 53.35, lon: -6.26, tags: { name: 'Real Pub' } },
      ],
    };
    const result = parseOverpassResponse(raw, dublin);
    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe('Real Pub');
  });

  it('skips nodes with non-numeric lat/lon', () => {
    const raw = {
      elements: [
        { type: 'node', id: 1, lat: 'broken', lon: -6.26, tags: { name: 'Bad' } },
        { type: 'node', id: 2, lat: 53.35, lon: -6.26, tags: { name: 'Good' } },
      ],
    };
    const result = parseOverpassResponse(raw, dublin);
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe(2);
  });

  it('measures distance from the caller position, not the snapped query centre', () => {
    // Node sits exactly on the snapped centre (53.35, -6.26). If distance were
    // measured from the snapped origin it would collapse to 0.
    const raw = { elements: [{ type: 'node', id: 1, lat: 53.35, lon: -6.26 }] };
    const result = parseOverpassResponse(raw, dublin);
    expect(result[0]?.distanceMeters).toBeGreaterThan(0);
  });
});

describe('buildQuery', () => {
  it('snaps the search centre to the cache grid so repeat spins share a key', () => {
    // Two GPS readings a few metres apart must produce a byte-identical query;
    // the query string is the server cache key that shields the Overpass quota.
    const a = buildQuery(53.349812, -6.260344, 1000);
    const b = buildQuery(53.349751, -6.260401, 1000);
    expect(a).toBe(b);
    expect(a).toContain('53.35');
    expect(a).toContain('-6.26');
  });

  it('keeps distinct locations on distinct cache keys', () => {
    expect(buildQuery(53.3498, -6.2603, 1000)).not.toBe(buildQuery(53.2707, -9.0568, 1000));
  });

  it('keeps distinct radii on distinct cache keys', () => {
    expect(buildQuery(53.3498, -6.2603, 1000)).not.toBe(buildQuery(53.3498, -6.2603, 2000));
  });

  it('requests both pubs and bars in a single anchored-regex statement', () => {
    const q = buildQuery(53.3498, -6.2603, 1000);
    expect(q).toContain('"amenity"~"^(pub|bar)$"');
    // Anchors matter: an unanchored regex would drag in amenity=public_bookcase
    // and anything else merely containing "bar".
    expect(q).toContain('^(');
    expect(q).toContain(')$');
    expect(q.match(/around:/g)).toHaveLength(1);
  });

  it('carries the configured Overpass-side timeout, not the old hardcoded 10s', () => {
    expect(buildQuery(53.3498, -6.2603, 1000)).toContain(
      `[timeout:${OVERPASS_QUERY_TIMEOUT_S}]`,
    );
  });
});
