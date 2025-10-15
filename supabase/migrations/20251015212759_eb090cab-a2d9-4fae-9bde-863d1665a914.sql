-- Add is_featured column to processed_signals table
ALTER TABLE processed_signals 
ADD COLUMN is_featured boolean DEFAULT false;