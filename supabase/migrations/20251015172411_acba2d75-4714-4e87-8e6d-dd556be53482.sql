-- Drop the unused signals table that conflicts with our raw_signals + processed_signals architecture
DROP TABLE IF EXISTS public.signals CASCADE;