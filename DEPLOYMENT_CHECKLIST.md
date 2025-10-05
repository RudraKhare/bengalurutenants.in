# 🚀 Deployment Checklist - bengalurutenants.in

**Date:** October 6, 2025  
**Status:** Ready to Deploy ✅

---

## ✅ Pre-Deployment Checklist (COMPLETED)

- [x] Fixed all hardcoded localhost URLs
- [x] Created `vercel.json` configuration
- [x] Created `render.yaml` configuration
- [x] Verified all environment variables
- [x] Pushed code to GitHub
- [x] Database credentials ready (Supabase)
- [x] Email credentials ready (SMTP2GO)
- [x] Storage credentials ready (Cloudflare R2)
- [x] Maps API key ready (Google Maps)

---

## 🎯 Deployment Steps

### **Phase 1: Deploy Backend to Render (15 minutes)**

#### **Step 1.1: Sign Up for Render**
1. Go to https://render.com
2. Click **"Get Started for Free"**
3. Sign up with GitHub account
4. Authorize Render to access your GitHub repositories

#### **Step 1.2: Create Web Service**
1. Click **"New +"** → **"Web Service"**
2. Connect your `RudraKhare/bengalurutenants.in` repository
3. Render will auto-detect the `render.yaml` file
4. Click **"Apply"** or **"Create Web Service"**

#### **Step 1.3: Configure Service**
- **Name:** `bengalurutenants-api` (or your choice)
- **Region:** Singapore (closest to India) or Frankfurt
- **Branch:** `main`
- **Root Directory:** `backend`
- **Runtime:** Python 3
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

#### **Step 1.4: Add Environment Variables**

Click **"Environment"** tab and add these variables:

```env
# Database
DATABASE_URL=postgresql://postgres.nompqqpybgpqnsitmufj:aYpZDvI9xSh7kMg8@aws-1-ap-south-1.pooler.supabase.com:6543/postgres

# Security
SECRET_KEY=bengaluru_tenants_super_secret_key_for_jwt_tokens_must_be_at_least_32_characters_long_12345
ALGORITHM=HS256

# Tokens
ACCESS_TOKEN_EXPIRE_HOURS=168
MAGIC_TOKEN_EXPIRE_SECONDS=600

# Frontend (UPDATE THIS AFTER VERCEL DEPLOYMENT)
FRONTEND_URL=https://YOUR-APP-NAME.vercel.app

# Environment
DEBUG=false
ENVIRONMENT=production

# Email - SMTP2GO
MAIL_USERNAME=bengalurutenants
MAIL_PASSWORD=PC6IwnGerr4JwGQo
MAIL_FROM=noreply@bengalurutenants.social
MAIL_PORT=587
MAIL_SERVER=smtp.smtp2go.com
MAIL_STARTTLS=true
MAIL_SSL_TLS=false
MAIL_USE_CREDENTIALS=true

# Cloudflare R2
R2_ACCESS_KEY_ID=ee7887627988aeca68e32f102430e269
R2_SECRET_ACCESS_KEY=c64c79fe9e5f8011bcebd4349696f8b12d5377e2bf0e5759cd94ac28d9de061a
R2_ENDPOINT=https://e50c8ae0180a83ebf4bc87687b15fe27.r2.cloudflarestorage.com
R2_BUCKET=tenant-review-photos

# Google Maps
GOOGLE_MAPS_API_KEY=AIzaSyDFJf8xF1HeZO68GWFGmIUyPRSeNhCGJ2s

# Python Version (Render-specific)
PYTHON_VERSION=3.11.5
```

#### **Step 1.5: Deploy Backend**
1. Click **"Create Web Service"**
2. Wait 3-5 minutes for deployment
3. Your backend URL will be: `https://bengalurutenants-api.onrender.com`
4. **Copy this URL** - you'll need it for frontend deployment

#### **Step 1.6: Verify Backend**
Once deployed, test:
```bash
curl https://YOUR-BACKEND-URL.onrender.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "..."
}
```

---

### **Phase 2: Deploy Frontend to Vercel (10 minutes)**

