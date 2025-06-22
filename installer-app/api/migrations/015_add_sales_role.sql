alter table users drop constraint if exists users_role_check;
alter table users
  add constraint users_role_check
  check (lower(role) in ('admin','installer','manager','sales'));
