#!/bin/bash

echo "🧪 Testing Databricks database connection within Docker container..."
echo ""

# Build the backend image if it doesn't exist
if ! docker images | grep -q "danone-backend"; then
    echo "🏗️  Building backend container..."
    cd backend
    docker build -t danone-backend .
    cd ..
    echo ""
fi

# Run database test within the container
echo "🐳 Running database test in container..."
docker run --rm danone-backend python3 test-database.py

echo ""
echo "📝 Note: This test runs within the containerized environment"
echo "where PostgreSQL dependencies are properly installed."