#### **Step 2.1: Sign Up for Vercel**
1. Go to https://vercel.com
2. Click **"Sign Up"**
3. Sign up with GitHub account
4. Authorize Vercel to access your repositories

#### **Step 2.2: Import Project**
1. Click **"Add New..."** → **"Project"**
2. Select `RudraKhare/bengalurutenants.in` repository
3. Click **"Import"**

#### **Step 2.3: Configure Project**
- **Framework Preset:** Next.js (auto-detected)
- **Root Directory:** `frontend`
- **Build Command:** `npm run build` (auto-detected)
- **Output Directory:** `.next` (auto-detected)
- **Install Command:** `npm install` (auto-detected)

#### **Step 2.4: Add Environment Variables**

Click **"Environment Variables"** and add:

```env
NEXT_PUBLIC_API_URL=https://YOUR-BACKEND-URL.onrender.com
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyDFJf8xF1HeZO68GWFGmIUyPRSeNhCGJ2s
```

**⚠️ IMPORTANT:** Replace `YOUR-BACKEND-URL` with the actual Render URL from Phase 1!

#### **Step 2.5: Deploy Frontend**
1. Click **"Deploy"**
2. Wait 2-3 minutes for deployment
3. Your frontend URL will be: `https://YOUR-APP-NAME.vercel.app`

#### **Step 2.6: Update Backend FRONTEND_URL**
1. Go back to Render dashboard
2. Navigate to your backend service → **Environment**
3. Update `FRONTEND_URL` to your Vercel URL
4. Click **"Save Changes"**
5. Backend will auto-redeploy (takes ~2 minutes)

---

### **Phase 3: Verification & Testing (10 minutes)**

#### **Step 3.1: Test Frontend**
1. Open your Vercel URL in browser
2. ✅ Homepage loads
3. ✅ Search functionality works
4. ✅ Recent reviews display
5. ✅ Images load (from R2)
6. ✅ Google Maps displays

#### **Step 3.2: Test Authentication**
1. Click **"Login"** button
2. Enter your email
3. Click **"Send Magic Link"**
4. ✅ Check your email for magic link
5. Click the link
6. ✅ Successfully logged in

#### **Step 3.3: Test Review Creation**
1. Click **"Add Review"**
2. Fill in property details
3. Upload a photo
4. Submit review
5. ✅ Review created successfully
6. ✅ Photo uploaded to R2
7. ✅ Review appears on homepage

#### **Step 3.4: Test Guest Features**
1. Open in incognito/private window
2. ✅ Can view properties
3. ✅ Can see reviews
4. ✅ Images load without login
5. ✅ Search works

---

### **Phase 4: Custom Domain Setup (Optional)**

#### **Step 4.1: Purchase Domain**
- Namecheap, GoDaddy, Cloudflare, etc.
- Recommended: Use Cloudflare for free SSL and CDN

#### **Step 4.2: Configure Vercel Domain**
1. In Vercel dashboard → **Settings** → **Domains**
2. Add your domain: `yourdomain.com`
3. Add www subdomain: `www.yourdomain.com`
4. Vercel will provide DNS records

#### **Step 4.3: Configure Render Domain**
1. In Render dashboard → **Settings** → **Custom Domains**
2. Add: `api.yourdomain.com`
3. Render will provide CNAME record

#### **Step 4.4: Update DNS Records**
Add these records to your domain registrar:

**For Frontend (Vercel):**
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**For Backend (Render):**
```
Type: CNAME
Name: api
Value: bengalurutenants-api.onrender.com
```

#### **Step 4.5: Update Environment Variables**
After domain setup:

**Render:**
- `FRONTEND_URL=https://yourdomain.com`

**Vercel:**
- `NEXT_PUBLIC_API_URL=https://api.yourdomain.com`

---

## 🎉 Deployment Complete!

### **Your Live URLs:**

- **Frontend:** https://YOUR-APP-NAME.vercel.app
- **Backend:** https://bengalurutenants-api.onrender.com
- **API Docs:** https://bengalurutenants-api.onrender.com/docs

### **Free Tier Limits:**

