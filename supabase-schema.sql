-- Bengaluru Tenants Platform - Initial Database Schema
-- Run this in your Supabase SQL Editor

-- Create ENUM types
CREATE TYPE userrole AS ENUM ('tenant', 'landlord', 'admin');
CREATE TYPE verificationmethod AS ENUM ('rental_agreement', 'utility_bill', 'upi_transaction', 'bank_statement', 'photos');
CREATE TYPE verificationstatus AS ENUM ('pending', 'verified', 'rejected');

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    is_email_verified BOOLEAN DEFAULT false,
    role userrole DEFAULT 'tenant',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create properties table
CREATE TABLE properties (
    id SERIAL PRIMARY KEY,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    area VARCHAR(100) NOT NULL,
    lat FLOAT,
    lng FLOAT,
    avg_rating FLOAT DEFAULT 0.0,
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create reviews table
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    property_id INTEGER REFERENCES properties(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    verification_level VARCHAR(20) DEFAULT 'unverified',
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create tenant_verifications table
CREATE TABLE tenant_verifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    property_id INTEGER REFERENCES properties(id),
    review_id INTEGER REFERENCES reviews(id),
    method verificationmethod NOT NULL,
    status verificationstatus DEFAULT 'pending',
    proof_url VARCHAR(500),
    upi_txn_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_area ON properties(area);
CREATE INDEX idx_reviews_property_rating ON reviews(property_id, rating);
CREATE INDEX idx_reviews_verification ON reviews(verification_level, created_at);
CREATE INDEX idx_properties_location ON properties(city, area);
CREATE INDEX idx_user_reviews_date ON reviews(user_id, created_at);

-- Insert some sample data for testing
INSERT INTO users (email, phone, role, is_email_verified) VALUES
('test.tenant@example.com', '+91-9876543210', 'tenant', true),
('landlord@example.com', '+91-9876543211', 'landlord', true),
('admin@bengalurutenants.in', '+91-9876543212', 'admin', true);

INSERT INTO properties (address, city, area, lat, lng) VALUES
('123 Sample Street, Koramangala 5th Block', 'Bengaluru', 'Koramangala', 12.9352, 77.6245),
('456 Test Road, Indiranagar 2nd Stage', 'Bengaluru', 'Indiranagar', 12.9719, 77.6412),
('789 Demo Layout, HSR Layout Sector 1', 'Bengaluru', 'HSR Layout', 12.9116, 77.6497);

INSERT INTO reviews (user_id, property_id, rating, comment, verification_level) VALUES
(1, 1, 5, 'Excellent property with great landlord. Well maintained and close to metro.', 'verified'),
(1, 2, 4, 'Good location but could be better maintained.', 'basic'),
(2, 1, 3, 'Average experience. Some issues with maintenance requests.', 'unverified');

INSERT INTO tenant_verifications (user_id, property_id, review_id, method, status) VALUES
(1, 1, 1, 'rental_agreement', 'verified'),
(1, 2, 2, 'utility_bill', 'pending');

-- Update property ratings based on reviews
UPDATE properties SET 
    avg_rating = (
        SELECT AVG(rating::numeric) 
        FROM reviews 
        WHERE property_id = properties.id
    ),
    review_count = (
        SELECT COUNT(*) 
        FROM reviews 
        WHERE property_id = properties.id
    );

-- Create a view for property stats (optional)
CREATE OR REPLACE VIEW property_stats AS
SELECT 
    p.*,
    COUNT(r.id) as total_reviews,
    COUNT(CASE WHEN r.verification_level = 'verified' THEN 1 END) as verified_reviews,
    AVG(r.rating) as calculated_avg_rating
FROM properties p
LEFT JOIN reviews r ON p.id = r.property_id
GROUP BY p.id;

-- Success message
SELECT 'Database schema created successfully! Tables: users, properties, reviews, tenant_verifications' as result;
