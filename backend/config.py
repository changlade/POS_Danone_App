"""
Configuration management for Danone POS Analytics
Loads configuration from environment variables for security
"""

import os
from typing import Dict, Any
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def load_config() -> Dict[str, Any]:
    """Load configuration from environment variables"""
    
    # Database configuration
    database_config = {
        "host": os.getenv("DB_HOST", "localhost"),
        "port": int(os.getenv("DB_PORT", "5432")),
        "database": os.getenv("DB_NAME", "databricks_postgres"),
        "user": os.getenv("DB_USER", "postgres"),
        "password": os.getenv("DB_PASSWORD", ""),
        "ssl": os.getenv("DB_SSL", "require")
    }
    
    # Application configuration
    app_config = {
        "env": os.getenv("ENV", "development"),
        "debug": os.getenv("DEBUG", "false").lower() == "true",
        "log_level": os.getenv("LOG_LEVEL", "INFO"),
        "db_schema": os.getenv("DB_SCHEMA", "public")
    }
    
    # Validate required environment variables
    required_vars = ["DB_HOST", "DB_USER", "DB_PASSWORD"]
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        print(f"⚠️  Warning: Missing required environment variables: {missing_vars}")
        print("🔧 Please check your .env file or environment configuration")
        
        # For development, fall back to hardcoded values with warning
        if app_config["env"] == "development":
            print("🚨 Using fallback configuration for development")
            database_config.update({
                "host": "instance-1203a90b-2a20-4155-b1cc-383360ea8797.database.cloud.databricks.com",
                "user": "app_account", 
                "password": "DX2o9aIqFId34jJY"
            })
        else:
            raise ValueError(f"Missing required environment variables in production: {missing_vars}")
    
    return {
        "database": database_config,
        "app": app_config
    }

# Load configuration
CONFIG = load_config()

# Export for easy access
DATABASE_CONFIG = CONFIG["database"]
APP_CONFIG = CONFIG["app"]
