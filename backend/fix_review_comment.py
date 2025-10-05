"""
Script to find and fix reviews with rating text in the comment field
"""

import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Load environment variables
load_dotenv()

# Get database URL
DATABASE_URL = os.getenv("DATABASE_URL")

# Create engine and session
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

def fix_review_comments():
    """Find and fix reviews with rating text in comments"""
    db = SessionLocal()
    
    try:
        # Find problematic reviews
        from sqlalchemy import text
        
        query = text("""
            SELECT id, property_id, rating, comment, created_at 
            FROM reviews 
            WHERE comment LIKE '%Overall Rating:%' 
               OR comment LIKE '%Cleanliness:%'
               OR comment LIKE '%Value For Money:%'
        """)
        
        result = db.execute(query)
        reviews = result.fetchall()
        
        print(f"\n✅ Found {len(reviews)} problematic review(s):\n")
        
        for review in reviews:
            print(f"ID: {review[0]}")
            print(f"Property ID: {review[1]}")
            print(f"Rating: {review[2]}")
            print(f"Comment: {review[3][:150]}...")
            print(f"Created: {review[4]}")
            print("-" * 80)
        
        if reviews:
            print("\n" + "="*80)
            print("OPTIONS TO FIX:")
            print("="*80)
            print("\n1. Set comment to NULL (empty)")
            print("2. Replace with placeholder text")
            print("3. Delete the review entirely")
            print("4. Do nothing (exit)")
            
            choice = input("\nEnter your choice (1-4): ").strip()
            
            if choice == "1":
                # Set comment to NULL
                update_query = text("""
                    UPDATE reviews 
                    SET comment = NULL
                    WHERE comment LIKE '%Overall Rating:%'
                """)
                db.execute(update_query)
                db.commit()
                print("\n✅ Successfully set comment to NULL")
                
            elif choice == "2":
                # Replace with placeholder
                placeholder = input("Enter placeholder text: ").strip()
                if placeholder:
                    update_query = text("""
                        UPDATE reviews 
                        SET comment = :placeholder
                        WHERE comment LIKE '%Overall Rating:%'
                    """)
                    db.execute(update_query, {"placeholder": placeholder})
                    db.commit()
                    print(f"\n✅ Successfully updated comment to: {placeholder}")
                    
            elif choice == "3":
                # Delete review
                confirm = input("⚠️  Are you sure you want to DELETE this review? (yes/no): ").strip().lower()
                if confirm == "yes":
                    delete_query = text("""
                        DELETE FROM reviews 
                        WHERE comment LIKE '%Overall Rating:%'
                    """)
                    db.execute(delete_query)
                    db.commit()
                    print("\n✅ Successfully deleted the review")
                else:
                    print("\n❌ Deletion cancelled")
                    
            elif choice == "4":
                print("\n❌ No changes made")
            else:
                print("\n❌ Invalid choice. No changes made")
        else:
            print("\n✅ No problematic reviews found!")
            
    except Exception as e:
        print(f"\n❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("="*80)
    print("FIX REVIEW COMMENTS - Remove Rating Text from Comment Field")
    print("="*80)
    fix_review_comments()
