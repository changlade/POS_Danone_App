from fastapi import FastAPI, Request, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
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
# Primary Claude endpoint
CLAUDE_ENDPOINT = "https://adb-8487495412728212.12.azuredatabricks.net/serving-endpoints/databricks-claude-3-7-sonnet/invocations"

# Alternative endpoint if needed (uncomment to test)
# CLAUDE_ENDPOINT = "https://adb-8487495412728212.12.azuredatabricks.net/api/2.0/serving-endpoints/databricks-claude-3-7-sonnet/invocations"

app = FastAPI(
    title="Danone POS Analytics",
    description="Point of Sales Data Visualization for Danone",
    version="1.0.0"
)

# Add CORS middleware for Databricks Apps
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual Databricks Apps domains
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "app": "Danone POS Analytics"}

# Enhanced Claude connectivity and authentication diagnostics
@app.get("/health/claude")
async def claude_health_check(request: Request):
    """Comprehensive Claude endpoint and authentication diagnostics per Databricks recommendations"""
    
    # Step 1: Extract all possible authentication tokens and headers
    user_obo_token = request.headers.get("x-forwarded-access-token")
    user_obo_token_alt = request.headers.get("X-Forwarded-Access-Token") 
    auth_header = request.headers.get("authorization", "")
    auth_header_alt = request.headers.get("Authorization", "")
    
    # Step 2: Determine authentication flow
    auth_flow_type = "unknown"
    active_token = None
    
    if user_obo_token or user_obo_token_alt:
        auth_flow_type = "user_obo"  # On-Behalf-Of (user token passthrough)
        active_token = user_obo_token or user_obo_token_alt
    elif auth_header.startswith("Bearer ") or auth_header_alt.startswith("Bearer "):
        auth_flow_type = "service_principal"  # Service principal token
        active_token = auth_header.replace("Bearer ", "") or auth_header_alt.replace("Bearer ", "")
    
    # Step 3: Comprehensive diagnostics result
    result = {
        "timestamp": datetime.now().isoformat(),
        "claude_endpoint": CLAUDE_ENDPOINT,
        "authentication_analysis": {
            "flow_type": auth_flow_type,
            "token_present": bool(active_token),
            "token_length": len(active_token) if active_token else 0,
            "token_prefix": active_token[:20] + "..." if active_token and len(active_token) > 20 else None,
            "user_obo_header": bool(user_obo_token or user_obo_token_alt),
            "service_principal_header": bool(auth_header.startswith("Bearer ") or auth_header_alt.startswith("Bearer ")),
        },
        "headers_analysis": {
            "total_headers": len(request.headers),
            "auth_related_headers": [h for h in request.headers.keys() if any(x in h.lower() for x in ['auth', 'token', 'forward'])],
            "all_headers": dict(request.headers.items()),
        },
        "databricks_troubleshooting": {
            "step_1_auth_flow": f"Using {auth_flow_type} authentication flow",
            "step_2_oauth_scopes": "Check if app has 'serving.serving-endpoints' or 'all-apis' scope",
            "step_3_permissions": "Verify 'Can Query' permission on Claude endpoint",
            "step_4_logs": "Check workspace audit logs for 'serverlessRealTimeInference' events",
        },
        "status": "diagnostics_complete"
    }
    
    if not active_token:
        result["status"] = "no_token"
        result["error"] = "No authentication token found in any expected headers"
        result["next_steps"] = [
            "Verify app OAuth configuration includes required scopes",
            "Check if user needs to re-consent to app permissions",
            "Ensure app is properly deployed with authentication enabled"
        ]
        return result
    
    # Step 4: Test Claude connectivity with detailed error analysis
    try:
        logger.info(f"Testing Claude connectivity with {auth_flow_type} token")
        test_response = await call_claude_api(active_token, "Hello, please respond with 'Claude is working'")
        
        result["status"] = "success"
        result["claude_test"] = {
            "response_received": True,
            "response_length": len(test_response),
            "response_preview": test_response[:200] + "..." if len(test_response) > 200 else test_response
        }
        result["message"] = f"Claude endpoint accessible via {auth_flow_type} authentication"
        
    except httpx.HTTPStatusError as e:
        result["status"] = "http_error"
        result["error"] = {
            "status_code": e.response.status_code,
            "error_type": "HTTPStatusError",
            "error_message": str(e),
            "response_text": e.response.text if hasattr(e.response, 'text') else "No response text",
        }
        
        # Enhanced 403 error analysis per Databricks recommendations
        if e.response.status_code == 403:
            result["error"]["databricks_403_analysis"] = {
                "likely_causes": [
                    "Missing 'serving.serving-endpoints' or 'all-apis' OAuth scope",
                    "User token lacks 'Can Query' permission on Claude endpoint",
                    "Stale OAuth scopes - app needs restart and user re-consent",
                    "Service principal lacks proper endpoint permissions"
                ],
                "immediate_actions": [
                    "Check app OAuth configuration in Databricks workspace",
                    "Verify user has 'Can Query' access to databricks-claude-3-7-sonnet endpoint",
                    "Try restarting app and clearing browser cache/cookies",
                    "Test with different user or service principal"
                ],
                "auth_flow_specific": {
                    auth_flow_type: "Current authentication method - verify permissions for this specific flow"
                }
            }
            
    except Exception as e:
        result["status"] = "connection_error"
        result["error"] = {
            "error_type": type(e).__name__,
            "error_message": str(e),
            "troubleshooting": [
                "Verify Claude endpoint URL is correct",
                "Check network connectivity from Databricks Apps",
                "Confirm endpoint is active and accepting requests"
            ]
        }
    
    return result

