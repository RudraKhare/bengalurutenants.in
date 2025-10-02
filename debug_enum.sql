-- Debug script to check current enum values
-- Run this first to see what's currently in your database

-- Check if propertytype enum exists and what values it has
SELECT 
    t.typname as enum_name,
    e.enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid 
WHERE t.typname = 'propertytype'
ORDER BY e.enumsortorder;

-- Check if property_type column exists
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'properties' AND column_name = 'property_type';

-- Check current properties structure
SELECT id, address, property_type FROM properties LIMIT 5;
