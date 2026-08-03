import { NextResponse } from 'next/server';
import {
  OVERPASS_CACHE_MAX_ENTRIES,
  OVERPASS_CACHE_TTL_MS,
  OVERPASS_MIRRORS,
  OVERPASS_MIRROR_TIMEOUT_MS,
  OVERPASS_TOTAL_TIMEOUT_MS,
} from '@/constants/config';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';
// Must exceed OVERPASS_TOTAL_TIMEOUT_MS or Vercel kills the function before our
// own budget expires and the caller gets a platform 504 instead of our 503.
export const maxDuration = 30;

/**
 * Overpass reports failure three different ways, and only one of them is an
 * HTTP error code:
 *   1. HTTP 429 + HTML  - per-IP slot quota exhausted
 *   2. HTTP 504 + HTML  - gateway gave up
 *   3. HTTP 200 + JSON containing `remark: "runtime error: ..."`
 * Case 3 is the dangerous one. It carries `elements: []`, so treating it as a
 * success turns a server fault into "no pubs round here" - a plausible-looking
 * lie that sends the user away thinking their area is empty.
 */
function assertUsableOverpassPayload(raw: unknown): void {
  if (!raw || typeof raw !== 'object') throw new Error('non-object payload');
  const remark = (raw as { remark?: unknown }).remark;
  if (typeof remark === 'string' && remark.length > 0) {
    throw new Error(`overpass remark: ${remark.slice(0, 120)}`);
  }
  if (!Array.isArray((raw as { elements?: unknown }).elements)) {
    throw new Error('payload has no elements array');
  }
}

async function fetchMirror(
  endpoint: string,
  query: string,
  parentSignal: AbortSignal,
): Promise<unknown> {
  // Per-mirror deadline layered under the route-wide one, so a mirror that
  // accepts the TLS handshake then hangs (kumi and private.coffee both do this
  // from some networks) cannot eat the entire budget and starve the others.
  const controller = new AbortController();
  const onParentAbort = () => controller.abort();
  parentSignal.addEventListener('abort', onParentAbort, { once: true });
  const timer = setTimeout(() => controller.abort(), OVERPASS_MIRROR_TIMEOUT_MS);
  try {
    const res = await fetch(`${endpoint}?data=${encodeURIComponent(query)}`, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'User-Agent': 'OffYeGo/1.0 (https://offyego.ie)',
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    // A rate-limit or runtime-error page can arrive under HTTP 200. Reading it
    // as JSON would throw a parse error that hides why it actually failed.
    const contentType = res.headers.get('content-type') ?? '';
    if (!contentType.includes('json')) {
      throw new Error(`non-JSON response (content-type: ${contentType || 'none'})`);
    }
    const raw: unknown = await res.json();
    assertUsableOverpassPayload(raw);
    return raw;
  } finally {
    clearTimeout(timer);
    parentSignal.removeEventListener('abort', onParentAbort);
  }
}

type CacheEntry = { expiresAt: number; payload: unknown };

// Module scope, so the map survives across invocations on a warm lambda and is
// dropped on a cold start. It is deliberately not a shared/global cache: it is
// here to shed load off the per-IP Overpass quota, and a best-effort local hit
// rate is enough for that. Repeat spins and "widen the search" from one user
// are the common case and they land on the same warm instance.
const cache = new Map<string, CacheEntry>();

function readCache(key: string): unknown | undefined {
  const hit = cache.get(key);
  if (!hit) return undefined;
  if (hit.expiresAt <= Date.now()) {
    cache.delete(key);
    return undefined;
  }
  // Refresh insertion order so eviction below is LRU rather than FIFO.
  cache.delete(key);
  cache.set(key, hit);
  return hit.payload;
}

function writeCache(key: string, payload: unknown): void {
  cache.delete(key);
  cache.set(key, { expiresAt: Date.now() + OVERPASS_CACHE_TTL_MS, payload });
  while (cache.size > OVERPASS_CACHE_MAX_ENTRIES) {
    const oldest = cache.keys().next();
    if (oldest.done) break;
    cache.delete(oldest.value);
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  let query: unknown;
  try {
    ({ query } = (await request.json()) as { query: unknown });
  } catch {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }
  if (typeof query !== 'string' || query.length === 0 || query.length > 2_000) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  const cached = readCache(query);
  if (cached !== undefined) {
    return NextResponse.json(cached, { headers: { 'x-offyego-cache': 'hit' } });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), OVERPASS_TOTAL_TIMEOUT_MS);
  const deadline = Date.now() + OVERPASS_TOTAL_TIMEOUT_MS;
  const failures: string[] = [];

  try {
    // Two rounds. Rate limiting is transient by nature: the quota frees up as
    // in-flight queries elsewhere finish, so a mirror that 429s now often
    // succeeds a moment later. Round two only runs if the budget allows it.
    for (let round = 0; round < 2; round += 1) {
      if (round > 0) {
        if (Date.now() + OVERPASS_MIRROR_TIMEOUT_MS > deadline) break;
        await new Promise((resolve) => setTimeout(resolve, 600));
      }
      try {
        return NextResponse.json(
          await Promise.any(
            OVERPASS_MIRRORS.map(async (endpoint) => {
              try {
                const raw = await fetchMirror(endpoint, query, controller.signal);
                writeCache(query, raw);
                return raw;
              } catch (err) {
                failures.push(`${endpoint}: ${(err as Error).message}`);
                throw err;
              }
            }),
          ),
          { headers: { 'x-offyego-cache': 'miss' } },
        );
      } catch {
        // Every mirror failed this round. Fall through to the retry, or out of
        // the loop to the 503 below.
      }
    }
    logger.error('Overpass unavailable on all mirrors:', failures);
    return NextResponse.json({ error: 'overpass_unavailable' }, { status: 503 });
  } finally {
    clearTimeout(timer);
    controller.abort();
  }
}
