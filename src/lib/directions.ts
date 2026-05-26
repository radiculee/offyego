import { logger } from './logger';

const DIRECTIONS_TIMEOUT_MS = 2500;
const MIN_WALKING_MINUTES = 5;

export type DirectionsResult =
  | { kind: 'success'; walkingMinutes: number }
  | { kind: 'fallback'; walkingMinutes: number; reason: 'timeout' | 'error' | 'rate-limit' | 'no-route' };

export async function fetchWalkingMinutes(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
  fallbackMinutes: number,
): Promise<DirectionsResult> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) {
    logger.error('NEXT_PUBLIC_MAPBOX_TOKEN is not set');
    return { kind: 'fallback', walkingMinutes: fallbackMinutes, reason: 'error' };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DIRECTIONS_TIMEOUT_MS);

  // Mapbox uses lng,lat ordering — not lat,lng.
  const url =
    `https://api.mapbox.com/directions/v5/mapbox/walking/` +
    `${from.lng},${from.lat};${to.lng},${to.lat}` +
    `?access_token=${token}&overview=false&alternatives=false`;

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);

    if (response.status === 429) {
      logger.error('Mapbox Directions rate limited');
      return { kind: 'fallback', walkingMinutes: fallbackMinutes, reason: 'rate-limit' };
    }

    if (!response.ok) {
      logger.error(`Mapbox Directions HTTP ${response.status}`);
      return { kind: 'fallback', walkingMinutes: fallbackMinutes, reason: 'error' };
    }

    const data = (await response.json()) as unknown;
    const routes = (data as { routes?: unknown[] })?.routes;

    if (!Array.isArray(routes) || routes.length === 0) {
      return { kind: 'fallback', walkingMinutes: fallbackMinutes, reason: 'no-route' };
    }

    const duration = (routes[0] as { duration?: unknown })?.duration;
    if (typeof duration !== 'number') {
      return { kind: 'fallback', walkingMinutes: fallbackMinutes, reason: 'no-route' };
    }

    const minutes = Math.max(MIN_WALKING_MINUTES, Math.round(duration / 60));
    return { kind: 'success', walkingMinutes: minutes };
  } catch (err) {
    clearTimeout(timer);
    if (err instanceof Error && err.name === 'AbortError') {
      return { kind: 'fallback', walkingMinutes: fallbackMinutes, reason: 'timeout' };
    }
    logger.error('Mapbox Directions fetch failed:', err);
    return { kind: 'fallback', walkingMinutes: fallbackMinutes, reason: 'error' };
  }
}
