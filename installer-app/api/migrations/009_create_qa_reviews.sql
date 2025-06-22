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
      select 1 from users where id = auth.uid() and lower(role) in ('admin','manager')
    )
  );

create policy "QAReviews Insert" on qa_reviews
  for insert with check (
    exists (
      select 1 from users where id = auth.uid() and lower(role) in ('admin','manager')
    )
  );