| Service | Limit | Usage |
|---------|-------|-------|
| Vercel | 100GB bandwidth/month | ~5-10GB |
| Render | 750 hours/month | ~720 hours |
| Supabase | 500MB database | ~50MB |
| Cloudflare R2 | 10GB storage | ~1-2GB |
| SMTP2GO | 1,000 emails/month | ~100-200 |
| Google Maps | $200 credit/month | ~$10-20 |

**Total Cost:** $0/month ✅

---

## 🔄 Future Updates

### **Making Changes:**

**For Frontend:**
```bash
# Make changes to frontend code
git add .
git commit -m "feat: update frontend"
git push origin main
# Vercel auto-deploys in ~2 minutes ✅
```

**For Backend:**
```bash
# Make changes to backend code
git add .
git commit -m "feat: update backend API"
git push origin main
# Render auto-deploys in ~3 minutes ✅
```

### **Environment Variable Updates:**

**Vercel:**
1. Dashboard → Project → Settings → Environment Variables
2. Update value
3. Redeploy: Deployments → Latest → Redeploy

**Render:**
1. Dashboard → Service → Environment
2. Update value
3. Auto-redeploys on save

---

## 🐛 Troubleshooting

### **Backend Issues:**

**503 Service Unavailable:**
- Render free tier spins down after 15 mins
- First request takes 30-60 seconds
- Wait and retry

**Database Connection Error:**
- Check DATABASE_URL in Render environment
- Verify Supabase allows connections from `0.0.0.0/0`
- Go to Supabase → Settings → Database → Network

**CORS Errors:**
- Verify FRONTEND_URL matches your Vercel domain
- Check backend logs in Render dashboard

### **Frontend Issues:**

**API Not Responding:**
- Check NEXT_PUBLIC_API_URL is correct
- Verify backend is running (visit `/health` endpoint)
- Check browser console for errors

**Images Not Loading:**
- Verify R2 credentials in Render
- Check browser network tab for 403 errors
- Ensure bucket is public or presigned URLs work

**Maps Not Loading:**
- Verify NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
- Check Google Cloud Console for API restrictions
- Add Vercel domain to allowed referrers

### **Email Not Sending:**

- Verify SMTP2GO credentials
- Check SMTP2GO dashboard for usage/limits
- Test with: `curl -X POST https://YOUR-API/api/v1/auth/magic-link`

---

## 📊 Monitoring

### **Vercel Analytics:**
- Dashboard → Project → Analytics
- Free real-time visitor analytics

### **Render Logs:**
- Dashboard → Service → Logs
- View real-time application logs

### **Supabase:**
- Dashboard → Database → Logs
- Monitor queries and connections

---

## 🔐 Security Checklist

- [x] `.env` files in `.gitignore`
- [x] Environment variables in platform dashboards
- [x] HTTPS enabled (automatic)
- [x] JWT secret key configured
- [x] Database uses connection pooling
- [ ] Consider rotating R2/API keys (optional)
- [ ] Set up Google Maps API restrictions (recommended)

---

## 📝 Post-Deployment Tasks

### **Immediate:**
1. Test all features thoroughly
2. Monitor logs for errors
3. Verify email delivery
4. Test mobile responsiveness

### **This Week:**
1. Set up custom domain (optional)
2. Add monitoring/alerts
3. Configure backup strategy
4. Document any issues

### **Optional Enhancements:**
1. Add Vercel Analytics
2. Set up error tracking (Sentry)
3. Configure CDN caching
4. Add uptime monitoring (UptimeRobot)

---

## 🎯 Success Criteria

Your deployment is successful when:

- ✅ Frontend loads at Vercel URL
- ✅ Backend responds at Render URL
- ✅ Health check returns 200 OK
- ✅ Users can request magic links
- ✅ Email arrives in inbox
- ✅ Users can login
- ✅ Property search works
- ✅ Google Maps displays
- ✅ Users can add reviews
- ✅ Photo upload works (R2)
- ✅ Guest users can view content
- ✅ Admin can access dashboard

---

**Ready to deploy? Follow the steps above!** 🚀

**Questions or issues?** Check the troubleshooting section or refer to `DEPLOYMENT_GUIDE.md` for detailed explanations.

---

*Generated: October 6, 2025*  
*Repository: RudraKhare/bengalurutenants.in*  
*Commit: 2dbc55a*
