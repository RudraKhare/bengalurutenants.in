-- ============================================
-- Admin System Database Migration
-- Admin Email: rudrakharexx@gmail.com
-- ============================================
-- Run this in your Supabase SQL editor

-- Drop the existing role column if it exists (it's an enum)
ALTER TABLE users DROP COLUMN IF EXISTS role CASCADE;

-- Add role column as VARCHAR to support any role type
ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user';
ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_documents JSONB;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verified_by INTEGER REFERENCES users(id);

-- Add verification status to reviews
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS verified_by INTEGER REFERENCES users(id);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS verification_notes TEXT;

-- Create admin activity log table
CREATE TABLE IF NOT EXISTS admin_logs (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50),
    target_id INTEGER,
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user verification documents table
CREATE TABLE IF NOT EXISTS verification_documents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    document_type VARCHAR(50) NOT NULL, -- 'aadhaar', 'pan', 'rental_agreement'
    document_url TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    rejection_reason TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewed_by INTEGER REFERENCES users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_verified ON users(is_verified);
CREATE INDEX IF NOT EXISTS idx_reviews_verified ON reviews(is_verified);
CREATE INDEX IF NOT EXISTS idx_verification_documents_status ON verification_documents(status);
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at);

-- Set admin email as admin (CRITICAL: Replace with your email)
UPDATE users SET role = 'admin' WHERE email = 'rudrakharexx@gmail.com';

-- If the user doesn't exist yet, create admin user
INSERT INTO users (email, name, role, created_at)
VALUES ('rudrakharexx@gmail.com', 'Admin', 'admin', CURRENT_TIMESTAMP)
ON CONFLICT (email) DO UPDATE SET role = 'admin';

-- Verify admin was created
SELECT id, email, name, role FROM users WHERE role = 'admin';
