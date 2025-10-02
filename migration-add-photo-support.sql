-- Migration to add photo support to existing properties table
-- Run this if you already have a properties table without the photo_keys and property_owner_id columns

-- Add photo_keys column for storing comma-separated R2 object keys
ALTER TABLE properties ADD COLUMN photo_keys TEXT;

-- Add property_owner_id column for tracking property ownership
ALTER TABLE properties ADD COLUMN property_owner_id INTEGER REFERENCES users(id);

-- Add index for faster owner-based queries
CREATE INDEX idx_properties_owner ON properties(property_owner_id);

-- Optional: Update existing properties to have an owner (set to first admin user)
-- Uncomment and modify the user ID below if needed:
-- UPDATE properties SET property_owner_id = 1 WHERE property_owner_id IS NULL;

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'properties' 
ORDER BY ordinal_position;
