-- Clean up invalid photo_keys from properties table
-- This removes sample/test data that points to non-existent R2 objects

-- First, let's see what we have
SELECT 
    id, 
    address, 
    photo_keys,
    CASE 
        WHEN photo_keys IS NULL THEN 'NULL'
        WHEN photo_keys = '' THEN 'EMPTY'
        ELSE 'HAS_KEYS'
    END as photo_status
FROM properties 
WHERE photo_keys IS NOT NULL 
ORDER BY id;

-- Clear all photo_keys that are likely from test/sample data
-- We'll reset them to NULL so PropertyCard uses placeholders
-- After this, users can upload real photos via the review system

UPDATE properties 
SET photo_keys = NULL 
WHERE photo_keys IS NOT NULL;

-- Verify the cleanup
SELECT COUNT(*) as total_properties FROM properties;
SELECT COUNT(*) as properties_with_photos FROM properties WHERE photo_keys IS NOT NULL;
SELECT COUNT(*) as properties_without_photos FROM properties WHERE photo_keys IS NULL;

-- This should show:
-- total_properties: [number]
-- properties_with_photos: 0 (after cleanup)
-- properties_without_photos: [same as total]
