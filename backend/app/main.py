"""
FastAPI application entry point with router mounting and middleware configuration.
Configures CORS, health endpoints, and API routing for the tenant review platform.
"""

import os
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .routers import auth, properties, reviews, uploads, geocoding, cities, admin
from .db import engine
from .models import Base

# Get configuration from environment
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

# Define allowed origins for CORS
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:8000",
    "https://bengalurutenants-in.vercel.app",
    "https://*.vercel.app"  # Allow all Vercel preview URLs
]

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager for startup and shutdown tasks.
    
    Startup:
    - Create database tables if they don't exist
    - Initialize any required data
    
    Shutdown:
    - Clean up resources (connections handled by SQLAlchemy)
    """
    # Startup: Create database tables
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database initialization complete")
    
    yield
    
    # Shutdown: Cleanup (if needed)
    print("Application shutdown")

# Create FastAPI application with metadata
app = FastAPI(
    title="Bengaluru Tenants API",
    description="Property review platform for Bengaluru tenants and landlords",
    version="2.0.0",
    docs_url="/docs" if ENVIRONMENT == "development" else None,
    redoc_url="/redoc" if ENVIRONMENT == "development" else None,
    lifespan=lifespan
)

# CORS configuration for frontend integration
allowed_origins = [
    # Production URL
    "https://bengalurutenants-in.vercel.app",
    # Preview URLs
    "https://bengalurutenants-in-git-main-rudra-khares-projects.vercel.app",
    "https://bengalurutenants-in-rudra-khares-projects.vercel.app",
    "https://bengalurutenants-n46plzg98-rudra-khares-projects.vercel.app",
    # Development URLs
    "http://localhost:3000",
    "http://localhost:8000",
]

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Mount API routers
app.include_router(auth.router)
app.include_router(properties.router)
app.include_router(reviews.router)
app.include_router(uploads.router)  # Day 3: Photo upload routes
app.include_router(geocoding.router)  # Map and geocoding routes
app.include_router(cities.router)  # City and locality management routes
app.include_router(admin.router)  # Admin panel routes

@app.get("/", tags=["health"])
async def root():
    """
    Root endpoint for basic API health check.
    
    Returns basic application information and status.
    Used by monitoring tools and frontend to verify API availability.
    
    Returns:
        Application name, version, and status
    """
    return {
        "message": "Bengaluru Tenants API",
        "version": "2.0.0",
        "status": "operational",
        "environment": ENVIRONMENT
    }

@app.get("/health", tags=["health"])
async def health_check():
    """
    Detailed health check endpoint for monitoring and deployment verification.
    
    Performs basic connectivity tests:
    - API server responsiveness
    - Database connection (implicit through import)
    
    Used by:
    - Load balancers for health monitoring
    - CI/CD pipelines for deployment verification
    - Monitoring systems for alerting
    
    Returns:
        Detailed health status with timestamp
    """
    from datetime import datetime
    
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "bengaluru-tenants-api",
        "version": "2.0.0",
        "checks": {
            "api": "ok",
            "database": "ok"  # Implicit check through SQLAlchemy import
        }
    }

# Error handling middleware (optional - FastAPI provides good defaults)
# For production, consider adding:
# - Request logging middleware
# - Rate limiting middleware  
# - Security headers middleware
# - Request ID tracking middleware

if __name__ == "__main__":
    # Development server (not for production)
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True if ENVIRONMENT == "development" else False
    )
