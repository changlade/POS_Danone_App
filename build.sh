#!/bin/bash

echo "🏗️  Building Danone POS App for Databricks Apps..."

# Clean previous builds
echo "Cleaning previous builds..."
rm -rf backend/static

# Build the React frontend using Docker
echo "Building React frontend..."
cd frontend
docker build -f Dockerfile.build -t danone-frontend-builder .

# Create output directory
mkdir -p ../backend/static

# Extract built files from Docker container
echo "Extracting built files..."
docker run --rm -v "$(pwd)/../backend/static:/output-volume" danone-frontend-builder

cd ..

# Verify the build
if [ -f "backend/static/index.html" ]; then
    echo "✅ Frontend build successful!"
    echo "📁 Static files available in backend/static/"
    ls -la backend/static/
else
    echo "❌ Frontend build failed!"
    exit 1
fi

echo ""
echo "🚀 Ready for Databricks Apps deployment!"
echo ""
echo "Next steps:"
echo "1. Test locally: cd backend && python -m uvicorn app:app --reload"
echo "2. Deploy to Databricks using the deploy.sh script"
