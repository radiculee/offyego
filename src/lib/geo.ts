const EARTH_RADIUS_M = 6_371_000;
const WALKING_SPEED_KM_H = 5;
const MIN_WALKING_MINUTES = 5;

export const ROI_BBOX = {
  north: 55.45,
  south: 51.35,
  west: -10.7,
  east: -5.9,
} as const;

export function haversineMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(a));
}

export function walkingMinutes(distanceMeters: number): number {
  const distanceKm = distanceMeters / 1000;
  const minutes = Math.round((distanceKm / WALKING_SPEED_KM_H) * 60);
  return Math.max(MIN_WALKING_MINUTES, minutes);
}

export function isInsideRoiBbox(lat: number, lng: number): boolean {
  return (
    lat >= ROI_BBOX.south &&
    lat <= ROI_BBOX.north &&
    lng >= ROI_BBOX.west &&
    lng <= ROI_BBOX.east
  );
}
