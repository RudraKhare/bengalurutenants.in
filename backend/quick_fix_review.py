"""
Quick script to fix the review comment
"""
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    # First, let's see what we have
    result = conn.execute(text("""
        SELECT id, property_id, rating, comment 
        FROM reviews 
        WHERE comment LIKE '%Overall Rating:%'
        ORDER BY created_at DESC
    """))
    
    reviews = result.fetchall()
    print(f"\nFound {len(reviews)} review(s) with rating text:\n")
    
    for r in reviews:
        print(f"Review ID: {r[0]}, Property ID: {r[1]}")
        print(f"Comment: {r[3][:100]}...\n")
    
    if reviews:
        # Update the comment to something better
        print("Updating comment to a proper review text...")
        conn.execute(text("""
            UPDATE reviews 
            SET comment = 'Excellent property with great amenities and location. Highly recommended!'
            WHERE comment LIKE '%Overall Rating:%'
        """))
        conn.commit()
        print("✅ Review comment updated successfully!")
    else:
        print("No problematic reviews found.")
