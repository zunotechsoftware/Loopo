'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet's default marker icon references image files by a relative path
// that bundlers (webpack/Turbopack) don't resolve the way a plain <img> tag
// would, so with no fix every marker silently renders as a broken image.
// This is a free, well-known, zero-config fix (standard with react-leaflet):
// load the icon images from the same CDN the library itself ships from,
// matching the installed version, instead of bundling them.
const DEFAULT_ICON = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface LocationPickerMapProps {
  lat: number;
  lng: number;
  radiusKm: number;
  onPick: (lat: number, lng: number) => void;
}

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

/** Recenters the map whenever the backing coordinates change from outside
 * the map itself (GPS detect, city pick, locality search) - react-leaflet
 * only sets the view once on mount otherwise. */
function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

export default function LocationPickerMap({ lat, lng, radiusKm, onPick }: LocationPickerMapProps) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={13}
      scrollWheelZoom
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker
        position={[lat, lng]}
        icon={DEFAULT_ICON}
        draggable
        eventHandlers={{
          dragend: (e) => {
            const marker = e.target as L.Marker;
            const pos = marker.getLatLng();
            onPick(pos.lat, pos.lng);
          },
        }}
      />
      <Circle
        center={[lat, lng]}
        radius={radiusKm * 1000}
        pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.1, weight: 2 }}
      />
      <ClickHandler onPick={onPick} />
      <Recenter lat={lat} lng={lng} />
    </MapContainer>
  );
}
