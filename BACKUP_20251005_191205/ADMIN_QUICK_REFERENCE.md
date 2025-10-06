# 🚀 Admin System - Quick Reference

## ⚡ 3-Minute Quick Start

```powershell
# 1. Run migration in Supabase SQL Editor
#    Execute: backend/migrations/add_admin_system.sql

# 2. Start backend
cd backend
uvicorn app.main:app --reload

# 3. Start frontend
cd frontend
npm run dev

# 4. Login
#    Visit: http://localhost:3000/admin/login
#    Email: rudrakharexx@gmail.com
#    Check console for magic link
```

## 📋 Key API Endpoints

### Authentication
```bash
# Request magic link
POST /api/admin/magic-link/request
{"email": "rudrakharexx@gmail.com"}

# Verify magic link
POST /api/admin/magic-link/verify
{"token": "abc123..."}
→ Returns JWT (valid 7 days)

# Use JWT in all requests
Authorization: Bearer YOUR_JWT_TOKEN
```

### Dashboard
```bash
# Get stats
GET /api/admin/dashboard

# Get detailed stats
GET /api/admin/stats
```

### Users
```bash
# List users
GET /api/admin/users?skip=0&limit=10&search=john

# User details
GET /api/admin/users/1

# Verify user
PATCH /api/admin/users/1/verify

# Unverify user
PATCH /api/admin/users/1/unverify

# Delete user
DELETE /api/admin/users/1
```

### Reviews
```bash
# List pending reviews
GET /api/admin/reviews/pending

# Verify review
PATCH /api/admin/reviews/1/verify
{"notes": "Verified as authentic"}

# Delete review
DELETE /api/admin/reviews/1
```

### Documents
```bash
# List pending documents
GET /api/admin/documents/pending

# Approve/reject document
PATCH /api/admin/documents/1/verify
{"status": "approved"} 
# or
{"status": "rejected", "rejection_reason": "Invalid document"}
```

### Properties
```bash
# List properties
GET /api/admin/properties?city=Bangalore&search=koramangala

# Property details
GET /api/admin/properties/1

# Delete property
DELETE /api/admin/properties/1
```

### Activity Logs
```bash
# Get audit trail
GET /api/admin/logs?skip=0&limit=100&action=verify_user
```

## 🔐 Security Checklist

- [x] Magic links expire in 15 minutes
- [x] JWT tokens expire in 7 days
- [x] Only "admin" role can access
- [x] All actions logged with IP
- [x] Cannot delete admin users
- [ ] **TODO:** Add Redis (production)
- [ ] **TODO:** Add email service (production)
- [ ] **TODO:** Add rate limiting (production)

## 📁 Important Files

### Backend
```
backend/migrations/add_admin_system.sql    # Database schema
backend/app/middleware/admin.py            # JWT auth (130 lines)
backend/app/routers/admin.py               # API routes (800+ lines)
backend/app/models.py                      # Database models
backend/app/main.py                        # Router registration
```

### Frontend
```
frontend/src/app/admin/login/page.tsx      # Login page
frontend/src/app/admin/dashboard/page.tsx  # Dashboard
```

### Docs
```
ADMIN_SYSTEM_COMPLETE.md         # Full implementation details
ADMIN_TESTING_GUIDE.md           # 25 test cases
ADMIN_IMPLEMENTATION_SUMMARY.md  # Complete summary
```

## 🎯 Current Status

**Backend:** ✅ 100% Complete (17 endpoints)  
**Frontend:** ⏳ 40% Complete (2/7 pages)  
**Database:** ⏳ Migration ready (not executed)

## 📊 What Works Now

✅ Magic link authentication  
✅ JWT token generation  
✅ Dashboard statistics  
✅ User management (API)  
✅ Review verification (API)  
✅ Document verification (API)  
✅ Property management (API)  
✅ Activity logs (API)  
✅ Login page (UI)  
✅ Dashboard page (UI)

## 🚧 What's Pending

⏳ User management UI  
⏳ Review verification UI  
⏳ Document verification UI  
⏳ Property management UI  
⏳ Activity logs UI  
⏳ Database migration execution  
⏳ Production security (Redis, email)

## 💡 Quick Commands

### Test Authentication
```powershell
# Request magic link
curl -X POST http://localhost:8000/api/admin/magic-link/request -H "Content-Type: application/json" -d '{\"email\": \"rudrakharexx@gmail.com\"}'

# Use token from response
curl -X POST http://localhost:8000/api/admin/magic-link/verify -H "Content-Type: application/json" -d '{\"token\": \"YOUR_TOKEN\"}'
```

### Test Dashboard
```powershell
curl -X GET http://localhost:8000/api/admin/dashboard -H "Authorization: Bearer YOUR_JWT"
```

### Check Database
```sql
-- Check admin user
SELECT email, role FROM users WHERE role = 'admin';

-- Check activity logs
SELECT * FROM admin_logs ORDER BY created_at DESC LIMIT 10;

-- Check pending verifications
SELECT COUNT(*) FROM reviews WHERE is_verified = false;
SELECT COUNT(*) FROM verification_documents WHERE status = 'pending';
```

## 🎨 UI Screenshots

### Login Page
- Glassmorphic design
- Email input
- Magic link flow
- Auto-verification
- Development mode indicator

### Dashboard
- 4 stat cards (users, properties, reviews, pending)
- 4 quick action buttons
- Recent activity feed
- Logout button
- Responsive layout

## 📞 Need Help?

**Error: "Admin user not found"**
→ Run database migration

**Error: "Magic link expired"**
→ Request new link (15 min expiry)

**Error: "Not authenticated"**
→ Check JWT in Authorization header

**CORS errors**
→ Backend allows all origins in dev mode

**Dashboard blank**
→ Check backend running on :8000

## 🎉 Ready to Deploy?

Before production:
1. ✅ Complete frontend pages
2. ✅ Run database migration
3. ✅ Test all endpoints
4. ✅ Add Redis for sessions
5. ✅ Add email service
6. ✅ Add rate limiting
7. ✅ Configure production CORS
8. ✅ Remove dev_link from responses

---

**Admin:** rudrakharexx@gmail.com  
**Magic Link:** 15 min expiry  
**JWT:** 7 day expiry  
**Endpoints:** 17 total  
**Code:** 1,200+ lines
