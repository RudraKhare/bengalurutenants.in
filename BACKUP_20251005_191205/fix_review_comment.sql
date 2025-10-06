-- Fix Review Comment Issue
-- The review comment contains rating text instead of actual review text

-- First, let's find the problematic review(s)
SELECT id, property_id, rating, comment, created_at 
FROM reviews 
WHERE comment LIKE '%Overall Rating:%' 
   OR comment LIKE '%Cleanliness:%'
   OR comment LIKE '%Value For Money:%';

-- Option 1: Update the comment to a placeholder text
-- UPDATE reviews 
-- SET comment = 'Great place to stay! Highly recommended.'
-- WHERE comment LIKE '%Overall Rating:%';

-- Option 2: Set comment to empty/null if you want to remove it
-- UPDATE reviews 
-- SET comment = NULL
-- WHERE comment LIKE '%Overall Rating:%';

-- Option 3: Delete the problematic review(s) entirely
-- DELETE FROM reviews 
-- WHERE comment LIKE '%Overall Rating:%';

-- After running one of the UPDATE/DELETE commands above, verify:
-- SELECT id, property_id, rating, comment, created_at 
-- FROM reviews 
-- ORDER BY created_at DESC 
-- LIMIT 5;
