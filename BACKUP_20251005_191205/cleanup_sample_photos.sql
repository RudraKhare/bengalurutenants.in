-- Clean up sample photo keys so we can test with real uploaded photos
UPDATE properties 
SET photo_keys = NULL 
WHERE photo_keys LIKE 'sample/%';

-- Verify the cleanup
SELECT id, address, photo_keys FROM properties WHERE photo_keys IS NOT NULL ORDER BY id;
