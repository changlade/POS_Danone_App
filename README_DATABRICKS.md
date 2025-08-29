# Danone POS Analytics - Databricks Apps

A comprehensive enterprise analytics platform for visualizing Danone's Point of Sales (POS) data across Europe with AI-powered insights, optimized for deployment on Databricks Apps platform with Claude 3.7 Sonnet integration.

## 🏗️ Architecture

This application follows the Databricks Apps architecture:

```
├── frontend/          # React application source
│   ├── src/          # React components and logic
│   ├── public/       # Static assets
│   └── package.json  # Frontend dependencies
├── backend/          # FastAPI backend
│   ├── app.py       # Main FastAPI application
│   ├── static/      # Built React files (auto-generated)
│   ├── requirements.txt
│   └── app.yaml     # Databricks Apps configuration
├── build.sh         # Build script
└── deploy.sh        # Deployment script
```

## 🚀 Features

### 🤖 AI-Powered Recommendations
- **Claude 3.7 Sonnet Integration**: Real-time AI analysis via Databricks endpoint
- **Strategic Insights**: Growth opportunities and optimization suggestions
- **Smart Analytics**: Automated pattern recognition and market analysis
- **Secure Token Passthrough**: Enterprise-grade authentication for AI services

### 🗺️ Interactive Map Dashboard
- **Professional Grey Map**: CartoDB light tiles for business presentation
- **Custom Markers**: Color-coded by business type with detailed popups
- **Real-time Statistics**: Live metrics and performance overlay
- **AI Recommendations Panel**: Floating insights panel with Claude analysis

### 📊 Advanced Analytics Dashboard
- **Dual-Tab Interface**: Seamless switching between Map and Analytics views
- **Revenue Analysis**: Interactive charts by country, business type, and product family
- **Performance Metrics**: Top performers, growth trends, and key insights
- **Cross-Tab Filtering**: Unified filter system across all views

### 🔍 Enterprise Filtering System
- **Product Families**: 6 Danone categories with real-time updates
- **Business Types**: 7 retail channel types with smart categorization
- **Sales Volume**: Interactive range slider with instant data refresh
- **Cross-View Consistency**: Filters apply to both Map and Analytics dashboards

### 🔐 Databricks Integration
- **SSO/OAuth Authentication**: Seamless Databricks user authentication
- **Token Passthrough**: Secure AI API access using `X-Forwarded-Access-Token`
- **Unity Catalog**: Leverage existing permissions and governance
- **Enterprise Security**: No anonymous access, full audit logging

## 📋 Prerequisites

1. **Docker** (for building the frontend)
2. **Databricks CLI** (for deployment)
3. **Databricks workspace** with Apps enabled

### Install Databricks CLI
```bash
pip install databricks-cli
```

### Configure Databricks CLI
```bash
databricks configure
```

## 🏗️ Building the Application

### 1. Build Frontend for Production
```bash
./build.sh
```

This script:
- Uses Docker to build the React frontend
- Extracts static files to `backend/static/`
- Prepares the app for Databricks deployment

### 2. Test Locally (Optional)
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app:app --reload
```

Access at `http://localhost:8000`

## 🚀 Deploying to Databricks Apps

### 1. Deploy the Application
```bash
./deploy.sh
```

This script:
- Builds the frontend automatically
- Uploads the backend to your Databricks workspace
- Deploys the app using Databricks CLI

### 2. Configure OAuth Scopes (if needed)
After deployment, configure OAuth scopes in the Databricks Apps UI based on your requirements:
- SQL access
- Model serving
- Unity Catalog access

### 3. Start the Application
- Go to your Databricks workspace Apps section
- Find "danone-pos-analytics"
- Start the application
- Access your dashboard

## 🔧 Backend API Endpoints

### Health Check
```
GET /health
```
Returns application health status.

### User Information
```
GET /api/user
```
Returns authenticated user information from Databricks headers.

### POS Data (Placeholder)
```
GET /api/pos-data
```
Placeholder endpoint for real Databricks data integration.

## 🔒 Authentication & Security

