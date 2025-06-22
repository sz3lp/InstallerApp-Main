create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  role text not null,
  created_at timestamptz not null default now()
);

alter table users enable row level security;
create policy "Enable select for authenticated users" on users
  for select using (auth.uid() = id);
