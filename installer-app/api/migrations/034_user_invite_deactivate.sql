-- Add is_active column to profiles
alter table profiles add column if not exists is_active boolean default true;

-- Ensure user_roles table exists with correct constraint
create table if not exists user_roles (
  user_id uuid primary key references auth.users(id),
  role text not null check (
    role in (
      'Installer',
      'Admin',
      'Manager',
      'Install Manager',
      'Sales',
      'Finance'
    )
  )
);

-- Enable RLS on profiles and user_roles
alter table profiles enable row level security;
alter table user_roles enable row level security;

-- Allow users to update their own profile (existing policy may already)
-- Add policy allowing Admin to deactivate users via is_active
create policy "Admin can deactivate users" on profiles for update
  using (exists (select 1 from user_roles where user_id = auth.uid() and role = 'Admin'))
  with check (true);

-- Policies for user_roles
create policy "Users can view own role" on user_roles for select
  using (user_id = auth.uid());

create policy "Admin can view all roles" on user_roles for select
  using (exists (select 1 from user_roles ur where ur.user_id = auth.uid() and ur.role = 'Admin'));

create policy "Admin can manage user_roles" on user_roles for insert, update
  using (exists (select 1 from user_roles ur where ur.user_id = auth.uid() and ur.role = 'Admin'))
  with check (true);
