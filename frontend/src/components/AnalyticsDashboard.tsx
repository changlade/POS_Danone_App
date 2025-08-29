import React, { useState, useEffect } from 'react';
import { POSData } from '../types/POSData';
import './AnalyticsDashboard.css';

interface AnalyticsData {
  revenue_by_country: Array<{ country: string; revenue: number; volume: number }>;
  sales_by_business_type: Array<{ type: string; sales: number; count: number; avg_sales: number }>;
  product_family_performance: Array<{ family: string; revenue: number; growth: number; market_share: number }>;
  monthly_trends: Array<{ month: string; revenue: number; volume: number }>;
  top_performers: Array<{ name: string; revenue: number; country: string; type: string }>;
  generated_at: string;
}

interface AnalyticsDashboardProps {
  posData: POSData[];
  allPosData: POSData[];
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ posData, allPosData }) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState<'country' | 'business' | 'products' | 'trends'>('country');

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/analytics');
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-EU').format(num);
  };

  const calculateFilteredMetrics = () => {
    const totalRevenue = posData.reduce((sum, pos) => sum + pos.salesVolume, 0);
    const totalLocations = posData.length;
    const avgRevenuePerLocation = totalLocations > 0 ? totalRevenue / totalLocations : 0;
    
    const countries = new Set(posData.map(pos => pos.country)).size;
    const businessTypes = new Set(posData.map(pos => pos.businessType)).size;
    
    return {
      totalRevenue,
      totalLocations,
      avgRevenuePerLocation,
      countries,
      businessTypes
    };
  };

  const renderBarChart = (data: any[], dataKey: string, nameKey: string, title: string, color: string = '#007cba') => {
    if (!data || data.length === 0) return null;

    const maxValue = Math.max(...data.map(item => item[dataKey]));
    
    return (
      <div className="chart-container">
        <h4>{title}</h4>
        <div className="bar-chart">
          {data.slice(0, 8).map((item, index) => (
            <div key={index} className="bar-item">
              <div className="bar-label">{item[nameKey]}</div>
              <div className="bar-wrapper">
                <div
                  className="bar"
                  style={{
                    width: `${(item[dataKey] / maxValue) * 100}%`,
                    backgroundColor: color
                  }}
                ></div>
                <span className="bar-value">
                  {dataKey.includes('revenue') || dataKey.includes('sales') 
                    ? formatCurrency(item[dataKey])
                    : formatNumber(item[dataKey])
                  }
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderLineChart = (data: any[], title: string) => {
    if (!data || data.length === 0) return null;

    const maxRevenue = Math.max(...data.map(item => item.revenue));
    const maxVolume = Math.max(...data.map(item => item.volume));

    return (
      <div className="chart-container">
        <h4>{title}</h4>
        <div className="line-chart">
          <div className="chart-legend">
            <span className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#007cba' }}></span>
              Revenue
            </span>
            <span className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#00a651' }}></span>
              Volume
            </span>
          </div>
          <div className="line-chart-grid">
            {data.map((item, index) => (
              <div key={index} className="line-point">
                <div className="month-label">{item.month}</div>
                <div className="line-bars">
                  <div
                    className="line-bar revenue-bar"
                    style={{ height: `${(item.revenue / maxRevenue) * 100}%` }}
                    title={`Revenue: ${formatCurrency(item.revenue)}`}
                  ></div>
                  <div
                    className="line-bar volume-bar"
                    style={{ height: `${(item.volume / maxVolume) * 100}%` }}
                    title={`Volume: ${formatNumber(item.volume)} units`}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const metrics = calculateFilteredMetrics();

  if (loading) {
    return (
      <div className="analytics-dashboard loading">
        <div className="loading-spinner"></div>
        <p>Loading analytics data...</p>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <h2>📊 Deep Dive Analytics</h2>
        <div className="chart-tabs">
          <button
            className={`chart-tab ${activeChart === 'country' ? 'active' : ''}`}
            onClick={() => setActiveChart('country')}
          >
            🌍 By Country
          </button>
          <button
            className={`chart-tab ${activeChart === 'business' ? 'active' : ''}`}
            onClick={() => setActiveChart('business')}
          >
            🏪 By Business Type
          </button>
          <button
            className={`chart-tab ${activeChart === 'products' ? 'active' : ''}`}
            onClick={() => setActiveChart('products')}
          >
            🥛 By Product Family
          </button>
          <button
            className={`chart-tab ${activeChart === 'trends' ? 'active' : ''}`}
            onClick={() => setActiveChart('trends')}
          >
            📈 Monthly Trends
          </button>
        </div>
      </div>

      <div className="analytics-metrics">
        <div className="metric-card">
          <div className="metric-value">{formatCurrency(metrics.totalRevenue)}</div>
          <div className="metric-label">Total Revenue (Filtered)</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{formatNumber(metrics.totalLocations)}</div>
          <div className="metric-label">Active Locations</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{formatCurrency(metrics.avgRevenuePerLocation)}</div>
          <div className="metric-label">Avg Revenue/Location</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{metrics.countries}</div>
          <div className="metric-label">Countries Covered</div>
        </div>
      </div>

      <div className="analytics-content">
        <div className="main-chart">
          {activeChart === 'country' && analyticsData && 
            renderBarChart(analyticsData.revenue_by_country, 'revenue', 'country', 'Revenue by Country', '#007cba')
          }
          {activeChart === 'business' && analyticsData && 
            renderBarChart(analyticsData.sales_by_business_type, 'sales', 'type', 'Sales by Business Type', '#00a651')
          }
          {activeChart === 'products' && analyticsData && 
            renderBarChart(analyticsData.product_family_performance, 'revenue', 'family', 'Revenue by Product Family', '#ff6600')
          }
          {activeChart === 'trends' && analyticsData && 
            renderLineChart(analyticsData.monthly_trends, 'Monthly Revenue & Volume Trends')
          }
        </div>

        <div className="side-panels">
          <div className="top-performers-panel">
            <h4>🏆 Top Performing Locations</h4>
            {analyticsData?.top_performers && (
              <div className="performers-list">
                {analyticsData.top_performers.slice(0, 5).map((performer, index) => (
                  <div key={index} className="performer-item">
                    <div className="performer-rank">#{index + 1}</div>
                    <div className="performer-info">
                      <div className="performer-name">{performer.name}</div>
                      <div className="performer-details">
                        {performer.country} • {performer.type}
                      </div>
                    </div>
                    <div className="performer-revenue">
                      {formatCurrency(performer.revenue)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="insights-panel">
            <h4>💡 Key Insights</h4>
            <div className="insights-list">
              <div className="insight-item">
                <span className="insight-icon">📈</span>
                <div className="insight-text">
                  Plant-Based products show highest growth at 25.3%
                </div>
              </div>
              <div className="insight-item">
                <span className="insight-icon">🏪</span>
                <div className="insight-text">
                  Hypermarkets generate 40% higher average sales
                </div>
              </div>
              <div className="insight-item">
                <span className="insight-icon">🌍</span>
                <div className="insight-text">
                  France leads with 24% of total revenue
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
