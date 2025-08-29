from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Danone POS Analytics",
    description="Point of Sales Data Visualization for Danone",
    version="1.0.0"
)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "app": "Danone POS Analytics"}

# API endpoint to get user info (for Databricks authentication)
@app.get("/api/user")
async def get_user_info(request: Request):
    """Get user information from Databricks headers"""
    user_token = request.headers.get("x-forwarded-access-token")
    user_email = request.headers.get("x-forwarded-user")
    
    logger.info(f"User access: {user_email}")
    
    return {
        "authenticated": bool(user_token),
        "user_email": user_email or "anonymous",
        "has_token": bool(user_token)
    }

# Sample API endpoint for POS data (can be extended for real data integration)
@app.get("/api/pos-data")
async def get_pos_data(request: Request):
    """Get POS data - placeholder for real Databricks data integration"""
    user_token = request.headers.get("x-forwarded-access-token")
    
    if not user_token:
        return {"error": "Authentication required"}
    
    # In a real scenario, you would use the user_token to query Databricks APIs
    # For now, return success status
    return {
        "status": "success",
        "message": "POS data endpoint ready for integration",
        "data_source": "sample_data"
    }

# Configure static directories
static_root_dir = os.path.join(os.path.dirname(__file__), "static")
static_assets_dir = os.path.join(static_root_dir, "static")

# Mount the nested static directory for JS/CSS assets
if os.path.exists(static_assets_dir):
    app.mount("/static", StaticFiles(directory=static_assets_dir), name="static")
    logger.info(f"Serving static assets from: {static_assets_dir}")

# Serve the React app
@app.get("/{path:path}")
async def serve_frontend(path: str):
    """Serve the React frontend"""
    # First, try to serve files from the main static directory (index.html, manifest.json, etc.)
    static_file_path = os.path.join(static_root_dir, path)
    
    # If the file exists in the root static directory, serve it
    if os.path.exists(static_file_path) and os.path.isfile(static_file_path):
        return FileResponse(static_file_path)
    
    # For React routing and any other requests, serve index.html
    index_path = os.path.join(static_root_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    
    # Fallback
    return {"error": "Frontend not built. Please run 'npm run build' in the frontend directory."}

# Root route
@app.get("/")
async def root():
    """Serve the main React app"""
    index_path = os.path.join(static_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    
    return {
        "message": "Danone POS Analytics API",
        "status": "Frontend not built",
        "instructions": "Please run 'npm run build' in the frontend directory"
    }