- **SSO Authentication**: All users authenticate via Databricks OAuth
- **Token Passthrough**: User tokens passed securely via `X-Forwarded-Access-Token` header
- **No Anonymous Access**: All users must be authenticated
- **Unity Catalog Integration**: Leverage existing permissions and governance

## 🔄 Data Integration

To integrate with real Databricks data sources:

1. **Modify the `/api/pos-data` endpoint** in `backend/app.py`
2. **Use the user token** to query Databricks APIs
3. **Leverage Unity Catalog** for data governance
4. **Update the frontend** to consume real data instead of sample data

Example integration:
```python
@app.get("/api/pos-data")
async def get_pos_data(request: Request):
    user_token = request.headers.get("x-forwarded-access-token")
    
    # Use token to query Databricks SQL warehouse
    # or Unity Catalog tables
    
    return {"data": real_pos_data}
```

## 📊 Monitoring & Troubleshooting

### View Logs
Access real-time logs at: `<your-app-url>/logz`

### Common Issues

1. **Build Failures**: Ensure Docker is running
2. **Deployment Failures**: Check Databricks CLI configuration
3. **Frontend Not Loading**: Verify static files are built correctly
4. **Authentication Issues**: Check OAuth scope configuration

## 🛠️ Development Workflow

### 1. Frontend Changes
```bash
cd frontend
# Make your changes
cd ..
./build.sh  # Rebuild
```

### 2. Backend Changes
```bash
cd backend
# Edit app.py
# Test locally with uvicorn
```

### 3. Deploy Updates
```bash
./deploy.sh
```

## 🔧 Configuration

### Environment Variables
Set in `backend/app.py` or via Databricks Apps UI:
- `LOG_LEVEL`: Logging level (default: INFO)

### Customization
- **Branding**: Update colors in `frontend/src/App.css`
- **Data Sources**: Modify API endpoints in `backend/app.py`
- **Map Settings**: Update center point and zoom in `frontend/src/components/MapComponent.tsx`

## 📈 Performance & Limitations

- **Compute**: Fixed allocation (2 vCPUs/6 GB per app)
- **File Size**: Max 10 MB per file
- **Scalability**: Use Databricks jobs/model serving for heavy workloads
- **Network**: All external API calls must go through backend

## 🔄 Updates & Maintenance

1. **Regular Updates**: Use `./build.sh && ./deploy.sh`
2. **Version Control**: Track changes in git
3. **Backup**: Keep configuration in version control
4. **Monitoring**: Regular check of `/logz` endpoint

## 🎯 Current Deployment Status

### ✅ **Latest Production Deployment**
- **Deployment ID**: `01f084c12da91453be2c23274d69694e`
- **Status**: `SUCCEEDED` - App started successfully  
- **Features**: Full AI integration with Claude 3.7 Sonnet, dual-tab analytics dashboard, 2024 Danone branding
- **Claude Endpoint**: `https://fe-vm-vdm-serverless-nmmvdg.cloud.databricks.com/serving-endpoints/databricks-claude-3-7-sonnet/invocations`

### 🌐 **Access Information**
- **Databricks Apps**: Available in your workspace Apps section as "danone-pos-analytics"
- **Local Development**: `http://localhost:8000` via `./run-local.sh`
- **Monitoring**: Real-time logs available at `<app-url>/logz`

### 🚀 **Application Capabilities**
Your Danone POS Analytics application is now **fully operational** with:
- **AI-Powered Insights**: Claude 3.7 Sonnet recommendations and analysis
- **Dual-Dashboard Interface**: Interactive map and deep-dive analytics
- **Enterprise Security**: Databricks SSO with token passthrough
- **Professional Branding**: Official 2024 Danone logo and styling
- **Real-time Filtering**: Cross-tab functionality across all views

## 🆘 Support

For issues related to:
- **Databricks Apps Platform**: Contact Databricks support
- **Application Logic**: Check logs at `/logz`
- **Frontend Issues**: Test locally first with `uvicorn`

## 🔗 Useful Links

- [Databricks Apps Documentation](https://docs.databricks.com/en/dev-tools/databricks-apps/index.html)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Leaflet Maps Documentation](https://leafletjs.com/)
