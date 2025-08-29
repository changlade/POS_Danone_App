#!/bin/bash

echo "🏃 Running Danone POS Analytics locally..."

# Check if static files exist
if [ ! -f "backend/static/index.html" ]; then
    echo "🏗️  Building frontend first..."
    ./build.sh
fi

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install Python 3."
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "🔧 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔌 Activating virtual environment..."
source venv/bin/activate

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
pip install -r requirements.txt

# Start the server
echo "🚀 Starting FastAPI server..."
echo "Access the app at: http://localhost:8000"
echo "Press Ctrl+C to stop"
echo ""

uvicorn app:app --reload --host 0.0.0.0 --port 8000
