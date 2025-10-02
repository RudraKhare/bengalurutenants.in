"""
🚀 Quick R2 Integration Test Script
Run this to test your complete workflow in one go!
"""

Write-Host "🧪 FULL R2 INTEGRATION TEST" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green

try {
    # Step 1: Magic Link
    Write-Host "1️⃣  Requesting magic link..." -ForegroundColor Cyan
    $magicResponse = Invoke-WebRequest -Uri "http://localhost:8000/api/v1/auth/magic-link" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email": "test@example.com"}'
    $magic = $magicResponse.Content | ConvertFrom-Json
    Write-Host "✅ Magic Token: $($magic.magic_token.Substring(0,20))..." -ForegroundColor Green

    # Step 2: Access Token  
    Write-Host "2️⃣  Getting access token..." -ForegroundColor Cyan
    $tokenResponse = Invoke-WebRequest -Uri "http://localhost:8000/api/v1/auth/verify?token=$($magic.magic_token)"
    $token = $tokenResponse.Content | ConvertFrom-Json
    Write-Host "✅ Access Token: $($token.access_token.Substring(0,20))..." -ForegroundColor Green

    # Step 3: Upload URL
    Write-Host "3️⃣  Generating upload URL..." -ForegroundColor Cyan
    $uploadResponse = Invoke-WebRequest -Uri "http://localhost:8000/api/v1/uploads/signed-url" -Method POST -Headers @{"Authorization"="Bearer $($token.access_token)"; "Content-Type"="application/json"} -Body '{"filename": "test-photo.jpg", "content_type": "image/jpeg", "file_type": "property"}'
    $upload = $uploadResponse.Content | ConvertFrom-Json
    Write-Host "✅ Upload URL Generated" -ForegroundColor Green
    Write-Host "   📁 Object Key: $($upload.object_key)" -ForegroundColor Yellow
    Write-Host "   ⏰ Expires in: $($upload.expires_in) seconds" -ForegroundColor Yellow

    # Step 4: Test upload with existing image if available
    $imageFile = "martin-bammer-r7gnEBku15A-unsplash.jpg"
    if (Test-Path $imageFile) {
        Write-Host "4️⃣  Uploading existing image..." -ForegroundColor Cyan
        $uploadResult = Invoke-WebRequest -Uri $upload.upload_url -Method PUT -InFile $imageFile -ContentType "image/jpeg"
        Write-Host "✅ Upload Status: $($uploadResult.StatusCode)" -ForegroundColor Green
        
        # Step 5: Get view URL
        Write-Host "5️⃣  Getting view URL..." -ForegroundColor Cyan
        $viewResponse = Invoke-WebRequest -Uri "http://localhost:8000/api/v1/uploads/view/$($upload.object_key)" -Headers @{"Authorization"="Bearer $($token.access_token)"}
        $view = $viewResponse.Content | ConvertFrom-Json
        Write-Host "✅ View URL Generated" -ForegroundColor Green
        Write-Host ""
        Write-Host "🌐 Your image is live at:" -ForegroundColor Green
        Write-Host $view.view_url -ForegroundColor White
        Write-Host ""
        Write-Host "🎉 COMPLETE SUCCESS! Your R2 integration is working perfectly!" -ForegroundColor Green
    } else {
        Write-Host "4️⃣  📁 No test image found. To complete upload test:" -ForegroundColor Yellow
        Write-Host "   Copy an image file to this directory and run:" -ForegroundColor White
        Write-Host "   Invoke-WebRequest -Uri '$($upload.upload_url)' -Method PUT -InFile 'YOUR_IMAGE.jpg' -ContentType 'image/jpeg'" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "✅ Upload URL generation working perfectly!" -ForegroundColor Green
    }

} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Make sure your server is running on http://localhost:8000" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📋 For detailed manual testing instructions, see:" -ForegroundColor Cyan
Write-Host "   MANUAL_TESTING_GUIDE.md" -ForegroundColor White
