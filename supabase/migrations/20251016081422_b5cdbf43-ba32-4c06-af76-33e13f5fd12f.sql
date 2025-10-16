-- Remove carbon leakage aviation and green homes grant signals from Water Efficiency theme
DELETE FROM theme_signals 
WHERE theme_id = 'aa637432-d6c1-47c8-94b8-2bad7e55f5d0' 
  AND processed_signal_id IN (
    '19987eeb-df71-415c-93e5-7dbfdca784e6',  -- Carbon Leakage in the Aviation Sector
    '8cbe6779-f89c-4841-8ca5-a0d5cfcbca21'   -- Green Homes Grant SMETER project
  );