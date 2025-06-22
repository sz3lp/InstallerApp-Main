create table if not exists user_settings (
  user_id uuid primary key references auth.users(id),
  onboarding_version int default 1,
  onboarding_completed_tasks jsonb default '[]',
  onboarding_dismissed_at timestamptz null
);

alter table user_settings enable row level security;

-- read own settings
create policy "User Settings Select" on user_settings
  for select using (auth.uid() = user_id);

-- allow insert if uid matches
create policy "User Settings Insert" on user_settings
  for insert with check (auth.uid() = user_id);

-- allow update if uid matches
create policy "User Settings Update" on user_settings
  for update using (auth.uid() = user_id);
