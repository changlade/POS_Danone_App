import React, { useState } from 'react';
import './App.css';
import MapComponent from './components/MapComponent';
import FilterPanel from './components/FilterPanel';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import RecommendationsPanel from './components/RecommendationsPanel';
import { POSData } from './types/POSData';
import { generateSamplePOSData } from './data/sampleData';

function App() {
  const [allPOSData] = useState<POSData[]>(generateSamplePOSData());
  const [filteredPOSData, setFilteredPOSData] = useState<POSData[]>(allPOSData);
  const [activeTab, setActiveTab] = useState<'map' | 'analytics'>('map');
  const [filters, setFilters] = useState({
    productFamilies: [] as string[],
    businessTypes: [] as string[],
    salesVolumeRange: [0, 1000000] as [number, number]
  });

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    
    let filtered = allPOSData;
    
    // Filter by product families
    if (newFilters.productFamilies.length > 0) {
      filtered = filtered.filter(pos => 
        pos.productFamilies.some(family => 
          newFilters.productFamilies.includes(family)
        )
      );
    }
    
    // Filter by business types
    if (newFilters.businessTypes.length > 0) {
      filtered = filtered.filter(pos => 
        newFilters.businessTypes.includes(pos.businessType)
      );
    }
    
    // Filter by sales volume
    filtered = filtered.filter(pos => 
      pos.salesVolume >= newFilters.salesVolumeRange[0] && 
      pos.salesVolume <= newFilters.salesVolumeRange[1]
    );
    
    setFilteredPOSData(filtered);
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <div className="header-logo-section">
            <img src="/danone-logo.webp" alt="Danone Logo" className="danone-logo" />
            <div className="header-text">
              <h1>POS Analytics</h1>
              <p>Point of Sales Data Visualization across Europe</p>
            </div>
          </div>
        </div>
        <div className="tab-navigation">
          <button
            className={`tab-button ${activeTab === 'map' ? 'active' : ''}`}
            onClick={() => setActiveTab('map')}
          >
            🗺️ Map View
          </button>
          <button
            className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            📊 Analytics Dashboard
          </button>
        </div>
      </header>
      
      <div className="main-content">
        <FilterPanel 
          filters={filters}
          onFilterChange={handleFilterChange}
          posData={allPOSData}
        />
        
        {activeTab === 'map' ? (
          <div className="content-panel">
            <MapComponent posData={filteredPOSData} />
            <RecommendationsPanel posData={filteredPOSData} />
          </div>
        ) : (
          <AnalyticsDashboard 
            posData={filteredPOSData}
            allPosData={allPOSData}
          />
        )}
      </div>
    </div>
  );
}

export default App;
