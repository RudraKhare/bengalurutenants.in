"""
FastAPI main application entry point.
Handles CORS, middleware, and route configuration.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Bengaluru Tenants API",
    description="API for tenant reviews and property information platform",
    version="1.0.0",
    docs_url="/docs",  # Swagger UI
    redoc_url="/redoc"  # ReDoc
)
"""
What Happens When We Initialize FastAPI
from fastapi import FastAPI

Loads the FastAPI class, which is a subclass of Starlette’s Starlette application.

Starlette is the ASGI framework FastAPI builds on.

When you call app = FastAPI():

a. Create an ASGI Application Object

ASGI = Asynchronous Server Gateway Interface (successor of WSGI).

The object app is a callable (__call__ implemented) that any ASGI server (like Uvicorn, Hypercorn) can run.

This object will receive every HTTP/WebSocket request and produce a response.

b. Initialize the Routing System

Internally, FastAPI creates a router (a fastapi.routing.APIRouter) and attaches it to the app.

This router holds a table of endpoints and the HTTP methods they support.

At this moment the table is empty—you’ll populate it with @app.get, @app.post, etc.

c. Prepare Dependency Injection

FastAPI sets up the dependency injection framework so that, later, it can resolve Depends(...) for each request.

🔄 Complete Request Flow:
1. Browser sends: GET /users/123
2. CORS Middleware: "Adding CORS headers..."
3. FastAPI Router: "Route matches /users/{user_id}"
4. Parameter Extraction: user_id = 123
5. Dependency Injection: db = get_db()
6. Route Function: get_user(user_id=123, db=session)
7. Database Query: SELECT * FROM users WHERE id = 123
8. Pydantic Serialization: Convert User object to JSON
9. Response Headers: Content-Type: application/json
10. Browser receives: {"id": 123, "email": "user@example.com"}

Ready to Run

When you start Uvicorn:
uvicorn main:app --reload

Uvicorn gives every incoming HTTP request to app.

FastAPI looks up the route in its list, calls the right Python function, and sends the JSON back to the user.
"""

# Configure CORS
origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    """
    Health check endpoint for monitoring and load balancers.
    Returns current status and timestamp.
    """
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "bengaluru-tenants-api",
        "version": "1.0.0"
    }

# Root endpoint
@app.get("/")
async def root():
    """
    Root endpoint with basic API information.
    """
    return {
        "message": "Welcome to Bengaluru Tenants API",
        "docs": "/docs",
        "health": "/health",
        "version": "1.0.0"
    }

# TODO: Add authentication routes
# TODO: Add property routes
# TODO: Add review routes  
# TODO: Add user routes
# TODO: Add verification routes

if __name__ == "__main__":
    import uvicorn
    
    # Get host and port from environment
    host = os.getenv("API_HOST", "localhost")
    port = int(os.getenv("API_PORT", 8000))
    debug = os.getenv("DEBUG", "true").lower() == "true"
    
    # Run the application
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=debug,
        log_level="info" if not debug else "debug"
    )
