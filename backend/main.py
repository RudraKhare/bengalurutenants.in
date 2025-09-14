"""
Production Entry Point for Bengaluru Tenants API
This file serves as the main entry point that imports and runs the FastAPI application.

The actual application logic is in the app/ package for better organization.
Run with: uvicorn main_simple:app --reload
"""

import os
from app.main import app

# This is the entry point - the actual app is defined in app/main.py
# This pattern allows for:
# 1. Clean package structure in app/
# 2. Simple entry point for deployment
# 3. Environment-specific configurations

if __name__ == "__main__":
    import uvicorn
    
    # Development server configuration
    host = os.getenv("HOST", "localhost")
    port = int(os.getenv("PORT", 8000))
    debug = os.getenv("DEBUG", "true").lower() == "true"
    
    print("🚀 Starting Bengaluru Tenants API (Day 2 Production)")
    print(f"📍 Server: http://{host}:{port}")
    print(f"📚 API Docs: http://{host}:{port}/docs")
    print(f"🔍 Debug Mode: {debug}")
    
    uvicorn.run(
        "main:app",  # This refers to the app imported above
        host=host,
        port=port,
        reload=debug
    )
