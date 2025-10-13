-- Phase 5: Add unique constraint to prevent duplicate companies
-- This ensures database-level integrity for website domains

ALTER TABLE companies 
ADD CONSTRAINT unique_website_domain 
UNIQUE (website_domain);