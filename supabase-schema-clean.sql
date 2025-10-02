-- Bengaluru Tenants Platform - Initial Database Schema
-- Run this in your Supabase SQL Editor

-- Create ENUM types (with existence checks)
DO $$ 
BEGIN
    -- Create userrole enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'userrole') THEN
        CREATE TYPE userrole AS ENUM ('tenant', 'landlord', 'admin');
    END IF;
    
    -- Create verificationmethod enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'verificationmethod') THEN
        CREATE TYPE verificationmethod AS ENUM ('rental_agreement', 'utility_bill', 'upi_transaction', 'bank_statement', 'photos');
    END IF;
    
    -- Create verificationstatus enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'verificationstatus') THEN
        CREATE TYPE verificationstatus AS ENUM ('pending', 'verified', 'rejected');
    END IF;
    
    -- Create propertytype enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'propertytype') THEN
        CREATE TYPE propertytype AS ENUM ('VILLA_HOUSE', 'FLAT_APARTMENT', 'PG_HOSTEL');
    END IF;
END $$;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    is_email_verified BOOLEAN DEFAULT false,
    role userrole DEFAULT 'tenant',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
    id SERIAL PRIMARY KEY,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    area VARCHAR(100) NOT NULL,
    property_type propertytype NOT NULL DEFAULT 'FLAT_APARTMENT',
    lat FLOAT,
    lng FLOAT,
    avg_rating FLOAT DEFAULT 0.0,
    review_count INTEGER DEFAULT 0,
    photo_keys TEXT,  -- Comma-separated R2 object keys for property photos
    property_owner_id INTEGER REFERENCES users(id),  -- Track who uploaded this property
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    property_id INTEGER REFERENCES properties(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    property_type propertytype,  -- User-confirmed property type for this review
    verification_level VARCHAR(20) DEFAULT 'unverified',
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create tenant_verifications table
CREATE TABLE IF NOT EXISTS tenant_verifications (
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

-- Create indexes for performance (except property_type related ones)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_area ON properties(area);
CREATE INDEX IF NOT EXISTS idx_properties_owner ON properties(property_owner_id);  -- For owner-based queries
CREATE INDEX IF NOT EXISTS idx_reviews_property_rating ON reviews(property_id, rating);
CREATE INDEX IF NOT EXISTS idx_reviews_verification ON reviews(verification_level, created_at);
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties(city, area);
CREATE INDEX IF NOT EXISTS idx_user_reviews_date ON reviews(user_id, created_at);

-- Add property_type column to existing properties table if it doesn't exist
DO $$ 
DECLARE
    enum_values text[];
    default_value text;
BEGIN
    -- Check if property_type column exists, if not add it
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='properties' AND column_name='property_type') THEN
        
        -- Get all existing enum values for propertytype
        SELECT array_agg(enumlabel ORDER BY enumsortorder) INTO enum_values
        FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid 
        WHERE t.typname = 'propertytype';
        
        -- Use the first available enum value as default
        default_value := enum_values[1];
        
        RAISE NOTICE 'Available propertytype enum values: %', array_to_string(enum_values, ', ');
        RAISE NOTICE 'Using default value: %', default_value;
        
        -- Add the column with the first available enum value as default
        EXECUTE format('ALTER TABLE properties ADD COLUMN property_type propertytype DEFAULT %L', default_value);
        
        RAISE NOTICE 'property_type column added successfully';
    ELSE
        RAISE NOTICE 'property_type column already exists';
    END IF;
END $$;

-- Create property_type related indexes after column is ensured to exist
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_city_type ON properties(city, property_type);

-- Add property_type column to existing reviews table if it doesn't exist
DO $$ 
DECLARE
    enum_values text[];
    default_value text;
BEGIN
    -- Check if property_type column exists in reviews table, if not add it
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='reviews' AND column_name='property_type') THEN
        
        -- Get all existing enum values for propertytype
        SELECT array_agg(enumlabel ORDER BY enumsortorder) INTO enum_values
        FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid 
        WHERE t.typname = 'propertytype';
        
        -- Use the first available enum value as default (nullable)
        default_value := enum_values[1];
        
        RAISE NOTICE 'Available propertytype enum values for reviews: %', array_to_string(enum_values, ', ');
        
        -- Add the column (nullable for existing reviews)
        ALTER TABLE reviews ADD COLUMN property_type propertytype;
        
        RAISE NOTICE 'property_type column added to reviews table successfully';
    ELSE
        RAISE NOTICE 'property_type column already exists in reviews table';
    END IF;
END $$;

-- Insert some sample data for testing (using dynamic enum values)
DO $$
DECLARE
    first_userrole text;
    first_propertytype text;
    first_verificationmethod text;
    first_verificationstatus text;
