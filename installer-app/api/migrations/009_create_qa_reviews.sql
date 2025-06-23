create table if not exists qa_reviews (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid references jobs(id) on delete cascade,
  reviewer_id uuid references auth.users(id),
  decision text not null check (decision in ('approved','rework')),
  notes text,
  created_at timestamptz not null default now()
);

alter table qa_reviews enable row level security;

create policy "QAReviews Select" on qa_reviews
  for select using (
    exists (
      select 1 from user_roles where user_id = auth.uid() and role in ('Admin','Manager','Install Manager')
    )
  );

create policy "QAReviews Insert" on qa_reviews
  for insert with check (
    exists (
      select 1 from user_roles where user_id = auth.uid() and role in ('Admin','Manager','Install Manager')
    )
  );
