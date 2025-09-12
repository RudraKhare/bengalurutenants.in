"""
Check the alembic_version table contents to understand the current migration state.
"""

from db import engine
from sqlalchemy import text

def check_alembic_version():
    """Check what version Alembic thinks the database is at."""
    
    try:
        with engine.connect() as conn:
            # Check if table exists
            result = conn.execute(text("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'alembic_version'
                );
            """))
            
            table_exists = result.fetchone()[0]
            print(f"📋 Alembic Version Table Exists: {table_exists}")
            
            if table_exists:
                # Get current version
                result = conn.execute(text("SELECT version_num FROM alembic_version"))
                rows = result.fetchall()
                
                if rows:
                    print(f"🔢 Current Alembic Version: {rows[0][0]}")
                    print(f"📄 This corresponds to migration file: {rows[0][0]}.py")
                else:
                    print("⚠️  Alembic version table is empty")
            
            # Show table structure
            print(f"\n🏗️  Table Structure:")
            result = conn.execute(text("""
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns 
                WHERE table_name = 'alembic_version'
                ORDER BY ordinal_position
            """))
            
            for row in result:
                print(f"   📝 {row[0]}: {row[1]} {'NULL' if row[2] == 'YES' else 'NOT NULL'}")
                
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    check_alembic_version()
