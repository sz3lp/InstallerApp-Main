create or replace function create_pending_user(email text, role text)
returns void as $$
declare
  uid uuid;
begin
  insert into public.users (email, role, status)
  values (email, role, 'pending')
  on conflict (email) do update set email = excluded.email
  returning id into uid;

  if uid is null then
    select id into uid from public.users where public.users.email = email;
  end if;

  insert into public.user_roles (user_id, role)
  values (uid, role)
  on conflict (user_id) do update set role = excluded.role;
end;
$$ language plpgsql;
