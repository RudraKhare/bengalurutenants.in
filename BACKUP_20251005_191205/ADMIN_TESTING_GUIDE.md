# 🧪 Admin System Testing Guide

## ⚡ Quick Start (5 Minutes)

### Step 1: Run Database Migration
```sql
-- Connect to Supabase SQL Editor
-- Run: backend/migrations/add_admin_system.sql
-- This creates tables and sets you as admin
```

### Step 2: Start Backend
```powershell
cd backend
uvicorn app.main:app --reload
```

### Step 3: Start Frontend
```powershell
cd frontend
npm run dev
```

### Step 4: Test Admin Login
1. Visit: http://localhost:3000/admin/login
2. Enter email: `rudrakharexx@gmail.com`
3. Click "Send Magic Link"
4. Check browser console for magic link
5. Should auto-redirect to dashboard

## 📋 Detailed Testing Checklist

### ✅ Authentication Tests

#### Test 1: Magic Link Request
```bash
# Using curl
curl -X POST http://localhost:8000/api/admin/magic-link/request \
  -H "Content-Type: application/json" \
  -d '{"email": "rudrakharexx@gmail.com"}'

# Expected Response:
{
  "message": "Magic link sent to your email",
  "dev_link": "http://localhost:3000/admin/login?token=..."
}
```

**✅ Pass if:**
- Status code: 200
- dev_link present
- Token valid for 15 minutes

#### Test 2: Magic Link Verification
```bash
# Copy token from previous response
curl -X POST http://localhost:8000/api/admin/magic-link/verify \
  -H "Content-Type: application/json" \
  -d '{"token": "YOUR_TOKEN_HERE"}'

# Expected Response:
{
  "access_token": "eyJ0eXAiOiJKV1Qi...",
  "token_type": "bearer",
  "admin_email": "rudrakharexx@gmail.com"
}
```

**✅ Pass if:**
- Status code: 200
- access_token is JWT
- admin_email matches

#### Test 3: Invalid Email
```bash
curl -X POST http://localhost:8000/api/admin/magic-link/request \
  -H "Content-Type: application/json" \
  -d '{"email": "notadmin@example.com"}'

# Expected Response:
{
  "detail": "Admin user not found"
}
```

**✅ Pass if:**
- Status code: 404
- Error message clear

#### Test 4: Expired Token
```bash
# Wait 16 minutes after requesting magic link
curl -X POST http://localhost:8000/api/admin/magic-link/verify \
  -H "Content-Type: application/json" \
  -d '{"token": "EXPIRED_TOKEN"}'

# Expected Response:
{
  "detail": "Magic link expired or invalid"
}
```

**✅ Pass if:**
- Status code: 400
- Error message clear

### ✅ Dashboard Tests

#### Test 5: Get Dashboard Stats
```bash
# Use JWT from Test 2
curl -X GET http://localhost:8000/api/admin/dashboard \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected Response:
{
  "total_users": 10,
  "verified_users": 3,
  "total_properties": 27,
  "total_reviews": 45,
  "verified_reviews": 20,
  "pending_verifications": 15,
  "recent_activity": [...]
}
```

**✅ Pass if:**
- Status code: 200
- All counts are numbers
- recent_activity is array

#### Test 6: Unauthorized Access
```bash
curl -X GET http://localhost:8000/api/admin/dashboard

# Expected Response:
{
  "detail": "Not authenticated"
}
```

**✅ Pass if:**
- Status code: 401
- Access denied without token

### ✅ User Management Tests

#### Test 7: List Users
```bash
curl -X GET "http://localhost:8000/api/admin/users?skip=0&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected Response:
{
  "total": 10,
  "skip": 0,
  "limit": 10,
  "users": [...]
}
```

**✅ Pass if:**
- Status code: 200
- Users array populated
- Pagination working

