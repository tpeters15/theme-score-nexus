-- Delete old regulations for Green Workforce & Skills theme
DELETE FROM theme_regulations WHERE theme_id = '2fa96ad6-d24d-4a75-b89a-6e1899a00693';
DELETE FROM regulations WHERE id IN (
  SELECT r.id FROM regulations r
  LEFT JOIN theme_regulations tr ON r.id = tr.regulation_id
  WHERE tr.id IS NULL
);