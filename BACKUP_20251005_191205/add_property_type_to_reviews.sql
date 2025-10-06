-- Migration: Add property_type column to reviews table
-- This script safely adds the property_type column to the reviews table

-- Add property_type column to existing reviews table if it doesn't exist
DO $$ 
DECLARE
    enum_values text[];
BEGIN
    -- Check if property_type column exists in reviews table, if not add it
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='reviews' AND column_name='property_type') THEN
        
        -- Get all existing enum values for propertytype
        SELECT array_agg(enumlabel ORDER BY enumsortorder) INTO enum_values
        FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid 
        WHERE t.typname = 'propertytype';
        
        RAISE NOTICE 'Available propertytype enum values for reviews: %', array_to_string(enum_values, ', ');
        
        -- Add the column (nullable for existing reviews)
        ALTER TABLE reviews ADD COLUMN property_type propertytype;
        
        RAISE NOTICE 'property_type column added to reviews table successfully';
    ELSE
        RAISE NOTICE 'property_type column already exists in reviews table';
    END IF;
END $$;

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'reviews' 
AND column_name = 'property_type';