#### Test 8: Search Users
```bash
curl -X GET "http://localhost:8000/api/admin/users?search=john" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected Response:
{
  "total": 2,
  "users": [
    {"id": 1, "email": "john@example.com", ...}
  ]
}
```

**✅ Pass if:**
- Status code: 200
- Only matching users returned

#### Test 9: Verify User
```bash
curl -X PATCH http://localhost:8000/api/admin/users/1/verify \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected Response:
{
  "message": "User verified successfully",
  "user_id": 1
}
```

**✅ Pass if:**
- Status code: 200
- User.is_verified = true in database
- AdminLog entry created

#### Test 10: Delete User
```bash
curl -X DELETE http://localhost:8000/api/admin/users/5 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected Response:
{
  "message": "User deleted successfully",
  "user_id": 5
}
```

**✅ Pass if:**
- Status code: 200
- User removed from database
- Cannot delete admin users

### ✅ Review Verification Tests

#### Test 11: List Pending Reviews
```bash
curl -X GET http://localhost:8000/api/admin/reviews/pending \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected Response:
{
  "total_pending": 8,
  "reviews": [...]
}
```

**✅ Pass if:**
- Status code: 200
- Only unverified reviews shown

#### Test 12: Verify Review
```bash
curl -X PATCH http://localhost:8000/api/admin/reviews/1/verify \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"notes": "Verified as authentic"}'

# Expected Response:
{
  "message": "Review verified successfully",
  "review_id": 1
}
```

**✅ Pass if:**
- Status code: 200
- Review.is_verified = true
- Notes saved to database

#### Test 13: Delete Review
```bash
curl -X DELETE http://localhost:8000/api/admin/reviews/2 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected Response:
{
  "message": "Review deleted successfully",
  "review_id": 2
}
```

**✅ Pass if:**
- Status code: 200
- Review removed from database

### ✅ Property Management Tests

#### Test 14: List Properties
```bash
curl -X GET "http://localhost:8000/api/admin/properties?city=Bangalore" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected Response:
{
  "total": 27,
  "properties": [...]
}
```

**✅ Pass if:**
- Status code: 200
- All Bangalore properties shown
- Search and filters working

#### Test 15: Get Property Details
```bash
curl -X GET http://localhost:8000/api/admin/properties/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected Response:
{
  "property": {...},
  "reviews": [...],
  "stats": {
    "total_reviews": 5,
    "verified_reviews": 3
  }
}
```

**✅ Pass if:**
- Status code: 200
- Property details complete
- Reviews included

#### Test 16: Delete Property
```bash
curl -X DELETE http://localhost:8000/api/admin/properties/10 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected Response:
{
  "message": "Property deleted successfully",
  "property_id": 10
}
```

**✅ Pass if:**
- Status code: 200
- Property removed
- Associated reviews cascaded

### ✅ Activity Logs Tests

#### Test 17: Get Audit Trail
```bash
curl -X GET "http://localhost:8000/api/admin/logs?limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected Response:
{
  "total": 45,
  "logs": [
    {
      "id": 1,
      "admin_id": 1,
      "action": "verify_user",
      "target_type": "user",
      "target_id": 5,
      "details": {...},
      "ip_address": "127.0.0.1",
      "created_at": "2024-01-15T10:30:00"
    }
  ]
}
```

**✅ Pass if:**
- Status code: 200
- All admin actions logged
- IP addresses tracked

#### Test 18: Filter Logs by Action
```bash
curl -X GET "http://localhost:8000/api/admin/logs?action=verify_user" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected Response:
{
  "total": 12,
  "logs": [...]
}
```

**✅ Pass if:**
- Status code: 200
- Only matching actions returned

### ✅ Frontend Tests

#### Test 19: Login Page UI
1. Visit: http://localhost:3000/admin/login
2. Check elements:
   - Email input field
   - Submit button
   - Loading state
   - Error messages
   - Development mode indicator

