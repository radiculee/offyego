import { booleanPointInPolygon } from '@turf/boolean-point-in-polygon';
import { point, polygon } from '@turf/helpers';
import { isInsideRoiBbox } from './geo';

// TODO: REPLACE WITH REAL POLYGON.
// Source the Republic of Ireland boundary from Natural Earth or OSM
// (ISO3166-1:IE), simplify on https://mapshaper.org to ~50-100 points,
// then drop the coordinate array in here. GeoJSON order is [lng, lat].
//
// Current value is a hand-drawn 15-point approximation that excludes
// Northern Ireland well enough for development. Verify against the test
// suite (Dublin/Cork/Galway -> true, Belfast/London/Paris -> false).
const irelandPolygon = polygon([
  [
    [-8.5, 55.4], // NW Donegal
    [-8.8, 54.8], // Sligo coast
    [-10.2, 53.9], // Mayo coast
    [-10.2, 52.6], // SW Kerry
    [-10.0, 51.4], // Mizen Head (SW tip)
    [-8.5, 51.4], // Cork coast
    [-6.4, 51.95], // Wexford
    [-6.0, 52.85], // Wicklow coast
    [-6.0, 53.45], // Dublin Bay (extended east to cover coastal mobile GPS)
    [-6.05, 54.0], // Carlingford (NI border, east)
    [-6.4, 54.2], // border south of Newry
    [-7.3, 54.25], // border (Monaghan/Fermanagh)
    [-7.85, 54.4], // SE Donegal (Cavan/Leitrim triple point)
    [-7.45, 54.65], // Donegal/Tyrone border (inland)
    [-7.45, 55.15], // Donegal/Tyrone border (north, west of Derry)
    [-7.1, 55.4], // Malin Head (NE Donegal tip)
    [-8.5, 55.4], // close polygon
  ],
]);

export function isInIreland(lat: number, lng: number): boolean {
  if (!isInsideRoiBbox(lat, lng)) return false;
  return booleanPointInPolygon(point([lng, lat]), irelandPolygon);
}
