-- Check what database objects currently exist
-- Run this in Supabase SQL Editor to see what's still there

-- Check for existing enum types
SELECT typname, typtype 
FROM pg_type 
WHERE typtype = 'e' 
AND typname IN ('userrole', 'verificationmethod', 'verificationstatus');

-- Check for existing tables
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'properties', 'reviews', 'tenant_verifications');

-- Check for alembic version table
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'alembic_version'
);

-- If alembic_version exists, check current version
SELECT version_num FROM alembic_version;