BEGIN
    -- Get the first available enum value for each type
    SELECT enumlabel INTO first_userrole 
    FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid 
    WHERE t.typname = 'userrole' ORDER BY enumsortorder LIMIT 1;
    
    SELECT enumlabel INTO first_propertytype 
    FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid 
    WHERE t.typname = 'propertytype' ORDER BY enumsortorder LIMIT 1;
    
    SELECT enumlabel INTO first_verificationmethod 
    FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid 
    WHERE t.typname = 'verificationmethod' ORDER BY enumsortorder LIMIT 1;
    
    SELECT enumlabel INTO first_verificationstatus 
    FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid 
    WHERE t.typname = 'verificationstatus' ORDER BY enumsortorder LIMIT 1;
    
    RAISE NOTICE 'Using enum values - userrole: %, propertytype: %, verificationmethod: %, verificationstatus: %', 
        first_userrole, first_propertytype, first_verificationmethod, first_verificationstatus;
    
    -- Insert users with dynamic enum values
    EXECUTE format('INSERT INTO users (email, phone, role, is_email_verified) 
        SELECT ''test.tenant@example.com'', ''+91-9876543210'', %L, true
        WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = ''test.tenant@example.com'')', first_userrole);
    
    EXECUTE format('INSERT INTO users (email, phone, role, is_email_verified) 
        SELECT ''landlord@example.com'', ''+91-9876543211'', %L, true
        WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = ''landlord@example.com'')', first_userrole);
    
    EXECUTE format('INSERT INTO users (email, phone, role, is_email_verified) 
        SELECT ''admin@bengalurutenants.in'', ''+91-9876543212'', %L, true
        WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = ''admin@bengalurutenants.in'')', first_userrole);
    
    -- Insert properties with dynamic enum values (using actual user IDs)
    EXECUTE format('INSERT INTO properties (address, city, area, property_type, lat, lng, property_owner_id) 
        SELECT ''123 Sample Street, Koramangala 5th Block'', ''Bengaluru'', ''Koramangala'', %L, 12.9352, 77.6245, 
               (SELECT id FROM users WHERE email = ''landlord@example.com'' LIMIT 1)
        WHERE NOT EXISTS (SELECT 1 FROM properties WHERE address = ''123 Sample Street, Koramangala 5th Block'')
        AND EXISTS (SELECT 1 FROM users WHERE email = ''landlord@example.com'')', first_propertytype);
    
    EXECUTE format('INSERT INTO properties (address, city, area, property_type, lat, lng, property_owner_id) 
        SELECT ''456 Test Road, Indiranagar 2nd Stage'', ''Bengaluru'', ''Indiranagar'', %L, 12.9719, 77.6412, 
               (SELECT id FROM users WHERE email = ''landlord@example.com'' LIMIT 1)
        WHERE NOT EXISTS (SELECT 1 FROM properties WHERE address = ''456 Test Road, Indiranagar 2nd Stage'')
        AND EXISTS (SELECT 1 FROM users WHERE email = ''landlord@example.com'')', first_propertytype);
    
    EXECUTE format('INSERT INTO properties (address, city, area, property_type, lat, lng, property_owner_id) 
        SELECT ''789 Demo Layout, HSR Layout Sector 1'', ''Bengaluru'', ''HSR Layout'', %L, 12.9116, 77.6497, 
               (SELECT id FROM users WHERE email = ''landlord@example.com'' LIMIT 1)
        WHERE NOT EXISTS (SELECT 1 FROM properties WHERE address = ''789 Demo Layout, HSR Layout Sector 1'')
        AND EXISTS (SELECT 1 FROM users WHERE email = ''landlord@example.com'')', first_propertytype);
END $$;

-- Insert reviews with dynamic references
INSERT INTO reviews (user_id, property_id, rating, comment, verification_level) 
SELECT u.id, p.id, 5, 'Excellent property with great landlord. Well maintained and close to metro.', 'verified'
FROM users u, properties p 
WHERE u.email = 'test.tenant@example.com' 
AND p.address = '123 Sample Street, Koramangala 5th Block'
AND NOT EXISTS (SELECT 1 FROM reviews WHERE user_id = u.id AND property_id = p.id);

INSERT INTO reviews (user_id, property_id, rating, comment, verification_level) 
SELECT u.id, p.id, 4, 'Good location but could be better maintained.', 'basic'
FROM users u, properties p 
WHERE u.email = 'test.tenant@example.com' 
AND p.address = '456 Test Road, Indiranagar 2nd Stage'
AND NOT EXISTS (SELECT 1 FROM reviews WHERE user_id = u.id AND property_id = p.id);

INSERT INTO reviews (user_id, property_id, rating, comment, verification_level) 
SELECT u.id, p.id, 3, 'Average experience. Some issues with maintenance requests.', 'unverified'
FROM users u, properties p 
WHERE u.email = 'landlord@example.com' 
AND p.address = '123 Sample Street, Koramangala 5th Block'
AND NOT EXISTS (SELECT 1 FROM reviews WHERE user_id = u.id AND property_id = p.id);

-- Insert tenant_verifications with dynamic enum values and actual IDs
DO $$
DECLARE
    first_verificationmethod text;
    first_verificationstatus text;
BEGIN
    SELECT enumlabel INTO first_verificationmethod 
    FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid 
    WHERE t.typname = 'verificationmethod' ORDER BY enumsortorder LIMIT 1;
    
    SELECT enumlabel INTO first_verificationstatus 
    FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid 
    WHERE t.typname = 'verificationstatus' ORDER BY enumsortorder LIMIT 1;
    
    EXECUTE format('INSERT INTO tenant_verifications (user_id, property_id, review_id, method, status) 
        SELECT u.id, p.id, r.id, %L, %L
        FROM users u, properties p, reviews r
        WHERE u.email = ''test.tenant@example.com'' 
        AND p.address = ''123 Sample Street, Koramangala 5th Block''
        AND r.user_id = u.id AND r.property_id = p.id
        AND NOT EXISTS (SELECT 1 FROM tenant_verifications WHERE user_id = u.id AND property_id = p.id AND review_id = r.id)', 
        first_verificationmethod, first_verificationstatus);
    
    EXECUTE format('INSERT INTO tenant_verifications (user_id, property_id, review_id, method, status) 
        SELECT u.id, p.id, r.id, %L, %L
        FROM users u, properties p, reviews r
        WHERE u.email = ''test.tenant@example.com'' 
        AND p.address = ''456 Test Road, Indiranagar 2nd Stage''
        AND r.user_id = u.id AND r.property_id = p.id
        AND NOT EXISTS (SELECT 1 FROM tenant_verifications WHERE user_id = u.id AND property_id = p.id AND review_id = r.id)', 
        first_verificationmethod, first_verificationstatus);
END $$;

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
