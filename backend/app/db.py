"""
Database configuration and session management for Day 2.
Provides SQLAlchemy engine, session factory, and base model setup.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database URL from environment (Supabase connection string)
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError(
        "DATABASE_URL environment variable is required. "
        "Please set it to your PostgreSQL connection string."
    )

# Create SQLAlchemy engine with Supabase-optimized connection settings
engine = create_engine(
    DATABASE_URL,
    echo=os.getenv("DEBUG", "false").lower() == "true",  # Log SQL queries in debug mode
    # Supabase-friendly connection pool settings
    pool_size=3,        # Smaller pool for Supabase compatibility
    max_overflow=7,     # + 7 overflow connections = 10 total max
    pool_pre_ping=True, # Verify connections before use
    pool_recycle=1800,  # Recycle connections every 30 minutes for Supabase
    pool_timeout=30,    # Wait 30 seconds for connection
    # Additional Supabase compatibility settings
    connect_args={
        "options": "-c timezone=utc",
        "sslmode": "require",
        "application_name": "bengaluru_tenants_api"
    }
)

# Create session factory
# autocommit=False: Changes aren't saved until you call commit()
# autoflush=False: Don't automatically flush pending changes
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all models
# All your SQLAlchemy models will inherit from this
Base = declarative_base()

def get_db():
    """
    Dependency function to get database session.
    This is used with FastAPI dependency injection.
    
    Usage:
    @app.get("/users")
    def get_users(db: Session = Depends(get_db)):
        return crud.get_users(db)
    
    The session is automatically closed after the request completes.
    """
    db = SessionLocal()
    try:
        yield db  # Provide database session to the route function
    finally:
        db.close()  # Always close the session when done
