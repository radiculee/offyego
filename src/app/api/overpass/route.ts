import { NextResponse } from 'next/server';
import { OVERPASS_MIRRORS, OVERPASS_TIMEOUT_MS } from '@/constants/config';

export const dynamic = 'force-dynamic';

async function fetchMirror(endpoint: string, query: string, signal: AbortSignal): Promise<unknown> {
  const res = await fetch(`${endpoint}?data=${encodeURIComponent(query)}`, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<unknown>;
}

export async function POST(request: Request): Promise<NextResponse> {
  const { query } = (await request.json()) as { query: string };
  const controllers = OVERPASS_MIRRORS.map(() => new AbortController());
  const timer = setTimeout(() => controllers.forEach(c => c.abort()), OVERPASS_TIMEOUT_MS);
  try {
    const raw = await Promise.any(
      OVERPASS_MIRRORS.map((endpoint, i) =>
        fetchMirror(endpoint, query, controllers[i]!.signal),
      ),
    );
    return NextResponse.json(raw);
  } catch {
    return NextResponse.json({ error: 'overpass_unavailable' }, { status: 503 });
  } finally {
    clearTimeout(timer);
    controllers.forEach(c => c.abort());
  }
}
