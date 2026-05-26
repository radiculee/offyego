import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { fetchWalkingMinutes } from './directions';

beforeAll(() => {
  process.env.NEXT_PUBLIC_MAPBOX_TOKEN = 'test-token-do-not-use';
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const mockFrom = { lat: 53.3498, lng: -6.2603 };
const mockTo = { lat: 53.3440, lng: -6.2674 };
const FALLBACK = 10;

function mockResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as unknown as Response;
}

describe('fetchWalkingMinutes', () => {
  it('returns success with correct walking minutes on a valid response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      mockResponse(200, { routes: [{ duration: 600 }] }),
    ));
    const result = await fetchWalkingMinutes(mockFrom, mockTo, FALLBACK);
    expect(result.kind).toBe('success');
    expect(result.walkingMinutes).toBe(10);
  });

  it('enforces the 5-minute minimum on very short routes', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      mockResponse(200, { routes: [{ duration: 60 }] }),
    ));
    const result = await fetchWalkingMinutes(mockFrom, mockTo, FALLBACK);
    expect(result.kind).toBe('success');
    expect(result.walkingMinutes).toBe(5);
  });

  it('constructs the URL with lng,lat ordering (not lat,lng)', async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      mockResponse(200, { routes: [{ duration: 600 }] }),
    );
    vi.stubGlobal('fetch', mockFetch);
    await fetchWalkingMinutes(mockFrom, mockTo, FALLBACK);
    const calledUrl = mockFetch.mock.calls[0]?.[0] as string;
    // from: lng first
    expect(calledUrl).toContain(`${mockFrom.lng},${mockFrom.lat}`);
    // to: lng first
    expect(calledUrl).toContain(`${mockTo.lng},${mockTo.lat}`);
    expect(calledUrl).toContain('access_token=test-token-do-not-use');
  });

  it('returns fallback with no-route reason for an empty routes array', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      mockResponse(200, { routes: [] }),
    ));
    const result = await fetchWalkingMinutes(mockFrom, mockTo, FALLBACK);
    expect(result.kind).toBe('fallback');
    if (result.kind === 'fallback') {
      expect(result.reason).toBe('no-route');
      expect(result.walkingMinutes).toBe(FALLBACK);
    }
  });

  it('returns fallback with no-route reason when duration is missing', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      mockResponse(200, { routes: [{ geometry: 'irrelevant' }] }),
    ));
    const result = await fetchWalkingMinutes(mockFrom, mockTo, FALLBACK);
    expect(result.kind).toBe('fallback');
    if (result.kind === 'fallback') expect(result.reason).toBe('no-route');
  });

  it('returns fallback with rate-limit reason on HTTP 429', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      mockResponse(429, {}),
    ));
    const result = await fetchWalkingMinutes(mockFrom, mockTo, FALLBACK);
    expect(result.kind).toBe('fallback');
    if (result.kind === 'fallback') {
      expect(result.reason).toBe('rate-limit');
      expect(result.walkingMinutes).toBe(FALLBACK);
    }
  });

  it('returns fallback with error reason on HTTP 500', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      mockResponse(500, {}),
    ));
    const result = await fetchWalkingMinutes(mockFrom, mockTo, FALLBACK);
    expect(result.kind).toBe('fallback');
    if (result.kind === 'fallback') {
      expect(result.reason).toBe('error');
      expect(result.walkingMinutes).toBe(FALLBACK);
    }
  });

  it('returns fallback with timeout reason when the request is aborted', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn().mockImplementation((_url: string, opts: RequestInit) => {
      return new Promise<never>((_resolve, reject) => {
        opts.signal?.addEventListener('abort', () => {
          const err = new DOMException('The operation was aborted.', 'AbortError');
          reject(err);
        });
      });
    }));
    const promise = fetchWalkingMinutes(mockFrom, mockTo, FALLBACK);
    await vi.advanceTimersByTimeAsync(2500);
    const result = await promise;
    expect(result.kind).toBe('fallback');
    if (result.kind === 'fallback') {
      expect(result.reason).toBe('timeout');
      expect(result.walkingMinutes).toBe(FALLBACK);
    }
    vi.useRealTimers();
  });

  it('returns fallback with error reason on a network failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));
    const result = await fetchWalkingMinutes(mockFrom, mockTo, FALLBACK);
    expect(result.kind).toBe('fallback');
    if (result.kind === 'fallback') {
      expect(result.reason).toBe('error');
      expect(result.walkingMinutes).toBe(FALLBACK);
    }
  });
});
