-- Aggressive cleanup script
-- This will forcefully remove all objects even if they have dependencies

-- Drop enum types with CASCADE (removes dependencies)
DROP TYPE IF EXISTS userrole CASCADE;
DROP TYPE IF EXISTS verificationmethod CASCADE;
DROP TYPE IF EXISTS verificationstatus CASCADE;

-- Drop all tables with CASCADE
DROP TABLE IF EXISTS tenant_verifications CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop alembic version table
DROP TABLE IF EXISTS alembic_version CASCADE;

-- Verify everything is gone
SELECT 'Enum types remaining:' as check_type, count(*) as count
FROM pg_type 
WHERE typtype = 'e' 
AND typname IN ('userrole', 'verificationmethod', 'verificationstatus')

UNION ALL

SELECT 'Tables remaining:' as check_type, count(*) as count
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'properties', 'reviews', 'tenant_verifications', 'alembic_version');
