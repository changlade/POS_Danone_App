# Danone POS Analytics - Databricks Apps

A React-based application for visualizing Danone's Point of Sales (POS) data across Europe, optimized for deployment on Databricks Apps platform.

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

### 🗺️ Interactive Map
- OpenStreetMap integration focused on Europe
- Custom markers for different business types
- Detailed POS information popups

### 🔍 Advanced Filtering
- **Product Families**: Yogurt & Desserts, Baby Nutrition, Medical Nutrition, Waters, Plant-Based, Dairy Alternatives
- **Business Types**: Supermarket, Hypermarket, Convenience Store, Pharmacy, Baby Store, Health Food Store, Online Retailer
- **Sales Volume**: Interactive range slider

### 🔐 Databricks Integration
- SSO/OAuth authentication via Databricks
- Token passthrough for secure API access
- User context awareness
- Unity Catalog permissions support

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
