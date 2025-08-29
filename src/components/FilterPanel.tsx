import React, { useState, useEffect } from 'react';
import { POSData } from '../types/POSData';
import { PRODUCT_FAMILIES, BUSINESS_TYPES } from '../data/sampleData';
import './FilterPanel.css';

interface FilterPanelProps {
  filters: {
    productFamilies: string[];
    businessTypes: string[];
    salesVolumeRange: [number, number];
  };
  onFilterChange: (filters: {
    productFamilies: string[];
    businessTypes: string[];
    salesVolumeRange: [number, number];
  }) => void;
  posData: POSData[];
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFilterChange, posData }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [maxSalesVolume, setMaxSalesVolume] = useState(1000000);

  useEffect(() => {
    if (posData.length > 0) {
      const max = Math.max(...posData.map(pos => pos.salesVolume));
      setMaxSalesVolume(max);
    }
  }, [posData]);

  const handleProductFamilyChange = (family: string, checked: boolean) => {
    const newFamilies = checked
      ? [...filters.productFamilies, family]
      : filters.productFamilies.filter(f => f !== family);
    
    onFilterChange({
      ...filters,
      productFamilies: newFamilies
    });
  };

  const handleBusinessTypeChange = (type: string, checked: boolean) => {
    const newTypes = checked
      ? [...filters.businessTypes, type]
      : filters.businessTypes.filter(t => t !== type);
    
    onFilterChange({
      ...filters,
      businessTypes: newTypes
    });
  };

  const handleVolumeRangeChange = (value: string, isMax: boolean) => {
    const numValue = parseInt(value);
    const newRange: [number, number] = isMax
      ? [filters.salesVolumeRange[0], numValue]
      : [numValue, filters.salesVolumeRange[1]];
    
    onFilterChange({
      ...filters,
      salesVolumeRange: newRange
    });
  };

  const clearAllFilters = () => {
    onFilterChange({
      productFamilies: [],
      businessTypes: [],
      salesVolumeRange: [0, maxSalesVolume]
    });
  };

  const formatVolumeValue = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
  };

  return (
    <div className={`filter-panel ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="filter-header">
        <h2>Filters</h2>
        <button
          className="collapse-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? '▶' : '◀'}
        </button>
      </div>

      {!isCollapsed && (
        <div className="filter-content">
          <div className="filter-actions">
            <button className="clear-filters-btn" onClick={clearAllFilters}>
              Clear All Filters
            </button>
          </div>

          <div className="filter-section">
            <h3>Product Families</h3>
            <div className="checkbox-group">
              {PRODUCT_FAMILIES.map(family => (
                <label key={family} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={filters.productFamilies.includes(family)}
                    onChange={(e) => handleProductFamilyChange(family, e.target.checked)}
                  />
                  <span className="checkbox-text">{family}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h3>Business Types</h3>
            <div className="checkbox-group">
              {BUSINESS_TYPES.map(type => (
                <label key={type} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={filters.businessTypes.includes(type)}
                    onChange={(e) => handleBusinessTypeChange(type, e.target.checked)}
                  />
                  <span className="checkbox-text">{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h3>Sales Volume Range</h3>
            <div className="volume-range">
              <div className="range-inputs">
                <div className="range-input-group">
                  <label>Min: €{formatVolumeValue(filters.salesVolumeRange[0])}</label>
                  <input
                    type="range"
                    min="0"
                    max={maxSalesVolume}
                    step="10000"
                    value={filters.salesVolumeRange[0]}
                    onChange={(e) => handleVolumeRangeChange(e.target.value, false)}
                    className="range-slider"
                  />
                </div>
                <div className="range-input-group">
                  <label>Max: €{formatVolumeValue(filters.salesVolumeRange[1])}</label>
                  <input
                    type="range"
                    min="0"
                    max={maxSalesVolume}
                    step="10000"
                    value={filters.salesVolumeRange[1]}
                    onChange={(e) => handleVolumeRangeChange(e.target.value, true)}
                    className="range-slider"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
