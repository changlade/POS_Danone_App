import React, { useState } from 'react';
import './App.css';
import MapComponent from './components/MapComponent';
import FilterPanel from './components/FilterPanel';
import { POSData } from './types/POSData';
import { generateSamplePOSData } from './data/sampleData';

function App() {
  const [allPOSData] = useState<POSData[]>(generateSamplePOSData());
  const [filteredPOSData, setFilteredPOSData] = useState<POSData[]>(allPOSData);
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
          <h1>Danone POS Analytics</h1>
          <p>Point of Sales Data Visualization across Europe</p>
        </div>
      </header>
      
      <div className="main-content">
        <FilterPanel 
          filters={filters}
          onFilterChange={handleFilterChange}
          posData={allPOSData}
        />
        <MapComponent posData={filteredPOSData} />
      </div>
    </div>
  );
}

export default App;
