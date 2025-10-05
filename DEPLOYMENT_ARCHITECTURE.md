# 🏗️ Deployment Architecture - bengalurutenants.in

## 📊 System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        USERS / BROWSERS                          │
│                   (Desktop, Mobile, Tablet)                      │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  │ HTTPS
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    VERCEL CDN (Global)                           │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │            FRONTEND (Next.js 14)                       │    │
│  │  • React Components                                    │    │
│  │  • Server-Side Rendering                               │    │
│  │  • Static Site Generation                              │    │
│  │  • API Routes (if any)                                 │    │
│  │                                                         │    │
│  │  Env: NEXT_PUBLIC_API_URL                              │    │
│  │       NEXT_PUBLIC_GOOGLE_MAPS_API_KEY                  │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Domain: your-app.vercel.app                                    │
│  (or yourdomain.com)                                            │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  │ REST API Calls
                  │ (fetch, axios)
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                RENDER (Singapore/Frankfurt)                      │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │            BACKEND (FastAPI)                           │    │
│  │  • Authentication (JWT, Magic Links)                   │    │
│  │  • Property Management                                 │    │
│  │  • Review System                                       │    │
│  │  • Admin Dashboard                                     │    │
│  │  • File Upload (Presigned URLs)                        │    │
│  │                                                         │    │
│  │  Port: $PORT (dynamic)                                 │    │
│  │  Health: /health                                       │    │
│  │  Docs: /docs                                           │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Domain: your-app.onrender.com                                  │
│  (or api.yourdomain.com)                                        │
│                                                                  │
│  🔄 Auto-deploys from GitHub (main branch)                      │
│  ⚡ Spins down after 15 min inactivity (free tier)              │
└──┬────────────┬────────────┬───────────────┬────────────────────┘
   │            │            │               │
   │            │            │               │
   ▼            ▼            ▼               ▼
┌──────┐  ┌──────────┐  ┌─────────┐  ┌──────────────┐
│ SUPA │  │CLOUDFLARE│  │ SMTP2GO │  │ GOOGLE MAPS  │
│ BASE │  │    R2    │  │         │  │     API      │
└──────┘  └──────────┘  └─────────┘  └──────────────┘
```

---

## 🔄 Data Flow

### **1. User Visits Website**
```
User Browser → Vercel CDN → Next.js App → HTML Rendered
```

### **2. User Searches for Property**
```
User Input → Frontend (React) 
          → API Call: GET /api/v1/properties?city=Bangalore
          → Render Backend → Supabase Database
          → JSON Response → Frontend → Display Results
```

### **3. User Logs In (Magic Link)**
```
User Email → Frontend → POST /api/v1/auth/magic-link
          → Backend → Generate JWT Token
          → SMTP2GO → Send Email
          → User Clicks Link
          → GET /api/v1/auth/verify?token=xxx
          → Backend Validates → Set Cookie
          → Frontend → User Logged In
```

### **4. User Adds Review with Photo**
```
User Form → Frontend → POST /api/v1/uploads/signed-url
        → Backend → Cloudflare R2 → Presigned URL
        → Frontend → PUT to R2 (direct upload)
        → POST /api/v1/reviews (with photo_keys)
        → Backend → Supabase Database
        → Frontend → Review Added Successfully
```

### **5. Guest Views Property**
```
Guest → Frontend → GET /api/v1/properties/{id}
     → Backend → Supabase Database
     → GET /api/v1/uploads/view/{key}
     → Backend → R2 Public URL
     → Frontend → Display Property with Images
```

---

## 🌐 Service Integrations

### **Vercel (Frontend Hosting)**
```yaml
Service: Vercel
Plan: Free (Hobby)
Features:
  - Global CDN (Edge Network)
  - Automatic HTTPS
  - Custom domains
  - Preview deployments (PRs)
  - Analytics
  - Auto-scaling

Limits:
  - 100GB bandwidth/month
  - Unlimited deployments
  - 1 team member

Deployment:
  - Git integration (GitHub)
  - Auto-deploy on push to main
  - Build time: ~2 minutes
```

### **Render (Backend Hosting)**
```yaml
Service: Render
Plan: Free
Features:
  - Native Python support
  - Automatic HTTPS
  - Custom domains
  - Auto-deploy from Git
  - Logs and monitoring

Limits:
  - 750 hours/month (24/7)
  - Spins down after 15 min inactivity
  - 512MB RAM
  - Shared CPU

Deployment:
  - Git integration (GitHub)
  - Auto-deploy on push to main
  - Build time: ~3-5 minutes
  - Cold start: ~30-60 seconds
```

### **Supabase (Database)**
```yaml
Service: Supabase PostgreSQL
Plan: Free
Features:
  - 500MB database storage
  - Connection pooling
  - Row-level security
  - Real-time subscriptions
  - Database backups (7 days)

Limits:
  - 500MB storage
  - 50,000 monthly active users
  - 2GB bandwidth/month

Connection:
  - Session pooler: Port 6543
  - Direct: Port 5432
  - Region: ap-south-1 (Mumbai)
```

### **Cloudflare R2 (Object Storage)**
```yaml
Service: Cloudflare R2
Plan: Free
Features:
  - S3-compatible API
  - No egress fees
  - Global distribution
  - Presigned URLs

