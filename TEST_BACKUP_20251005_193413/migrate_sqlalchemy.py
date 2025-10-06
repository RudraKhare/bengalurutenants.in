#!/usr/bin/env python3
"""
Migration script to add property_type column to reviews table using SQLAlchemy
Run this to fix the database schema issue
"""

import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def run_migration():
    """Run the migration to add property_type column to reviews table"""
    
    # Get database URL
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("❌ ERROR: DATABASE_URL environment variable not found")
        print("Please set the DATABASE_URL in your .env file")
        return False
    
    try:
        # Create engine
        print("🔗 Connecting to database...")
        engine = create_engine(database_url)
        
        # Migration SQL
        migration_sql = """
        -- Add property_type column to existing reviews table if it doesn't exist
        DO $$ 
        DECLARE
            enum_values text[];
        BEGIN
            -- Check if property_type column exists in reviews table, if not add it
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                           WHERE table_name='reviews' AND column_name='property_type') THEN
                
                -- Get all existing enum values for propertytype
                SELECT array_agg(enumlabel ORDER BY enumsortorder) INTO enum_values
                FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid 
                WHERE t.typname = 'propertytype';
                
                RAISE NOTICE 'Available propertytype enum values for reviews: %', array_to_string(enum_values, ', ');
                
                -- Add the column (nullable for existing reviews)
                ALTER TABLE reviews ADD COLUMN property_type propertytype;
                
                RAISE NOTICE 'property_type column added to reviews table successfully';
            ELSE
                RAISE NOTICE 'property_type column already exists in reviews table';
            END IF;
        END $$;
        """
        
        print("🔧 Running migration...")
        with engine.connect() as conn:
            # Execute migration
            conn.execute(text(migration_sql))
            conn.commit()
            
            # Verify the column was added
            result = conn.execute(text("""
                SELECT column_name, data_type, is_nullable 
                FROM information_schema.columns 
                WHERE table_name = 'reviews' 
                AND column_name = 'property_type'
            """))
            
            row = result.fetchone()
            if row:
                print(f"✅ SUCCESS: property_type column exists")
                print(f"   Column: {row[0]}")
                print(f"   Type: {row[1]}")
                print(f"   Nullable: {row[2]}")
            else:
                print("❌ ERROR: property_type column not found after migration")
                return False
        
        print("🎉 Migration completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ ERROR during migration: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Starting database migration for property_type column...")
    success = run_migration()
    
    if success:
        print("\n✅ Migration successful! You can now create reviews with property_type.")
        sys.exit(0)
    else:
        print("\n❌ Migration failed. Please check the error messages above.")
        sys.exit(1)
