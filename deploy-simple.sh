#!/bin/bash

# Simple deployment script for Databricks Apps
APP_NAME="danone-pos-analytics"
WORKSPACE_PATH="/Workspace/Apps/$APP_NAME"

echo "🚀 Simple Databricks Apps Deployment..."

# Build first
echo "🏗️  Building application..."
./build.sh

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Aborting."
    exit 1
fi

echo "📋 Manual deployment steps:"
echo ""
echo "1. Create app directory in Databricks workspace:"
echo "   databricks workspace mkdirs '$WORKSPACE_PATH'"
echo ""
echo "2. Upload the backend folder:"
echo "   databricks workspace import-dir backend '$WORKSPACE_PATH' --overwrite"
echo ""
echo "3. Create the app:"
echo "   databricks apps create '$APP_NAME'"
echo ""
echo "4. Deploy the app:"
echo "   databricks apps deploy '$APP_NAME' --source-code-path '$WORKSPACE_PATH'"
echo ""
echo "Alternatively, try the Databricks workspace UI:"
echo "1. Go to your Databricks workspace"
echo "2. Navigate to Apps section"
echo "3. Create new app"
echo "4. Upload the backend/ folder contents"
echo "5. Configure and deploy"

# Try automatic deployment
echo ""
read -p "🤖 Try automatic deployment? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Creating workspace directory..."
    databricks workspace mkdirs "$WORKSPACE_PATH"
    
    echo "Uploading backend files..."
    databricks workspace import-dir backend "$WORKSPACE_PATH" --overwrite
    
    echo "Deploying app..."
    databricks apps deploy "$APP_NAME" --source-code-path "$WORKSPACE_PATH"
    
    if [ $? -eq 0 ]; then
        echo "✅ Deployment successful!"
    else
        echo "❌ Automatic deployment failed. Try manual steps above."
    fi
fi
