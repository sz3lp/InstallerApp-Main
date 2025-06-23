BEGIN;

-- Create a lookup table for valid roles
create table if not exists roles (
  role text primary key
);

insert into roles(role) values
  ('Installer'),('Admin'),('Manager'),('Sales'),('Install Manager'),('Finance')
  on conflict do nothing;

-- Update user_roles constraint to include all valid roles
alter table user_roles drop constraint if exists user_roles_role_check;
alter table user_roles add constraint user_roles_role_check
  check (role in ('Installer','Admin','Manager','Sales','Install Manager','Finance'));

-- Migrate any remaining values from users.role into user_roles
insert into user_roles (user_id, role)
select id, role from users where role is not null
on conflict (user_id) do update set role = excluded.role;

-- Remove deprecated column
alter table users drop column if exists role;

COMMIT;
