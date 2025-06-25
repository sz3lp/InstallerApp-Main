-- Drop old users table and replace with view mapping to auth.users
DROP TABLE IF EXISTS public.users CASCADE;

CREATE VIEW public.users AS
SELECT id, email, full_name FROM auth.users;
