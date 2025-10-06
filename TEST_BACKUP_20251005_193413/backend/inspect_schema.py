"""
Simple script to view your database schema from the backend.
Run this to see what tables and structure you have.
"""

import os
from sqlalchemy import create_engine, text, inspect
from dotenv import load_dotenv

# Load environment
load_dotenv()

def view_database_schema():
    """Display complete database schema information."""
    
    try:
        # Connect to database
        engine = create_engine(os.getenv('DATABASE_URL'))
        inspector = inspect(engine)
        
        print("🗃️  DATABASE SCHEMA OVERVIEW")
        print("=" * 50)
        
        # Get all tables
        tables = inspector.get_table_names()
        print(f"\n📋 Tables ({len(tables)}):")
        for table in tables:
            print(f"  ✅ {table}")
        
        # Show details for each table
        for table_name in tables:
            print(f"\n🔍 Table: {table_name}")
            print("-" * 30)
            
            # Get columns
            columns = inspector.get_columns(table_name)
            for col in columns:
                nullable = "NULL" if col['nullable'] else "NOT NULL"
                default = f" DEFAULT {col['default']}" if col['default'] else ""
                print(f"  📝 {col['name']:<20} {str(col['type']):<15} {nullable}{default}")
            
            # Get foreign keys
            fks = inspector.get_foreign_keys(table_name)
            if fks:
                print("  🔗 Foreign Keys:")
                for fk in fks:
                    print(f"    {fk['constrained_columns']} → {fk['referred_table']}.{fk['referred_columns']}")
            
            # Get indexes
            indexes = inspector.get_indexes(table_name)
            if indexes:
                print("  📊 Indexes:")
                for idx in indexes:
                    unique = "UNIQUE " if idx['unique'] else ""
                    print(f"    {unique}{idx['name']}: {idx['column_names']}")
        
        print(f"\n✅ Schema inspection complete!")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    view_database_schema()
