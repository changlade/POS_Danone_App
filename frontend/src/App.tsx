import React, { useState, useEffect } from 'react';
import './App.css';
import MapComponent from './components/MapComponent';
import FilterPanel from './components/FilterPanel';
import AnalyticsDashboard from './components/AnalyticsDashboard';

import { POSData, ScoutFilters, BusinessStatus } from './types/POSData';
import { generateSamplePOSData } from './data/sampleData';

function App() {
  const [allPOSData, setAllPOSData] = useState<POSData[]>([]);
  const [filteredPOSData, setFilteredPOSData] = useState<POSData[]>([]);
  const [initialPOSData, setInitialPOSData] = useState<POSData[]>([]); // Track initial load for comparison
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true); // Track if this is the first load
  const [activeTab, setActiveTab] = useState<'map' | 'analytics'>('map');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'database' | 'sample'>('database');
  const [filters, setFilters] = useState<ScoutFilters>({
    danoneScoutsOnly: false,
    productFamilies: [],
    businessTypes: [],
    salesVolumeRange: [0, 1000000]
  });

  // Function to compare businesses and determine status
  const determineBusinessStatus = (currentData: POSData[], initialData: POSData[]): POSData[] => {
    if (isInitialLoad || initialData.length === 0) {
      // First load - mark all as initial
      return currentData.map(business => ({
        ...business,
        status: 'initial' as BusinessStatus
      }));
    }

    // Create lookup maps for efficient comparison
    const initialBusinessMap = new Map(initialData.map(b => [b.id, b]));
    
    return currentData.map(currentBusiness => {
      const initialBusiness = initialBusinessMap.get(currentBusiness.id);
      
      if (!initialBusiness) {
        // New business - not in initial data
        return {
          ...currentBusiness,
          status: 'new' as BusinessStatus
        };
      }
      
      // Check if business has been updated
      const isUpdated = (
        // Check if last_photo_date changed
        currentBusiness.submissionData?.last_updated !== initialBusiness.submissionData?.last_updated ||
        // Check if menu_items changed (basic length comparison)
        (currentBusiness.submissionData?.menu_items?.length || 0) !== (initialBusiness.submissionData?.menu_items?.length || 0) ||
        // Check if points earned changed
        currentBusiness.submissionData?.points_earned !== initialBusiness.submissionData?.points_earned ||
        // Check if detected products changed
        (currentBusiness.submissionData?.detected_products?.length || 0) !== (initialBusiness.submissionData?.detected_products?.length || 0)
      );
      
      return {
        ...currentBusiness,
        status: isUpdated ? 'updated' as BusinessStatus : 'initial' as BusinessStatus
      };
    });
  };

  // Function to fetch POS data from the backend
  const fetchPOSData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/pos-submissions');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.status === 'success' && result.data) {
        // Combine database data with sample data for demo purposes
        const sampleData = generateSamplePOSData();
        const rawCombinedData = [...result.data, ...sampleData];
        
        // Determine business status by comparing with initial data
        const dataWithStatus = determineBusinessStatus(rawCombinedData, initialPOSData);
        
        // If this is the initial load, store it as the baseline for future comparisons
        if (isInitialLoad) {
          setInitialPOSData(dataWithStatus);
          setIsInitialLoad(false);
        }
        
        setAllPOSData(dataWithStatus);
        setFilteredPOSData(dataWithStatus);
        setDataSource('database');
        
        // Count new and updated businesses for logging
        const newBusinesses = dataWithStatus.filter(b => b.status === 'new').length;
        const updatedBusinesses = dataWithStatus.filter(b => b.status === 'updated').length;
        const totalDbData = result.data.length;
        
        console.log(`Loaded ${totalDbData} database + ${sampleData.length} sample locations`);
        if (!isInitialLoad && (newBusinesses > 0 || updatedBusinesses > 0)) {
          console.log(`📊 Changes detected: ${newBusinesses} new, ${updatedBusinesses} updated businesses`);
        }
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Failed to fetch POS data from database:', error);
      setError(`Failed to load data from database: ${error}`);
      
      // Fallback to sample data only
      console.log('Falling back to sample data');
      const sampleData = generateSamplePOSData();
      
      // Determine status for sample data as well
      const sampleDataWithStatus = determineBusinessStatus(sampleData, initialPOSData);
      
      // If this is the initial load, store sample data as baseline
      if (isInitialLoad) {
        setInitialPOSData(sampleDataWithStatus);
        setIsInitialLoad(false);
      }
      
      setAllPOSData(sampleDataWithStatus);
      setFilteredPOSData(sampleDataWithStatus);
      setDataSource('sample');
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchPOSData();
  }, []);

  const handleFilterChange = (newFilters: ScoutFilters) => {
    setFilters(newFilters);
    
    let filtered = [...allPOSData];

    // First, apply the "Danone Scouts Only" filter
    // This distinguishes between database data and sample data
    if (newFilters.danoneScoutsOnly) {
      filtered = filtered.filter(pos => 
        // Database data should have IDs starting with "biz_" (from businesses table)
        // Sample data has IDs like "pos_1", "pos_2", etc.
        pos.id.startsWith('biz_') || 
        // Or check if it has real database characteristics
        (pos.submissionData?.menu_items && pos.submissionData.menu_items.length > 0)
      );
    }
    
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
              <h1>Danone Scouts</h1>
              <p>Field Intelligence from Danone Scouts across Europe</p>
              <div className="data-status">
                {isLoading && <span className="status-indicator loading">Loading data...</span>}
                {error && <span className="status-indicator error">⚠️ {dataSource === 'sample' ? 'Using sample data' : 'Error loading data'}</span>}
                {!isLoading && !error && dataSource === 'database' && (
                  <span className="status-indicator success">
                    ✅ Live data ({allPOSData.length} locations)
                    {!isInitialLoad && (
                      <>
                        {allPOSData.filter(b => b.status === 'new').length > 0 && (
                          <span className="change-indicator new"> • {allPOSData.filter(b => b.status === 'new').length} new</span>
                        )}
                        {allPOSData.filter(b => b.status === 'updated').length > 0 && (
                          <span className="change-indicator updated"> • {allPOSData.filter(b => b.status === 'updated').length} updated</span>
                        )}
                      </>
                    )}
                  </span>
                )}
                {!isLoading && !error && dataSource === 'sample' && (
                  <span className="status-indicator sample">📊 Sample data ({allPOSData.length} locations)</span>
                )}
                <button 
                  className="refresh-button" 
                  onClick={fetchPOSData} 
                  disabled={isLoading}
                  title="Refresh data from database"
                >
                  🔄 {isLoading ? 'Loading...' : 'Refresh'}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="tab-navigation">
          <button
            className={`tab-button ${activeTab === 'map' ? 'active' : ''}`}
            onClick={() => setActiveTab('map')}
          >
            🗺️ Scout Map
          </button>
          <button
            className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            📊 Scout Analytics
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
            <MapComponent 
              posData={filteredPOSData} 
              onRefresh={fetchPOSData}
              isLoading={isLoading}
            />
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
