"""
Database configuration and session management.
Handles SQLAlchemy engine, session factory, and base model setup.
Think of it as the bridge between your Python code and PostgreSQL database.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load environment variables
load_dotenv() # reads .env file

# Database URL from environment (Supabase connection string)
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError(
        "DATABASE_URL environment variable is required. "
        "Please set it to your Supabase PostgreSQL connection string."
    )

# Create SQLAlchemy engine // Creating the database engine (connection manager)
# echo=True enables SQL query logging for development
#Connection pooling prevents the overhead of creating new database connections for every request.
#Without connection pooling: Every API request would create a new database connection (slow and expensive) With connection pooling: Connections are reused (fast and efficient)
engine = create_engine(
    DATABASE_URL,
    echo=os.getenv("DEBUG", "false").lower() == "true",
    # Connection pool settings for production
    pool_size=5, # Opens 5 persistent connections to the database
    max_overflow=10, # Can create 10 more connections if needed (total 15 max)
    pool_pre_ping=True,  # Verify connections before use
    pool_recycle=300,    # Recycle connections every 5 minutes
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all models reating base class that all your models will inherit from Background: This is where SQLAlchemy's "magic" lives - it converts Python classes to database tables.
Base = declarative_base()

"""
What this creates:

Base is a special class that gives "database powers" to any class that inherits from it
When you write class User(Base), you're saying "User is a database table"
SQLAlchemy uses this to track all your models and generate appropriate SQL
Think of it like:

Base = "Database Table Template"
User(Base) = "User is a database table built from the template"
Property(Base) = "Property is a database table built from the template"
"""
def get_db():
    """
    Dependency function to get database session.
    Use with FastAPI dependency injection:
    
    # In your API route:
    @app.get("/users/{user_id}")
    def get_user_endpoint(user_id: int, db: Session = Depends(get_db)):
        # FastAPI automatically calls get_db() and passes the session here
        user = db.query(User).filter(User.id == user_id).first()
        return user
        ...
    """
    db = SessionLocal() # Get a database session from the pool
    try:
        yield db    # Give this session to the API route
    finally:
        db.close()  # Always close the session when done
        
        """
        Under the hood:

    FastAPI sees Depends(get_db)
    Calls get_db() which returns a database session
    Passes that session to your route function as db
    When route finishes, automatically closes the session
    
    """

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
