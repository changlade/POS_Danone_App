import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { POSData } from '../types/POSData';
import './MapComponent.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapComponentProps {
  posData: POSData[];
}

const MapComponent: React.FC<MapComponentProps> = ({ posData }) => {
  // Center the map on Europe
  const centerLat = 54.5260;
  const centerLng = 15.2551;

  const formatSalesVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `€${(volume / 1000000).toFixed(1)}M`;
    } else if (volume >= 1000) {
      return `€${(volume / 1000).toFixed(0)}K`;
    }
    return `€${volume}`;
  };

  // Create custom icons based on business type
  const getMarkerIcon = (businessType: string) => {
    let color = '#007cba'; // Default Danone blue
    
    switch (businessType) {
      case 'Hypermarket':
        color = '#e60026'; // Red
        break;
      case 'Supermarket':
        color = '#00a651'; // Green
        break;
      case 'Convenience Store':
        color = '#ff6600'; // Orange
        break;
      case 'Pharmacy':
        color = '#8e44ad'; // Purple
        break;
      case 'Baby Store':
        color = '#f39c12'; // Yellow-orange
        break;
      case 'Health Food Store':
        color = '#27ae60'; // Dark green
        break;
      case 'Online Retailer':
        color = '#34495e'; // Dark gray
        break;
      default:
        color = '#007cba';
    }

    return new L.Icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(`
        <svg width="25" height="41" viewBox="0 0 25 41" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.5 0C5.596 0 0 5.596 0 12.5C0 19.404 12.5 41 12.5 41C12.5 41 25 19.404 25 12.5C25 5.596 19.404 0 12.5 0Z" fill="${color}"/>
          <circle cx="12.5" cy="12.5" r="8" fill="white"/>
        </svg>
      `)}`,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });
  };

  return (
    <div className="map-container">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={4}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {posData.map((pos) => (
          <Marker
            key={pos.id}
            position={[pos.latitude, pos.longitude]}
            icon={getMarkerIcon(pos.businessType)}
          >
            <Popup>
              <div className="popup-content">
                <h3>{pos.name}</h3>
                <p><strong>Type:</strong> {pos.businessType}</p>
                <p><strong>Location:</strong> {pos.city}, {pos.country}</p>
                <p><strong>Address:</strong> {pos.address}</p>
                <p><strong>Sales Volume:</strong> {formatSalesVolume(pos.salesVolume)}</p>
                <p><strong>Product Families:</strong></p>
                <ul>
                  {pos.productFamilies.map((family, index) => (
                    <li key={index}>{family}</li>
                  ))}
                </ul>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      <div className="map-stats">
        <div className="stat-item">
          <span className="stat-value">{posData.length}</span>
          <span className="stat-label">Active POS</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">
            {formatSalesVolume(posData.reduce((sum, pos) => sum + pos.salesVolume, 0))}
          </span>
          <span className="stat-label">Total Sales</span>
        </div>
      </div>
    </div>
  );
};

export default MapComponent;
