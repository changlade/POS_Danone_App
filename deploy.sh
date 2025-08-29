#!/bin/bash

# Deployment script for Databricks Apps
# Make sure you have Databricks CLI installed and configured

APP_NAME="danone-pos-analytics"
WORKSPACE_PATH="/Workspace/Apps/$APP_NAME"

echo "🚀 Deploying Danone POS Analytics to Databricks Apps..."

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

# Create workspace directory
echo "Creating workspace directory..."
databricks workspace mkdirs "$WORKSPACE_PATH"

# Upload backend files
echo "Uploading backend files..."
databricks workspace import-dir backend "$WORKSPACE_PATH" --overwrite

# Deploy the app
echo "Deploying app to Databricks..."
databricks apps deploy "$APP_NAME" --source-code-path "$WORKSPACE_PATH"

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo ""
    echo "📝 Next steps:"
    echo "1. Go to your Databricks workspace Apps section"
    echo "2. Configure OAuth scopes if needed"
    echo "3. Start the app"
    echo "4. Access your Danone POS Analytics dashboard"
else
    echo "❌ Deployment failed. Check the error messages above."
    exit 1
fi
