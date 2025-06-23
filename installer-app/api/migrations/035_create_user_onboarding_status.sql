create table if not exists user_onboarding_status (
  user_id uuid primary key references auth.users(id),
  installer_started_job boolean default false,
  sales_created_quote boolean default false,
  manager_reviewed_job boolean default false,
  admin_invited_user boolean default false,
  dismissed boolean default false,
  updated_at timestamptz default now()
);

alter table user_onboarding_status enable row level security;

create policy "Allow user to update their onboarding status"
  on user_onboarding_status for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Allow user to read their onboarding status"
  on user_onboarding_status for select
  using (auth.uid() = user_id);
