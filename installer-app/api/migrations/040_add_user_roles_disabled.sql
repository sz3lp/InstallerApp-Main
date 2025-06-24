-- Add disabled column to user_roles
alter table user_roles add column if not exists disabled boolean default false;

-- RPC to set disabled flag
create or replace function set_user_disabled(p_user_id uuid, p_disabled boolean)
returns void as $$
begin
  update user_roles set disabled = p_disabled where user_id = p_user_id;
end;
$$ language plpgsql security definer;

-- Policy allowing Admins to update disabled flag
create policy "Admin can disable users" on user_roles
  for update using (
    exists (select 1 from user_roles ur where ur.user_id = auth.uid() and ur.role = 'Admin')
  );
