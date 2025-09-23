-- First, let's check if the user exists and get their ID
-- Then assign admin role to tom@peterstom.de

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users 
WHERE email = 'tom@peterstom.de'
ON CONFLICT (user_id, role) DO NOTHING;

-- Let's also verify the setup with a helpful query
-- (This is just for reference, the actual insert is above)
/*
SELECT 
  au.email,
  p.full_name,
  ur.role,
  au.created_at as auth_created,
  p.created_at as profile_created
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id  
LEFT JOIN public.user_roles ur ON au.id = ur.user_id
WHERE au.email = 'tom@peterstom.de';
*/