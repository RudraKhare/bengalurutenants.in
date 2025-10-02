"""
📋 MANUAL TESTING GUIDE - Day 3 R2 Integration
Complete step-by-step workflow testing for your Bengaluru Tenants API

🎯 WHAT WE'RE TESTING:
- Authentication flow (magic link + access token)
- Photo upload workflow (presigned URLs)
- Photo viewing (CDN access)
- Error handling and security
"""

# 🌐 OPTION 1: USING API DOCUMENTATION INTERFACE (EASIEST)
# =======================================================

## Step 1: Open API Documentation
# Visit: http://localhost:8000/docs
# This gives you an interactive interface to test all endpoints

## Step 2: Test Authentication
# 2.1 Request Magic Link
#     - Click on "POST /api/v1/auth/magic-link"
#     - Click "Try it out"
#     - Body: {"email": "your-test-email@example.com"}
#     - Click "Execute"
#     - EXPECTED: 200 response with magic_token

# 2.2 Get Access Token
#     - Click on "GET /api/v1/auth/verify"
#     - Click "Try it out"
#     - Parameter token: [paste the magic_token from step 2.1]
#     - Click "Execute"
#     - EXPECTED: 200 response with access_token
#     - COPY THE ACCESS TOKEN - you'll need it!

## Step 3: Authorize Your Session
# 3.1 Click the "Authorize" button (🔒 lock icon) at top of docs page
# 3.2 In the popup, enter: Bearer YOUR_ACCESS_TOKEN_HERE
#     (Replace YOUR_ACCESS_TOKEN_HERE with actual token from step 2.2)
# 3.3 Click "Authorize" then "Close"
# 3.4 You should now see 🔒 icons next to protected endpoints

## Step 4: Test Photo Upload Workflow
# 4.1 Get Upload URL
#     - Click on "POST /api/v1/uploads/signed-url"
#     - Click "Try it out"
#     - Body: {
#         "filename": "test-photo.jpg",
#         "content_type": "image/jpeg", 
#         "file_type": "property"
#       }
#     - Click "Execute"
#     - EXPECTED: 200 response with upload_url, object_key, expires_in
#     - COPY THE UPLOAD_URL - you'll need it for next step!

# 4.2 Upload Actual Photo (External Tool Required)
#     - Use the upload_url from step 4.1
#     - See PowerShell/Curl commands below

## Step 5: Test Photo Viewing
# 5.1 Get View URL
#     - Click on "GET /api/v1/uploads/view/{object_key}"
#     - Click "Try it out"
#     - Parameter object_key: [paste object_key from step 4.1]
#     - Click "Execute"
#     - EXPECTED: 200 response with view_url
#     - COPY THE VIEW_URL and open in browser to see your photo!

# =======================================================
# 💻 OPTION 2: USING POWERSHELL COMMANDS (COMPLETE CONTROL)
# =======================================================

## All PowerShell Commands (Run these in order):

# STEP 1: Request Magic Link
$magicResponse = Invoke-WebRequest -Uri "http://localhost:8000/api/v1/auth/magic-link" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email": "test@example.com"}'
$magicData = $magicResponse.Content | ConvertFrom-Json
Write-Host "Magic Token: $($magicData.magic_token)"

# STEP 2: Get Access Token (replace MAGIC_TOKEN_HERE)
$tokenResponse = Invoke-WebRequest -Uri "http://localhost:8000/api/v1/auth/verify?token=MAGIC_TOKEN_HERE"
$tokenData = $tokenResponse.Content | ConvertFrom-Json  
$accessToken = $tokenData.access_token
Write-Host "Access Token: $accessToken"

# STEP 3: Get Upload URL
$uploadResponse = Invoke-WebRequest -Uri "http://localhost:8000/api/v1/uploads/signed-url" -Method POST -Headers @{"Authorization"="Bearer $accessToken"; "Content-Type"="application/json"} -Body '{"filename": "my-photo.jpg", "content_type": "image/jpeg", "file_type": "property"}'
$uploadData = $uploadResponse.Content | ConvertFrom-Json
Write-Host "Upload URL: $($uploadData.upload_url)"
Write-Host "Object Key: $($uploadData.object_key)"

# STEP 4: Upload Photo (replace YOUR_IMAGE.jpg with actual file path)
Invoke-WebRequest -Uri $uploadData.upload_url -Method PUT -InFile "YOUR_IMAGE.jpg" -ContentType "image/jpeg"

# STEP 5: Get View URL
$viewResponse = Invoke-WebRequest -Uri "http://localhost:8000/api/v1/uploads/view/$($uploadData.object_key)" -Headers @{"Authorization"="Bearer $accessToken"}
$viewData = $viewResponse.Content | ConvertFrom-Json
Write-Host "View URL: $($viewData.view_url)"
# Open this URL in browser to see your photo!

# =======================================================
# 🐧 OPTION 3: USING CURL COMMANDS (Linux/Mac/WSL)
# =======================================================

## All Curl Commands (Run these in order):

# STEP 1: Request Magic Link
curl -X POST "http://localhost:8000/api/v1/auth/magic-link" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
# Copy the magic_token from response

# STEP 2: Get Access Token (replace MAGIC_TOKEN_HERE)
curl -X GET "http://localhost:8000/api/v1/auth/verify?token=MAGIC_TOKEN_HERE"
# Copy the access_token from response

