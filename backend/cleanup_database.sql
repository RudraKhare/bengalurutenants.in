-- Clean database script
-- Run this in Supabase SQL Editor to remove all existing objects

-- Drop tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS tenant_verifications CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop enum types if they exist
DROP TYPE IF EXISTS userrole CASCADE;
DROP TYPE IF EXISTS verificationmethod CASCADE;
DROP TYPE IF EXISTS verificationstatus CASCADE;

-- Drop alembic version table if it exists
DROP TABLE IF EXISTS alembic_version CASCADE;

-- Verify cleanup
SELECT 
    'Tables' as object_type,
    table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('users', 'properties', 'reviews', 'tenant_verifications', 'alembic_version')

UNION ALL

SELECT 
    'Enums' as object_type,
    typname as table_name
FROM pg_type 
WHERE typname IN ('userrole', 'verificationmethod', 'verificationstatus');
