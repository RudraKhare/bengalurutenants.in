import requests
import json

# Test the reviews API endpoint
response = requests.get('http://localhost:8000/api/v1/reviews?property_id=28')

print(f'Status Code: {response.status_code}')
print(f'Response Headers: {response.headers.get("content-type")}')

if response.status_code == 200:
    data = response.json()
    print(f'\nTotal reviews: {data["total"]}')
    print(f'Number of reviews returned: {len(data["reviews"])}')
    
    if data['reviews']:
        print('\n--- First Review ---')
        review = data['reviews'][0]
        print(f'Review ID: {review["id"]}')
        print(f'Property ID: {review["property_id"]}')
        print(f'Rating: {review["rating"]}')
        print(f'is_verified: {review.get("is_verified", "FIELD MISSING!")}')
        print(f'verification_level: {review.get("verification_level")}')
        
        # Check if review 23 is in the list
        review_23 = next((r for r in data['reviews'] if r['id'] == 23), None)
        if review_23:
            print('\n--- Review 23 (Should be verified) ---')
            print(f'is_verified: {review_23.get("is_verified", "FIELD MISSING!")}')
        else:
            print('\nReview 23 not found in results')
            
        print('\n--- All Reviews Summary ---')
        for r in data['reviews']:
            verified_status = r.get('is_verified', 'MISSING')
            print(f'  Review {r["id"]}: is_verified={verified_status}')
    else:
        print('No reviews found')
else:
    print(f'Error: {response.text}')
