'use client';

import 'leaflet-defaulticon-compatibility';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import { MAP_ZOOM } from '@/constants/config';

type Props = {
  lat: number;
  lng: number;
};

export default function PubMap({ lat, lng }: Props) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={MAP_ZOOM}
      scrollWheelZoom={false}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url={`https://api.mapbox.com/styles/v1/mapbox/outdoors-v12/tiles/{z}/{x}/{y}?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`}
      />
      <Marker position={[lat, lng]} />
    </MapContainer>
  );
}
