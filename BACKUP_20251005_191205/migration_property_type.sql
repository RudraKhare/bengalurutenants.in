-- Migration to add property_type column to existing database
-- Run this in your Supabase SQL Editor

-- Create the enum type if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'propertytype') THEN
        CREATE TYPE propertytype AS ENUM ('villaHouse', 'flatApartment', 'pgHostel');
    END IF;
END $$;

-- Add property_type column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='properties' AND column_name='property_type') THEN
        -- Add the column
        ALTER TABLE properties ADD COLUMN property_type propertytype DEFAULT 'flatApartment';
        
        -- Update existing properties with some realistic default values
        UPDATE properties SET property_type = 'flatApartment' WHERE id IN (1, 2, 4, 5, 6);
        UPDATE properties SET property_type = 'villaHouse' WHERE id = 7;
        UPDATE properties SET property_type = 'pgHostel' WHERE id = 3;
        
        -- Add indexes for better query performance
        CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(property_type);
        CREATE INDEX IF NOT EXISTS idx_properties_city_type ON properties(city, property_type);
        
        RAISE NOTICE 'property_type column added successfully';
    ELSE
        RAISE NOTICE 'property_type column already exists';
    END IF;
END $$;

-- Verify the changes
SELECT id, address, property_type FROM properties ORDER BY id;
