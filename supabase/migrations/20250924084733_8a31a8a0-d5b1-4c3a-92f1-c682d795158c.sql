-- Add keywords column to themes table
ALTER TABLE public.themes 
ADD COLUMN keywords TEXT[] DEFAULT NULL;