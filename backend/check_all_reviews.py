"""
Check all reviews to see what's in the comment field
"""
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    # Get all reviews
    result = conn.execute(text("""
        SELECT id, property_id, rating, comment, is_verified, created_at 
        FROM reviews 
        ORDER BY created_at DESC
        LIMIT 5
    """))
    
    reviews = result.fetchall()
    print(f"\nFound {len(reviews)} recent review(s):\n")
    print("="*80)
    
    for r in reviews:
        print(f"Review ID: {r[0]}")
        print(f"Property ID: {r[1]}")
        print(f"Rating: {r[2]}")
        print(f"Is Verified: {r[4]}")
        print(f"Created: {r[5]}")
        print(f"Comment: '{r[3]}'")
        print("-"*80)
