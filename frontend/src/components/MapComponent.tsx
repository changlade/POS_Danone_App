import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { POSData, BusinessStatus } from '../types/POSData';
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
  onRefresh?: () => void;
  isLoading?: boolean;
}

const MapComponent: React.FC<MapComponentProps> = ({ posData, onRefresh, isLoading }) => {
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

  // Create custom icons based on business type and status
  const getMarkerIcon = (businessType: string, status?: BusinessStatus) => {
    let color = '#007cba'; // Default Danone blue
    
    // Status colors take priority over business type colors
    if (status === 'new') {
      color = '#10b981'; // Bright green for new businesses
    } else if (status === 'updated') {
      color = '#f59e0b'; // Bright orange/amber for updated businesses
    } else {
      // Use business type colors for initial/unchanged businesses
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
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        
        {posData.map((pos) => (
          <Marker
            key={pos.id}
            position={[pos.latitude, pos.longitude]}
            icon={getMarkerIcon(pos.businessType, pos.status)}
          >
            <Popup>
              <div className="popup-content">
                <h3>{pos.name}</h3>
                {pos.status && pos.status !== 'initial' && (
                  <div className={`business-status ${pos.status}`}>
                    {pos.status === 'new' && '🆕 New Business'}
                    {pos.status === 'updated' && '🔄 Recently Updated'}
                  </div>
                )}
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
                {pos.submissionData && (
                  <div className="submission-info">
                    <hr />
                    <p><strong>🕵️ Scout Intelligence:</strong></p>
                    {pos.submissionData.user_name && (
                      <p><strong>👤 Scout:</strong> {pos.submissionData.user_name}</p>
                    )}
                    {pos.submissionData.points_earned && (
                      <p><strong>⭐ Points Earned:</strong> {pos.submissionData.points_earned}</p>
                    )}
                    {pos.submissionData.is_danone_customer !== undefined && (
                      <p><strong>🎯 Danone Customer:</strong> {pos.submissionData.is_danone_customer ? '✅ Yes' : '❌ No'}</p>
                    )}
                    {pos.submissionData.last_updated && (
                      <p><strong>📅 Last Photo:</strong> {new Date(pos.submissionData.last_updated).toLocaleDateString()}</p>
                    )}
                    {pos.submissionData.menu_items && pos.submissionData.menu_items.length > 0 && (
                      <div>
                        <p><strong>🛒 Danone Products Available:</strong></p>
                        <div className="menu-items-list">
                          {pos.submissionData.menu_items.slice(0, 5).map((item: any, idx: number) => (
                            <div key={idx} className="menu-item">
                              <div className="product-info">
                                <span className="product-name">{item.productName}</span>
                                <span className="product-size">({item.size})</span>
                              </div>
                              <div className="product-details">
                                <span className="product-price">{item.detectedPrice}</span>
                                <span className="product-confidence">
                                  {Math.round(item.confidence * 100)}% confidence
                                </span>
                              </div>
                              {item.timesDetected > 1 && (
                                <div className="detection-count">
                                  🔍 Detected {item.timesDetected} times
                                </div>
                              )}
                            </div>
                          ))}
                          {pos.submissionData.menu_items.length > 5 && (
                            <p className="more-items">... and {pos.submissionData.menu_items.length - 5} more products</p>
                          )}
                        </div>
                      </div>
                    )}
                    {pos.submissionData.total_menu_items && (
                      <p><strong>📊 Total Products:</strong> {pos.submissionData.total_menu_items} Danone items detected</p>
                    )}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        )        )}
      </MapContainer>
      
      {/* Business Status Legend */}
      <div className="map-legend">
        <h4>Scout Intelligence Legend</h4>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-marker new"></div>
            <span>🆕 New Businesses</span>
          </div>
          <div className="legend-item">
            <div className="legend-marker updated"></div>
            <span>🔄 Recently Updated</span>
          </div>
          <div className="legend-item">
            <div className="legend-marker initial"></div>
            <span>📍 Existing Businesses</span>
          </div>
        </div>
        <div className="legend-note">
          <small>Colors show changes since initial load • Refresh to detect new updates</small>
        </div>
      </div>
      
      <div className="map-stats">
        <div className="stat-item">
          <span className="stat-value">{posData.length}</span>
          <span className="stat-label">Scout Reports</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">
            {Array.from(new Set(posData.map(pos => pos.submissionData?.user_name).filter(name => name))).length}
          </span>
          <span className="stat-label">Active Scouts</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">
            {posData.reduce((sum, pos) => sum + (pos.submissionData?.points_earned || 0), 0)}
          </span>
          <span className="stat-label">Total Points</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">
            {formatSalesVolume(posData.reduce((sum, pos) => sum + pos.salesVolume, 0))}
          </span>
          <span className="stat-label">Sales Volume</span>
        </div>
        {onRefresh && (
          <div className="stat-item">
            <button 
              className="map-refresh-button"
              onClick={onRefresh}
              disabled={isLoading}
              title="Refresh scout data"
            >
              🔄 {isLoading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapComponent;
