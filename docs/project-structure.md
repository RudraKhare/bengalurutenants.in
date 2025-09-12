# Day 1 Project Structure

This document outlines the initial project structure created for the Bengaluru Tenants Platform.

## Project Overview

A full-stack web application for tenant reviews and property information, starting with Bengaluru.

## Technology Stack

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: FastAPI + SQLAlchemy + Alembic
- **Database**: PostgreSQL (via Supabase)
- **CI/CD**: GitHub Actions

## Directory Structure

```
bengalurutenants.in/
├── frontend/                     # Next.js React frontend
│   ├── src/
│   │   ├── app/                 # Next.js 13+ app router
│   │   │   ├── layout.tsx       # Root layout component
│   │   │   ├── page.tsx         # Home page
│   │   │   ├── globals.css      # Global styles with Tailwind
│   │   │   ├── property/
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx # Dynamic property page
│   │   │   └── review/
│   │   │       └── add/
│   │   │           └── page.tsx # Add review page
│   │   └── components/          # Reusable React components (to be added)
│   ├── public/                  # Static assets
│   ├── package.json            # Dependencies and scripts
│   ├── next.config.js          # Next.js configuration
│   ├── tailwind.config.js      # Tailwind CSS configuration
│   ├── postcss.config.js       # PostCSS configuration
│   └── tsconfig.json           # TypeScript configuration
├── backend/                     # FastAPI Python backend
│   ├── main.py                 # FastAPI application entry point
│   ├── db.py                   # Database configuration and session management
│   ├── models.py               # SQLAlchemy ORM models
│   ├── schemas.py              # Pydantic request/response schemas
│   ├── crud.py                 # Database CRUD operations
│   ├── requirements.txt        # Python dependencies
│   ├── alembic.ini            # Alembic migration configuration
│   └── alembic/               # Database migrations
│       ├── env.py             # Alembic environment configuration
│       ├── script.py.mako     # Migration template
│       └── versions/          # Migration files
│           └── 001_initial_schema.py  # Initial database schema
├── docs/                       # Documentation
├── .github/
│   └── workflows/
│       └── backend.yml         # CI/CD pipeline for backend
├── .env.example               # Environment variables template
├── .gitignore                 # Git ignore patterns
└── README.md                  # Project documentation
```

## Database Schema

### Tables Created

1. **users**
   - id, email, phone, is_email_verified, role, created_at

2. **properties**
   - id, address, city, area, lat, lng, avg_rating, review_count, created_at

3. **reviews**
   - id, user_id, property_id, rating, comment, verification_level, upvotes, downvotes, created_at

4. **tenant_verifications**
   - id, user_id, property_id, review_id, method, status, proof_url, upi_txn_id, created_at

## Key Features Implemented

### Backend
- ✅ FastAPI application with CORS enabled
- ✅ SQLAlchemy models for all core entities
- ✅ Pydantic schemas for API validation
- ✅ Basic CRUD operations
- ✅ Alembic migration system
- ✅ Database connection management
- ✅ Health check endpoint

### Frontend
- ✅ Next.js 14 with TypeScript
- ✅ Tailwind CSS for styling
- ✅ Responsive design
- ✅ Home page with hero section
- ✅ Property detail page (placeholder)
- ✅ Add review page with form
- ✅ Navigation layout

### DevOps
- ✅ GitHub Actions CI pipeline
- ✅ Linting and testing setup
- ✅ Environment configuration
- ✅ Git workflow ready

## API Endpoints Available

- `GET /health` - Health check
- `GET /` - API information

## Development Status

This represents the Day 1 scaffold. All major components are in place and ready for development to continue.

## Next Steps (Day 2+)

1. Implement user authentication
2. Connect frontend to backend APIs
3. Add property search functionality
4. Implement review submission
5. Add tenant verification workflow
6. Integrate maps (React-Leaflet)
7. Add image upload functionality
8. Set up Redis caching
9. Docker containerization
10. Production deployment
