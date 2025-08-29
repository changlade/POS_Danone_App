from fastapi import FastAPI, Request, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from typing import List, Dict, Any
import os
import logging
import httpx
import json
from datetime import datetime

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Claude configuration
CLAUDE_ENDPOINT = "https://fe-vm-vdm-serverless-nmmvdg.cloud.databricks.com/serving-endpoints/databricks-claude-3-7-sonnet/invocations"

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

async def call_claude_api(user_token: str, prompt: str) -> str:
    """Call Claude API with user token"""
    headers = {
        "Authorization": f"Bearer {user_token}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ],
        "max_tokens": 1000,
        "temperature": 0.7
    }
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(CLAUDE_ENDPOINT, json=payload, headers=headers)
            response.raise_for_status()
            
            result = response.json()
            return result.get("choices", [{}])[0].get("message", {}).get("content", "Unable to generate recommendations")
    
    except httpx.HTTPStatusError as e:
        logger.error(f"Claude API HTTP error: {e}")
        return f"API Error: {e.response.status_code}"
    except Exception as e:
        logger.error(f"Claude API error: {e}")
        return "Unable to generate recommendations at this time"

@app.post("/api/recommendations")
async def get_recommendations(request: Request, pos_data: List[Dict[str, Any]]):
    """Generate AI recommendations based on POS data"""
    user_token = request.headers.get("x-forwarded-access-token")
    
    if not user_token:
        # For local development, provide mock recommendations
        return {
            "recommendations": [
                {
                    "type": "growth_opportunity",
                    "title": "Expand Baby Nutrition in Germany", 
                    "description": "Germany shows strong potential for Baby Nutrition products with only 23% market penetration compared to 45% in France.",
                    "priority": "high",
                    "impact": "Could increase revenue by 15-20% in German markets"
                },
                {
                    "type": "optimization",
                    "title": "Focus on Hypermarket Channel",
                    "description": "Hypermarkets show 40% higher sales volume than supermarkets but represent only 25% of our POS locations.",
                    "priority": "medium", 
                    "impact": "Opportunity to increase average sales per location"
                }
            ],
            "summary": "Analysis shows strong opportunities in Baby Nutrition expansion and hypermarket channel optimization.",
            "generated_at": datetime.now().isoformat()
        }
    
    # Prepare data summary for Claude
    total_locations = len(pos_data)
    total_sales = sum(pos.get("salesVolume", 0) for pos in pos_data)
    business_types = {}
    product_families = {}
    countries = {}
    
    for pos in pos_data:
        # Count business types
        bt = pos.get("businessType", "Unknown")
        business_types[bt] = business_types.get(bt, 0) + 1
        
        # Count product families
        for pf in pos.get("productFamilies", []):
            product_families[pf] = product_families.get(pf, 0) + 1
            
        # Count countries
        country = pos.get("country", "Unknown")
        countries[country] = countries.get(country, 0) + 1
    
    # Create prompt for Claude
    prompt = f"""As a business analyst for Danone, analyze this POS data and provide strategic recommendations:

Data Summary:
- Total POS Locations: {total_locations}
- Total Sales Volume: €{total_sales:,}
- Countries: {len(countries)} ({', '.join(list(countries.keys())[:5])})
- Business Types: {dict(list(business_types.items())[:3])}
- Top Product Families: {dict(list(product_families.items())[:3])}

Please provide 2-3 specific, actionable recommendations for Danone focusing on:
1. Growth opportunities in underperforming segments
2. Optimization strategies for existing channels
3. Geographic expansion or intensification

Format as JSON with: type, title, description, priority (high/medium/low), impact"""

    claude_response = await call_claude_api(user_token, prompt)
    
    try:
        # Try to parse Claude response as JSON
        if claude_response.startswith("{") or claude_response.startswith("["):
            recommendations_data = json.loads(claude_response)
        else:
            # If not JSON, create structured response from text
            recommendations_data = {
                "recommendations": [
                    {
                        "type": "ai_insight",
                        "title": "AI Analysis",
                        "description": claude_response[:500] + "..." if len(claude_response) > 500 else claude_response,
                        "priority": "medium",
                        "impact": "Based on current data patterns"
                    }
                ]
            }
    except json.JSONDecodeError:
        recommendations_data = {
            "recommendations": [
                {
                    "type": "ai_insight", 
                    "title": "AI Analysis",
                    "description": claude_response[:500] + "..." if len(claude_response) > 500 else claude_response,
                    "priority": "medium",
                    "impact": "Based on current data patterns"
                }
            ]
        }
    
    recommendations_data["generated_at"] = datetime.now().isoformat()
    recommendations_data["summary"] = f"Analysis of {total_locations} POS locations across {len(countries)} countries"
    
    return recommendations_data

@app.get("/api/analytics")
async def get_analytics_data(request: Request):
    """Get analytics data for dashboard"""
    user_token = request.headers.get("x-forwarded-access-token")
    
    # Mock analytics data (replace with real data in production)
    analytics_data = {
        "revenue_by_country": [
            {"country": "France", "revenue": 2456000, "volume": 156000},
            {"country": "Germany", "revenue": 1987000, "volume": 143000},
            {"country": "UK", "revenue": 1654000, "volume": 98000},
            {"country": "Italy", "revenue": 1432000, "volume": 87000},
            {"country": "Spain", "revenue": 1289000, "volume": 76000}
        ],
        "sales_by_business_type": [
            {"type": "Hypermarket", "sales": 3456000, "count": 23, "avg_sales": 150261},
            {"type": "Supermarket", "sales": 2987000, "count": 34, "avg_sales": 87853},
            {"type": "Convenience Store", "sales": 1234000, "count": 28, "avg_sales": 44071},
            {"type": "Pharmacy", "sales": 876000, "count": 15, "avg_sales": 58400}
        ],
        "product_family_performance": [
            {"family": "Yogurt & Desserts", "revenue": 3200000, "growth": 12.5, "market_share": 35},
            {"family": "Baby Nutrition", "revenue": 2100000, "growth": 18.2, "market_share": 23},
            {"family": "Waters", "revenue": 1800000, "growth": 8.1, "market_share": 20},
            {"family": "Plant-Based", "revenue": 1200000, "growth": 25.3, "market_share": 13},
            {"family": "Medical Nutrition", "revenue": 800000, "growth": 15.7, "market_share": 9}
        ],
        "monthly_trends": [
            {"month": "Jan", "revenue": 1200000, "volume": 95000},
            {"month": "Feb", "revenue": 1350000, "volume": 102000},
            {"month": "Mar", "revenue": 1450000, "volume": 108000},
            {"month": "Apr", "revenue": 1380000, "volume": 104000},
            {"month": "May", "revenue": 1520000, "volume": 115000},
            {"month": "Jun", "revenue": 1650000, "volume": 122000}
        ],
        "top_performers": [
            {"name": "Hypermarket Paris 1", "revenue": 285000, "country": "France", "type": "Hypermarket"},
            {"name": "Supermarket Berlin 2", "revenue": 198000, "country": "Germany", "type": "Supermarket"},
            {"name": "Hypermarket London 1", "revenue": 176000, "country": "UK", "type": "Hypermarket"},
            {"name": "Supermarket Milan 3", "revenue": 165000, "country": "Italy", "type": "Supermarket"},
            {"name": "Hypermarket Madrid 1", "revenue": 154000, "country": "Spain", "type": "Hypermarket"}
        ],
        "generated_at": datetime.now().isoformat()
    }
    
    return analytics_data

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