**✅ Pass if:**
- UI renders correctly
- Form validation works
- Console shows magic link

#### Test 20: Dashboard UI
1. Login successfully
2. Check dashboard elements:
   - Stats cards (4 cards)
   - Quick actions (4 buttons)
   - Recent activity feed
   - Logout button

**✅ Pass if:**
- All elements render
- Stats load correctly
- Navigation works

#### Test 21: Authentication Flow
1. Clear localStorage
2. Try to visit /admin/dashboard
3. Should redirect to /admin/login

**✅ Pass if:**
- Redirect works
- Token required for access

#### Test 22: Auto-Login from URL
1. Visit: http://localhost:3000/admin/login?token=VALID_TOKEN
2. Should auto-verify and redirect

**✅ Pass if:**
- Token verified automatically
- Redirects to dashboard
- JWT stored in localStorage

### ✅ Database Tests

#### Test 23: Check AdminLog Table
```sql
SELECT * FROM admin_logs 
ORDER BY created_at DESC 
LIMIT 10;
```

**✅ Pass if:**
- All admin actions logged
- IP addresses captured
- Details stored as JSONB

#### Test 24: Check User Verification
```sql
SELECT id, email, role, is_verified, verified_at, verified_by
FROM users
WHERE is_verified = true;
```

**✅ Pass if:**
- Verified users have is_verified = true
- verified_at timestamp set
- verified_by references admin user

#### Test 25: Check Review Verification
```sql
SELECT id, property_id, is_verified, verification_notes
FROM reviews
WHERE is_verified = true;
```

**✅ Pass if:**
- Verified reviews marked correctly
- Notes saved when provided

## 🔍 Common Issues & Solutions

### Issue 1: "Admin user not found"
**Solution:** Run database migration to set your email as admin

### Issue 2: "Magic link expired"
**Solution:** Links expire in 15 minutes. Request a new one.

### Issue 3: "Not authenticated"
**Solution:** Check JWT token in Authorization header

### Issue 4: Dashboard not loading
**Solution:** Check backend is running on port 8000

### Issue 5: CORS errors
**Solution:** Backend CORS allows all origins in development

### Issue 6: Magic link not in console
**Solution:** Check browser console, not terminal

## 📊 Test Results Template

```
Admin System Test Report
========================

Authentication:
- [ ] Magic link request (Test 1)
- [ ] Magic link verification (Test 2)
- [ ] Invalid email rejection (Test 3)
- [ ] Expired token rejection (Test 4)

Dashboard:
- [ ] Dashboard stats loading (Test 5)
- [ ] Unauthorized access blocked (Test 6)

User Management:
- [ ] List users (Test 7)
- [ ] Search users (Test 8)
- [ ] Verify user (Test 9)
- [ ] Delete user (Test 10)

Review Verification:
- [ ] List pending reviews (Test 11)
- [ ] Verify review (Test 12)
- [ ] Delete review (Test 13)

Property Management:
- [ ] List properties (Test 14)
- [ ] Property details (Test 15)
- [ ] Delete property (Test 16)

Activity Logs:
- [ ] Get audit trail (Test 17)
- [ ] Filter logs (Test 18)

Frontend:
- [ ] Login page UI (Test 19)
- [ ] Dashboard UI (Test 20)
- [ ] Authentication flow (Test 21)
- [ ] Auto-login from URL (Test 22)

Database:
- [ ] AdminLog entries (Test 23)
- [ ] User verification (Test 24)
- [ ] Review verification (Test 25)

OVERALL STATUS: ___ / 25 tests passed
```

## 🚀 Next Steps After Testing

1. ✅ All tests pass → Create remaining frontend pages
2. ⚠️ Some tests fail → Debug and fix issues
3. 🎯 Ready for production → Add Redis, email service, rate limiting

---

**Test Duration:** ~30 minutes  
**Prerequisites:** Database migration completed  
**Admin Email:** rudrakharexx@gmail.com
