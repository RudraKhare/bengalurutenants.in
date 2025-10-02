# Bengaluru Tenants Platform

A full-stack web platform for tenant reviews and property information, starting with Bengaluru. Tenants can share reviews, experiences, and verify their stays to help others make informed rental decisions.

## ✨ New Feature: Interactive Maps! 🗺️

The platform now includes comprehensive map integration for property discovery and location management:

- **📍 Property Search with Map**: View properties on an interactive map with color-coded ratings
- **🎯 Location-Based Filtering**: Find properties within a specific radius from your location
- **📌 Manual Pin-Drop**: Select exact property locations by dragging markers
- **🔍 Auto-Geocoding**: Automatic address-to-coordinates conversion with caching
- **🗂️ Multiple View Modes**: List, Split (List+Map), or Map-only views

[🚀 Quick Start Guide](./MAP_QUICK_REFERENCE.md) | [📖 Full Documentation](./docs/MAP_FEATURE_GUIDE.md) | [🏗️ Architecture](./docs/MAP_ARCHITECTURE.md)

## 🏗️ Architecture

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: FastAPI + SQLAlchemy + Alembic
- **Database**: PostgreSQL via Supabase (cloud)
- **Future**: React-Leaflet maps, Redis caching, S3/MinIO storage, OpenSearch

## 🎯 Day 1 Goals

✅ Working Next.js frontend with basic pages  
✅ FastAPI backend with health endpoint  
✅ Database models for users, properties, reviews, verifications  
✅ Alembic migrations setup  
✅ Supabase PostgreSQL connection  
✅ Basic CI/CD pipeline  

## 🚀 Quick Start

### Prerequisites

- Python 3.11+ 
- Node.js 18+
- Supabase account (free tier)
- Git

### 1. Setup Supabase Database

1. Go to [Supabase](https://supabase.com) and create a free account
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string (looks like: `postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres`)
5. Save your password securely

### 2. Backend Setup

```powershell
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp ..\.env.example .env

# Edit .env file with your Supabase DATABASE_URL
# Set JWT_SECRET to a secure random string

# Run database migrations
alembic upgrade head

# Start the FastAPI server
uvicorn main:app --reload --host localhost --port 8000
```

Backend will be available at: http://localhost:8000
API docs: http://localhost:8000/docs

### 3. Frontend Setup

```powershell
# Open new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at: http://localhost:3000

## 📁 Project Structure

```
bengalurutenants.in/
├── frontend/                 # Next.js frontend
│   ├── src/
│   │   ├── app/             # App router pages
│   │   ├── components/      # Reusable components
│   │   └── lib/            # Utilities
│   ├── public/             # Static assets
│   └── package.json
├── backend/                 # FastAPI backend
│   ├── alembic/            # Database migrations
│   ├── main.py             # FastAPI app entry point
│   ├── db.py               # Database configuration
│   ├── models.py           # SQLAlchemy models
│   ├── schemas.py          # Pydantic schemas
│   ├── crud.py             # Database operations
│   └── requirements.txt
├── docs/                   # Documentation
├── .github/workflows/      # CI/CD pipelines
└── README.md
```

## 🗄️ Database Schema

### Users
- `id` (Primary Key)
- `email` (Unique)
- `phone`
- `is_email_verified`
- `role` (tenant, landlord, admin)
- `created_at`

### Properties
- `id` (Primary Key)
- `address`
- `city`
- `area`
- `lat`, `lng` (Coordinates)
- `avg_rating`
- `review_count`
- `created_at`

### Reviews
- `id` (Primary Key)
- `user_id` (Foreign Key)
- `property_id` (Foreign Key)
- `rating` (1-5)
- `comment`
- `verification_level`
- `upvotes`, `downvotes`
- `created_at`

### Tenant Verifications
- `id` (Primary Key)
- `user_id` (Foreign Key)
- `property_id` (Foreign Key)
- `review_id` (Foreign Key, nullable)
- `method` (rental_agreement, utility_bill, etc.)
- `status` (pending, verified, rejected)
- `proof_url`
- `upi_txn_id`
- `created_at`

## 🧪 Day 1 Acceptance Tests

### Backend Tests
```powershell
# Test health endpoint
curl http://localhost:8000/health

# Expected: {"status": "healthy", "timestamp": "..."}
```

### Frontend Tests
- ✅ Home page loads at http://localhost:3000
- ✅ Property page route exists at http://localhost:3000/property/1
- ✅ Add review page loads at http://localhost:3000/review/add

### Database Tests
```powershell
# Check if tables exist
# Connect to your Supabase SQL editor and run:
# SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```

## 🔧 Development Commands

### Backend
```powershell
# Activate virtual environment
.\backend\venv\Scripts\activate

# Run with auto-reload
uvicorn main:app --reload

# Create new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Run tests (when added)
pytest
```

### Frontend
```powershell
# Development server
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Lint code
npm run lint
```

## 🚨 Common Pitfalls & Solutions

### Supabase Connection Issues
- **Problem**: Connection timeouts
- **Solution**: Check if your IP is whitelisted in Supabase Auth settings
- **Tip**: Supabase has connection pooling limits on free tier

### CORS Issues
- **Problem**: Frontend can't call backend
- **Solution**: Verify `ALLOWED_ORIGINS` in `.env` includes your frontend URL
- **Tip**: Don't use `localhost` and `127.0.0.1` interchangeably

### Alembic Import Errors
- **Problem**: `alembic revision --autogenerate` fails
- **Solution**: Ensure models are imported in `alembic/env.py`
- **Fallback**: Use the provided SQL DDL directly in Supabase

### Environment Variables
- **Problem**: App can't find `.env` file
- **Solution**: Copy `.env.example` to `.env` in backend directory
- **Tip**: Never commit `.env` files to git

## 🔄 Git Workflow

```powershell
# Create feature branch
git checkout -b feature/day1-scaffold

# Add all files
git add .

# Commit changes
git commit -m "feat: Day 1 scaffold - Next.js frontend, FastAPI backend, Supabase DB"

# Push to remote
git push origin feature/day1-scaffold
```

## 📋 Next Steps (Day 2+)

- [ ] Add user authentication (JWT)
- [ ] Implement property search with filters
- [ ] Add review submission forms
- [ ] Integrate React-Leaflet for maps
- [ ] Add image upload functionality
- [ ] Implement tenant verification workflow
- [ ] Add Redis caching
- [ ] Set up Docker containers
- [ ] Deploy to production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

---

**Note**: This is Day 1 scaffold. Many features are placeholder implementations that will be expanded in subsequent development phases.
