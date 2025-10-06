#!/bin/bash

# Quick Start Script for Map Feature Testing

echo "🗺️  Starting Bengaluru Tenants with Map Feature..."
echo ""

# Check if backend is running
if ! curl -s http://localhost:8000/health > /dev/null; then
    echo "❌ Backend is not running!"
    echo "Please start the backend first:"
    echo "  cd backend && uvicorn app.main:app --reload"
    exit 1
fi

echo "✅ Backend is running"

# Check if frontend is running
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "❌ Frontend is not running!"
    echo "Please start the frontend first:"
    echo "  cd frontend && npm run dev"
    exit 1
fi

echo "✅ Frontend is running"
echo ""
echo "🎉 Map Feature is ready!"
echo ""
echo "📍 Available Features:"
echo "  1. Property Search with Map: http://localhost:3000/property/search"
echo "  2. Add Property with Location: http://localhost:3000/property/add"
echo "  3. View Properties on Map (click 'Map' view toggle)"
echo ""
echo "🔑 API Endpoints:"
echo "  - POST /api/v1/geocoding/geocode - Convert address to coordinates"
echo "  - POST /api/v1/geocoding/reverse-geocode - Convert coordinates to address"
echo "  - GET /api/v1/properties?latitude=12.9716&longitude=77.5946&radius_km=5"
echo ""
echo "📖 Documentation: docs/MAP_FEATURE_GUIDE.md"
