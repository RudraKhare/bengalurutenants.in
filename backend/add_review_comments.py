"""
Add sample review text to existing reviews
"""
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

sample_comments = [
    "Great property with excellent amenities. The landlord is very cooperative and maintenance is done promptly. Location is convenient with good connectivity.",
    "Decent place to stay. Clean and well-maintained. The neighborhood is quiet and safe. Would recommend to others.",
    "Had a terrible experience. Poor maintenance and unresponsive landlord. Would not recommend.",
    "Excellent property! Very clean, modern amenities, and great location. The landlord is very understanding and helpful.",
    "Amazing place to live! Close to all amenities, peaceful neighborhood, and the property is exactly as described. Highly recommended!"
]

with engine.connect() as conn:
    # Get reviews with NULL comments
    result = conn.execute(text("""
        SELECT id, property_id, rating 
        FROM reviews 
        WHERE comment IS NULL OR comment = 'None'
        ORDER BY created_at DESC
        LIMIT 5
    """))
    
    reviews = result.fetchall()
    print(f"\nFound {len(reviews)} review(s) with NULL comments\n")
    
    if reviews:
        # Update each review with an appropriate comment based on rating
        for idx, r in enumerate(reviews):
            review_id = r[0]
            rating = r[2]
            
            # Choose comment based on rating
            if rating >= 5:
                comment = sample_comments[4]  # Excellent
            elif rating >= 4:
                comment = sample_comments[0]  # Great
            elif rating >= 3:
                comment = sample_comments[1]  # Decent
            else:
                comment = sample_comments[2]  # Poor
            
            conn.execute(
                text("UPDATE reviews SET comment = :comment WHERE id = :id"),
                {"comment": comment, "id": review_id}
            )
            print(f"✅ Updated Review ID {review_id} (Rating: {rating}/5)")
        
        conn.commit()
        print(f"\n✅ Successfully updated {len(reviews)} review(s)!")
    else:
        print("No reviews to update.")
