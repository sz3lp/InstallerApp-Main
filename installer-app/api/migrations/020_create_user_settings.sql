create table if not exists user_settings (
  user_id uuid primary key references auth.users(id),
  onboarding_version int default 1,
  onboarding_completed_tasks jsonb default '[]',
  onboarding_dismissed_at timestamptz
);
