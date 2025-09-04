#!/bin/bash

# Deployment script for Databricks Apps
# Make sure you have Databricks CLI installed and configured

APP_NAME="danone-pos-analytics"
WORKSPACE_PATH="/Workspace/Apps/$APP_NAME"
DATABRICKS_PROFILE="dbxworkspace"

echo "🚀 Deploying Danone POS Analytics to Databricks Apps..."
echo "🔧 Using Databricks profile: $DATABRICKS_PROFILE"

# Check if Databricks CLI is available
if ! command -v databricks &> /dev/null; then
    echo "❌ Databricks CLI not found. Please install it first:"
    echo "pip install databricks-cli"
    exit 1
fi

# Build the application first
echo "Building application..."
./build.sh

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Deployment aborted."
    exit 1
fi

# Test database connectivity before deployment
echo ""
echo "🔍 Testing database connectivity (containerized)..."
./test-database-docker.sh

if [ $? -ne 0 ]; then
    echo ""
    echo "⚠️  Database connectivity test failed!"
    echo "This could be due to:"
    echo "- Network connectivity issues"
    echo "- Database credentials problems"
    echo "- Firewall restrictions"
    echo ""
    echo "Do you want to continue with deployment anyway? (y/N)"
    read -r response
    if [[ ! "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        echo "❌ Deployment aborted due to database connectivity issues."
        exit 1
    fi
    echo "⚠️  Continuing deployment with database issues..."
    echo "📝 Note: App will fallback to sample data if database is unavailable."
fi

# Create workspace directory
echo "Creating workspace directory..."
databricks workspace mkdirs "$WORKSPACE_PATH" --profile "$DATABRICKS_PROFILE"

# Upload backend files
echo "Uploading backend files..."
databricks workspace import-dir backend "$WORKSPACE_PATH" --overwrite --profile "$DATABRICKS_PROFILE"

# Deploy the app
echo ""
echo "Deploying app to Databricks..."
databricks apps deploy "$APP_NAME" --source-code-path "$WORKSPACE_PATH" --profile "$DATABRICKS_PROFILE"

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    
    # Get app URL and test the deployed application
    echo ""
    echo "🔍 Getting app URL..."
    APP_URL=$(databricks apps list --output json --profile "$DATABRICKS_PROFILE" | jq -r ".[] | select(.name == \"$APP_NAME\") | .url" 2>/dev/null)
    
    if [ -n "$APP_URL" ] && [ "$APP_URL" != "null" ]; then
        echo "📍 App URL: $APP_URL"
        echo ""
        echo "🧪 Testing deployed application..."
        echo "⏳ Waiting for app to start (30 seconds)..."
        sleep 30
        
        # Test the deployed app
        python3 test-database.py "$APP_URL"
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "🎉 Post-deployment test successful!"
            echo "✅ Database integration is working in production!"
        else
            echo ""
            echo "⚠️  Post-deployment test failed."
            echo "📝 Please check the app manually and verify database connectivity."
        fi
    else
        echo "⚠️  Could not retrieve app URL for testing."
    fi
    
    echo ""
    echo "📝 Next steps:"
    echo "1. Go to your Databricks workspace Apps section"
    echo "2. Configure OAuth scopes if needed: 'serving.serving-endpoints' or 'all-apis'"
    echo "3. Start the app (if not already started)"
    echo "4. Access your Danone POS Analytics dashboard at: $APP_URL"
    echo "5. Test the refresh button to verify database connectivity"
    echo ""
    echo "🔧 If database connection fails:"
    echo "- Check network connectivity to Databricks"
    echo "- Verify app_account database permissions"
    echo "- Check OAuth scopes configuration"
else
    echo "❌ Deployment failed. Check the error messages above."
    exit 1
fi
