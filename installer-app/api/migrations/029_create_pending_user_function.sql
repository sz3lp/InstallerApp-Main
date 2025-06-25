create or replace function create_pending_user(email text, role text)
returns void as $$
declare
  uid uuid;
begin
  insert into auth.users (email)
  values (email)
  on conflict (email) do nothing
  returning id into uid;

  if uid is null then
    select id into uid from auth.users where auth.users.email = email;
  end if;

  insert into public.user_roles (user_id, role)
  values (uid, role)
  on conflict (user_id) do update set role = excluded.role;
end;
$$ language plpgsql;
