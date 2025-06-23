create or replace function create_pending_user(email text, role text)
returns void as $$
begin
  insert into public.users (email, role, status)
  values (email, role, 'pending')
  on conflict (email) do nothing;
end;
$$ language plpgsql;
