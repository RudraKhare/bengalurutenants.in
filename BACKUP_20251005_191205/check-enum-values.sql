-- Diagnostic query to check current enum values
-- Run this first to see what enum values exist

SELECT 
    t.typname as enum_name,
    string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder) as enum_values
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid 
WHERE t.typname IN ('propertytype', 'userrole', 'verificationmethod', 'verificationstatus')
GROUP BY t.typname
ORDER BY t.typname;

-- Also check if the property_type column exists
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'properties' 
AND column_name = 'property_type';
