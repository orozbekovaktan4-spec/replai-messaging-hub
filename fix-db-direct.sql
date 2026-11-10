-- Check if business exists
SELECT id, name, instagram FROM "Business" WHERE id = 'biz_001';

-- Update Instagram data
UPDATE "Business" 
SET instagram = '{"userId":"17841442927870144","username":"akt4n.o","connected":true,"pageId":"1077310258808665","pageName":"Akt4n.o","config":{"dmEnabled":true,"rules":[]}}'
WHERE id = 'biz_001';

-- Verify update
SELECT id, name, instagram FROM "Business" WHERE id = 'biz_001';
