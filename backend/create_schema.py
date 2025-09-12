"""
Create database schema directly using SQLAlchemy.
This bypasses migration issues and creates all tables directly.
"""

import os
from sqlalchemy import create_engine
from dotenv import load_dotenv
from models import Base
from db import engine

def create_database_schema():
    """Create all database tables directly."""
    
    print("🗃️  CREATING DATABASE SCHEMA")
    print("=" * 40)
    
    try:
        # Create all tables
        print("📋 Creating tables...")
        Base.metadata.create_all(bind=engine)
        print("✅ All tables created successfully!")
        
        # Show what was created
        from sqlalchemy import inspect
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        print(f"\n📊 Created Tables ({len(tables)}):")
        for table in tables:
            print(f"  ✅ {table}")
            
        print(f"\n🎉 Database schema setup complete!")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    create_database_schema()
