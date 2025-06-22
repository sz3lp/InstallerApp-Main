create table if not exists profiles (
  user_id uuid references auth.users(id) primary key,
  phone text,
  avatar_url text,
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Profiles Select" on profiles
  for select using (auth.uid() = user_id);

create policy "Profiles Insert" on profiles
  for insert with check (auth.uid() = user_id);

create policy "Profiles Update" on profiles
  for update using (auth.uid() = user_id);
