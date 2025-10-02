#!/usr/bin/env python3
"""
Comprehensive database connection diagnostic script.
This will help debug exactly what's wrong with your Supabase connection.
"""

import os
import socket
import sys
from urllib.parse import urlparse
from dotenv import load_dotenv

def diagnose_connection():
    """
    Step-by-step diagnosis of database connection issues.
    """
    print("🔍 DATABASE CONNECTION DIAGNOSTIC TOOL")
    print("=" * 50)
    
    # Load environment variables
    load_dotenv()
    database_url = os.getenv("DATABASE_URL")
    
    if not database_url:
        print("❌ ERROR: DATABASE_URL not found in environment")
        return False
    
    print(f"📋 DATABASE_URL found: {database_url}")
    print()
    
    # Parse the URL
    try:
        parsed = urlparse(database_url)
        print("✅ URL PARSING SUCCESSFUL")
        print(f"   Protocol: {parsed.scheme}")
        print(f"   Username: {parsed.username}")
        print(f"   Password: {'*' * len(parsed.password) if parsed.password else 'None'}")
        print(f"   Hostname: {parsed.hostname}")
        print(f"   Port: {parsed.port}")
        print(f"   Database: {parsed.path[1:] if parsed.path.startswith('/') else parsed.path}")
        print()
    except Exception as e:
        print(f"❌ URL PARSING FAILED: {e}")
        return False
    
    # Test DNS resolution
    hostname = parsed.hostname
    print(f"🌐 TESTING DNS RESOLUTION FOR: {hostname}")
    try:
        ip_address = socket.gethostbyname(hostname)
        print(f"✅ DNS RESOLUTION SUCCESSFUL: {ip_address}")
        print()
    except socket.gaierror as e:
        print(f"❌ DNS RESOLUTION FAILED: {e}")
        print("   Possible causes:")
        print("   - Incorrect hostname/project ID")
        print("   - Supabase project was deleted")
        print("   - Network connectivity issues")
        print("   - DNS server problems")
        return False
    
    # Test TCP connection
    port = parsed.port or 5432
    print(f"🔌 TESTING TCP CONNECTION TO: {ip_address}:{port}")
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(10)  # 10 second timeout
        result = sock.connect_ex((ip_address, port))
        sock.close()
        
        if result == 0:
            print("✅ TCP CONNECTION SUCCESSFUL")
            print()
        else:
            print(f"❌ TCP CONNECTION FAILED: Error code {result}")
            return False
    except Exception as e:
        print(f"❌ TCP CONNECTION FAILED: {e}")
        return False
    
    # Test PostgreSQL connection
    print("🐘 TESTING POSTGRESQL CONNECTION...")
    try:
        import psycopg2
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()
        cursor.execute("SELECT version();")
        version = cursor.fetchone()[0]
        print(f"✅ POSTGRESQL CONNECTION SUCCESSFUL")
        print(f"   Server version: {version}")
        cursor.close()
        conn.close()
        print()
    except ImportError:
        print("⚠️  psycopg2 not installed, skipping PostgreSQL test")
    except Exception as e:
        print(f"❌ POSTGRESQL CONNECTION FAILED: {e}")
        return False
    
    # Test SQLAlchemy connection
    print("🔧 TESTING SQLALCHEMY CONNECTION...")
    try:
        from sqlalchemy import create_engine, text
        engine = create_engine(database_url)
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            print("✅ SQLALCHEMY CONNECTION SUCCESSFUL")
            print()
    except ImportError:
        print("⚠️  SQLAlchemy not installed, skipping test")
    except Exception as e:
        print(f"❌ SQLALCHEMY CONNECTION FAILED: {e}")
        return False
    
    print("🎉 ALL CONNECTION TESTS PASSED!")
    print("   Your database connection is working correctly.")
    print("   The migration should work now.")
    return True

def suggest_fixes():
    """
    Provide specific suggestions based on common issues.
    """
    print("\n🛠️  COMMON FIXES:")
    print("=" * 30)
    print("1. Check Supabase Project Status:")
    print("   - Go to https://supabase.com/dashboard")
    print("   - Verify your project exists and is active")
    print("   - Check project settings > Database")
    print()
    print("2. Get Correct Connection String:")
    print("   - Project Settings > Database > Connection string")
    print("   - Copy the URI format (not the .env format)")
    print()
    print("3. Common Connection String Issues:")
    print("   - Special characters in password need URL encoding")
    print("   - @ symbol in password should be %40")
    print("   - Make sure no extra brackets [ ] around values")
    print()
    print("4. Network Troubleshooting:")
    print("   - Try from different network (mobile hotspot)")
    print("   - Check corporate firewall settings")
    print("   - Verify DNS settings")

if __name__ == "__main__":
    success = diagnose_connection()
    if not success:
        suggest_fixes()
