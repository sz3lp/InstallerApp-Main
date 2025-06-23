BEGIN;

-- Copy existing role values from users.role to user_roles table if not already present
INSERT INTO user_roles (user_id, role)
SELECT id, role
FROM users
WHERE role is not null
ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;

COMMIT;