# OAuth scope and permission testing endpoint
@app.get("/diagnostic/oauth-test")
async def oauth_scope_test(request: Request):
    """Test OAuth scopes and permissions per Databricks troubleshooting recommendations"""
    
    # Extract authentication information
    user_obo_token = request.headers.get("x-forwarded-access-token")
    user_obo_token_alt = request.headers.get("X-Forwarded-Access-Token") 
    auth_header = request.headers.get("authorization", "")
    service_principal_token = auth_header.replace("Bearer ", "") if auth_header.startswith("Bearer ") else None
    
    results = {
        "timestamp": datetime.now().isoformat(),
        "test_summary": "OAuth scope and authentication flow testing",
        "databricks_recommendations": {
            "step_1": "Triple-check Authentication Flow and Identity",
            "step_2": "Validate OAuth Scopes (serving.serving-endpoints or all-apis)",
            "step_3": "Check Behavior Using Both Auth Flows",
            "step_4": "Look at Workspace/Endpoint Logs"
        },
        "tests": {}
    }
    
    # Test 1: User OBO (On-Behalf-Of) flow
    if user_obo_token or user_obo_token_alt:
        token = user_obo_token or user_obo_token_alt
        results["tests"]["user_obo_flow"] = {
            "available": True,
            "token_length": len(token),
            "token_prefix": token[:20] + "..." if len(token) > 20 else token,
            "description": "Using user's delegated token (x-forwarded-access-token)",
            "requirements": [
                "User must have 'Can Query' permission on Claude endpoint",
                "App OAuth config must include 'serving.serving-endpoints' or 'all-apis' scope"
            ]
        }
        
        # Test Claude access with user token
        try:
            logger.info("Testing Claude access with user OBO token")
            test_result = await call_claude_api(token, "Test: OAuth scope validation")
            results["tests"]["user_obo_flow"]["claude_test"] = {
                "status": "success",
                "response_preview": test_result[:100] + "..." if len(test_result) > 100 else test_result
            }
        except Exception as e:
            results["tests"]["user_obo_flow"]["claude_test"] = {
                "status": "failed",
                "error": str(e),
                "troubleshooting": [
                    "Check user's 'Can Query' permission on databricks-claude-3-7-sonnet",
                    "Verify app OAuth scopes include required permissions",
                    "Try user re-consent to app"
                ]
            }
    else:
        results["tests"]["user_obo_flow"] = {
            "available": False,
            "description": "No x-forwarded-access-token header found",
            "implications": "App is not using user delegation (OBO) flow"
        }
    
    # Test 2: Service Principal flow
    if service_principal_token:
        results["tests"]["service_principal_flow"] = {
            "available": True,
            "token_length": len(service_principal_token),
            "token_prefix": service_principal_token[:20] + "..." if len(service_principal_token) > 20 else service_principal_token,
            "description": "Using app's service principal token (Authorization header)",
            "requirements": [
                "Service principal must have 'Can Query' permission on Claude endpoint",
                "App must be configured to use service principal authentication"
            ]
        }
        
        # Test Claude access with service principal token
        try:
            logger.info("Testing Claude access with service principal token")
            test_result = await call_claude_api(service_principal_token, "Test: Service principal access")
            results["tests"]["service_principal_flow"]["claude_test"] = {
                "status": "success",
                "response_preview": test_result[:100] + "..." if len(test_result) > 100 else test_result
            }
        except Exception as e:
            results["tests"]["service_principal_flow"]["claude_test"] = {
                "status": "failed",
                "error": str(e),
                "troubleshooting": [
                    "Check service principal permissions on databricks-claude-3-7-sonnet",
                    "Verify app deployment configuration",
                    "Check app OAuth configuration"
                ]
            }
    else:
        results["tests"]["service_principal_flow"] = {
            "available": False,
            "description": "No Authorization: Bearer header found",
            "implications": "App is not using service principal authentication"
        }
    
    # Summary and recommendations
    user_available = results["tests"]["user_obo_flow"]["available"]
    sp_available = results["tests"]["service_principal_flow"]["available"]
    
    if not user_available and not sp_available:
        results["recommendation"] = {
            "priority": "high",
            "action": "No valid authentication tokens found",
            "steps": [
                "Check app OAuth configuration in Databricks workspace",
                "Verify app deployment includes authentication setup",
                "Ensure proper scopes are configured",
                "Try restarting the app"
            ]
        }
    elif user_available and not sp_available:
        results["recommendation"] = {
            "priority": "medium", 
            "action": "Using user delegation (OBO) flow only",
            "steps": [
                "This is normal for user-facing apps",
                "Focus on user permissions and OAuth scopes",
                "Verify 'serving.serving-endpoints' scope is included"
            ]
        }
    elif not user_available and sp_available:
        results["recommendation"] = {
            "priority": "medium",
            "action": "Using service principal flow only", 
            "steps": [
                "This is normal for backend-only apps",
                "Focus on service principal permissions",
                "Verify service principal has Claude endpoint access"
            ]
        }
    else:
        results["recommendation"] = {
            "priority": "low",
            "action": "Both authentication flows available",
            "steps": [
                "Compare test results to identify which flow is failing",
                "Focus troubleshooting on the failing authentication method",
                "Consider using the working method as primary"
            ]
        }
    
    return results

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
    """Call Claude API with user token - Enhanced with 403 error diagnostics"""
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
        logger.info(f"Calling Claude endpoint: {CLAUDE_ENDPOINT}")
        logger.info(f"Token prefix: {user_token[:20]}...{user_token[-10:] if len(user_token) > 30 else 'short_token'}")
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(CLAUDE_ENDPOINT, json=payload, headers=headers)
            
            # Log response details for debugging
            logger.info(f"Claude API response status: {response.status_code}")
            logger.info(f"Claude API response headers: {dict(response.headers)}")
            
            response.raise_for_status()
            
            result = response.json()
            content = result.get("choices", [{}])[0].get("message", {}).get("content", "Unable to generate recommendations")
            logger.info(f"Claude API success - response length: {len(content)}")
            return content
    
    except httpx.HTTPStatusError as e:
        logger.error(f"Claude API HTTP error: {e.response.status_code} - {e}")
        logger.error(f"Response body: {e.response.text}")
        
        # Enhanced 403 error handling per Databricks recommendations
        if e.response.status_code == 403:
            error_details = {
                "status_code": 403,
                "endpoint": CLAUDE_ENDPOINT,
                "token_prefix": user_token[:20] + "..." if len(user_token) > 20 else user_token,
                "response_body": e.response.text,
                "databricks_troubleshooting": {
                    "step_1": "Verify OAuth scopes include 'serving.serving-endpoints' or 'all-apis'",
                    "step_2": "Check 'Can Query' permission on databricks-claude-3-7-sonnet endpoint",
                    "step_3": "Try restarting app and user re-consent",
                    "step_4": "Check workspace audit logs for serverlessRealTimeInference events"
                }
            }
            logger.error(f"403 Forbidden Error Details: {error_details}")
            return f"403 Forbidden: Check OAuth scopes and endpoint permissions. Error: {e.response.text[:200]}"
        
        return f"API Error {e.response.status_code}: {e.response.text[:200] if hasattr(e.response, 'text') else str(e)}"
        
    except Exception as e:
        logger.error(f"Claude API connection error: {e}")
        return f"Connection Error: {str(e)}"