Limits:
  - 10GB storage
  - 10 million read requests/month
  - 1 million write requests/month

Usage:
  - Property photos
  - Review images
  - User uploads
```

### **SMTP2GO (Email Service)**
```yaml
Service: SMTP2GO
Plan: Free
Features:
  - SMTP relay
  - Email tracking
  - Analytics
  - Bounce handling

Limits:
  - 1,000 emails/month

Usage:
  - Magic link authentication
  - Password resets
  - Notifications
```

### **Google Maps API**
```yaml
Service: Google Maps JavaScript API
Plan: Free (with credit)
Features:
  - Interactive maps
  - Geocoding
  - Places autocomplete
  - Directions

Limits:
  - $200 free credit/month
  - ~28,000 map loads
  - Pay-as-you-go after credit

Usage:
  - Property location maps
  - Search with maps
  - Nearby properties
```

---

## 🔐 Security Architecture

### **Authentication Flow**
```
1. User enters email
2. Backend generates magic token (JWT)
3. Token stored in Redis/DB with expiry (10 min)
4. Email sent via SMTP2GO
5. User clicks link with token
6. Backend validates token
7. Backend issues access token (JWT, 7 days)
8. Token stored in httpOnly cookie
9. Frontend sends token with API requests
10. Backend validates on each request
```

### **Authorization Layers**
```
1. Public Routes (No Auth)
   - View properties
   - View reviews
   - Search

2. Authenticated Routes (JWT Required)
   - Add review
   - Upload photos
   - User dashboard

3. Admin Routes (Admin Role Required)
   - User management
   - Property moderation
   - Review moderation
```

### **Environment Variables Security**
```
✅ Stored in platform dashboards (not in code)
✅ Encrypted at rest
✅ TLS in transit
✅ Never committed to Git
✅ Different keys for dev/prod
```

---

## 📊 Performance Optimization

### **Frontend (Vercel)**
- ✅ Next.js SSR/SSG for fast initial load
- ✅ Image optimization (next/image)
- ✅ Code splitting (automatic)
- ✅ CDN caching (global edge network)
- ✅ Prefetching (next/link)

### **Backend (Render)**
- ✅ Connection pooling (Supabase)
- ✅ Presigned URLs (direct R2 uploads)
- ✅ Efficient database queries (SQLAlchemy)
- ✅ JWT stateless authentication

### **Database (Supabase)**
- ✅ Indexes on frequently queried columns
- ✅ Connection pooling (6543)
- ✅ Query optimization

### **Storage (R2)**
- ✅ Direct uploads (no backend bottleneck)
- ✅ Global CDN distribution
- ✅ Optimized image formats

---

## 🔍 Monitoring & Debugging

### **Frontend Logs**
```
Vercel Dashboard → Project → Logs
- Build logs
- Function logs
- Edge logs
- Real-time monitoring
```

### **Backend Logs**
```
Render Dashboard → Service → Logs
- Application logs (print, logger)
- HTTP request logs
- Error stack traces
- Real-time streaming
```

### **Database Monitoring**
```
Supabase Dashboard → Database → Logs
- Query performance
- Connection stats
- Slow queries
- Error logs
```

### **Email Tracking**
```
SMTP2GO Dashboard → Activity
- Emails sent
- Delivery status
- Bounces
- Opens/clicks
```

---

## 🚀 Deployment Pipeline

### **Development Workflow**
```
1. Make changes locally
2. Test with `npm run dev` (frontend) and `python main.py` (backend)
3. Commit changes: `git commit -m "feat: ..."`
4. Push to GitHub: `git push origin main`
5. Automatic deployment:
   - Vercel builds frontend (~2 min)
   - Render builds backend (~3 min)
6. Live in production! 🎉
```

### **Rollback Strategy**
```
Vercel:
  - Dashboard → Deployments
  - Find previous working deployment
  - Click "Promote to Production"

Render:
  - Dashboard → Events
  - Find previous deployment
  - Click "Rollback"

Git:
  - `git revert HEAD`
  - `git push origin main`
  - Auto-redeploys with previous code
```

---

## 📈 Scalability

### **Current Free Tier Can Handle:**
- ✅ 10,000+ monthly visitors
- ✅ 1,000+ reviews/month
- ✅ 10GB of images
- ✅ 1,000 emails/month

### **When to Upgrade:**

**Vercel Pro ($20/month):**
- 100GB → 1TB bandwidth
- Better analytics
- Faster builds

**Render Starter ($7/month):**
- No cold starts
- Better performance
- More RAM (512MB → 2GB)

**Supabase Pro ($25/month):**
- 8GB storage
- More active users
- Better support

---

## 🎯 Success Metrics

### **Health Checks**
```
Backend: GET https://your-api.onrender.com/health
Expected: {"status": "healthy", "database": "connected"}

Frontend: https://your-app.vercel.app
Expected: Homepage loads with no errors
```

### **Performance Targets**
- Page load: < 2 seconds
- API response: < 500ms (warm)
- API response: < 2 seconds (cold start)
- Image load: < 1 second

---

**Architecture designed for:** Zero-cost operation with professional-grade features! 🚀

*Last Updated: October 6, 2025*
