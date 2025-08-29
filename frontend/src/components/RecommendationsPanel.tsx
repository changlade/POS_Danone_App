import React, { useState, useEffect } from 'react';
import { POSData } from '../types/POSData';
import './RecommendationsPanel.css';

interface Recommendation {
  type: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  impact: string;
}

interface RecommendationsData {
  recommendations: Recommendation[];
  summary: string;
  generated_at: string;
}

interface RecommendationsPanelProps {
  posData: POSData[];
}

const RecommendationsPanel: React.FC<RecommendationsPanelProps> = ({ posData }) => {
  const [recommendations, setRecommendations] = useState<RecommendationsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(posData),
      });

      if (response.ok) {
        const data = await response.json();
        setRecommendations(data);
      } else {
        console.error('Failed to fetch recommendations');
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (posData.length > 0) {
      fetchRecommendations();
    }
  }, [posData]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ff6600';
      case 'medium': return '#007cba';
      case 'low': return '#00a651';
      default: return '#333333';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔥';
      case 'medium': return '⚡';
      case 'low': return '💡';
      default: return '📋';
    }
  };

  return (
    <div className={`recommendations-panel ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="recommendations-header">
        <h3>
          🤖 AI Recommendations
          {loading && <span className="loading-indicator">...</span>}
        </h3>
        <button
          className="collapse-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? '▲' : '▼'}
        </button>
      </div>

      {!isCollapsed && (
        <div className="recommendations-content">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Generating AI recommendations...</p>
            </div>
          ) : recommendations ? (
            <>
              <div className="recommendations-summary">
                <p>{recommendations.summary}</p>
                <div className="refresh-section">
                  <button
                    className="refresh-btn"
                    onClick={fetchRecommendations}
                    disabled={loading}
                  >
                    🔄 Refresh
                  </button>
                  <span className="last-updated">
                    Updated: {new Date(recommendations.generated_at).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              <div className="recommendations-list">
                {recommendations.recommendations.map((rec, index) => (
                  <div key={index} className="recommendation-card">
                    <div className="recommendation-header">
                      <div className="recommendation-title">
                        <span className="priority-icon">
                          {getPriorityIcon(rec.priority)}
                        </span>
                        <h4>{rec.title}</h4>
                        <span
                          className="priority-badge"
                          style={{ backgroundColor: getPriorityColor(rec.priority) }}
                        >
                          {rec.priority.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <p className="recommendation-description">{rec.description}</p>
                    <div className="recommendation-impact">
                      <strong>Impact:</strong> {rec.impact}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="no-recommendations">
              <p>No recommendations available. Try adjusting your filters or refresh the data.</p>
              <button
                className="refresh-btn"
                onClick={fetchRecommendations}
                disabled={loading}
              >
                🔄 Generate Recommendations
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecommendationsPanel;
