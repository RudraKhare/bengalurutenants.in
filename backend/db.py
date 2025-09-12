"""
Database configuration and session management.
Handles SQLAlchemy engine, session factory, and base model setup.
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
        "Please set it to your Supabase PostgreSQL connection string."
    )

# Create SQLAlchemy engine
# echo=True enables SQL query logging for development
engine = create_engine(
    DATABASE_URL,
    echo=os.getenv("DEBUG", "false").lower() == "true",
    # Connection pool settings for production
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,  # Verify connections before use
    pool_recycle=300,    # Recycle connections every 5 minutes
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all models
Base = declarative_base()

def get_db():
    """
    Dependency function to get database session.
    Use with FastAPI dependency injection:
    
    @app.get("/users")
    def get_users(db: Session = Depends(get_db)):
        ...
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    """
    Create all tables in the database.
    This is typically handled by Alembic migrations.
    """
    Base.metadata.create_all(bind=engine)

def drop_tables():
    """
    Drop all tables in the database.
    USE WITH CAUTION - only for development/testing.
    """
    Base.metadata.drop_all(bind=engine)
