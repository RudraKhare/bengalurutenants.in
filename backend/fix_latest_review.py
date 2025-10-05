"""
Fix reviews that have rating text in the comment field
Remove the rating breakdown but keep the actual user's review text
Example: "Overall Rating: 2/5 Cleanliness: 2/5... Good Property !" -> "Good Property !"
"""
import os
import re
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

def extract_review_text(comment):
    """
    Extract actual review text by removing rating patterns
    Pattern to remove: "Overall Rating: X/5 Cleanliness: X/5 Landlord Rating: X/5 Location: X/5 Value For Money: X/5"
    """
    if not comment:
        return None
    
    # Pattern to match rating text
    # Matches: "Overall Rating: 2/5 Cleanliness: 2/5 Landlord Rating: 2/5 Location: 2/5 Value For Money: 2/5"
    pattern = r'Overall Rating:\s*\d+/5\s*Cleanliness:\s*\d+/5\s*Landlord Rating:\s*\d+/5\s*Location:\s*\d+/5\s*Value For Money:\s*\d+/5\s*'
    
    # Remove the rating text
    clean_text = re.sub(pattern, '', comment, flags=re.IGNORECASE).strip()
    
    # If nothing left after cleaning, return None
    if not clean_text or len(clean_text) < 3:
        return None
    
    return clean_text

with engine.connect() as conn:
    # Find reviews with rating text pattern in comments
    result = conn.execute(text("""
        SELECT id, property_id, rating, comment, created_at 
        FROM reviews 
        WHERE comment LIKE '%Overall Rating:%' 
           OR comment LIKE '%Cleanliness:%'
           OR comment LIKE '%Landlord Rating:%'
           OR comment LIKE '%Value For Money:%'
        ORDER BY created_at DESC
    """))
    
    reviews = result.fetchall()
    print(f"\n{'='*80}")
    print(f"Found {len(reviews)} review(s) with rating text in comments")
    print(f"{'='*80}\n")
    
    if reviews:
        updates = []
        for r in reviews:
            review_id = r[0]
            current_comment = r[3]
            clean_comment = extract_review_text(current_comment)
            
            print(f"Review ID: {review_id}")
            print(f"Property ID: {r[1]}")
            print(f"Rating: {r[2]}/5")
            print(f"Created: {r[4]}")
            print(f"BEFORE: {current_comment}")
            print(f"AFTER:  {clean_comment if clean_comment else '(empty - will be NULL)'}")
            print("-" * 80)
            
            updates.append((review_id, clean_comment))
        
        print("\n⚠️  These reviews will be cleaned to remove rating text.")
        print("Only the user's actual review text will be kept.\n")
        
        choice = input("Clean all these comments? (yes/no): ").strip().lower()
        
        if choice == "yes":
            # Update each review with cleaned comment
            for review_id, clean_comment in updates:
                conn.execute(
                    text("UPDATE reviews SET comment = :comment WHERE id = :id"),
                    {"comment": clean_comment, "id": review_id}
                )
            conn.commit()
            print(f"\n✅ Successfully cleaned {len(reviews)} review comment(s)!")
            print("Rating text removed, user review text preserved.")
        else:
            print("\n❌ No changes made.")
    else:
        print("✅ No reviews with rating text found. All comments are clean!")
