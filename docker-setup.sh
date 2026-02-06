#!/bin/bash
# Docker Setup & Deployment Script for Network Helper Cameroon

echo "=========================================="
echo "Network Helper - Docker Setup"
echo "=========================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

echo "✅ Docker found"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.docker..."
    cp .env.docker .env
    echo "✅ .env created with Docker defaults"
else
    echo "✅ .env file already exists"
fi

# Build images
echo ""
echo "🔨 Building Docker images..."
docker-compose build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Check errors above."
    exit 1
fi

echo "✅ Build successful"

# Start containers
echo ""
echo "🚀 Starting containers..."
docker-compose up -d

if [ $? -ne 0 ]; then
    echo "❌ Failed to start containers. Check errors above."
    exit 1
fi

echo "✅ Containers started"

# Wait for services to be ready
echo ""
echo "⏳ Waiting for services to be ready..."
sleep 5

# Test backend
echo ""
echo "🧪 Testing backend API..."
BACKEND_HEALTH=$(curl -s http://localhost:3000/api/reports/count || echo "")

if [ -z "$BACKEND_HEALTH" ]; then
    echo "⚠️  Backend might not be ready yet. Check with: docker-compose logs backend"
else
    echo "✅ Backend responding"
fi

# Test frontend
echo ""
echo "🧪 Testing frontend..."
FRONTEND_HEALTH=$(curl -s -I http://localhost/ | grep "200\|301\|302" || echo "")

if [ -z "$FRONTEND_HEALTH" ]; then
    echo "⚠️  Frontend might not be ready yet. Check with: docker-compose logs frontend"
else
    echo "✅ Frontend responding"
fi

echo ""
echo "=========================================="
echo "✅ Setup Complete!"
echo "=========================================="
echo ""
echo "📍 Access your application:"
echo "   Frontend: http://localhost"
echo "   Backend API: http://localhost:3000/api/reports/count"
echo ""
echo "📋 Useful commands:"
echo "   View logs:    docker-compose logs -f"
echo "   Stop:         docker-compose down"
echo "   Rebuild:      docker-compose up --build"
echo ""