@app.post("/api/recommendations")
async def get_recommendations(request: Request, pos_data: List[Dict[str, Any]]):
    """Generate AI recommendations based on POS data"""
    # Try multiple header formats for Databricks token
    user_token = (
        request.headers.get("x-forwarded-access-token") or
        request.headers.get("X-Forwarded-Access-Token") or 
        request.headers.get("authorization", "").replace("Bearer ", "") or
        request.headers.get("Authorization", "").replace("Bearer ", "")
    )
    
    logger.info(f"Token received: {'Yes' if user_token else 'No'}")
    logger.info(f"Available headers: {list(request.headers.keys())}")
    
    if not user_token:
        # For local development, provide mock recommendations
        logger.info("No token found, using mock recommendations")
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

    try:
        logger.info("Calling Claude API with user token")
        claude_response = await call_claude_api(user_token, prompt)
        logger.info(f"Claude API response received: {len(claude_response)} characters")
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
        logger.error("Failed to parse Claude response as JSON")
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
    except Exception as e:
        logger.error(f"Claude API call failed: {e}")
        recommendations_data = {
            "recommendations": [
                {
                    "type": "error",
                    "title": "AI Service Error",
                    "description": f"Claude API error: {str(e)}. Using fallback recommendations.",
                    "priority": "medium",
                    "impact": "Verify token permissions and Claude endpoint access in Databricks"
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
