#!/bin/bash

echo "🐳 Starting Danone POS Analytics with Docker Compose..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Build and start the services
echo "Building and starting services..."
docker-compose up --build

echo ""
echo "🚀 Application should be available at:"
echo "📱 Backend API: http://localhost:8000"
echo "🌐 API Health: http://localhost:8000/health"
echo "📊 POS Data: http://localhost:8000/api/pos-submissions"
echo ""
echo "To stop the services, press Ctrl+C"
