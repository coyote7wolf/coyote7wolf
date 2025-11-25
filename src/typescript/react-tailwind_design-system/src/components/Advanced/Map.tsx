import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export interface MapProps {
  marker?: [number, number]; // [lat, lng]
  area?: Array<[number, number]>; // polygon area
  interactive?: boolean;
  layer?: React.ReactNode;
  height?: number | string;
  zoom?: number;
  className?: string;
}

/**
 * Map component using react-leaflet
 */
export const Map: React.FC<MapProps> = ({
  marker = [25.033964, 121.564468],
  area,
  interactive = true,
  layer,
  height = 320,
  zoom = 13,
  className = '',
}) => {
  return (
    <div style={{ height, width: '100%' }} className={className}>
      <MapContainer
        center={marker}
        zoom={zoom}
        scrollWheelZoom={interactive}
        style={{
          height: '100%',
          width: '100%',
          borderRadius: 12,
          boxShadow: '0 2px 8px #0001',
        }}
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="OpenStreetMap">
            <TileLayer
              attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
          {layer && (
            <LayersControl.Overlay checked name="Custom Layer">
              {layer}
            </LayersControl.Overlay>
          )}
        </LayersControl>
        {marker && (
          <Marker position={marker}>
            <Popup>
              Marker: [{marker[0]}, {marker[1]}]
            </Popup>
          </Marker>
        )}
        {area && area.length > 2 && (
          <Polygon positions={area} pathOptions={{ color: '#2563eb', fillOpacity: 0.2 }} />
        )}
      </MapContainer>
    </div>
  );
};