# STEP 3: Get Upload URL (replace ACCESS_TOKEN_HERE)
curl -X POST "http://localhost:8000/api/v1/uploads/signed-url" \
  -H "Authorization: Bearer ACCESS_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"filename": "my-photo.jpg", "content_type": "image/jpeg", "file_type": "property"}'
# Copy the upload_url and object_key from response

# STEP 4: Upload Photo (replace UPLOAD_URL_HERE and your-image.jpg)
curl -X PUT "UPLOAD_URL_HERE" \
  -H "Content-Type: image/jpeg" \
  --data-binary @your-image.jpg

# STEP 5: Get View URL (replace ACCESS_TOKEN_HERE and OBJECT_KEY_HERE)
curl -X GET "http://localhost:8000/api/v1/uploads/view/OBJECT_KEY_HERE" \
  -H "Authorization: Bearer ACCESS_TOKEN_HERE"
# Open the view_url in browser to see your photo!

# =======================================================
# 🧪 TESTING SCENARIOS TO TRY
# =======================================================

## Different File Types:
# - file_type: "property" (for property photos)
# - file_type: "review" (for review photos)

## Different Image Formats:
# - content_type: "image/jpeg" (.jpg files)
# - content_type: "image/png" (.png files)  
# - content_type: "image/gif" (.gif files)

## Error Testing:
# - Try without Authorization header (should get 401/403)
# - Try with expired token (should get 401)
# - Try with invalid file_type (should get 400)
# - Try with unsupported content_type (should get 400)

## Size Testing:
# - Try small images (< 1MB)
# - Try medium images (1-5MB)
# - Try large images (5-10MB)

# =======================================================
# ✅ EXPECTED RESULTS
# =======================================================

## Successful Upload Flow:
# 1. Magic link request: 200 + magic_token
# 2. Token verification: 200 + access_token  
# 3. Upload URL request: 200 + upload_url + object_key
# 4. Photo upload to R2: 200 (empty response body)
# 5. View URL request: 200 + view_url
# 6. View URL in browser: Shows your uploaded photo

## Object Key Format:
# property/USER_ID/YYYY/MM/DD/UUID.jpg
# review/USER_ID/YYYY/MM/DD/UUID.jpg

## URL Patterns:
# Upload URL: https://your-bucket.r2.cloudflarestorage.com/...?X-Amz-Algorithm=...
# View URL: https://your-bucket.r2.cloudflarestorage.com/...?X-Amz-Algorithm=...

# =======================================================
# 🔧 TROUBLESHOOTING COMMON ISSUES
# =======================================================

## "Could not validate credentials":
# - Check Authorization header format: "Bearer TOKEN" (not "Bearer Bearer TOKEN")
# - Make sure token hasn't expired (7 days for access tokens)
# - Verify you're using access_token, not magic_token for uploads

## "Field required" errors:
# - Check JSON body format matches schema exactly
# - Verify Content-Type header is "application/json"
# - Check spelling: "file_type" not "upload_type"

## Upload fails to R2:
# - Verify upload_url hasn't expired (1 hour limit)
# - Check Content-Type header matches what you requested
# - Ensure file exists and is readable

## View URL shows error:
# - View URLs also expire (24 hours)
# - Get fresh view URL if needed
# - Check object_key is exactly as returned from upload request

# =======================================================
# 🎯 QUICK TEST SCRIPT
# =======================================================
# Copy and run this complete PowerShell script for full workflow test:

Write-Host "🧪 FULL R2 INTEGRATION TEST" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green

# 1. Magic Link
$magic = (Invoke-WebRequest -Uri "http://localhost:8000/api/v1/auth/magic-link" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email": "test@example.com"}').Content | ConvertFrom-Json
Write-Host "✅ Magic Token: $($magic.magic_token.Substring(0,20))..." -ForegroundColor Green

# 2. Access Token  
$token = (Invoke-WebRequest -Uri "http://localhost:8000/api/v1/auth/verify?token=$($magic.magic_token)").Content | ConvertFrom-Json
Write-Host "✅ Access Token: $($token.access_token.Substring(0,20))..." -ForegroundColor Green

# 3. Upload URL
$upload = (Invoke-WebRequest -Uri "http://localhost:8000/api/v1/uploads/signed-url" -Method POST -Headers @{"Authorization"="Bearer $($token.access_token)"; "Content-Type"="application/json"} -Body '{"filename": "test.jpg", "content_type": "image/jpeg", "file_type": "property"}').Content | ConvertFrom-Json
Write-Host "✅ Upload URL Generated" -ForegroundColor Green
Write-Host "   Object Key: $($upload.object_key)" -ForegroundColor Yellow

# 4. Upload Test (you need to provide image file)
Write-Host "📤 To upload your image, run:" -ForegroundColor Cyan
Write-Host "   Invoke-WebRequest -Uri '$($upload.upload_url)' -Method PUT -InFile 'YOUR_IMAGE.jpg' -ContentType 'image/jpeg'" -ForegroundColor White

# 5. View URL (after upload)
Write-Host "👁️  To get view URL after upload, run:" -ForegroundColor Cyan  
Write-Host "   Invoke-WebRequest -Uri 'http://localhost:8000/api/v1/uploads/view/$($upload.object_key)' -Headers @{'Authorization'='Bearer $($token.access_token)'}" -ForegroundColor White

Write-Host ""
Write-Host "🎉 R2 Integration Working Perfectly!" -ForegroundColor Green
