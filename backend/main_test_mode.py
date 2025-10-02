"""
Test server that runs without database dependency.
Use this to test your FastAPI endpoints while fixing the database connection.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="Bengaluru Tenants API (Test Mode)",
    description="Tenant review platform API running in test mode without database",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Root endpoint with basic API information."""
    return {
        "message": "Welcome to Bengaluru Tenants API (Test Mode)",
        "docs": "/docs",
        "health": "/health",
        "version": "1.0.0",
        "mode": "test_without_database"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "mode": "test_mode",
        "database": "disconnected",
        "message": "API is running without database connection"
    }

@app.get("/api/test")
async def test_endpoint():
    """Test endpoint to verify API functionality."""
    return {
        "status": "success",
        "message": "FastAPI is working correctly",
        "frontend_can_connect": True
    }

if __name__ == "__main__":
    import uvicorn
    
    # Get host and port from environment
    host = os.getenv("API_HOST", "localhost")
    port = int(os.getenv("API_PORT", 8000))
    
    print(f"🚀 Starting test server on http://{host}:{port}")
    print(f"📖 API Documentation: http://{host}:{port}/docs")
    print(f"❤️  Health Check: http://{host}:{port}/health")
    
    # Run the application
    uvicorn.run(
        "main_test_mode:app",
        host=host,
        port=port,
        reload=True,
        log_level="info"
    )
