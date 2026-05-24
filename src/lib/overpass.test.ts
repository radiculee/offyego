import { describe, expect, it } from 'vitest';
import { parseOverpassResponse } from './overpass';

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
});
