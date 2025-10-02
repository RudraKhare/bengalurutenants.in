@echo off
REM Quick Start Script for Map Feature Testing (Windows)

echo.
echo 🗺️  Bengaluru Tenants - Map Feature Test
echo ==========================================
echo.

REM Check backend
curl -s http://localhost:8000/health >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Backend is not running!
    echo.
    echo Please start the backend first:
    echo   cd backend
    echo   uvicorn app.main:app --reload
    echo.
    pause
    exit /b 1
)

echo ✅ Backend is running at http://localhost:8000

REM Check frontend
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Frontend is not running!
    echo.
    echo Please start the frontend first:
    echo   cd frontend
    echo   npm run dev
    echo.
    pause
    exit /b 1
)

echo ✅ Frontend is running at http://localhost:3000
echo.
echo 🎉 Map Feature is ready!
echo.
echo 📍 Test These Features:
echo   1. Property Search with Map
echo      http://localhost:3000/property/search
echo.
echo   2. Add Property with Location
echo      http://localhost:3000/property/add
echo.
echo   3. View Modes (on search page):
echo      - 📋 List View
echo      - 🗂️  Split View (List + Map)
echo      - 🗺️  Map View (Full screen)
echo.
echo 🔑 API Endpoints:
echo   POST http://localhost:8000/api/v1/geocoding/geocode
echo   POST http://localhost:8000/api/v1/geocoding/reverse-geocode
echo   GET  http://localhost:8000/api/v1/properties?latitude=12.9716^&longitude=77.5946^&radius_km=5
echo.
echo 📖 Documentation: docs\MAP_FEATURE_GUIDE.md
echo.
pause
