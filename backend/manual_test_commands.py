"""
Manual API Testing Commands for Day 3

Copy and paste these commands in your browser or API testing tool like Postman.
Your server is running at http://localhost:8000
"""

# 1. Check API Documentation
print("1. Open this URL in your browser:")
print("http://localhost:8000/docs")
print("")

# 2. Test Health Endpoint
print("2. Test Health Endpoint:")
print("GET http://localhost:8000/health")
print("")

# 3. Test Magic Link Generation (for authentication)
print("3. Generate Magic Link:")
print("POST http://localhost:8000/api/v1/auth/magic-link")
print("Content-Type: application/json")
print('{"email": "test@example.com"}')
print("")

# 4. Check outbox.log for magic link
print("4. Check magic link in outbox.log file")
print("")

# 5. Test Upload Endpoint (after getting token)
print("5. Test Upload Endpoint (needs authentication token):")
print("POST http://localhost:8000/api/v1/uploads/signed-url")
print("Authorization: Bearer YOUR_TOKEN_HERE")
print("Content-Type: application/json")
print('{"content_type": "image/jpeg", "file_type": "review"}')
print("")

print("Expected Responses:")
print("- Health: 200 OK with status details")
print("- Magic Link: 200 OK with success message")  
print("- Upload: 200 OK with presigned_url and object_key")
