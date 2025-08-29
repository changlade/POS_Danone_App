# Danone POS Analytics Application

A comprehensive React-based application for visualizing Danone's Point of Sales (POS) data across Europe with AI-powered insights and advanced analytics. Designed for **Databricks Apps** platform with Claude 3.7 Sonnet integration.

## 🎯 Overview

This enterprise-grade analytics platform provides Danone with actionable insights from POS data across 25+ European markets, featuring AI-powered recommendations, interactive visualizations, and deep-dive analytics capabilities.

## ✨ Key Features

### 🤖 AI-Powered Recommendations
- **Claude 3.7 Sonnet Integration**: Real-time AI analysis of POS performance
- **Strategic Insights**: Growth opportunities and optimization suggestions
- **Smart Analytics**: Automated pattern recognition and market analysis
- **Databricks Token Passthrough**: Secure authentication for AI services

### 🗺️ Interactive Map Dashboard
- **Professional Grey Map**: CartoDB light tiles for business presentation
- **Custom Business Markers**: Color-coded by business type
- **Detailed POS Information**: Comprehensive popup data including:
  - Store name, type, and location
  - Sales volume and product families
  - Performance metrics
- **Real-time Statistics**: Live metrics overlay

### 📊 Advanced Analytics Dashboard
- **Revenue Analysis**: By country, business type, and product family
- **Performance Metrics**: Top performers and growth trends
- **Interactive Charts**: Monthly trends and comparative analysis
- **Key Insights Panel**: Automated business intelligence highlights

### 🔍 Enterprise Filtering System
- **Cross-Tab Functionality**: Filters work across Map and Analytics views
- **Product Family Filters**: 6 Danone product categories
- **Business Type Filters**: 7 retail channel types
- **Sales Volume Slider**: Interactive range filtering
- **Real-time Updates**: Instant data refresh across all components

### 🎨 Professional Branding
- **Official Danone Logo**: 2024 WebP optimized branding
- **Brand-Compliant Design**: Danone color palette and typography
- **Responsive Interface**: Mobile-first design approach
- **Tab Navigation**: Seamless switching between Map and Analytics views

## 🚀 Deployment Options

### 🌐 Production Deployment (Databricks Apps)

The application is optimized for **Databricks Apps** platform with enterprise authentication and AI integration.

#### Prerequisites
- Databricks workspace with Apps enabled
- Databricks CLI installed and configured
- Docker (for building frontend)

#### Quick Deployment
```bash
# Install Databricks CLI
pip install databricks-cli

# Configure authentication
databricks configure

# Deploy to Databricks Apps
./deploy.sh
```

#### Manual Deployment Steps
```bash
# 1. Build the application
./build.sh

# 2. Upload to Databricks workspace
databricks workspace mkdirs /Workspace/Apps/danone-pos-analytics
databricks workspace import-dir backend /Workspace/Apps/danone-pos-analytics --overwrite

# 3. Deploy the app
databricks apps deploy danone-pos-analytics --source-code-path /Workspace/Apps/danone-pos-analytics
```

### 🏠 Local Development

#### Prerequisites
- Docker and Docker Compose (recommended)
- OR Python 3.13+ and Node.js 18+ (manual setup)

#### Option 1: Using Docker (Recommended)
```bash
# Build and run the full stack
./build.sh && ./run-local.sh

# Access at: http://localhost:8000
```

#### Option 2: Manual Setup
```bash
# Frontend setup
cd frontend
npm install
npm run build

# Backend setup
cd ../backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Start the server
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

### 🔄 Development Workflow
```bash
# Make frontend changes
cd frontend && npm run build

# Restart backend (auto-reloads)
# Access at: http://localhost:8000

