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
      style={{ height: '200px', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[lat, lng]} />
    </MapContainer>
  );
}