# Deploy updates to Databricks
./deploy.sh
```

## 📊 Sample Data & Analytics

The application includes comprehensive sample data with:
- **75+ POS locations** across 25 major European cities
- **Realistic business metrics** with diverse sales volumes
- **6 Product families** with market share distribution
- **7 Business types** reflecting retail channel diversity
- **Monthly trends** and performance indicators
- **Geographic coverage** across major European markets

## 🛠️ Technology Stack

### Backend (FastAPI)
- **FastAPI**: High-performance Python web framework
- **Claude 3.7 Sonnet**: AI-powered recommendations via Databricks
- **Uvicorn**: ASGI server for production deployment
- **httpx**: Async HTTP client for AI API integration
- **Pydantic**: Data validation and settings management

### Frontend (React)
- **React 18**: Modern React with TypeScript
- **Leaflet**: Interactive mapping with CartoDB tiles
- **React-Leaflet**: React components for Leaflet maps
- **Custom CSS**: Danone brand-compliant styling
- **Responsive Design**: Mobile-first approach

### Infrastructure
- **Databricks Apps**: Production deployment platform
- **Docker**: Containerized development and building
- **Node.js 18**: Frontend build environment
- **Python 3.13**: Backend runtime environment

## 📁 Project Architecture

```
POS_Danone_App/
├── frontend/                   # React Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── MapComponent.tsx         # Interactive map dashboard
│   │   │   ├── AnalyticsDashboard.tsx   # Deep-dive analytics
│   │   │   ├── FilterPanel.tsx          # Cross-tab filtering
│   │   │   └── RecommendationsPanel.tsx # AI insights display
│   │   ├── types/
│   │   │   └── POSData.ts              # TypeScript interfaces
│   │   ├── data/
│   │   │   └── sampleData.ts           # Sample data generator
│   │   └── App.tsx                     # Main app with tab navigation
│   ├── public/
│   │   └── danone-logo.webp           # Official Danone branding
│   └── package.json                   # Frontend dependencies
├── backend/                    # FastAPI Application
│   ├── app.py                 # Main FastAPI app with AI integration
│   ├── requirements.txt       # Python dependencies
│   ├── app.yaml              # Databricks Apps configuration
│   └── static/               # Built React files (auto-generated)
├── build.sh                  # Frontend build script
├── deploy.sh                 # Databricks deployment script
├── run-local.sh             # Local development script
└── README.md                # This documentation
```

## 🎛️ Application Interface

### 🗺️ Map Dashboard Tab
- **Professional Grey Map**: CartoDB light tiles for business presentation
- **Interactive POS Markers**: Color-coded by business type with hover effects
- **Detailed Information Popups**: Comprehensive store data on click
- **Real-time Statistics**: Live count and sales volume overlay
- **AI Recommendations Panel**: Floating panel with Claude-generated insights

### 📊 Analytics Dashboard Tab
- **Revenue Analysis Charts**: Interactive visualizations by country and business type
- **Product Performance**: Growth metrics and market share analysis
- **Monthly Trends**: Time-series data with dual-axis charts
- **Top Performers**: Ranked list of highest-revenue locations
- **Key Insights**: Automated business intelligence highlights

### 🔍 Enterprise Filter Panel
- **Cross-Tab Functionality**: Filters apply to both Map and Analytics views
- **Smart Categories**: Product families and business type multi-select
- **Range Controls**: Interactive sales volume slider with real-time updates
- **Quick Actions**: Clear all filters and refresh data
- **Responsive Design**: Collapsible panel for mobile optimization

## 🤖 AI Integration (Claude 3.7 Sonnet)

### API Endpoint Configuration
```
Endpoint: https://fe-vm-vdm-serverless-nmmvdg.cloud.databricks.com/serving-endpoints/databricks-claude-3-7-sonnet/invocations
Authentication: Databricks user token passthrough
```

### AI Capabilities
- **Strategic Recommendations**: Growth opportunities and market expansion insights
- **Performance Analysis**: Automated pattern recognition in sales data
- **Business Intelligence**: Contextual suggestions based on filtered data
- **Real-time Insights**: Dynamic analysis as users interact with filters

### Sample AI Recommendations
- *"Expand Baby Nutrition in Germany - shows strong potential with only 23% market penetration"*
- *"Focus on Hypermarket Channel - 40% higher sales volume than supermarkets"*
- *"Plant-Based products show highest growth at 25.3% - consider expansion"*

## 🔐 Authentication & Security

### Databricks Apps Integration
- **SSO Authentication**: All users authenticate via Databricks OAuth
- **Token Passthrough**: Secure AI API calls using `X-Forwarded-Access-Token`
- **No Anonymous Access**: Enterprise-grade security for all users
- **Unity Catalog**: Leverage existing permissions and governance

### Local Development
- **Mock Recommendations**: AI insights available without Databricks token
- **Open Access**: No authentication required for local testing
- **Full Functionality**: All features work in development mode

## 📈 Performance & Monitoring

### Application Metrics
- **Static Frontend**: Optimized production build for fast loading
- **FastAPI Backend**: High-performance async Python framework
- **WebP Logo**: Optimized branding assets for faster rendering
- **Efficient Filtering**: Real-time updates without full page refresh

### Monitoring
- **Databricks Apps Logs**: Access via `<app-url>/logz`
- **Structured Logging**: Comprehensive error tracking and debugging
- **Health Endpoints**: `/health` for application status monitoring

## 🎨 Brand Compliance

### Official Danone Branding
- **2024 Logo**: Latest WebP-optimized Danone branding in header
- **Brand Colors**: Consistent use of official Danone color palette
  - **Primary Blue**: #007cba
  - **Light Blue**: #00a8cc  
  - **Green**: #00a651
  - **Orange**: #ff6600
- **Professional Typography**: Clean, readable fonts across all interfaces
- **Responsive Logo**: Optimized display on desktop and mobile devices

## 🔄 Data Integration Capabilities

### Current Implementation
- **Sample Data**: 75+ realistic POS locations with comprehensive metrics
- **Mock Analytics**: Representative business intelligence data
- **AI Simulation**: Example recommendations and insights

### Production Integration Ready
- **Databricks SQL**: Ready for Unity Catalog table integration
- **Real-time Data**: API endpoints prepared for live data sources
- **Scalable Architecture**: Backend designed for large dataset processing
- **Token Security**: Secure data access using user authentication

## 🚀 Deployment Status

### Latest Production Deployment
- **Deployment ID**: `01f084c12da91453be2c23274d69694e`
- **Status**: `SUCCEEDED` - App started successfully
- **Features**: Full AI integration, analytics dashboard, updated branding
- **Platform**: Databricks Apps with SSO authentication

### Access Information
- **Local Development**: `http://localhost:8000`
- **Production**: Available via Databricks workspace Apps section
- **Logs**: `<app-url>/logz` for real-time monitoring
